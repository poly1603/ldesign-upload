/**
 * @ldesign/upload - Constants
 */

/**
 * Default configuration values
 */
export const DEFAULTS = {
  // Upload
  CHUNK_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_CONCURRENT_UPLOADS: 3,
  MAX_RETRIES: 3,
  TIMEOUT: 30000, // 30 seconds

  // Validation
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILES: 10,
  MAX_TOTAL_SIZE: 500 * 1024 * 1024, // 500MB

  // Image
  IMAGE_MAX_WIDTH: 1920,
  IMAGE_MAX_HEIGHT: 1080,
  IMAGE_QUALITY: 0.8,
  THUMBNAIL_SIZE: 150,

  // Video
  VIDEO_THUMBNAIL_TIME: 1, // 1 second

  // UI
  MODE: 'inline' as const,
  THEME: 'light' as const,
  VIEW_MODE: 'list' as const,
} as const

/**
 * CSS class names
 */
export const CSS_CLASSES = {
  // Container
  CONTAINER: 'ldesign-uploader',
  CONTAINER_INLINE: 'ldesign-uploader--inline',
  CONTAINER_COMPACT: 'ldesign-uploader--compact',
  CONTAINER_MODAL: 'ldesign-uploader--modal',

  // Theme
  THEME_LIGHT: 'ldesign-uploader--light',
  THEME_DARK: 'ldesign-uploader--dark',

  // Dashboard
  DASHBOARD: 'ldesign-uploader__dashboard',
  DASHBOARD_HIDDEN: 'ldesign-uploader__dashboard--hidden',

  // Dropzone
  DROPZONE: 'ldesign-uploader__dropzone',
  DROPZONE_ACTIVE: 'ldesign-uploader__dropzone--active',
  DROPZONE_HOVER: 'ldesign-uploader__dropzone--hover',
  DROPZONE_DISABLED: 'ldesign-uploader__dropzone--disabled',

  // File list
  FILE_LIST: 'ldesign-uploader__file-list',
  FILE_LIST_GRID: 'ldesign-uploader__file-list--grid',
  FILE_LIST_EMPTY: 'ldesign-uploader__file-list--empty',

  // File item
  FILE_ITEM: 'ldesign-uploader__file-item',
  FILE_ITEM_PENDING: 'ldesign-uploader__file-item--pending',
  FILE_ITEM_UPLOADING: 'ldesign-uploader__file-item--uploading',
  FILE_ITEM_SUCCESS: 'ldesign-uploader__file-item--success',
  FILE_ITEM_ERROR: 'ldesign-uploader__file-item--error',
  FILE_ITEM_PAUSED: 'ldesign-uploader__file-item--paused',

  // File item parts
  FILE_THUMBNAIL: 'ldesign-uploader__file-thumbnail',
  FILE_INFO: 'ldesign-uploader__file-info',
  FILE_NAME: 'ldesign-uploader__file-name',
  FILE_SIZE: 'ldesign-uploader__file-size',
  FILE_STATUS: 'ldesign-uploader__file-status',
  FILE_PROGRESS: 'ldesign-uploader__file-progress',
  FILE_PROGRESS_BAR: 'ldesign-uploader__file-progress-bar',
  FILE_ACTIONS: 'ldesign-uploader__file-actions',

  // Toolbar
  TOOLBAR: 'ldesign-uploader__toolbar',
  TOOLBAR_ACTIONS: 'ldesign-uploader__toolbar-actions',
  TOOLBAR_FILTER: 'ldesign-uploader__toolbar-filter',
  TOOLBAR_STATS: 'ldesign-uploader__toolbar-stats',

  // Button
  BUTTON: 'ldesign-uploader__button',
  BUTTON_PRIMARY: 'ldesign-uploader__button--primary',
  BUTTON_SECONDARY: 'ldesign-uploader__button--secondary',
  BUTTON_DANGER: 'ldesign-uploader__button--danger',
  BUTTON_ICON: 'ldesign-uploader__button--icon',

  // Icon
  ICON: 'ldesign-uploader__icon',

  // Modal
  MODAL: 'ldesign-uploader__modal',
  MODAL_OVERLAY: 'ldesign-uploader__modal-overlay',
  MODAL_CONTENT: 'ldesign-uploader__modal-content',
  MODAL_CLOSE: 'ldesign-uploader__modal-close',
} as const

/**
 * Event names
 */
export const EVENTS = {
  FILE_ADDED: 'fileAdded',
  FILE_REMOVED: 'fileRemoved',
  UPLOAD_START: 'uploadStart',
  UPLOAD_PROGRESS: 'uploadProgress',
  UPLOAD_SUCCESS: 'uploadSuccess',
  UPLOAD_ERROR: 'uploadError',
  UPLOAD_COMPLETE: 'uploadComplete',
  VALIDATION_ERROR: 'validationError',
  CHUNK_PROGRESS: 'chunkProgress',
  PAUSE: 'pause',
  RESUME: 'resume',
  CANCEL: 'cancel',
} as const

/**
 * Error messages
 */
export const ERRORS = {
  NO_CONTAINER: 'Container element not found',
  NO_ENDPOINT: 'Upload endpoint is required',
  NO_ADAPTER: 'Storage adapter is required',
  INVALID_FILE: 'Invalid file',
  FILE_TOO_LARGE: 'File size exceeds maximum',
  FILE_TOO_SMALL: 'File size is below minimum',
  INVALID_TYPE: 'File type is not allowed',
  TOO_MANY_FILES: 'Maximum number of files exceeded',
  INVALID_DIMENSIONS: 'Image dimensions are invalid',
  UPLOAD_FAILED: 'Upload failed',
  CHUNK_FAILED: 'Chunk upload failed',
  NETWORK_ERROR: 'Network error',
  TIMEOUT: 'Upload timeout',
  CANCELLED: 'Upload cancelled',
} as const

/**
 * MIME type categories
 */
export const MIME_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  AUDIO: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
} as const

/**
 * Default locale messages (English)
 */
export const DEFAULT_LOCALE = {
  dropzone: {
    title: 'Click or drag files here',
    subtitle: 'Upload files or folders',
    clickToUpload: 'Click to upload',
  },
  file: {
    pending: 'Waiting',
    uploading: 'Uploading...',
    success: 'Uploaded',
    error: 'Failed',
    paused: 'Paused',
  },
  actions: {
    upload: 'Upload',
    pause: 'Pause',
    resume: 'Resume',
    retry: 'Retry',
    cancel: 'Cancel',
    remove: 'Remove',
    preview: 'Preview',
    clear: 'Clear',
  },
  validation: {
    invalidType: 'File type is not allowed',
    tooLarge: 'File is too large',
    tooSmall: 'File is too small',
    tooMany: 'Too many files',
    invalidDimensions: 'Image dimensions are invalid',
  },
  toolbar: {
    uploadAll: 'Upload All',
    cancelAll: 'Cancel All',
    clearAll: 'Clear',
    filter: 'Filter',
    stats: '{uploaded} / {total} files',
  },
} as const

/**
 * Storage keys for persistence
 */
export const STORAGE_KEYS = {
  UPLOAD_PROGRESS: 'ldesign-upload-progress',
  UPLOAD_HISTORY: 'ldesign-upload-history',
  SETTINGS: 'ldesign-upload-settings',
} as const

/**
 * Animation durations (ms)
 */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

