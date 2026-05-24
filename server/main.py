import os
import io
from fastapi import FastAPI
from db import supabase
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sanitization import sanitize
from parser import extract_rows_from_pdf, self_healing_normalization, compute_financial_health, normalize_csv_columns
from analyzer import analyze_csv
from pydantic import BaseModel

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

    # 3. Normalize & compute health
    try:
        processed_df = self_healing_normalization(raw_df)
        health = compute_financial_health(processed_df)
    except Exception as e:
        print(f"Normalization failed: {e}")
        return ParseResponse(success=False, error=f"Normalization failed: {e}")

    # 4. Sanitize & save CSV
    try:
        csv_name = req.storage_path.replace("/", "_").rsplit(".", 1)[0] + ".csv"
        csv_path = os.path.join("csv", csv_name)
        os.makedirs("csv", exist_ok=True)
        transactions = processed_df.fillna(0).to_dict(orient="records")
        for txn in transactions:
            if "clean_description" in txn:
                txn["clean_description"] = sanitize(str(txn["clean_description"]))
            if "description" in txn:
                txn["description"] = sanitize(str(txn["description"]))
        sanitized_df = pd.DataFrame(transactions)
        sanitized_df.to_csv(csv_path, index=False)
        print(f"CSV saved to: {csv_path}")
    except Exception as e:
        print(f"CSV save failed: {e}")
        return ParseResponse(success=False, error=f"CSV save failed: {e}")

    # 5. Run ML analysis on the saved CSV
    try:
        analysis = analyze_csv(csv_path)
        json_path = csv_path.rsplit(".", 1)[0] + ".json"
    except Exception as e:
        print(f"Analysis failed: {e}")
        return ParseResponse(success=False, error=f"Analysis failed: {e}")

    # 6. Store analysis in statements table
    try:
        user_id = req.storage_path.split("/")[0]
        supabase.table("statements").insert({
            "user_id": user_id,
            "summary": analysis,
        }).execute()
        print(f"Analysis stored in statements table")
    except Exception as e:
        print(f"Database save failed: {e}")

    return ParseResponse(
        success=True,
        transactions=analysis["transactions"],
        health_score=analysis["health_score"],
        category_expense=analysis["category_expense"],
        income_summary=analysis["income_summary"],
        recurring_payments=analysis["recurring_payments"],
        recommendations=analysis["recommendations"],
        csv_path=csv_path,
        json_path=json_path,
    )