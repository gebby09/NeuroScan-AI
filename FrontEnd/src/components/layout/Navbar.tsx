import { Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useRouterState } from "@tanstack/react-router";
import { api } from "@/lib/api";

const titles: Record<string, string> = {
  "/patient/dashboard": "Dashboard",
  "/patient/upload-mri": "Upload MRI",
  "/patient/mri-history": "MRI History",
  "/patient/mri": "MRI Details",
  "/patient/chatbot": "AI Medical Assistant",
  "/patient/support": "Support",
  "/patient/profile": "Profile",
  "/doctor/dashboard": "Dashboard",
  "/doctor/patients": "Assigned Patients",
  "/doctor/pending-mri": "Pending Reviews",
  "/doctor/reviewed-analyses": "Reviewed Analyses",
  "/doctor/mri": "Review MRI",
  "/doctor/support": "Support",
  "/doctor/profile": "Profile",
  "/admin/dashboard": "Dashboard",
  "/admin/doctors": "Manage Doctors",
  "/admin/patients": "Manage Patients",
  "/admin/assign-doctor": "Assign Doctor",
  "/admin/support": "Support Tickets",
  "/admin/notifications": "Notifications",
  "/admin/profile": "Profile",
};

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
}

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
const [notifications, setNotifications] = useState<NotificationItem[]>([]);
const [loadingNotifications, setLoadingNotifications] = useState(false);

const unreadCount = notifications.filter((n) => !n.isRead).length;

const loadNotifications = async () => {
  setLoadingNotifications(true);
  try {
    const res = await api.get("/notifications");
    setNotifications(res.data || []);
  } catch (e) {
    console.error("Failed to load notifications:", e);
  } finally {
    setLoadingNotifications(false);
  }
};

const toggleNotifications = () => {
  setNotifOpen((prev) => {
    const next = !prev;
    if (next) {
      loadNotifications();
    }
    return next;
  });
};

const markAsRead = async (id: number) => {
  try {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
    );
  } catch (e) {
    console.error("Failed to mark notification as read:", e);
  }
};

useEffect(() => {
  loadNotifications();
}, []);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const title = Object.entries(titles)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([k]) => path.startsWith(k))?.[1] || "NeuroScan AI";
  const workspace =
    user?.role === "DOCTOR" ? "Doctor workspace" :
    user?.role === "ADMIN" ? "Admin console" : "Patient workspace";
  const profileTo =
    user?.role === "DOCTOR" ? "/doctor/profile" :
    user?.role === "ADMIN" ? "/admin/dashboard" : "/patient/profile";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border glass px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button className="rounded-md p-2 text-muted-foreground md:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{workspace}</div>
          <div className="text-base font-semibold">{title}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
       <div className="relative">
  <button
    onClick={toggleNotifications}
    className="relative rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
    aria-label="Notifications"
  >
    <Bell className="h-5 w-5" />
    {unreadCount > 0 && (
      <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
        {unreadCount}
      </span>
    )}
  </button>

  {notifOpen && (
    <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-elevated">
      <div className="border-b border-border px-4 py-3">
        <div className="text-sm font-semibold">Notifications</div>
        <div className="text-xs text-muted-foreground">
          {unreadCount} unread
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loadingNotifications ? (
          <div className="px-4 py-4 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-4 text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`block w-full border-b border-border px-4 py-3 text-left text-sm hover:bg-accent ${
                !n.isRead ? "bg-accent/40" : ""
              }`}
            >
              <div className="font-medium">{n.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {n.message}
              </div>
              {n.createdAt && (
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )}
</div>

        <div className="relative">
          <button onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 transition hover:border-primary/40">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-hero text-xs font-bold text-primary-foreground">
              {(user?.firstName?.[0] || "U").toUpperCase()}{(user?.lastName?.[0] || "").toUpperCase()}
            </span>
            <span className="hidden text-sm font-medium sm:inline">{user?.firstName}</span>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-popover shadow-elevated">
              <div className="border-b border-border px-4 py-3">
                <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
              </div>
              <Link to={profileTo} onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-accent">Profile</Link>
              <button onClick={() => { setOpen(false); logout(); }}
                className="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
