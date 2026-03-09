import { cn } from "@/lib/utils";
import { type BookingStatus, ProfessionalStatus } from "../backend";
import { BOOKING_STATUS_CONFIG } from "../lib/constants";

interface StatusBadgeProps {
  status: BookingStatus | ProfessionalStatus;
  className?: string;
}

const PROFESSIONAL_STATUS_CONFIG: Record<
  ProfessionalStatus,
  { label: string; color: string; bgColor: string }
> = {
  [ProfessionalStatus.pending]: {
    label: "Pending Approval",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  [ProfessionalStatus.approved]: {
    label: "Approved",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  [ProfessionalStatus.suspended]: {
    label: "Suspended",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config =
    BOOKING_STATUS_CONFIG[status as BookingStatus] ??
    PROFESSIONAL_STATUS_CONFIG[status as ProfessionalStatus];

  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        config.bgColor,
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
