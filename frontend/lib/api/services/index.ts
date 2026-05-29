import { authService } from './auth'
import { usersService } from './users'
import { expertsService } from './experts'
import { applicationsService } from './applications'
import { bookingsService } from './bookings'
import { paymentsService } from './payments'
import { reviewsService } from './reviews'
import { notificationsService } from './notifications'
import { payoutsService } from './payouts'
import { adminService } from './admin'
import { uploadsService } from './uploads'

export { API_BASE_URL } from '../client'
export type { UploadedFileRef } from './uploads'

/**
 * Aggregated API surface. Shape is intentionally identical to the previous
 * fetch-based client so existing `api.*` call sites keep working unchanged.
 */
export const api = {
  auth: authService,
  users: usersService,
  experts: expertsService,
  applications: applicationsService,
  bookings: bookingsService,
  payments: paymentsService,
  reviews: reviewsService,
  notifications: notificationsService,
  payouts: payoutsService,
  admin: adminService,
  uploads: uploadsService,
}
