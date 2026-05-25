import json

import pandas as pd


def to_json_safe(data: dict) -> dict:
    """Convert a dict to a JSON-safe dict, handling Timestamps and other non-serializable types."""
    return json.loads(json.dumps(data, default=str))


def encode_summary(data: dict) -> dict:
    """Alias for to_json_safe — prepares analysis data for DB storage."""
    return to_json_safe(data)
