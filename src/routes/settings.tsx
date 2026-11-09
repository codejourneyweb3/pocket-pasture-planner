import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/farm/kit";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — Kuku Ledger" },
    { name: "description", content: "Settings for your poultry farm." },
    { property: "og:title", content: "Settings — Kuku Ledger" },
    { property: "og:description", content: "Settings for your poultry farm." },
  ]}),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" sub="This section is coming next." />
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Not built yet.</div>
    </>
  );
}
