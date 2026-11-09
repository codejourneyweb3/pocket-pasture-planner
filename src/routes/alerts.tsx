import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/farm/kit";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [
    { title: "Alerts — Kuku Ledger" },
    { name: "description", content: "Alerts for your poultry farm." },
    { property: "og:title", content: "Alerts — Kuku Ledger" },
    { property: "og:description", content: "Alerts for your poultry farm." },
  ]}),
  component: AlertsPage,
});

function AlertsPage() {
  return (
    <>
      <PageHeader title="Alerts" sub="This section is coming next." />
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Not built yet.</div>
    </>
  );
}
