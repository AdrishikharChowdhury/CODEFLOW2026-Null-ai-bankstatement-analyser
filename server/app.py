import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import google.generativeai as genai
import pdfplumber
import torch
import joblib  # Used to deserialize your custom LightGBM Classifier package safely
import re
from io import BytesIO

st.set_page_config(page_title="FinGuard AI Pro: Multi-Model Analytics Suite", layout="wide")

# --- 1. LOAD COMPREHENSIVE AI ENGINE STACK ---
@st.cache_resource
def load_ai_models():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    # Model 1: Fine-Tuned Sentence Transformer for Categorization
    try:
        from setfit import SetFitModel
        setfit_brain = SetFitModel.from_pretrained("./fine_tuned_agami_transformer")
        setfit_brain.to(device)
        s1 = "SetFit Categorizer: Active"
    except Exception:
        setfit_brain = None
        s1 = "SetFit Categorizer: Using Rule-Based Fallback"
        
    # Model 2: LightGBM Risk & Fraud Classifier Ingestion
    try:
        # Load your custom saved lightgbm.pkl structure natively
        lgb_classifier = joblib.load("./lightgbm_fraud_model.pkl")
        s2 = "LightGBM Security Layer: Active"
    except Exception:
        lgb_classifier = None
        s2 = "LightGBM Security Layer: Using Simulation Matrix"
        
    return setfit_brain, lgb_classifier, f"{s1} | {s2} ({device.upper()})"

setfit_model, lgb_model, models_status_log = load_ai_models()
genai.configure(api_key="AIzaSyDZNuOOl8cAWhpE2PRpjRHgZufKjlk3RZc")

# --- 2. MULTI-LINE RESILIENT PDF PARSER ---
DATE_PATTERN = re.compile(
    r"(?i)\b("
    r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|"
    r"\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}|"
    r"[A-Za-z]{3,9}\s+\d{1,2},\s+\d{2,4}|"
    r"\d{4}[/-]\d{1,2}[/-]\d{1,2}"
    r")\b"
)
AMOUNT_PATTERN = re.compile(
    r"(?i)(?:rs\.?\s*|inr\s*)?-?\(?"
    r"(?:\d[\d,]*\.\d{2}|\d{3,}(?:,\d{3})*)"
    r"\)?"
)


def build_default_statement_metadata():
    return {
        "account_type": 0,
        "state": 0,
        "credit_score": 750,
        "has_loan": 0,
        "loan_type": 0,
        "emi_amount": 0.0,
        "kyc_status": 0,
        "account_holder": None,
        "account_number": None,
        "bank_name": None,
        "branch": None,
        "ifsc": None,
        "customer_id": None,
        "statement_period": None,
        "email": None,
        "mobile": None,
        "opening_balance": None,
        "closing_balance": None,
        "currency": "INR",
        "page_count": 0,
    }


def clean_cell(value):
    if value is None:
        return ""
    text = str(value).replace("\n", " ").strip()
    return re.sub(r"\s+", " ", text)


def parse_amount(value):
    text = clean_cell(value)
    if not text or text.lower() in {"nan", "none", "-", "--", "na", "n/a"}:
        return None

    sign = -1 if "(" in text and ")" in text else 1
    if text.endswith("-"):
        sign = -1

    plain_digits = re.sub(r"\D", "", text)
    amount_markers = any(marker in text for marker in [".", ",", "rs", "inr", "-", "(", ")"])
    if plain_digits and len(plain_digits) > 6 and not amount_markers:
        return None

    text = re.sub(r"(?i)\b(?:inr|rs\.?|cr|dr)\b", "", text)
    text = text.replace(",", "").replace("(", "").replace(")", "").strip()
    match = re.search(r"-?\d+(?:\.\d+)?", text)
    if not match:
        return None

    amount = float(match.group())
    if amount >= 0 and sign < 0:
        amount *= -1
    return amount


def looks_like_date(value):
    return bool(DATE_PATTERN.search(clean_cell(value)))


def extract_amount_strings(text):
    return [match.group().strip() for match in AMOUNT_PATTERN.finditer(text)]


