"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import type { UserRole } from "@/lib/types/role";

// Clinical staff + front-office (receptionists do OP registration). Pharmacists
// reach patient data only via the dedicated pharmacy dispensing flow.
const PATIENTS_ROLES: UserRole[] = ["DOCTOR", "NURSE", "RECEPTIONIST"];

export default function PatientsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow={PATIENTS_ROLES}>{children}</RoleGuard>;
}
