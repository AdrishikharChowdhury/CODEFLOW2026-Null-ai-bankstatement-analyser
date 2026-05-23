import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from google import genai
from dotenv import load_dotenv
import pdfplumber
import torch
import re
import os
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r"C:\Users\ARJUN MITRA\.conda\envs\finguard\Library\bin\tesseract.exe"

# SetFit 1.0.3 imports DatasetFilter, which was removed from newer
# huggingface_hub releases required by current Transformers versions.
import huggingface_hub

if not hasattr(huggingface_hub, "DatasetFilter"):
    class DatasetFilter:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)

    huggingface_hub.DatasetFilter = DatasetFilter

from setfit import SetFitModel

st.set_page_config(page_title="Financialo Statement Analyzer", layout="wide")

# --- 1. LOAD FINE-TUNED AI ASSETS ---
@st.cache_resource
def load_custom_brain():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    try:
        # Seamlessly hooks into the local directory containing your fine-tuned weights
        model = SetFitModel.from_pretrained("./fine_tuned_agami_transformer")
        model.to(device)
        status = "🔥 Fine-Tuned Neural Engine Active"
    except Exception as e:
        model = None
        status = f"⚠️ Fallback Engine Triggered (Error: {str(e)})"
    return model, device, status

ai_model, compute_device, model_status = load_custom_brain()

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    st.error("Missing GEMINI_API_KEY. Add it to your .env file.")
    st.stop()

gemini_client = genai.Client(api_key=gemini_api_key)

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


def _line_is_noise(line):
    clean = line.replace("|", " ").strip()
    lower = clean.lower()
    if not clean or not re.search(r'[A-Za-z0-9]', clean):
        return True
    # Always keep lines that have a date AND an amount — definite transaction row
    if DATE_PATTERN.search(clean) and AMOUNT_PATTERN.search(clean):
        return False
    # Keep lines that start with a date even without an amount (multiline narration start)
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


OCR_LANG = "eng+hin+tam+tel+ben+mar+guj+kan+mal+pan+ori+urd"
POPPLER_PATH = r"C:\Users\ARJUN MITRA\.conda\envs\finguard\Library\bin"


def _ocr_pdf_bytes(pdf_bytes):
    """Convert scanned PDF pages to text via Tesseract OCR."""
    images = convert_from_bytes(pdf_bytes, dpi=300, poppler_path=POPPLER_PATH)
    return [pytesseract.image_to_string(img, lang=OCR_LANG, config="--psm 6") for img in images]


def extract_rows_from_image(image_file):
    """Run OCR on a single uploaded image and parse transactions from it."""
    img = Image.open(image_file).convert("RGB")
    text = pytesseract.image_to_string(img, lang=OCR_LANG, config="--psm 6")

    with st.expander("🔍 Debug: Raw OCR text (first 3000 chars)", expanded=False):
        st.text(text[:3000] if text else "[No text extracted]")

    blocks = _extract_text_blocks(text)
    parsed = [_parse_transaction_block(b) for b in blocks]
    parsed = [t for t in parsed if t]
    df = pd.DataFrame(parsed).drop_duplicates() if parsed else pd.DataFrame()

    if df.empty and text.strip():
        st.info("Regex parser found no transactions — trying Gemini AI parser...")
        df = _gemini_parse_fallback(text)

    return df


