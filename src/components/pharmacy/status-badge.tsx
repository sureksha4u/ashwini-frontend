import { Medicine, Batch } from "@/lib/types/inventory";

export type InventoryStatus = Medicine["status"] | Batch["status"];

interface StatusBadgeProps {
  status: InventoryStatus;
}

const CONFIG: Record<InventoryStatus, { label: string; className: string }> = {
  "in-stock": {
    label: "In Stock",
    className: "bg-success-soft text-success border-success/20",
  },
  "low-stock": {
    label: "Low Stock",
    className: "bg-warning-soft text-warning border-warning/20",
  },
  "out-of-stock": {
    label: "Out of Stock",
    className: "bg-danger-soft text-danger border-danger/20",
  },
  expiring: {
    label: "Expiring Soon",
    className: "bg-warning-soft text-warning border-warning/20",
  },
  expired: {
    label: "Expired",
    className: "bg-danger-soft text-danger border-danger/30",
  },
  valid: {
    label: "Valid",
    className: "bg-accent-soft text-accent border-accent/20",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${className}`}
    >
      {label}
    </span>
  );
}
