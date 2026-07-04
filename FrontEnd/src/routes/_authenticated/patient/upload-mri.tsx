import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UploadCloud, FileImage, Loader2, X, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Card, Disclaimer } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/patient/upload-mri")({
  head: () => ({ meta: [{ title: "Upload MRI — NeuroScan AI" }] }),
  component: UploadMri,
});

function UploadMri() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);

  const choose = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/patient/mri/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      toast.success("MRI uploaded — analysis started");
      const id = res.data?.analysisId;
      if (id) navigate({ to: "/patient/mri/$id", params: { id: String(id) } });
      else navigate({ to: "/patient/mri-history" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Upload an MRI</h1>
        <p className="mt-1 text-sm text-muted-foreground">Drag and drop your brain MRI scan to begin AI analysis.</p>
      </div>

      <Disclaimer>
        This AI analysis is for informational purposes and does not replace a licensed medical professional. Always consult your assigned doctor for medical advice.
      </Disclaimer>

      <Card>
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); choose(e.dataTransfer.files?.[0] || null); }}
          onClick={() => inputRef.current?.click()}
          className={`grid cursor-pointer place-items-center rounded-xl border-2 border-dashed p-10 text-center transition ${
            drag ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
          }`}
        >
          <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.dcm,image/*" hidden
            onChange={(e) => choose(e.target.files?.[0] || null)} />
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-glow">
            <UploadCloud className="h-7 w-7" />
          </div>
          <div className="mt-4 text-base font-semibold">Drag & drop or click to browse</div>
          <div className="mt-1 text-sm text-muted-foreground">PNG, JPG, JPEG or DICOM • up to 50 MB</div>
        </div>

        {file && (
          <div className="mt-6 flex items-start gap-4 rounded-xl border border-border bg-background p-4">
            {preview ? (
              <img src={preview} alt="MRI preview" className="h-24 w-24 rounded-lg object-cover" />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-lg bg-accent text-primary">
                <FileImage className="h-8 w-8" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="truncate text-sm font-medium">{file.name}</div>
                <button onClick={() => { setFile(null); setPreview(null); }} disabled={uploading}
                  className="rounded p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              {uploading && (
                <div className="mt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div className="h-full bg-gradient-hero transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground">{progress}% — analyzing may take 1–2 minutes</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button disabled={!file || uploading} onClick={submit}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-glow disabled:opacity-50">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload MRI"}
          </button>
        </div>
      </Card>
    </div>
  );
}
