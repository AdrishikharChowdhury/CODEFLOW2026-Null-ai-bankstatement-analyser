"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_CHAT_API_KEY,
});

function buildSummary(ctx: any): string {
  const hs = ctx.health_score || {};
  const txnCount = ctx.transactions?.length || 0;

  const topCategories = (ctx.category_expense || [])
    .sort((a: any, b: any) => (b.debit_value || 0) - (a.debit_value || 0))
    .slice(0, 5)
    .map((c: any) => `${c.ai_category} (₹${(c.debit_value || 0).toLocaleString("en-IN")})`)
    .join(", ");

  const topRecurring = (ctx.recurring_payments || [])
    .sort((a: any, b: any) => (b.total_amount || 0) - (a.total_amount || 0))
    .slice(0, 5)
    .map((r: any) => `${r.merchant} (₹${(r.total_amount || 0).toLocaleString("en-IN")})`)
    .join(", ");

  const fraudCount = ctx.fraud_alerts?.length || 0;

  return [
    `- ${txnCount} transactions totaling ₹${(hs.total_income || 0).toLocaleString("en-IN")} income and ₹${(hs.total_expense || 0).toLocaleString("en-IN")} expenses`,
    `- Savings rate: ${(hs.savings_rate || 0).toFixed(1)}% (${hs.health_label || "N/A"})`,
    topCategories ? `- Top expense categories: ${topCategories}` : "",
    topRecurring ? `- Top recurring payments: ${topRecurring}` : "",
    fraudCount > 0 ? `- ${fraudCount} fraud alert(s) detected` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendChatMessage(messages: { role: string; content: string }[], statementContext?: any) {
  try {
    let systemPrompt = "You are Financialo AI, a helpful assistant specializing in bank statement analysis.\n\n";

    if (statementContext) {
      systemPrompt += `Current bank statement:\n${buildSummary(statementContext)}\n\nAlways format your response in clean markdown — use **bold** for key figures, - for bullet lists, and 1. for numbered lists. Be concise and insightful. If you don't know something, say so.`;
    } else {
      systemPrompt += "The user hasn't selected a statement. Help them understand how to upload and analyze statements using Financialo.";
    }

    const recentMessages = messages.slice(-20).map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...recentMessages,
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
    });

    return { content: chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request." };
  } catch (error) {
    console.error("Groq API Error:", error);
    return { error: "Failed to get response from AI." };
  }
}
