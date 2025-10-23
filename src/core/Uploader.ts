/**
 * Uploader - Main uploader class
 * 
 * This is the core class that orchestrates all upload functionality.
 * It integrates FileManager, ChunkManager, ValidationManager, ProgressTracker,
 * InteractionManager, and UI components.
 */

import type {
  UploaderOptions,
  FileItem,
  UploadOptions,
  StorageAdapter,
  LocaleMessages,
} from '../types'
import { FileManager } from './FileManager'
import { ChunkManager } from './ChunkManager'
import { ValidationManager } from './ValidationManager'
import { ProgressTracker } from './ProgressTracker'
import { InteractionManager } from './InteractionManager'
import { SimpleEventEmitter } from '../utils/events'
import { getElement, createElement, addClass, removeClass } from '../utils/dom'
import { createThumbnail } from '../utils/image'
import { isImageFile } from '../utils/file'
import { DEFAULTS, CSS_CLASSES, ERRORS, DEFAULT_LOCALE } from '../config/constants'
import { Dashboard } from '../ui/Dashboard'

export class Uploader extends SimpleEventEmitter {
  // Core managers
  private fileManager: FileManager
  private chunkManager: ChunkManager
  private validationManager: ValidationManager
  private progressTracker: ProgressTracker
  private interactionManager: InteractionManager | null = null

  // Configuration
  private options: Required<UploaderOptions>
  private locale: LocaleMessages

  // UI elements
  private container: HTMLElement | null = null
  private dashboard: Dashboard | null = null

  // State
  private initialized: boolean = false
  private destroyed: boolean = false
  private uploading: boolean = false

  // Storage adapter
  private adapter: StorageAdapter | null = null

  constructor(options: UploaderOptions = {}) {
    super()

    // Merge options with defaults
    this.options = this.mergeOptions(options)
    this.locale = { ...DEFAULT_LOCALE, ...options.locale }

    // Initialize managers
    this.fileManager = new FileManager(this.options.concurrent)
    this.chunkManager = new ChunkManager({
      chunkSize: this.options.chunkSize,
      concurrent: this.options.concurrent,
      retries: this.options.retries,
    })
    this.validationManager = new ValidationManager(this.options.validation)
    this.progressTracker = new ProgressTracker()

    // Set adapter
    if (this.options.adapter) {
      this.adapter = this.options.adapter
    }

    // Setup event forwarding
    this.setupEventForwarding()

    // Initialize if container is provided
    if (this.options.container) {
      this.init(this.options.container)
    }
  }

  /**
   * Merge options with defaults
   */
  private mergeOptions(options: UploaderOptions): Required<UploaderOptions> {
    return {
      container: options.container,
      endpoint: options.endpoint || '',
      adapter: options.adapter || null,
      method: options.method || 'POST',
      headers: options.headers || {},
      withCredentials: options.withCredentials || false,
      timeout: options.timeout || DEFAULTS.TIMEOUT,
      validation: options.validation || {},
      chunked: options.chunked !== false,
      chunkSize: options.chunkSize || DEFAULTS.CHUNK_SIZE,
      concurrent: options.concurrent || DEFAULTS.MAX_CONCURRENT_UPLOADS,
      retries: options.retries || DEFAULTS.MAX_RETRIES,
      autoUpload: options.autoUpload === true,
      showDashboard: options.showDashboard !== false,
      mode: options.mode || DEFAULTS.MODE,
      theme: options.theme || DEFAULTS.THEME,
      viewMode: options.viewMode || DEFAULTS.VIEW_MODE,
      dragDrop: options.dragDrop !== false,
      paste: options.paste === true,
      clickToUpload: options.clickToUpload !== false,
      imageProcess: options.imageProcess || {},
      videoProcess: options.videoProcess || {},
      placeholder: {
        text: options.placeholder?.text || this.locale.dropzone.title,
        subtext: options.placeholder?.subtext || this.locale.dropzone.subtitle,
        icon: options.placeholder?.icon,
      },
      locale: options.locale || {},
      onFileAdded: options.onFileAdded,
      onFileRemoved: options.onFileRemoved,
      onUploadStart: options.onUploadStart,
      onUploadProgress: options.onUploadProgress,
      onUploadSuccess: options.onUploadSuccess,
      onUploadError: options.onUploadError,
      onUploadComplete: options.onUploadComplete,
      onValidationError: options.onValidationError,
    } as Required<UploaderOptions>
  }

