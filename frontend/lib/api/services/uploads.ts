import { rawClient } from '../client'
import { request } from '../http'

interface PresignedUrlResponse {
  file_id: string
  upload_url: string
  blob_path: string
  expires_at: string
  required_headers: Record<string, string>
}

interface ConfirmUploadResponse {
  file_id: string
  original_name: string
  content_type: string
  size: number
  category: string
  url: string | null
  uploaded_at: string
}

/** A successfully uploaded + confirmed file, ready to reference in a booking. */
export interface UploadedFileRef {
  fileId: string
  name: string
  size: number
  type: string
  /**
   * Canonical blob URL (SAS query stripped). Persisted as a booking
   * `document_url`. For private containers this is not publicly readable
   * without a separate read SAS.
   */
  url: string
  blobPath: string
}

/** Strips the SAS query string from an Azure upload URL to get the stable blob URL. */
function toCanonicalUrl(uploadUrl: string): string {
  const queryIndex = uploadUrl.indexOf('?')
  return queryIndex === -1 ? uploadUrl : uploadUrl.slice(0, queryIndex)
}

export const uploadsService = {
  /**
   * Full upload flow: request a presigned URL, PUT the bytes directly to Azure
   * (bypassing the app interceptors), then confirm the upload with the backend.
   */
  uploadFile: async (
    file: File,
    purpose: string,
    onProgress?: (percent: number) => void,
  ): Promise<UploadedFileRef> => {
    const contentType = file.type || 'application/octet-stream'

    const presigned = await request<PresignedUrlResponse>('/uploads/presigned-url', {
      method: 'POST',
      body: {
        filename: file.name,
        content_type: contentType,
        size_bytes: file.size,
        purpose,
      },
    })

    await rawClient.put(presigned.upload_url, file, {
      headers: presigned.required_headers,
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      },
    })

    const confirmed = await request<ConfirmUploadResponse>('/uploads/confirm', {
      method: 'POST',
      body: { file_id: presigned.file_id, size_bytes: file.size },
    })

    return {
      fileId: confirmed.file_id,
      name: confirmed.original_name || file.name,
      size: confirmed.size || file.size,
      type: confirmed.content_type || contentType,
      url: confirmed.url ?? toCanonicalUrl(presigned.upload_url),
      blobPath: presigned.blob_path,
    }
  },

  remove: (fileId: string) => request<void>(`/uploads/${fileId}`, { method: 'DELETE' }),
}
