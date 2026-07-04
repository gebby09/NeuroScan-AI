import { LifeBuoy, Plus, Send, Loader2, MessageCircle, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Badge, Card, EmptyState } from "@/components/ui-bits";

interface Ticket { id: string; subject: string; status: string; createdAt?: string; lastMessageAt?: string; }
interface Message {
  id?: string;
  senderRole?: string;
  message?: string;
  content?: string;
  createdAt?: string;
}

export function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [creating, setCreating] = useState(false);
  const [active, setActive] = useState<Ticket | null>(null);

  const load = () => api.get("/support/tickets").then((r) => setTickets(r.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Support tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">Open a ticket and our team will respond directly here.</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
          <Plus className="h-4 w-4" /> New ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No support tickets yet"
          message="Have a question or problem? Open your first ticket and we'll get back to you."
          action={
            <button onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <Plus className="h-4 w-4" /> Create first ticket
            </button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {tickets.map((t) => (
            <Card key={t.id} className="!p-4 transition hover:shadow-medium">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{t.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      #{t.id} • {t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={t.status} />
                  <button onClick={() => setActive(t)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary/40">
                    View
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {creating && <CreateTicketModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />}
      {active && <TicketThread ticket={active} onClose={() => { setActive(null); load(); }} />}
    </div>
  );
}

function CreateTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    try {
      await api.post("/support/tickets", { subject, message });
      toast.success("Ticket created");
      onCreated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create ticket");
    } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} title="New support ticket">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Message</label>
          <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium">Cancel</button>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Submit
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TicketThread({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => api.get(`/support/tickets/${ticket.id}/messages`).then((r) => setMsgs(r.data || [])).catch(() => {});
  useEffect(() => { load(); }, [ticket.id]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      await api.post(`/support/tickets/${ticket.id}/messages`, { message: input });
      setInput("");
      load();
    } catch { toast.error("Failed to send message"); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} title={ticket.subject} subtitle={`#${ticket.id}`}>
      <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
        {msgs.length === 0 && <div className="text-center text-sm text-muted-foreground py-6">No messages yet.</div>}
        {msgs.map((m) => {
          const isSupport = (m.senderRole || "").toUpperCase() === "ADMIN" || (m.senderRole || "").toUpperCase() === "SUPPORT";
          return (
            <div key={m.id} className={`flex ${isSupport ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-soft ${
                isSupport ? "bg-accent/50" : "bg-primary text-primary-foreground"
              }`}>
                {isSupport && <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">Support</div>}
                {m.message || m.content || ""}
                {m.createdAt && <div className={`mt-1 text-[10px] ${isSupport ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                  {new Date(m.createdAt).toLocaleString()}
                </div>}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2 border-t border-border pt-4">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a reply…"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <button type="submit" disabled={loading || !input.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose, title, subtitle }: { children: React.ReactNode; onClose: () => void; title: string; subtitle?: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div>
            <div className="font-semibold">{title}</div>
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