  /**
   * Initialize uploader
   */
  init(containerSelector: string | HTMLElement): void {
    if (this.initialized) {
      return
    }

    // Get container element
    const element = getElement(containerSelector)
    if (!element) {
      throw new Error(ERRORS.NO_CONTAINER)
    }

    this.container = element
    addClass(this.container, CSS_CLASSES.CONTAINER)
    addClass(this.container, `${CSS_CLASSES.CONTAINER}--${this.options.mode}`)
    addClass(this.container, `${CSS_CLASSES.CONTAINER}--${this.options.theme}`)

    // Initialize interaction manager
    this.interactionManager = new InteractionManager(this.container)
    this.interactionManager.init({
      accept: this.getAcceptString(),
      multiple: !this.options.validation.maxFiles || this.options.validation.maxFiles > 1,
      dragDrop: this.options.dragDrop,
      paste: this.options.paste,
    })

    // Setup interaction events
    this.setupInteractionEvents()

    // Create UI if enabled
    if (this.options.showDashboard) {
      this.createDashboard()
    }

    this.initialized = true
    this.emit('ready', this)
  }

  /**
   * Get accept string for file input
   */
  private getAcceptString(): string {
    const accept = this.options.validation.accept
    if (!accept) {
      return '*'
    }
    return Array.isArray(accept) ? accept.join(',') : accept
  }

  /**
   * Setup event forwarding from managers
   */
  private setupEventForwarding(): void {
    // File manager events
    this.fileManager.on('fileAdded', (file) => {
      this.emit('fileAdded', file)
      if (this.options.onFileAdded) {
        this.options.onFileAdded(file)
      }

      // Generate thumbnail for images
      if (isImageFile(file.file)) {
        this.generateThumbnail(file.id)
      }

      // Auto upload if enabled
      if (this.options.autoUpload) {
        this.uploadFile(file.id)
      }
    })

    this.fileManager.on('fileRemoved', (fileId) => {
      this.emit('fileRemoved', fileId)
      if (this.options.onFileRemoved) {
        this.options.onFileRemoved(fileId)
      }
    })

    // Progress tracker events
    this.progressTracker.on('uploadProgress', (event) => {
      // Update file manager
      const file = this.fileManager.getFile(event.fileId)
      if (file) {
        this.fileManager.updateFileProgress(
          event.fileId,
          event.progress,
          event.uploadedSize,
          event.speed,
          event.timeRemaining
        )
      }

      this.emit('uploadProgress', event)
      if (this.options.onUploadProgress) {
        this.options.onUploadProgress(event)
      }
    })

    // Validation manager events
    this.validationManager.on('validationError', ({ file, error }) => {
      this.emit('validationError', { file, error })
      if (this.options.onValidationError) {
        this.options.onValidationError(file, error)
      }
    })
  }

  /**
   * Setup interaction events
   */
  private setupInteractionEvents(): void {
    if (!this.interactionManager) {
      return
    }

    this.interactionManager.on('filesSelected', (files: File[]) => {
      this.addFiles(files)
    })

    this.interactionManager.on('dragEnter', () => {
      if (this.dashboard) {
        this.dashboard.setDropZoneHover(true)
      }
    })

    this.interactionManager.on('dragLeave', () => {
      if (this.dashboard) {
        this.dashboard.setDropZoneHover(false)
      }
    })

    this.interactionManager.on('drop', () => {
      if (this.dashboard) {
        this.dashboard.setDropZoneHover(false)
      }
    })
  }

  /**
   * Create dashboard UI
   */
  private createDashboard(): void {
    this.dashboard = new Dashboard(this.container!, this.options, (action, fileId) => {
      this.handleFileAction(action, fileId)
    })

    // Listen to file manager events to update UI
    this.fileManager.on('fileAdded', (file) => {
      this.dashboard?.addFileItem(file)
    })

    this.fileManager.on('fileRemoved', (fileId) => {
      this.dashboard?.removeFileItem(fileId)
    })

    this.fileManager.on('statusChange', ({ fileId }) => {
      const file = this.fileManager.getFile(fileId)
      if (file) {
        this.dashboard?.updateFileItem(file)
      }
    })
  }

