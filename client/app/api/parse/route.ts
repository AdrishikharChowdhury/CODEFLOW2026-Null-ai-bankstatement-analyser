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

    const modelUrl = process.env.NEXT_PUBLIC_MODEL_SERVICE_URL;
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    if (!modelUrl || !serverUrl) {
      return NextResponse.json(
        { message: "Parsing failed", error: "Service URLs not configured" },
        { status: 500 },
      );
    }

    // CSV → call model service directly (bypass FastAPI)
    // PDF  → call FastAPI (pre-processing needed)
    const targetUrl =
      body.file_type === "csv"
        ? `${modelUrl}/predict`
        : `${serverUrl}/api/parse`;

    console.log("[parse] file_type:", body.file_type, "targetUrl:", targetUrl);

    const payload =
      body.file_type === "csv"
        ? {
            storage_path: body.storage_path,
            file_name: body.file_name,
            file_type: body.file_type,
            csv_url: "",
          }
        : body;

    const fastapiRes = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("[parse] downstream status:", fastapiRes.status, "ok:", fastapiRes.ok);
    if (!fastapiRes.ok) {
      let errorBody: Record<string, unknown> = {};
      try {
        errorBody = await fastapiRes.json();
      } catch {
        const text = await fastapiRes.text().catch(() => "");
        console.log("[parse] non-json response body:", text.slice(0, 500));
      }
      const errorDetail = (errorBody?.detail as string) || `Service returned ${fastapiRes.status}`;
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
    let data: Record<string, unknown> = {};
    try {
      data = await fastapiRes.json();
    } catch {
      const text = await fastapiRes.text().catch(() => "");
      console.log("[parse] success body not json:", text.slice(0, 500));
      return NextResponse.json(
        { message: "Parsing failed", error: "Response was not valid JSON" },
        { status: 502 },
      );
    }
    const d = data as {
      success?: boolean;
      transactions?: unknown[];
      health_score?: { health_label?: string };
      category_expense?: unknown[];
      recurring_payments?: unknown[];
      recommendations?: unknown[];
      csv_path?: string | null;
      json_path?: string | null;
    };
    console.log("[parse] downstream success:", !!d.success);
    if (!d.success) {
      const modelErr = (data as { error?: string }).error || "Model analysis failed";
      console.log("[parse] model error:", modelErr);
      return NextResponse.json(
        { message: "Parsing failed", error: modelErr },
        { status: 200 },
      );
    }
    if (userId) {
      posthog.capture({
        distinctId: userId,
        event: "statement_parsed",
        properties: {
          file_type: body.file_type,
          transaction_count: (d.transactions ?? []).length,
          health_label: d.health_score?.health_label ?? null,
          category_count: (d.category_expense ?? []).length,
          recurring_payment_count: (d.recurring_payments ?? []).length,
        },
      });
    }
    return NextResponse.json(
      {
        message: "Statement parsed successfully",
        success: d.success,
        transactions: d.transactions ?? [],
        health_score: d.health_score ?? null,
        category_expense: d.category_expense ?? [],
        income_summary: (data as { income_summary?: unknown[] }).income_summary ?? [],
        recurring_payments: d.recurring_payments ?? [],
        recommendations: d.recommendations ?? [],
        csv_path: d.csv_path ?? null,
        json_path: d.json_path ?? null,
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
