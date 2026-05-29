import { request } from '../http'
import { mapUser } from '../mappers'

export const usersService = {
  updateMe: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>('/users/me', { method: 'PATCH', body }).then(mapUser),
}
