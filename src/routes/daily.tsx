import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardPlus } from "lucide-react";
import { PageHeader, Section, DataTable, Pill } from "@/components/farm/kit";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/hooks";

export const Route = createFileRoute("/daily")({
  head: () => ({ meta: [
    { title: "Daily Operations — Kuku Ledger" },
    { name: "description", content: "Daily flock reports: health, mortality, feed, water and production." },
    { property: "og:title", content: "Daily Operations — Kuku Ledger" },
    { property: "og:description", content: "Daily flock reports: health, mortality, feed, water and production." },
  ]}),
  component: Daily,
});

function Daily() {
  const nav = useNavigate();
  const [flock, setFlock] = useState("");
  const d = useData(async (db) => ({ reports: await db.reports.orderBy("date").reverse().toArray(), flocks: await db.flocks.toArray() }));
  if (!d) return null;
  const fname = (id: string) => d.flocks.find((f) => f.id === id)?.name ?? "—";
  const drafts = d.reports.filter((r) => r.status === "Draft");
  const rows = d.reports.filter((r) => !flock || r.flockId === flock).slice(0, 80);
  return (
    <>
      <PageHeader title="Daily Operations" sub="One report per flock, every day." actions={<Button asChild size="lg"><Link to="/daily/new" search={{ draft: undefined }}><ClipboardPlus /> Start Daily Report</Link></Button>} />
      {drafts.length > 0 && (
        <div className="mb-6 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <div className="mb-2 text-sm font-semibold">Unfinished reports</div>
          <div className="flex flex-wrap gap-2">
            {drafts.map((r) => <Button key={r.id} variant="outline" size="sm" asChild><Link to="/daily/new" search={{ draft: r.id }}>Resume {fname(r.flockId)} · {r.date}</Link></Button>)}
          </div>
        </div>
      )}
      <Section title="Reports" action={
        <select value={flock} onChange={(e) => setFlock(e.target.value)} className="h-9 rounded-md border bg-card px-2 text-sm">
          <option value="">All flocks</option>{d.flocks.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>}>
        <DataTable rows={rows} onRow={(r) => r.status === "Draft" ? nav({ to: "/daily/new", search: { draft: r.id } }) : nav({ to: "/flocks/$id", params: { id: r.flockId } })} cols={[
          { h: "Date", c: (r) => r.date }, { h: "Flock", c: (r) => <span className="font-medium">{fname(r.flockId)}</span> },
          { h: "Manager", c: (r) => r.manager }, { h: "Deaths", c: (r) => r.deaths ?? 0, right: true },
          { h: "Eggs / Avg kg", c: (r) => r.eggs ?? r.avgWeightKg ?? "—", right: true },
          { h: "Status", c: (r) => <Pill>{r.status === "Submitted" ? "Submitted" : "Draft"}</Pill> },
        ]} />
      </Section>
    </>
  );
}
