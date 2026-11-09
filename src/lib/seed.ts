import { getDb, type DailyReport } from "./db";

const d = (offset: number) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);

export async function seedIfEmpty() {
  const db = getDb();
  if ((await db.flocks.count()) > 0) return;
  await db.flocks.bulkPut([
    { id: "f1", name: "Layers House A", type: "Layer", breed: "Lohmann Brown", dateReceived: d(210), initialCount: 1200, liveCount: 1162, supplier: "Ugachick", costPerChick: 3800, status: "Active", health: "Good" },
    { id: "f2", name: "Layers House B", type: "Layer", breed: "Hy-Line", dateReceived: d(140), initialCount: 800, liveCount: 781, supplier: "Biyinzika", costPerChick: 3500, status: "Active", health: "Watch" },
    { id: "f3", name: "Broiler Batch 14", type: "Broiler", breed: "Cobb 500", dateReceived: d(28), initialCount: 500, liveCount: 486, supplier: "Ugachick", costPerChick: 2600, status: "Active", health: "Good", targetWeightKg: 1.6 },
    { id: "f4", name: "Broiler Batch 13", type: "Broiler", breed: "Ross 308", dateReceived: d(80), initialCount: 500, liveCount: 0, supplier: "Kukuchick", costPerChick: 2500, status: "Closed", health: "Good", targetWeightKg: 2.2 },
  ]);
  const reports: DailyReport[] = [];
  for (let i = 13; i >= 0; i--) {
    reports.push({ id: `rA${i}`, flockId: "f1", date: d(i), manager: "Joseph", status: "Submitted", condition: "Active", sickBirds: i % 5 === 0 ? 3 : 0, deaths: i % 4 === 0 ? 2 : 1, feedType: "Layers Mash", feedGivenKg: 135, feedRemainingKg: 0, eggs: 960 + ((i * 37) % 70), broken: 6 + (i % 4), cracked: 4, waterL: 280, temperatureC: 26 });
    reports.push({ id: `rB${i}`, flockId: "f2", date: d(i), manager: "Joseph", status: "Submitted", condition: i < 3 ? "Coughing" : "Active", sickBirds: i < 3 ? 8 : 1, deaths: i < 3 ? 4 : 1, feedType: "Layers Mash", feedGivenKg: 90, eggs: 610 + ((i * 23) % 50), broken: 5, cracked: 3, waterL: 190, temperatureC: 27 });
    reports.push({ id: `rC${i}`, flockId: "f3", date: d(i), manager: "Joseph", status: "Submitted", condition: "Active", deaths: i % 6 === 0 ? 2 : 0, feedType: "Broiler Grower", feedGivenKg: 40 + (14 - i) * 3, avgWeightKg: +(0.7 + (14 - i) * 0.065).toFixed(2), uniformity: 82 + (i % 5), waterL: 120, temperatureC: 29 });
  }
  await db.reports.bulkPut(reports);
  await db.customers.bulkPut([
    { id: "c1", name: "Mama Sarah's Shop", phone: "0772 123 456", creditLimit: 500000 },
    { id: "c2", name: "Kampala Fresh Hotel", phone: "0701 987 654", creditLimit: 2000000 },
    { id: "c3", name: "Nakasero Market Stall 12", phone: "0752 444 210", creditLimit: 300000 },
    { id: "c4", name: "Walk-in Customer", phone: "—", creditLimit: 0 },
  ]);
  await db.sales.bulkPut([
    { id: "s1", ref: "S-1001", date: d(0), customerId: "c1", flockId: "f1", product: "Eggs (tray)", quantity: 20, unitPrice: 12000, paymentMethod: "Cash" },
    { id: "s2", ref: "S-1002", date: d(2), customerId: "c2", flockId: "f1", product: "Eggs (tray)", quantity: 60, unitPrice: 11500, paymentMethod: "Bank" },
    { id: "s3", ref: "S-1003", date: d(45), customerId: "c3", flockId: "f4", product: "Live chicken", quantity: 30, unitPrice: 18000, paymentMethod: "Mobile money" },
    { id: "s4", ref: "S-1004", date: d(75), customerId: "c2", flockId: "f4", product: "Live chicken", quantity: 120, unitPrice: 17500, paymentMethod: "Bank" },
    { id: "s5", ref: "S-1005", date: d(5), customerId: "c4", product: "Manure (bag)", quantity: 10, unitPrice: 8000, paymentMethod: "Cash" },
    { id: "s6", ref: "S-1006", date: d(0), customerId: "c4", flockId: "f2", product: "Eggs (tray)", quantity: 8, unitPrice: 12500, paymentMethod: "Mobile money" },
  ]);
  await db.payments.bulkPut([
    { id: "p1", saleId: "s1", date: d(0), amount: 240000, method: "Cash" },
    { id: "p2", saleId: "s2", date: d(2), amount: 400000, method: "Bank" },
    { id: "p3", saleId: "s3", date: d(40), amount: 200000, method: "Mobile money" },
    { id: "p4", saleId: "s4", date: d(70), amount: 1500000, method: "Bank" },
    { id: "p5", saleId: "s5", date: d(5), amount: 80000, method: "Cash" },
    { id: "p6", saleId: "s6", date: d(0), amount: 100000, method: "Mobile money" },
  ]);
  await db.expenses.bulkPut([
    { id: "e1", date: d(0), category: "Labour", description: "Casual worker — cleaning", amount: 30000, paid: 30000, method: "Cash" },
    { id: "e2", date: d(3), category: "Feed", description: "Layers Mash 1,000 kg", supplier: "Ugachick Feeds", amount: 1850000, paid: 1000000, method: "Bank" },
    { id: "e3", date: d(6), category: "Medication", description: "Newcastle vaccine", supplier: "Vet Pharma", flockId: "f3", amount: 85000, paid: 85000, method: "Mobile money" },
    { id: "e4", date: d(10), category: "Utilities", description: "Electricity (UMEME)", amount: 160000, paid: 160000, method: "Mobile money" },
    { id: "e5", date: d(0), category: "Transport", description: "Egg delivery boda", amount: 15000, paid: 15000, method: "Cash" },
  ]);
  await db.feedStock.bulkPut([
    { id: "Layers Mash", feedType: "Layers Mash", quantityKg: 980, reorderKg: 1000, avgDailyKg: 225 },
    { id: "Broiler Grower", feedType: "Broiler Grower", quantityKg: 640, reorderKg: 400, avgDailyKg: 70 },
    { id: "Chick Starter", feedType: "Chick Starter", quantityKg: 120, reorderKg: 100, avgDailyKg: 0 },
  ]);
  await db.feedDeliveries.bulkPut([
    { id: "fd1", date: d(3), supplier: "Ugachick Feeds", feedType: "Layers Mash", quantityKg: 1000, cost: 1850000 },
    { id: "fd2", date: d(9), supplier: "Ugachick Feeds", feedType: "Broiler Grower", quantityKg: 500, cost: 1050000 },
  ]);
  await db.medications.bulkPut([
    { id: "m1", name: "Newcastle (Lasota)", type: "Vaccine", quantity: 4, cost: 25000, supplier: "Vet Pharma", expiry: d(-120) },
    { id: "m2", name: "Oxytetracycline", type: "Antibiotic", quantity: 2, cost: 18000, supplier: "Vet Pharma", expiry: d(-12) },
    { id: "m3", name: "Multivitamin", type: "Supplement", quantity: 6, cost: 12000, supplier: "Agro Vet", expiry: d(-300) },
  ]);
  await db.vaccinations.bulkPut([
    { id: "v1", flockId: "f3", vaccine: "Gumboro booster", dueDate: d(-2), done: false },
    { id: "v2", flockId: "f2", vaccine: "Newcastle", dueDate: d(3), done: false },
    { id: "v3", flockId: "f1", vaccine: "Fowl pox", dueDate: d(-10), done: false },
    { id: "v4", flockId: "f3", vaccine: "Newcastle", dueDate: d(14), done: true },
  ]);
  await db.treatments.bulkPut([
    { id: "t1", flockId: "f2", product: "Oxytetracycline", date: d(2), dosage: "1 g / 4 L water", by: "Joseph", withdrawalDays: 7, response: "Coughing reducing" },
  ]);
  await db.visits.bulkPut([
    { id: "b1", date: d(1), visitor: "Dr. Okello (vet)", vehicle: "UBA 123X", purpose: "Health check", disinfected: true, recordedBy: "Joseph" },
  ]);
  await db.alerts.bulkPut([
    { id: "a1", type: "Low feed stock", description: "Layers Mash below reorder level (980 kg, ~4 days)", related: "Layers Mash", date: d(0), severity: "High", read: false, resolved: false },
    { id: "a2", type: "Mortality spike", description: "4 deaths/day for 3 days in House B, birds coughing", related: "Layers House B", date: d(1), severity: "High", read: false, resolved: false },
    { id: "a3", type: "Overdue vaccination", description: "Fowl pox overdue by 10 days", related: "Layers House A", date: d(0), severity: "Medium", read: false, resolved: false },
    { id: "a4", type: "Overdue customer balance", description: "Balance outstanding over 60 days", related: "Kampala Fresh Hotel", date: d(0), severity: "Medium", read: true, resolved: false },
    { id: "a5", type: "Expiring medicine", description: "Oxytetracycline expires in 12 days", related: "Medicine stock", date: d(0), severity: "Low", read: false, resolved: false },
  ]);
  await db.documents.bulkPut([
    { id: "doc1", name: "Business Registration", type: "Business registration", issue: d(700), expiry: d(-1000) },
    { id: "doc2", name: "MAAIF Farm Licence", type: "Farm licence", issue: d(340), expiry: d(-25) },
    { id: "doc3", name: "Veterinary Certificate 2026", type: "Veterinary certificate", issue: d(200), expiry: d(-165) },
  ]);
  await db.equipment.bulkPut([
    { id: "q1", name: "Generator 5kVA", purchaseDate: d(500), cost: 2800000, condition: "Good", nextService: d(-6) },
    { id: "q2", name: "Brooder heaters (x4)", purchaseDate: d(300), cost: 640000, condition: "Fair", nextService: d(-30) },
    { id: "q3", name: "Automatic drinkers (x20)", purchaseDate: d(210), cost: 900000, condition: "Good", nextService: d(-90) },
  ]);
  await db.cashups.bulkPut([
    { id: "cu1", date: d(1), method: "Cash", opening: 150000, counted: 410000 },
    { id: "cu2", date: d(1), method: "Mobile money", opening: 320000, counted: 320000 },
  ]);
}