  /**
   * Handle file action from UI
   */
  private handleFileAction(action: string, fileId: string): void {
    switch (action) {
      case 'retry':
        this.retry(fileId)
        break
      case 'pause':
        this.pause(fileId)
        break
      case 'resume':
        this.resume(fileId)
        break
      case 'cancel':
        this.cancel(fileId)
        break
      case 'remove':
        this.removeFile(fileId)
        break
    }
  }

  /**
   * Add files to upload queue
   */
  async addFiles(files: File[]): Promise<void> {
    // Validate files
    const existingCount = this.fileManager.getFileCount()
    const { valid, invalid } = await this.validationManager.validateMultiple(files, existingCount)

    // Add valid files to queue
    valid.forEach(file => {
      this.fileManager.addFile(file)
    })
  }

  /**
   * Add single file
   */
  async addFile(file: File): Promise<FileItem | null> {
    const { valid } = await this.validationManager.validateSingle(file)

    if (valid) {
      return this.fileManager.addFile(file)
    }

    return null
  }

  /**
   * Remove file
   */
  removeFile(fileId: string): boolean {
    return this.fileManager.removeFile(fileId)
  }

  /**
   * Upload file by ID
   */
  async uploadFile(fileId: string): Promise<void> {
    const fileItem = this.fileManager.getFile(fileId)
    if (!fileItem) {
      return
    }

    // Check if already uploading or completed
    if (fileItem.status === 'uploading' || fileItem.status === 'success') {
      return
    }

    // Update status
    this.fileManager.updateFileStatus(fileId, 'uploading')
    this.emit('uploadStart', fileId)
    if (this.options.onUploadStart) {
      this.options.onUploadStart(fileId)
    }

    try {
      // Check if chunking is needed
      if (this.options.chunked && this.chunkManager.needsChunking(fileItem.file)) {
        await this.uploadFileChunked(fileItem)
      } else {
        await this.uploadFileSimple(fileItem)
      }

      // Mark as success
      this.fileManager.updateFileStatus(fileId, 'success')
      this.emit('uploadSuccess', fileId, {})
      if (this.options.onUploadSuccess) {
        this.options.onUploadSuccess(fileId, {})
      }
    } catch (error) {
      // Mark as error
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      this.fileManager.setFileError(fileId, errorMessage)
      this.emit('uploadError', fileId, error)
      if (this.options.onUploadError) {
        this.options.onUploadError(fileId, error as Error)
      }
    }

    // Try to start next upload
    this.startNextUpload()
  }

