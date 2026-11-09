import { createFileRoute, Link } from "@tanstack/react-router";
import { Bird, Egg, Wheat, TrendingUp, Receipt, HandCoins, ClipboardPlus, Plus, ShoppingCart, Wallet, Truck, AlertTriangle } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Stat, Section, Pill } from "@/components/farm/kit";
import { Button } from "@/components/ui/button";
import { useData, useUser } from "@/lib/hooks";
import { today } from "@/lib/db";
import { ageDays, customerBalance, kg, paidFor, saleTotal, ugx } from "@/lib/finance";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Farm Overview — Kuku Ledger" },
    { name: "description", content: "Live birds, eggs, feed stock, money in and out, and what needs attention today." },
    { property: "og:title", content: "Farm Overview — Kuku Ledger" },
    { property: "og:description", content: "Live birds, eggs, feed stock, money in and out, and what needs attention today." },
  ]}),
  component: Overview,
});

function Overview() {
  const { name } = useUser();
  const data = useData(async (db) => ({
    flocks: await db.flocks.where("status").equals("Active").toArray(),
    reports: await db.reports.toArray(),
    feed: await db.feedStock.toArray(),
    sales: await db.sales.toArray(),
    payments: await db.payments.toArray(),
    expenses: await db.expenses.toArray(),
    customers: await db.customers.toArray(),
    alerts: await db.alerts.filter((a) => !a.resolved).toArray(),
  }));
  if (!data) return null;
  const t = today();
  const live = data.flocks.reduce((a, f) => a + f.liveCount, 0);
  const todays = data.reports.filter((r) => r.date === t && r.status === "Submitted");
  const eggs = todays.reduce((a, r) => a + (r.eggs ?? 0), 0);
  const feedKg = data.feed.reduce((a, f) => a + f.quantityKg, 0);
  const salesToday = data.sales.filter((s) => s.date === t).reduce((a, s) => a + saleTotal(s), 0);
  const expToday = data.expenses.filter((e) => e.date === t).reduce((a, e) => a + e.amount, 0);
  const owed = data.customers.reduce((a, c) => a + customerBalance(c.id, data.sales, data.payments), 0);
  const income = data.sales.reduce((a, s) => a + saleTotal(s), 0);
  const spent = data.expenses.reduce((a, e) => a + e.amount, 0);
  const supplierBal = data.expenses.reduce((a, e) => a + (e.amount - e.paid), 0);
  const cashIn = data.sales.reduce((a, s) => a + paidFor(s.id, data.payments), 0);

  const days = [...new Set(data.reports.map((r) => r.date))].sort().slice(-14);
  const trend = days.map((d) => {
    const rs = data.reports.filter((r) => r.date === d);
    const layers = rs.filter((r) => r.eggs !== undefined);
    const br = rs.find((r) => r.avgWeightKg);
    return { d: d.slice(5), eggs: layers.reduce((a, r) => a + (r.eggs ?? 0), 0), broken: layers.reduce((a, r) => a + (r.broken ?? 0), 0), weight: br?.avgWeightKg ?? null, deaths: rs.reduce((a, r) => a + (r.deaths ?? 0), 0) };
  });
  const layerLive = data.flocks.filter((f) => f.type === "Layer").reduce((a, f) => a + f.liveCount, 0);
  const layRate = layerLive ? (eggs / layerLive) * 100 : 0;
  const broiler = data.flocks.find((f) => f.type === "Broiler");
  const lastBr = broiler && data.reports.filter((r) => r.flockId === broiler.id && r.avgWeightKg).sort((a, b) => b.date.localeCompare(a.date))[0];

  const quick = [
    { to: "/daily/new", label: "Daily Report", icon: ClipboardPlus },
    { to: "/flocks", label: "Add Flock", icon: Plus },
    { to: "/sales", label: "Record Sale", icon: ShoppingCart },
    { to: "/expenses", label: "Record Expense", icon: Receipt },
    { to: "/customers", label: "Record Payment", icon: Wallet },
    { to: "/feed", label: "Feed Delivery", icon: Truck },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title={`Good day, ${name}`} sub={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        actions={<Button asChild size="lg"><Link to="/daily/new"><ClipboardPlus /> Start Daily Report</Link></Button>} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Live birds" icon={<Bird />} value={live.toLocaleString()} hint={`${data.flocks.length} active flocks`} />
        <Stat label="Eggs today" icon={<Egg />} value={eggs.toLocaleString()} hint={todays.length ? `${layRate.toFixed(1)}% laying rate` : "No report yet today"} tone={todays.length ? "good" : "warn"} />
        <Stat label="Feed stock" icon={<Wheat />} value={kg(feedKg)} hint={data.feed.some((f) => f.quantityKg < f.reorderKg) ? "Below reorder level" : "Stock OK"} tone={data.feed.some((f) => f.quantityKg < f.reorderKg) ? "bad" : "good"} />
        <Stat label="Sales today" icon={<TrendingUp />} value={ugx(salesToday)} />
        <Stat label="Expenses today" icon={<Receipt />} value={ugx(expToday)} />
        <Stat label="Owed to farm" icon={<HandCoins />} value={ugx(owed)} tone="warn" hint="Customer balances" />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {quick.map((q) => (
          <Link key={q.label} to={q.to} className="flex flex-col items-center gap-2 rounded-lg border bg-card p-3 text-center text-xs font-medium hover:border-secondary hover:bg-accent">
            <q.icon className="size-5 text-secondary" />{q.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Egg production — 14 days" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="d" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Area dataKey="eggs" name="Eggs" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} strokeWidth={2} />
                <Area dataKey="broken" name="Broken" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {broiler && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm sm:grid-cols-4">
              <div><div className="text-xs text-muted-foreground">{broiler.name} avg weight</div><div className="num font-semibold">{lastBr?.avgWeightKg ?? "—"} kg</div></div>
              <div><div className="text-xs text-muted-foreground">Target</div><div className="num font-semibold">{broiler.targetWeightKg} kg</div></div>
              <div><div className="text-xs text-muted-foreground">Mortality</div><div className="num font-semibold">{(((broiler.initialCount - broiler.liveCount) / broiler.initialCount) * 100).toFixed(1)}%</div></div>
              <div><div className="text-xs text-muted-foreground">Uniformity</div><div className="num font-semibold">{lastBr?.uniformity ?? "—"}%</div></div>
            </div>
          )}
        </Section>

        <Section title="Needs attention" action={<Link to="/alerts" className="text-xs font-medium text-primary">View all</Link>}>
          <ul className="space-y-3">
            {data.alerts.slice(0, 5).map((a) => (
              <li key={a.id} className="flex gap-3">
                <AlertTriangle className={a.severity === "High" ? "mt-0.5 size-4 shrink-0 text-destructive" : "mt-0.5 size-4 shrink-0 text-warning"} />
                <div className="text-sm"><div className="font-medium">{a.type}</div><div className="text-muted-foreground">{a.description}</div></div>
              </li>
            ))}
            {!data.alerts.length && <li className="text-sm text-muted-foreground">All clear.</li>}
          </ul>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Active flocks" className="lg:col-span-2" action={<Link to="/flocks" className="text-xs font-medium text-primary">All flocks</Link>}>
          <div className="grid gap-3 sm:grid-cols-3">
            {data.flocks.map((f) => (
              <Link key={f.id} to="/flocks/$id" params={{ id: f.id }} className="rounded-md border p-3 hover:border-secondary">
                <div className="flex items-center justify-between"><span className="font-medium">{f.name}</span><Pill>{f.health}</Pill></div>
                <div className="mt-1 text-xs text-muted-foreground">{f.type} · {f.breed}</div>
                <div className="mt-3 flex items-end justify-between"><span className="num font-display text-xl font-semibold">{f.liveCount.toLocaleString()}</span><span className="text-xs text-muted-foreground">Day {ageDays(f.dateReceived)}</span></div>
              </Link>
            ))}
          </div>
        </Section>
        <Section title="Money position">
          <div className="h-36">
            <ResponsiveContainer>
              <BarChart data={[{ n: "Income", v: income }, { n: "Expenses", v: spent }]} layout="vertical">
                <XAxis type="number" hide /><YAxis type="category" dataKey="n" fontSize={11} width={70} stroke="var(--muted-foreground)" />
                <Tooltip formatter={(v: number) => ugx(v)} />
                <Bar dataKey="v" fill="var(--chart-1)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Estimated profit</dt><dd className="num font-semibold text-success">{ugx(income - spent)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Cash received</dt><dd className="num">{ugx(cashIn)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Customers owe</dt><dd className="num text-warning">{ugx(owed)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">We owe suppliers</dt><dd className="num text-destructive">{ugx(supplierBal)}</dd></div>
          </dl>
        </Section>
      </div>
    </div>
  );
}
