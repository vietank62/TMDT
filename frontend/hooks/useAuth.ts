import { useAppSelector } from '@/store/hooks'
import { UserRole } from '@/types'

export function useAuth() {
  const { user, roles, initialized, loading, error } = useAppSelector((s) => s.auth)

  return {
    user,
    roles,
    initialized,
    loading,
    error,
    isAuthenticated: !!user,
    isUser: roles.includes(UserRole.USER),
    isExpert: roles.includes(UserRole.EXPERT),
    isAdmin: roles.includes(UserRole.ADMIN),
  }
}
