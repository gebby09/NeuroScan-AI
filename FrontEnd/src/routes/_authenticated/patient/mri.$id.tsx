import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Brain, Download, Stethoscope, Eye, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api, API_BASE_URL, TOKEN_KEY } from "@/lib/api";
import { Badge, Card, Disclaimer } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/patient/mri/$id")({
  head: () => ({ meta: [{ title: "MRI Details — NeuroScan AI" }] }),
  component: MriDetails,
});

interface Mri {
  id: string; prediction?: string; confidence?: number; probability?: number;
  status?: string; createdAt?: string; imageUrl?: string; gradcamUrl?: string;
  doctorName?: string; doctorLicense?: string; doctorNotes?: string; reviewedAt?: string; gradcamImage?: string;
}

function MriDetails() {
  const { id } = useParams({ from: "/_authenticated/patient/mri/$id" });
  const [m, setM] = useState<Mri | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/patient/mri/${id}`)
      .then((r) => setM(r.data))
      .catch(() => setM(null))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadPdf = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`${API_BASE_URL}/patient/mri/${id}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mri-${id}.pdf`;
    a.click();
  };

  if (loading) return <div className="grid h-[60vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const conf = (() => {
    if (!m || typeof m.confidence !== "number") return null;
    return Math.round(m.confidence * (m.confidence <= 1 ? 100 : 1));
  })();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <Link to="/patient/mri-history" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to history
        </Link>
        <button onClick={downloadPdf}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-glow">
          <Download className="h-4 w-4" /> Download PDF
        </button>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">MRI #{id}</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
          {m?.prediction || "Analysis result"}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="aspect-square w-full bg-gradient-to-br from-slate-900 to-slate-700 grid place-items-center">
            {m?.imageUrl ? (
              <img src={m.imageUrl} alt="Original MRI" className="h-full w-full object-contain" />
            ) : (
              <Brain className="h-24 w-24 text-white/40" />
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Analysis</h3>
              {m?.status && <Badge status={m.status} />}
            </div>
           <div className="mt-3 space-y-3">

  {m?.prediction ? (
  <>
    <Metric label="Prediction" value={m.prediction} highlight />

    {conf !== null && (
      <div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-semibold">{conf}%</span>
        </div>

        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className={`h-full ${
              conf > 70
                ? "bg-destructive"
                : conf > 40
                ? "bg-warning"
                : "bg-success"
            }`}
            style={{ width: `${conf}%` }}
          />
        </div>
      </div>
    )}

    {typeof m?.probability === "number" && (
      <Metric
        label="Probability"
        value={`${(m.probability * 100).toFixed(1)}%`}
      />
    )}
  </>
) : (
  m?.status === "REVIEWED" && m?.doctorNotes && (
    <Metric
      label="Review type"
      value="Manual doctor review"
      highlight
    />
  )
)}

  {m?.createdAt && (
    <Metric
      label="Uploaded"
      value={new Date(m.createdAt).toLocaleString()}
    />
  )}

</div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Doctor</h3>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-accent text-primary">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{m?.doctorName ? `Dr. ${m.doctorName}` : "Awaiting assignment"}</div>
                {m?.doctorLicense && (
  <div className="text-xs text-muted-foreground">
    {m.doctorLicense}
  </div>
)}
              </div>
            </div>
          </Card>

          {m?.doctorNotes && (
            <Card>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Doctor notes</h3>
              <p className="mt-2 text-sm leading-relaxed">{m.doctorNotes}</p>
              {m.reviewedAt && <p className="mt-2 text-xs text-muted-foreground">Reviewed {new Date(m.reviewedAt).toLocaleString()}</p>}
            </Card>
          )}
        </div>
      </div>

      {m?.gradcamImage && (
  <Card>
    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      <Eye className="h-4 w-4" /> GradCAM visualization
    </div>

    <p className="mt-1 text-sm text-muted-foreground">
      Highlighted regions show where the AI model focused during analysis.
    </p>

    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <ImagePanel label="Original MRI" src={m?.imageUrl} />
      <ImagePanel
        label="GradCAM heatmap"
        src={`data:image/jpeg;base64,${m.gradcamImage}`}
        accent
      />
    </div>
  </Card>
)}

      <Disclaimer>This analysis is AI-generated and must be reviewed by a licensed medical professional.</Disclaimer>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-bold text-foreground" : "font-medium"}>{value}</span>
    </div>
  );
}

function ImagePanel({ label, src, accent }: { label: string; src?: string; accent?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-square w-full bg-gradient-to-br from-slate-900 to-slate-700 grid place-items-center">
        {src ? <img src={src} alt={label} className="h-full w-full object-contain" />
          : <Brain className={`h-16 w-16 ${accent ? "text-primary-glow/60" : "text-white/40"}`} />}
      </div>
      <div className="px-4 py-2.5 text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
