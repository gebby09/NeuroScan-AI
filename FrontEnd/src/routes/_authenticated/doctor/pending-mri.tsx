import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Search, Brain, ArrowRight } from "lucide-react";
import { Card, Badge, EmptyState } from "@/components/ui-bits";
import { getDoctorMri, getPendingMri } from "@/lib/api/doctor";
import type { MriItem } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/doctor/pending-mri")({
  head: () => ({ meta: [{ title: "Pending MRI — NeuroScan AI" }] }),
  component: PendingMri,
});

function PendingMri() {
  const [items, setItems] = useState<MriItem[]>([]);
  const [q, setQ] = useState(() => new URLSearchParams(window.location.search).get("q") || "");
  const [sort, setSort] = useState<"date" | "name">("date");

  useEffect(() => {
    getPendingMri()
      .then(async (d) => {
        const pendingItems = d || [];
        const itemsWithPatientNames = await Promise.all(
          pendingItems.map(async (item: MriItem) => {
            if (item.patientName) return item;

            try {
              const details = await getDoctorMri(item.id);
              return {
                ...item,
                patientName: details.patientName,
                patientEmail: details.patientEmail,
              };
            } catch {
              return item;
            }
          })
        );

        setItems(itemsWithPatientNames);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    const list = items.filter((m) =>
      `${m.patientName || ""} ${m.id}`.toLowerCase().includes(term)
    );

    list.sort((a, b) => sort === "date"
      ? new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      : (a.patientName || "").localeCompare(b.patientName || ""));

    return list;
  }, [items, q, sort]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pending MRI reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">Analyses awaiting your clinical review.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search patient or MRI ID"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="date">Sort: Newest</option>
          <option value="name">Sort: Patient name</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No pending reviews" message="No pending MRI analyses match the current filter." />
      ) : (
        <div className="grid gap-3">
          {filtered.map((m) => (
            <Card key={m.id} className="!p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-accent text-primary">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{m.patientName || "Unknown patient"}</div>
                    <div className="text-xs text-muted-foreground">
                      MRI #{m.id} • {m.createdAt ? new Date(m.createdAt).toLocaleString() : "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge status="PENDING" />
                  <Link
                    to="/doctor/mri/$id/review"
                    params={{ id: m.id }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:shadow-glow"
                  >
                    Review <ArrowRight className="h-3.5 w-3.5" />
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