def infer_direction(description, amount):
    desc = clean_cell(description).lower()
    credit_markers = ["credit", "deposit", "salary", "refund", "received", "cash dep", "cr"]
    debit_markers = ["debit", "withdraw", "atm", "purchase", "bill", "emi", "dr", "spent"]

    if any(marker in desc for marker in credit_markers):
        return "credit"
    if any(marker in desc for marker in debit_markers):
        return "debit"
    if amount is not None and amount < 0:
        return "debit"
    return "debit"


def categorize_transaction(description):
    desc = clean_cell(description).lower()
    category_keywords = {
        "Food & Dining": ["swiggy", "zomato", "restaurant", "cafe", "food", "dining"],
        "Shopping": ["amazon", "flipkart", "myntra", "shop", "purchase", "mart"],
        "Transfers": ["upi", "imps", "neft", "rtgs", "transfer", "p2p"],
        "Bills & Utilities": ["electricity", "water", "gas", "broadband", "recharge", "bill", "utility"],
        "Travel": ["uber", "ola", "irctc", "flight", "metro", "fuel", "petrol", "diesel"],
        "Cash Withdrawal": ["atm", "cash withdrawal", "self cheque"],
        "Income": ["salary", "interest", "refund", "cash deposit", "credited", "credit"],
        "Loan / EMI": ["emi", "loan", "mortgage"],
        "Fees & Charges": ["charge", "penalty", "gst", "fee", "commission"],
    }

    for category, keywords in category_keywords.items():
        if any(keyword in desc for keyword in keywords):
            return category
    return "General Expenditure"


def assign_transaction_categories(df):
    fallback_categories = df["description"].apply(categorize_transaction)
    if "ai_category" not in df.columns:
        df["ai_category"] = fallback_categories
        return df

    ai_category = df["ai_category"].astype(str).str.strip()
    blank_mask = ai_category.eq("") | ai_category.eq("nan")
    generic_mask = ai_category.str.lower().isin({"general expenditure", "unknown", "other"})
    df.loc[blank_mask | generic_mask, "ai_category"] = fallback_categories[blank_mask | generic_mask]
    return df


def finalize_statement_metadata(df, metadata):
    if df.empty:
        return metadata

    balance_series = pd.to_numeric(df.get("balance", pd.Series(dtype=float)), errors="coerce")
    non_zero_balances = balance_series[balance_series.notna() & balance_series.ne(0)]

    if metadata.get("closing_balance") in (None, 0) and not non_zero_balances.empty:
        metadata["closing_balance"] = float(non_zero_balances.iloc[-1])

    if metadata.get("opening_balance") in (None, 0) and not non_zero_balances.empty:
        first_balance = float(non_zero_balances.iloc[0])
        first_debit = float(pd.to_numeric(df.iloc[0].get("debit", 0), errors="coerce") or 0)
        first_credit = float(pd.to_numeric(df.iloc[0].get("credit", 0), errors="coerce") or 0)
        if first_debit > 0 and first_balance != 0:
            metadata["opening_balance"] = first_balance + first_debit
        elif first_credit > 0 and first_balance != 0:
            metadata["opening_balance"] = first_balance - first_credit
        else:
            metadata["opening_balance"] = first_balance

    return metadata


def enrich_transactions(df, metadata):
    if df.empty:
        return df

    feature_defaults = {
        "account_type": metadata["account_type"],
        "state": metadata["state"],
        "credit_score": metadata["credit_score"],
        "has_loan": metadata["has_loan"],
        "loan_type": metadata["loan_type"],
        "emi_amount": metadata["emi_amount"],
        "kyc_status": metadata["kyc_status"],
    }
    for column, value in feature_defaults.items():
        df[column] = value

    if "description" not in df.columns:
        df["description"] = "transaction"
    if "reference" not in df.columns:
        df["reference"] = ""
    if "value_date" not in df.columns:
        df["value_date"] = ""
    if "page_number" not in df.columns:
        df["page_number"] = 1
    if "raw_row" not in df.columns:
        df["raw_row"] = df["description"].astype(str)

    for column in ["debit", "credit", "balance"]:
        if column not in df.columns:
            df[column] = 0.0
        df[column] = pd.to_numeric(df[column], errors="coerce").fillna(0.0)

    return df


