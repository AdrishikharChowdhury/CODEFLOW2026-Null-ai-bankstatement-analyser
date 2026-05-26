import json
import pandas as pd
import numpy as np
import torch

import huggingface_hub
if not hasattr(huggingface_hub, "DatasetFilter"):
    class DatasetFilter:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)
    huggingface_hub.DatasetFilter = DatasetFilter

from setfit import SetFitModel

from util import to_json_safe

from parser import (
    normalize_csv_columns,
    self_healing_normalization,
    compute_financial_health,
    enrich_transaction_categories,
    identify_recurring_payments,
    local_recommendations,
)

_model = None
_device = None

def _load_model():
    global _model, _device
    if _model is not None:
        return _model
    _device = "cuda" if torch.cuda.is_available() else "cpu"
    try:
        _model = SetFitModel.from_pretrained("./fine_tuned_agami_transformer")
        _model.to(_device)
    except Exception:
        _model = None
    return _model


def analyze_csv(csv_path: str) -> dict:
    df = pd.read_csv(csv_path)
    df = normalize_csv_columns(df)

    processed_df = self_healing_normalization(df)

    model = _load_model()
    if model is not None:
        processed_df["ai_category"] = model.predict(
            processed_df["clean_description"].tolist()
        )
    else:
        processed_df["ai_category"] = None
    processed_df["ai_category"] = processed_df["ai_category"].astype(str)
    processed_df = enrich_transaction_categories(processed_df)

    health = compute_financial_health(processed_df)

    category_expense = (
        processed_df[processed_df["transaction_type"] == "Expense"]
        .groupby("ai_category", as_index=False)["debit_value"]
        .sum()
        .sort_values(by="debit_value", ascending=False)
    )
    income_summary = (
        processed_df[processed_df["transaction_type"] == "Income"]
        .groupby("ai_category", as_index=False)["credit_value"]
        .sum()
        .sort_values(by="credit_value", ascending=False)
    )

    recurring_df = identify_recurring_payments(processed_df)

    recommendations = local_recommendations(health, category_expense, recurring_df)

    result = to_json_safe({
        "success": True,
        "transactions": processed_df.fillna(0).to_dict(orient="records"),
        "health_score": health,
        "category_expense": category_expense.to_dict(orient="records"),
        "income_summary": income_summary.to_dict(orient="records"),
        "recurring_payments": recurring_df.to_dict(orient="records"),
        "recommendations": recommendations,
    })

    json_path = csv_path.rsplit(".", 1)[0] + ".json"
    with open(json_path, "w") as f:
        json.dump(result, f, indent=2)

    return result
