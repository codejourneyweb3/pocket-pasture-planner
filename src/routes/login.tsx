import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Egg, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Sign in — Kuku Ledger" },
    { name: "description", content: "Sign in to manage your poultry farm records." },
    { property: "og:title", content: "Sign in — Kuku Ledger" },
    { property: "og:description", content: "Sign in to manage your poultry farm records." },
  ]}),
  component: Login,
});

const schema = z.object({ id: z.string().min(3, "Enter your email or phone"), password: z.string().min(4, "Password must be at least 4 characters") });
// Demo accounts until the farm's server is connected.
const ACCOUNTS: Record<string, { name: string; role: "Owner" | "Manager" }> = {
  "tracy@farm.ug": { name: "Tracy", role: "Owner" },
  "manager@farm.ug": { name: "Joseph", role: "Manager" },
};

function Login() {
  const login = useAuth((s) => s.login);
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<{ id: string; password: string }>();

  const submit = handleSubmit((v) => {
    const r = schema.safeParse(v);
    if (!r.success) { setErr(r.error.issues[0].message); return; }
    const acc = ACCOUNTS[v.id.trim().toLowerCase()];
    if (!acc) { setErr("We couldn't find that account. Check your email or phone."); return; }
    login({ ...acc, email: v.id }, remember);
    void nav({ to: "/" });
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><Egg /></div><span className="font-display text-xl font-semibold">Kuku Ledger</span></div>
        <div>
          <h2 className="max-w-md text-4xl font-semibold leading-tight">Every bird, egg and shilling — recorded, even without signal.</h2>
          <p className="mt-4 max-w-md text-sidebar-foreground/70">Daily reports, flock health, feed stock, sales and debts in one place. Works offline and syncs when you're back online.</p>
        </div>
        <div className="text-xs text-sidebar-foreground/50">Layers · Broilers · Finance</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Use your email or phone number.</p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="id">Email or phone</Label>
            <Input id="id" className="h-11" autoComplete="username" {...register("id", { required: "Required" })} />
            {errors.id && <p className="text-xs text-destructive">{errors.id.message}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pw">Password</Label>
            <div className="relative">
              <Input id="pw" type={show ? "text" : "password"} className="h-11 pr-10" autoComplete="current-password" {...register("password", { required: "Required" })} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-muted-foreground" aria-label="Toggle password">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-primary" /> Remember this device</label>
          {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          <Button type="submit" size="lg" className="h-11 w-full">Sign in</Button>
          <div className="rounded-md border bg-muted/50 p-3 text-xs text-muted-foreground">
            Demo: <button type="button" className="font-medium text-primary underline" onClick={() => { setValue("id", "tracy@farm.ug"); setValue("password", "demo1234"); }}>Owner (Tracy)</button> ·{" "}
            <button type="button" className="font-medium text-primary underline" onClick={() => { setValue("id", "manager@farm.ug"); setValue("password", "demo1234"); }}>Farm Manager</button>
          </div>
        </form>
      </div>
    </div>
  );
}
