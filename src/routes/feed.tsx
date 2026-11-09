import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/farm/kit";

export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [
    { title: "Feed & Inventory — Kuku Ledger" },
    { name: "description", content: "Feed & Inventory for your poultry farm." },
    { property: "og:title", content: "Feed & Inventory — Kuku Ledger" },
    { property: "og:description", content: "Feed & Inventory for your poultry farm." },
  ]}),
  component: FeedPage,
});

function FeedPage() {
  return (
    <>
      <PageHeader title="Feed & Inventory" sub="This section is coming next." />
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Not built yet.</div>
    </>
  );
}
