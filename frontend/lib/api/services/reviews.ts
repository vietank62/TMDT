import { request } from '../http'
import { mapReview } from '../mappers'

export const reviewsService = {
  create: (body: { booking_id: string; rating: number; comment: string }) =>
    request<Record<string, unknown>>('/reviews', { method: 'POST', body }).then(mapReview),
}
