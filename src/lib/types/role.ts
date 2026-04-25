// Mirror of the backend `UserRole` enum (app/enums/user_role.py).
// Kept as a hand-written union here so route guards work even when the generated
// schema.d.ts is stale.
export type UserRole = "ADMIN" | "DOCTOR" | "PHARMACIST" | "NURSE" | "STAFF" | "RECEPTIONIST";

export const ALL_ROLES: UserRole[] = [
  "ADMIN",
  "DOCTOR",
  "PHARMACIST",
  "NURSE",
  "STAFF",
  "RECEPTIONIST",
];

export const CLINICAL_ROLES: UserRole[] = ["ADMIN", "DOCTOR", "NURSE"];
export const PHARMACY_ROLES: UserRole[] = ["ADMIN", "PHARMACIST"];
export const FRONT_OFFICE_ROLES: UserRole[] = ["ADMIN", "RECEPTIONIST", "NURSE"];
