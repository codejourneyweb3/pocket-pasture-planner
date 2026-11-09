import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/farm/kit";

export const Route = createFileRoute("/cashup")({
  head: () => ({ meta: [
    { title: "Cash-up — Kuku Ledger" },
    { name: "description", content: "Cash-up for your poultry farm." },
    { property: "og:title", content: "Cash-up — Kuku Ledger" },
    { property: "og:description", content: "Cash-up for your poultry farm." },
  ]}),
  component: CashupPage,
});

function CashupPage() {
  return (
    <>
      <PageHeader title="Cash-up" sub="This section is coming next." />
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Not built yet.</div>
    </>
  );
}
