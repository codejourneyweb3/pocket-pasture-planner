import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, CloudOff, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/farm/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useData, useUser } from "@/lib/hooks";
import { getDb, save, today, uid, type DailyReport } from "@/lib/db";

export const Route = createFileRoute("/daily_/new")({
  validateSearch: (s: Record<string, unknown>) => ({ draft: typeof s.draft === "string" ? s.draft : undefined }),
  head: () => ({ meta: [
    { title: "New Daily Report — Kuku Ledger" },
    { name: "description", content: "Step-by-step daily flock report, saved on your device as you go." },
    { property: "og:title", content: "New Daily Report — Kuku Ledger" },
    { property: "og:description", content: "Step-by-step daily flock report, saved on your device as you go." },
  ]}),
  component: NewReport,
});

const STEPS = ["Report", "Health", "Mortality", "Feed", "Water & house", "Production", "Notes", "Review"];

function NewReport() {
  const { draft } = Route.useSearch();
  const { name } = useUser();
  const nav = useNavigate();
  const flocks = useData((db) => db.flocks.where("status").equals("Active").toArray()) ?? [];
  const [r, setR] = useState<DailyReport | null>(null);
  const [step, setStep] = useState(0);
  const [savedAt, setSavedAt] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    (async () => {
      const existing = draft ? await getDb().reports.get(draft) : undefined;
      if (existing) { setR(existing); setStep(existing.step ?? 0); }
      else setR({ id: uid(), flockId: "", date: today(), manager: name, status: "Draft" });
    })();
  }, [draft, name]);

  const flock = flocks.find((f) => f.id === r?.flockId);
  const set = (patch: Partial<DailyReport>) => setR((p) => (p ? { ...p, ...patch } : p));

  // Autosave drafts locally whenever anything changes.
  useEffect(() => {
    if (!r || !r.flockId || r.status !== "Draft") return;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => { await getDb().reports.put({ ...r, step }); setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })); }, 500);
  }, [r, step]);

  if (!r) return null;
  const num = (k: keyof DailyReport) => ({ type: "number", inputMode: "decimal" as const, className: "h-12 text-lg", value: (r[k] as number | undefined) ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => set({ [k]: e.target.value === "" ? undefined : +e.target.value }) });
  const txt = (k: keyof DailyReport) => ({ className: "h-12", value: (r[k] as string | undefined) ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => set({ [k]: e.target.value }) });
  const choice = (k: keyof DailyReport, opts: string[]) => (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => <button type="button" key={o} onClick={() => set({ [k]: o })} className={cn("rounded-md border px-4 py-2.5 text-sm font-medium", r[k] === o ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>{o}</button>)}
    </div>
  );
  const F = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="grid gap-1.5"><Label>{label}</Label>{children}</div>;
  const canNext = step !== 0 || (r.flockId && r.date);

  const submit = async () => {
    const final: DailyReport = { ...r, status: "Submitted", step: undefined };
    await save("reports", final, name, "submitted");
    if (flock && r.deaths) await save("flocks", { ...flock, liveCount: Math.max(0, flock.liveCount - r.deaths) }, name, "mortality");
    if (r.feedType && r.feedGivenKg) {
      const stock = await getDb().feedStock.get(r.feedType);
      if (stock) await save("feedStock", { ...stock, quantityKg: Math.max(0, stock.quantityKg - r.feedGivenKg) }, name, "consumed");
    }
    toast.success("Report saved on this device — it will sync automatically.");
    void nav({ to: "/daily" });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Daily Report" sub={flock ? `${flock.name} · ${r.date}` : "Choose a flock to begin"}
        actions={savedAt ? <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Save className="size-3.5" /> Draft saved {savedAt}</span> : <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CloudOff className="size-3.5" /> Saves on device</span>} />
      <ol className="mb-6 flex gap-1">
        {STEPS.map((s, i) => <li key={s} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-secondary" : "bg-border")} title={s} />)}
      </ol>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-secondary">Step {step + 1} of {STEPS.length}</div>
      <h2 className="mb-5 text-xl font-semibold">{STEPS[step]}</h2>

      <div className="space-y-5 rounded-lg border bg-card p-5">
        {step === 0 && <>
          <F label="Flock">
            <div className="grid gap-2 sm:grid-cols-2">
              {flocks.map((f) => <button type="button" key={f.id} onClick={() => set({ flockId: f.id })} className={cn("rounded-md border p-3 text-left", r.flockId === f.id ? "border-primary bg-accent" : "hover:bg-muted")}><div className="font-medium">{f.name}</div><div className="text-xs text-muted-foreground">{f.type} · {f.liveCount} birds</div></button>)}
            </div>
          </F>
          <div className="grid gap-4 sm:grid-cols-2"><F label="Report date"><Input type="date" {...txt("date")} /></F><F label="Manager"><Input {...txt("manager")} /></F></div>
        </>}
        {step === 1 && <>
          <F label="General flock condition">{choice("condition", ["Active", "Dull", "Coughing", "Other"])}</F>
          <F label="Number of sick birds"><Input {...num("sickBirds")} /></F>
          <F label="Observations"><Textarea value={r.observations ?? ""} onChange={(e) => set({ observations: e.target.value })} /></F>
        </>}
        {step === 2 && <>
          <F label="Number of deaths"><Input {...num("deaths")} /></F>
          {(r.deaths ?? 0) > 0 && <>
            <F label="Suspected cause">{choice("deathCause", ["Unknown", "Disease", "Heat stress", "Predator", "Injury"])}</F>
            <F label="Disposal method">{choice("disposal", ["Burial", "Burning", "Pit"])}</F>
          </>}
        </>}
        {step === 3 && <>
          <F label="Feed type">{choice("feedType", flock?.type === "Broiler" ? ["Broiler Starter", "Broiler Grower", "Broiler Finisher"] : ["Chick Starter", "Layers Mash", "Growers Mash"])}</F>
          <div className="grid gap-4 sm:grid-cols-2"><F label="Feed given today (kg)"><Input {...num("feedGivenKg")} /></F><F label="Feed remaining (kg)"><Input {...num("feedRemainingKg")} /></F></div>
        </>}
        {step === 4 && <>
          <div className="grid gap-4 sm:grid-cols-2"><F label="Water consumed (L)"><Input {...num("waterL")} /></F><F label="House temperature (°C)"><Input {...num("temperatureC")} /></F></div>
          <F label="Ventilation">{choice("ventilation", ["Good", "Fair", "Poor"])}</F>
          <F label="Litter condition">{choice("litter", ["Dry", "Damp", "Wet"])}</F>
        </>}
        {step === 5 && (flock?.type === "Layer" ? <div className="grid gap-4 sm:grid-cols-3">
          <F label="Eggs collected"><Input {...num("eggs")} /></F><F label="Broken"><Input {...num("broken")} /></F><F label="Cracked"><Input {...num("cracked")} /></F>
          {r.eggs ? <p className="text-sm text-muted-foreground sm:col-span-3">Laying rate: <b className="num text-foreground">{((r.eggs / (flock.liveCount || 1)) * 100).toFixed(1)}%</b> · {Math.floor((r.eggs - (r.broken ?? 0) - (r.cracked ?? 0)) / 30)} good trays</p> : null}
        </div> : <div className="grid gap-4 sm:grid-cols-2">
          <p className="text-sm text-muted-foreground sm:col-span-2">Weigh a sample of birds (10 or more) and enter the result.</p>
          <F label="Average weight (kg)"><Input {...num("avgWeightKg")} /></F><F label="Uniformity (%)"><Input {...num("uniformity")} /></F>
          {r.avgWeightKg && flock?.targetWeightKg ? <p className="text-sm sm:col-span-2">{Math.round((r.avgWeightKg / flock.targetWeightKg) * 100)}% of target weight ({flock.targetWeightKg} kg)</p> : null}
        </div>)}
        {step === 6 && <>
          <F label="General notes / unusual incidents"><Textarea rows={4} value={r.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} /></F>
          <F label="Photos"><Input type="file" accept="image/*" capture="environment" multiple className="h-12" onChange={(e) => setPhotos([...e.target.files ?? []].map((f) => URL.createObjectURL(f)))} /></F>
          {photos.length > 0 && <div className="flex gap-2">{photos.map((p) => <img key={p} src={p} alt="Attached" className="size-20 rounded-md object-cover" />)}</div>}
        </>}
        {step === 7 && <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {([["Flock", flock?.name], ["Date", r.date], ["Condition", r.condition], ["Sick birds", r.sickBirds], ["Deaths", r.deaths], ["Cause", r.deathCause], ["Feed", r.feedType && `${r.feedGivenKg ?? 0} kg ${r.feedType}`], ["Water", r.waterL && `${r.waterL} L`], ["Temp", r.temperatureC && `${r.temperatureC} °C`],
            ...(flock?.type === "Layer" ? [["Eggs", r.eggs], ["Broken / cracked", `${r.broken ?? 0} / ${r.cracked ?? 0}`]] : [["Avg weight", r.avgWeightKg && `${r.avgWeightKg} kg`], ["Uniformity", r.uniformity && `${r.uniformity}%`]]), ["Notes", r.notes]] as [string, unknown][]).map(([k, v]) => (
            <div key={k} className="border-b pb-2"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{(v as string) ?? "—"}</dd></div>
          ))}
        </dl>}
      </div>

      <div className="sticky bottom-20 mt-6 flex gap-3 lg:bottom-4">
        <Button variant="outline" size="lg" className="h-12 flex-1" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft /> Back</Button>
        {step < STEPS.length - 1
          ? <Button size="lg" className="h-12 flex-[2]" disabled={!canNext} onClick={() => setStep(step + 1)}>Next <ChevronRight /></Button>
          : <Button size="lg" className="h-12 flex-[2]" onClick={submit}><Check /> Save report</Button>}
      </div>
    </div>
  );
}
