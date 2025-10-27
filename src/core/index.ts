/**
 * Export core classes
 */

export { Uploader } from './Uploader'
export { FileManager } from './FileManager'
export { ChunkManager } from './ChunkManager'
export { ValidationManager } from './ValidationManager'
export { ProgressTracker } from './ProgressTracker'
export { InteractionManager } from './InteractionManager'
export { BatchProcessor } from './BatchProcessor'
export { ErrorHandler, UploadError } from './ErrorHandler'
export { UploadHistory } from './UploadHistory'

// New advanced features
export { DuplicationDetector } from './DuplicationDetector'
export { RateLimiter, AdaptiveRateLimiter } from './RateLimiter'
export { WorkerPool, getWorkerPool, terminateWorkerPool } from './WorkerPool'
export type { WorkerTask, WorkerResult } from './WorkerPool'
export { OfflineCache } from './OfflineCache'

