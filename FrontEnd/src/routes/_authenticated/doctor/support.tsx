import { createFileRoute } from "@tanstack/react-router";
import { SupportPage } from "@/components/shared/SupportPage";

export const Route = createFileRoute("/_authenticated/doctor/support")({
  head: () => ({ meta: [{ title: "Support — NeuroScan AI" }] }),
  component: SupportPage,
});
