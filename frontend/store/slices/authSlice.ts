import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserRole } from '@/types'

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
}

interface AuthState {
  user: AuthUser | null
  roles: UserRole[]
  initialized: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  roles: [],
  initialized: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
      state.initialized = true
      state.loading = false
      state.error = null
      if (!action.payload) state.roles = []
    },
    setRoles(state, action: PayloadAction<UserRole[]>) {
      state.roles = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const { setUser, setRoles, setLoading, setError } = authSlice.actions
export default authSlice.reducer