def extract_statement_metadata(full_text):
    metadata = build_default_statement_metadata()
    lower_text = full_text.lower()

    if "current" in lower_text:
        metadata["account_type"] = 1
    elif "savings" in lower_text:
        metadata["account_type"] = 0

    if "loan" in lower_text or "outstanding" in lower_text or "emi" in lower_text:
        metadata["has_loan"] = 1
        metadata["loan_type"] = 1

    if "kyc pending" in lower_text or "non compliant" in lower_text:
        metadata["kyc_status"] = 1
    elif "kyc" in lower_text:
        metadata["kyc_status"] = 0

    simple_patterns = {
        "account_holder": [
            r"(?im)^(?:customer name|account name|name)\s*[:\-]\s*(.+)$",
        ],
        "account_number": [
            r"(?im)^(?:account(?: number| no\.?)?)\s*[:\-]\s*([Xx*\d -]{6,})$",
        ],
        "branch": [
            r"(?im)^(?:branch)\s*[:\-]\s*(.+)$",
        ],
        "ifsc": [
            r"(?im)^(?:ifsc(?: code)?)\s*[:\-]\s*([A-Z]{4}0[A-Z0-9]{6})$",
        ],
        "customer_id": [
            r"(?im)^(?:customer id|cif(?: no\.?)?)\s*[:\-]\s*(.+)$",
        ],
        "statement_period": [
            r"(?im)^(?:statement period|period)\s*[:\-]\s*(.+)$",
            r"(?im)^(?:from)\s*[:\-]\s*(.+?\bto\b.+)$",
        ],
        "email": [
            r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
        ],
        "mobile": [
            r"(?<!\d)(?:\+91[-\s]?)?[6-9]\d{9}(?!\d)",
        ],
    }

    for key, patterns in simple_patterns.items():
        for pattern in patterns:
            match = re.search(pattern, full_text)
            if match:
                metadata[key] = clean_cell(match.group(1) if match.groups() else match.group(0))
                break

    balance_patterns = {
        "opening_balance": [
            r"(?im)^(?:opening balance|balance brought forward)\s*[:\-]?\s*([^\n]+)$",
        ],
        "closing_balance": [
            r"(?im)^(?:closing balance|available balance|ledger balance|balance carried forward)\s*[:\-]?\s*([^\n]+)$",
            r"(?im)^(?:closing|ending|final)\s+balance\s*[:\-]?\s*([^\n]+)$",
            r"(?im)^.*(?:closing|ending)\s+balance.*?([-\(]?\s*(?:rs\.?\s*)?\d[\d,]*(?:\.\d{2})?\)?)\s*$",
        ],
        "emi_amount": [
            r"(?im)^(?:emi amount|monthly emi)\s*[:\-]?\s*([^\n]+)$",
        ],
    }
    for key, patterns in balance_patterns.items():
        for pattern in patterns:
            match = re.search(pattern, full_text)
            if match:
                metadata[key] = parse_amount(match.group(1))
                break

    bank_match = re.search(r"(?im)^([A-Z][A-Za-z&., ]{2,40}bank)\b", full_text)
    if bank_match:
        metadata["bank_name"] = clean_cell(bank_match.group(1))

    return metadata


def normalize_headers(row):
    return [re.sub(r"[^a-z0-9]+", " ", clean_cell(cell).lower()).strip() for cell in row]


def is_header_row(row):
    header_text = " ".join(normalize_headers(row))
    header_markers = ["date", "narration", "description", "particular", "withdrawal", "deposit", "credit", "debit", "balance", "amount"]
    return any(marker in header_text for marker in header_markers)


