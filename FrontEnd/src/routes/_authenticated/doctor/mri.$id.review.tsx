import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Card, Badge } from "@/components/ui-bits";
import { getDoctorMri, submitMriReview, analyzeMri } from "@/lib/api/doctor";
import type { MriItem } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/doctor/mri/$id/review")({
  head: () => ({ meta: [{ title: "Review MRI — NeuroScan AI" }] }),
  component: ReviewMri,
});

function ReviewMri() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [mri, setMri] = useState<MriItem | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    getDoctorMri(id).then((d) => {
      setMri(d || null);
      setNotes(d?.doctorNotes || "");
    }).catch(() => {});
  }, [id]);

  const submit = async () => {
    setSubmitting(true);
    try {
      await submitMriReview(id, notes);
      toast.success("Review submitted");
      navigate({ to: "/doctor/pending-mri" });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to submit");
    } finally { setSubmitting(false); setConfirm(false); }
  };

  

  const analyze = async () => {
  try {
    await analyzeMri(id);

    toast.success("MRI analyzed successfully");

    const updated = await getDoctorMri(id);
    setMri(updated);

  } catch (e: any) {
    toast.error(e?.response?.data?.message || "Analysis failed");
  }
};

  if (!mri) {
    return <div className="grid min-h-[40vh] place-items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/doctor/pending-mri" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to pending
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Review MRI</h1>
        </div>
        <Badge status={mri.status || "PENDING"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Original MRI</h2>
          <div className="mt-3 aspect-square overflow-hidden rounded-lg border border-border bg-muted">
            {mri.imageUrl
              ? <img src={mri.imageUrl} alt="MRI scan" className="h-full w-full object-cover" />
              : <div className="grid h-full place-items-center text-sm text-muted-foreground">No image</div>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">AI analysis</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-muted-foreground">Prediction</dt><dd className="font-semibold">{mri.prediction || "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Confidence</dt><dd className="font-semibold">{mri.confidence != null ? `${Math.round(mri.confidence * 100)}%` : "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Probability</dt><dd className="font-semibold">{mri.probability != null ? `${Math.round(mri.probability * 100)}%` : "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Status</dt><dd className="font-semibold">{mri.status || "—"}</dd></div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Patient info</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{mri.patientName || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{mri.patientEmail || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Uploaded</dt><dd className="font-medium">{mri.createdAt ? new Date(mri.createdAt).toLocaleString() : "—"}</dd></div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">GradCAM</h2>
            <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-border bg-muted">
              {mri.gradcamImage
  ? (
      <img
        src={`data:image/jpeg;base64,${mri.gradcamImage}`}
        alt="GradCAM heatmap"
        className="h-full w-full object-contain"
      />
    )
  : (
      <div className="grid h-full place-items-center text-sm text-muted-foreground">
        No heatmap
      </div>
    )}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Doctor notes</h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={8}
          placeholder="Document your clinical interpretation, recommended next steps, and follow-up plan…"
          className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <div className="mt-4 flex flex-wrap justify-end gap-2">

  {mri.status === "PENDING" && (
    <button
      onClick={analyze}
      className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
    >
      Analyze MRI
    </button>
  )}

  <Link
    to="/doctor/pending-mri"
    className="rounded-md border border-border px-4 py-2 text-sm font-medium"
  >
    Back
  </Link>

  

  <button
    onClick={() => setConfirm(true)}
    disabled={!notes.trim()}
    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:shadow-glow"
  >
    <Send className="h-4 w-4" />
    Submit review
  </button>

</div>
      </Card>

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-elevated">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div className="font-semibold">Submit review?</div>
              <button onClick={() => setConfirm(false)} className="rounded p-1 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-sm text-muted-foreground">Your review will be finalized and shared with the patient. This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirm(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium">Cancel</button>
                <button onClick={submit} disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Confirm submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
