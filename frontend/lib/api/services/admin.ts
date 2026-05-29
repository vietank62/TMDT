import { request, unwrap } from '../http'
import {
  mapAdminBooking,
  mapAdminPayment,
  mapAdminRefund,
  mapAdminReview,
  mapApplication,
  mapExpert,
  mapReview,
  mapUser,
} from '../mappers'
import type { PaginatedResponse } from '../types'

export const adminService = {
  dashboard: () => request<Record<string, unknown>>('/admin/dashboard'),
  users: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/admin/users').then((data) => unwrap(data).map(mapUser)),
  experts: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/admin/experts').then((data) => unwrap(data).map(mapExpert)),
  applications: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/admin/applications').then((data) =>
      unwrap(data).map(mapApplication),
    ),
  application: (id: string) => request<Record<string, unknown>>(`/admin/applications/${id}`).then(mapApplication),
  bookings: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/admin/bookings').then((data) => unwrap(data).map(mapAdminBooking)),
  payments: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/admin/payments').then((data) => unwrap(data).map(mapAdminPayment)),
  refunds: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/admin/refunds').then((data) => unwrap(data).map(mapAdminRefund)),
  reviews: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/admin/reviews').then((data) => unwrap(data).map(mapAdminReview)),
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
}
