'use client'

import { useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, setSessionCookie, clearSessionCookie } from '@/lib/firebase-auth'
import { setUser, setRoles } from '@/store/slices/authSlice'
import { useAppDispatch } from '@/store/hooks'
import { UserRole } from '@/types'
import { api } from '@/lib/api'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const fallbackUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        }

        dispatch(setUser(fallbackUser))

        // Read roles from custom claims set by the backend.
        // Falls back to [USER] for new accounts without claims yet.
        const tokenResult = await firebaseUser.getIdTokenResult()
        const claimRoles = tokenResult.claims.roles as UserRole[] | undefined
        let roles = claimRoles ?? [UserRole.USER]

        try {
          const backendUser = await api.auth.sync({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email,
            full_name: firebaseUser.displayName,
            avatar_url: firebaseUser.photoURL,
          })
          roles = backendUser.roles
          dispatch(setUser({
            ...fallbackUser,
            displayName: backendUser.fullName || fallbackUser.displayName,
            photoURL: backendUser.avatarUrl || fallbackUser.photoURL,
          }))
        } catch {
          // Keep Firebase-authenticated UI usable if the API is temporarily unavailable.
        }

        dispatch(setRoles(roles))

        setSessionCookie()
      } else {
        dispatch(setUser(null))
        clearSessionCookie()
      }
    })

    return unsubscribe
  }, [dispatch])

  return <>{children}</>
}
