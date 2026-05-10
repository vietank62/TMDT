import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  Calendar,
  User,
  Mail,
  Hash,
  Receipt,
  Download,
  AlertCircle,
} from 'lucide-react';
import type { PaymentTransaction } from '../../types/payment';
import PaymentStatusBadge from './PaymentStatusBadge';

const METHOD_LABELS: Record<PaymentTransaction['method'], string> = {
  credit_card:    'Thẻ tín dụng',
  bank_transfer:  'Chuyển khoản ngân hàng',
  sepay:          'SEPay',
  vnpay:          'VNPay',
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface PaymentDetailsModalProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
}

const PaymentDetailsModal = ({ transaction, onClose }: PaymentDetailsModalProps) => {
  useEffect(() => {
    if (!transaction) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [transaction, onClose]);

  return (
    <AnimatePresence>
      {transaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Chi tiết giao dịch"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-[var(--accent)]" />
                <h3 className="font-bold text-lg text-[var(--text-h)]">Chi tiết giao dịch</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[var(--text)] hover:bg-gray-100 transition-colors"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Status + amount */}
              <div className="flex items-center justify-between">
                <PaymentStatusBadge status={transaction.status} />
                <span className="text-2xl font-bold text-[var(--text-h)]">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </div>

              {/* Transaction info */}
              <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
                <Row icon={<Hash size={14} />} label="Mã giao dịch" value={transaction.id} mono />
                <Row icon={<Calendar size={14} />} label="Thời gian" value={formatDate(transaction.date)} />
                <Row icon={<CreditCard size={14} />} label="Phương thức" value={METHOD_LABELS[transaction.method]} />
                <Row icon={<Hash size={14} />} label="Mã nhà cung cấp" value={transaction.providerReference} mono />
              </div>

              {/* Billing info */}
              <div>
                <SectionHeading>Thông tin thanh toán</SectionHeading>
                <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
                  <Row icon={<User size={14} />} label="Tên" value={transaction.billingName} />
                  <Row icon={<Mail size={14} />} label="Email" value={transaction.billingEmail} />
                </div>
              </div>

              {/* Itemized charges */}
              <div>
                <SectionHeading>Chi tiết dịch vụ</SectionHeading>
                <div className="bg-gray-50 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-[var(--text)] uppercase tracking-wide">Dịch vụ</th>
                        <th className="px-4 py-2.5 text-center text-xs font-bold text-[var(--text)] uppercase tracking-wide">SL</th>
                        <th className="px-4 py-2.5 text-right text-xs font-bold text-[var(--text)] uppercase tracking-wide">Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {transaction.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 text-[var(--text-h)]">{item.name}</td>
                          <td className="px-4 py-3 text-center text-[var(--text)]">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-medium text-[var(--text-h)]">
                            {formatCurrency(item.unitPrice, transaction.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[var(--border)] bg-white">
                        <td colSpan={2} className="px-4 py-3 text-sm font-bold text-[var(--text-h)]">Tổng cộng</td>
                        <td className="px-4 py-3 text-right font-bold text-[var(--accent)]">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes / refund reason */}
              {(transaction.notes ?? transaction.refundReason) && (
                <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {transaction.refundReason ?? transaction.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-gray-50">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text)] hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
              {transaction.invoiceUrl && (
                <a
                  href={transaction.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--accent)] hover:opacity-90 shadow-lg shadow-[var(--accent)]/20 transition-all"
                  aria-label="Tải hóa đơn"
                >
                  <Download size={15} />
                  Tải hóa đơn
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function SectionHeading({ children }: { readonly children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-2">{children}</h4>
  );
}

function Row({
  icon,
  label,
  value,
  mono = false,
}: Readonly<{ icon: React.ReactNode; label: string; value: string; mono?: boolean }>) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-1.5 text-[var(--text)] shrink-0">
        <span className="text-[var(--accent)]">{icon}</span>
        <span className="text-xs font-bold">{label}</span>
      </div>
      <span className={`text-sm text-[var(--text-h)] text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export default PaymentDetailsModal;