def _gemini_parse_fallback(all_text):
    """Use Gemini to extract transactions when regex parser finds nothing."""
    prompt = f"""
Extract all bank transactions from the following statement text.
Return ONLY a CSV file, no explanation. Each object must have exactly these keys:
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
        # Strip markdown code fences if present
        raw = re.sub(r'^```[a-z]*\n?', '', raw).rstrip('`').strip()
        import json
        records = json.loads(raw)
        return pd.DataFrame(records)
    except Exception as e:
        st.warning(f"Gemini fallback parser also failed: {e}")
        return pd.DataFrame()


# --- 2. THE PRODUCTION-GRADE STRUCTURAL PDF PARSER ---
def extract_rows_from_pdf(pdf_buffer):
    parsed_transactions = []
    all_raw_text = []
    pdf_bytes = pdf_buffer.read()
    pdf_buffer.seek(0)

    with pdfplumber.open(pdf_buffer) as pdf:
        page_texts = []
        for page in pdf.pages:
            text = page.extract_text()
            page_texts.append((page, text))

        # Detect if PDF is scanned (no extractable text on any page)
        all_empty = all(not t for _, t in page_texts)
        if all_empty:
            st.info("Scanned PDF detected — running OCR engine...")
            try:
                ocr_texts = _ocr_pdf_bytes(pdf_bytes)
            except Exception as ocr_err:
                st.warning(f"OCR failed: {ocr_err}. Install Tesseract and poppler and ensure they are on PATH.")
                ocr_texts = ["" for _ in page_texts]
        else:
            ocr_texts = [None] * len(page_texts)

        for i, (page, native_text) in enumerate(page_texts):
            text = native_text if native_text else (ocr_texts[i] or "")
            if text:
                all_raw_text.append(text)
            blocks = []
            if text:
                blocks.extend(_extract_text_blocks(text))
            if native_text:
                blocks.extend(_extract_table_blocks(page))

            for block in blocks:
                transaction = _parse_transaction_block(block)
                if transaction:
                    parsed_transactions.append(transaction)

    combined_text = "\n".join(all_raw_text)

    # Show debug expander so user can see what was extracted
    with st.expander("🔍 Debug: Raw extracted text (first 3000 chars)", expanded=False):
        st.text(combined_text[:3000] if combined_text else "[No text extracted]")

    df = pd.DataFrame(parsed_transactions).drop_duplicates()

    # If regex parser found nothing, fall back to Gemini
    if df.empty and combined_text.strip():
        st.info("Regex parser found no transactions — trying Gemini AI parser...")
        df = _gemini_parse_fallback(combined_text)

    return df

# --- 3. UNIVERSAL LABELED NORMALIZATION LAYER ---
def self_healing_normalization(df_raw):
    df = df_raw.copy()
    df.columns = [str(col).strip().lower() for col in df.columns]

    rename_map = {
        "narration": "description",
        "particulars": "description",
        "transaction remarks": "description",
        "withdrawal": "debit",
        "amount (dr.)": "debit",
        "dr": "debit",
        "deposit": "credit",
        "amount (cr.)": "credit",
        "cr": "credit",
        "closing balance": "balance",
        "bal": "balance",
    }
    df = df.rename(columns={key: value for key, value in rename_map.items() if key in df.columns})

    def column_or_default(name, default):
        if name in df.columns:
            return df[name]
        return pd.Series([default] * len(df), index=df.index)

    def numeric_column(name):
        values = column_or_default(name, 0.0).astype(str).str.replace(r'[^\d.-]', '', regex=True)
        return pd.to_numeric(values, errors='coerce').fillna(0.0)
    
    # Map calculated numerical primitives directly to internal variables
    df['debit_value'] = numeric_column('debit')
    df['credit_value'] = numeric_column('credit')
    df['balance_value'] = numeric_column('balance')
    df['clean_description'] = column_or_default('description', "transaction").astype(str).fillna("transaction")
    df['transaction_date'] = pd.to_datetime(column_or_default('date', pd.NaT), errors='coerce', dayfirst=True)
    
    # Translate non-English descriptions to English via Gemini
    def translate_if_needed(text):
        if re.search(r'[^\x00-\x7F]', text):  # contains non-ASCII (e.g. Hindi, Tamil, etc.)
            try:
                resp = gemini_client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=f"Translate this bank transaction description to English. Return only the translated text, nothing else: {text}",
                )
                return resp.text.strip()
            except Exception:
                pass
        return text

    df['clean_description'] = df['clean_description'].apply(translate_if_needed)

    # Process text layout boundaries into clean vector configurations for SetFit NLP execution
    df['clean_description'] = df['clean_description'].apply(
        lambda x: re.sub(r'[^a-zA-Z\s]', ' ', x.lower()).replace('wdl', '').replace('tfr', '').strip()
    )
    df['transaction_type'] = np.where(
        df['credit_value'] > df['debit_value'],
        "Income",
        np.where(df['debit_value'] > 0, "Expense", "Balance Update")
    )
    df['transaction_amount'] = df[['debit_value', 'credit_value']].max(axis=1)
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


def generate_ai_financial_summary(df, health, category_expense, recurring):
    top_categories = category_expense.head(5).to_dict(orient="records")
    recurring_items = recurring.head(5).to_dict(orient="records")
    prompt = f"""
    You are Financialo. Produce a concise financial summary and actionable recommendations.
    Use only the supplied statement analytics.

    Income: INR {health['total_income']:,.2f}
    Expenses: INR {health['total_expense']:,.2f}
    Net savings: INR {health['net_savings']:,.2f}
    Savings rate: {health['savings_rate']:.1f}%
    Health label: {health['health_label']}
    Top expense categories: {top_categories}
    Recurring payments: {recurring_items}

    Return:
    1. One paragraph summary
    2. Three practical recommendations
    3. One risk to watch
    """
    try:
        response = gemini_client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
        )
        return response.text
    except Exception as exc:
        recs = local_recommendations(health, category_expense, recurring)
        return "AI summary could not be generated, so here is a local analysis:\n\n" + "\n".join(
            f"- {rec}" for rec in recs
        ) + f"\n\nTechnical detail: {exc}"

# --- 4. CONVERSATIONAL RAG CHAT ENGINE ---
def chat_with_ledger_context(df, prompt):
    total_in = df['credit_value'].sum()
    total_out = df['debit_value'].sum()
    savings = total_in - total_out
    
    top_rows = df.sort_values(by='debit_value', ascending=False).head(3)
    expense_feed = "".join([f"- {r['clean_description']}: ₹{r['debit_value']}\n" for _, r in top_rows.iterrows()])

    master_prompt = f"""
    You are a professional financial analytics bot aligned with UN SDG 8. Analyze this bank statement summary snapshot:
    - Total Earned/Inflows: ₹{total_in:,.2f}
    - Total Spent/Outflows: ₹{total_out:,.2f}
    - Net Savings Balance: ₹{savings:,.2f}
    - Top Spending Spikes:\n{expense_feed}
    
    Answer the user's question accurately using only this data as your source of truth.
    Question: {prompt}
    """
    response = gemini_client.models.generate_content(
        model="gemini-2.0-flash",
        contents=master_prompt,
    )
    return response.text

# --- 5. UI APP LAYOUT ---
st.title("Financialo: Smart Bank Statement Analyzer")
st.sidebar.markdown(f"`{model_status}`")
st.sidebar.markdown(f"`Device Target: {compute_device.upper()}`")

uploaded_file = st.sidebar.file_uploader("Upload Bank Statement (PDF or CSV)", type=["pdf", "csv"])
image_file = st.sidebar.file_uploader("Upload Scanned Statement Image (JPG/PNG)", type=["jpg", "jpeg", "png"])

if image_file is not None:
    st.sidebar.image(image_file, caption="Uploaded Image", use_container_width=True)
    with st.spinner("Running OCR on image..."):
        try:
            raw_df = extract_rows_from_image(image_file)
        except Exception as e:
            st.error(f"OCR failed: {e}. Ensure Tesseract is installed and on PATH.")
            st.stop()
elif uploaded_file is not None:
    if uploaded_file.name.endswith('.pdf'):
        raw_df = extract_rows_from_pdf(uploaded_file)
    else:
        raw_df = pd.read_csv(uploaded_file)
else:
    raw_df = None

if raw_df is not None:

    if raw_df.empty:
        st.error("Could not parse structure. Make sure it is a clear text-based ledger document.")
        st.stop()
        
    processed_df = self_healing_normalization(raw_df)

    # Classify descriptions using your local custom-tuned weights
    if ai_model is not None:
        processed_df['ai_category'] = ai_model.predict(processed_df['clean_description'].tolist())
    else:
        processed_df['ai_category'] = None
    processed_df['ai_category'] = processed_df['ai_category'].astype(str)
    processed_df = enrich_transaction_categories(processed_df)

    health = compute_financial_health(processed_df)
    category_expense = (
        processed_df[processed_df['transaction_type'] == "Expense"]
        .groupby('ai_category', as_index=False)['debit_value']
        .sum()
        .sort_values(by='debit_value', ascending=False)
    )
    income_summary = (
        processed_df[processed_df['transaction_type'] == "Income"]
        .groupby('ai_category', as_index=False)['credit_value']
        .sum()
        .sort_values(by='credit_value', ascending=False)
    )
    recurring_df = identify_recurring_payments(processed_df)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Income", f"INR {health['total_income']:,.2f}")
    c2.metric("Total Expenses", f"INR {health['total_expense']:,.2f}")
    c3.metric("Net Savings", f"INR {health['net_savings']:,.2f}")
    c4.metric("Savings Rate", f"{health['savings_rate']:.1f}%")

    h1, h2, h3, h4 = st.columns(4)
    h1.metric("Financial Health", health['health_label'])
    h2.metric("Expense Ratio", f"{health['expense_ratio']:.1f}%")
    h3.metric("Largest Expense", f"INR {health['largest_expense']:,.2f}")
    h4.metric("Avg Expense Txn", f"INR {health['avg_expense']:,.2f}")

    st.markdown("---")

    g1, g2 = st.columns(2)
    with g1:
        st.subheader("Category-wise Expense Breakdown")
        if category_expense.empty:
            st.info("No expense transactions were detected.")
        else:
            st.plotly_chart(
                px.pie(category_expense, values='debit_value', names='ai_category', hole=0.3),
                use_container_width=True
            )
    with g2:
        st.subheader("Account Balance Trend")
        chart_df = processed_df.copy()
        if chart_df['transaction_date'].notna().any():
            chart_df = chart_df.sort_values('transaction_date')
            x_axis = 'transaction_date'
        else:
            chart_df = chart_df.reset_index()
            x_axis = 'index'
        st.plotly_chart(
            px.line(chart_df, x=x_axis, y='balance_value', labels={'balance_value': 'Balance (INR)'}),
            use_container_width=True
        )

    st.markdown("---")

    t1, t2 = st.columns(2)
    with t1:
        st.subheader("Income vs Expense Summary")
        summary_df = pd.DataFrame([
            {"type": "Income", "amount": health['total_income'], "transactions": health['income_count']},
            {"type": "Expense", "amount": health['total_expense'], "transactions": health['expense_count']},
            {"type": "Net Savings", "amount": health['net_savings'], "transactions": ""},
        ])
        st.plotly_chart(
            px.bar(summary_df.head(2), x='type', y='amount', color='type', text='amount'),
            use_container_width=True
        )
        st.dataframe(summary_df, use_container_width=True, hide_index=True)
    with t2:
        st.subheader("Income Sources")
        if income_summary.empty:
            st.info("No income credits were detected.")
        else:
            st.dataframe(income_summary, use_container_width=True, hide_index=True)

    st.markdown("---")

    r1, r2 = st.columns(2)
    with r1:
        st.subheader("Recurring Payment Identification")
        if recurring_df.empty:
            st.info("No recurring payment patterns detected yet.")
        else:
            st.dataframe(recurring_df, use_container_width=True, hide_index=True)
    with r2:
        st.subheader("Financial Health Indicators")
        indicators_df = pd.DataFrame([
            {"indicator": "Health label", "value": health['health_label']},
            {"indicator": "Savings rate", "value": f"{health['savings_rate']:.1f}%"},
            {"indicator": "Expense ratio", "value": f"{health['expense_ratio']:.1f}%"},
            {"indicator": "Largest expense", "value": f"INR {health['largest_expense']:,.2f}"},
            {"indicator": "Average expense transaction", "value": f"INR {health['avg_expense']:,.2f}"},
        ])
        st.dataframe(indicators_df, use_container_width=True, hide_index=True)

    st.markdown("---")

    st.subheader("Transaction Categorization")
    display_cols = [
        "date",
        "description",
        "transaction_type",
        "ai_category",
        "debit_value",
        "credit_value",
        "balance_value",
    ]
    existing_display_cols = [col for col in display_cols if col in processed_df.columns]
    st.dataframe(processed_df[existing_display_cols], use_container_width=True, hide_index=True)

    st.markdown("---")

    st.subheader("AI-generated Recommendations and Summary")
    if st.button("Generate Financial Summary", type="primary"):
        with st.spinner("Generating financial recommendations..."):
            st.markdown(generate_ai_financial_summary(processed_df, health, category_expense, recurring_df))
    else:
        for recommendation in local_recommendations(health, category_expense, recurring_df):
            st.write(f"- {recommendation}")

    st.markdown("---")
    st.subheader("Chat with Your Bank Statement")
    user_query = st.text_input("Ask a question about your financial log entries:")
    if user_query:
        with st.spinner("AI reading ledger data points..."):
            st.chat_message("assistant").write(chat_with_ledger_context(processed_df, user_query))

    st.stop()
    
    # Classify descriptions using your local custom-tuned weights
    if ai_model is not None:
        processed_df['ai_category'] = ai_model.predict(processed_df['clean_description'].tolist())
    else:
        processed_df['ai_category'] = "General Expenditure"

    # Financial Scoreboard Displays
    t_in, t_out = processed_df['credit_value'].sum(), processed_df['debit_value'].sum()
    c1, c2, c3 = st.columns(3)
    c1.metric(" Total Inflows", f"₹{t_in:,.2f}")
    c2.metric(" Total Outflows", f"₹{t_out:,.2f}")
    c3.metric(" Period Net Savings", f"₹{t_in - t_out:,.2f}")
    
    st.markdown("---")
    
    # Dashboard Grid
    g1, g2 = st.columns(2)
    with g1:
        st.subheader("Expense Distribution (By Your Fine-Tuned AI)")
        pie_data = processed_df.groupby('ai_category')['debit_value'].sum().reset_index()
        st.plotly_chart(px.pie(pie_data, values='debit_value', names='ai_category', hole=0.3), use_container_width=True)
    with g2:
        st.subheader(" Account Balance Trajectory Velocity")
        st.plotly_chart(px.line(processed_df, y='balance_value', labels={'balance_value': 'Balance (₹)'}), use_container_width=True)
        
    # Chat Gateway Interface
    st.markdown("---")
    st.subheader(" Chat with Your Bank Statement")
    user_query = st.text_input("Ask a question about your financial log entries:")
    if user_query:
        with st.spinner(" AI reading ledger data points..."):
            st.chat_message("assistant").write(chat_with_ledger_context(processed_df, user_query))
else:
    st.info("Upload a bank statement (PDF or CSV) or a scanned image to begin analysis.")