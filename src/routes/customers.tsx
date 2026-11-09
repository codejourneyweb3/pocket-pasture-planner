import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/farm/kit";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [
    { title: "Customers — Kuku Ledger" },
    { name: "description", content: "Customers for your poultry farm." },
    { property: "og:title", content: "Customers — Kuku Ledger" },
    { property: "og:description", content: "Customers for your poultry farm." },
  ]}),
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <>
      <PageHeader title="Customers" sub="This section is coming next." />
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Not built yet.</div>
    </>
  );
}
