import { Bot, Send, X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

interface Msg { role: "user" | "bot"; content: string; ts: number; }

export function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", content: "Hi! I'm your AI medical assistant. Ask me general health questions. I'm not a substitute for your doctor.", ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setMsgs((m) => [...m, { role: "user", content: q, ts: Date.now() }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/chatbot/ask", { message: q });
      const reply = res.data?.response || "I couldn't generate a response.";
      setMsgs((m) => [...m, { role: "bot", content: reply, ts: Date.now() }]);
    } catch {
      setMsgs((m) => [...m, { role: "bot", content: "Sorry, I couldn't reach the assistant right now.", ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-hero px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-105">
          <Bot className="h-5 w-5" /> AI Assistant
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
          <div className="flex items-center justify-between bg-gradient-hero px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-white/15"><Bot className="h-4 w-4" /></div>
              <div>
                <div className="text-sm font-semibold">AI Medical Assistant</div>
                <div className="text-[10px] opacity-80">Informational only — not medical advice</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background/40 p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-soft ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-card px-3.5 py-2 text-sm shadow-soft">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex gap-2 border-t border-border bg-card p-3"
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} disabled={loading}
              placeholder="Ask a health question…" maxLength={500}
              className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:border-primary" />
            <button type="submit" disabled={loading || !input.trim()}
              className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
