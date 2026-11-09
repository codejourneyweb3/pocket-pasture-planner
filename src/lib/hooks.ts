import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "./db";
import { useAuth } from "./store";

type DB = ReturnType<typeof getDb>;

export function useData<T>(fn: (db: DB) => Promise<T> | T, deps: unknown[] = []): T | undefined {
  return useLiveQuery(() => fn(getDb()), deps);
}

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}

export function useUser() {
  const user = useAuth((s) => s.user);
  return { user, name: user?.name ?? "", role: user?.role };
}
