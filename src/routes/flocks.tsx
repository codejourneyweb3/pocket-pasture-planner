import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Section, DataTable, Pill, FormDialog } from "@/components/farm/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useData, useUser } from "@/lib/hooks";
import { save, uid, today, type Flock } from "@/lib/db";
import { ageDays } from "@/lib/finance";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/flocks")({
  head: () => ({ meta: [
    { title: "Flocks — Kuku Ledger" },
    { name: "description", content: "Layer and broiler flocks with live counts, age and status." },
    { property: "og:title", content: "Flocks — Kuku Ledger" },
    { property: "og:description", content: "Layer and broiler flocks with live counts, age and status." },
  ]}),
  component: Flocks,
});

function Flocks() {
  const { name, role } = useUser();
  const nav = useNavigate();
  const [q, setQ] = useState(""); const [type, setType] = useState(""); const [status, setStatus] = useState("Active");
  const flocks = useData((db) => db.flocks.toArray()) ?? [];
  const rows = flocks.filter((f) => (!q || f.name.toLowerCase().includes(q.toLowerCase())) && (!type || f.type === type) && (!status || f.status === status));

  return (
    <>
      <PageHeader title="Flocks" sub={`${flocks.filter((f) => f.status === "Active").length} active`} actions={can(role, "flock.edit") &&
        <FormDialog title="Add flock" trigger={<Button size="lg"><Plus /> Add Flock</Button>}
          fields={[
            { name: "name", label: "Flock name / ID", required: true },
            { name: "type", label: "Flock type", type: "select", options: ["Layer", "Broiler"], required: true },
            { name: "breed", label: "Breed", required: true },
            { name: "dateReceived", label: "Date received", type: "date", default: today(), required: true },
            { name: "count", label: "Birds received", type: "number", required: true },
            { name: "supplier", label: "Chick supplier" },
            { name: "cost", label: "Cost per chick (UGX)", type: "number" },
            { name: "target", label: "Target weight (kg, broilers)", type: "number" },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
          onSubmit={async (v) => {
            const f: Flock = { id: uid(), name: (v['name'] ?? ''), type: (v['type'] ?? '') as Flock["type"], breed: (v['breed'] ?? ''), dateReceived: (v['dateReceived'] ?? ''), initialCount: +(v['count'] ?? ''), liveCount: +(v['count'] ?? ''), supplier: (v['supplier'] ?? ''), costPerChick: +(v['cost'] ?? '') || 0, status: "Active", health: "Good", notes: (v['notes'] ?? ''), ...(+(v['target'] ?? '') ? { targetWeightKg: +(v['target'] ?? '') } : {}) };
            await save("flocks", f, name, "created"); toast.success("Flock added");
          }} />} />
      <Section title="All flocks" action={
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-9 w-36 pl-8 sm:w-48" /></div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-md border bg-card px-2 text-sm"><option value="">All types</option><option>Layer</option><option>Broiler</option></select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border bg-card px-2 text-sm"><option value="">Any status</option><option>Active</option><option>Closed</option></select>
        </div>}>
        <DataTable rows={rows} onRow={(f) => nav({ to: "/flocks/$id", params: { id: f.id } })} cols={[
          { h: "Flock", c: (f) => <span className="font-medium">{f.name}</span> },
          { h: "Type", c: (f) => f.type }, { h: "Breed", c: (f) => f.breed },
          { h: "Received", c: (f) => f.dateReceived },
          { h: "Initial", c: (f) => f.initialCount.toLocaleString(), right: true },
          { h: "Live", c: (f) => <b>{f.liveCount.toLocaleString()}</b>, right: true },
          { h: "Age", c: (f) => `${ageDays(f.dateReceived)} d`, right: true },
          { h: "Status", c: (f) => <Pill>{f.status}</Pill> },
        ]} />
      </Section>
    </>
  );
}
