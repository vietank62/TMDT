import { request, unwrap } from '../http'
import { mapNotification } from '../mappers'
import type { Notification } from '@/types'
import type { PaginatedResponse } from '../types'

export const notificationsService = {
  list: () =>
    request<PaginatedResponse<Record<string, unknown>>>('/notifications').then((data) =>
      unwrap(data).map(mapNotification),
    ),
  markRead: (id: string) => request<Notification>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => request<void>('/notifications/read-all', { method: 'POST' }),
}
