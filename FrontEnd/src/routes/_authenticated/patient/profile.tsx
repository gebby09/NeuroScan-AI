import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/patient/profile")({
  head: () => ({ meta: [{ title: "Profile — NeuroScan AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    setTimeout(() => {
      if (user) setUser({ ...user, ...form });
      toast.success("Profile updated");
      setSaving(false);
    }, 400);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-hero text-xl font-bold text-primary-foreground">
            {(user?.firstName?.[0] || "U").toUpperCase()}{(user?.lastName?.[0] || "").toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-semibold">{user?.firstName} {user?.lastName}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            <div className="mt-1 inline-flex rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{user?.role}</div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Edit details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
          <Field label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
          <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} className="sm:col-span-2" />
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={save} disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-glow disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
          </button>
        </div>
      </Card>

      <Card className="border-destructive/30">
        <h2 className="text-lg font-semibold text-destructive">Sign out</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign out from this device. You can sign back in anytime.</p>
        <button onClick={() => { if (confirm("Sign out?")) logout(); }}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
    </label>
  );
}
