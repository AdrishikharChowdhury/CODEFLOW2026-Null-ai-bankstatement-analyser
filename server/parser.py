import re
import io
import os
import pandas as pd
import numpy as np
import pdfplumber
from dotenv import load_dotenv

load_dotenv()

# ── Optional Gemini client ──
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = None
if GEMINI_API_KEY:
    from google import genai
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# ── Regex patterns ───────────────────────────────────────────────────────
DATE_PATTERN = re.compile(
    r'(?<![\d/.-])'
    r'(\d{1,2}[\s/.-](?:\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)[\s/.-]\d{2,4}'
    r'|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s/.-]\d{1,2}[\s/.-]\d{2,4}'
    r'|\d{4}[/.-]\d{1,2}[/.-]\d{1,2})'
    r'(?![\d/.-])',
    re.IGNORECASE,
)
DATE_AT_START_PATTERN = re.compile(
    r'^\|?\s*'
    r'(\d{1,2}[\s/.-](?:\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)[\s/.-]\d{2,4}'
    r'|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s/.-]\d{1,2}[\s/.-]\d{2,4}'
    r'|\d{4}[/.-]\d{1,2}[/.-]\d{1,2})'
    r'(?![\d/.-])',
    re.IGNORECASE,
)
AMOUNT_PATTERN = re.compile(
    r'(?<![\w/.-])'
    r'(?:INR|Rs\.?|₹|CR|DR)?\s*'
    r'([+-]?(?:\d{1,3}(?:[,.]\d{2,3})+|\d{4,})(?:[.,]\d{1,2})?)'
    r'(?:\s*(?:CR|DR|Cr|Dr))?'
    r'(?![\w/.-])',
    re.IGNORECASE,
)
HEADER_MARKERS = (
    "value date",
    "post date",
    "transaction date",
    "description",
    "narration",
    "withdrawal",
    "deposit",
    "balance",
)
SKIP_ROW_MARKERS = (
    "statement summary",
    "brought forward",
    "opening balance",
    "closing balance",
    "total withdrawal",
    "total deposit",
)

# ── Parsing helpers ──────────────────────────────────────────────────────

def _line_is_noise(line):
    clean = line.replace("|", " ").strip()
    lower = clean.lower()
    if not clean or not re.search(r'[A-Za-z0-9]', clean):
        return True
    if DATE_PATTERN.search(clean) and AMOUNT_PATTERN.search(clean):
        return False
    if DATE_AT_START_PATTERN.search(clean):
        return False
    header_hits = sum(1 for marker in HEADER_MARKERS if marker in lower)
    return header_hits >= 3


def _amount_to_float(value):
    return float(value.replace(",", "").replace("+", ""))


def _parse_transaction_block(block):
    block = re.sub(r'\s+', ' ', block.replace("|", " ")).strip()
    date_match = DATE_PATTERN.search(block)
    if not date_match:
        return None

    lower_block = block.lower()
    if any(marker in lower_block for marker in SKIP_ROW_MARKERS):
        return None

    date_val = date_match.group(1)
    amount_source = DATE_PATTERN.sub(" ", block)
    raw_numeric_groups = [
        match.group(1)
        for match in AMOUNT_PATTERN.finditer(amount_source)
        if len(match.group(1).replace(",", "").replace("+", "").replace("-", "")) > 1
    ]
    currency_shaped_groups = [value for value in raw_numeric_groups if "." in value or "," in value]
    numeric_groups = currency_shaped_groups or raw_numeric_groups

    debit, credit, balance = 0.0, 0.0, 0.0
    if len(numeric_groups) >= 2:
        balance = _amount_to_float(numeric_groups[-1])
        transaction_amount = _amount_to_float(numeric_groups[0])

        credit_hints = ("dep", "credit", "/cr/", " cr ", "payment from", "deposit", "refund", "interest")
        debit_hints = ("wdl", "debit", "/dr/", " dr ", "withdrawal", "payment to", "upi", "atm", "pos")

        if any(hint in lower_block for hint in credit_hints) and not any(hint in lower_block for hint in debit_hints):
            credit = transaction_amount
        elif any(hint in lower_block for hint in credit_hints):
            credit = transaction_amount
        else:
            debit = transaction_amount
    elif len(numeric_groups) == 1:
        balance = _amount_to_float(numeric_groups[0])

    return {
        "date": date_val,
        "description": block,
        "debit": debit,
        "credit": credit,
        "balance": balance,
    }