def row_to_transaction(row, headers=None, page_number=1):
    cleaned = [clean_cell(cell) for cell in row]
    if not any(cleaned):
        return None

    date_candidates = [idx for idx, cell in enumerate(cleaned[:3]) if looks_like_date(cell)]
    if not date_candidates:
        return None

    record = {
        "date": cleaned[date_candidates[0]],
        "value_date": "",
        "description": "",
        "reference": "",
        "debit": 0.0,
        "credit": 0.0,
        "balance": 0.0,
        "page_number": page_number,
        "raw_row": " | ".join(cleaned),
    }

    description_parts = []
    amount_values = []
    balance_from_header = None
    generic_amount = None

    if headers and len(headers) == len(cleaned):
        for header, cell in zip(headers, cleaned):
            if not cell:
                continue
            if "value date" in header:
                record["value_date"] = cell
            elif header == "date" or header.startswith("txn date") or header.startswith("transaction date"):
                record["date"] = cell
            elif any(keyword in header for keyword in ["narration", "description", "particular", "details", "remarks"]):
                description_parts.append(cell)
            elif any(keyword in header for keyword in ["reference", "ref", "utr", "transaction id", "txn id", "cheque", "chq"]):
                record["reference"] = f"{record['reference']} {cell}".strip()
            elif any(keyword in header for keyword in ["debit", "withdrawal", "withdraw", "dr amount"]):
                record["debit"] = abs(parse_amount(cell) or 0.0)
            elif any(keyword in header for keyword in ["credit", "deposit", "cr amount"]):
                record["credit"] = abs(parse_amount(cell) or 0.0)
            elif "balance" in header:
                balance_from_header = parse_amount(cell)
            elif "amount" in header:
                generic_amount = parse_amount(cell)
            elif not looks_like_date(cell):
                description_parts.append(cell)
    else:
        for cell in cleaned:
            if not cell or looks_like_date(cell):
                continue
            amount = parse_amount(cell)
            if amount is not None:
                amount_values.append(amount)
            else:
                description_parts.append(cell)

    if balance_from_header is not None:
        record["balance"] = balance_from_header
    elif amount_values:
        record["balance"] = amount_values[-1]

    if record["debit"] == 0.0 and record["credit"] == 0.0:
        if generic_amount is None and amount_values:
            generic_amount = amount_values[0] if len(amount_values) == 1 else amount_values[-2]
        if generic_amount is not None:
            direction = infer_direction(" ".join(description_parts), generic_amount)
            if direction == "credit":
                record["credit"] = abs(generic_amount)
            else:
                record["debit"] = abs(generic_amount)

    record["description"] = " ".join(part for part in description_parts if part).strip() or "transaction"
    return record


def extract_transactions_from_tables(pdf):
    transactions = []
    for page_number, page in enumerate(pdf.pages, start=1):
        for table in page.extract_tables() or []:
            headers = None
            for row in table:
                if not row or not any(clean_cell(cell) for cell in row):
                    continue
                if headers is None and is_header_row(row):
                    headers = normalize_headers(row)
                    continue
                transaction = row_to_transaction(row, headers=headers, page_number=page_number)
                if transaction:
                    transactions.append(transaction)
    return transactions


def extract_transactions_from_text(full_text):
    transactions = []
    lines = [line.strip() for line in full_text.splitlines() if line.strip()]
    idx = 0

    while idx < len(lines):
        line = lines[idx]
        if not DATE_PATTERN.match(line):
            idx += 1
            continue

        chunk = line
        lookahead = idx + 1
        while lookahead < len(lines) and not DATE_PATTERN.match(lines[lookahead]):
            chunk += " " + lines[lookahead]
            lookahead += 1

        date_match = DATE_PATTERN.search(chunk)
        tail_text = chunk[date_match.end():].strip() if date_match else chunk
        amounts = [parse_amount(value) for value in extract_amount_strings(tail_text)]
        amounts = [value for value in amounts if value is not None]
        description = tail_text
        for amount_string in extract_amount_strings(tail_text):
            description = description.replace(amount_string, " ")
        description = re.sub(r"\s+", " ", description).strip(" |-")
        direction = infer_direction(description, amounts[0] if amounts else None)

        debit = 0.0
        credit = 0.0
        balance = amounts[-1] if amounts else 0.0
        txn_amount = amounts[0] if amounts else None
        if txn_amount is not None:
            if direction == "credit":
                credit = abs(txn_amount)
            else:
                debit = abs(txn_amount)

        transactions.append({
            "date": date_match.group(1) if date_match else line,
            "value_date": "",
            "description": description or "transaction",
            "reference": "",
            "debit": debit,
            "credit": credit,
            "balance": balance,
            "page_number": 1,
            "raw_row": chunk,
        })
        idx = lookahead

    return transactions


