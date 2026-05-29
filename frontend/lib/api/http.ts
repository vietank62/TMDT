import { apiClient } from './client'
import type { PaginatedResponse, RequestOptions } from './types'

/**
 * Typed request helper over the shared Axios client. Preserves the original
 * fetch-wrapper signature so service modules port over unchanged. Errors are
 * already normalized to `ApiError` by the response interceptor.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, auth = true, headers, timeout } = options

  const response = await apiClient.request<T>({
    url: path,
    method,
    data: body,
    params,
    headers,
    timeout,
    authRequired: auth,
  })

  return response.data
}

/** Returns the array body whether the endpoint is paginated or a bare list. */
export function unwrap<T>(data: PaginatedResponse<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results
}
