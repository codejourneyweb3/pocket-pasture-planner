import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/farm/kit";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [
    { title: "Expenses — Kuku Ledger" },
    { name: "description", content: "Expenses for your poultry farm." },
    { property: "og:title", content: "Expenses — Kuku Ledger" },
    { property: "og:description", content: "Expenses for your poultry farm." },
  ]}),
  component: ExpensesPage,
});

function ExpensesPage() {
  return (
    <>
      <PageHeader title="Expenses" sub="This section is coming next." />
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Not built yet.</div>
    </>
  );
}
