import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Stethoscope, Plus, Search, Loader2, X, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Card, EmptyState } from "@/components/ui-bits";
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor } from "@/lib/api/admin";
import type { DoctorUser } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/doctors")({
  head: () => ({ meta: [{ title: "Manage Doctors — NeuroScan AI" }] }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"name" | "date" | "patients">("name");
  const [modal, setModal] = useState<DoctorUser | "new" | null>(null);
  const [toDelete, setToDelete] = useState<DoctorUser | null>(null);

  const load = () => getAllDoctors().then((d) => setDoctors(d || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const list = doctors.filter((d) =>
      `${d.firstName} ${d.lastName} ${d.email} ${d.licenseNumber || ""}`.toLowerCase().includes(q.toLowerCase())
    );
    list.sort((a, b) =>
      sort === "name" ? `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      : sort === "patients" ? (b.patientCount || 0) - (a.patientCount || 0)
      : new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    return list;
  }, [doctors, q, sort]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try { await deleteDoctor(toDelete.id); toast.success("Doctor deleted"); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message || "Delete failed"); }
    finally { setToDelete(null); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Manage doctors</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, edit, and review doctor accounts.</p>
        </div>
        <button onClick={() => setModal("new")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
          <Plus className="h-4 w-4" /> Add new doctor
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, or license"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="name">Sort: Name</option>
          <option value="date">Sort: Date added</option>
          <option value="patients">Sort: Patient count</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No doctors yet" message="Add your first doctor to get started." />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">License</th>
                <th className="px-4 py-3">Patients</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-xs font-semibold text-primary">
                        {(d.firstName?.[0] || "?").toUpperCase()}{(d.lastName?.[0] || "").toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">Dr. {d.firstName} {d.lastName}</div>
                        <div className="text-xs text-muted-foreground">{d.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.licenseNumber || "—"}</td>
                  <td className="px-4 py-3">{d.patientCount ?? 0}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModal(d)}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold hover:border-primary/40">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button onClick={() => setToDelete(d)}
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

      {modal && <DoctorModal doctor={modal === "new" ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
      {toDelete && (
        <ConfirmDialog title="Delete doctor?" message={`Permanently delete Dr. ${toDelete.firstName} ${toDelete.lastName}? This cannot be undone.`}
          onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />
      )}
    </div>
  );
}

function DoctorModal({ doctor, onClose, onSaved }: { doctor: DoctorUser | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!doctor;
  const [form, setForm] = useState({
    firstName: doctor?.firstName || "", lastName: doctor?.lastName || "",
    email: doctor?.email || "", password: "", phone: doctor?.phone || "",
    licenseNumber: doctor?.licenseNumber || "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && doctor) {
        const { password, ...rest } = form;
        await updateDoctor(doctor.id, password ? form : rest);
        toast.success("Doctor updated");
      } else {
        await createDoctor({
  firstName: form.firstName,
  lastName: form.lastName,
  email: form.email,
  password: form.password,
  phoneNumber: form.phone,
  licenseNumber: form.licenseNumber,
});
        toast.success("Doctor created");
      }
      onSaved();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} title={isEdit ? "Edit doctor" : "Add new doctor"}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <F label="First name" v={form.firstName} on={(v) => setForm({ ...form, firstName: v })} req />
        <F label="Last name" v={form.lastName} on={(v) => setForm({ ...form, lastName: v })} req />
        <F label="Email" type="email" v={form.email} on={(v) => setForm({ ...form, email: v })} req />
        <F label={isEdit ? "Password (optional)" : "Password"} type="password" v={form.password} on={(v) => setForm({ ...form, password: v })} req={!isEdit} />
        <F label="Phone" v={form.phone} on={(v) => setForm({ ...form, phone: v })} />
        <F label="License number" v={form.licenseNumber} on={(v) => setForm({ ...form, licenseNumber: v })} />
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium">Cancel</button>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} {isEdit ? "Save changes" : "Create doctor"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function F({ label, v, on, type = "text", req }: { label: string; v: string; on: (s: string) => void; type?: string; req?: boolean }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <input type={type} value={v} onChange={(e) => on(e.target.value)} required={req}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onCancel, onConfirm }: { title: string; message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-elevated">
        <div className="font-semibold">{title}</div>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-border px-4 py-2 text-sm font-medium">Cancel</button>
          <button onClick={onConfirm} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">Delete</button>
        </div>
      </div>
    </div>
  );
}
