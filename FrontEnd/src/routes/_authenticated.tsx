import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { FloatingChatbot } from "@/components/Chatbot";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    // Role-based access control
    const home =
      user.role === "DOCTOR" ? "/doctor/dashboard" :
      user.role === "ADMIN" ? "/admin/dashboard" : "/patient/dashboard";
    if (path.startsWith("/patient/") && user.role !== "PATIENT") navigate({ to: home });
    else if (path.startsWith("/doctor/") && user.role !== "DOCTOR") navigate({ to: home });
    else if (path.startsWith("/admin/") && user.role !== "ADMIN") navigate({ to: home });
  }, [loading, user, path, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      {user.role === "PATIENT" && <FloatingChatbot />}
    </div>
  );
}
