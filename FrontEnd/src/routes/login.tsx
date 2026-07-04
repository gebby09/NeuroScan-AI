import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — NeuroScan AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in both fields");
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Welcome back");
      const path =
        user.role === "DOCTOR" ? "/doctor/dashboard" :
        user.role === "ADMIN" ? "/admin/dashboard" :
        "/patient/dashboard";
      navigate({ to: path });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero md:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 backdrop-blur"><Brain className="h-5 w-5" /></span>
            NeuroScan AI
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight">Clinical AI you can explain.</h2>
            <p className="mt-3 max-w-md text-primary-foreground/80">
              Sign in to access AI-powered MRI analysis, GradCAM visualization and your doctor review workflow.
            </p>
          </div>
          <div className="text-xs text-primary-foreground/70">For educational and research use.</div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground md:hidden">
            <Brain className="h-4 w-4" /> NeuroScan AI
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field label="Email">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" placeholder="you@example.com"
                className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-md border border-input bg-card px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button type="button" onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <button type="submit" disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-glow disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="font-semibold text-primary hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
