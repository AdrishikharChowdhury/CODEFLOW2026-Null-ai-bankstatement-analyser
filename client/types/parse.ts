import type {
  Transaction,
  HealthScore,
  CategoryExpense,
  IncomeSummary,
  RecurringPayment,
} from "./analysis";

export interface ParseRequest {
  storage_path: string;
  file_name: string;
  file_type: "pdf" | "csv";
}

export interface ParseResponse {
  success: boolean;
  transactions?: Transaction[] | null;
  health_score?: HealthScore | null;
  category_expense?: CategoryExpense[] | null;
  income_summary?: IncomeSummary[] | null;
  recurring_payments?: RecurringPayment[] | null;
  recommendations?: string[] | null;
  csv_path?: string | null;
  json_path?: string | null;
  story?: string | null;
  error?: string | null;
}
