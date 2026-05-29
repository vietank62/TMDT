import axios from 'axios'
import { setupInterceptors } from './interceptors'

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL

const DEFAULT_TIMEOUT_MS = 15000

/** Custom flags carried on each request config through the interceptors. */
declare module 'axios' {
  export interface AxiosRequestConfig {
    /** When false, no Firebase bearer token is attached. Defaults to true. */
    authRequired?: boolean
    /** Internal: set after a 401 has already triggered one refresh+retry. */
    _retry?: boolean
  }
}

/** App API client — baseURL, timeout, auth + error interceptors installed. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
})

setupInterceptors(apiClient)

/**
 * Interceptor-free client for absolute-URL calls that must NOT receive the
 * app's auth/localization headers — e.g. PUT-ing a blob to an Azure SAS URL.
 */
export const rawClient = axios.create()
