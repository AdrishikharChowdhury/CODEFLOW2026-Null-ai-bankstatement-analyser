import os
import io
import uuid
import time
from fastapi import FastAPI
from db import supabase
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import httpx
from sanitization import sanitize
from parser import extract_rows_from_pdf, self_healing_normalization, compute_financial_health, normalize_csv_columns, parse_text_to_df
from pydantic import BaseModel

MODEL_SERVICE_URL = os.getenv("MODEL_SERVICE_URL")
CSV_BUCKET = "csv"

def ensure_csv_bucket():
    try:
        buckets = supabase.storage.list_buckets()
        if not any(b.name == CSV_BUCKET for b in buckets):
            supabase.storage.create_bucket(CSV_BUCKET, {"public": True})
    except Exception:
        pass

ensure_csv_bucket()

class ParseRequest(BaseModel):
    storage_path: str
    file_name: str
    file_type: str  # "pdf" or "csv"

class ParseResponse(BaseModel):
    success: bool
    transactions: list | None = None
    health_score: dict | None = None
    category_expense: list | None = None
    income_summary: list | None = None
    recurring_payments: list | None = None
    recommendations: list | None = None
    csv_path: str | None = None
    json_path: str | None = None
    error: str | None = None

app = FastAPI(title="Financialo API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status":"Running"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/parse")
def parse_statement(req: ParseRequest):
    user_id = req.storage_path.split("/")[0]

    # 1. Download from Supabase Storage
    try:
        print(f"Downloading: {req.storage_path}")
        res = supabase.storage.from_("statements").download(req.storage_path)
        print(f"Download result type: {type(res)}")
        if res is None:
            return ParseResponse(success=False, error="File not found in storage")
        if hasattr(res, "read"):
            buffer = io.BytesIO(res.read())
        else:
            buffer = io.BytesIO(res)
    except Exception as e:
        print(f"Download failed: {e}")
        return ParseResponse(success=False, error=f"Storage download failed: {e}")

    # 2. Parse
    try:
        if req.file_type == "csv":
            raw_df = pd.read_csv(buffer)
            raw_df = normalize_csv_columns(raw_df)
        else:
            buffer.name = req.file_name
            raw_df = extract_rows_from_pdf(buffer)
            
        if raw_df.empty:
            return ParseResponse(success=False, error="No transactions could be parsed")
    except Exception as e:
        print(f"Parsing failed: {e}")
        return ParseResponse(success=False, error=f"Parsing failed: {e}")

    # 3. Normalize
    try:
        processed_df = self_healing_normalization(raw_df)
    except Exception as e:
        print(f"Normalization failed: {e}")
        return ParseResponse(success=False, error=f"Normalization failed: {e}")

    # 4. Sanitize & upload CSV to csv_bucket
    csv_storage_path = f"{user_id}/{uuid.uuid4()}.csv"
    try:
        transactions = processed_df.fillna(0).to_dict(orient="records")
        for txn in transactions:
            if "clean_description" in txn:
                txn["clean_description"] = sanitize(str(txn["clean_description"]))
            if "description" in txn:
                txn["description"] = sanitize(str(txn["description"]))
        sanitized_df = pd.DataFrame(transactions)
        csv_buffer = io.BytesIO()
        sanitized_df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)
        supabase.storage.from_(CSV_BUCKET).upload(csv_storage_path, csv_buffer.getvalue(), {"content-type": "text/csv"})
        csv_url = supabase.storage.from_(CSV_BUCKET).get_public_url(csv_storage_path)
        print(f"CSV uploaded to: {csv_storage_path}")
    except Exception as e:
        print(f"CSV upload failed: {e}")
        return ParseResponse(success=False, error=f"CSV upload failed: {e}")

    # 5. Call model service for ML analysis (with wake-on-demand retry)
    # Warm-up: Railway wakes the container on first connection attempt
    for attempt in range(2):
        try:
            with httpx.Client(timeout=5) as client:
                warmup = client.get(f"{MODEL_SERVICE_URL}/api/health")
            if warmup.status_code == 200:
                break
        except Exception:
            if attempt == 0:
                time.sleep(3)
            else:
                pass

    last_error = None
    for attempt in range(2):
        try:
            with httpx.Client(timeout=300) as client:
                model_resp = client.post(
                    f"{MODEL_SERVICE_URL}/predict",
                    json={
                        "csv_url": csv_url.public_url if hasattr(csv_url, "public_url") else csv_url,
                        "storage_path": req.storage_path,
                        "file_name": req.file_name,
                        "file_type": req.file_type,
                    },
                )
            if model_resp.status_code == 200:
                analysis = model_resp.json()
                if analysis.get("success"):
                    break
                last_error = analysis.get("error", "Model analysis failed")
            else:
                last_error = f"Model service returned {model_resp.status_code}: {model_resp.text}"
        except Exception as e:
            last_error = f"Model service call failed: {e}"

        if attempt == 0:
            time.sleep(3)
        else:
            print(last_error)
            return ParseResponse(success=False, error=last_error)

    return ParseResponse(
        success=True,
        transactions=analysis.get("transactions"),
        health_score=analysis.get("health_score"),
        category_expense=analysis.get("category_expense"),
        income_summary=analysis.get("income_summary"),
        recurring_payments=analysis.get("recurring_payments"),
        recommendations=analysis.get("recommendations"),
        csv_path=csv_storage_path,
        json_path=None,
    )
    
if __name__ == "__main__":
   import uvicorn
   port = int(os.environ.get("PORT", 8000))
   uvicorn.run(app, host="0.0.0.0", port=port)