def _extract_text_blocks(text):
    blocks = []
    current_block = []

    for raw_line in text.split('\n'):
        line = raw_line.strip()
        if _line_is_noise(line):
            continue

        if DATE_AT_START_PATTERN.search(line):
            if current_block:
                blocks.append(" ".join(current_block))
            current_block = [line]
        elif current_block:
            current_block.append(line)
        elif DATE_PATTERN.search(line):
            current_block = [line]

    if current_block:
        blocks.append(" ".join(current_block))

    return blocks


def _extract_table_blocks(page):
    blocks = []
    for table in page.extract_tables() or []:
        for row in table:
            cells = [str(cell).strip() for cell in row if cell and str(cell).strip()]
            if not cells:
                continue
            row_text = " ".join(cells)
            if DATE_PATTERN.search(row_text) and not _line_is_noise(row_text):
                blocks.append(row_text)
    return blocks


def parse_text_to_df(text):
    """
    Parses raw text into a DataFrame of transactions using text block extraction and parsing logic.
    """
    blocks = _extract_text_blocks(text)
    parsed_transactions = []
    for block in blocks:
        transaction = _parse_transaction_block(block)
        if transaction:
            parsed_transactions.append(transaction)
    
    df = pd.DataFrame(parsed_transactions).drop_duplicates()
    if df.empty and text.strip():
        df = _gemini_parse_fallback(text)
    return df

# ── Main PDF parser (returns just df) ────────────────────────────────────

def extract_rows_from_pdf(pdf_buffer):
    parsed_transactions = []
    all_raw_text = []

    with pdfplumber.open(pdf_buffer) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue
            all_raw_text.append(text)

            blocks = _extract_text_blocks(text)
            blocks.extend(_extract_table_blocks(page))

            for block in blocks:
                transaction = _parse_transaction_block(block)
                if transaction:
                    parsed_transactions.append(transaction)

    combined_text = "\n".join(all_raw_text)
    df = pd.DataFrame(parsed_transactions).drop_duplicates()

    if df.empty and combined_text.strip():
        df = _gemini_parse_fallback(combined_text)

    return df


# ── Gemini fallback ───────────────────────────────────────────────────────

def _gemini_parse_fallback(all_text):
    if not gemini_client:
        return pd.DataFrame()
    prompt = f"""
Extract all bank transactions from the following statement text.
Return ONLY a JSON array, no explanation. Each object must have exactly these keys:
  date (string), description (string), debit (number), credit (number), balance (number)
Use 0 for missing numeric fields. Example:
[{{"date":"01/04/2024","description":"UPI payment","debit":500.0,"credit":0.0,"balance":12000.0}}]

Statement text:
{all_text[:12000]}
"""
    try:
        response = gemini_client.models.generate_content(
            model="gemini-1.5-flash", contents=prompt
        )
        raw = response.text.strip()
        raw = re.sub(r'^```[a-z]*\n?', '', raw).rstrip('`').strip()
        import json
        records = json.loads(raw)
        return pd.DataFrame(records)
    except Exception:
        return pd.DataFrame()


# ── CSV column normalizer ────────────────────────────────────────────────

COLUMN_MAP = {
    "date": ("date", "txn date", "transaction date", "value date", "post date", "txn_date"),
    "description": ("description", "narration", "particulars", "transaction details", "remarks", "details", "transaction"),
    "debit": ("debit", "withdrawal", "withdraw", "dr", "debit amount", "dr amount", "wd", "debit_amt"),
    "credit": ("credit", "deposit", "cr", "credit amount", "cr amount", "deposit amount", "credit_amt"),
    "balance": ("balance", "available balance", "ledger balance", "closing balance", "bal", "curr balance"),
}

def normalize_csv_columns(df):
    mapping = {}
    for col in df.columns:
        lower = col.lower().strip()
        for standard, variants in COLUMN_MAP.items():
            if lower in variants:
                mapping[col] = standard
                break
    df = df.rename(columns=mapping)
    keep = list(mapping.values())
    return df


# ── Normalization ─────────────────────────────────────────────────────────

