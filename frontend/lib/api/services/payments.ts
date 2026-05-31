import { request, unwrap } from '../http'
import { mapPayment, mapRefund } from '../mappers'
import type { PaymentCheck } from '@/types'
import type { PaginatedResponse } from '../types'

export const paymentsService = {
  list: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/payments').then((data) => unwrap(data).map(mapPayment)),
  createOrder: (bookingId: string) =>
    request<Record<string, unknown>>(`/payments/bookings/${bookingId}`, { method: 'POST' }).then(mapPayment),
  byId: (paymentId: string) => request<Record<string, unknown>>(`/payments/${paymentId}`).then(mapPayment),
  check: (paymentId: string) => request<PaymentCheck>(`/payments/${paymentId}/check`),
  refundByBooking: (bookingId: string) =>
    request<Record<string, unknown>>(`/refunds/bookings/${bookingId}`).then(mapRefund),
}
