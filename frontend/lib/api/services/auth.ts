import { request } from '../http'
import { mapUser } from '../mappers'

export const authService = {
  sync: (body: { firebase_uid: string; email: string | null; full_name?: string | null; avatar_url?: string | null }) =>
    request<Record<string, unknown>>('/auth/sync', { method: 'POST', body }).then(mapUser),
  me: () => request<Record<string, unknown>>('/auth/me').then(mapUser),
}