def extract_rows_from_pdf(pdf_buffer):
    pdf_bytes = pdf_buffer.getvalue() if hasattr(pdf_buffer, "getvalue") else pdf_buffer.read()
    with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
        page_texts = [page.extract_text() or "" for page in pdf.pages]
        full_text = "\n".join(page_texts).strip()
        metadata = extract_statement_metadata(full_text)
        metadata["page_count"] = len(pdf.pages)

        table_transactions = extract_transactions_from_tables(pdf)
        if table_transactions:
            df = pd.DataFrame(table_transactions)
        else:
            df = pd.DataFrame(extract_transactions_from_text(full_text))

    df = enrich_transactions(df, metadata)
    metadata = finalize_statement_metadata(df, metadata)
    return df, metadata, full_text

def self_healing_normalization(df_raw):
    df = df_raw.copy()
    df['debit_value'] = pd.to_numeric(df['debit'], errors='coerce').fillna(0.0)
    df['credit_value'] = pd.to_numeric(df['credit'], errors='coerce').fillna(0.0)
    df['balance_value'] = pd.to_numeric(df['balance'], errors='coerce').fillna(0.0)
    df['clean_description'] = df['description'].astype(str).fillna("transaction")
    df['clean_description'] = df['clean_description'].apply(lambda x: re.sub(r'[^a-zA-Z\s]', ' ', x.lower()).strip())
    return df

