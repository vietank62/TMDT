import { Notification, NotificationType } from '@/types'

const pastDate = (daysAgo: number, hoursAgo = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(d.getHours() - hoursAgo)
  return d.toISOString()
}

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.BOOKING_ACCEPTED,
    title: 'Yêu cầu tư vấn được chấp nhận',
    message: 'Chuyên gia Nguyễn Minh Đức đã chấp nhận yêu cầu tư vấn của bạn. Vui lòng thanh toán trong vòng 24 giờ.',
    isRead: false,
    createdAt: pastDate(0, 2),
    relatedBookingId: 'booking-1',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: NotificationType.PAYMENT_SUCCESS,
    title: 'Thanh toán thành công',
    message: 'Bạn đã thanh toán thành công 1.200.000đ cho buổi tư vấn với chuyên gia Trần Thị Linh.',
    isRead: false,
    createdAt: pastDate(0, 5),
    relatedBookingId: 'booking-2',
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: NotificationType.SESSION_REMINDER,
    title: 'Nhắc nhở: Phiên tư vấn sắp bắt đầu',
    message: 'Phiên tư vấn với Nguyễn Minh Đức sẽ bắt đầu sau 1 giờ nữa. Hãy chuẩn bị sẵn sàng!',
    isRead: true,
    createdAt: pastDate(1),
    relatedBookingId: 'booking-1',
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: NotificationType.BOOKING_REJECTED,
    title: 'Yêu cầu tư vấn bị từ chối',
    message: 'Rất tiếc, chuyên gia Võ Quốc Bảo không thể nhận yêu cầu của bạn vào thời điểm này. Vui lòng chọn thời gian khác.',
    isRead: true,
    createdAt: pastDate(8),
    relatedBookingId: 'booking-5',
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    type: NotificationType.REFUND_SUCCESS,
    title: 'Hoàn tiền thành công',
    message: 'Số tiền 300.000đ đã được hoàn về tài khoản của bạn trong vòng 3-5 ngày làm việc.',
    isRead: true,
    createdAt: pastDate(18),
    relatedBookingId: 'booking-8',
  },
  {
    id: 'notif-6',
    userId: 'user-1',
    type: NotificationType.NEW_REVIEW,
    title: 'Đánh giá mới từ người dùng',
    message: 'Nguyễn Thị Mai đã để lại đánh giá 5 sao cho buổi tư vấn của bạn.',
    isRead: true,
    createdAt: pastDate(7),
    relatedBookingId: 'booking-2',
  },
  {
    id: 'notif-7',
    userId: 'user-4',
    type: NotificationType.APPLICATION_APPROVED,
    title: 'Hồ sơ chuyên gia được phê duyệt',
    message: 'Chúc mừng! Hồ sơ chuyên gia của bạn đã được phê duyệt. Bạn có thể bắt đầu nhận yêu cầu tư vấn ngay bây giờ.',
    isRead: false,
    createdAt: pastDate(2),
  },
  {
    id: 'notif-8',
    userId: 'user-2',
    type: NotificationType.BOOKING_ACCEPTED,
    title: 'Yêu cầu tư vấn được chấp nhận',
    message: 'Chuyên gia Nguyễn Minh Đức đã chấp nhận yêu cầu tư vấn của bạn về system design.',
    isRead: false,
    createdAt: pastDate(1),
    relatedBookingId: 'booking-4',
  },
  {
    id: 'notif-9',
    userId: 'user-2',
    type: NotificationType.PAYMENT_SUCCESS,
    title: 'Thanh toán thành công',
    message: 'Bạn đã thanh toán thành công 600.000đ cho buổi tư vấn với chuyên gia Phạm Minh Đức.',
    isRead: true,
    createdAt: pastDate(28),
    relatedBookingId: 'booking-8',
  },
  {
    id: 'notif-10',
    userId: 'user-1',
    type: NotificationType.SESSION_REMINDER,
    title: 'Phiên tư vấn đang diễn ra',
    message: 'Phiên tư vấn của bạn với Nguyễn Văn An đang diễn ra. Nhấn vào để tham gia ngay.',
    isRead: false,
    createdAt: pastDate(0, 0),
    relatedBookingId: 'booking-7',
  },
]

export function getNotificationsByUserId(userId: string): Notification[] {
  return mockNotifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getUnreadCount(userId: string): number {
  return mockNotifications.filter((n) => n.userId === userId && !n.isRead).length
}
