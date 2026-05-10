'use client'

import { useRef, useState } from 'react'
import { FileText, Paperclip, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/utils'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
}

interface FileUploadDropzoneProps {
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
}

export default function FileUploadDropzone({
  files,
  onFilesChange,
  maxFiles = 5,
}: FileUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(newFiles: File[]) {
    const toAdd: UploadedFile[] = newFiles.map((f) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      type: f.type,
    }))
    onFilesChange([...files, ...toAdd].slice(0, maxFiles))
  }

  function removeFile(id: string) {
    onFilesChange(files.filter((f) => f.id !== id))
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
              <FileText className="h-4 w-4 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
              </div>
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
