'use client'

import { useRef, useState } from 'react'
import { AlertCircle, FileText, Loader2, Paperclip, RefreshCw, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/utils'
import { api } from '@/lib/api'

export type UploadStatus = 'uploading' | 'done' | 'error'

export interface BookingFileItem {
  id: string
  name: string
  size: number
  type: string
  status: UploadStatus
  progress: number
  url?: string
  fileId?: string
  blobPath?: string
  error?: string
}

interface FileUploadDropzoneProps {
  files: BookingFileItem[]
  onFilesChange: (files: BookingFileItem[]) => void
  maxFiles?: number
  /** Backend upload purpose (Azure container routing). */
  purpose?: string
}

export default function FileUploadDropzone({
  files,
  onFilesChange,
  maxFiles = 5,
  purpose = 'booking_document',
}: FileUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Authoritative copy of the list (the parent only mutates it via our
  // onFilesChange), written synchronously so concurrent async upload callbacks
  // always read/patch the latest version. Also keep raw Files for retries.
  const filesRef = useRef<BookingFileItem[]>(files)
  const rawFiles = useRef<Map<string, File>>(new Map())

  function commit(next: BookingFileItem[]) {
    filesRef.current = next
    onFilesChange(next)
  }

  function patchItem(id: string, patch: Partial<BookingFileItem>) {
    commit(filesRef.current.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  async function uploadOne(id: string, file: File) {
    try {
      const ref = await api.uploads.uploadFile(file, purpose, (progress) => patchItem(id, { progress }))
      patchItem(id, {
        status: 'done',
        progress: 100,
        url: ref.url,
        fileId: ref.fileId,
        blobPath: ref.blobPath,
        error: undefined,
      })
    } catch (err) {
      patchItem(id, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Tải lên thất bại',
      })
    }
  }

  function addFiles(newFiles: File[]) {
    const slotsLeft = maxFiles - filesRef.current.length
    if (slotsLeft <= 0) return
    const accepted = newFiles.slice(0, slotsLeft)

    const items: BookingFileItem[] = accepted.map((f) => {
      const id = `file-${Date.now()}-${Math.random().toString(36).slice(2)}`
      rawFiles.current.set(id, f)
      return { id, name: f.name, size: f.size, type: f.type, status: 'uploading', progress: 0 }
    })

    commit([...filesRef.current, ...items])
    items.forEach((item) => uploadOne(item.id, rawFiles.current.get(item.id)!))
  }

  function retryFile(id: string) {
    const file = rawFiles.current.get(id)
    if (!file) return
    patchItem(id, { status: 'uploading', progress: 0, error: undefined })
    uploadOne(id, file)
  }

  function removeFile(id: string) {
    const item = filesRef.current.find((f) => f.id === id)
    if (item?.fileId) {
      api.uploads.remove(item.fileId).catch(() => undefined)
    }
    rawFiles.current.delete(id)
    commit(filesRef.current.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          addFiles(Array.from(e.dataTransfer.files))
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700">Kéo thả tập tin vào đây</p>
        <p className="text-xs text-gray-400 mt-1">hoặc nhấn để chọn tập tin (PDF, DOCX, PNG, JPG...)</p>
        <p className="text-xs text-gray-400 mt-1">Tối đa {maxFiles} tập tin</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(Array.from(e.target.files))
            e.target.value = ''
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2"
            >
              {file.status === 'uploading' ? (
                <Loader2 className="h-4 w-4 text-blue-500 shrink-0 animate-spin" />
              ) : file.status === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              ) : (
                <FileText className="h-4 w-4 text-blue-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                {file.status === 'uploading' ? (
                  <p className="text-xs text-blue-500">Đang tải lên... {file.progress}%</p>
                ) : file.status === 'error' ? (
                  <p className="text-xs text-red-500 truncate">{file.error ?? 'Tải lên thất bại'}</p>
                ) : (
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                )}
              </div>
              {file.status === 'error' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-blue-500"
                  onClick={() => retryFile(file.id)}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-red-500"
                onClick={() => removeFile(file.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Paperclip className="h-4 w-4" />
          <span>Chưa có tập tin nào được đính kèm</span>
        </div>
      )}
    </div>
  )
}
