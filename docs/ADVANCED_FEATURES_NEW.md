# 🚀 高级功能使用指南

本文档介绍 `@ldesign/upload` 的高级功能模块。

---

## 📑 目录

1. [文件去重检测](#文件去重检测)
2. [上传速率限流](#上传速率限流)
3. [WebWorker 处理池](#webworker-处理池)
4. [IndexedDB 离线缓存](#indexeddb-离线缓存)
5. [MD5 哈希计算](#md5-哈希计算)
6. [图片模糊滤镜](#图片模糊滤镜)

---

## 1. 文件去重检测

使用 `DuplicationDetector` 防止用户重复上传相同文件。

### 基础用法

```typescript
import { DuplicationDetector } from '@ldesign/upload'

// 创建检测器
const detector = new DuplicationDetector({
  useContentHash: true,      // 使用内容哈希(更准确但较慢)
  maxCacheSize: 1000,         // 最多缓存 1000 个文件指纹
  cacheDuration: 30           // 缓存 30 天
})

// 检查文件是否重复
const file = new File(['content'], 'test.txt')
const { isDuplicate, existingFile } = await detector.isDuplicate(file)

if (isDuplicate) {
  console.log('文件已上传过:', existingFile)
  // 提示用户或自动跳过
} else {
  // 上传文件
  await uploadFile(file)
  
  // 标记为已上传
  await detector.markAsUploaded(file)
}
```

### 与 Uploader 集成

```typescript
import { Uploader, DuplicationDetector } from '@ldesign/upload'

const detector = new DuplicationDetector()
const uploader = new Uploader({
  endpoint: '/api/upload',
  onFileAdded: async (fileItem) => {
    // 检测重复
    const { isDuplicate, existingFile } = await detector.isDuplicate(fileItem.file)
    
    if (isDuplicate) {
      console.warn('重复文件:', existingFile)
      uploader.removeFile(fileItem.id)
      alert(`文件 ${fileItem.file.name} 已经上传过了`)
    }
  },
  onUploadSuccess: async (fileId) => {
    const file = uploader.getFile(fileId)
    if (file) {
      await detector.markAsUploaded(file.file)
    }
  }
})
```

### API 参考

```typescript
class DuplicationDetector {
  // 检查是否重复
  async isDuplicate(file: File): Promise<{
    isDuplicate: boolean
    existingFile?: FileFingerprint
  }>
  
  // 获取文件指纹
  async getFileFingerprint(file: File): Promise<string>
  
  // 标记为已上传
  async markAsUploaded(file: File): Promise<void>
  
  // 从缓存移除
  async removeFromCache(file: File): Promise<void>
  
  // 获取统计信息
  getStats(): {
    cacheSize: number
    maxCacheSize: number
    useContentHash: boolean
  }
  
  // 清空缓存
  clear(): void
}
```

---

## 2. 上传速率限流

使用 `RateLimiter` 控制上传速度,防止占用过多带宽。

### 基础限流器

```typescript
import { RateLimiter } from '@ldesign/upload'

// 创建限流器: 最大 1MB/s
const limiter = new RateLimiter(1 * 1024 * 1024)

// 在上传前调用 throttle
async function uploadChunk(chunk: Blob) {
  await limiter.throttle(chunk.size)  // 等待直到可以发送
  
  // 执行实际上传
  await fetch('/upload', {
    method: 'POST',
    body: chunk
  })
}

// 动态调整速率
limiter.setMaxBytesPerSecond(2 * 1024 * 1024) // 改为 2MB/s

// 获取当前速率
console.log('当前速率:', limiter.getCurrentRate(), 'bytes/s')

// 禁用限流
limiter.disable()
```

### 自适应限流器

根据网络状况自动调整上传速率:

```typescript
import { AdaptiveRateLimiter } from '@ldesign/upload'

const limiter = new AdaptiveRateLimiter(1 * 1024 * 1024) // 初始 1MB/s

async function uploadWithAdaptive(chunk: Blob) {
  const startTime = Date.now()
  
  await limiter.throttle(chunk.size)
  
  try {
    await fetch('/upload', { method: 'POST', body: chunk })
    
    const latency = Date.now() - startTime
    limiter.recordSuccess(latency) // 记录成功(会自动调整速率)
  } catch (error) {
    limiter.recordFailure() // 记录失败(会降低速率)
    throw error
  }
}

// 获取网络质量评估
const quality = limiter.getNetworkQuality()
console.log('网络质量:', quality) // 'excellent' | 'good' | 'fair' | 'poor'
```

### 与 Uploader 集成

```typescript
import { Uploader, RateLimiter } from '@ldesign/upload'
import { HTTPAdapter } from '@ldesign/upload/adapters'

const limiter = new RateLimiter(2 * 1024 * 1024) // 2MB/s

// 自定义适配器,集成限流
class ThrottledAdapter extends HTTPAdapter {
  async uploadChunk(chunk: Blob, index: number, total: number, fileId: string) {
    await limiter.throttle(chunk.size)
    return super.uploadChunk(chunk, index, total, fileId)
  }
}

const uploader = new Uploader({
  adapter: new ThrottledAdapter({ endpoint: '/api/upload' }),
  chunked: true
})
```

---

## 3. WebWorker 处理池

使用 `WorkerPool` 在后台线程处理 CPU 密集型任务。

### 基础用法

```typescript
import { WorkerPool } from '@ldesign/upload'

// 创建 Worker 池(自动使用 CPU 核心数)
const pool = new WorkerPool()
await pool.init()

// 压缩图片
const imageFile = new File([...], 'photo.jpg', { type: 'image/jpeg' })
const compressed = await pool.compressImage(imageFile, {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080
})

// 计算文件哈希
const hash = await pool.calculateHash(imageFile)
console.log('SHA-256:', hash)

// 获取统计
console.log(pool.getStats())
// { totalWorkers: 4, availableWorkers: 4, busyWorkers: 0, queuedTasks: 0 }

// 清理
pool.terminate()
```

### 使用全局单例

```typescript
import { getWorkerPool, terminateWorkerPool } from '@ldesign/upload'

// 获取全局池
const pool = getWorkerPool()

// 批量处理
const files = [...] // File[]
const results = await Promise.all(
  files.map(file => pool.compressImage(file, { quality: 0.7 }))
)

// 应用关闭时清理
window.addEventListener('beforeunload', () => {
  terminateWorkerPool()
})
```

### 与图片处理集成

```typescript
import { ImageProcessor, getWorkerPool } from '@ldesign/upload'

const processor = new ImageProcessor({
  compress: true,
  quality: 0.8
})

const pool = getWorkerPool()

// 在 Worker 中压缩(不阻塞主线程)
async function processImageInBackground(file: File) {
  return await pool.compressImage(file, {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  })
}

// 或在主线程压缩
async function processImageInMainThread(file: File) {
  return await processor.compress(file)
}
```

### 自定义任务

```typescript
const pool = new WorkerPool()
await pool.init()

// 执行自定义任务
const result = await pool.execute({
  id: crypto.randomUUID(),
  type: 'custom',
  data: { /* 自定义数据 */ },
  priority: 2 // 高优先级
})
```

---

## 4. IndexedDB 离线缓存

使用 `OfflineCache` 实现离线上传和断点续传。

### 基础用法

```typescript
import { OfflineCache } from '@ldesign/upload'

// 创建缓存
const cache = new OfflineCache({
  cacheDuration: 7,    // 缓存 7 天
  maxCacheSize: 500    // 最大 500MB
})

await cache.init()

// 缓存文件
const file = new File(['content'], 'document.pdf')
await cache.cacheFile('file-123', file)

// 恢复文件
const cachedFile = await cache.retrieveFile('file-123')
if (cachedFile) {
  console.log('从缓存恢复:', cachedFile.name)
}

// 缓存上传状态
await cache.cacheUploadState({
  id: 'upload-123',
  fileId: 'file-123',
  status: 'uploading',
  progress: 45,
  uploadedChunks: [0, 1, 2],
  totalChunks: 10
})

// 获取统计
const stats = await cache.getStats()
console.log('缓存使用:', stats.cacheSize / 1024 / 1024, 'MB')
```

### 实现离线上传队列

```typescript
import { Uploader, OfflineCache } from '@ldesign/upload'

const cache = new OfflineCache()
await cache.init()

const uploader = new Uploader({
  endpoint: '/api/upload',
  onFileAdded: async (fileItem) => {
    // 缓存文件
    await cache.cacheFile(fileItem.id, fileItem.file)
  },
  onUploadProgress: async (event) => {
    // 保存进度
    await cache.cacheUploadState({
      id: event.fileId,
      fileId: event.fileId,
      status: 'uploading',
      progress: event.progress,
      uploadedChunks: [],
      totalChunks: 0
    })
  },
  onUploadSuccess: async (fileId) => {
    // 清理缓存
    await cache.deleteFile(fileId)
  }
})

// 恢复未完成的上传
async function resumeUploads() {
  const pending = await cache.getPendingUploads()
  
  for (const upload of pending) {
    const file = await cache.retrieveFile(upload.fileId)
    if (file) {
      await uploader.addFile(file)
    }
  }
}

// 应用启动时恢复
resumeUploads()
```

### 分片缓存

```typescript
// 缓存文件分片
const chunks = splitFileIntoChunks(file, 5 * 1024 * 1024)

for (let i = 0; i < chunks.length; i++) {
  await cache.cacheChunk(fileId, i, chunks[i])
}

// 上传后标记
await cache.markChunkUploaded(fileId, 0)

// 获取未上传的分片
const allChunks = await cache.getFileChunks(fileId)
const pending = allChunks.filter(chunk => !chunk.uploaded)

// 继续上传
for (const chunk of pending) {
  await uploadChunk(chunk.data)
  await cache.markChunkUploaded(fileId, chunk.index)
}
```

---

## 5. MD5 哈希计算

`ChunkManager` 现已集成 `@ldesign/crypto` 进行 MD5 哈希计算。

### 基础用法

```typescript
import { ChunkManager } from '@ldesign/upload'

const chunkManager = new ChunkManager()

// 计算分片哈希
const file = new File(['content'], 'test.txt')
const chunks = chunkManager.splitFile(file)
const hash = await chunkManager.calculateChunkHash(chunks[0])
console.log('分片 MD5:', hash)

// 计算整个文件哈希
const fileHash = await chunkManager.calculateFileHash(file)
console.log('文件 MD5:', fileHash)
```

### 用于秒传功能

```typescript
import { Uploader, ChunkManager } from '@ldesign/upload'

const chunkManager = new ChunkManager()

const uploader = new Uploader({
  endpoint: '/api/upload',
  onFileAdded: async (fileItem) => {
    // 计算文件哈希
    const hash = await chunkManager.calculateFileHash(fileItem.file)
    
    // 检查服务器是否已有该文件
    const response = await fetch(`/api/check-hash?hash=${hash}`)
    const { exists, url } = await response.json()
    
    if (exists) {
      console.log('文件已存在,秒传成功!')
      // 直接标记为成功
      uploader.getFile(fileItem.id)!.status = 'success'
    }
  }
})
```

### 验证分片完整性

```typescript
// 上传前计算哈希
const chunk = chunks[0]
const originalHash = await chunkManager.calculateChunkHash(chunk)

// 上传分片
await uploadChunk(chunk, originalHash)

// 服务器端验证
// POST /upload/chunk
// Body: { chunk, index, hash: originalHash }
```

---

## 6. 图片模糊滤镜

`ImageProcessor` 现已完整实现模糊滤镜。

### 基础用法

```typescript
import { ImageProcessor } from '@ldesign/upload'

const processor = new ImageProcessor()

// 应用模糊滤镜
const file = new File([...], 'photo.jpg', { type: 'image/jpeg' })
const blurred = await processor.applyFilters(file, [
  { type: 'blur', value: 10 } // 模糊半径 10px
])

// 组合多个滤镜
const processed = await processor.applyFilters(file, [
  { type: 'blur', value: 5 },
  { type: 'brightness', value: 0.2 },
  { type: 'contrast', value: 1.2 }
])
```

### 所有可用滤镜

```typescript
// 灰度
{ type: 'grayscale' }

// 模糊
{ type: 'blur', value: 10 }

// 亮度 (-1 到 1)
{ type: 'brightness', value: 0.3 }

// 对比度 (0 到 2)
{ type: 'contrast', value: 1.5 }

// 复古色调
{ type: 'sepia' }

// 自定义滤镜
{ 
  type: 'custom',
  customFilter: (canvas) => {
    const ctx = canvas.getContext('2d')
    // 自定义处理
  }
}
```

---

## 🎯 完整示例

综合使用所有高级功能:

```typescript
import {
  Uploader,
  DuplicationDetector,
  AdaptiveRateLimiter,
  getWorkerPool,
  OfflineCache,
  ChunkManager
} from '@ldesign/upload'

// 初始化所有组件
const detector = new DuplicationDetector({ useContentHash: true })
const limiter = new AdaptiveRateLimiter(2 * 1024 * 1024)
const workerPool = getWorkerPool()
const cache = new OfflineCache()
const chunkManager = new ChunkManager()

await Promise.all([
  workerPool.init(),
  cache.init()
])

// 创建上传器
const uploader = new Uploader({
  endpoint: '/api/upload',
  chunked: true,
  
  onFileAdded: async (fileItem) => {
    const file = fileItem.file
    
    // 1. 检测重复
    const { isDuplicate } = await detector.isDuplicate(file)
    if (isDuplicate) {
      uploader.removeFile(fileItem.id)
      alert('文件已上传过')
      return
    }
    
    // 2. 如果是图片,在 Worker 中压缩
    if (file.type.startsWith('image/')) {
      const compressed = await workerPool.compressImage(file, {
        quality: 0.8,
        maxWidth: 1920
      })
      // 替换文件
      fileItem.file = new File([compressed], file.name, { type: file.type })
    }
    
    // 3. 计算哈希(用于秒传)
    const hash = await chunkManager.calculateFileHash(file)
    const checkResult = await fetch(`/api/check?hash=${hash}`)
    const { exists } = await checkResult.json()
    
    if (exists) {
      console.log('秒传成功!')
      return
    }
    
    // 4. 缓存到 IndexedDB
    await cache.cacheFile(fileItem.id, file)
  },
  
  onUploadProgress: async (event) => {
    // 限流
    await limiter.throttle(event.uploadedSize)
    
    // 缓存进度
    await cache.cacheUploadState({
      id: event.fileId,
      fileId: event.fileId,
      status: 'uploading',
      progress: event.progress,
      uploadedChunks: [],
      totalChunks: 0
    })
  },
  
  onUploadSuccess: async (fileId) => {
    // 标记为已上传
    const file = uploader.getFile(fileId)
    if (file) {
      await detector.markAsUploaded(file.file)
    }
    
    // 清理缓存
    await cache.deleteFile(fileId)
  }
})

// 应用启动时恢复未完成的上传
async function init() {
  const pending = await cache.getPendingUploads()
  for (const upload of pending) {
    const file = await cache.retrieveFile(upload.fileId)
    if (file) {
      await uploader.addFile(file)
    }
  }
}

init()
```

---

## 📊 性能优化建议

1. **使用 Worker 池处理图片** - 避免阻塞主线程
2. **启用自适应限流** - 根据网络状况自动调整
3. **使用元数据指纹** - 快速检测重复(非关键场景)
4. **合理设置缓存时长** - 平衡存储空间和恢复能力
5. **分片大小优化** - 使用 `RateLimiter.getOptimalChunkSize()`

---

## 🔧 故障排查

### Worker 初始化失败
```typescript
// 检查浏览器支持
if (!window.Worker) {
  console.warn('浏览器不支持 Web Workers')
  // 回退到主线程处理
}
```

### IndexedDB 配额超限
```typescript
const stats = await cache.getStats()
if (stats.cacheSize > stats.maxCacheSize * 0.9) {
  // 清理过期缓存
  await cache.clearExpiredCache()
}
```

### 内容哈希计算耗时
```typescript
// 对于大文件,使用元数据指纹
const detector = new DuplicationDetector({
  useContentHash: file.size < 10 * 1024 * 1024 // 仅小于10MB使用内容哈希
})
```

---

**Built with ❤️ by LDesign Team**
