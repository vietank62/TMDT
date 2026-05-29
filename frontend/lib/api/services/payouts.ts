import { request, unwrap } from '../http'
import { mapPayout } from '../mappers'
import type { PaginatedResponse } from '../types'

export const payoutsService = {
  list: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/expert/payouts').then((data) => unwrap(data).map(mapPayout)),
  request: (body: { amount: number; bank_account: Record<string, unknown> }) =>
    request<Record<string, unknown>>('/expert/payouts', { method: 'POST', body }).then(mapPayout),
  summary: () =>
    request<{ total_earnings: number; pending_balance: number; total_paid_out: number }>('/expert/payouts/summary'),
}
