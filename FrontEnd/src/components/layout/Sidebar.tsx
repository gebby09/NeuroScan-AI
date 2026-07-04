import { Link, useRouterState } from "@tanstack/react-router";
import {
  Brain, LayoutDashboard, Upload, History, Bot, LifeBuoy, UserCircle2, LogOut,
  Users, ClipboardList, ClipboardCheck, Stethoscope, UserPlus, Bell, ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const patientNav = [
  { to: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patient/upload-mri", label: "Upload MRI", icon: Upload },
  { to: "/patient/mri-history", label: "MRI History", icon: History },
  { to: "/patient/chatbot", label: "AI Assistant", icon: Bot },
  { to: "/patient/support", label: "Support", icon: LifeBuoy },
  { to: "/patient/profile", label: "Profile", icon: UserCircle2 },
];

const doctorNav = [
  { to: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctor/patients", label: "Assigned Patients", icon: Users },
  { to: "/doctor/pending-mri", label: "Pending MRI", icon: ClipboardList },
  { to: "/doctor/reviewed-analyses", label: "Reviewed Analyses", icon: ClipboardCheck },
  { to: "/doctor/support", label: "Support", icon: LifeBuoy },
  { to: "/doctor/profile", label: "Profile", icon: UserCircle2 },
];

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/doctors", label: "Manage Doctors", icon: Stethoscope },
  { to: "/admin/patients", label: "Manage Patients", icon: Users },
  { to: "/admin/assign-doctor", label: "Assign Doctor", icon: UserPlus },
  { to: "/admin/support", label: "Support Tickets", icon: LifeBuoy },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const items =
    user?.role === "DOCTOR" ? doctorNav :
    user?.role === "ADMIN" ? adminNav : patientNav;
  const subtitle =
    user?.role === "DOCTOR" ? "Doctor workspace" :
    user?.role === "ADMIN" ? "Admin console" : "Clinical workspace";

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-hero text-primary-foreground shadow-glow">
          {user?.role === "ADMIN" ? <ShieldCheck className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
        </span>
        <div>
          <div className="text-sm font-semibold">NeuroScan AI</div>
          <div className="text-[11px] text-sidebar-foreground/60">{subtitle}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((it) => {
          const active = path === it.to || path.startsWith(it.to + "/");
          return (
            <Link
              key={it.to} to={it.to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft border-l-2 border-primary-glow"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-sidebar-accent text-sm font-semibold">
            {(user?.firstName?.[0] || "U").toUpperCase()}{(user?.lastName?.[0] || "").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.firstName} {user?.lastName}</div>
            <div className="truncate text-[11px] text-sidebar-foreground/60">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="rounded-md p-2 text-sidebar-foreground/70 transition hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
