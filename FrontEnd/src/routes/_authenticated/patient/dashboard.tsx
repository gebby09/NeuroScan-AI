import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Clock, ClipboardCheck, Stethoscope, Upload, History, LifeBuoy, ArrowRight, Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, StatCard, Badge, Disclaimer } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/patient/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NeuroScan AI" }] }),
  component: PatientDashboard,
});

interface MriItem {
  id: string;
  prediction?: string;
  confidence?: number;
  status?: string;
  createdAt?: string;
}

function PatientDashboard() {
  const { user } = useAuth();
  const [mris, setMris] = useState<MriItem[]>([]);
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    api.get("/patient/mri").then((r) => setMris(r.data || [])).catch(() => {});
    api.get("/patient/my-doctor").then((r) => setDoctor(r.data || null)).catch(() => {});
  }, []);

  const pending = mris.filter((m) => m.status === "PENDING" || m.status === "ANALYZED").length;
  const reviewed = mris.filter((m) => m.status === "REVIEWED").length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome back, {user?.firstName || "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's a snapshot of your MRI analyses and care team.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total MRI" value={mris.length} icon={Activity} tone="primary" />
        <StatCard label="Pending review" value={pending} icon={Clock} tone="warning" />
        <StatCard label="Reviewed" value={reviewed} icon={ClipboardCheck} tone="success" />
        <StatCard label="Assigned doctor" value={doctor ? `Dr. ${doctor.lastName || ""}` : "—"} icon={Stethoscope} tone="muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent analyses</h2>
            <Link to="/patient/mri-history" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {mris.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No MRI analyses yet. Upload your first scan to get started.
              </div>
            )}
            {mris.slice(0, 5).map((m) => (
              <Link key={m.id} to="/patient/mri/$id" params={{ id: m.id }}
                className="flex items-center justify-between gap-4 py-3 transition hover:bg-accent/30">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.prediction || "Awaiting analysis"}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : "—"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {m.status && <Badge status={m.status} />}
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
              <QuickAction to="/patient/upload-mri" label="Upload new MRI" icon={Upload} primary />
              <QuickAction to="/patient/mri-history" label="View MRI history" icon={History} />
              <QuickAction to="/patient/support" label="Contact support" icon={LifeBuoy} />
            </div>
          </Card>
          <Disclaimer>
            AI analysis is supportive only and does not replace professional medical diagnosis.
          </Disclaimer>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ to, label, icon: Icon, primary }: { to: string; label: string; icon: any; primary?: boolean }) {
  return (
    <Link to={to as any}
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        primary
          ? "bg-gradient-hero text-primary-foreground shadow-soft hover:shadow-glow"
          : "bg-accent/50 text-foreground hover:bg-accent"
      }`}>
      <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
      <ArrowRight className="h-4 w-4 opacity-70" />
    </Link>
  );
}
