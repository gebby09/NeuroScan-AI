import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Download, Eye, History, Search, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, API_BASE_URL, TOKEN_KEY } from "@/lib/api";
import { Badge, Card, EmptyState } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/patient/mri-history")({
  head: () => ({ meta: [{ title: "MRI History — NeuroScan AI" }] }),
  component: MriHistory,
});

interface MriItem {
  id: string; prediction?: string; confidence?: number; status?: string;
  createdAt?: string; doctorName?: string; doctorNotes?: string; imageUrl?: string;
}

function MriHistory() {
  const [items, setItems] = useState<MriItem[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    api.get("/patient/mri/history").then((r) => setItems(r.data || []))
      .catch(() => api.get("/patient/mri").then((r) => setItems(r.data || [])).catch(() => {}));
  }, []);

  const filtered = useMemo(() => items.filter((m) =>
    (filter === "ALL" || m.status === filter) &&
    (!q || (m.prediction || "").toLowerCase().includes(q.toLowerCase()))
  ), [items, q, filter]);

  const downloadPdf = async (id: string) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const url = `${API_BASE_URL}/patient/mri/${id}/pdf`;
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mri-${id}.pdf`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">MRI History</h1>
          <p className="mt-1 text-sm text-muted-foreground">All your past analyses and doctor reviews.</p>
        </div>
        <Link to="/patient/upload-mri"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-glow">
          <Upload className="h-4 w-4" /> Upload MRI
        </Link>
      </div>

      <Card className="!p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by prediction…"
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </div>
          <div className="flex gap-1.5">
            {["ALL", "PENDING", "ANALYZED", "REVIEWED"].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  filter === s ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/70"
                }`}>{s}</button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No MRI analyses yet"
          message="Upload your first MRI scan to see AI analysis and doctor reviews here."
          action={
            <Link to="/patient/upload-mri"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <Upload className="h-4 w-4" /> Upload MRI
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <Card key={m.id} className="flex flex-col">
              <div className="grid h-36 place-items-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white/80">
                {m.imageUrl
                  ? <img src={m.imageUrl} alt="MRI" className="h-full w-full rounded-lg object-cover" />
                  : <Brain className="h-12 w-12" />}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="font-semibold">{m.prediction || "Pending analysis"}</div>
                {m.status && <Badge status={m.status} />}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {m.createdAt ? new Date(m.createdAt).toLocaleString() : "—"}
              </div>
              {typeof m.confidence === "number" && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Confidence</span><span className="font-semibold text-foreground">{Math.round(m.confidence * (m.confidence <= 1 ? 100 : 1))}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div className="h-full bg-gradient-hero" style={{ width: `${Math.round(m.confidence * (m.confidence <= 1 ? 100 : 1))}%` }} />
                  </div>
                </div>
              )}
              {m.status === "REVIEWED" && m.doctorName && (
  <div className="mt-3 text-xs text-muted-foreground">
    Reviewed by{" "}
    <span className="font-medium text-foreground">
      Dr. {m.doctorName}
    </span>
  </div>
)}
              {m.status === "REVIEWED" && m.doctorNotes && (
  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
    {m.doctorNotes}
  </p>
)}
              <div className="mt-4 flex gap-2">
                <Link to="/patient/mri/$id" params={{ id: m.id }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  <Eye className="h-3.5 w-3.5" /> View
                </Link>
                <button onClick={() => downloadPdf(m.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:border-primary/40">
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
