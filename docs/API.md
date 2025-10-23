# API Documentation

## Table of Contents

- [Uploader Class](#uploader-class)
- [Configuration Options](#configuration-options)
- [Methods](#methods)
- [Events](#events)
- [Types](#types)
- [Storage Adapters](#storage-adapters)
- [Processors](#processors)

---

## Uploader Class

The main class for managing file uploads.

### Constructor

```typescript
constructor(options: UploaderOptions)
```

Creates a new Uploader instance.

**Example:**

```typescript
import { Uploader } from '@ldesign/upload'

const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload',
  autoUpload: true
})
```

---

## Configuration Options

### UploaderOptions

```typescript
interface UploaderOptions {
  // Container
  container?: string | HTMLElement
  
  // Upload configuration
  endpoint?: string
  adapter?: StorageAdapter
  method?: 'POST' | 'PUT'
  headers?: Record<string, string>
  withCredentials?: boolean
  timeout?: number
  
  // File validation
  validation?: ValidationRules
  
  // Chunking
  chunked?: boolean
  chunkSize?: number
  concurrent?: number
  retries?: number
  
  // Behavior
  autoUpload?: boolean
  
  // UI
  showDashboard?: boolean
  mode?: 'compact' | 'inline' | 'modal'
  theme?: 'light' | 'dark' | 'auto'
  
  // Interactions
  dragDrop?: boolean
  paste?: boolean
  clickToUpload?: boolean
  
  // Processing
  imageProcess?: ImageProcessOptions
  videoProcess?: VideoProcessOptions
  
  // Events
  onFileAdded?: (file: FileItem) => void
  onUploadProgress?: (event: ProgressEvent) => void
  onUploadSuccess?: (fileId: string, response: any) => void
  onUploadError?: (fileId: string, error: Error) => void
  onUploadComplete?: () => void
}
```

### ValidationRules

```typescript
interface ValidationRules {
  accept?: string | string[]
  maxSize?: number
  minSize?: number
  maxFiles?: number
  maxTotalSize?: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  validator?: (file: File) => Promise<boolean> | boolean
}
```

### ImageProcessOptions

```typescript
interface ImageProcessOptions {
  compress?: boolean
  quality?: number // 0-1
  maxWidth?: number
  maxHeight?: number
  format?: 'jpeg' | 'png' | 'webp'
  crop?: boolean
  rotate?: number
  flipHorizontal?: boolean
  flipVertical?: boolean
  filters?: ImageFilter[]
}
```

---

## Methods

### File Management

#### addFile(file: File): Promise<FileItem | null>

Add a single file to the upload queue.

```typescript
const file = document.querySelector('input[type="file"]').files[0]
const fileItem = await uploader.addFile(file)
```

#### addFiles(files: File[]): Promise<void>

Add multiple files to the upload queue.

```typescript
const files = Array.from(document.querySelector('input[type="file"]').files)
await uploader.addFiles(files)
```

#### removeFile(fileId: string): boolean

Remove a file from the queue.

```typescript
uploader.removeFile(fileItem.id)
```

#### getFile(fileId: string): FileItem | undefined

Get a file by ID.

```typescript
const file = uploader.getFile(fileId)
```

#### getFiles(): FileItem[]

Get all files in the queue.

```typescript
const files = uploader.getFiles()
```

#### clear(): void

Clear all files from the queue.

```typescript
uploader.clear()
```

### Upload Control

#### uploadFile(fileId: string): Promise<void>

Upload a specific file.

```typescript
await uploader.uploadFile(fileItem.id)
```

#### uploadAll(): void

Upload all pending files.

```typescript
uploader.uploadAll()
```

#### pause(fileId: string): void

Pause an upload.

```typescript
uploader.pause(fileItem.id)
```

#### resume(fileId: string): void

Resume a paused upload.

```typescript
uploader.resume(fileItem.id)
```

#### cancel(fileId: string): void

Cancel an upload.

```typescript
uploader.cancel(fileItem.id)
```

#### retry(fileId: string): void

Retry a failed upload.

```typescript
uploader.retry(fileItem.id)
```

### UI Control

#### openFilePicker(): void

Open the file picker dialog.

```typescript
uploader.openFilePicker()
```

#### enable(): void

Enable the uploader.

```typescript
uploader.enable()
```

#### disable(): void

Disable the uploader.

```typescript
uploader.disable()
```

### Utilities

#### getStats(): UploadStats

Get upload statistics.

```typescript
const stats = uploader.getStats()
console.log(`${stats.success}/${stats.total} files uploaded`)
```

#### destroy(): void

Destroy the uploader instance and cleanup.

```typescript
uploader.destroy()
```

---

## Events

### Event Listener

```typescript
uploader.on(event: UploaderEventType, handler: EventHandler): void
uploader.off(event: UploaderEventType, handler: EventHandler): void
uploader.once(event: UploaderEventType, handler: EventHandler): void
```

### Available Events

#### fileAdded

Fired when a file is added to the queue.

```typescript
uploader.on('fileAdded', (file: FileItem) => {
  console.log(`File added: ${file.file.name}`)
})
```

#### fileRemoved

Fired when a file is removed from the queue.

```typescript
uploader.on('fileRemoved', (fileId: string) => {
  console.log(`File removed: ${fileId}`)
})
```

#### uploadStart

Fired when an upload starts.

```typescript
uploader.on('uploadStart', (fileId: string) => {
  console.log(`Upload started: ${fileId}`)
})
```

#### uploadProgress

Fired during upload progress.

```typescript
uploader.on('uploadProgress', (event: ProgressEvent) => {
  console.log(`Progress: ${event.progress}%`)
  console.log(`Speed: ${event.speed} bytes/s`)
  console.log(`Time remaining: ${event.timeRemaining}s`)
})
```

#### uploadSuccess

Fired when an upload succeeds.

```typescript
uploader.on('uploadSuccess', (fileId: string, response: any) => {
  console.log(`Upload successful:`, response)
})
```

#### uploadError

Fired when an upload fails.

```typescript
uploader.on('uploadError', (fileId: string, error: Error) => {
  console.error(`Upload failed:`, error.message)
})
```

#### uploadComplete

Fired when all uploads are complete.

```typescript
uploader.on('uploadComplete', () => {
  console.log('All uploads complete!')
})
```

#### validationError

Fired when file validation fails.

```typescript
uploader.on('validationError', ({ file, error }) => {
  console.error(`Validation failed for ${file.name}:`, error.message)
})
```

---

## Types

### FileItem

```typescript
interface FileItem {
  id: string
  file: File
  status: FileStatus
  progress: number
  speed: number
  timeRemaining: number
  uploadedSize: number
  totalSize: number
  error?: string
  thumbnail?: string
  metadata?: Record<string, any>
}
```

### FileStatus

```typescript
type FileStatus = 'pending' | 'uploading' | 'success' | 'error' | 'paused' | 'cancelled'
```

### ProgressEvent

```typescript
interface ProgressEvent {
  fileId: string
  progress: number // 0-100
  speed: number // bytes/s
  timeRemaining: number // seconds
  uploadedSize: number
  totalSize: number
}
```

---

## Storage Adapters

### Creating Custom Adapters

```typescript
import { BaseStorageAdapter, UploadOptions, UploadResult } from '@ldesign/upload/adapters'

class CustomAdapter extends BaseStorageAdapter {
  name = 'custom'
  
  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    // Your upload logic here
    return {
      success: true,
      url: 'https://example.com/uploaded-file.jpg'
    }
  }
}

// Use custom adapter
const uploader = new Uploader({
  adapter: new CustomAdapter()
})
```

### Built-in HTTP Adapter

```typescript
import { HTTPAdapter } from '@ldesign/upload/adapters'

const adapter = new HTTPAdapter({
  endpoint: 'https://api.example.com/upload',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer token'
  }
})
```

---

## Processors

### ImageProcessor

```typescript
import { ImageProcessor } from '@ldesign/upload/processors'

const processor = new ImageProcessor({
  compress: true,
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080
})

const processedFile = await processor.process(file)
```

### VideoProcessor

```typescript
import { VideoProcessor } from '@ldesign/upload/processors'

const processor = new VideoProcessor({
  thumbnail: true,
  thumbnailTime: 1 // Extract thumbnail at 1 second
})

const thumbnail = await processor.extractThumbnail(file)
const info = await processor.getInfo(file)
```

---

## Utility Functions

### formatFileSize(bytes: number): string

Format file size to human-readable string.

```typescript
import { formatFileSize } from '@ldesign/upload'

console.log(formatFileSize(1024)) // "1 KB"
console.log(formatFileSize(1048576)) // "1 MB"
```

### formatSpeed(bytesPerSecond: number): string

Format upload speed.

```typescript
import { formatSpeed } from '@ldesign/upload'

console.log(formatSpeed(102400)) // "100 KB/s"
```

### formatTimeRemaining(seconds: number): string

Format time remaining.

```typescript
import { formatTimeRemaining } from '@ldesign/upload'

console.log(formatTimeRemaining(65)) // "1m 5s"
```

---

For more examples, see the [examples directory](../examples).

