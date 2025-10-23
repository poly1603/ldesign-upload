/**
 * Base Storage Adapter
 * 
 * Abstract base class for storage adapters.
 * Extend this class to create custom storage adapters for different cloud providers.
 */

import type { StorageAdapter, UploadOptions, UploadResult } from '../types'

export abstract class BaseStorageAdapter implements StorageAdapter {
  abstract name: string

  /**
   * Upload file
   */
  abstract upload(file: File, options: UploadOptions): Promise<UploadResult>

  /**
   * Upload chunk (optional, for chunked uploads)
   */
  uploadChunk?(chunk: Blob, index: number, total: number, fileId: string): Promise<void>

  /**
   * Merge chunks (optional, for chunked uploads)
   */
  mergeChunks?(fileId: string, totalChunks: number): Promise<UploadResult>

  /**
   * Get signed URL (optional, for direct uploads)
   */
  getSignedUrl?(file: File): Promise<string>

  /**
   * Abort upload (optional)
   */
  abortUpload?(uploadId: string): void

  /**
   * Test if chunk already exists (optional, for resume capability)
   */
  testChunk?(fileId: string, chunkIndex: number): Promise<boolean>
}

/**
 * HTTP Adapter - Default adapter for standard HTTP uploads
 */
export class HTTPAdapter extends BaseStorageAdapter {
  name = 'http'
  private endpoint: string
  private method: 'POST' | 'PUT'
  private headers: Record<string, string>

  constructor(options: {
    endpoint: string
    method?: 'POST' | 'PUT'
    headers?: Record<string, string>
  }) {
    super()
    this.endpoint = options.endpoint
    this.method = options.method || 'POST'
    this.headers = options.headers || {}
  }

  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)

    // Add metadata if provided
    if (options.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    try {
      const response = await fetch(options.endpoint || this.endpoint, {
        method: options.method || this.method,
        headers: { ...this.headers, ...options.headers },
        body: formData,
        credentials: options.withCredentials ? 'include' : 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`)
      }

      const data = await response.json().catch(() => ({}))

      return {
        success: true,
        url: data.url,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }

  async uploadChunk(chunk: Blob, index: number, total: number, fileId: string): Promise<void> {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('index', String(index))
    formData.append('total', String(total))
    formData.append('fileId', fileId)

    const response = await fetch(`${this.endpoint}/chunk`, {
      method: 'POST',
      headers: this.headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Chunk upload failed with status ${response.status}`)
    }
  }

  async mergeChunks(fileId: string, totalChunks: number): Promise<UploadResult> {
    const response = await fetch(`${this.endpoint}/merge`, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, totalChunks }),
    })

    if (!response.ok) {
      throw new Error(`Merge failed with status ${response.status}`)
    }

    const data = await response.json()

    return {
      success: true,
      url: data.url,
      data,
    }
  }
}