def self_healing_normalization(df_raw):
    df = df_raw.copy()
    df['debit_value'] = pd.to_numeric(df['debit'], errors='coerce').fillna(0.0)
    df['credit_value'] = pd.to_numeric(df['credit'], errors='coerce').fillna(0.0)
    df['balance_value'] = pd.to_numeric(df['balance'], errors='coerce').fillna(0.0)
    df['clean_description'] = df['description'].astype(str).fillna("transaction")
    df['clean_description'] = df['clean_description'].apply(
        lambda x: re.sub(r'[^a-zA-Z\s]', ' ', x.lower()).strip()
    )
    df['transaction_type'] = np.where(
        df['credit_value'] > df['debit_value'],
        "Income",
        np.where(df['debit_value'] > 0, "Expense", "Balance Update")
    )
    df['transaction_amount'] = df[['debit_value', 'credit_value']].max(axis=1)
    df['transaction_date'] = pd.to_datetime(
        df.get('date', pd.Series([pd.NaT] * len(df), index=df.index)),
        errors='coerce', dayfirst=True
    )
    return df


def fallback_category(description, transaction_type):
    text = str(description).lower()
    rules = [
        ("Salary / Income", ("salary", "payroll", "neft", "imps credit", "deposit", "interest", "refund")),
        ("Food & Dining", ("swiggy", "zomato", "restaurant", "cafe", "food", "dining")),
        ("Groceries", ("grocery", "supermarket", "mart", "bigbasket", "dmart", "blinkit")),
        ("Transport", ("uber", "ola", "metro", "fuel", "petrol", "diesel", "toll", "irctc")),
        ("Utilities", ("electricity", "water", "gas", "broadband", "mobile", "recharge", "bill")),
        ("Shopping", ("amazon", "flipkart", "myntra", "shopping", "store", "retail")),
        ("Entertainment", ("netflix", "prime", "hotstar", "spotify", "movie", "cinema")),
        ("Rent / Housing", ("rent", "maintenance", "society", "housing")),
        ("Health", ("hospital", "pharmacy", "medical", "doctor", "clinic")),
        ("Investments", ("sip", "mutual fund", "zerodha", "groww", "investment")),
        ("Transfers", ("upi", "transfer", "tfr", "imps", "neft", "rtgs")),
    ]
    for category, keywords in rules:
        if any(keyword in text for keyword in keywords):
            return category
    return "Income" if transaction_type == "Income" else "General Expense"


def enrich_transaction_categories(df):
    df = df.copy()
    if 'ai_category' not in df.columns:
        df['ai_category'] = None
    missing_category = df['ai_category'].isna() | df['ai_category'].astype(str).str.lower().isin(["", "none", "nan"])
    df.loc[missing_category, 'ai_category'] = [
        fallback_category(desc, tx_type)
        for desc, tx_type in zip(
            df.loc[missing_category, 'clean_description'],
            df.loc[missing_category, 'transaction_type'],
        )
    ]
    df.loc[df['transaction_type'] == "Income", 'ai_category'] = df.loc[
        df['transaction_type'] == "Income"
    ].apply(lambda row: fallback_category(row['clean_description'], row['transaction_type']), axis=1)
    return df


def identify_recurring_payments(df):
    expenses = df[(df['transaction_type'] == "Expense") & (df['debit_value'] > 0)].copy()
    if expenses.empty:
        return pd.DataFrame(columns=["merchant", "occurrences", "average_amount", "total_amount", "first_seen", "last_seen"])

    expenses['merchant'] = expenses['clean_description'].apply(
        lambda text: re.sub(r'\b(upi|ref|txn|payment|to|from|id|no)\b', ' ', str(text).lower())
    )
    expenses['merchant'] = expenses['merchant'].apply(lambda text: re.sub(r'\s+', ' ', text).strip()[:45] or "unknown")

    recurring = (
        expenses.groupby('merchant')
        .agg(
            occurrences=('debit_value', 'size'),
            average_amount=('debit_value', 'mean'),
            total_amount=('debit_value', 'sum'),
            first_seen=('transaction_date', 'min'),
            last_seen=('transaction_date', 'max'),
        )
        .reset_index()
    )
    recurring = recurring[recurring['occurrences'] >= 2].sort_values(
        by=['total_amount', 'occurrences'],
        ascending=False
    )
    recurring['average_amount'] = recurring['average_amount'].round(2)
    recurring['first_seen'] = recurring['first_seen'].dt.strftime('%d-%b-%Y').fillna("Unknown")
    recurring['last_seen'] = recurring['last_seen'].dt.strftime('%d-%b-%Y').fillna("Unknown")
    return recurring


