import { Medicine, Batch } from '@/lib/types/inventory';

export type InventoryStatus = Medicine['status'] | Batch['status'];

interface StatusBadgeProps {
  status: InventoryStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<InventoryStatus, { label: string; className: string }> = {
    'in-stock': {
      label: 'In Stock',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    'low-stock': {
      label: 'Low Stock',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    'out-of-stock': {
      label: 'Out of Stock',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    'expiring': {
      label: 'Expiring Soon',
      className: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    'expired': {
      label: 'Expired',
      className: 'bg-red-100 text-red-800 border-red-300',
    },
    'valid': {
      label: 'Valid',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  };

  const { label, className } = config[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}
