import type {
  Booking,
  Payment,
  Review,
  Refund,
} from '@/types'

/** Standard DRF page-number pagination envelope. */
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

/** Field-level validation errors returned by DRF ({ field: [messages] }). */
export type FieldErrors = Record<string, string[]>

/** Options accepted by the typed `request()` helper. */
export interface RequestOptions {
  method?: string
  body?: unknown
  params?: Record<string, string | number | boolean | null | undefined>
  /** Whether to attach the Firebase bearer token. Defaults to true. */
  auth?: boolean
  headers?: Record<string, string>
  /** Per-request timeout override in milliseconds. */
  timeout?: number
}
