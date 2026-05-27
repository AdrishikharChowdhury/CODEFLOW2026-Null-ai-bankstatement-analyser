"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useParams } from "next/navigation";
import { sendChatMessage } from "@/lib/actions/chat.action";
import { getSummary } from "@/lib/actions/statements.action";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your Financialo AI assistant. How can I help you with your bank statements today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statementContext, setStatementContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const { user } = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchContext = async () => {
      if (params.id && user) {
        try {
          const { summary } = await getSummary(user.id, params.id as string);
          setStatementContext(summary);
        } catch (error) {
          console.error("Failed to fetch statement context:", error);
        }
      } else {
        setStatementContext(null);
      }
    };

    fetchContext();
  }, [params.id, user]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const chatHistory = messages.concat({ role: "user", content: userMessage });
      const response = await sendChatMessage(chatHistory, statementContext);

      if (response.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: response.content }]);
      } else if (response.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error: " + response.error }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "An unexpected error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "500px" }}
          >
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="size-5" />
                <span className="font-semibold">Financialo AI</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-foreground/10 p-1 rounded-lg transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none border border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 opacity-70">
                      {msg.role === "user" ? <User className="size-3" /> : <Bot className="size-3" />}
                      <span className="text-[10px] font-bold uppercase">
                        {msg.role === "user" ? "You" : "AI"}
                      </span>
                    </div>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:text-foreground [&_p]:text-foreground [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_code]:text-foreground">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground p-4 rounded-2xl rounded-tl-none border border-border shadow-sm flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground italic">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border bg-card">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your statement..."
                  className="w-full bg-muted border border-border rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 transition-all hover:bg-primary/90"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`size-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen ? "bg-card border border-border text-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        {isOpen ? <X className="size-6" /> : <MessageSquare className="size-6" />}
      </motion.button>
    </div>
  );
};

export default Chatbot;
