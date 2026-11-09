import type { Payment, Sale } from "./db";

export type PayStatus = "Paid" | "Partly Paid" | "Unpaid";

export const saleTotal = (s: Pick<Sale, "quantity" | "unitPrice">) => s.quantity * s.unitPrice;

export function paidFor(saleId: string, payments: Payment[]) {
  return payments.filter((p) => p.saleId === saleId).reduce((a, p) => a + p.amount, 0);
}

export function payStatus(total: number, paid: number): PayStatus {
  if (total <= 0 || paid >= total) return "Paid";
  if (paid > 0) return "Partly Paid";
  return "Unpaid";
}

/** Customer balance is always derived from sales minus payments — never entered by hand. */
export function customerBalance(customerId: string, sales: Sale[], payments: Payment[]) {
  return sales
    .filter((s) => s.customerId === customerId)
    .reduce((a, s) => a + saleTotal(s) - paidFor(s.id, payments), 0);
}

export type AgeBucket = "0–30" | "31–60" | "61–90" | "90+";
export function ageBucket(saleDate: string, asOf: string): AgeBucket {
  const days = Math.floor((Date.parse(asOf) - Date.parse(saleDate)) / 86400000);
  if (days <= 30) return "0–30";
  if (days <= 60) return "31–60";
  if (days <= 90) return "61–90";
  return "90+";
}

export function ageing(sales: Sale[], payments: Payment[], asOf: string) {
  const out: Record<AgeBucket, number> = { "0–30": 0, "31–60": 0, "61–90": 0, "90+": 0 };
  for (const s of sales) {
    const bal = saleTotal(s) - paidFor(s.id, payments);
    if (bal > 0) out[ageBucket(s.date, asOf)] += bal;
  }
  return out;
}

export const ugx = (n: number) => "UGX " + Math.round(n).toLocaleString("en-US");
export const kg = (n: number) => `${n.toLocaleString("en-US", { maximumFractionDigits: 1 })} kg`;
export const ageDays = (date: string) => Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 86400000));
