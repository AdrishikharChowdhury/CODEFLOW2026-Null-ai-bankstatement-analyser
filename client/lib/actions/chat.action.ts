"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_CHAT_API_KEY,
});

export async function sendChatMessage(messages: { role: string; content: string }[], statementContext?: any) {
  try {
    let systemPrompt = "You are Financialo AI, a helpful assistant specializing in bank statement analysis. ";
    
    if (statementContext) {
      systemPrompt += `You are currently discussing a bank statement with the following summary:
- Total Transactions: ${statementContext.transactions?.length || 0}
- Recurring Payments: ${JSON.stringify(statementContext.recurring_payments || [])}
- Categories: ${JSON.stringify(statementContext.category_expense || [])}

Context Transactions (First 50): ${JSON.stringify((statementContext.transactions || []).slice(0, 50))}

Please answer questions based on this data. Be concise, professional, and insightful. If you don't know something based on the data, say so.`;
    } else {
      systemPrompt += "The user hasn't selected a specific statement yet. Help them understand how to upload and analyze statements using Financialo.";
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content }))
      ],
      model: "llama-3.3-70b-versatile",
    });

    return { content: chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request." };
  } catch (error) {
    console.error("Groq API Error:", error);
    return { error: "Failed to get response from AI." };
  }
}
