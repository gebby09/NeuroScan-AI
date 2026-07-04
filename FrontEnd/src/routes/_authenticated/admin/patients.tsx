import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Users, Search, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Card, EmptyState } from "@/components/ui-bits";
import { getAllPatients, getAllDoctors, deletePatient } from "@/lib/api/admin";
import type { PatientUser, DoctorUser } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/patients")({
  head: () => ({ meta: [{ title: "Manage Patients — NeuroScan AI" }] }),
  component: PatientsAdmin,
});

function PatientsAdmin() {
  const [patients, setPatients] = useState<PatientUser[]>([]);
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [q, setQ] = useState("");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "assigned" | "unassigned">("all");
  const [sort, setSort] = useState<"name" | "date">("name");
  const [toDelete, setToDelete] = useState<PatientUser | null>(null);

  const load = () => getAllPatients().then((d) => setPatients(d || [])).catch(() => {});
  useEffect(() => {
    load();
    getAllDoctors().then((d) => setDoctors(d || [])).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const list = patients.filter((p) => {
      const s = `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(q.toLowerCase());
      const d =
  doctorFilter === "all" ||
  String(p.assignedDoctorId) === doctorFilter;
      const st = status === "all" || (status === "assigned" ? !!p.assignedDoctorId : !p.assignedDoctorId);
      return s && d && st;
    });
    list.sort((a, b) => sort === "name"
      ? `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      : new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  }, [patients, q, doctorFilter, status, sort]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try { await deletePatient(toDelete.id); toast.success("Patient deleted"); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setToDelete(null); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Manage patients</h1>
        <p className="mt-1 text-sm text-muted-foreground">View patients, assign doctors, and manage accounts.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All doctors</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All status</option>
          <option value="assigned">With doctor</option>
          <option value="unassigned">Unassigned</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="name">Sort: Name</option>
          <option value="date">Sort: Date registered</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No patients found" message="Try changing your filters." />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Assigned doctor</th>
                <th className="px-4 py-3">MRI</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-xs font-semibold text-primary">
                        {(p.firstName?.[0] || "?").toUpperCase()}{(p.lastName?.[0] || "").toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{p.firstName} {p.lastName}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.assignedDoctorName ? `Dr. ${p.assignedDoctorName}` : <span className="text-warning">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3">{p.mriCount ?? 0}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {!p.assignedDoctorId && (
                        <Link to="/admin/assign-doctor"
                          className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground">
                          <UserPlus className="h-3.5 w-3.5" /> Assign
                        </Link>
                      )}
                      <button onClick={() => setToDelete(p)}
                        className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {toDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-elevated">
            <div className="flex items-center justify-between"><div className="font-semibold">Delete patient?</div>
              <button onClick={() => setToDelete(null)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Permanently delete {toDelete.firstName} {toDelete.lastName}?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setToDelete(null)} className="rounded-md border border-border px-4 py-2 text-sm font-medium">Cancel</button>
              <button onClick={confirmDelete} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
