import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, tone = "default", icon }: {
  label: string; value: ReactNode; hint?: ReactNode; tone?: "default" | "good" | "warn" | "bad"; icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        {icon && <span className="text-secondary [&_svg]:size-4">{icon}</span>}
      </div>
      <div className="num mt-2 font-display text-2xl font-semibold text-foreground">{value}</div>
      {hint && (
        <div className={cn("mt-1 text-xs", {
          "text-muted-foreground": tone === "default", "text-success": tone === "good",
          "text-warning": tone === "warn", "text-destructive": tone === "bad",
        })}>{hint}</div>
      )}
    </div>
  );
}

const toneMap: Record<string, string> = {
  good: "bg-success/12 text-success border-success/25",
  warn: "bg-warning/12 text-warning border-warning/25",
  bad: "bg-destructive/10 text-destructive border-destructive/25",
  info: "bg-accent text-accent-foreground border-transparent",
  muted: "bg-muted text-muted-foreground border-transparent",
};
const autoTone: Record<string, string> = {
  Paid: "good", Good: "good", Active: "good", Submitted: "good", Valid: "good", Done: "good", Resolved: "good", Low: "info",
  "Partly Paid": "warn", Watch: "warn", Draft: "warn", Medium: "warn", "Expiring soon": "warn", Due: "warn", Fair: "warn",
  Unpaid: "bad", Concern: "bad", High: "bad", Critical: "bad", Expired: "bad", Overdue: "bad", Poor: "bad",
  Closed: "muted", OK: "good",
};
export function Pill({ children, tone }: { children: string; tone?: keyof typeof toneMap }) {
  const t = tone ?? autoTone[children] ?? "muted";
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap", toneMap[t])}>{children}</span>;
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card", className)}>
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export interface Col<T> { h: string; c: (r: T) => ReactNode; right?: boolean; }
export function DataTable<T>({ rows, cols, onRow, empty = "Nothing recorded yet." }: { rows: T[]; cols: Col<T>[]; onRow?: (r: T) => void; empty?: string }) {
  if (!rows.length) return <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="-mx-4 overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            {cols.map((c) => <th key={c.h} className={cn("px-4 py-2 font-medium", c.right && "text-right")}>{c.h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} onClick={onRow ? () => onRow(r) : undefined} className={cn("border-b last:border-0", onRow && "cursor-pointer hover:bg-muted/60")}>
              {cols.map((c) => <td key={c.h} className={cn("px-4 py-2.5", c.right && "num text-right")}>{c.c(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface Field {
  name: string; label: string; type?: "text" | "number" | "date" | "select" | "textarea" | "file" | "tel" | "email";
  options?: string[] | { value: string; label: string }[]; required?: boolean; default?: string | number; full?: boolean;
}
export type FormValues = Record<string, string>;

export function QuickForm({ fields, onSubmit, submit = "Save", children }: {
  fields: Field[]; onSubmit: (v: FormValues, files: Record<string, File | undefined>) => Promise<void> | void; submit?: string; children?: (v: FormValues) => ReactNode;
}) {
  const defaults = Object.fromEntries(fields.map((f) => [f.name, f.default !== undefined ? String(f.default) : ""]));
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({ defaultValues: defaults });
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const values = watch();
  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v, files))} className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const reg = register(f.name, { required: f.required ? `${f.label} is required` : false });
        const full = f.full || f.type === "textarea";
        return (
          <div key={f.name} className={cn("grid gap-1.5", full && "sm:col-span-2")}>
            <Label htmlFor={f.name}>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
            {f.type === "select" ? (
              <select id={f.name} {...reg} className="h-11 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Select…</option>
                {f.options?.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === "textarea" ? (
              <Textarea id={f.name} {...reg} rows={3} />
            ) : f.type === "file" ? (
              <Input id={f.name} type="file" accept="image/*,application/pdf" className="h-11" onChange={(e) => setFiles((s) => ({ ...s, [f.name]: e.target.files?.[0] }))} />
            ) : (
              <Input id={f.name} type={f.type ?? "text"} inputMode={f.type === "number" ? "decimal" : undefined} step="any" className="h-11" {...reg} />
            )}
            {errors[f.name] && <p className="text-xs text-destructive">{String(errors[f.name]?.message)}</p>}
          </div>
        );
      })}
      {children && <div className="sm:col-span-2">{children(values)}</div>}
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting}>{submit}</Button>
      </div>
    </form>
  );
}

export function FormDialog({ trigger, title, ...form }: { trigger: ReactNode; title: string } & Parameters<typeof QuickForm>[0]) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <QuickForm {...form} onSubmit={async (v, f) => { await form.onSubmit(v, f); setOpen(false); }} />
      </DialogContent>
    </Dialog>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto border-b">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} className={cn("whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
          active === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>
      ))}
    </div>
  );
}

export function readFile(file?: File): Promise<string | undefined> {
  if (!file) return Promise.resolve(undefined);
  return new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); });
}

export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0] ?? {});
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `${name}.csv`;
  a.click();
}
