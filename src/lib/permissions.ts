export type Role = "Owner" | "Manager";
export type Action =
  | "flock.close" | "flock.edit"
  | "finance.create" | "finance.edit"
  | "customer.edit" | "cashup.edit" | "documents.edit"
  | "audit.view" | "users.manage";

const MANAGER: Action[] = ["flock.edit", "finance.create"];

export function can(role: Role | undefined, action: Action): boolean {
  if (!role) return false;
  if (role === "Owner") return true;
  return MANAGER.includes(action);
}
