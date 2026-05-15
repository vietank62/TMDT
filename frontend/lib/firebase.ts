import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Guard against build-time module evaluation where NEXT_PUBLIC_* vars are absent.
// Firebase is client-only; callers must null-check before use.
const app: FirebaseApp | null = firebaseConfig.apiKey
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null

export const auth: Auth | null = app ? getAuth(app) : null

export const getFirebaseAnalytics = async () => {
  if (!app) return null
  if (await isSupported()) return getAnalytics(app)
  return null
}

export default app
