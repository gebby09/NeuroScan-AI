import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain, ShieldCheck, Eye, Stethoscope, FileText, Bell, Bot, LifeBuoy,
  ArrowRight, Upload, Sparkles, ClipboardCheck, Download, ChevronDown,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuroScan AI — Brain Tumor MRI Analysis Platform" },
      { name: "description", content: "AI-powered brain tumor MRI analysis with explainable GradCAM visualization and integrated doctor review workflows." },
      { property: "og:title", content: "NeuroScan AI — Brain Tumor MRI Analysis Platform" },
      { property: "og:description", content: "Advanced MRI analysis with explainable AI and medical review workflows." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Brain, title: "AI MRI Analysis", desc: "Automated tumor detection powered by deep learning models trained on clinical MRI data." },
  { icon: Eye, title: "GradCAM Visualization", desc: "Explainable AI heatmaps that show exactly which regions the model focused on." },
  { icon: Stethoscope, title: "Doctor Review Workflow", desc: "Secure review pipeline where licensed clinicians validate every AI analysis." },
  { icon: FileText, title: "PDF Medical Reports", desc: "Downloadable clinical-grade reports for records, referrals and second opinions." },
  { icon: Bell, title: "Real-time Notifications", desc: "Instant alerts when analyses complete and when your doctor finishes a review." },
  { icon: Bot, title: "Medical AI Assistant", desc: "24/7 informational chatbot built on Gemini for healthcare questions." },
  { icon: ShieldCheck, title: "Secure Healthcare Platform", desc: "JWT authentication, role-based access and HIPAA-conscious data handling." },
  { icon: LifeBuoy, title: "Integrated Support", desc: "Built-in ticketing keeps patients, doctors and admins in sync." },
];

const steps = [
  { icon: Upload, title: "Upload MRI", desc: "Drag & drop your scan in seconds." },
  { icon: Sparkles, title: "AI Analysis", desc: "Model predicts tumor presence." },
  { icon: Eye, title: "GradCAM", desc: "Visualize what the AI saw." },
  { icon: ClipboardCheck, title: "Doctor Review", desc: "Clinician validates results." },
  { icon: Download, title: "PDF Report", desc: "Download your full report." },
];

