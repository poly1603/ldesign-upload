/**
 * Vue 3 Composable for @ldesign/upload
 */

import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'
import { Uploader } from '../../core/Uploader'
import type { UploaderOptions, FileItem } from '../../types'

export interface UseUploaderOptions extends UploaderOptions {
  container: Ref<HTMLElement | undefined> | HTMLElement | string
}

export function useUploader(options: UseUploaderOptions) {
  const uploader = ref<Uploader>()
  const files = ref<FileItem[]>([])
  const uploading = ref(false)
  const stats = ref({
    total: 0,
    pending: 0,
    uploading: 0,
    success: 0,
    error: 0,
    paused: 0,
    totalSize: 0,
    uploadedSize: 0,
  })

  const init = () => {
    let container: HTMLElement | string

    if ('value' in options.container) {
      if (!options.container.value) return
      container = options.container.value
    } else {
      container = options.container as HTMLElement | string
    }

    uploader.value = new Uploader({
      ...options,
      container,
      onFileAdded: (file) => {
        updateFiles()
        options.onFileAdded?.(file)
      },
      onFileRemoved: () => {
        updateFiles()
        options.onFileRemoved?.(arguments[0])
      },
      onUploadStart: (fileId) => {
        uploading.value = true
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
        uploading.value = false
        updateFiles()
        options.onUploadComplete?.()
      },
    })
  }

  const updateFiles = () => {
    if (uploader.value) {
      files.value = uploader.value.getFiles()
      stats.value = uploader.value.getStats()
    }
  }

  const addFile = async (file: File) => {
    await uploader.value?.addFile(file)
    updateFiles()
  }

  const addFiles = async (fileList: File[]) => {
    await uploader.value?.addFiles(fileList)
    updateFiles()
  }

  const removeFile = (fileId: string) => {
    uploader.value?.removeFile(fileId)
    updateFiles()
  }

  const uploadFile = async (fileId: string) => {
    await uploader.value?.uploadFile(fileId)
    updateFiles()
  }

  const uploadAll = () => {
    uploader.value?.uploadAll()
  }

  const pause = (fileId: string) => {
    uploader.value?.pause(fileId)
    updateFiles()
  }

  const resume = (fileId: string) => {
    uploader.value?.resume(fileId)
  }

  const cancel = (fileId: string) => {
    uploader.value?.cancel(fileId)
    updateFiles()
  }

  const retry = (fileId: string) => {
    uploader.value?.retry(fileId)
  }

  const clear = () => {
    uploader.value?.clear()
    updateFiles()
  }

  const openFilePicker = () => {
    uploader.value?.openFilePicker()
  }

  onMounted(() => {
    init()
  })

  onBeforeUnmount(() => {
    uploader.value?.destroy()
  })

  return {
    uploader,
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

