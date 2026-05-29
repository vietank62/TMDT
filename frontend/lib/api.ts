import { auth } from '@/lib/firebase'
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

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type AdminBooking = Booking & {
  userName: string
  expertName: string
}

export type AdminPayment = Payment & {
  userName: string
  expertName: string
}

export type AdminReview = Review & {
  reviewerName: string
  expertName: string
}

export type AdminRefund = Refund & {
  userName: string
  expertName: string
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  params?: Record<string, string | number | boolean | null | undefined>
  auth?: boolean
}

function toQueryString(params?: RequestOptions['params']) {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

async function getIdToken() {
  if (!auth?.currentUser) return null
  return auth.currentUser.getIdToken()
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, auth: needsAuth = true, headers, ...init } = options
  const token = needsAuth ? await getIdToken() : null
  const response = await fetch(`${API_BASE_URL}${path}${toQueryString(params)}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) return undefined as T

  const payload = await response.json().catch(() => undefined)
  if (!response.ok) {
    const message =
      payload?.detail ??
      Object.values(payload ?? {})?.flat?.()?.join?.(', ') ??
      `Request failed with status ${response.status}`
    throw new Error(message)
  }
  return payload as T
}

function unwrap<T>(data: PaginatedResponse<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results
}

const value = <T>(input: unknown, fallback: T): T =>
  input === undefined || input === null ? fallback : (input as T)

const optionalString = (input: unknown): string | undefined =>
  typeof input === 'string' ? input : undefined

const stringArray = (input: unknown): string[] =>
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
  if (input.is_superuser || input.is_staff || inputRoles.includes('admin')) roles.push(UserRole.ADMIN)
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

export const api = {
  auth: {
    sync: (body: { firebase_uid: string; email: string | null; full_name?: string | null; avatar_url?: string | null }) =>
      request<Record<string, unknown>>('/auth/sync', { method: 'POST', body }).then(mapUser),
    me: () => request<Record<string, unknown>>('/auth/me').then(mapUser),
  },
  users: {
    updateMe: (body: Record<string, unknown>) =>
      request<Record<string, unknown>>('/users/me', { method: 'PATCH', body }).then(mapUser),
  },
  experts: {
    list: (params?: RequestOptions['params']) =>
      request<PaginatedResponse<Record<string, unknown>>>('/experts', { params, auth: false }).then((data) => ({
        ...data,
        results: data.results.map(mapExpert),
      })),
    byId: (expertId: string) => request<Record<string, unknown>>(`/experts/${expertId}`, { auth: false }).then(mapExpert),
    bySlug: async (slug: string) => {
      const experts = await api.experts.list({ page_size: 100 })
      return experts.results.find((expert) => expert.slug === slug || expert.id === slug) ?? null
    },
    reviews: (expertId: string) =>
      request<PaginatedResponse<Record<string, unknown>>>(`/experts/${expertId}/reviews`, { auth: false }).then((data) =>
        unwrap(data).map(mapReview),
      ),
    availability: (expertId: string) =>
      request<PaginatedResponse<Record<string, unknown>>>(`/experts/${expertId}/availability`, { auth: false }).then((data) =>
        unwrap(data).map(mapAvailabilitySlot),
      ),
    profile: () => request<Record<string, unknown>>('/expert/profile').then(mapExpert),
    updateProfile: (body: Record<string, unknown>) =>
      request<Record<string, unknown>>('/expert/profile', { method: 'PATCH', body }).then(mapExpert),
    myAvailability: () =>
      request<PaginatedResponse<Record<string, unknown>>>('/expert/availability').then((data) =>
        unwrap(data).map(mapAvailabilitySlot),
      ),
    createAvailability: (body: { date: string; start_time: string }) =>
      request<Record<string, unknown>>('/expert/availability', { method: 'POST', body }).then(mapAvailabilitySlot),
    updateAvailability: (slotId: string, body: Record<string, unknown>) =>
      request<Record<string, unknown>>(`/expert/availability/${slotId}`, { method: 'PATCH', body }).then(mapAvailabilitySlot),
    deleteAvailability: (slotId: string) => request<void>(`/expert/availability/${slotId}`, { method: 'DELETE' }),
  },
  applications: {
    submit: (body: Record<string, unknown>) =>
      request<Record<string, unknown>>('/expert-applications', { method: 'POST', body }).then(mapApplication),
    me: () => request<Record<string, unknown>>('/expert-applications/me').then(mapApplication),
    updateMe: (body: Record<string, unknown>) =>
      request<Record<string, unknown>>('/expert-applications/me', { method: 'PATCH', body }).then(mapApplication),
    withdraw: () => request<void>('/expert-applications/me', { method: 'DELETE' }),
  },
  bookings: {
    list: () => request<PaginatedResponse<Record<string, unknown>>>('/bookings').then((data) => unwrap(data).map(mapBooking)),
    byId: (bookingId: string) => request<Record<string, unknown>>(`/bookings/${bookingId}`).then(mapBooking),
    create: (body: { expert_id: string; slot_ids: string[]; problem_description: string; session_goals: string; document_urls?: string[] }) =>
      request<Record<string, unknown>>('/bookings', { method: 'POST', body }).then(mapBooking),
    approve: (bookingId: string, expertNote?: string) =>
      request<Record<string, unknown>>(`/bookings/${bookingId}/approve`, {
        method: 'POST',
        body: { expert_note: expertNote ?? '' },
      }).then(mapBooking),
    reject: (bookingId: string, rejectionReason: string) =>
      request<Record<string, unknown>>(`/bookings/${bookingId}/reject`, {
        method: 'POST',
        body: { rejection_reason: rejectionReason },
      }).then(mapBooking),
    cancel: (bookingId: string, reason?: string) =>
      request<Record<string, unknown>>(`/bookings/${bookingId}/cancel`, { method: 'POST', body: { reason } }).then(mapBooking),
    complete: (bookingId: string) =>
      request<Record<string, unknown>>(`/bookings/${bookingId}/complete`, { method: 'POST' }).then(mapBooking),
    sessionToken: (bookingId: string) => request<Record<string, string | number>>(`/bookings/${bookingId}/session-token`, { method: 'POST' }),
  },
  payments: {
    list: () => request<PaginatedResponse<Record<string, unknown>>>('/payments').then((data) => unwrap(data).map(mapPayment)),
    createOrder: (bookingId: string) =>
      request<Record<string, unknown>>(`/payments/bookings/${bookingId}`, { method: 'POST' }).then(mapPayment),
    byId: (paymentId: string) => request<Record<string, unknown>>(`/payments/${paymentId}`).then(mapPayment),
    refundByBooking: (bookingId: string) => request<Record<string, unknown>>(`/refunds/bookings/${bookingId}`).then(mapRefund),
  },
  reviews: {
    create: (body: { booking_id: string; rating: number; comment: string }) =>
      request<Record<string, unknown>>('/reviews', { method: 'POST', body }).then(mapReview),
  },
  notifications: {
    list: () => request<PaginatedResponse<Record<string, unknown>>>('/notifications').then((data) => unwrap(data).map(mapNotification)),
    markRead: (id: string) => request<Notification>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => request<void>('/notifications/read-all', { method: 'POST' }),
  },
  payouts: {
    list: () => request<PaginatedResponse<Record<string, unknown>>>('/expert/payouts').then((data) => unwrap(data).map(mapPayout)),
    request: (body: { amount: number; bank_account: Record<string, unknown> }) =>
      request<Record<string, unknown>>('/expert/payouts', { method: 'POST', body }).then(mapPayout),
    summary: () => request<{ total_earnings: number; pending_balance: number; total_paid_out: number }>('/expert/payouts/summary'),
  },
  admin: {
    dashboard: () => request<Record<string, unknown>>('/admin/dashboard'),
    users: () => request<PaginatedResponse<Record<string, unknown>>>('/admin/users').then((data) => unwrap(data).map(mapUser)),
    experts: () => request<PaginatedResponse<Record<string, unknown>>>('/admin/experts').then((data) => unwrap(data).map(mapExpert)),
    applications: () =>
      request<PaginatedResponse<Record<string, unknown>>>('/admin/applications').then((data) => unwrap(data).map(mapApplication)),
    application: (id: string) => request<Record<string, unknown>>(`/admin/applications/${id}`).then(mapApplication),
    bookings: () => request<PaginatedResponse<Record<string, unknown>>>('/admin/bookings').then((data) => unwrap(data).map(mapAdminBooking)),
    payments: () => request<PaginatedResponse<Record<string, unknown>>>('/admin/payments').then((data) => unwrap(data).map(mapAdminPayment)),
    refunds: () => request<PaginatedResponse<Record<string, unknown>>>('/admin/refunds').then((data) => unwrap(data).map(mapAdminRefund)),
    reviews: () => request<PaginatedResponse<Record<string, unknown>>>('/admin/reviews').then((data) => unwrap(data).map(mapAdminReview)),
    approveApplication: (id: string, adminNote?: string) =>
      request<Record<string, unknown>>(`/admin/applications/${id}/approve`, { method: 'POST', body: { admin_note: adminNote } }).then(mapApplication),
    rejectApplication: (id: string, adminNote?: string) =>
      request<Record<string, unknown>>(`/admin/applications/${id}/reject`, { method: 'POST', body: { admin_note: adminNote } }).then(mapApplication),
    hideReview: (id: string) => request<Record<string, unknown>>(`/admin/reviews/${id}/hide`, { method: 'POST' }).then(mapReview),
    showReview: (id: string) => request<Record<string, unknown>>(`/admin/reviews/${id}/show`, { method: 'POST' }).then(mapReview),
    processRefund: (id: string, adminNote?: string) =>
      request<Record<string, unknown>>(`/admin/refunds/${id}/process`, { method: 'POST', body: { admin_note: adminNote } }).then(mapAdminRefund),
    rejectRefund: (id: string, adminNote?: string) =>
      request<Record<string, unknown>>(`/admin/refunds/${id}/reject`, { method: 'POST', body: { admin_note: adminNote } }).then(mapAdminRefund),
  },
}
