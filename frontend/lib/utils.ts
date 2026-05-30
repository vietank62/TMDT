import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns/format'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { parseISO } from 'date-fns/parseISO'
import { vi } from 'date-fns/locale/vi'
import { BookingStatus, ExpertApplicationStatus, NotificationType, PaymentStatus, RefundStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: vi })
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "HH:mm - dd/MM/yyyy", { locale: vi })
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: vi })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getBookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    [BookingStatus.DRAFT]: 'Nháp',
    [BookingStatus.PENDING_APPROVAL]: 'Chờ chuyên gia duyệt',
    [BookingStatus.REJECTED]: 'Bị từ chối',
    [BookingStatus.APPROVED_AWAITING_PAYMENT]: 'Chờ thanh toán',
    [BookingStatus.EXPIRED_UNPAID]: 'Hết hạn thanh toán',
    [BookingStatus.PAID_CONFIRMED]: 'Đã thanh toán',
    [BookingStatus.IN_PROGRESS]: 'Đang diễn ra',
    [BookingStatus.COMPLETED]: 'Hoàn thành',
    [BookingStatus.CANCELLED_BY_USER]: 'Người dùng hủy',
    [BookingStatus.CANCELLED_BY_EXPERT]: 'Chuyên gia hủy',
    [BookingStatus.NO_SHOW_USER]: 'Người dùng vắng mặt',
    [BookingStatus.NO_SHOW_EXPERT]: 'Chuyên gia vắng mặt',
    [BookingStatus.REFUND_PENDING]: 'Chờ hoàn tiền',
    [BookingStatus.REFUNDED]: 'Đã hoàn tiền',
  }
  return labels[status] ?? status
}

export function getBookingStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    [BookingStatus.DRAFT]: 'bg-gray-100 text-gray-700',
    [BookingStatus.PENDING_APPROVAL]: 'bg-yellow-100 text-yellow-700',
    [BookingStatus.REJECTED]: 'bg-red-100 text-red-700',
    [BookingStatus.APPROVED_AWAITING_PAYMENT]: 'bg-blue-100 text-blue-700',
    [BookingStatus.EXPIRED_UNPAID]: 'bg-orange-100 text-orange-700',
    [BookingStatus.PAID_CONFIRMED]: 'bg-green-100 text-green-700',
    [BookingStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-700',
    [BookingStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700',
    [BookingStatus.CANCELLED_BY_USER]: 'bg-gray-100 text-gray-600',
    [BookingStatus.CANCELLED_BY_EXPERT]: 'bg-gray-100 text-gray-600',
    [BookingStatus.NO_SHOW_USER]: 'bg-red-100 text-red-600',
    [BookingStatus.NO_SHOW_EXPERT]: 'bg-red-100 text-red-600',
    [BookingStatus.REFUND_PENDING]: 'bg-orange-100 text-orange-700',
    [BookingStatus.REFUNDED]: 'bg-teal-100 text-teal-700',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-700'
}

export function getApplicationStatusLabel(status: ExpertApplicationStatus): string {
  const labels: Record<ExpertApplicationStatus, string> = {
    [ExpertApplicationStatus.PENDING_REVIEW]: 'Chờ duyệt',
    [ExpertApplicationStatus.APPROVED]: 'Được phê duyệt',
    [ExpertApplicationStatus.REJECTED]: 'Bị từ chối',
    [ExpertApplicationStatus.NEEDS_REVISION]: 'Cần bổ sung',
  }
  return labels[status] ?? status
}

export function getApplicationStatusColor(status: ExpertApplicationStatus): string {
  const colors: Record<ExpertApplicationStatus, string> = {
    [ExpertApplicationStatus.PENDING_REVIEW]: 'bg-yellow-100 text-yellow-700',
    [ExpertApplicationStatus.APPROVED]: 'bg-green-100 text-green-700',
    [ExpertApplicationStatus.REJECTED]: 'bg-red-100 text-red-700',
    [ExpertApplicationStatus.NEEDS_REVISION]: 'bg-orange-100 text-orange-700',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-700'
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'Chờ thanh toán',
    [PaymentStatus.PAID]: 'Đã thanh toán',
    [PaymentStatus.FAILED]: 'Thất bại',
    [PaymentStatus.REFUNDED]: 'Đã hoàn tiền',
  }
  return labels[status] ?? status
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
    [PaymentStatus.PAID]: 'bg-green-100 text-green-700',
    [PaymentStatus.FAILED]: 'bg-red-100 text-red-700',
    [PaymentStatus.REFUNDED]: 'bg-teal-100 text-teal-700',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-700'
}

export function getRefundStatusLabel(status: RefundStatus): string {
  const labels: Record<RefundStatus, string> = {
    [RefundStatus.PENDING]: 'Chờ xử lý',
    [RefundStatus.APPROVED]: 'Đã duyệt',
    [RefundStatus.REJECTED]: 'Bị từ chối',
    [RefundStatus.PROCESSED]: 'Đã hoàn tiền',
  }
  return labels[status] ?? status
}

export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    [NotificationType.BOOKING_ACCEPTED]: 'Yêu cầu được chấp nhận',
    [NotificationType.BOOKING_REJECTED]: 'Yêu cầu bị từ chối',
    [NotificationType.PAYMENT_SUCCESS]: 'Thanh toán thành công',
    [NotificationType.SESSION_REMINDER]: 'Nhắc nhở phiên tư vấn',
    [NotificationType.REFUND_SUCCESS]: 'Hoàn tiền thành công',
    [NotificationType.NEW_REVIEW]: 'Đánh giá mới',
    [NotificationType.APPLICATION_APPROVED]: 'Hồ sơ được phê duyệt',
    [NotificationType.APPLICATION_REJECTED]: 'Hồ sơ bị từ chối',
    [NotificationType.PROFILE_UPDATE_APPROVED]: 'Cập nhật hồ sơ được duyệt',
  }
  return labels[type] ?? type
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateAvatarUrl(name: string, id: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}&backgroundColor=b6e3f4`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
