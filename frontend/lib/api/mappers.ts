import {
  BookingDocument,
  AvailabilitySlot,
  Booking,
  ExpertApplication,
  ExpertProfile,
  Notification,
  Payment,
  Payout,
  Refund,
  Review,
  User,
  UserRole,
} from '@/types'
import type { AdminBooking, AdminPayment, AdminRefund, AdminReview } from './types'

export const value = <T>(input: unknown, fallback: T): T =>
  input === undefined || input === null ? fallback : (input as T)

export const optionalString = (input: unknown): string | undefined =>
  typeof input === 'string' ? input : undefined

export const stringArray = (input: unknown): string[] =>
  Array.isArray(input) ? input.filter((item): item is string => typeof item === 'string') : []

const bookingDocuments = (input: unknown): BookingDocument[] => {
  if (!Array.isArray(input)) return []
  return input.flatMap((item, index) => {
    if (typeof item === 'string') {
      return [{
        id: `${index}-${item}`,
        name: item.split('/').pop() || `Tài liệu ${index + 1}`,
        size: 0,
        type: '',
        url: item,
      }]
    }
    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>
      return [{
        id: String(record.id ?? index),
        name: value(record.name, `Tài liệu ${index + 1}`),
        size: value(record.size, 0),
        type: value(record.type, ''),
        url: value(record.url, ''),
      }]
    }
    return []
  })
}

export function mapUser(input: Record<string, unknown>): User {
  const roles: UserRole[] = []
  const inputRoles = stringArray(input.roles)
  if (input.is_superuser || input.is_staff || inputRoles.includes(UserRole.ADMIN)) roles.push(UserRole.ADMIN)
  if (inputRoles.includes(UserRole.EXPERT)) roles.push(UserRole.EXPERT)
  if (!roles.includes(UserRole.USER)) roles.push(UserRole.USER)

  return {
    id: String(input.id),
    email: value(input.email, ''),
    fullName: value(input.full_name ?? input.fullName, String(input.email ?? '')),
    avatarUrl: value(input.avatar_url ?? input.avatarUrl, ''),
    roles,
    phone: optionalString(input.phone_number ?? input.phone),
    createdAt: value(input.created_at ?? input.createdAt, ''),
    isActive: value(input.is_active ?? input.isActive, true),
  }
}

export function mapExpert(input: Record<string, unknown>): ExpertProfile {
  return {
    id: String(input.id),
    userId: String(input.user_id ?? input.userId ?? ''),
    slug: value(input.slug, String(input.id)),
    displayName: value(input.display_name ?? input.displayName, ''),
    title: value(input.title, ''),
    company: value(input.company, ''),
    bio: value(input.bio, ''),
    skills: value(input.skills, []),
    yearsOfExperience: value(input.years_of_experience ?? input.yearsOfExperience, 0),
    pricePerSession: value(input.price_per_session ?? input.pricePerSession, 0),
    sessionDurationMinutes: value(input.session_duration_minutes ?? input.sessionDurationMinutes, 30),
    rating: Number(value(input.rating, 0)),
    reviewCount: value(input.review_count ?? input.reviewCount, 0),
    totalSessions: value(input.total_sessions ?? input.totalSessions, 0),
    linkedinUrl: value(input.linkedin_url ?? input.linkedinUrl, ''),
    portfolioUrl: optionalString(input.portfolio_url ?? input.portfolioUrl),
    certifications: value(input.certifications, []),
    languages: value(input.languages, []),
    category: value(input.category, ''),
    isAvailable: value(input.is_available ?? input.isAvailable, false),
    profilePictureUrl: value(input.profile_picture_url ?? input.profilePictureUrl, ''),
    profileStatus: value(input.profile_status ?? input.profileStatus, 'PENDING_REVIEW') as ExpertProfile['profileStatus'],
    totalEarnings: value(input.total_earnings ?? input.totalEarnings, 0),
    pendingBalance: value(input.pending_balance ?? input.pendingBalance, 0),
  }
}

