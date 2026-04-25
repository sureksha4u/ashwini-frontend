import { components } from "./schema";

export type UserResponse = components["schemas"]["UserResponse"];
export type UserInvite = components["schemas"]["UserInvite"];
export type UserInviteResponse = components["schemas"]["UserInviteResponse"];
export type UserOnboard = components["schemas"]["UserOnboard"];
export type LoginCredentials = components["schemas"]["LoginCredentials"];
export type SignupRequest = components["schemas"]["SignupRequest"];
export type Token = components["schemas"]["Token"];

// --- Inventory & Pharmacy ---
export * from "./inventory";

// --- Pharmacy & HIPAA Views ---
export type PharmacistPatientView = components["schemas"]["PharmacistPatientView"];
// export type DispenseRequest = components["schemas"]["DispenseRequest"];


