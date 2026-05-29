/**
 * Public API surface. The implementation lives in `lib/api/` (centralized
 * Axios client, interceptors, typed services). This barrel preserves the
 * original import path (`@/lib/api`) and named exports used across the app.
 */
export { api, API_BASE_URL } from './api/services'
export type { UploadedFileRef } from './api/services'
export { ApiError } from './api/errors'
export * from './api/mappers'
export type {
  PaginatedResponse,
  AdminBooking,
  AdminPayment,
  AdminReview,
  AdminRefund,
  FieldErrors,
} from './api/types'
