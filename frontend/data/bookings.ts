import { Booking, BookingStatus } from '@/types'

const pastDate = (daysAgo: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}
const futureDate = (daysAhead: number) => {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString()
}

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    userId: 'user-1',
    expertId: 'expert-1',
    slotId: 'slot-1',
    status: BookingStatus.PAID_CONFIRMED,
    problemDescription: 'Tôi đang xây dựng một hệ thống microservices và gặp vấn đề về communication giữa các service. Cần tư vấn về event-driven architecture và message queue.',
    sessionGoals: 'Hiểu rõ hơn về Kafka vs RabbitMQ, thiết kế event schema, xử lý distributed transactions.',
    documents: [
      { id: 'doc-1', name: 'system-architecture.pdf', size: 2048000, type: 'application/pdf', url: '#' },
      { id: 'doc-2', name: 'requirements.docx', size: 512000, type: 'application/docx', url: '#' },
    ],
    scheduledAt: futureDate(2),
    durationMinutes: 60,
    priceVnd: 800000,
    paymentDeadline: futureDate(1),
    createdAt: pastDate(3),
    updatedAt: pastDate(2),
  },
  {
    id: 'booking-2',
    userId: 'user-1',
    expertId: 'expert-2',
    slotId: 'slot-8',
    status: BookingStatus.COMPLETED,
    problemDescription: 'Cần xây dựng chiến lược marketing cho sản phẩm SaaS B2B mới. Ngân sách hạn chế, cần định hướng kênh phù hợp nhất.',
    sessionGoals: 'Lập kế hoạch marketing 6 tháng, xác định ICP, chiến lược content.',
    documents: [],
    scheduledAt: pastDate(7),
    durationMinutes: 60,
    priceVnd: 1200000,
    createdAt: pastDate(14),
    updatedAt: pastDate(7),
  },
  {
    id: 'booking-3',
    userId: 'user-1',
    expertId: 'expert-6',
    slotId: 'slot-19',
    status: BookingStatus.PENDING_APPROVAL,
    problemDescription: 'Tôi muốn chuyển từ backend developer sang product manager. Cần lộ trình cụ thể và cách chuẩn bị hồ sơ.',
    sessionGoals: 'Định hướng career path, review CV, chuẩn bị phỏng vấn PM.',
    documents: [
      { id: 'doc-3', name: 'my-cv.pdf', size: 1024000, type: 'application/pdf', url: '#' },
    ],
    scheduledAt: futureDate(5),
    durationMinutes: 45,
    priceVnd: 600000,
    createdAt: pastDate(1),
    updatedAt: pastDate(1),
  },
  {
    id: 'booking-4',
    userId: 'user-2',
    expertId: 'expert-1',
    slotId: 'slot-4',
    status: BookingStatus.APPROVED_AWAITING_PAYMENT,
    problemDescription: 'Cần review code base của dự án và tư vấn về cách refactor sang clean architecture.',
    sessionGoals: 'Code review, thiết kế lại cấu trúc project, áp dụng SOLID principles.',
    documents: [],
    scheduledAt: futureDate(3),
    durationMinutes: 60,
    priceVnd: 800000,
    paymentDeadline: futureDate(1),
    createdAt: pastDate(2),
    updatedAt: pastDate(1),
  },
  {
    id: 'booking-5',
    userId: 'user-2',
    expertId: 'expert-3',
    slotId: 'slot-12',
    status: BookingStatus.REJECTED,
    problemDescription: 'Cần tư vấn về việc huy động vốn Series A cho startup fintech.',
    sessionGoals: 'Hiểu quy trình fundraising, chuẩn bị pitch deck, định giá startup.',
    documents: [
      { id: 'doc-4', name: 'pitch-deck.pdf', size: 5120000, type: 'application/pdf', url: '#' },
    ],
    scheduledAt: pastDate(5),
    durationMinutes: 60,
    priceVnd: 1500000,
    createdAt: pastDate(10),
    updatedAt: pastDate(8),
    rejectionReason: 'Lịch của tôi đang bận vào thời điểm này. Vui lòng chọn lịch khác hoặc liên hệ lại sau 2 tuần.',
  },
  {
    id: 'booking-6',
    userId: 'user-3',
    expertId: 'expert-4',
    slotId: 'slot-14',
    status: BookingStatus.COMPLETED,
    problemDescription: 'Review portfolio design và tư vấn cách cải thiện để xin việc tại các công ty lớn.',
    sessionGoals: 'Feedback chi tiết về portfolio, case studies, presentation skills.',
    documents: [
      { id: 'doc-5', name: 'portfolio-link.txt', size: 256, type: 'text/plain', url: '#' },
    ],
    scheduledAt: pastDate(14),
    durationMinutes: 60,
    priceVnd: 700000,
    createdAt: pastDate(21),
    updatedAt: pastDate(14),
  },
  {
    id: 'booking-7',
    userId: 'user-1',
    expertId: 'expert-5',
    slotId: 'slot-15',
    status: BookingStatus.IN_PROGRESS,
    problemDescription: 'Cần tư vấn về chiến lược go-to-market cho sản phẩm EdTech.',
    sessionGoals: 'Xác định target market, pricing strategy, sales channels.',
    documents: [],
    scheduledAt: new Date().toISOString(),
    durationMinutes: 60,
    priceVnd: 1000000,
    createdAt: pastDate(5),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'booking-8',
    userId: 'user-2',
    expertId: 'expert-6',
    slotId: 'slot-20',
    status: BookingStatus.REFUNDED,
    problemDescription: 'Tư vấn về phỏng vấn xin việc tại công ty nước ngoài.',
    sessionGoals: 'Mock interview, feedback, tips để vượt qua vòng phỏng vấn kỹ thuật.',
    documents: [],
    scheduledAt: pastDate(20),
    durationMinutes: 45,
    priceVnd: 600000,
    createdAt: pastDate(28),
    updatedAt: pastDate(18),
  },
  {
    id: 'booking-9',
    userId: 'user-3',
    expertId: 'expert-7',
    slotId: 'slot-17',
    status: BookingStatus.PENDING_APPROVAL,
    problemDescription: 'Tôi đang cân nhắc gia nhập thị trường Nhật Bản. Cần tư vấn về cách tiếp cận và đàm phán với đối tác Nhật.',
    sessionGoals: 'Hiểu văn hóa kinh doanh Nhật, chiến lược market entry, tìm kiếm đối tác.',
    documents: [],
    scheduledAt: futureDate(6),
    durationMinutes: 60,
    priceVnd: 1300000,
    createdAt: pastDate(1),
    updatedAt: pastDate(1),
  },
  {
    id: 'booking-10',
    userId: 'user-1',
    expertId: 'expert-1',
    slotId: 'slot-7',
    status: BookingStatus.EXPIRED_UNPAID,
    problemDescription: 'Tư vấn về database optimization và query performance tuning.',
    sessionGoals: 'Tối ưu slow queries, indexing strategy, partitioning.',
    documents: [],
    scheduledAt: pastDate(3),
    durationMinutes: 60,
    priceVnd: 800000,
    paymentDeadline: pastDate(4),
    createdAt: pastDate(7),
    updatedAt: pastDate(4),
  },
]

export function getBookingById(id: string): Booking | undefined {
  return mockBookings.find((b) => b.id === id)
}

export function getBookingsByUserId(userId: string): Booking[] {
  return mockBookings.filter((b) => b.userId === userId)
}

export function getBookingsByExpertId(expertId: string): Booking[] {
  return mockBookings.filter((b) => b.expertId === expertId)
}

export function getPendingBookingsForExpert(expertId: string): Booking[] {
  return mockBookings.filter(
    (b) => b.expertId === expertId && b.status === BookingStatus.PENDING_APPROVAL
  )
}
