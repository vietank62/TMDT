import { request } from '../http'
import { mapApplication } from '../mappers'

export const applicationsService = {
  submit: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>('/expert-applications', { method: 'POST', body }).then(mapApplication),
  me: () => request<Record<string, unknown>>('/expert-applications/me').then(mapApplication),
  updateMe: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>('/expert-applications/me', { method: 'PATCH', body }).then(mapApplication),
  withdraw: () => request<void>('/expert-applications/me', { method: 'DELETE' }),
}