export function mapAvailabilitySlot(input: Record<string, unknown>): AvailabilitySlot {
  return {
    id: String(input.id),
    expertId: String(input.expert_id ?? input.expertId ?? ''),
    date: value(input.date, ''),
    startTime: value(input.start_time ?? input.startTime, ''),
    endTime: value(input.end_time ?? input.endTime, ''),
    isBooked: value(input.is_booked ?? input.isBooked, false),
  }
}

export function mapBooking(input: Record<string, unknown>): Booking {
  return {
    id: String(input.id),
    userId: String(input.user_id ?? input.userId ?? ''),
    expertId: String(input.expert_id ?? input.expertId ?? ''),
    slotIds: value(input.slot_ids ?? input.slotIds, []),
    status: input.status as Booking['status'],
    problemDescription: value(input.problem_description ?? input.problemDescription, ''),
    sessionGoals: value(input.session_goals ?? input.sessionGoals, ''),
    documents: bookingDocuments(input.documents ?? input.document_urls),
    scheduledAt: value(input.scheduled_at ?? input.scheduledAt, ''),
    durationMinutes: value(input.duration_minutes ?? input.durationMinutes, 0),
    priceVnd: value(input.price_vnd ?? input.priceVnd, 0),
    paymentDeadline: optionalString(input.payment_deadline ?? input.paymentDeadline),
    createdAt: value(input.created_at ?? input.createdAt, ''),
    updatedAt: value(input.updated_at ?? input.updatedAt, ''),
    rejectionReason: optionalString(input.rejection_reason ?? input.rejectionReason),
    expertNote: optionalString(input.expert_note ?? input.expertNote),
  }
}

export function mapAdminBooking(input: Record<string, unknown>): AdminBooking {
  return {
    ...mapBooking(input),
    userName: value(input.user_name ?? input.userName, String(input.user_email ?? input.userId ?? '')),
    expertName: value(input.expert_name ?? input.expertName, String(input.expertId ?? '')),
  }
}

export function mapPayment(input: Record<string, unknown>): Payment {
  return {
    id: String(input.id),
    bookingId: String(input.booking_id ?? input.bookingId ?? ''),
    userId: String(input.user_id ?? input.userId ?? ''),
    expertId: String(input.expert_id ?? input.expertId ?? ''),
    amount: value(input.amount, 0),
    status: input.status as Payment['status'],
    sepayQrCode: optionalString(input.sepay_qr_code ?? input.sepayQrCode),
    bankAccount:
      typeof (input.bank_account ?? input.bankAccount) === 'string'
        ? String(input.bank_account ?? input.bankAccount)
        : JSON.stringify(input.bank_account ?? input.bankAccount ?? {}),
    transferCode: optionalString(input.transfer_code ?? input.transferCode),
    paidAt: optionalString(input.paid_at ?? input.paidAt),
    expiresAt: optionalString(input.expires_at ?? input.expiresAt),
    createdAt: value(input.created_at ?? input.createdAt, ''),
  }
}

export function mapAdminPayment(input: Record<string, unknown>): AdminPayment {
  return {
    ...mapPayment(input),
    userName: value(input.user_name ?? input.userName ?? input.user_email, String(input.userId ?? '')),
    expertName: value(input.expert_name ?? input.expertName, String(input.expertId ?? '')),
  }
}

export function mapReview(input: Record<string, unknown>): Review {
  return {
    id: String(input.id),
    bookingId: String(input.booking_id ?? input.bookingId ?? ''),
    reviewerId: String(input.reviewer_id ?? input.reviewerId ?? ''),
    expertId: String(input.expert_id ?? input.expertId ?? ''),
    rating: value(input.rating, 0),
    comment: value(input.comment, ''),
    createdAt: value(input.created_at ?? input.createdAt, ''),
    isPublic: value(input.is_public ?? input.isPublic, true),
  }
}

