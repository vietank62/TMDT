'use client'

import { useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, setSessionCookie, clearSessionCookie } from '@/lib/firebase-auth'
import { setUser, setRoles } from '@/store/slices/authSlice'
import { useAppDispatch } from '@/store/hooks'
import { UserRole } from '@/types'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        }))

        // Read roles from custom claims set by the backend.
        // Falls back to [USER] for new accounts without claims yet.
        const tokenResult = await firebaseUser.getIdTokenResult()
        const claimRoles = tokenResult.claims.roles as UserRole[] | undefined
        dispatch(setRoles(claimRoles ?? [UserRole.USER]))

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
