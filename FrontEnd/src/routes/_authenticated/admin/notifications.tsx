import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, EmptyState } from "@/components/ui-bits";
import { getNotifications, markNotificationAsRead, markAllAsRead } from "@/lib/api/notifications";
import type { NotificationItem } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — NeuroScan AI" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");

  const load = () => getNotifications().then((d) => setItems(d || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const list = items.filter((n) => {
  const r = readFilter === "all" || (readFilter === "unread" ? !n.isRead : !!n.isRead);
  return r;
});
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  }, [items, readFilter]);

  const markRead = async (n: NotificationItem) => {
    try { await markNotificationAsRead(n.id); load(); } catch { /* ignore */ }
  };

  const allRead = async () => {
    try { await markAllAsRead(); toast.success("All notifications marked read"); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">System and user notifications.</p>
        </div>
        <button onClick={allRead}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-primary/40">
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        
        <select value={readFilter} onChange={(e) => setReadFilter(e.target.value as any)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" message="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
           <Card key={n.id} className={`!p-4 transition ${!n.isRead ? "border-primary/40 bg-primary/5" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg bg-accent text-primary">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{n.title}</div>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{n.message}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {n.type || "info"} • {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </div>
                  </div>
                </div>
                {!n.isRead && (
                  <button onClick={() => markRead(n)}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold hover:border-primary/40">
                    <Check className="h-3.5 w-3.5" /> Mark read
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
