/**
 * Offline Cache - Store files and upload state in IndexedDB
 * 
 * This cache provides:
 * - Persistent file storage
 * - Upload state persistence
 * - Offline upload queue
 * - Automatic cache cleanup
 */

const DB_NAME = 'ldesign-upload-cache'
const DB_VERSION = 1
const STORE_FILES = 'files'
const STORE_UPLOADS = 'uploads'
const STORE_CHUNKS = 'chunks'

interface CachedFile {
  id: string
  file: File
  metadata: {
    name: string
    size: number
    type: string
    lastModified: number
  }
  cachedAt: number
  expiresAt: number
}

interface CachedUpload {
  id: string
  fileId: string
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'failed'
  progress: number
  uploadedChunks: number[]
  totalChunks: number
  createdAt: number
  updatedAt: number
}

interface CachedChunk {
  id: string
  fileId: string
  index: number
  data: Blob
  uploaded: boolean
  hash?: string
}

export class OfflineCache {
  private db: IDBDatabase | null = null
  private isInitialized: boolean = false
  private cacheDuration: number // milliseconds
  private maxCacheSize: number // bytes

  constructor(options: {
    cacheDuration?: number // days
    maxCacheSize?: number // MB
  } = {}) {
    this.cacheDuration = (options.cacheDuration || 7) * 24 * 60 * 60 * 1000 // default 7 days
    this.maxCacheSize = (options.maxCacheSize || 500) * 1024 * 1024 // default 500MB
  }

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    if (this.isInitialized) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        this.isInitialized = true
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create files store
        if (!db.objectStoreNames.contains(STORE_FILES)) {
          const filesStore = db.createObjectStore(STORE_FILES, { keyPath: 'id' })
          filesStore.createIndex('cachedAt', 'cachedAt', { unique: false })
          filesStore.createIndex('expiresAt', 'expiresAt', { unique: false })
        }

        // Create uploads store
        if (!db.objectStoreNames.contains(STORE_UPLOADS)) {
          const uploadsStore = db.createObjectStore(STORE_UPLOADS, { keyPath: 'id' })
          uploadsStore.createIndex('fileId', 'fileId', { unique: false })
          uploadsStore.createIndex('status', 'status', { unique: false })
        }

        // Create chunks store
        if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
          const chunksStore = db.createObjectStore(STORE_CHUNKS, { keyPath: 'id' })
          chunksStore.createIndex('fileId', 'fileId', { unique: false })
          chunksStore.createIndex('uploaded', 'uploaded', { unique: false })
        }
      }
    })
  }

  /**
   * Cache file
   */
  async cacheFile(id: string, file: File): Promise<void> {
    await this.ensureInitialized()

    const cachedFile: CachedFile = {
      id,
      file,
      metadata: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      },
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.cacheDuration,
    }

    return this.put(STORE_FILES, cachedFile)
  }

  /**
   * Retrieve cached file
   */
  async retrieveFile(id: string): Promise<File | null> {
    await this.ensureInitialized()

    const cached = await this.get<CachedFile>(STORE_FILES, id)
    
    if (!cached) return null

    // Check expiration
    if (Date.now() > cached.expiresAt) {
      await this.deleteFile(id)
      return null
    }

    return cached.file
  }

  /**
   * Delete cached file
   */
  async deleteFile(id: string): Promise<void> {
    await this.ensureInitialized()
    return this.delete(STORE_FILES, id)
  }

  /**
   * Cache upload state
   */
  async cacheUploadState(upload: Omit<CachedUpload, 'createdAt' | 'updatedAt'>): Promise<void> {
    await this.ensureInitialized()

    const existing = await this.get<CachedUpload>(STORE_UPLOADS, upload.id)

    const cachedUpload: CachedUpload = {
      ...upload,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    return this.put(STORE_UPLOADS, cachedUpload)
  }

  /**
   * Retrieve upload state
   */
  async retrieveUploadState(id: string): Promise<CachedUpload | null> {
    await this.ensureInitialized()
    return this.get<CachedUpload>(STORE_UPLOADS, id)
  }

  /**
   * Get all pending uploads
   */
  async getPendingUploads(): Promise<CachedUpload[]> {
    await this.ensureInitialized()
    return this.getByIndex<CachedUpload>(STORE_UPLOADS, 'status', 'pending')
  }

  /**
   * Cache file chunk
   */
  async cacheChunk(fileId: string, index: number, data: Blob, hash?: string): Promise<void> {
    await this.ensureInitialized()

    const chunk: CachedChunk = {
      id: `${fileId}-${index}`,
      fileId,
      index,
      data,
      uploaded: false,
      hash,
    }

    return this.put(STORE_CHUNKS, chunk)
  }

  /**
   * Retrieve file chunk
   */
  async retrieveChunk(fileId: string, index: number): Promise<Blob | null> {
    await this.ensureInitialized()

    const chunk = await this.get<CachedChunk>(STORE_CHUNKS, `${fileId}-${index}`)
    return chunk?.data || null
  }

  /**
   * Mark chunk as uploaded
   */
  async markChunkUploaded(fileId: string, index: number): Promise<void> {
    await this.ensureInitialized()

    const chunk = await this.get<CachedChunk>(STORE_CHUNKS, `${fileId}-${index}`)
    if (chunk) {
      chunk.uploaded = true
      await this.put(STORE_CHUNKS, chunk)
    }
  }

  /**
   * Get all chunks for a file
   */
  async getFileChunks(fileId: string): Promise<CachedChunk[]> {
    await this.ensureInitialized()
    return this.getByIndex<CachedChunk>(STORE_CHUNKS, 'fileId', fileId)
  }

  /**
   * Clear expired cache
   */
  async clearExpiredCache(): Promise<number> {
    await this.ensureInitialized()

    const now = Date.now()
    const files = await this.getAll<CachedFile>(STORE_FILES)
    
    let cleared = 0
    for (const file of files) {
      if (now > file.expiresAt) {
        await this.deleteFile(file.id)
        cleared++
      }
    }

    return cleared
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    await this.ensureInitialized()

    const files = await this.getAll<CachedFile>(STORE_FILES)
    const chunks = await this.getAll<CachedChunk>(STORE_CHUNKS)

    let totalSize = 0

    for (const file of files) {
      totalSize += file.file.size
    }

    for (const chunk of chunks) {
      totalSize += chunk.data.size
    }

    return totalSize
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    await this.ensureInitialized()

    await this.clearStore(STORE_FILES)
    await this.clearStore(STORE_UPLOADS)
    await this.clearStore(STORE_CHUNKS)
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    await this.ensureInitialized()

    const files = await this.getAll<CachedFile>(STORE_FILES)
    const uploads = await this.getAll<CachedUpload>(STORE_UPLOADS)
    const chunks = await this.getAll<CachedChunk>(STORE_CHUNKS)
    const cacheSize = await this.getCacheSize()

    return {
      filesCount: files.length,
      uploadsCount: uploads.length,
      chunksCount: chunks.length,
      cacheSize,
      maxCacheSize: this.maxCacheSize,
      cacheDuration: this.cacheDuration,
    }
  }

  /**
   * Generic get operation
   */
  private get<T>(storeName: string, key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Generic put operation
   */
  private put(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Generic delete operation
   */
  private delete(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all items from store
   */
  private getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get items by index
   */
  private getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear entire store
   */
  private clearStore(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Ensure DB is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init()
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.isInitialized = false
    }
  }
}