export function mapAdminReview(input: Record<string, unknown>): AdminReview {
  return {
    ...mapReview(input),
    reviewerName: value(input.reviewer_name ?? input.reviewerName ?? input.reviewer_email, 'Ẩn danh'),
    expertName: value(input.expert_name ?? input.expertName, String(input.expertId ?? '')),
  }
}

export function mapApplication(input: Record<string, unknown>): ExpertApplication {
  return {
    id: String(input.id),
    userId: String(input.user_id ?? input.userId ?? ''),
    applicantName: value(input.applicant_name ?? input.applicantName ?? input.display_name, ''),
    applicantEmail: value(input.applicant_email ?? input.applicantEmail, ''),
    applicantAvatar: value(input.applicant_avatar ?? input.applicantAvatar, ''),
    title: value(input.title, ''),
    company: value(input.company, ''),
    yearsOfExperience: value(input.years_of_experience ?? input.yearsOfExperience, 0),
    skills: value(input.skills, []),
    bio: value(input.bio, ''),
    category: value(input.category, ''),
    pricePerSession: value(input.price_per_session ?? input.pricePerSession, 0),
    linkedinUrl: value(input.linkedin_url ?? input.linkedinUrl, ''),
    portfolioUrl: optionalString(input.portfolio_url ?? input.portfolioUrl),
    certifications: value(input.certifications, []),
    status: value(input.status, 'PENDING_REVIEW') as ExpertApplication['status'],
    submittedAt: value(input.submitted_at ?? input.submittedAt, ''),
    reviewedAt: optionalString(input.reviewed_at ?? input.reviewedAt),
    adminNote: optionalString(input.admin_note ?? input.adminNote),
  }
}

export function mapNotification(input: Record<string, unknown>): Notification {
  return {
    id: String(input.id),
    userId: String(input.user_id ?? input.userId ?? ''),
    type: input.type as Notification['type'],
    title: value(input.title, ''),
    message: value(input.message, ''),
    isRead: value(input.is_read ?? input.isRead, false),
    createdAt: value(input.created_at ?? input.createdAt, ''),
    relatedBookingId: optionalString(input.related_booking_id ?? input.relatedBookingId),
  }
}

export function mapRefund(input: Record<string, unknown>): Refund {
  return {
    id: String(input.id),
    bookingId: String(input.booking_id ?? input.bookingId ?? ''),
    paymentId: String(input.payment_id ?? input.paymentId ?? ''),
    userId: String(input.user_id ?? input.userId ?? ''),
    amount: value(input.amount, 0),
    reason: value(input.reason, ''),
    status: input.status as Refund['status'],
    requestedAt: value(input.requested_at ?? input.requestedAt, ''),
    processedAt: optionalString(input.processed_at ?? input.processedAt),
    adminNote: optionalString(input.admin_note ?? input.adminNote),
  }
}

export function mapAdminRefund(input: Record<string, unknown>): AdminRefund {
  return {
    ...mapRefund(input),
    userName: value(input.user_name ?? input.userName ?? input.user_email, String(input.userId ?? '')),
    expertName: value(input.expert_name ?? input.expertName, String(input.expertId ?? '')),
  }
}

export function mapPayout(input: Record<string, unknown>): Payout {
  return {
    id: String(input.id),
    expertId: String(input.expert_id ?? input.expertId ?? ''),
    amount: value(input.amount, 0),
    status: input.status as Payout['status'],
    requestedAt: value(input.requested_at ?? input.requestedAt, ''),
    processedAt: optionalString(input.processed_at ?? input.processedAt),
    bankAccount:
      typeof (input.bank_account ?? input.bankAccount) === 'string'
        ? String(input.bank_account ?? input.bankAccount)
        : JSON.stringify(input.bank_account ?? input.bankAccount ?? {}),
  }
}
