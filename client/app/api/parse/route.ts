import { NextRequest, NextResponse } from "next/server";
type ParseBody = {
  storage_path: string;
  file_name: string;
  file_type: string;
};
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: ParseBody = await req.json();
    // Validate required fields
    if (!body.storage_path || !body.file_name || !body.file_type) {
      return NextResponse.json(
        { message: "Missing required fields: storage_path, file_name, file_type" },
        { status: 400 },
      );
    }
    if (!["pdf", "csv"].includes(body.file_type)) {
      return NextResponse.json(
        { message: "Invalid file_type. Must be 'pdf' or 'csv'" },
        { status: 400 },
      );
    }
    // Forward to FastAPI
    const fastapiRes = await fetch("http://localhost:8000/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!fastapiRes.ok) {
      const errorBody = await fastapiRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          message: "Parsing failed",
          error: errorBody.detail || `FastAPI returned ${fastapiRes.status}`,
        },
        { status: fastapiRes.status },
      );
    }
    const data = await fastapiRes.json();
    return NextResponse.json(
      {
        message: "Statement parsed successfully",
        success: data.success,
        transactions: data.transactions ?? [],
        health_score: data.health_score ?? null,
        category_expense: data.category_expense ?? [],
        income_summary: data.income_summary ?? [],
        recurring_payments: data.recurring_payments ?? [],
        recommendations: data.recommendations ?? [],
        csv_path: data.csv_path ?? null,
        json_path: data.json_path ?? null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Parse request failed",
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}