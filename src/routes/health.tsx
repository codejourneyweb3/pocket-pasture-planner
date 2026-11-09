import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/farm/kit";

export const Route = createFileRoute("/health")({
  head: () => ({ meta: [
    { title: "Health & Medication — Kuku Ledger" },
    { name: "description", content: "Health & Medication for your poultry farm." },
    { property: "og:title", content: "Health & Medication — Kuku Ledger" },
    { property: "og:description", content: "Health & Medication for your poultry farm." },
  ]}),
  component: HealthPage,
});

function HealthPage() {
  return (
    <>
      <PageHeader title="Health & Medication" sub="This section is coming next." />
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Not built yet.</div>
    </>
  );
}
