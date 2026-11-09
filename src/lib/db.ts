import Dexie, { type Table } from "dexie";

export type FlockType = "Layer" | "Broiler";
export interface Flock {
  id: string; name: string; type: FlockType; breed: string; dateReceived: string;
  initialCount: number; liveCount: number; supplier: string; costPerChick: number;
  status: "Active" | "Closed"; health: "Good" | "Watch" | "Concern"; notes?: string;
  targetWeightKg?: number;
}
export interface DailyReport {
  id: string; flockId: string; date: string; manager: string; status: "Draft" | "Submitted";
  condition?: string; sickBirds?: number; observations?: string;
  deaths?: number; deathCause?: string; disposal?: string;
  feedType?: string; feedGivenKg?: number; feedRemainingKg?: number;
  waterL?: number; temperatureC?: number; ventilation?: string; litter?: string;
  eggs?: number; broken?: number; cracked?: number; avgWeightKg?: number; uniformity?: number;
  notes?: string; step?: number;
}
export interface Customer { id: string; name: string; phone: string; creditLimit: number; }
export type Product = "Eggs (tray)" | "Live chicken" | "Spent hen" | "Manure (bag)";
export interface Sale {
  id: string; ref: string; date: string; customerId: string; flockId?: string; product: Product;
  quantity: number; unitPrice: number; paymentMethod: string; notes?: string; reversalOf?: string;
}
export interface Payment { id: string; saleId: string; date: string; amount: number; method: string; }
export type ExpenseCategory = "Feed" | "Medication" | "Labour" | "Utilities" | "Equipment" | "Transport" | "Other";
export interface Expense {
  id: string; date: string; category: ExpenseCategory; description: string; flockId?: string;
  supplier?: string; amount: number; paid: number; method: string; notes?: string;
}
export interface FeedStock { id: string; feedType: string; quantityKg: number; reorderKg: number; avgDailyKg: number; }
export interface FeedDelivery { id: string; date: string; supplier: string; feedType: string; quantityKg: number; cost: number; notes?: string; }
export interface Medication { id: string; name: string; type: string; quantity: number; cost: number; supplier: string; expiry: string; }
export interface Vaccination { id: string; flockId: string; vaccine: string; dueDate: string; done: boolean; }
export interface Treatment { id: string; flockId: string; product: string; date: string; dosage: string; by: string; withdrawalDays: number; response?: string; }
export interface Visit { id: string; date: string; visitor: string; vehicle?: string; purpose: string; disinfected: boolean; recordedBy: string; }
export interface Alert { id: string; type: string; description: string; related?: string; date: string; severity: "Low" | "Medium" | "High"; read: boolean; resolved: boolean; }
export interface Doc { id: string; name: string; type: string; issue: string; expiry: string; fileName?: string; dataUrl?: string; }
export interface Equipment { id: string; name: string; purchaseDate: string; cost: number; condition: string; nextService: string; }
export interface CashUp { id: string; date: string; method: "Cash" | "Mobile money" | "Bank"; opening: number; counted: number; }
export interface Audit { id?: number; at: string; user: string; action: string; entity: string; }
export interface Outbox { id?: number; at: string; table: string; op: string; recordId: string; }

class FarmDB extends Dexie {
  flocks!: Table<Flock, string>; reports!: Table<DailyReport, string>; customers!: Table<Customer, string>;
  sales!: Table<Sale, string>; payments!: Table<Payment, string>; expenses!: Table<Expense, string>;
  feedStock!: Table<FeedStock, string>; feedDeliveries!: Table<FeedDelivery, string>;
  medications!: Table<Medication, string>; vaccinations!: Table<Vaccination, string>;
  treatments!: Table<Treatment, string>; visits!: Table<Visit, string>; alerts!: Table<Alert, string>;
  documents!: Table<Doc, string>; equipment!: Table<Equipment, string>; cashups!: Table<CashUp, string>;
  audit!: Table<Audit, number>; outbox!: Table<Outbox, number>;
  constructor() {
    super("chicken-farm-erp");
    this.version(1).stores({
      flocks: "id,status,type", reports: "id,flockId,date,status", customers: "id",
      sales: "id,date,customerId,flockId", payments: "id,saleId,date", expenses: "id,date,flockId",
      feedStock: "id", feedDeliveries: "id,date", medications: "id", vaccinations: "id,flockId,dueDate",
      treatments: "id,flockId", visits: "id,date", alerts: "id,resolved", documents: "id",
      equipment: "id", cashups: "id,date", audit: "++id,at", outbox: "++id",
    });
  }
}

let _db: FarmDB | null = null;
export function getDb() {
  if (!_db) _db = new FarmDB();
  return _db;
}

export const uid = () => crypto.randomUUID();
export const today = () => new Date().toISOString().slice(0, 10);

type TableName = Exclude<keyof FarmDB, keyof Dexie>;

/** Write locally first, then queue for background sync and log to the audit trail. */
export async function save<T extends { id: string }>(table: TableName, record: T, user: string, action = "saved") {
  const db = getDb();
  await db.transaction("rw", [db.table(table), db.outbox, db.audit], async () => {
    await db.table(table).put(record);
    await db.outbox.add({ at: new Date().toISOString(), table, op: "upsert", recordId: record.id });
    await db.audit.add({ at: new Date().toISOString(), user, action: `${action} ${table}`, entity: record.id });
  });
}
