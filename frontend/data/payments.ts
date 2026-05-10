import { Payment, PaymentStatus, Payout, Refund, RefundStatus } from '@/types'

const pastDate = (daysAgo: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

export const mockPayments: Payment[] = [
  {
    id: 'payment-1',
    bookingId: 'booking-1',
    userId: 'user-1',
    expertId: 'expert-1',
    amount: 800000,
    status: PaymentStatus.PAID,
    bankAccount: '1234567890',
    transferCode: 'MM240510001',
    paidAt: pastDate(2),
    createdAt: pastDate(3),
  },
  {
    id: 'payment-2',
    bookingId: 'booking-2',
    userId: 'user-1',
    expertId: 'expert-2',
    amount: 1200000,
    status: PaymentStatus.PAID,
    bankAccount: '1234567890',
    transferCode: 'MM240503002',
    paidAt: pastDate(14),
    createdAt: pastDate(15),
  },
  {
    id: 'payment-3',
    bookingId: 'booking-6',
    userId: 'user-3',
    expertId: 'expert-4',
    amount: 700000,
    status: PaymentStatus.PAID,
    bankAccount: '1234567890',
    transferCode: 'MM240426003',
    paidAt: pastDate(21),
    createdAt: pastDate(22),
  },
  {
    id: 'payment-4',
    bookingId: 'booking-4',
    userId: 'user-2',
    expertId: 'expert-1',
    amount: 800000,
    status: PaymentStatus.PENDING,
    bankAccount: '1234567890',
    transferCode: 'MM240507004',
    createdAt: pastDate(1),
  },
  {
    id: 'payment-5',
    bookingId: 'booking-7',
    userId: 'user-1',
    expertId: 'expert-5',
    amount: 1000000,
    status: PaymentStatus.PAID,
    bankAccount: '1234567890',
    transferCode: 'MM240505005',
    paidAt: pastDate(5),
    createdAt: pastDate(5),
  },
  {
    id: 'payment-6',
    bookingId: 'booking-8',
    userId: 'user-2',
    expertId: 'expert-6',
    amount: 600000,
    status: PaymentStatus.REFUNDED,
    bankAccount: '1234567890',
    transferCode: 'MM240420006',
    paidAt: pastDate(28),
    createdAt: pastDate(29),
  },
  {
    id: 'payment-7',
    bookingId: 'booking-5',
    userId: 'user-2',
    expertId: 'expert-3',
    amount: 1500000,
    status: PaymentStatus.FAILED,
    createdAt: pastDate(10),
  },
]

export const mockRefunds: Refund[] = [
  {
    id: 'refund-1',
    bookingId: 'booking-8',
    paymentId: 'payment-6',
    userId: 'user-2',
    amount: 300000,
    reason: 'Chuyên gia vắng mặt không có lý do. Hoàn 50% theo chính sách.',
    status: RefundStatus.PROCESSED,
    requestedAt: pastDate(19),
    processedAt: pastDate(18),
    adminNote: 'Đã xác minh chuyên gia vắng mặt. Duyệt hoàn 50%.',
  },
  {
    id: 'refund-2',
    bookingId: 'booking-10',
    paymentId: 'payment-1',
    userId: 'user-1',
    amount: 800000,
    reason: 'Thanh toán nhầm cho đơn đặt lịch đã hết hạn.',
    status: RefundStatus.PENDING,
    requestedAt: pastDate(2),
  },
]

export const mockPayouts: Payout[] = [
  {
    id: 'payout-1',
    expertId: 'expert-1',
    amount: 5600000,
    status: 'PROCESSED',
    requestedAt: pastDate(30),
    processedAt: pastDate(28),
    bankAccount: 'Vietcombank - 9876543210',
  },
  {
    id: 'payout-2',
    expertId: 'expert-1',
    amount: 4800000,
    status: 'PROCESSED',
    requestedAt: pastDate(60),
    processedAt: pastDate(58),
    bankAccount: 'Vietcombank - 9876543210',
  },
  {
    id: 'payout-3',
    expertId: 'expert-6',
    amount: 3200000,
    status: 'PROCESSED',
    requestedAt: pastDate(25),
    processedAt: pastDate(23),
    bankAccount: 'Techcombank - 1122334455',
  },
  {
    id: 'payout-4',
    expertId: 'expert-1',
    amount: 3200000,
    status: 'PENDING',
    requestedAt: pastDate(1),
    bankAccount: 'Vietcombank - 9876543210',
  },
]

export const mockMonthlyRevenue = [
  { month: 'Th1/2025', revenue: 45000000, sessions: 52 },
  { month: 'Th2/2025', revenue: 52000000, sessions: 61 },
  { month: 'Th3/2025', revenue: 48000000, sessions: 57 },
  { month: 'Th4/2025', revenue: 67000000, sessions: 78 },
  { month: 'Th5/2025', revenue: 71000000, sessions: 84 },
]
