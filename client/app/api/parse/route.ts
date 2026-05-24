import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPostHogClient } from "@/lib/posthog-server";
import type { ParseRequest } from "@/types";
type ParseBody = ParseRequest;
export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  const posthog = getPostHogClient();
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
      const errorDetail = errorBody.detail || `FastAPI returned ${fastapiRes.status}`;
      if (userId) {
        posthog.capture({
          distinctId: userId,
          event: "statement_parse_failed",
          properties: {
            file_type: body.file_type,
            status: fastapiRes.status,
            error: errorDetail,
          },
        });
      }
      return NextResponse.json(
        {
          message: "Parsing failed",
          error: errorDetail,
        },
        { status: fastapiRes.status },
      );
    }
    const data = await fastapiRes.json();
    if (userId) {
      posthog.capture({
        distinctId: userId,
        event: "statement_parsed",
        properties: {
          file_type: body.file_type,
          transaction_count: (data.transactions ?? []).length,
          health_label: data.health_score?.health_label ?? null,
          category_count: (data.category_expense ?? []).length,
          recurring_payment_count: (data.recurring_payments ?? []).length,
        },
      });
    }
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
    if (userId) {
      posthog.captureException(error, userId);
    }
    return NextResponse.json(
      {
        message: "Parse request failed",
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}