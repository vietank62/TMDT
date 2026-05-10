import { CheckCircle2, Clock, XCircle, RotateCcw } from 'lucide-react';
import type { PaymentStatus } from '../../types/payment';

const CONFIG: Record<PaymentStatus, { label: string; classes: string; icon: React.ReactNode }> = {
  paid:     { label: 'Đã thanh toán', classes: 'text-green-700 bg-green-50',  icon: <CheckCircle2 size={13} /> },
  pending:  { label: 'Đang xử lý',   classes: 'text-amber-700 bg-amber-50',  icon: <Clock size={13} />        },
  failed:   { label: 'Thất bại',      classes: 'text-red-700   bg-red-50',    icon: <XCircle size={13} />      },
  refunded: { label: 'Hoàn tiền',    classes: 'text-blue-700  bg-blue-50',   icon: <RotateCcw size={13} />    },
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const { label, classes, icon } = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${classes}`}>
      {icon}
      {label}
    </span>
  );
};

export default PaymentStatusBadge;
