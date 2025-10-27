/**
 * Worker Pool - Manage Web Workers for CPU-intensive tasks
 * 
 * This pool manages workers for:
 * - Image compression and processing
 * - File hash calculation
 * - Video thumbnail extraction
 */

export type WorkerTask = {
  id: string
  type: 'compress' | 'hash' | 'thumbnail' | 'custom'
  data: any
  priority?: number
}

export type WorkerResult = {
  id: string
  success: boolean
  data?: any
  error?: string
}

export class WorkerPool {
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private taskQueue: Array<{
    task: WorkerTask
    resolve: (result: WorkerResult) => void
    reject: (error: Error) => void
  }> = []
  private maxWorkers: number
  private workerScript: string | null = null
  private isInitialized: boolean = false

  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4) {
    this.maxWorkers = Math.max(1, Math.min(maxWorkers, 8))
  }

  /**
   * Initialize worker pool
   */
  async init(workerScript?: string): Promise<void> {
    if (this.isInitialized) return

    this.workerScript = workerScript || this.getDefaultWorkerScript()

    // Create workers
    for (let i = 0; i < this.maxWorkers; i++) {
      try {
        const worker = await this.createWorker()
        this.workers.push(worker)
        this.availableWorkers.push(worker)
      } catch (error) {
        console.error('Failed to create worker:', error)
      }
    }

    this.isInitialized = true
  }

  /**
   * Create a single worker
   */
  private async createWorker(): Promise<Worker> {
    if (!this.workerScript) {
      throw new Error('Worker script not provided')
    }

    // Create worker from blob URL for inline script
    const blob = new Blob([this.workerScript], { type: 'application/javascript' })
    const workerUrl = URL.createObjectURL(blob)
    const worker = new Worker(workerUrl)

    // Setup worker message handler
    worker.addEventListener('message', (e: MessageEvent<WorkerResult>) => {
      this.handleWorkerMessage(worker, e.data)
    })

    worker.addEventListener('error', (e) => {
      console.error('Worker error:', e)
    })

    return worker
  }

  /**
   * Execute task in worker
   */
  async execute(task: WorkerTask): Promise<WorkerResult> {
    if (!this.isInitialized) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      // Add task to queue
      this.taskQueue.push({ task, resolve, reject })
      
      // Try to process queue
      this.processQueue()
    })
  }

  /**
   * Process task queue
   */
  private processQueue(): void {
    // Sort queue by priority
    this.taskQueue.sort((a, b) => (b.task.priority || 0) - (a.task.priority || 0))

    while (this.availableWorkers.length > 0 && this.taskQueue.length > 0) {
      const worker = this.availableWorkers.pop()!
      const item = this.taskQueue.shift()!

      // Send task to worker
      worker.postMessage(item.task)

      // Store callbacks for this worker
      ;(worker as any).__currentTask = item
    }
  }

  /**
   * Handle message from worker
   */
  private handleWorkerMessage(worker: Worker, result: WorkerResult): void {
    const task = (worker as any).__currentTask

    if (task) {
      if (result.success) {
        task.resolve(result)
      } else {
        task.reject(new Error(result.error || 'Worker task failed'))
      }

      // Clear current task
      delete (worker as any).__currentTask

      // Mark worker as available
      this.availableWorkers.push(worker)

      // Process next tasks
      this.processQueue()
    }
  }

  /**
   * Compress image in worker
   */
  async compressImage(file: File, options: {
    quality?: number
    maxWidth?: number
    maxHeight?: number
  }): Promise<Blob> {
    const result = await this.execute({
      id: crypto.randomUUID(),
      type: 'compress',
      data: { file, options },
    })

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Image compression failed')
    }

    return result.data
  }

  /**
   * Calculate file hash in worker
   */
  async calculateHash(file: File): Promise<string> {
    const result = await this.execute({
      id: crypto.randomUUID(),
      type: 'hash',
      data: { file },
      priority: 1, // Higher priority for hash calculation
    })

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Hash calculation failed')
    }

    return result.data.hash
  }

  /**
   * Extract video thumbnail in worker
   */
  async extractThumbnail(file: File, time: number = 1): Promise<string> {
    const result = await this.execute({
      id: crypto.randomUUID(),
      type: 'thumbnail',
      data: { file, time },
    })

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Thumbnail extraction failed')
    }

    return result.data.thumbnail
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.workers.length - this.availableWorkers.length,
      queuedTasks: this.taskQueue.length,
      isInitialized: this.isInitialized,
    }
  }

  /**
   * Terminate all workers
   */
  terminate(): void {
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
    this.availableWorkers = []
    this.taskQueue = []
    this.isInitialized = false
  }

  /**
   * Get default worker script
   */
  private getDefaultWorkerScript(): string {
    return `
      self.addEventListener('message', async (e) => {
        const task = e.data;
        
        try {
          let result;
          
          switch (task.type) {
            case 'compress':
              result = await compressImage(task.data);
              break;
            case 'hash':
              result = await calculateHash(task.data);
              break;
            case 'thumbnail':
              result = await extractThumbnail(task.data);
              break;
            default:
              throw new Error('Unknown task type: ' + task.type);
          }
          
          self.postMessage({
            id: task.id,
            success: true,
            data: result
          });
        } catch (error) {
          self.postMessage({
            id: task.id,
            success: false,
            error: error.message
          });
        }
      });
      
      // Image compression function
      async function compressImage(data) {
        const { file, options } = data;
        
        // Create ImageBitmap
        const bitmap = await createImageBitmap(file);
        
        // Calculate dimensions
        let { width, height } = bitmap;
        const maxWidth = options.maxWidth || 1920;
        const maxHeight = options.maxHeight || 1080;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // Create canvas and compress
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, width, height);
        
        const blob = await canvas.convertToBlob({
          type: 'image/jpeg',
          quality: options.quality || 0.8
        });
        
        return blob;
      }
      
      // Hash calculation function
      async function calculateHash(data) {
        const { file } = data;
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return { hash };
      }
      
      // Thumbnail extraction (placeholder)
      async function extractThumbnail(data) {
        // This would require video processing capabilities
        // For now, return placeholder
        return { thumbnail: '' };
      }
    `;
  }
}

/**
 * Singleton instance for global worker pool
 */
let globalWorkerPool: WorkerPool | null = null

export function getWorkerPool(): WorkerPool {
  if (!globalWorkerPool) {
    globalWorkerPool = new WorkerPool()
  }
  return globalWorkerPool
}

export function terminateWorkerPool(): void {
  if (globalWorkerPool) {
    globalWorkerPool.terminate()
    globalWorkerPool = null
  }
}
