/**
 * @ldesign/upload - Type Definitions
 */

// File status enum
export type FileStatus = 'pending' | 'uploading' | 'success' | 'error' | 'paused' | 'cancelled'

// Upload modes
export type UploadMode = 'compact' | 'inline' | 'modal'

// Theme options
export type Theme = 'light' | 'dark' | 'auto'

// View modes
export type ViewMode = 'list' | 'grid'

// File filter
export type FileFilter = 'all' | 'success' | 'error' | 'uploading' | 'pending'

/**
 * File item data structure
 */
export interface FileItem {
  id: string
  file: File
  status: FileStatus
  progress: number
  speed: number // bytes per second
  timeRemaining: number // seconds
  uploadedSize: number
  totalSize: number
  error?: string
  thumbnail?: string
  chunks?: ChunkInfo[]
  metadata?: Record<string, any>
  priority?: number
}

/**
 * Chunk information
 */
export interface ChunkInfo {
  index: number
  start: number
  end: number
  uploaded: boolean
  retries: number
}

/**
 * Validation rules
 */
export interface ValidationRules {
  accept?: string | string[] // MIME types or extensions
  maxSize?: number // bytes
  minSize?: number
  maxFiles?: number
  maxTotalSize?: number
  minWidth?: number // for images
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  validator?: (file: File) => Promise<boolean> | boolean
}

/**
 * Upload options
 */
export interface UploadOptions {
  endpoint?: string
  method?: 'POST' | 'PUT'
  headers?: Record<string, string>
  withCredentials?: boolean
  timeout?: number
  metadata?: Record<string, any>
  onProgress?: (progress: number) => void
  onSuccess?: (response: any) => void
  onError?: (error: Error) => void
}

/**
 * Chunk upload options
 */
export interface ChunkUploadOptions extends UploadOptions {
  chunkSize?: number // bytes, default 5MB
  concurrent?: number // max concurrent uploads
  retries?: number // max retries per chunk
  testChunks?: boolean // test if chunk already exists
  checksum?: boolean // calculate MD5/SHA256
}

/**
 * Image processing options
 */
export interface ImageProcessOptions {
  compress?: boolean
  quality?: number // 0-1
  maxWidth?: number
  maxHeight?: number
  format?: 'jpeg' | 'png' | 'webp'
  crop?: boolean
  rotate?: number // degrees
  flipHorizontal?: boolean
  flipVertical?: boolean
  filters?: ImageFilter[]
}

/**
 * Image filter
 */
export interface ImageFilter {
  type: 'grayscale' | 'blur' | 'brightness' | 'contrast' | 'sepia' | 'custom'
  value?: number
  customFilter?: (canvas: HTMLCanvasElement) => void
}

/**
 * Video processing options
 */
export interface VideoProcessOptions {
  thumbnail?: boolean
  thumbnailTime?: number // seconds
  compress?: boolean
  maxWidth?: number
  maxHeight?: number
  bitrate?: number
}

/**
 * Storage adapter interface
 */
export interface StorageAdapter {
  name: string
  upload(file: File, options: UploadOptions): Promise<UploadResult>
  uploadChunk?(chunk: Blob, index: number, total: number, fileId: string): Promise<void>
  mergeChunks?(fileId: string, totalChunks: number): Promise<UploadResult>
  getSignedUrl?(file: File): Promise<string>
  abortUpload?(uploadId: string): void
  testChunk?(fileId: string, chunkIndex: number): Promise<boolean>
}

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean
  url?: string
  data?: any
  error?: string
}

/**
 * Progress event
 */
export interface ProgressEvent {
  fileId: string
  progress: number // 0-100
  speed: number // bytes/s
  timeRemaining: number // seconds
  uploadedSize: number
  totalSize: number
}

/**
 * Uploader configuration
 */
export interface UploaderOptions {
  // Container
  container?: string | HTMLElement

  // Upload settings
  endpoint?: string
  adapter?: StorageAdapter
  method?: 'POST' | 'PUT'
  headers?: Record<string, string>
  withCredentials?: boolean
  timeout?: number

  // File validation
  validation?: ValidationRules

  // Chunk settings
  chunked?: boolean
  chunkSize?: number // default 5MB
  concurrent?: number // default 3
  retries?: number // default 3

  // Auto upload
  autoUpload?: boolean

  // UI settings
  showDashboard?: boolean
  mode?: UploadMode
  theme?: Theme
  viewMode?: ViewMode

  // Interactions
  dragDrop?: boolean
  paste?: boolean
  clickToUpload?: boolean

  // Image processing
  imageProcess?: ImageProcessOptions

  // Video processing
  videoProcess?: VideoProcessOptions

  // Placeholder
  placeholder?: {
    text?: string
    subtext?: string
    icon?: string
  }

  // Locale
  locale?: Partial<LocaleMessages>

  // Event handlers
  onFileAdded?: (file: FileItem) => void
  onFileRemoved?: (fileId: string) => void
  onUploadStart?: (fileId: string) => void
  onUploadProgress?: (event: ProgressEvent) => void
  onUploadSuccess?: (fileId: string, response: any) => void
  onUploadError?: (fileId: string, error: Error) => void
  onUploadComplete?: () => void
  onValidationError?: (file: File, error: string) => void
}

/**
 * Locale messages
 */
export interface LocaleMessages {
  dropzone: {
    title: string
    subtitle: string
    clickToUpload: string
  }
  file: {
    pending: string
    uploading: string
    success: string
    error: string
    paused: string
  }
  actions: {
    upload: string
    pause: string
    resume: string
    retry: string
    cancel: string
    remove: string
    preview: string
    clear: string
  }
  validation: {
    invalidType: string
    tooLarge: string
    tooSmall: string
    tooMany: string
    invalidDimensions: string
  }
  toolbar: {
    uploadAll: string
    cancelAll: string
    clearAll: string
    filter: string
    stats: string
  }
}

/**
 * Event types
 */
export type UploaderEventType =
  | 'fileAdded'
  | 'fileRemoved'
  | 'uploadStart'
  | 'uploadProgress'
  | 'uploadSuccess'
  | 'uploadError'
  | 'uploadComplete'
  | 'validationError'
  | 'chunkProgress'
  | 'pause'
  | 'resume'
  | 'cancel'

/**
 * Event handler
 */
export type EventHandler<T = any> = (data: T) => void

/**
 * Event emitter interface
 */
export interface EventEmitter {
  on(event: UploaderEventType, handler: EventHandler): void
  off(event: UploaderEventType, handler: EventHandler): void
  emit(event: UploaderEventType, data?: any): void
}

