import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from './firebase'

export const SESSION_COOKIE = 'mm_session'

// These functions are only ever called from browser event handlers.
// auth is non-null at that point; the null case only exists at build time.
function getAuth() {
  if (!auth) throw new Error('Firebase auth is not initialized')
  return auth
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(getAuth(), email, password)
}

export async function signUp(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(getAuth(), email, password)
  await updateProfile(credential.user, { displayName })
  return credential
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return signInWithPopup(getAuth(), provider)
}

export async function signOut() {
  clearSessionCookie()
  return firebaseSignOut(getAuth())
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(getAuth(), email)
}

export function setSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`
}

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email hoặc mật khẩu không đúng'
      case 'auth/email-already-in-use':
        return 'Email này đã được sử dụng'
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu, tối thiểu 6 ký tự'
      case 'auth/too-many-requests':
        return 'Quá nhiều lần thử. Vui lòng thử lại sau'
      case 'auth/popup-closed-by-user':
        return 'Đăng nhập bị hủy'
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng. Vui lòng thử lại'
      default:
        return 'Đã xảy ra lỗi. Vui lòng thử lại'
    }
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại'
}

export { onAuthStateChanged } from 'firebase/auth'
export type { User as FirebaseUser } from 'firebase/auth'