  /**
   * Upload file using simple upload
   */
  private async uploadFileSimple(fileItem: FileItem): Promise<void> {
    // This is a placeholder - actual implementation would use the adapter or endpoint
    const formData = new FormData()
    formData.append('file', fileItem.file)

    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          this.progressTracker.updateProgress(fileItem.id, e.loaded, e.total)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'))
      })

      xhr.open(this.options.method, this.options.endpoint || '/upload')

      // Set headers
      Object.entries(this.options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      if (this.options.withCredentials) {
        xhr.withCredentials = true
      }

      xhr.timeout = this.options.timeout

      xhr.send(formData)
    })
  }

  /**
   * Upload file using chunked upload
   */
  private async uploadFileChunked(fileItem: FileItem): Promise<void> {
    // Initialize chunk upload
    const progress = this.chunkManager.initChunkUpload(fileItem.id, fileItem.file)

    // Get chunks to upload
    const chunks = this.chunkManager.splitFile(fileItem.file)
    const pendingChunks = this.chunkManager.getPendingChunks(fileItem.id)

    // Upload chunks
    for (const chunkIndex of pendingChunks) {
      const chunk = chunks[chunkIndex]
      await this.uploadChunk(fileItem.id, chunk, chunkIndex, chunks.length)
      this.chunkManager.markChunkUploaded(fileItem.id, chunkIndex)

      // Update progress
      const uploadedSize = this.chunkManager.getUploadedSize(fileItem.id)
      this.progressTracker.updateProgress(fileItem.id, uploadedSize, fileItem.totalSize)
    }
  }

  /**
   * Upload single chunk
   */
  private async uploadChunk(fileId: string, chunk: Blob, index: number, total: number): Promise<void> {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('index', String(index))
    formData.append('total', String(total))
    formData.append('fileId', fileId)

    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Chunk upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'))
      })

      xhr.open('POST', this.options.endpoint || '/upload/chunk')

      // Set headers
      Object.entries(this.options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      if (this.options.withCredentials) {
        xhr.withCredentials = true
      }

      xhr.timeout = this.options.timeout

      xhr.send(formData)
    })
  }

  /**
   * Start next pending upload
   */
  private startNextUpload(): void {
    if (!this.fileManager.canStartUpload()) {
      return
    }

    const nextFile = this.fileManager.getNextFileToUpload()
    if (nextFile) {
      this.uploadFile(nextFile.id)
    } else {
      // All files uploaded
      if (this.fileManager.getUploadingCount() === 0) {
        this.emit('uploadComplete')
        if (this.options.onUploadComplete) {
          this.options.onUploadComplete()
        }
      }
    }
  }

  /**
   * Upload all pending files
   */
  uploadAll(): void {
    const pendingFiles = this.fileManager.getFilesByStatus('pending')
    pendingFiles.forEach(file => this.uploadFile(file.id))
  }

  /**
   * Pause upload
   */
  pause(fileId: string): void {
    this.fileManager.updateFileStatus(fileId, 'paused')
    this.emit('pause', fileId)
  }

  /**
   * Resume upload
   */
  resume(fileId: string): void {
    this.uploadFile(fileId)
    this.emit('resume', fileId)
  }

  /**
   * Cancel upload
   */
  cancel(fileId: string): void {
    this.fileManager.updateFileStatus(fileId, 'cancelled')
    this.emit('cancel', fileId)
  }

  /**
   * Retry failed upload
   */
  retry(fileId: string): void {
    const file = this.fileManager.getFile(fileId)
    if (file && file.status === 'error') {
      file.error = undefined
      this.uploadFile(fileId)
    }
  }

  /**
   * Generate thumbnail for file
   */
  private async generateThumbnail(fileId: string): Promise<void> {
    const file = this.fileManager.getFile(fileId)
    if (!file || !isImageFile(file.file)) {
      return
    }

    try {
      const thumbnail = await createThumbnail(file.file)
      this.fileManager.setFileThumbnail(fileId, thumbnail)
    } catch (error) {
      console.error('Failed to generate thumbnail:', error)
    }
  }

  /**
   * Get all files
   */
  getFiles(): FileItem[] {
    return this.fileManager.getAllFiles()
  }

  /**
   * Get file by ID
   */
  getFile(fileId: string): FileItem | undefined {
    return this.fileManager.getFile(fileId)
  }

  /**
   * Get upload statistics
   */
  getStats() {
    return this.fileManager.getStats()
  }

  /**
   * Clear all files
   */
  clear(): void {
    this.fileManager.clear()
  }

  /**
   * Open file picker
   */
  openFilePicker(): void {
    if (this.interactionManager) {
      this.interactionManager.openFilePicker()
    }
  }

  /**
   * Enable uploader
   */
  enable(): void {
    if (this.interactionManager) {
      this.interactionManager.enable()
    }
  }

  /**
   * Disable uploader
   */
  disable(): void {
    if (this.interactionManager) {
      this.interactionManager.disable()
    }
  }

  /**
   * Destroy uploader
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    // Destroy interaction manager
    if (this.interactionManager) {
      this.interactionManager.destroy()
      this.interactionManager = null
    }

    // Clear managers
    this.fileManager.clear()
    this.chunkManager.clearAllProgress()
    this.progressTracker.clear()

    // Remove UI
    if (this.dashboard) {
      this.dashboard.destroy()
      this.dashboard = null
    }

    // Clear container
    if (this.container) {
      this.container.innerHTML = ''
      this.container = null
    }

    // Remove all event listeners
    this.removeAllListeners()

    this.destroyed = true
    this.initialized = false
  }
}

