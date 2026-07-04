import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Brain, Loader2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — NeuroScan AI" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phoneNumber: "", dateOfBirth: "", biologicalSex: "MALE",
    heightCm: "", weightKg: "", medicalHistory: "", address: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const strength = useMemo(() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s; // 0-4
  }, [form.password]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accepted) return toast.error("Please accept the terms to continue");
    if (strength < 2) return toast.error("Please choose a stronger password");
    setLoading(true);
    try {
      await register({
        ...form,
        heightCm: Number(form.heightCm) || undefined,
        weightKg: Number(form.weightKg) || undefined,
      });
      toast.success("Account created — please sign in");
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-hero text-primary-foreground"><Brain className="h-4 w-4" /></span>
          NeuroScan AI
        </Link>

        <div className="mt-6 rounded-2xl border border-border bg-card p-8 shadow-soft">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Register as a patient to upload MRI scans and access AI analysis.</p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field label="First name"><Input value={form.firstName} onChange={(v) => set("firstName", v)} required /></Field>
            <Field label="Last name"><Input value={form.lastName} onChange={(v) => set("lastName", v)} required /></Field>
            <Field label="Email" className="sm:col-span-2">
              <Input type="email" value={form.email} onChange={(v) => set("email", v)} required />
            </Field>
            <Field label="Password" className="sm:col-span-2">
              <Input type="password" value={form.password} onChange={(v) => set("password", v)} required />
              <div className="mt-2 flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded ${i < strength ? (strength >= 3 ? "bg-success" : strength === 2 ? "bg-warning" : "bg-destructive") : "bg-border"}`} />
                ))}
              </div>
            </Field>
            <Field label="Phone number"><Input value={form.phoneNumber} onChange={(v) => set("phoneNumber", v)} /></Field>
            <Field label="Date of birth"><Input type="date" value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} /></Field>
            <Field label="Biological sex">
              <select value={form.biologicalSex} onChange={(e) => set("biologicalSex", e.target.value)}
                className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </Field>
            <Field label="Address"><Input value={form.address} onChange={(v) => set("address", v)} /></Field>
            <Field label="Height (cm)"><Input type="number" value={form.heightCm} onChange={(v) => set("heightCm", v)} /></Field>
            <Field label="Weight (kg)"><Input type="number" value={form.weightKg} onChange={(v) => set("weightKg", v)} /></Field>
            <Field label="Medical history" className="sm:col-span-2">
              <textarea rows={3} value={form.medicalHistory} onChange={(e) => set("medicalHistory", e.target.value)}
                placeholder="Any prior conditions, surgeries, allergies or relevant medical history"
                className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </Field>

            <label className="flex items-start gap-3 sm:col-span-2">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
              <span className="text-sm text-muted-foreground">
                I understand this platform provides AI-supported analysis only and does not replace medical advice from a licensed professional.
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="sm:col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-glow disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Input({ value, onChange, type = "text", required, placeholder }: {
  value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <input type={type} value={value} required={required} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
  );
}
