import { cn, getApplicationStatusColor, getApplicationStatusLabel, getBookingStatusColor, getBookingStatusLabel, getPaymentStatusColor, getPaymentStatusLabel, getRefundStatusLabel } from '@/lib/utils'
import { BookingStatus, ExpertApplicationStatus, PaymentStatus, RefundStatus } from '@/types'

interface StatusBadgeProps {
  status: BookingStatus | ExpertApplicationStatus | PaymentStatus | RefundStatus
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  let label: string = status
  let colorClass = 'bg-gray-100 text-gray-700'

  if (Object.values(BookingStatus).includes(status as BookingStatus)) {
    label = getBookingStatusLabel(status as BookingStatus)
    colorClass = getBookingStatusColor(status as BookingStatus)
  } else if (Object.values(ExpertApplicationStatus).includes(status as ExpertApplicationStatus)) {
    label = getApplicationStatusLabel(status as ExpertApplicationStatus)
    colorClass = getApplicationStatusColor(status as ExpertApplicationStatus)
  } else if (Object.values(PaymentStatus).includes(status as PaymentStatus)) {
    label = getPaymentStatusLabel(status as PaymentStatus)
    colorClass = getPaymentStatusColor(status as PaymentStatus)
  } else if (Object.values(RefundStatus).includes(status as RefundStatus)) {
    label = getRefundStatusLabel(status as RefundStatus)
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  )
}
