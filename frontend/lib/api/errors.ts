import { AxiosError } from 'axios'
import type { FieldErrors } from './types'

/**
 * Normalized API error. `message` is always populated with the most useful
 * human-readable string (DRF `detail`, flattened field errors, or a fallback)
 * so that existing `catch (e) { e.message }` call sites keep working.
 */
export class ApiError extends Error {
  readonly status: number | null
  readonly code: string | null
  readonly fieldErrors: FieldErrors | null
  readonly isNetworkError: boolean
  readonly isTimeout: boolean

  constructor(params: {
    message: string
    status?: number | null
    code?: string | null
    fieldErrors?: FieldErrors | null
    isNetworkError?: boolean
    isTimeout?: boolean
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status ?? null
    this.code = params.code ?? null
    this.fieldErrors = params.fieldErrors ?? null
    this.isNetworkError = params.isNetworkError ?? false
    this.isTimeout = params.isTimeout ?? false
  }
}

interface DrfErrorPayload {
  detail?: unknown
  code?: unknown
  errors?: unknown
  [key: string]: unknown
}

function flattenFieldErrors(payload: DrfErrorPayload): {
  message: string | null
  fieldErrors: FieldErrors | null
} {
  // DRF may nest field errors under `errors`, or place them at the top level.
  const source =
    payload.errors && typeof payload.errors === 'object'
      ? (payload.errors as Record<string, unknown>)
      : payload

  const fieldErrors: FieldErrors = {}
  const messages: string[] = []

  for (const [key, raw] of Object.entries(source)) {
    if (key === 'detail' || key === 'code' || key === 'errors') continue
    const list = Array.isArray(raw)
      ? raw.map(String)
      : typeof raw === 'string'
        ? [raw]
        : []
    if (list.length > 0) {
      fieldErrors[key] = list
      messages.push(...list)
    }
  }

  return {
    message: messages.length > 0 ? messages.join(', ') : null,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : null,
  }
}

/** Convert an AxiosError into a normalized {@link ApiError}. */
export function toApiError(error: AxiosError): ApiError {
  if (error.code === 'ECONNABORTED') {
    return new ApiError({
      message: 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.',
      isTimeout: true,
    })
  }

  if (!error.response) {
    return new ApiError({
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      isNetworkError: true,
    })
  }

  const status = error.response.status
  const payload = (error.response.data ?? {}) as DrfErrorPayload
  const detail = typeof payload.detail === 'string' ? payload.detail : null
  const code = typeof payload.code === 'string' ? payload.code : null
  const { message: flatMessage, fieldErrors } = flattenFieldErrors(payload)

  return new ApiError({
    message: detail ?? flatMessage ?? `Request failed with status ${status}`,
    status,
    code,
    fieldErrors,
  })
}
