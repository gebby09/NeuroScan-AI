import { createFileRoute } from "@tanstack/react-router";
import { Bot, Send, Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Card, Disclaimer } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/patient/chatbot")({
  head: () => ({ meta: [{ title: "AI Assistant — NeuroScan AI" }] }),
  component: ChatbotPage,
});

interface Msg { role: "user" | "bot"; content: string; ts: number; }

function ChatbotPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", content: "Hello! I'm your AI medical assistant powered by Gemini. Ask me general health and MRI-related questions. Note: I'm informational only and not a substitute for your doctor.", ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setMsgs((m) => [...m, { role: "user", content: q, ts: Date.now() }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/chatbot/ask", { message: q });
      const reply = res.data?.reply || res.data?.message || res.data?.answer || "I couldn't generate a response.";
      setMsgs((m) => [...m, { role: "bot", content: reply, ts: Date.now() }]);
    } catch {
      setMsgs((m) => [...m, { role: "bot", content: "I couldn't reach the assistant right now. Please try again.", ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">AI Medical Assistant</h1>
          <p className="mt-1 text-sm text-muted-foreground">Powered by Google Gemini.</p>
        </div>
        <button onClick={() => setMsgs(msgs.slice(0, 1))}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:border-destructive/40 hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" /> Clear chat
        </button>
      </div>

      <Disclaimer>
        This assistant provides general health information only and is not a substitute for professional medical advice. Always consult your doctor.
      </Disclaimer>

      <Card className="!p-0 overflow-hidden">
        <div ref={ref} className="h-[480px] space-y-4 overflow-y-auto p-5">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "bot" && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-hero text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent/40 text-foreground"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-hero text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-accent/40 px-4 py-2.5"><Loader2 className="h-4 w-4 animate-spin" /></div>
            </div>
          )}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-2 border-t border-border bg-card p-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} disabled={loading}
            maxLength={500} placeholder="Ask a question…"
            className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <button type="submit" disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40">
            <Send className="h-4 w-4" /> Send
          </button>
        </form>
      </Card>
    </div>
  );
}
