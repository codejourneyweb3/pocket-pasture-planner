import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/farm/kit";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [
    { title: "Documents — Kuku Ledger" },
    { name: "description", content: "Documents for your poultry farm." },
    { property: "og:title", content: "Documents — Kuku Ledger" },
    { property: "og:description", content: "Documents for your poultry farm." },
  ]}),
  component: DocumentsPage,
});

function DocumentsPage() {
  return (
    <>
      <PageHeader title="Documents" sub="This section is coming next." />
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Not built yet.</div>
    </>
  );
}
