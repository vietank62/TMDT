import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  CreditCard,
  Calendar,
  Download,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import type { PaymentTransaction, PaymentStatus, PaymentFiltersState } from '../../types/payment';
import { MOCK_PAYMENTS } from '../../data/mockPayments';
import PaymentStatusBadge from './PaymentStatusBadge';
import PaymentDetailsModal from './PaymentDetailsModal';

// ── Helpers ────────────────────────────────────────────────────────────────────

const METHOD_LABELS: Record<PaymentTransaction['method'], string> = {
  credit_card:   'Thẻ tín dụng',
  bank_transfer: 'Chuyển khoản',
  sepay:         'SEPay',
  vnpay:         'VNPay',
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

const STATUS_OPTIONS: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'Tất cả trạng thái' },
  { value: 'paid',     label: 'Đã thanh toán'     },
  { value: 'pending',  label: 'Đang xử lý'        },
  { value: 'failed',   label: 'Thất bại'          },
  { value: 'refunded', label: 'Hoàn tiền'         },
];

// ── Skeleton loader ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded-lg animate-pulse" style={{ width: `${[80, 60, 140, 80, 60, 50][i]}%` }} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[var(--border)] space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded-lg w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-[var(--accent-bg)] flex items-center justify-center mb-6">
        <Receipt size={36} className="text-[var(--accent)]" />
      </div>
      <h3 className="text-xl font-bold text-[var(--text-h)] mb-2">Chưa có lịch sử thanh toán</h3>
      <p className="text-[var(--text)] max-w-xs">
        Các giao dịch của bạn sẽ xuất hiện tại đây sau khi bạn hoàn tất một buổi tư vấn hoặc học.
      </p>
    </div>
  );
}

// ── Error state ────────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: Readonly<{ onRetry: () => void }>) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <AlertTriangle size={36} className="text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-[var(--text-h)] mb-2">Không thể tải dữ liệu</h3>
      <p className="text-[var(--text)] max-w-xs mb-6">
        Đã xảy ra lỗi khi tải lịch sử thanh toán. Vui lòng thử lại.
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-[var(--accent)]/20 transition-all"
      >
        <RefreshCw size={16} />
        Thử lại
      </button>
    </div>
  );
}

// ── Filters ────────────────────────────────────────────────────────────────────

interface PaymentFiltersProps {
  filters: PaymentFiltersState;
  onChange: (filters: PaymentFiltersState) => void;
}

