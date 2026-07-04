import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Stethoscope, Activity, LifeBuoy, ArrowRight, UserPlus } from "lucide-react";
import { Card, StatCard } from "@/components/ui-bits";
import { getAdminDashboard, getRecentActivities } from "@/lib/api/admin";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — NeuroScan AI" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>({});
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    getAdminDashboard().then(setMetrics).catch(() => {});
    getRecentActivities().then((d) => setActivities(d || [])).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Admin overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">System metrics and recent activity across the platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total doctors" value={metrics.totalDoctors ?? 0} icon={Stethoscope} tone="primary" />
        <StatCard label="Total patients" value={metrics.totalPatients ?? 0} icon={Users} tone="success" />
        <StatCard label="MRI analyses" value={metrics.totalAnalyses ?? 0} icon={Activity} tone="muted" />
        <StatCard label="Open tickets" value={metrics.openTickets ?? 0} icon={LifeBuoy} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
          </div>
          <div className="mt-4 divide-y divide-border">
            {activities.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">No recent activity.</div>
            )}
            {activities.slice(0, 10).map((a: any, i: number) => (
              <div key={a.id || i} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{a.title || a.message || "Activity"}</div>
                  <div className="text-xs text-muted-foreground">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}</div>
                </div>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {a.type || "info"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Quick actions</h2>
          <div className="mt-4 space-y-2">
            <QA to="/admin/doctors" label="Add new doctor" icon={UserPlus} primary />
            <QA to="/admin/patients" label="View all patients" icon={Users} />
            <QA to="/admin/support" label="Support tickets" icon={LifeBuoy} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function QA({ to, label, icon: Icon, primary }: any) {
  return (
    <Link to={to}
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        primary ? "bg-gradient-hero text-primary-foreground shadow-soft hover:shadow-glow"
                : "bg-accent/50 text-foreground hover:bg-accent"
      }`}>
      <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
      <ArrowRight className="h-4 w-4 opacity-70" />
    </Link>
  );
}
