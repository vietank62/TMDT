import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { toApiError } from './errors'
import { forceRefreshToken, getIdToken, hasCurrentUser } from './token'

function redirectToSignIn() {
  if (typeof window !== 'undefined') {
    window.location.assign('/sign-in')
  }
}

/** Installs the request (auth + locale) and response (401 retry + error) interceptors. */
export function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    config.headers.set('Accept-Language', 'vi')

    // FormData sets its own multipart Content-Type/boundary.
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type')
    } else if (config.data !== undefined && !config.headers.has('Content-Type')) {
      config.headers.set('Content-Type', 'application/json')
    }

    if (config.authRequired !== false) {
      const token = await getIdToken()
      if (token) config.headers.set('Authorization', `Bearer ${token}`)
    }

    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig | undefined
      const status = error.response?.status

      const canRetry =
        status === 401 &&
        config !== undefined &&
        config.authRequired !== false &&
        !config._retry &&
        hasCurrentUser()

      if (canRetry) {
        config._retry = true
        try {
          const token = await forceRefreshToken()
          if (token) {
            config.headers.set('Authorization', `Bearer ${token}`)
            return client(config)
          }
        } catch {
          // fall through to forced sign-out below
        }
        redirectToSignIn()
        return Promise.reject(toApiError(error))
      }

      // Repeated 401 (already retried) or 401 with no signed-in user.
      if (status === 401 && config?.authRequired !== false) {
        redirectToSignIn()
      }

      return Promise.reject(toApiError(error))
    },
  )
}