function PaymentFilters({ filters, onChange }: Readonly<PaymentFiltersProps>) {
  const set = <K extends keyof PaymentFiltersState>(key: K, value: PaymentFiltersState[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white p-5 rounded-3xl border border-[var(--border)] shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-[var(--text-h)]">
        <SlidersHorizontal size={16} className="text-[var(--accent)]" />
        <span className="text-sm font-bold">Lọc giao dịch</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2 xl:col-span-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-60" />
          <input
            type="text"
            placeholder="Tìm mã GD hoặc mô tả..."
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
            aria-label="Tìm kiếm giao dịch"
          />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => set('status', e.target.value as PaymentFiltersState['status'])}
            className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all pr-8"
            aria-label="Lọc theo trạng thái"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)] pointer-events-none opacity-60" />
        </div>

        {/* Date from */}
        <div className="relative">
          <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-60 pointer-events-none" />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => set('dateFrom', e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
            aria-label="Từ ngày"
          />
        </div>

        {/* Date to */}
        <div className="relative">
          <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-60 pointer-events-none" />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => set('dateTo', e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
            aria-label="Đến ngày"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text)]">Sắp xếp:</span>
          {(['newest', 'oldest'] as const).map((order) => (
            <button
              key={order}
              onClick={() => set('sortOrder', order)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filters.sortOrder === order
                  ? 'bg-[var(--accent)] shadow-sm'
                  : 'bg-gray-100 text-[var(--text)] hover:bg-gray-200'
              }`}
            >
              {order === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
            </button>
          ))}
        </div>

        {/* Clear */}
        {(filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => onChange({ search: '', status: 'all', dateFrom: '', dateTo: '', sortOrder: filters.sortOrder })}
            className="text-xs text-[var(--accent)] font-bold hover:underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}

// ── Desktop table ──────────────────────────────────────────────────────────────

function DesktopTable({
  payments,
  onRowClick,
}: Readonly<{ payments: PaymentTransaction[]; onRowClick: (p: PaymentTransaction) => void }>) {
  return (
    <div className="hidden md:block bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-[var(--border)]">
          <tr>
            {['Mã GD', 'Ngày', 'Mô tả', 'Phương thức', 'Số tiền', 'Trạng thái', 'Hóa đơn'].map((h) => (
              <th key={h} className="px-6 py-4 text-xs font-bold text-[var(--text)] uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {payments.map((p) => (
            <motion.tr
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => onRowClick(p)}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <td className="px-6 py-4 font-mono text-xs text-[var(--text-h)] whitespace-nowrap">{p.id}</td>
              <td className="px-6 py-4 text-sm text-[var(--text)] whitespace-nowrap">{formatDate(p.date)}</td>
              <td className="px-6 py-4 text-sm text-[var(--text-h)] max-w-xs">
                <span className="line-clamp-1">{p.description}</span>
              </td>
              <td className="px-6 py-4 text-sm text-[var(--text)] whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  <CreditCard size={13} className="text-[var(--accent)]" />
                  {METHOD_LABELS[p.method]}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-[var(--text-h)] whitespace-nowrap">
                {formatCurrency(p.amount, p.currency)}
              </td>
              <td className="px-6 py-4">
                <PaymentStatusBadge status={p.status} />
              </td>
              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                {p.invoiceUrl ? (
                  <a
                    href={p.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline"
                    aria-label={`Tải hóa đơn ${p.id}`}
                  >
                    <Download size={13} />
                    Tải PDF
                  </a>
                ) : (
                  <span className="text-xs text-[var(--text)] opacity-40">—</span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Mobile cards ───────────────────────────────────────────────────────────────

function MobileCard({
  payment,
  onClick,
}: Readonly<{ payment: PaymentTransaction; onClick: () => void }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-white p-5 rounded-2xl border border-[var(--border)] shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-[var(--text)] mb-0.5">{payment.id}</p>
          <p className="text-sm font-bold text-[var(--text-h)] line-clamp-2">{payment.description}</p>
        </div>
        <span className="text-base font-bold text-[var(--text-h)] whitespace-nowrap">
          {formatCurrency(payment.amount, payment.currency)}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-[var(--text)]">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formatDate(payment.date)}
        </span>
        <span className="flex items-center gap-1">
          <CreditCard size={12} />
          {METHOD_LABELS[payment.method]}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <PaymentStatusBadge status={payment.status} />
        {payment.invoiceUrl && (
          <a
            href={payment.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline"
            aria-label={`Tải hóa đơn ${payment.id}`}
          >
            <Download size={12} />
            Tải PDF
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ── PaymentHistoryTab ──────────────────────────────────────────────────────────

const DEFAULT_FILTERS: PaymentFiltersState = {
  search: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  sortOrder: 'newest',
};

const PaymentHistoryTab = () => {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState<PaymentFiltersState>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<PaymentTransaction | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(false);
    // Simulate API call
    setTimeout(() => {
      setPayments(MOCK_PAYMENTS);
      setLoading(false);
    }, 1200);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    let result = [...payments];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) => p.id.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }

    if (filters.status !== 'all') {
      result = result.filter((p) => p.status === filters.status);
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      result = result.filter((p) => new Date(p.date).getTime() >= from);
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime() + 86_400_000; // inclusive
      result = result.filter((p) => new Date(p.date).getTime() <= to);
    }

    result.sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return filters.sortOrder === 'newest' ? diff : -diff;
    });

    return result;
  }, [payments, filters]);

  return (
    <>
      <div className="space-y-6">
        {/* Page heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-[var(--text-h)]">Lịch sử thanh toán</h2>
          {!loading && !error && (
            <span className="px-3 py-1 bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-bold rounded-full self-start sm:self-auto">
              {filtered.length} giao dịch
            </span>
          )}
        </div>

        {/* Filters */}
        <PaymentFilters filters={filters} onChange={setFilters} />

        {/* Content */}
        {loading ? (
          <>
            {/* Desktop skeleton */}
            <div className="hidden md:block bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-[var(--border)]">
                  <tr>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <th key={i} className="px-6 py-4">
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm">
            <ErrorState onRetry={loadData} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm">
            <EmptyState />
          </div>
        ) : (
          <>
            <DesktopTable payments={filtered} onRowClick={setSelected} />
            <div className="md:hidden space-y-3">
              {filtered.map((p) => (
                <MobileCard key={p.id} payment={p} onClick={() => setSelected(p)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details modal */}
      <PaymentDetailsModal transaction={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default PaymentHistoryTab;
