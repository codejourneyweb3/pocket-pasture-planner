import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/farm/kit";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [
    { title: "Reports — Kuku Ledger" },
    { name: "description", content: "Reports for your poultry farm." },
    { property: "og:title", content: "Reports — Kuku Ledger" },
    { property: "og:description", content: "Reports for your poultry farm." },
  ]}),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" sub="This section is coming next." />
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Not built yet.</div>
    </>
  );
}