# --- 3. THE PIPELINE EMBEDDING TIER ---
def evaluate_advanced_metrics(df):
    total_spent = df['debit_value'].sum()
    total_earned = df['credit_value'].sum()
    net_savings = total_earned - total_spent
    
    # 1. Compile 15-Feature Array Matrix structure mapped to LightGBM definitions
    feature_matrix = pd.DataFrame()
    feature_matrix['account_type'] = df['account_type'].fillna(0).astype(int)
    feature_matrix['transaction_type'] = df['description'].apply(lambda x: 1 if "upi" in x.lower() else (2 if "imps" in x.lower() else 0)).astype(int)
    feature_matrix['transaction_amount'] = np.where(df['debit_value'] > 0, df['debit_value'], df['credit_value'])
    feature_matrix['transaction_direction'] = np.where(df['debit_value'] > 0, 1, 0).astype(int)
    feature_matrix['account_balance'] = df['balance_value']
    feature_matrix['merchant_category'] = 0  # Categorical encoded placeholder
    feature_matrix['state'] = df['state'].fillna(0).astype(int)
    feature_matrix['credit_score'] = df['credit_score'].fillna(750).astype(int)
    feature_matrix['has_loan'] = df['has_loan'].fillna(0).astype(int)
    feature_matrix['loan_type'] = df['loan_type'].fillna(0).astype(int)
    feature_matrix['emi_amount'] = df['emi_amount'].fillna(0.0).astype(float)
    feature_matrix['transaction_status'] = 0
    feature_matrix['channel'] = 0
    feature_matrix['kyc_status'] = df['kyc_status'].fillna(0).astype(int)
    feature_matrix['transaction_hour'] = 12  # Standard noon imputation fallback metric
    
    # 2. Run LightGBM Model Inference Pass
    fraud_alerts = []
    if lgb_model is not None:
        # Generate probability matrix directly out of your model weights mapping file
        probabilities = lgb_model.predict_proba(feature_matrix)[:, 1]
        fraud_probability = float(np.mean(probabilities) * 100)
        
        # Isolate rows where prediction splits breach safe thresholds
        high_risk_indices = np.where(probabilities > 0.75)[0]
        for idx in high_risk_indices:
            fraud_alerts.append(f"**High Risk Transaction Flagged**: Suspicious activity pattern matching signature details in row on description: '{df.iloc[idx]['clean_description'][:50]}...'")
    else:
        # Dynamic deterministic execution matrix if .pkl file missing during hackathon pass
        calc_risk = 5.0
        large_spikes = df[df['debit_value'] > 15000]
        if not large_spikes.empty: 
            calc_risk += 35.0
            for _, r in large_spikes.iterrows():
                fraud_alerts.append(f"**Large Outflow Anomaly Flagged**: Outlier burn vector of Rs. {r['debit_value']:,} encountered.")
        fraud_probability = min(calc_risk, 100.0)

    # 3. Derive Labeled Structural Outputs requested
    loan_ratio = (df['emi_amount'].sum() / total_earned * 100) if total_earned > 0 else 15.0
    simulated_credit_insight = 750 + int((net_savings / total_earned * 50)) if total_earned > 0 else 680
    simulated_credit_insight = max(min(simulated_credit_insight, 850), 300)
    health_score = int(((simulated_credit_insight - 300) / 550) * 100)
    
    # 4. Synthesize recommendation cards
    recommendations = []
    if fraud_probability > 25: recommendations.append("**Security Advisory**: High anomaly risk parameters discovered. We recommend updating UPI tokens and verifying connected third-party merchants.")
    if health_score < 50: recommendations.append("**Liquidity Preservation Matrix**: Your burn velocity is exceeding safe standard baselines. Review non-essential utilities immediately.")
    else: recommendations.append("**Wealth Optimization Card**: Your financial layout parameters are stable. Excess liquid resources can safely be migrated toward yield-generating Fixed Deposits.")

    return {
        "fraud_prob": fraud_probability, "fraud_alerts": fraud_alerts, "loan_burden": loan_ratio,
        "credit_score": simulated_credit_insight, "health_score": health_score, "recommendations": recommendations
    }

# --- 4. STREAMLIT INTERACTIVE USER INTERFACE ---
st.title("FinGuard AI Pro: Multi-Model Intelligence Dashboard")
st.sidebar.markdown(f"`System Configuration Tree:`\n`{models_status_log}`")

uploaded_file = st.sidebar.file_uploader("Upload Bank Statement PDF or CSV", type=["pdf", "csv"])

