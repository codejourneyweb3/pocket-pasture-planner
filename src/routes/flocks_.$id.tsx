import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { PageHeader, Section, DataTable, Pill, Stat, Tabs } from "@/components/farm/kit";
import { Button } from "@/components/ui/button";
import { useData, useUser } from "@/lib/hooks";
import { save } from "@/lib/db";
import { ageDays, kg, saleTotal, ugx } from "@/lib/finance";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/flocks_/$id")({
  head: () => ({ meta: [
    { title: "Flock details — Kuku Ledger" },
    { name: "description", content: "Flock performance, health, feed, production and finances." },
    { property: "og:title", content: "Flock details — Kuku Ledger" },
    { property: "og:description", content: "Flock performance, health, feed, production and finances." },
  ]}),
  component: FlockDetail,
});

const TABS = ["Overview", "Daily Reports", "Health History", "Feed Consumption", "Production", "Weight Sampling", "Sales", "Expenses", "Financial Performance"];

function FlockDetail() {
  const { id } = Route.useParams();
  const { name, role } = useUser();
  const [tab, setTab] = useState("Overview");
  const d = useData(async (db) => ({
    flock: await db.flocks.get(id),
    reports: (await db.reports.where("flockId").equals(id).toArray()).sort((a, b) => b.date.localeCompare(a.date)),
    sales: await db.sales.where("flockId").equals(id).toArray(),
    expenses: await db.expenses.where("flockId").equals(id).toArray(),
    treatments: await db.treatments.where("flockId").equals(id).toArray(),
    vax: await db.vaccinations.where("flockId").equals(id).toArray(),
  }), [id]);
  if (!d) return null;
  const f = d.flock;
  if (!f) return <p>Flock not found.</p>;
  const sub = d.reports.filter((r) => r.status === "Submitted");
  const eggs = sub.reduce((a, r) => a + (r.eggs ?? 0), 0);
  const feedKg = sub.reduce((a, r) => a + (r.feedGivenKg ?? 0), 0);
  const feedCost = feedKg * 1850;
  const deaths = f.initialCount - f.liveCount;
  const mort = (deaths / f.initialCount) * 100;
  const income = d.sales.reduce((a, s) => a + saleTotal(s), 0);
  const costs = d.expenses.reduce((a, e) => a + e.amount, 0) + f.initialCount * f.costPerChick + feedCost;
  const latest = sub.find((r) => r.avgWeightKg);
  const growth = [...sub].reverse().filter((r) => r.avgWeightKg).map((r) => ({ d: r.date.slice(5), w: r.avgWeightKg }));
  const prod = [...sub].reverse().map((r) => ({ d: r.date.slice(5), eggs: r.eggs, rate: f.liveCount ? +(((r.eggs ?? 0) / f.liveCount) * 100).toFixed(1) : 0 }));
  const firstWeight = [...sub].reverse().find((r) => r.avgWeightKg)?.avgWeightKg ?? 0;
  const fcr = latest?.avgWeightKg ? feedKg / (f.liveCount * (latest.avgWeightKg - Math.min(firstWeight, 0.05))) : 0;
  const chart = (data: object[], key: string, ref?: number) => (
    <div className="h-64"><ResponsiveContainer><LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="d" fontSize={11} /><YAxis fontSize={11} /><Tooltip />
      {ref && <ReferenceLine y={ref} stroke="var(--harvest)" strokeDasharray="4 4" label={{ value: "Target", fontSize: 11 }} />}
      <Line dataKey={key} stroke="var(--chart-1)" strokeWidth={2} dot={false} />
    </LineChart></ResponsiveContainer></div>
  );

  return (
    <>
      <Link to="/flocks" className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Flocks</Link>
      <PageHeader title={f.name} sub={`${f.type} · ${f.breed} · received ${f.dateReceived} · day ${ageDays(f.dateReceived)}`}
        actions={<>
          <Pill>{f.status}</Pill><Pill>{f.health}</Pill>
          {f.status === "Active" && can(role, "flock.close") && (
            <Button variant="outline" onClick={async () => { if (confirm("Close this flock as sold out?")) { await save("flocks", { ...f, status: "Closed", liveCount: 0 }, name, "closed"); toast.success("Flock closed"); } }}>Close flock</Button>
          )}
        </>} />
      <Tabs tabs={TABS.filter((t) => f.type === "Layer" ? t !== "Weight Sampling" : t !== "Production")} active={tab} onChange={setTab} />

      {tab === "Overview" && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Live birds" value={f.liveCount.toLocaleString()} hint={`of ${f.initialCount.toLocaleString()}`} />
          <Stat label="Mortality" value={`${mort.toFixed(1)}%`} hint={`${deaths} birds`} tone={mort > 5 ? "bad" : "good"} />
          {f.type === "Layer" ? <>
            <Stat label="Eggs collected" value={eggs.toLocaleString()} hint="Last 14 days" />
            <Stat label="Feed cost / egg" value={eggs ? ugx(feedCost / eggs) : "—"} />
          </> : <>
            <Stat label="Avg weight" value={`${latest?.avgWeightKg ?? "—"} kg`} hint={`Target ${f.targetWeightKg} kg`} tone={(latest?.avgWeightKg ?? 0) >= (f.targetWeightKg ?? 99) ? "good" : "default"} />
            <Stat label="Feed conversion" value={fcr ? fcr.toFixed(2) : "—"} hint={`Uniformity ${latest?.uniformity ?? "—"}%`} />
          </>}
        </div>
      )}
      {tab === "Daily Reports" && <Section title="Daily reports"><DataTable rows={d.reports} cols={[
        { h: "Date", c: (r) => r.date }, { h: "Manager", c: (r) => r.manager }, { h: "Condition", c: (r) => r.condition ?? "—" },
        { h: "Deaths", c: (r) => r.deaths ?? 0, right: true }, { h: "Feed", c: (r) => kg(r.feedGivenKg ?? 0), right: true },
        { h: f.type === "Layer" ? "Eggs" : "Avg kg", c: (r) => (f.type === "Layer" ? r.eggs : r.avgWeightKg) ?? "—", right: true },
        { h: "Status", c: (r) => <Pill>{r.status}</Pill> },
      ]} /></Section>}
      {tab === "Health History" && <Section title="Treatments & vaccinations"><DataTable rows={[
        ...d.treatments.map((t) => ({ date: t.date, what: t.product, kind: "Treatment", detail: `${t.dosage} · withdrawal ${t.withdrawalDays} d`, st: "Done" })),
        ...d.vax.map((v) => ({ date: v.dueDate, what: v.vaccine, kind: "Vaccination", detail: "", st: v.done ? "Done" : "Due" })),
        ...sub.filter((r) => (r.sickBirds ?? 0) > 2).map((r) => ({ date: r.date, what: r.condition ?? "", kind: "Observation", detail: `${r.sickBirds} sick`, st: "Watch" })),
      ].sort((a, b) => b.date.localeCompare(a.date))} cols={[
        { h: "Date", c: (r) => r.date }, { h: "Type", c: (r) => r.kind }, { h: "Item", c: (r) => r.what }, { h: "Detail", c: (r) => r.detail }, { h: "Status", c: (r) => <Pill>{r.st}</Pill> },
      ]} /></Section>}
      {tab === "Feed Consumption" && <Section title="Feed consumption">
        <div className="mb-4 grid grid-cols-3 gap-3"><Stat label="Total feed" value={kg(feedKg)} /><Stat label="Per bird" value={`${(feedKg / f.liveCount || 0).toFixed(2)} kg`} /><Stat label="Feed cost / bird" value={ugx(feedCost / f.liveCount || 0)} /></div>
        {chart([...sub].reverse().map((r) => ({ d: r.date.slice(5), kg: r.feedGivenKg })), "kg")}
      </Section>}
      {tab === "Production" && <Section title="Laying rate (%)">{chart(prod, "rate")}</Section>}
      {tab === "Weight Sampling" && <Section title="Average weight (kg)">{chart(growth, "w", f.targetWeightKg)}</Section>}
      {tab === "Sales" && <Section title="Sales from this flock"><DataTable rows={d.sales} cols={[
        { h: "Ref", c: (s) => s.ref }, { h: "Date", c: (s) => s.date }, { h: "Product", c: (s) => s.product }, { h: "Qty", c: (s) => s.quantity, right: true }, { h: "Total", c: (s) => ugx(saleTotal(s)), right: true },
      ]} /></Section>}
      {tab === "Expenses" && <Section title="Expenses linked to this flock"><DataTable rows={d.expenses} cols={[
        { h: "Date", c: (e) => e.date }, { h: "Category", c: (e) => e.category }, { h: "Description", c: (e) => e.description }, { h: "Amount", c: (e) => ugx(e.amount), right: true },
      ]} /></Section>}
      {tab === "Financial Performance" && <Section title="Profit and loss (estimate)">
        <dl className="max-w-md space-y-2 text-sm">
          {[["Sales income", income], ["Chick cost", -f.initialCount * f.costPerChick], ["Feed (est. UGX 1,850/kg)", -feedCost], ["Other linked expenses", -d.expenses.reduce((a, e) => a + e.amount, 0)]].map(([l, v]) => (
            <div key={l as string} className="flex justify-between border-b pb-2"><dt className="text-muted-foreground">{l}</dt><dd className="num">{ugx(v as number)}</dd></div>
          ))}
          <div className="flex justify-between pt-1 text-base font-semibold"><dt>Net</dt><dd className={income - costs >= 0 ? "num text-success" : "num text-destructive"}>{ugx(income - costs)}</dd></div>
        </dl>
      </Section>}
    </>
  );
}
