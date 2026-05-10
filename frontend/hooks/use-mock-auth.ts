'use client'

import { useState } from 'react'
import { User, UserRole } from '@/types'
import { currentUser, mockUsers } from '@/data/users'

// Simulates authenticated user state for the prototype
// In production, this would be replaced with a real auth provider
export function useMockAuth() {
  const [user] = useState<User>(currentUser)

  const isUser = user.roles.includes(UserRole.USER)
  const isExpert = user.roles.includes(UserRole.EXPERT)
  const isAdmin = user.roles.includes(UserRole.ADMIN)

  return { user, isUser, isExpert, isAdmin }
}

export function useMockExpertAuth() {
  const expertUser = mockUsers.find((u) => u.roles.includes(UserRole.EXPERT) && u.roles.includes(UserRole.USER))!
  const [user] = useState<User>(expertUser)
  return { user, isExpert: true }
}

export function useMockAdminAuth() {
  const adminUser = mockUsers.find((u) => u.roles.includes(UserRole.ADMIN))!
  const [user] = useState<User>(adminUser)
  return { user, isAdmin: true }
}
