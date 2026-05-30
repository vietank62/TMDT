import { request, unwrap } from '../http'
import { mapBooking } from '../mappers'
import type { PaginatedResponse } from '../types'

export const bookingsService = {
  list: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/bookings').then((data) => unwrap(data).map(mapBooking)),
  byId: (bookingId: string) => request<Record<string, unknown>>(`/bookings/${bookingId}`).then(mapBooking),
  create: (body: {
    expert_id: string
    slot_ids: string[]
    problem_description: string
    session_goals: string
    document_urls?: string[]
  }) => request<Record<string, unknown>>('/bookings', { method: 'POST', body }).then(mapBooking),
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
  sessionToken: (bookingId: string) =>
    request<{ app_id: string; channel: string; token: string; uid: number }>(
      `/bookings/${bookingId}/session-token`,
      { method: 'POST' },
    ).then((data) => ({
      appId: data.app_id,
      channel: data.channel,
      token: data.token,
      uid: data.uid,
    })),
}
