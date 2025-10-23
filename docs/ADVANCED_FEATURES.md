# Advanced Features Guide

## 目录

- [批量操作](#批量操作)
- [错误处理与重试](#错误处理与重试)
- [上传历史](#上传历史)
- [自定义验证](#自定义验证)
- [Web Workers](#web-workers)
- [性能优化](#性能优化)

---

## 批量操作

### 批量压缩图片

```typescript
import { Uploader, BatchProcessor } from '@ldesign/upload'

const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload'
})

const batchProcessor = new BatchProcessor()

// 压缩所有图片
const files = uploader.getFiles().map(f => f.file)
const results = await batchProcessor.batchCompress(files, {
  quality: 0.8,
  maxWidth: 1920
})

console.log(`Compressed ${results.length} images`)
```

### 批量处理进度

```typescript
const processor = new BatchProcessor()

await processor.batchProcessWithProgress(
  files,
  async (file) => {
    // Process each file
    return await imageProcessor.process(file)
  },
  (current, total) => {
    console.log(`Processing ${current}/${total}`)
  }
)
```

### 按类型分组

```typescript
const processor = new BatchProcessor()
const groups = processor.groupFilesByType(files)

console.log('Images:', groups.get('image')?.length)
console.log('Videos:', groups.get('video')?.length)
```

### 文件排序

```typescript
const processor = new BatchProcessor()

// 按大小排序
const sortedBySize = processor.sortFilesBySize(files, false) // 从大到小

// 按名称排序
const sortedByName = processor.sortFilesByName(files, true) // A-Z
```

---

## 错误处理与重试

### 自动重试配置

```typescript
const uploader = new Uploader({
  endpoint: '/api/upload',
  retries: 3, // 最多重试 3 次
  timeout: 30000 // 30 秒超时
})
```

### 手动重试

```typescript
uploader.on('uploadError', (fileId, error) => {
  console.error('Upload failed:', error)
  
  // 手动重试
  setTimeout(() => {
    uploader.retry(fileId)
  }, 5000) // 5 秒后重试
})
```

### 使用 ErrorHandler

```typescript
import { ErrorHandler } from '@ldesign/upload'

const errorHandler = new ErrorHandler(3) // 最多重试 3 次

const { shouldRetry, retryDelay, errorMessage } = errorHandler.handleError(
  error,
  fileId
)

if (shouldRetry) {
  setTimeout(() => {
    uploader.retry(fileId)
  }, retryDelay)
}
```

### 错误类型

```typescript
import { UploadError } from '@ldesign/upload'

uploader.on('uploadError', (fileId, error) => {
  if (error instanceof UploadError) {
    console.log('Error code:', error.code)
    console.log('Retryable:', error.retryable)
  }
})
```

---

## 上传历史

### 启用历史记录

```typescript
import { UploadHistory } from '@ldesign/upload'

const history = new UploadHistory(100) // 保存最近 100 个

// 上传成功时添加记录
uploader.on('uploadSuccess', (fileId, response) => {
  const file = uploader.getFile(fileId)
  if (file) {
    history.addItem({
      fileName: file.file.name,
      fileSize: file.totalSize,
      fileType: file.file.type,
      url: response.url,
      success: true
    })
  }
})
```

### 查询历史

```typescript
// 获取所有历史
const allHistory = history.getHistory()

// 获取最近上传
const recent = history.getRecentUploads(10)

// 按类型筛选
const images = history.getUploadsByType('image')

// 搜索
const results = history.searchHistory('photo')

// 按日期范围
const today = new Date()
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
const todayUploads = history.getUploadsByDateRange(yesterday, today)
```

### 历史统计

```typescript
const stats = history.getStats()

console.log(`Total uploads: ${stats.total}`)
console.log(`Successful: ${stats.successful}`)
console.log(`Failed: ${stats.failed}`)
console.log(`Total size: ${stats.totalSize}`)
console.log(`By type:`, stats.byType)
```

### 导出/导入历史

```typescript
// 导出为 JSON
const json = history.exportHistory()
localStorage.setItem('backup', json)

// 导入
const backup = localStorage.getItem('backup')
if (backup) {
  history.importHistory(backup)
}
```

---

## 自定义验证

### 自定义验证器

```typescript
const uploader = new Uploader({
  validation: {
    validator: async (file) => {
      // 自定义验证逻辑
      if (file.name.includes('test')) {
        return false
      }
      
      // 异步验证（例如检查文件签名）
      if (file.type.startsWith('image/')) {
        const buffer = await file.slice(0, 4).arrayBuffer()
        const header = new Uint8Array(buffer)
        
        // 检查 JPEG 文件签名 (FF D8 FF)
        if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
          return true
        }
        
        return false
      }
      
      return true
    }
  }
})
```

### 验证错误处理

```typescript
uploader.on('validationError', ({ file, error }) => {
  console.error(`Validation failed for ${file.name}:`, error.message)
  
  // 显示用户友好的错误消息
  if (error.code === 'FILE_TOO_LARGE') {
    alert(`文件 ${file.name} 太大了，最大允许 10MB`)
  }
})
```

---

## Web Workers

### 后台压缩图片

```typescript
// worker.js
self.onmessage = async (e) => {
  const { file, quality } = e.data
  
  // 在 Worker 中压缩图片
  const compressed = await compressImage(file, quality)
  
  self.postMessage({ compressed })
}

// main.js
const worker = new Worker('worker.js')

worker.onmessage = (e) => {
  const { compressed } = e.data
  console.log('Compression complete')
}

worker.postMessage({ file, quality: 0.8 })
```

### 后台计算 MD5

```typescript
import { hash } from '@ldesign/crypto'

// 在 Worker 中计算 MD5
const calculateMD5 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer()
  return hash.md5(new Uint8Array(buffer))
}
```

---

## 性能优化

### 虚拟滚动（大量文件）

```typescript
// 当文件数量超过 100 时，使用虚拟滚动
const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload',
  // 禁用内置 UI，使用自定义虚拟滚动组件
  showDashboard: false
})

// 使用第三方虚拟滚动库
// 例如：vue-virtual-scroller, react-window
```

### 缓存缩略图

```typescript
const thumbnailCache = new Map<string, string>()

uploader.on('fileAdded', async (file) => {
  const cacheKey = `${file.file.name}-${file.file.size}`
  
  if (thumbnailCache.has(cacheKey)) {
    // 使用缓存的缩略图
    file.thumbnail = thumbnailCache.get(cacheKey)
  } else {
    // 生成并缓存
    const thumbnail = await createThumbnail(file.file)
    thumbnailCache.set(cacheKey, thumbnail)
    file.thumbnail = thumbnail
  }
})
```

### 懒加载处理器

```typescript
// 按需加载图片处理器
let imageProcessor: ImageProcessor | null = null

const processImage = async (file: File) => {
  if (!imageProcessor) {
    const { ImageProcessor } = await import('@ldesign/upload/processors')
    imageProcessor = new ImageProcessor()
  }
  
  return imageProcessor.process(file)
}
```

### 并发控制优化

```typescript
// 根据网络速度动态调整并发数
uploader.on('uploadProgress', (event) => {
  const speed = event.speed
  
  if (speed > 1024 * 1024) { // > 1MB/s
    // 高速网络，增加并发
    fileManager.setMaxConcurrent(5)
  } else if (speed < 100 * 1024) { // < 100KB/s
    // 慢速网络，减少并发
    fileManager.setMaxConcurrent(1)
  }
})
```

---

## 更多示例

查看 [examples/](../examples/) 目录获取完整示例。

