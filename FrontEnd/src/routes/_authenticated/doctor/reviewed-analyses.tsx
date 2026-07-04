import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Search, Brain } from "lucide-react";
import { Card, Badge, EmptyState } from "@/components/ui-bits";
import { getReviewedAnalyses } from "@/lib/api/doctor";
import type { MriItem } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/doctor/reviewed-analyses")({
  head: () => ({ meta: [{ title: "Reviewed Analyses — NeuroScan AI" }] }),
  component: ReviewedAnalyses,
});

function ReviewedAnalyses() {
  const [items, setItems] = useState<MriItem[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"reviewed" | "name">("reviewed");

  useEffect(() => { getReviewedAnalyses().then((d) => setItems(d || [])).catch(() => {}); }, []);

  const filtered = useMemo(() => {
    const list = items.filter((m) => `${m.patientName || ""} ${m.prediction || ""}`.toLowerCase().includes(q.toLowerCase()));
    list.sort((a, b) => sort === "reviewed"
      ? new Date(b.reviewedAt || b.createdAt || 0).getTime() - new Date(a.reviewedAt || a.createdAt || 0).getTime()
      : (a.patientName || "").localeCompare(b.patientName || ""));
    return list;
  }, [items, q, sort]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Reviewed analyses</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your completed MRI reviews.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient or prediction"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="reviewed">Sort: Review date</option>
          <option value="name">Sort: Patient name</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No reviewed analyses" message="Once you review MRIs they'll appear here." />
      ) : (
        <div className="grid gap-3">
          {filtered.map((m) => (
            <Card key={m.id} className="!p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-success/10 text-success">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{m.patientName || "Patient"}</div>
                    <div className="text-xs text-muted-foreground">
                     MRI #{m.id} •
{
  m.status === "ANALYZED"
    ? " AI Analysis"
    : " Doctor Review"
}
                    </div>
                  </div>
                </div>
               <div className="text-right">
  <div className="text-sm font-medium">
    {m.prediction || "Manual Review"}
  </div>

  <div className="text-xs text-muted-foreground">
    {m.status === "ANALYZED"
      ? "AI Analysis"
      : "Doctor Reviewed"}
  </div>
</div>
                <div className="flex items-center gap-2">
                  <Badge status={m.status || "REVIEWED"} />
                  <Link to="/doctor/mri/$id/review" params={{ id: m.id }}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary/40">
                    View
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
