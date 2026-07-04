import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-6 shadow-soft ${className}`}>{children}</div>;
}

export function StatCard({ label, value, hint, icon: Icon, tone = "primary" }: {
  label: string; value: string | number; hint?: string; icon: any; tone?: "primary" | "success" | "warning" | "muted";
}) {
  const tones: Record<string, string> = {
    primary: "bg-accent text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-medium">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-warning/15 text-warning border-warning/30",
    ANALYZED: "bg-primary/10 text-primary border-primary/30",
    REVIEWED: "bg-success/15 text-success border-success/30",
    OPEN: "bg-warning/15 text-warning border-warning/30",
    CLOSED: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${map[status] || "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, message, action }: {
  icon: any; title: string; message: string; action?: ReactNode;
}) {
  return (
    <Card className="grid place-items-center py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="mt-4 text-lg font-semibold">{title}</div>
      <div className="mt-1 max-w-md text-sm text-muted-foreground">{message}</div>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground/90">
      <strong className="font-semibold">Medical disclaimer:</strong> {children}
    </div>
  );
}
