import { auth } from '@/lib/firebase'

/**
 * Returns the current Firebase ID token, or null when no user is signed in.
 * Firebase transparently refreshes expired tokens here, so the common path
 * never needs a forced refresh.
 */
export async function getIdToken(): Promise<string | null> {
  if (!auth?.currentUser) return null
  return auth.currentUser.getIdToken()
}

/** True when a user is currently signed in. */
export function hasCurrentUser(): boolean {
  return Boolean(auth?.currentUser)
}

let refreshPromise: Promise<string | null> | null = null

/**
 * Forces a fresh Firebase ID token, deduplicating concurrent callers so a
 * burst of 401s triggers exactly one refresh (single-flight). Used by the
 * response interceptor when the backend rejects a stale token.
 */
export async function forceRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    if (!auth?.currentUser) return null
    try {
      return await auth.currentUser.getIdToken(true)
    } finally {
      // Allow the next 401 (after this retry) to refresh again if needed.
      refreshPromise = null
    }
  })()

  return refreshPromise
}
