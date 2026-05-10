import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Clock,
  FileText,
  QrCode,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Star,
  Smartphone,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CheckoutBookingInfo {
  expertId: string;
  expertName: string;
  expertImage: string;
  expertTitle: string;
  date: string;         // e.g. "2026-05-10"
  slot: string;         // e.g. "09:00"
  problem: string;
  priceAmount: number;  // numeric, e.g. 500000
  priceDisplay: string; // e.g. "500.000đ"
  fileName?: string;
}

type Step = 'form' | 'processing' | 'success';

// ── Constants ──────────────────────────────────────────────────────────────────

const SERVICE_FEE_RATE = 0.1;

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function generateTxnId() {
  return 'TXN-' + Date.now().toString(36).toUpperCase();
}

// ── Order summary ──────────────────────────────────────────────────────────────

function OrderSummary({ info }: Readonly<{ info: CheckoutBookingInfo }>) {
  const fee = Math.round(info.priceAmount * SERVICE_FEE_RATE);
  const total = info.priceAmount + fee;

  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[var(--border)]">
        <p className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-4">Đơn hàng của bạn</p>
        <div className="flex items-center gap-4">
          <img
            src={info.expertImage}
            alt={info.expertName}
            className="w-14 h-14 rounded-2xl object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-[var(--text-h)] truncate">{info.expertName}</p>
            <p className="text-xs text-[var(--text)] line-clamp-2 mt-0.5">{info.expertTitle}</p>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} className="text-yellow-400" fill="currentColor" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center gap-2 text-sm text-[var(--text)]">
            <Calendar size={14} className="text-[var(--accent)] shrink-0" />
            <span>{formatDate(info.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text)]">
            <Clock size={14} className="text-[var(--accent)] shrink-0" />
            <span>Buổi tư vấn 15 phút · {info.slot}</span>
          </div>
          {info.problem && (
            <div className="flex items-start gap-2 text-sm text-[var(--text)]">
              <FileText size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
              <span className="line-clamp-2 italic">"{info.problem}"</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text)]">Phí tư vấn</span>
          <span className="font-medium text-[var(--text-h)]">{formatVND(info.priceAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text)]">Phí dịch vụ (10%)</span>
          <span className="font-medium text-[var(--text-h)]">{formatVND(fee)}</span>
        </div>
        <div className="border-t border-[var(--border)] pt-3 flex justify-between">
          <span className="font-bold text-[var(--text-h)]">Tổng cộng</span>
          <span className="font-bold text-xl text-[var(--accent)]">{formatVND(total)}</span>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-2">
        {['Mã hóa SSL 256-bit', 'Hoàn tiền nếu chuyên gia hủy lịch', 'Hỗ trợ 24/7'].map((text) => (
          <div key={text} className="flex items-center gap-2 text-xs text-[var(--text)]">
            <ShieldCheck size={13} className="text-green-500 shrink-0" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SEPay panel ────────────────────────────────────────────────────────────────

function SePayPanel({ amount }: Readonly<{ amount: number }>) {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 rounded-full mb-5">
        <Smartphone size={14} className="text-orange-600" />
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">SEPay</span>
      </div>

      {/* QR placeholder */}
      <div className="w-44 h-44 mx-auto rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center mb-4">
        <QrCode size={88} className="text-orange-500" />
      </div>

      <p className="font-bold text-sm text-orange-700 mb-1">
        Quét mã QR bằng ứng dụng SEPay
      </p>
      <p className="text-xs text-[var(--text)] mb-4">
        Mã có hiệu lực trong <span className="font-bold">15 phút</span>
      </p>
      <div className="inline-block px-4 py-2 rounded-xl bg-orange-100 text-orange-700 font-bold text-sm mb-6">
        {formatVND(amount)}
      </div>

      <ol className="text-left space-y-2 text-sm text-[var(--text)]">
        {[
          'Mở ứng dụng SEPay trên điện thoại',
          'Chọn "Quét mã QR"',
          'Quét mã trên màn hình này',
          'Xác nhận thanh toán trong ứng dụng',
        ].map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Processing overlay ─────────────────────────────────────────────────────────

function ProcessingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
    >
      <div className="w-20 h-20 rounded-full bg-[var(--accent-bg)] flex items-center justify-center">
        <Loader2 size={36} className="text-[var(--accent)] animate-spin" />
      </div>
      <div className="text-center">
        <p className="font-bold text-xl text-[var(--text-h)]">Đang xử lý thanh toán...</p>
        <p className="text-[var(--text)] text-sm mt-1">Vui lòng không đóng trang này</p>
      </div>
    </motion.div>
  );
}

// ── Success state ──────────────────────────────────────────────────────────────

function SuccessState({ txnId, info }: Readonly<{ txnId: string; info: CheckoutBookingInfo }>) {
  const fee = Math.round(info.priceAmount * SERVICE_FEE_RATE);
  const total = info.priceAmount + fee;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl border border-[var(--border)] shadow-xl overflow-hidden text-center"
      >
        <div className="h-2 bg-[var(--accent)]" />

        <div className="p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={40} className="text-green-500" />
          </motion.div>

          <h2 className="text-2xl font-bold text-[var(--text-h)] mb-2">Thanh toán thành công!</h2>
          <p className="text-[var(--text)] text-sm mb-6">
            Buổi tư vấn của bạn đã được xác nhận. Chuyên gia sẽ liên hệ sớm.
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text)]">Mã giao dịch</span>
              <span className="font-mono text-xs font-bold text-[var(--text-h)]">{txnId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text)]">Chuyên gia</span>
              <span className="font-bold text-[var(--text-h)]">{info.expertName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text)]">Ngày tư vấn</span>
              <span className="font-bold text-[var(--text-h)]">{formatDate(info.date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text)]">Giờ bắt đầu</span>
              <span className="font-bold text-[var(--text-h)]">{info.slot}</span>
            </div>
            <div className="border-t border-[var(--border)] pt-2 flex justify-between text-sm">
              <span className="font-bold text-[var(--text-h)]">Tổng thanh toán</span>
              <span className="font-bold text-[var(--accent)]">{formatVND(total)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold bg-[var(--accent)] hover:opacity-90 shadow-lg shadow-[var(--accent)]/20 transition-all"
            >
              Xem lịch tư vấn
              <ChevronRight size={16} />
            </Link>
            <Link
              to="/search"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold bg-gray-100 text-[var(--text-h)] hover:bg-gray-200 transition-all"
            >
              Đặt thêm buổi tư vấn
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Checkout page ──────────────────────────────────────────────────────────────

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const info = location.state as CheckoutBookingInfo | undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!info) navigate('/search', { replace: true });
  }, [info, navigate]);

  const [step, setStep] = useState<Step>('form');
  const [txnId, setTxnId] = useState('');

  if (!info) return null;

  const fee = Math.round(info.priceAmount * SERVICE_FEE_RATE);
  const total = info.priceAmount + fee;

  const handleConfirm = () => {
    setStep('processing');
    setTimeout(() => {
      setTxnId(generateTxnId());
      setStep('success');
    }, 2000);
  };

  if (step === 'success') {
    return (
      <div className="bg-[#f9fafb] min-h-screen py-12">
        <SuccessState txnId={txnId} info={info} />
      </div>
    );
  }

  return (
    <div className="bg-[#f9fafb] min-h-screen py-12">
      {step === 'processing' && <ProcessingOverlay />}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[var(--text)] hover:text-[var(--text-h)] font-medium transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div className="flex items-center gap-2 text-sm text-green-600 font-bold">
            <ShieldCheck size={18} />
            Thanh toán bảo mật SSL
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — SEPay form (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--border)] shadow-sm"
            >
              <h2 className="text-xl font-bold text-[var(--text-h)] mb-6">Thanh toán qua SEPay</h2>
              <SePayPanel amount={total} />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 bg-[var(--accent)] hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[var(--accent)]/20 transition-all"
            >
              <ShieldCheck size={18} />
              Xác nhận thanh toán · {formatVND(total)}
            </motion.button>

            <p className="text-center text-xs text-[var(--text)]">
              Bằng cách thanh toán, bạn đồng ý với{' '}
              <span className="text-[var(--accent)] font-bold cursor-pointer hover:underline">
                Điều khoản sử dụng
              </span>{' '}
              của MicroMentor.
            </p>
          </div>

          {/* Right — order summary (1/3) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:sticky lg:top-28 h-fit"
          >
            <OrderSummary info={info} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
