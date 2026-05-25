export interface Transaction {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  debit_value?: number;
  credit_value?: number;
  balance_value?: number;
  clean_description?: string;
  transaction_type?: "Income" | "Expense" | "Balance Update";
  transaction_amount?: number;
  transaction_date?: string;
  ai_category?: string;
}

export interface HealthScore {
  total_income: number;
  total_expense: number;
  net_savings: number;
  savings_rate: number;
  expense_ratio: number;
  largest_expense: number;
  avg_expense: number;
  income_count: number;
  expense_count: number;
  health_label: "Strong" | "Stable" | "Watch" | "Critical";
}

export interface CategoryExpense {
  ai_category: string;
  debit_value: number;
}

export interface IncomeSummary {
  ai_category: string;
  credit_value: number;
}

export interface RecurringPayment {
  merchant: string;
  occurrences: number;
  average_amount: number;
  total_amount: number;
  first_seen: string;
  last_seen: string;
}

export interface SummaryData {
  success: boolean;
  transactions: Transaction[];
  health_score: HealthScore;
  category_expense: CategoryExpense[];
  income_summary: IncomeSummary[];
  recurring_payments: RecurringPayment[];
  recommendations: string[];
  story?: string;
  ai_advice?: string;
  fraud_detection?: string;
}