def compute_financial_health(df):
    total_income = df['credit_value'].sum()
    total_expense = df['debit_value'].sum()
    net_savings = total_income - total_expense
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0.0
    expense_ratio = (total_expense / total_income * 100) if total_income > 0 else 0.0
    largest_expense = df['debit_value'].max() if not df.empty else 0.0
    avg_expense = df.loc[df['debit_value'] > 0, 'debit_value'].mean()
    avg_expense = 0.0 if pd.isna(avg_expense) else avg_expense
    income_count = int((df['credit_value'] > 0).sum())
    expense_count = int((df['debit_value'] > 0).sum())

    if savings_rate >= 25:
        health_label = "Strong"
    elif savings_rate >= 10:
        health_label = "Stable"
    elif savings_rate >= 0:
        health_label = "Watch"
    else:
        health_label = "Critical"

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_savings": net_savings,
        "savings_rate": savings_rate,
        "expense_ratio": expense_ratio,
        "largest_expense": largest_expense,
        "avg_expense": avg_expense,
        "income_count": income_count,
        "expense_count": expense_count,
        "health_label": health_label,
    }


def local_recommendations(health, category_expense, recurring):
    recommendations = []
    if health["net_savings"] < 0:
        recommendations.append("Expenses exceed income. Prioritize reducing discretionary spending until cash flow turns positive.")
    elif health["savings_rate"] < 10:
        recommendations.append("Savings rate is below 10%. Move a fixed amount to savings immediately after each income credit.")
    else:
        recommendations.append("Savings are positive. Keep recurring obligations visible and protect the current surplus.")

    if not category_expense.empty:
        top_category = category_expense.iloc[0]
        recommendations.append(
            f"Highest expense category is {top_category['ai_category']} at INR {top_category['debit_value']:,.2f}; review the largest transactions there first."
        )

    if not recurring.empty:
        recommendations.append(
            f"{len(recurring)} recurring payment pattern(s) were detected. Audit them for unused subscriptions or duplicate transfers."
        )

    recommendations.append("Maintain an emergency buffer of at least 3 months of average expenses before increasing discretionary purchases.")
    return recommendations


# ── Chart data preparation (from app.py) ────────────────────────────────

def prepare_expense_pie_data(df):
    expense_df = df[df["debit_value"] > 0].copy()
    if expense_df.empty:
        return []
    pie_data = (
        expense_df.groupby("ai_category", as_index=False)["debit_value"]
        .sum()
        .sort_values(by="debit_value", ascending=False)
    )
    return pie_data.to_dict(orient="records")


def prepare_balance_timeline(df):
    df_sorted = df.sort_values("transaction_date").reset_index(drop=True)
    timeline = df_sorted[["transaction_date", "balance_value"]].copy()
    timeline["transaction_date"] = timeline["transaction_date"].dt.strftime("%d-%b-%Y")
    return timeline.to_dict(orient="records")


def compute_diagnostic_metrics(df):
    total_income = float(df["credit_value"].sum())
    total_expense = float(df["debit_value"].sum())
    net_savings = total_income - total_expense

    calc_risk = 5.0
    fraud_alerts = []
    large_spikes = df[df["debit_value"] > 15000]
    if not large_spikes.empty:
        calc_risk += 35.0
        for _, r in large_spikes.iterrows():
            fraud_alerts.append(
                f"Large outflow of Rs. {r['debit_value']:,.0f} detected."
            )
    fraud_prob = min(calc_risk, 100.0)

    loan_ratio = 0.0  # not derivable without metadata
    simulated_credit = 750 + int((net_savings / total_income * 50)) if total_income > 0 else 680
    simulated_credit = max(min(simulated_credit, 850), 300)
    health_score = int(((simulated_credit - 300) / 550) * 100)

    return {
        "health_score": health_score,
        "credit_score": simulated_credit,
        "fraud_probability": round(fraud_prob, 1),
        "fraud_alerts": fraud_alerts,
        "loan_burden_ratio": round(loan_ratio, 1),
    }