const faqs = [
  { q: "Is the AI analysis a medical diagnosis?", a: "No. The AI provides supportive analysis only. Every prediction must be reviewed by a licensed medical professional before clinical decisions are made." },
  { q: "What does GradCAM show me?", a: "GradCAM is a visualization technique that highlights the regions of an MRI the model attended to. It helps clinicians interpret why the model produced a given prediction." },
  { q: "Which file formats can I upload?", a: "Standard MRI image formats including PNG, JPG and JPEG. DICOM support is available for clinical workflows." },
  { q: "Who can see my MRI scans?", a: "Only you and your assigned doctor. Administrators can manage accounts but cannot view scan content unless required for support." },
  { q: "Is the chatbot a substitute for a doctor?", a: "No. The chatbot offers general health information only. Always consult your assigned physician for medical advice, diagnosis or treatment." },
  { q: "How long does an analysis take?", a: "Typically 30–90 seconds depending on image size and server load. You'll be notified the moment it completes." },
  { q: "Is my data encrypted?", a: "Yes. All traffic uses HTTPS in production, and authentication is handled with signed JWT tokens. Sensitive fields are protected at the database level." },
  { q: "Can I download my reports?", a: "Yes. Once a doctor reviews an analysis you can export a polished PDF report from the MRI details page." },
  { q: "How do I get a doctor assigned?", a: "An administrator pairs every patient with a clinician. You'll be notified the moment your doctor is assigned." },
  { q: "Can I switch doctors?", a: "Yes — open a support ticket and an admin will reassign you to another available clinician." },
  { q: "Does the model work on all MRI sequences?", a: "It is optimized for T1/T2 weighted axial brain MRI. Results on other sequences may be less reliable." },
  { q: "What confidence score should I trust?", a: "Confidence reflects model certainty, not clinical truth. Always rely on your doctor's review, regardless of the score." },
  { q: "How do I contact support?", a: "Use the in-app Support page after logging in. A ticket creates a thread directly with our team." },
  { q: "Is this platform HIPAA compliant?", a: "The platform is built with HIPAA-conscious controls. Compliance ultimately depends on your deployment configuration and signed BAAs with your hosting providers." },
  { q: "Can I delete my account?", a: "Yes. Contact support and your account along with associated scans will be removed in line with retention policies." },
  { q: "Do you store my images forever?", a: "Images are stored for as long as your account is active or as required by clinical retention policies." },
  { q: "What if the AI and my doctor disagree?", a: "Your doctor's clinical judgement always takes precedence. The AI is a supportive tool, not a decision maker." },
  { q: "Can doctors export bulk reports?", a: "Doctors can review and export reports per case. Bulk export tools are available to administrators on request." },
  { q: "Is the platform open source?", a: "The frontend is open for academic review. The model weights and clinical components are governed by separate licensing." },
  { q: "Where do I learn more?", a: "Reach out through the Support page or the contact links in the footer." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      <FAQSection />
      <DisclaimerStrip />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-hero text-primary-foreground shadow-glow">
            <Brain className="h-5 w-5" />
          </span>
          <span className="text-base">NeuroScan <span className="text-primary">AI</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#how" className="transition hover:text-foreground">How it works</a>
          <a href="#faq" className="transition hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden rounded-md px-4 py-2 text-sm font-medium text-foreground/80 transition hover:text-foreground sm:inline-flex">
            Sign in
          </Link>
          <Link to="/register" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:shadow-glow">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Explainable medical AI
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              AI-Powered <span className="text-gradient-hero">Brain Tumor</span> MRI Analysis
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Advanced MRI analysis with explainable GradCAM visualization and an integrated doctor review workflow — built for clinical teams, patients, and researchers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold transition hover:border-primary/40 hover:text-primary">
                Sign in
              </Link>
            </div>
            <p className="mt-6 max-w-md text-xs text-muted-foreground">
              AI analysis is supportive only and does not replace licensed medical professionals.
            </p>
          </div>
          <div className="relative">
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-0 rounded-3xl bg-gradient-hero opacity-90 shadow-elevated" />
              <div className="absolute inset-4 grid place-items-center rounded-2xl bg-card/95 backdrop-blur">
                <div className="animate-float text-center">
                  <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-gradient-hero text-primary-foreground shadow-glow animate-pulse-ring">
                    <Brain className="h-16 w-16" />
                  </div>
                  <div className="mt-6 text-sm font-medium text-muted-foreground">Neural analysis engine</div>
                  <div className="mt-1 text-lg font-semibold">Active</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-card px-4 py-3 shadow-medium">
                <div className="text-xs text-muted-foreground">Confidence</div>
                <div className="text-lg font-bold text-success">94.2%</div>
              </div>
              <div className="absolute -right-4 -top-4 rounded-xl bg-card px-4 py-3 shadow-medium">
                <div className="text-xs text-muted-foreground">Review</div>
                <div className="text-lg font-bold text-primary">In progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">A complete platform for clinical AI</h2>
        <p className="mt-3 text-muted-foreground">
          From upload to diagnosis, NeuroScan AI brings clinicians and patients onto a single, secure workflow.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary transition group-hover:bg-gradient-hero group-hover:text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-gradient-subtle">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">Five steps from MRI upload to a clinician-reviewed report.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-hero px-3 py-0.5 text-xs font-bold text-primary-foreground">
                Step {i + 1}
              </div>
              <div className="mx-auto mt-2 grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Frequently asked questions</h2>
        <p className="mt-3 text-muted-foreground">Everything you might want to know before using NeuroScan AI.</p>
      </div>
      <div className="mt-10 space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-accent/40"
            >
              <span className="font-medium">{f.q}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function DisclaimerStrip() {
  return (
    <section className="border-y border-warning/30 bg-warning/10">
      <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-warning-foreground/80">
        <strong className="font-semibold">Medical disclaimer:</strong> NeuroScan AI is a clinical decision-support tool.
        Always consult a licensed medical professional for diagnosis and treatment.
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Brain className="h-4 w-4" /></span>
            NeuroScan AI
          </div>
          <p className="mt-3 text-sm text-sidebar-foreground/70">
            Clinical-grade AI for brain tumor MRI analysis.
          </p>
        </div>
        <FooterCol title="Platform" links={[["Features", "#features"], ["How it works", "#how"], ["FAQ", "#faq"]]} />
        <FooterCol title="Legal" links={[["Privacy", "#"], ["Terms", "#"], ["Disclaimer", "#"]]} />
        <FooterCol title="Contact" links={[["Support", "#"], ["support@neuroscan.ai", "mailto:support@neuroscan.ai"]]} />
      </div>
      <div className="border-t border-sidebar-border/60">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-sidebar-foreground/60">
          © {new Date().getFullYear()} NeuroScan AI. For educational and research purposes.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-sidebar-foreground/70">
        {links.map(([label, href]) => (
          <li key={label}><a href={href} className="transition hover:text-sidebar-foreground">{label}</a></li>
        ))}
      </ul>
    </div>
  );
}
