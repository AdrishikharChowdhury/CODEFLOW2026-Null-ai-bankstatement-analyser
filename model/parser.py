import re
import pandas as pd
import numpy as np


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
