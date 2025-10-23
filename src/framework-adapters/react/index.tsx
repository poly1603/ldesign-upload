/**
 * React Adapter for @ldesign/upload
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Uploader } from '../../core/Uploader'
import type { UploaderOptions, FileItem } from '../../types'

export interface ReactUploaderProps extends Partial<UploaderOptions> {
  // Event handlers
  onReady?: (uploader: Uploader) => void
  onFileAdded?: (file: FileItem) => void
  onFileRemoved?: (fileId: string) => void
  onUploadStart?: (fileId: string) => void
  onUploadProgress?: (event: any) => void
  onUploadSuccess?: (fileId: string, response: any) => void
  onUploadError?: (fileId: string, error: Error) => void
  onUploadComplete?: () => void
  onValidationError?: (file: File, error: Error) => void

  // Style
  className?: string
  style?: React.CSSProperties
}

export interface ReactUploaderRef {
  getUploader: () => Uploader | undefined
  addFile: (file: File) => Promise<FileItem | null>
  addFiles: (files: File[]) => Promise<void>
  removeFile: (fileId: string) => boolean
  uploadFile: (fileId: string) => Promise<void>
  uploadAll: () => void
  pause: (fileId: string) => void
  resume: (fileId: string) => void
  cancel: (fileId: string) => void
  retry: (fileId: string) => void
  clear: () => void
  openFilePicker: () => void
  getFiles: () => FileItem[]
  getFile: (fileId: string) => FileItem | undefined
  getStats: () => any
}

export const ReactUploader = forwardRef<ReactUploaderRef, ReactUploaderProps>((props, ref) => {
  const {
    onReady,
    onFileAdded,
    onFileRemoved,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onUploadComplete,
    onValidationError,
    className,
    style,
    ...uploaderOptions
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const uploaderRef = useRef<Uploader>()

  useEffect(() => {
    if (!containerRef.current) return

    const options: UploaderOptions = {
      ...uploaderOptions,
      container: containerRef.current,
      onFileAdded,
      onFileRemoved,
      onUploadStart,
      onUploadProgress,
      onUploadSuccess,
      onUploadError,
      onUploadComplete,
      onValidationError,
    }

    uploaderRef.current = new Uploader(options)

    if (onReady) {
      onReady(uploaderRef.current)
    }

    return () => {
      uploaderRef.current?.destroy()
    }
  }, [])

  // Update options when they change
  useEffect(() => {
    if (uploaderRef.current && props.endpoint) {
      // Recreate uploader if endpoint changes
      uploaderRef.current.destroy()
      if (containerRef.current) {
        uploaderRef.current = new Uploader({
          ...uploaderOptions,
          container: containerRef.current,
          onFileAdded,
          onFileRemoved,
          onUploadStart,
          onUploadProgress,
          onUploadSuccess,
          onUploadError,
          onUploadComplete,
          onValidationError,
        })
      }
    }
  }, [props.endpoint])

  useImperativeHandle(ref, () => ({
    getUploader: () => uploaderRef.current,
    addFile: (file: File) => uploaderRef.current?.addFile(file) || Promise.resolve(null),
    addFiles: (files: File[]) => uploaderRef.current?.addFiles(files) || Promise.resolve(),
    removeFile: (fileId: string) => uploaderRef.current?.removeFile(fileId) || false,
    uploadFile: (fileId: string) => uploaderRef.current?.uploadFile(fileId) || Promise.resolve(),
    uploadAll: () => uploaderRef.current?.uploadAll(),
    pause: (fileId: string) => uploaderRef.current?.pause(fileId),
    resume: (fileId: string) => uploaderRef.current?.resume(fileId),
    cancel: (fileId: string) => uploaderRef.current?.cancel(fileId),
    retry: (fileId: string) => uploaderRef.current?.retry(fileId),
    clear: () => uploaderRef.current?.clear(),
    openFilePicker: () => uploaderRef.current?.openFilePicker(),
    getFiles: () => uploaderRef.current?.getFiles() || [],
    getFile: (fileId: string) => uploaderRef.current?.getFile(fileId),
    getStats: () => uploaderRef.current?.getStats(),
  }))

  return <div ref={containerRef} className={className} style={style} />
})

ReactUploader.displayName = 'ReactUploader'

export default ReactUploader

