import { getDb } from "./db";

/**
 * Background sync: pushes queued local changes to the Express API.
 * Set VITE_API_URL to enable; without it, changes stay safely queued on the device.
 */
export async function syncNow() {
  const api = import.meta.env.VITE_API_URL as string | undefined;
  if (!api || !navigator.onLine) return { synced: 0 };
  const db = getDb();
  const items = await db.outbox.toArray();
  if (!items.length) return { synced: 0 };
  const payload = await Promise.all(items.map(async (i) => ({ ...i, record: await db.table(i.table).get(i.recordId) })));
  const res = await fetch(`${api}/sync`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error("Sync failed");
  await db.outbox.bulkDelete(items.map((i) => i.id!));
  return { synced: items.length };
}
