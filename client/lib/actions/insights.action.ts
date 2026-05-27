"use server";

import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import type { SummaryData, Transaction } from "@/types";
import { getPostHogClient } from "@/lib/posthog-server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateStory = async (summaryData: SummaryData) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User Not Found");

  const fraudAlerts = detectSuspicious(summaryData.transactions);

  const analyticsContext = {
    health_score: summaryData.health_score,
    category_expense: summaryData.category_expense,
    recurring_payments: summaryData.recurring_payments,
    fraud_alerts: fraudAlerts,
    transaction_count: summaryData.transactions.length,
  };

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `You are a financial storyteller who turns raw transaction data into a short, human-readable narrative.

Given the following bank statement analysis in JSON format, write a brief financial story (3-5 paragraphs) that:

1. Lead with the most notable change or pattern.
2. If fraud alerts exist, make them the FIRST thing mentioned.
3. Call out behavioral spending shifts (e.g., late-night, weekends, category spikes).
4. List detected recurring subscriptions.
5. Compare savings trajectory (current vs. estimated historical).
6. Give one clear, actionable suggestion.
7. End with a forward-looking prediction (balance forecast).

Tone: Conversational, empathetic, direct. No jargon. No dashboards. Make it feel like a friend giving financial advice.

Use clean markdown formatting — **bold** for key figures and - or 1. for lists where appropriate. Return ONLY the narrative text, no preamble.`,
      },
      {
        role: "user",
        content: JSON.stringify(analyticsContext, null, 2),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Groq");

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "ai_advice_generated",
    properties: {
      transaction_count: summaryData.transactions.length,
      health_label: summaryData.health_score?.health_label ?? null,
      fraud_alert_count: fraudAlerts.length,
    },
  });

  if (fraudAlerts.length > 0) {
    posthog.capture({
      distinctId: userId,
      event: "fraud_alert_detected",
      properties: {
        alert_count: fraudAlerts.length,
        health_label: summaryData.health_score?.health_label ?? null,
      },
    });
  }

  return {
    story: content,
    fraud_alerts: fraudAlerts,
  };
};

function detectSuspicious(transactions: Transaction[]) {
  const groups = new Map<string, { count: number; total: number }>();

  for (const t of transactions) {
    const amt = t.debit ?? t.debit_value ?? 0;
    if (amt < 65000 || amt > 80000) continue;

    const merchant = (t.clean_description ?? t.description ?? "")
      .toLowerCase()
      .replace(/\b(upi|ref|txn|id|no|payment)\b/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 45);

    if (!merchant) continue;

    const existing = groups.get(merchant) ?? { count: 0, total: 0 };
    existing.count++;
    existing.total += amt;
    groups.set(merchant, existing);
  }

  const alerts: string[] = [];
  for (const [merchant, data] of groups) {
    if (data.count >= 2) {
      alerts.push(
        `Suspicious activity: ${data.count} transactions of ₹65K–80K to '${merchant}' totalling ₹${data.total.toLocaleString()}. Review immediately for potential fraud.`
      );
    }
  }
  return alerts;
}
