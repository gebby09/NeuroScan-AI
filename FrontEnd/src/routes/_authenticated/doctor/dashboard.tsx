import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, ClipboardList, ClipboardCheck, CalendarRange, ArrowRight, Brain } from "lucide-react";
import { Card, StatCard, Badge, Disclaimer } from "@/components/ui-bits";
import { useAuth } from "@/context/AuthContext";
import { getDoctorDashboard, getPendingMri } from "@/lib/api/doctor";
import type { MriItem } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/doctor/dashboard")({
  head: () => ({ meta: [{ title: "Doctor Dashboard — NeuroScan AI" }] }),
  component: DoctorDashboard,
});

function DoctorDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>({});
  const [pending, setPending] = useState<MriItem[]>([]);

  useEffect(() => {
    getDoctorDashboard().then(setMetrics).catch(() => {});
    getPendingMri().then((d) => setPending(d || [])).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome, Dr. {user?.lastName || user?.firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your patient activity and pending reviews at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned patients" value={metrics.assignedPatients ?? 0} icon={Users} tone="primary" />
        <StatCard label="Pending MRI" value={metrics.pendingMri ?? pending.length} icon={ClipboardList} tone="warning" />
        <StatCard label="Reviewed analyses" value={metrics.reviewedAnalyses ?? 0} icon={ClipboardCheck} tone="success" />
        <StatCard label="This month" value={metrics.monthlyTotal ?? 0} icon={CalendarRange} tone="muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent pending MRI analyses</h2>
            <Link to="/doctor/pending-mri" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {pending.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No pending analyses. You're all caught up!
              </div>
            )}
            {pending.slice(0, 5).map((m) => (
              <Link key={m.id} to="/doctor/mri/$id/review" params={{ id: m.id }}
                className="flex items-center justify-between gap-4 py-3 transition hover:bg-accent/30">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.patientName || "Patient"}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.prediction || "AI analysis pending"} • {m.createdAt ? new Date(m.createdAt).toLocaleString() : "—"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={m.status || "PENDING"} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="mt-4 space-y-2">
              <QuickAction to="/doctor/pending-mri" label="Review pending MRI" icon={ClipboardList} primary />
              <QuickAction to="/doctor/patients" label="View patients" icon={Users} />
              <QuickAction to="/doctor/support" label="Support center" icon={ClipboardCheck} />
            </div>
          </Card>
          <Disclaimer>
            AI predictions support clinical judgement. Always confirm with your standard diagnostic workflow.
          </Disclaimer>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ to, label, icon: Icon, primary }: any) {
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
