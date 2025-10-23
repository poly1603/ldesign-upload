/**
 * Vue 3 Adapter for @ldesign/upload
 */

import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  h,
  type PropType,
} from 'vue'
import { Uploader } from '../../core/Uploader'
import type { UploaderOptions, FileItem, ProgressEvent } from '../../types'

// Export composable and directive
export { useUploader } from './useUploader'
export { vUploader, uploaderDirective, getUploaderInstance } from './directive'

export const VueUploader = defineComponent({
  name: 'VueUploader',
  props: {
    // Upload settings
    endpoint: String,
    method: {
      type: String as PropType<'POST' | 'PUT'>,
      default: 'POST',
    },
    headers: Object as PropType<Record<string, string>>,
    withCredentials: Boolean,

    // Validation
    accept: String,
    maxSize: Number,
    minSize: Number,
    maxFiles: Number,
    maxWidth: Number,
    maxHeight: Number,

    // Chunk settings
    chunked: {
      type: Boolean,
      default: true,
    },
    chunkSize: {
      type: Number,
      default: 5 * 1024 * 1024,
    },
    concurrent: {
      type: Number,
      default: 3,
    },
    retries: {
      type: Number,
      default: 3,
    },

    // Behavior
    autoUpload: {
      type: Boolean,
      default: false,
    },

    // UI
    showDashboard: {
      type: Boolean,
      default: true,
    },
    mode: {
      type: String as PropType<'compact' | 'inline' | 'modal'>,
      default: 'inline',
    },
    theme: {
      type: String as PropType<'light' | 'dark' | 'auto'>,
      default: 'light',
    },

    // Interactions
    dragDrop: {
      type: Boolean,
      default: true,
    },
    paste: Boolean,

    // Image processing
    imageCompress: Boolean,
    imageQuality: {
      type: Number,
      default: 0.8,
    },
    imageMaxWidth: Number,
    imageMaxHeight: Number,

    // Placeholder
    placeholderText: String,
    placeholderSubtext: String,
  },
  emits: [
    'ready',
    'file-added',
    'file-removed',
    'upload-start',
    'upload-progress',
    'upload-success',
    'upload-error',
    'upload-complete',
    'validation-error',
  ],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLDivElement>()
    const uploaderInstance = ref<Uploader>()

    const initUploader = () => {
      if (!containerRef.value) return

      const options: UploaderOptions = {
        container: containerRef.value,
        endpoint: props.endpoint,
        method: props.method,
        headers: props.headers,
        withCredentials: props.withCredentials,

        validation: {
          accept: props.accept,
          maxSize: props.maxSize,
          minSize: props.minSize,
          maxFiles: props.maxFiles,
          maxWidth: props.maxWidth,
          maxHeight: props.maxHeight,
        },

        chunked: props.chunked,
        chunkSize: props.chunkSize,
        concurrent: props.concurrent,
        retries: props.retries,

        autoUpload: props.autoUpload,

        showDashboard: props.showDashboard,
        mode: props.mode,
        theme: props.theme,

        dragDrop: props.dragDrop,
        paste: props.paste,

        imageProcess: props.imageCompress ? {
          compress: true,
          quality: props.imageQuality,
          maxWidth: props.imageMaxWidth,
          maxHeight: props.imageMaxHeight,
        } : undefined,

        placeholder: {
          text: props.placeholderText,
          subtext: props.placeholderSubtext,
        },

        onFileAdded: (file) => emit('file-added', file),
        onFileRemoved: (fileId) => emit('file-removed', fileId),
        onUploadStart: (fileId) => emit('upload-start', fileId),
        onUploadProgress: (event) => emit('upload-progress', event),
        onUploadSuccess: (fileId, response) => emit('upload-success', fileId, response),
        onUploadError: (fileId, error) => emit('upload-error', fileId, error),
        onUploadComplete: () => emit('upload-complete'),
        onValidationError: (file, error) => emit('validation-error', file, error),
      }

      uploaderInstance.value = new Uploader(options)
      emit('ready', uploaderInstance.value)
    }

    onMounted(() => {
      initUploader()
    })

    onBeforeUnmount(() => {
      if (uploaderInstance.value) {
        uploaderInstance.value.destroy()
      }
    })

    // Watch endpoint changes
    watch(() => props.endpoint, () => {
      if (uploaderInstance.value) {
        uploaderInstance.value.destroy()
        initUploader()
      }
    })

    // Expose methods
    expose({
      getUploader: () => uploaderInstance.value,
      addFile: (file: File) => uploaderInstance.value?.addFile(file),
      addFiles: (files: File[]) => uploaderInstance.value?.addFiles(files),
      removeFile: (fileId: string) => uploaderInstance.value?.removeFile(fileId),
      uploadFile: (fileId: string) => uploaderInstance.value?.uploadFile(fileId),
      uploadAll: () => uploaderInstance.value?.uploadAll(),
      pause: (fileId: string) => uploaderInstance.value?.pause(fileId),
      resume: (fileId: string) => uploaderInstance.value?.resume(fileId),
      cancel: (fileId: string) => uploaderInstance.value?.cancel(fileId),
      retry: (fileId: string) => uploaderInstance.value?.retry(fileId),
      clear: () => uploaderInstance.value?.clear(),
      openFilePicker: () => uploaderInstance.value?.openFilePicker(),
      getFiles: () => uploaderInstance.value?.getFiles() || [],
      getFile: (fileId: string) => uploaderInstance.value?.getFile(fileId),
      getStats: () => uploaderInstance.value?.getStats(),
    })

    return () =>
      h('div', {
        ref: containerRef,
        class: 'vue-uploader-container',
      })
  },
})

export default VueUploader

