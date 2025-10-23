/**
 * React Hook for @ldesign/upload
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Uploader } from '../../core/Uploader'
import type { UploaderOptions, FileItem } from '../../types'

export interface UseUploaderOptions extends UploaderOptions {
  container: React.RefObject<HTMLElement> | HTMLElement | string
}

export function useUploader(options: UseUploaderOptions) {
  const uploaderRef = useRef<Uploader>()
  const [files, setFiles] = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    uploading: 0,
    success: 0,
    error: 0,
    paused: 0,
    totalSize: 0,
    uploadedSize: 0,
  })

  const updateFiles = useCallback(() => {
    if (uploaderRef.current) {
      setFiles(uploaderRef.current.getFiles())
      setStats(uploaderRef.current.getStats())
    }
  }, [])

  useEffect(() => {
    let container: HTMLElement | string

    if ('current' in options.container) {
      if (!options.container.current) return
      container = options.container.current
    } else {
      container = options.container as HTMLElement | string
    }

    uploaderRef.current = new Uploader({
      ...options,
      container,
      onFileAdded: (file) => {
        updateFiles()
        options.onFileAdded?.(file)
      },
      onFileRemoved: (fileId) => {
        updateFiles()
        options.onFileRemoved?.(fileId)
      },
      onUploadStart: (fileId) => {
        setUploading(true)
        updateFiles()
        options.onUploadStart?.(fileId)
      },
      onUploadProgress: (event) => {
        updateFiles()
        options.onUploadProgress?.(event)
      },
      onUploadSuccess: (fileId, response) => {
        updateFiles()
        options.onUploadSuccess?.(fileId, response)
      },
      onUploadError: (fileId, error) => {
        updateFiles()
        options.onUploadError?.(fileId, error)
      },
      onUploadComplete: () => {
        setUploading(false)
        updateFiles()
        options.onUploadComplete?.()
      },
    })

    return () => {
      uploaderRef.current?.destroy()
    }
  }, [])

  const addFile = useCallback(async (file: File) => {
    await uploaderRef.current?.addFile(file)
    updateFiles()
  }, [updateFiles])

  const addFiles = useCallback(async (fileList: File[]) => {
    await uploaderRef.current?.addFiles(fileList)
    updateFiles()
  }, [updateFiles])

  const removeFile = useCallback((fileId: string) => {
    uploaderRef.current?.removeFile(fileId)
    updateFiles()
  }, [updateFiles])

  const uploadFile = useCallback(async (fileId: string) => {
    await uploaderRef.current?.uploadFile(fileId)
    updateFiles()
  }, [updateFiles])

  const uploadAll = useCallback(() => {
    uploaderRef.current?.uploadAll()
  }, [])

  const pause = useCallback((fileId: string) => {
    uploaderRef.current?.pause(fileId)
    updateFiles()
  }, [updateFiles])

  const resume = useCallback((fileId: string) => {
    uploaderRef.current?.resume(fileId)
  }, [])

  const cancel = useCallback((fileId: string) => {
    uploaderRef.current?.cancel(fileId)
    updateFiles()
  }, [updateFiles])

  const retry = useCallback((fileId: string) => {
    uploaderRef.current?.retry(fileId)
  }, [])

  const clear = useCallback(() => {
    uploaderRef.current?.clear()
    updateFiles()
  }, [updateFiles])

  const openFilePicker = useCallback(() => {
    uploaderRef.current?.openFilePicker()
  }, [])

  return {
    uploader: uploaderRef.current,
    files,
    uploading,
    stats,
    addFile,
    addFiles,
    removeFile,
    uploadFile,
    uploadAll,
    pause,
    resume,
    cancel,
    retry,
    clear,
    openFilePicker,
  }
}

