import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { LifeBuoy, Search, Send, X, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, Badge, EmptyState } from "@/components/ui-bits";
import { getSupportTickets, getSupportTicketMessages, addMessageToTicket, closeTicket, reopenTicket } from "@/lib/api/support";
import type { SupportTicket } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/support")({
  head: () => ({ meta: [{ title: "Support Tickets — NeuroScan AI" }] }),
  component: AdminSupport,
});

function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "OPEN" | "CLOSED">("all");
  const [sort, setSort] = useState<"created" | "recent">("recent");
  const [active, setActive] = useState<SupportTicket | null>(null);

  const load = () => {
  console.log("Admin support page: loading tickets");

  return getSupportTickets()
    .then((d) => {
      console.log("Tickets received:", d);
      setTickets(d || []);
    })
    .catch((e) => {
      console.error("Failed to load tickets:", e);
      toast.error(e?.response?.data?.message || e?.message || "Failed to load tickets");
    });
};
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const list = tickets.filter((t) => {
      const s = `${t.id} ${t.subject} ${t.userName || ""}`.toLowerCase().includes(q.toLowerCase());
      const st = status === "all" || t.status === status;
      return s && st;
    });
    list.sort((a, b) => {
      const ad = new Date((sort === "recent" ? a.lastMessageAt : a.createdAt) || 0).getTime();
      const bd = new Date((sort === "recent" ? b.lastMessageAt : b.createdAt) || 0).getTime();
      return bd - ad;
    });
    return list;
  }, [tickets, q, status, sort]);

  const toggle = async (t: SupportTicket) => {
    try {
      if (t.status === "OPEN") { await closeTicket(t.id); toast.success("Ticket closed"); }
      else { await reopenTicket(t.id); toast.success("Ticket reopened"); }
      load();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Support tickets</h1>
        <p className="mt-1 text-sm text-muted-foreground">Triage and respond to user tickets.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, subject, or user"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All status</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="recent">Sort: Last activity</option>
          <option value="created">Sort: Date created</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No tickets" message="Tickets matching your filters will appear here." />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Last activity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-xs text-muted-foreground">#{t.id}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.userName || "—"}</td>
                  <td className="px-4 py-3"><Badge status={t.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {t.lastMessageAt ? new Date(t.lastMessageAt).toLocaleString() : ""}
                    {!!t.unreadCount && <span className="ml-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">{t.unreadCount}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setActive(t)} className="rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold hover:border-primary/40">
                        View
                      </button>
                      <button onClick={() => toggle(t)}
                        className="rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold hover:border-primary/40">
                        {t.status === "OPEN" ? "Close" : "Reopen"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {active && <TicketThread ticket={active} onClose={() => { setActive(null); load(); }} />}
    </div>
  );
}

function TicketThread({ ticket, onClose }: { ticket: SupportTicket; onClose: () => void }) {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

 const load = () =>
  getSupportTicketMessages(ticket.id)
    .then((d) => {
      console.log("Ticket messages received:", d);
      setMsgs(d || []);
    })
    .catch((e) => {
      console.error("Failed to load messages:", e);
    });
  useEffect(() => { load(); }, [ticket.id]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try { await addMessageToTicket(ticket.id, input); setInput(""); load(); }
    catch { toast.error("Failed to send"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">{ticket.subject}</div>
              <div className="text-xs text-muted-foreground">#{ticket.id} • {ticket.userName}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
          {msgs.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">No messages yet.</div>}
          {msgs.map((m, index) => {
  const isAdmin = (m.senderRole || "").toUpperCase() === "ADMIN";
  return (
    <div
      key={`${m.createdAt}-${index}`}
      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
    >
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-soft ${
                  isAdmin ? "bg-primary text-primary-foreground" : "bg-accent/50"
                }`}>
                  {!isAdmin && <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">{m.senderRole || "User"}</div>}
                 {m.message || m.content || ""}
                  {m.createdAt && <div className={`mt-1 text-[10px] ${isAdmin ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(m.createdAt).toLocaleString()}
                  </div>}
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-border p-4">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Reply as admin…"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <button type="submit" disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
