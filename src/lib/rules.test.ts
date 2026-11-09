import { describe, expect, it } from "vitest";
import { can } from "./permissions";
import { ageBucket, customerBalance, payStatus } from "./finance";

describe("roles", () => {
  it("manager can create sales/expenses but not edit saved financial records", () => {
    expect(can("Manager", "finance.create")).toBe(true);
    expect(can("Manager", "finance.edit")).toBe(false);
  });
  it("manager has view-only cash-up, documents, no audit or users", () => {
    expect(can("Manager", "cashup.edit")).toBe(false);
    expect(can("Manager", "documents.edit")).toBe(false);
    expect(can("Manager", "audit.view")).toBe(false);
    expect(can("Manager", "users.manage")).toBe(false);
  });
  it("only owner closes flocks", () => {
    expect(can("Manager", "flock.close")).toBe(false);
    expect(can("Owner", "flock.close")).toBe(true);
  });
});

describe("finance", () => {
  it("payment status", () => {
    expect(payStatus(1000, 1000)).toBe("Paid");
    expect(payStatus(1000, 400)).toBe("Partly Paid");
    expect(payStatus(1000, 0)).toBe("Unpaid");
  });
  it("balance derives from sales minus payments", () => {
    const sales = [{ id: "s1", customerId: "c", quantity: 10, unitPrice: 12000 }] as never;
    const pays = [{ id: "p", saleId: "s1", amount: 50000 }] as never;
    expect(customerBalance("c", sales, pays)).toBe(70000);
  });
  it("ageing buckets", () => {
    expect(ageBucket("2026-01-01", "2026-01-31")).toBe("0–30");
    expect(ageBucket("2026-01-01", "2026-02-15")).toBe("31–60");
    expect(ageBucket("2026-01-01", "2026-05-01")).toBe("90+");
  });
});
