import { request, unwrap } from '../http'
import { mapAvailabilitySlot, mapExpert, mapReview } from '../mappers'
import type { PaginatedResponse, RequestOptions } from '../types'

export const expertsService = {
  list: (params?: RequestOptions['params']) =>
    request<PaginatedResponse<Record<string, unknown>>>('/experts', { params, auth: false }).then((data) => ({
      ...data,
      results: data.results.map(mapExpert),
    })),
  byId: (expertId: string) =>
    request<Record<string, unknown>>(`/experts/${expertId}`, { auth: false }).then(mapExpert),
  bySlug: async (slug: string) => {
    const experts = await expertsService.list({ page_size: 100 })
    return experts.results.find((expert) => expert.slug === slug || expert.id === slug) ?? null
  },
  reviews: (expertId: string) =>
    request<PaginatedResponse<Record<string, unknown>>>(`/experts/${expertId}/reviews`, { auth: false }).then((data) =>
      unwrap(data).map(mapReview),
    ),
  availability: (expertId: string) =>
    request<PaginatedResponse<Record<string, unknown>>>(`/experts/${expertId}/availability`, { auth: false, params: { page_size: 500 } }).then((data) =>
      unwrap(data).map(mapAvailabilitySlot),
    ),
  profile: () => request<Record<string, unknown>>('/expert/profile').then(mapExpert),
  updateProfile: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>('/expert/profile', { method: 'PATCH', body }).then(mapExpert),
  myAvailability: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/expert/availability', { params: { page_size: 500 } }).then((data) =>
      unwrap(data).map(mapAvailabilitySlot),
    ),
  createAvailability: (body: { date: string; start_time: string }) =>
    request<Record<string, unknown>>('/expert/availability', { method: 'POST', body }).then(mapAvailabilitySlot),
  updateAvailability: (slotId: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/expert/availability/${slotId}`, { method: 'PATCH', body }).then(mapAvailabilitySlot),
  deleteAvailability: (slotId: string) => request<void>(`/expert/availability/${slotId}`, { method: 'DELETE' }),
}
