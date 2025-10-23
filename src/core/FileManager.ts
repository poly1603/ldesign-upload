/**
 * File Manager - Manage file queue, status, and concurrent uploads
 */

import type { FileItem, FileStatus, FileFilter } from '../types'
import { SimpleEventEmitter } from '../utils/events'
import { generateFileId } from '../utils/file'
import { DEFAULTS } from '../config/constants'

export class FileManager extends SimpleEventEmitter {
  private files: Map<string, FileItem> = new Map()
  private uploadingCount: number = 0
  private maxConcurrent: number

  constructor(maxConcurrent: number = DEFAULTS.MAX_CONCURRENT_UPLOADS) {
    super()
    this.maxConcurrent = maxConcurrent
  }

  /**
   * Add file to queue
   */
  addFile(file: File, priority: number = 0): FileItem {
    const fileItem: FileItem = {
      id: generateFileId(file),
      file,
      status: 'pending',
      progress: 0,
      speed: 0,
      timeRemaining: 0,
      uploadedSize: 0,
      totalSize: file.size,
      priority,
      metadata: {},
    }

    this.files.set(fileItem.id, fileItem)
    this.emit('fileAdded', fileItem)

    return fileItem
  }

  /**
   * Add multiple files
   */
  addFiles(files: File[], priority: number = 0): FileItem[] {
    return files.map(file => this.addFile(file, priority))
  }

  /**
   * Remove file from queue
   */
  removeFile(fileId: string): boolean {
    const file = this.files.get(fileId)
    if (!file) {
      return false
    }

    // Decrease uploading count if file was uploading
    if (file.status === 'uploading') {
      this.uploadingCount--
    }

    this.files.delete(fileId)
    this.emit('fileRemoved', fileId)

    return true
  }

  /**
   * Get file by ID
   */
  getFile(fileId: string): FileItem | undefined {
    return this.files.get(fileId)
  }

  /**
   * Get all files
   */
  getAllFiles(): FileItem[] {
    return Array.from(this.files.values())
  }

  /**
   * Get files by status
   */
  getFilesByStatus(status: FileStatus): FileItem[] {
    return this.getAllFiles().filter(file => file.status === status)
  }

  /**
   * Get files by filter
   */
  getFilesByFilter(filter: FileFilter): FileItem[] {
    if (filter === 'all') {
      return this.getAllFiles()
    }
    return this.getFilesByStatus(filter)
  }

  /**
   * Update file status
   */
  updateFileStatus(fileId: string, status: FileStatus): void {
    const file = this.files.get(fileId)
    if (!file) {
      return
    }

    const oldStatus = file.status
    file.status = status

    // Update uploading count
    if (oldStatus === 'uploading' && status !== 'uploading') {
      this.uploadingCount--
    } else if (oldStatus !== 'uploading' && status === 'uploading') {
      this.uploadingCount++
    }

    // Emit status change event
    this.emit('statusChange', { fileId, oldStatus, newStatus: status })
  }

  /**
   * Update file progress
   */
  updateFileProgress(
    fileId: string,
    progress: number,
    uploadedSize: number,
    speed: number = 0,
    timeRemaining: number = 0
  ): void {
    const file = this.files.get(fileId)
    if (!file) {
      return
    }

    file.progress = progress
    file.uploadedSize = uploadedSize
    file.speed = speed
    file.timeRemaining = timeRemaining
  }

  /**
   * Set file error
   */
  setFileError(fileId: string, error: string): void {
    const file = this.files.get(fileId)
    if (!file) {
      return
    }

    file.error = error
    this.updateFileStatus(fileId, 'error')
  }

  /**
   * Set file thumbnail
   */
  setFileThumbnail(fileId: string, thumbnail: string): void {
    const file = this.files.get(fileId)
    if (!file) {
      return
    }

    file.thumbnail = thumbnail
  }

  /**
   * Set file metadata
   */
  setFileMetadata(fileId: string, metadata: Record<string, any>): void {
    const file = this.files.get(fileId)
    if (!file) {
      return
    }

    file.metadata = { ...file.metadata, ...metadata }
  }

  /**
   * Check if can start new upload
   */
  canStartUpload(): boolean {
    return this.uploadingCount < this.maxConcurrent
  }

  /**
   * Get next file to upload (by priority and order)
   */
  getNextFileToUpload(): FileItem | null {
    const pendingFiles = this.getFilesByStatus('pending')

    if (pendingFiles.length === 0) {
      return null
    }

    // Sort by priority (higher first) and then by insertion order
    pendingFiles.sort((a, b) => {
      if (a.priority !== b.priority) {
        return (b.priority || 0) - (a.priority || 0)
      }
      return 0
    })

    return pendingFiles[0]
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number
    pending: number
    uploading: number
    success: number
    error: number
    paused: number
    totalSize: number
    uploadedSize: number
  } {
    const files = this.getAllFiles()

    return {
      total: files.length,
      pending: files.filter(f => f.status === 'pending').length,
      uploading: files.filter(f => f.status === 'uploading').length,
      success: files.filter(f => f.status === 'success').length,
      error: files.filter(f => f.status === 'error').length,
      paused: files.filter(f => f.status === 'paused').length,
      totalSize: files.reduce((sum, f) => sum + f.totalSize, 0),
      uploadedSize: files.reduce((sum, f) => sum + f.uploadedSize, 0),
    }
  }

  /**
   * Clear all files
   */
  clear(): void {
    this.files.clear()
    this.uploadingCount = 0
    this.emit('cleared')
  }

  /**
   * Clear completed files
   */
  clearCompleted(): void {
    const completedIds = this.getFilesByStatus('success').map(f => f.id)
    completedIds.forEach(id => this.removeFile(id))
  }

  /**
   * Clear failed files
   */
  clearFailed(): void {
    const failedIds = this.getFilesByStatus('error').map(f => f.id)
    failedIds.forEach(id => this.removeFile(id))
  }

  /**
   * Get file count
   */
  getFileCount(): number {
    return this.files.size
  }

  /**
   * Set max concurrent uploads
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = Math.max(1, max)
  }

  /**
   * Get uploading count
   */
  getUploadingCount(): number {
    return this.uploadingCount
  }
}

