// Role colors — consistent across light + dark via OKLCH gradients.
// Hue values mirror tokens.jsx in the design source.
export const ROLE_COLORS: Record<string, { hue: number; label: string }> = {
  admin: { hue: 268, label: "Admin" },
  doctor: { hue: 217, label: "Doctor" },
  nurse: { hue: 173, label: "Nurse" },
  pharmacist: { hue: 142, label: "Pharmacist" },
  receptionist: { hue: 25, label: "Receptionist" },
  staff: { hue: 220, label: "Staff" },
  lab: { hue: 200, label: "Lab" },
  radiology: { hue: 290, label: "Radiology" },
  billing: { hue: 330, label: "Billing" },
};

// Normalise a backend role string (e.g. "DOCTOR") into a key for ROLE_COLORS.
export function roleKey(role?: string | null): string {
  if (!role) return "staff";
  return role.toLowerCase();
}
