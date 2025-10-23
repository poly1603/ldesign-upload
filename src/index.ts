/**
 * @ldesign/upload - File Upload Library
 * 
 * A powerful, framework-agnostic file upload library with support for:
 * - Drag & drop, paste, click to upload
 * - Chunked uploads with resume capability
 * - Image processing (compress, crop, rotate, filters)
 * - Video thumbnail extraction
 * - Progress tracking and speed calculation
 * - File validation
 * - Cloud storage adapters
 * - Beautiful UI components
 * 
 * @example Basic Usage
 * ```typescript
 * import { Uploader } from '@ldesign/upload'
 * import '@ldesign/upload/style.css'
 * 
 * const uploader = new Uploader({
 *   container: '#uploader',
 *   endpoint: '/api/upload',
 *   autoUpload: true,
 *   validation: {
 *     accept: 'image/*',
 *     maxSize: 10 * 1024 * 1024, // 10MB
 *     maxFiles: 5
 *   }
 * })
 * ```
 * 
 * @example With Custom Adapter
 * ```typescript
 * import { Uploader, HTTPAdapter } from '@ldesign/upload'
 * 
 * const adapter = new HTTPAdapter({
 *   endpoint: 'https://your-api.com/upload',
 *   headers: {
 *     'Authorization': 'Bearer token'
 *   }
 * })
 * 
 * const uploader = new Uploader({
 *   adapter,
 *   chunked: true,
 *   chunkSize: 5 * 1024 * 1024 // 5MB
 * })
 * ```
 * 
 * @example With Image Processing
 * ```typescript
 * import { Uploader } from '@ldesign/upload'
 * 
 * const uploader = new Uploader({
 *   container: '#uploader',
 *   endpoint: '/api/upload',
 *   imageProcess: {
 *     compress: true,
 *     quality: 0.8,
 *     maxWidth: 1920,
 *     maxHeight: 1080
 *   }
 * })
 * ```
 */

// Core
export { Uploader } from './core/Uploader'

// UI Components
export { Dashboard, FileItemUI, DropZone } from './ui'
export type {
  UploaderOptions,
  FileItem,
  FileStatus,
  UploadOptions,
  ChunkUploadOptions,
  ValidationRules,
  ImageProcessOptions,
  VideoProcessOptions,
  StorageAdapter,
  UploadResult,
  ProgressEvent,
  LocaleMessages,
} from './types'

// Managers
export {
  FileManager,
  ChunkManager,
  ValidationManager,
  ProgressTracker,
  InteractionManager,
  BatchProcessor,
  ErrorHandler,
  UploadError,
  UploadHistory,
} from './core'

// Processors
export { ImageProcessor, VideoProcessor } from './processors'

// Adapters
export { BaseStorageAdapter, HTTPAdapter } from './adapters'

// Utilities
export {
  formatFileSize,
  formatSpeed,
  formatTimeRemaining,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isDocumentFile,
} from './utils/file'

export { ValidationError } from './utils/validation'

// Constants
export { DEFAULTS, CSS_CLASSES, ERRORS, MIME_TYPES, DEFAULT_LOCALE } from './config/constants'

// Default export
export default Uploader