if uploaded_file is not None:
    statement_metadata = build_default_statement_metadata()
    raw_statement_text = ""

    if uploaded_file.name.endswith('.pdf'):
        raw_df, statement_metadata, raw_statement_text = extract_rows_from_pdf(uploaded_file)
    else:
        raw_df = pd.read_csv(uploaded_file)
        
    if raw_df.empty:
        st.warning("The PDF text was read, but no transaction rows were detected.")
        if statement_metadata:
            st.subheader("Extracted Statement Metadata")
            st.json(statement_metadata)
        if raw_statement_text:
            with st.expander("Raw Extracted PDF Text", expanded=True):
                st.text(raw_statement_text[:40000])
        st.stop()
        
    processed_df = self_healing_normalization(raw_df)
    
    # Model Execution 1: Sentence NLP Classification
    if setfit_model is not None:
        processed_df['ai_category'] = setfit_model.predict(processed_df['clean_description'].tolist())
    else:
        processed_df['ai_category'] = "General Expenditure"
    processed_df = assign_transaction_categories(processed_df)
        
    # Model Execution 2: LightGBM Feature Extraction Pass
    analytics = evaluate_advanced_metrics(processed_df)

    parsed_dates = pd.to_datetime(processed_df['date'], errors='coerce', dayfirst=True)
    valid_dates = parsed_dates.dropna()
    detected_period = (
        f"{valid_dates.min().date()} to {valid_dates.max().date()}"
        if not valid_dates.empty else statement_metadata.get("statement_period", "Not detected")
    )

    st.subheader("Statement Extraction Summary")
    s1, s2, s3 = st.columns(3)
    s1.metric("Transactions Extracted", len(processed_df))
    s2.metric("Pages Parsed", int(statement_metadata.get("page_count") or 1))
    s3.metric("Detected Period", detected_period)

    with st.expander("Extracted Statement Metadata", expanded=False):
        st.json({
            "account_holder": statement_metadata.get("account_holder") or "Not detected",
            "account_number": statement_metadata.get("account_number") or "Not detected",
            "bank_name": statement_metadata.get("bank_name") or "Not detected",
            "branch": statement_metadata.get("branch") or "Not detected",
            "ifsc": statement_metadata.get("ifsc") or "Not detected",
            "customer_id": statement_metadata.get("customer_id") or "Not detected",
            "statement_period": statement_metadata.get("statement_period") or detected_period,
            "opening_balance": statement_metadata.get("opening_balance"),
            "closing_balance": statement_metadata.get("closing_balance"),
            "email": statement_metadata.get("email") or "Not detected",
            "mobile": statement_metadata.get("mobile") or "Not detected",
        })
    
    # --- UI RENDER ROW 1: CORE 6 ANALYTICAL METRICS ---
    st.subheader("Real-Time Diagnostic Scoreboard")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Financial Health Score", f"{analytics['health_score']}/100")
    c2.metric("Credit Score Insight", f"{analytics['credit_score']} Pts")
    c3.metric("Fraud Probability", f"{analytics['fraud_prob']:.1f}%")
    c4.metric("Loan Burden Ratio", f"{analytics['loan_burden']:.1f}%")
    
    st.markdown("---")
    
    # --- UI RENDER ROW 2: GRAPHICAL DISTRIBUTION PLOTS ---
    g1, g2 = st.columns(2)
    with g1:
        st.subheader("Expense Categories Breakdown")
        processed_df["expense_value"] = np.where(processed_df["debit_value"] > 0, processed_df["debit_value"], 0.0)
        pie_data = processed_df.groupby('ai_category', as_index=False)['expense_value'].sum()
        pie_data = pie_data[pie_data['expense_value'] > 0]
        if pie_data.empty:
            st.info("No debit-side expenses were detected from the parsed statement.")
        else:
            st.plotly_chart(px.pie(pie_data, values='expense_value', names='ai_category', hole=0.35, color_discrete_sequence=px.colors.sequential.Plotly3), use_container_width=True)
    with g2:
        st.subheader("Temporal Cash Flow Spending Timeline")
        st.plotly_chart(px.area(processed_df, y='balance_value', labels={'balance_value': 'Balance Track (INR)'}, line_shape="spline", color_discrete_sequence=['#1A237E']), use_container_width=True)
        
    st.markdown("---")
    
    # --- UI RENDER ROW 3: SECURITY ALERTS AND RECOMMENDATIONS CARDS ---
    col_left, col_right = st.columns(2)
    with col_left:
        st.subheader("Real-Time Fraud Alerts")
        if analytics['fraud_alerts']:
            for alert in analytics['fraud_alerts']: st.error(alert)
        else: st.success("Clean Record: No suspicious payment anomalies or rapid transactional velocity patterns found.")
    with col_right:
        st.subheader("Labeled Recommendation Cards")
        for rec in analytics['recommendations']: st.info(rec)

    st.markdown("---")
    st.subheader("All Extracted Transactions")
    display_columns = [
        column for column in [
            "date", "value_date", "description", "reference",
            "debit", "credit", "balance", "ai_category", "page_number"
        ] if column in processed_df.columns
    ]
    st.dataframe(processed_df[display_columns], use_container_width=True, hide_index=True)
    st.download_button(
        "Download Extracted Transactions CSV",
        processed_df.to_csv(index=False).encode("utf-8"),
        file_name=f"{uploaded_file.name.rsplit('.', 1)[0]}_extracted.csv",
        mime="text/csv",
    )

    if raw_statement_text:
        with st.expander("Raw Extracted PDF Text", expanded=False):
            st.text(raw_statement_text[:40000])

