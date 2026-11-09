import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/farm/kit";

export const Route = createFileRoute("/sales")({
  head: () => ({ meta: [
    { title: "Sales — Kuku Ledger" },
    { name: "description", content: "Sales for your poultry farm." },
    { property: "og:title", content: "Sales — Kuku Ledger" },
    { property: "og:description", content: "Sales for your poultry farm." },
  ]}),
  component: SalesPage,
});

function SalesPage() {
  return (
    <>
      <PageHeader title="Sales" sub="This section is coming next." />
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Not built yet.</div>
    </>
  );
}
