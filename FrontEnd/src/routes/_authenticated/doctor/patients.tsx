import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Users, Search, ClipboardList } from "lucide-react";
import { Card, EmptyState } from "@/components/ui-bits";
import { getDoctorPatients } from "@/lib/api/doctor";
import type { PatientUser } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/doctor/patients")({
  head: () => ({ meta: [{ title: "Assigned Patients — NeuroScan AI" }] }),
  component: PatientsPage,
});

function PatientsPage() {
  const [patients, setPatients] = useState<PatientUser[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"name" | "date">("name");

  useEffect(() => {
    getDoctorPatients().then((d) => setPatients(d || [])).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const list = patients.filter((p) => {
      const s = `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase();
      return s.includes(q.toLowerCase());
    });
    list.sort((a, b) => sort === "name"
      ? `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      : (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    return list;
  }, [patients, q, sort]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Assigned patients</h1>
        <p className="mt-1 text-sm text-muted-foreground">Patients currently under your care.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="name">Sort: Name</option>
          <option value="date">Sort: Date added</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No patients yet" message="Patients assigned to you will appear here." />
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => (
            <Card key={p.id} className="!p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-accent text-sm font-semibold text-primary">
                    {(p.firstName?.[0] || "?").toUpperCase()}{(p.lastName?.[0] || "").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{p.firstName} {p.lastName}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.email}</div>
                  </div>
                </div>

                <Link
                  to="/doctor/pending-mri"
                  search={{ q: `${p.firstName} ${p.lastName}` } as any}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary/40"
                >
                  <ClipboardList className="h-3.5 w-3.5" /> Pending MRI
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
