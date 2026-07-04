import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { UserPlus, Loader2, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui-bits";
import {
  getAllPatients, getAllDoctors, assignDoctorToPatient, unassignDoctor, getRecentAssignments,
} from "@/lib/api/admin";
import type { PatientUser, DoctorUser } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/assign-doctor")({
  head: () => ({ meta: [{ title: "Assign Doctor — NeuroScan AI" }] }),
  component: AssignDoctor,
});

function AssignDoctor() {
  const [patients, setPatients] = useState<PatientUser[]>([]);
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [patientQ, setPatientQ] = useState("");
  const [doctorQ, setDoctorQ] = useState("");
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = () => {
    getAllPatients().then((d) => setPatients(d || [])).catch(() => {});
    getAllDoctors().then((d) => setDoctors(d || [])).catch(() => {});
    getRecentAssignments().then((d) => setAssignments(d || [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const filteredPatients = useMemo(
    () => patients.filter((p) => `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(patientQ.toLowerCase())),
    [patients, patientQ]
  );
  const filteredDoctors = useMemo(
    () => doctors.filter((d) => `${d.firstName} ${d.lastName} ${d.email}`.toLowerCase().includes(doctorQ.toLowerCase())),
    [doctors, doctorQ]
  );

  const selectedPatient = patients.find((p) => p.id === patientId);
  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  const assign = async () => {
    setLoading(true);
    try {
      await assignDoctorToPatient(patientId, doctorId);
      toast.success("Doctor assigned");
      setPatientId(""); setDoctorId(""); setConfirm(false); load();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  const unassign = async (pId: string) => {
    try { await unassignDoctor(pId); toast.success("Doctor unassigned"); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Assign doctor</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pair a patient with a doctor for ongoing care.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Select patient</h2>
          <input value={patientQ} onChange={(e) => setPatientQ(e.target.value)} placeholder="Search patients…"
            className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <div className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
            {filteredPatients.map((p) => (
              <button key={p.id} onClick={() => setPatientId(p.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                  patientId === p.id ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"
                }`}>
                <span>{p.firstName} {p.lastName}<span className="ml-2 opacity-60 text-xs">{p.email}</span></span>
                {p.assignedDoctorName && <span className="text-[10px] uppercase opacity-70">Assigned</span>}
              </button>
            ))}
            {filteredPatients.length === 0 && <div className="py-6 text-center text-xs text-muted-foreground">No matches.</div>}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Select doctor</h2>
          <input value={doctorQ} onChange={(e) => setDoctorQ(e.target.value)} placeholder="Search doctors…"
            className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <div className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
            {filteredDoctors.map((d) => (
              <button key={d.id} onClick={() => setDoctorId(d.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                  doctorId === d.id ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"
                }`}>
                <span>Dr. {d.firstName} {d.lastName}<span className="ml-2 opacity-60 text-xs">{d.licenseNumber || ""}</span></span>
                <span className="text-[10px] uppercase opacity-70">{d.patientCount ?? 0} pts</span>
              </button>
            ))}
            {filteredDoctors.length === 0 && <div className="py-6 text-center text-xs text-muted-foreground">No matches.</div>}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Assignment summary</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <div className="text-xs text-muted-foreground">Patient</div>
            <div className="mt-1 font-medium">{selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "—"}</div>
            <div className="text-xs text-muted-foreground">{selectedPatient?.email}</div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <div className="text-xs text-muted-foreground">Doctor</div>
            <div className="mt-1 font-medium">{selectedDoctor ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}` : "—"}</div>
            <div className="text-xs text-muted-foreground">{selectedDoctor?.licenseNumber}</div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button disabled={!patientId || !doctorId} onClick={() => setConfirm(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:shadow-glow">
            <UserPlus className="h-4 w-4" /> Assign doctor
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Recent assignments</h2>
        <div className="mt-3 divide-y divide-border">
          {assignments.length === 0 && <div className="py-6 text-center text-sm text-muted-foreground">No assignments yet.</div>}
          {assignments.slice(0, 10).map((a: any, i: number) => (
            <div key={a.id || i} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div>
                <div className="font-medium">{a.patientName} → Dr. {a.doctorName}</div>
                <div className="text-xs text-muted-foreground">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}</div>
              </div>
              {a.patientId && (
                <button onClick={() => unassign(a.patientId)}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold hover:border-destructive/40 hover:text-destructive">
                  <RotateCcw className="h-3.5 w-3.5" /> Unassign
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-elevated">
            <div className="flex items-center justify-between"><div className="font-semibold">Confirm assignment</div>
              <button onClick={() => setConfirm(false)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Assign Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName} to {selectedPatient?.firstName} {selectedPatient?.lastName}?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setConfirm(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium">Cancel</button>
              <button onClick={assign} disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
