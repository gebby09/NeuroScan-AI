import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui-bits";
import { useAuth } from "@/context/AuthContext";
import { getDoctorProfile, updateDoctorProfile } from "@/lib/api/doctor";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/doctor/profile")({
  head: () => ({ meta: [{ title: "Profile — NeuroScan AI" }] }),
  component: DoctorProfile,
});

function DoctorProfile() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", licenseNumber: "" });
  const [loading, setLoading] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "" });
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    getDoctorProfile().then((d) => {
      setForm({
        firstName: d?.firstName || user?.firstName || "",
        lastName: d?.lastName || user?.lastName || "",
        phone: d?.phone || "",
        licenseNumber: d?.licenseNumber || "",
      });
    }).catch(() => {
      if (user) setForm((f) => ({ ...f, firstName: user.firstName, lastName: user.lastName }));
    });
  }, [user]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await updateDoctorProfile(form); toast.success("Profile updated"); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Update failed"); }
    finally { setLoading(false); }
  };

  const changePwd = async (e: FormEvent) => {
    e.preventDefault();
    if (!pwd.current || !pwd.next) return;
    try {
      await api.post("/auth/change-password", { currentPassword: pwd.current, newPassword: pwd.next });
      toast.success("Password updated"); setPwd({ current: "", next: "" });
    } catch (err: any) { toast.error(err?.response?.data?.message || "Failed"); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Doctor profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account information and security.</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Personal information</h2>
        <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
          <Field label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="License number" value={form.licenseNumber} onChange={(v) => setForm({ ...form, licenseNumber: v })} />
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Change password</h2>
        <form onSubmit={changePwd} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Current password" type="password" value={pwd.current} onChange={(v) => setPwd({ ...pwd, current: v })} />
          <Field label="New password" type="password" value={pwd.next} onChange={(v) => setPwd({ ...pwd, next: v })} />
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Update password</button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Sign out</h2>
        <p className="mt-1 text-sm text-muted-foreground">End your session on this device.</p>
        <button onClick={() => setConfirmLogout(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </Card>

      {confirmLogout && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-elevated">
            <div className="font-semibold">Sign out?</div>
            <p className="mt-1 text-sm text-muted-foreground">You'll need to sign in again to access your workspace.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setConfirmLogout(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium">Cancel</button>
              <button onClick={logout} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">Sign out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  );
}
