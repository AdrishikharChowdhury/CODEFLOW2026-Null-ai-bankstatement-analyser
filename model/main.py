import os
import io
import uuid
import tempfile
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
from db import supabase
from analyzer import analyze_csv
from sanitization import sanitize

class PredictRequest(BaseModel):
    csv_url: str
    storage_path: str
    file_name: str
    file_type: str

class PredictResponse(BaseModel):
    success: bool
    transactions: list | None = None
    health_score: dict | None = None
    category_expense: list | None = None
    income_summary: list | None = None
    recurring_payments: list | None = None
    recommendations: list | None = None
    error: str | None = None

CSV_BUCKET = "csv"

def ensure_csv_bucket():
    try:
        buckets = supabase.storage.list_buckets()
        if not any(b.name == CSV_BUCKET for b in buckets):
            supabase.storage.create_bucket(CSV_BUCKET, {"public": True})
    except Exception:
        pass

ensure_csv_bucket()

app = FastAPI(title="Financialo Model Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "Running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    user_id = req.storage_path.split("/")[0]

    # 1. Download CSV from Supabase csv_bucket
    try:
        csv_path = req.csv_url.split(f"/{CSV_BUCKET}/")[-1] if f"/{CSV_BUCKET}/" in req.csv_url else req.csv_url
        res = supabase.storage.from_(CSV_BUCKET).download(csv_path)
        if res is None:
            return PredictResponse(success=False, error="CSV not found in csv_bucket")
        if hasattr(res, "read"):
            buffer = io.BytesIO(res.read())
        else:
            buffer = io.BytesIO(res)
    except Exception as e:
        return PredictResponse(success=False, error=f"CSV download failed: {e}")

    # 2. Save to temp file
    tmp_path = f"/tmp/{uuid.uuid4()}.csv"
    try:
        with open(tmp_path, "wb") as f:
            f.write(buffer.getvalue())
    except Exception as e:
        return PredictResponse(success=False, error=f"Temp file write failed: {e}")

    # 3. Run ML analysis
    try:
        analysis = analyze_csv(tmp_path)
    except Exception as e:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        return PredictResponse(success=False, error=f"Analysis failed: {e}")

    # 4. Sanitize PII
    try:
        for txn in analysis.get("transactions", []):
            if "clean_description" in txn:
                txn["clean_description"] = sanitize(str(txn["clean_description"]))
            if "description" in txn:
                txn["description"] = sanitize(str(txn["description"]))
    except Exception as e:
        pass

    # 5. Store in Supabase statements table
    try:
        slug = datetime.now(timezone.utc).strftime("%b %d, %Y %I:%M:%S %p")
        supabase.table("statements").insert({
            "user_id": user_id,
            "summary": analysis,
            "slug": slug,
        }).execute()
    except Exception as e:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        return PredictResponse(success=False, error=f"Database save failed: {e}")

    # 6. Clean up storage
    try:
        supabase.storage.from_("statements").remove([req.storage_path])
    except Exception:
        pass
    try:
        supabase.storage.from_(CSV_BUCKET).remove([csv_path])
    except Exception:
        pass

    # 7. Clean up temp file
    if os.path.exists(tmp_path):
        os.remove(tmp_path)

    return PredictResponse(
        success=True,
        transactions=analysis.get("transactions"),
        health_score=analysis.get("health_score"),
        category_expense=analysis.get("category_expense"),
        income_summary=analysis.get("income_summary"),
        recurring_payments=analysis.get("recurring_payments"),
        recommendations=analysis.get("recommendations"),
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
