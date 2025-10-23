# 📖 @ldesign/upload - 完整使用指南

<div align="center">

# 从零到精通

**一站式文件上传解决方案**

</div>

---

## 📚 目录

1. [项目概览](#项目概览)
2. [快速开始](#快速开始)
3. [核心概念](#核心概念)
4. [完整示例](#完整示例)
5. [高级特性](#高级特性)
6. [框架集成](#框架集成)
7. [云存储集成](#云存储集成)
8. [API 参考](#api-参考)
9. [最佳实践](#最佳实践)
10. [常见问题](#常见问题)

---

## 项目概览

### 什么是 @ldesign/upload？

一个**功能强大、框架无关**的文件上传库，具有：

- 🚀 **强大**: 101 个功能特性
- 🎨 **美观**: 精美 UI + 主题系统
- ⚡ **快速**: ~35KB + 高性能
- 🔧 **灵活**: 插件化架构
- 📘 **易用**: 3 行代码即可启动

### 为什么选择 @ldesign/upload？

| 功能 | @ldesign/upload | 其他库 |
|------|----------------|--------|
| 分片上传 | ✅ 5MB 可配置 | ⚠️ 部分支持 |
| 断点续传 | ✅ LocalStorage | ❌ 大多不支持 |
| 图片处理 | ✅ 压缩/旋转/滤镜 | ⚠️ 需插件 |
| 视频处理 | ✅ 封面/元数据 | ❌ 不支持 |
| 云存储 | ✅ 适配器系统 | ⚠️ 有限支持 |
| Vue 3 | ✅ 组件+Composable | ⚠️ 仅组件 |
| React | ✅ 组件+Hook | ⚠️ 仅组件 |
| TypeScript | ✅ 100% | ⚠️ 部分 |
| 文档 | ✅ 2,500+ 行 | ⚠️ 简单 |
| 示例 | ✅ 3 个项目 | ⚠️ 单一 |

---

## 快速开始

### 1. 安装

```bash
pnpm add @ldesign/upload
```

### 2. 基础使用（3 行代码）

```typescript
import { Uploader } from '@ldesign/upload'
import '@ldesign/upload/dist/style.css'

new Uploader({ container: '#app', endpoint: '/api/upload' })
```

### 3. 查看效果

上传界面立即出现，支持点击和拖拽！

---

## 核心概念

### 1. Uploader 核心类

主类，协调所有功能：

```typescript
const uploader = new Uploader({
  container: '#uploader',    // 容器
  endpoint: '/api/upload',   // 上传端点
  autoUpload: true,          // 自动上传
})
```

### 2. 文件生命周期

```
选择文件 → 验证 → 添加队列 → 上传 → 完成
         ↓                    ↓
      验证失败              上传失败 → 重试
```

### 3. 事件驱动

```typescript
uploader.on('fileAdded', file => {})      // 文件添加
uploader.on('uploadProgress', event => {}) // 上传进度
uploader.on('uploadSuccess', (id, res) => {}) // 上传成功
```

### 4. 分片上传

```
大文件 (50MB)
    ↓
分片 (5MB × 10)
    ↓
并发上传 (3 个同时)
    ↓
合并完成
```

---

## 完整示例

### 示例 1: 基础上传

```typescript
import { Uploader } from '@ldesign/upload'

const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload',
  validation: {
    accept: 'image/*,video/*',
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5
  }
})
```

### 示例 2: 图片压缩

```typescript
const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload',
  imageProcess: {
    compress: true,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp'
  }
})
```

### 示例 3: 分片上传

```typescript
const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload',
  chunked: true,
  chunkSize: 5 * 1024 * 1024,  // 5MB 分片
  concurrent: 3,                // 3 个并发
  retries: 3                    // 失败重试 3 次
})
```

### 示例 4: 云存储 (S3)

```typescript
import { BaseStorageAdapter } from '@ldesign/upload/adapters'

class S3Adapter extends BaseStorageAdapter {
  name = 's3'
  async upload(file, options) {
    const url = await this.getPresignedUrl(file)
    await fetch(url, { method: 'PUT', body: file })
    return { success: true, url: url.split('?')[0] }
  }
}

const uploader = new Uploader({
  adapter: new S3Adapter()
})
```

---

## 高级特性

### 批量操作

```typescript
import { BatchProcessor } from '@ldesign/upload'

const processor = new BatchProcessor()

// 批量压缩
const results = await processor.batchCompress(files)

// 按类型分组
const groups = processor.groupFilesByType(files)

// 排序
const sorted = processor.sortFilesBySize(files)
```

### 错误处理

```typescript
import { ErrorHandler } from '@ldesign/upload'

const errorHandler = new ErrorHandler(3)

const { shouldRetry, retryDelay } = errorHandler.handleError(error, fileId)

if (shouldRetry) {
  setTimeout(() => uploader.retry(fileId), retryDelay)
}
```

### 上传历史

```typescript
import { UploadHistory } from '@ldesign/upload'

const history = new UploadHistory()

// 添加记录
history.addItem({ fileName, fileSize, fileType, success: true })

// 查询
const recent = history.getRecentUploads(10)
const stats = history.getStats()
```

---

## 框架集成

### Vue 3 完整用法

#### 组件方式

```vue
<template>
  <VueUploader
    endpoint="/api/upload"
    :chunked="true"
    :auto-upload="false"
    accept="image/*"
    :max-size="10 * 1024 * 1024"
    @file-added="onFileAdded"
    @upload-progress="onProgress"
    @upload-success="onSuccess"
  />
</template>

<script setup lang="ts">
import { VueUploader } from '@ldesign/upload/vue'
import '@ldesign/upload/dist/style.css'

const onFileAdded = (file) => console.log('Added:', file)
const onProgress = (event) => console.log('Progress:', event.progress)
const onSuccess = (id, res) => console.log('Success:', res)
</script>
```

#### Composable 方式

```vue
<template>
  <div ref="container"></div>
  <div v-for="file in files" :key="file.id">
    {{ file.file.name }} - {{ file.progress }}%
    <button @click="pause(file.id)">暂停</button>
    <button @click="resume(file.id)">恢复</button>
  </div>
  <button @click="uploadAll">上传全部</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUploader } from '@ldesign/upload/vue'

const container = ref()

const { 
  files, 
  stats,
  uploadAll, 
  pause, 
  resume 
} = useUploader({
  container,
  endpoint: '/api/upload'
})
</script>
```

#### 指令方式

```vue
<template>
  <div v-uploader="uploaderOptions"></div>
</template>

<script setup lang="ts">
import { vUploader } from '@ldesign/upload/vue'

const uploaderOptions = {
  endpoint: '/api/upload',
  autoUpload: true
}
</script>
```

### React 完整用法

#### 组件方式

```tsx
import { ReactUploader } from '@ldesign/upload/react'
import '@ldesign/upload/dist/style.css'

function App() {
  const handleSuccess = (fileId, response) => {
    console.log('Success:', response)
  }

  return (
    <ReactUploader
      endpoint="/api/upload"
      chunked={true}
      autoUpload={false}
      validation={{ accept: 'image/*', maxSize: 10 * 1024 * 1024 }}
      onFileAdded={(file) => console.log('Added:', file)}
      onUploadProgress={(event) => console.log('Progress:', event.progress)}
      onUploadSuccess={handleSuccess}
    />
  )
}
```

#### Hook 方式

```tsx
import { useRef } from 'react'
import { useUploader } from '@ldesign/upload/react'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { 
    files, 
    stats,
    uploadAll, 
    pause, 
    resume 
  } = useUploader({
    container: containerRef,
    endpoint: '/api/upload'
  })

  return (
    <div>
      <div ref={containerRef}></div>
      {files.map(file => (
        <div key={file.id}>
          {file.file.name} - {file.progress}%
          <button onClick={() => pause(file.id)}>暂停</button>
          <button onClick={() => resume(file.id)}>恢复</button>
        </div>
      ))}
      <button onClick={uploadAll}>上传全部</button>
    </div>
  )
}
```

#### Ref 控制方式

```tsx
import { useRef } from 'react'
import { ReactUploader, type ReactUploaderRef } from '@ldesign/upload/react'

function App() {
  const uploaderRef = useRef<ReactUploaderRef>(null)

  return (
    <div>
      <ReactUploader ref={uploaderRef} endpoint="/api/upload" />
      <button onClick={() => uploaderRef.current?.uploadAll()}>
        上传全部
      </button>
      <button onClick={() => uploaderRef.current?.clear()}>
        清空
      </button>
    </div>
  )
}
```

---

## 云存储集成

### AWS S3

```typescript
class S3Adapter extends BaseStorageAdapter {
  async upload(file, options) {
    // 1. 获取预签名 URL
    const presignedUrl = await getPresignedUrlFromBackend(file)
    
    // 2. 直接上传到 S3
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    })
    
    return { success: response.ok, url: presignedUrl.split('?')[0] }
  }
}
```

### 阿里云 OSS

```typescript
import OSS from 'ali-oss'

class OSSAdapter extends BaseStorageAdapter {
  constructor(config) {
    super()
    this.client = new OSS(config)
  }
  
  async upload(file, options) {
    const result = await this.client.put(file.name, file, {
      progress: (p) => options.onProgress?.(p * 100)
    })
    return { success: true, url: result.url }
  }
}
```

---

## API 参考

### 核心方法

```typescript
// 文件管理
uploader.addFile(file)              // 添加单个文件
uploader.addFiles(files)            // 添加多个文件
uploader.removeFile(fileId)         // 移除文件
uploader.getFile(fileId)            // 获取文件
uploader.getFiles()                 // 获取所有文件
uploader.clear()                    // 清空所有

// 上传控制
uploader.uploadFile(fileId)         // 上传指定文件
uploader.uploadAll()                // 上传全部
uploader.pause(fileId)              // 暂停
uploader.resume(fileId)             // 恢复
uploader.cancel(fileId)             // 取消
uploader.retry(fileId)              // 重试

// UI 控制
uploader.openFilePicker()           // 打开文件选择器
uploader.enable()                   // 启用
uploader.disable()                  // 禁用

// 工具方法
uploader.getStats()                 // 获取统计
uploader.destroy()                  // 销毁实例
```

### 核心事件

```typescript
uploader.on('fileAdded', file => {})
uploader.on('fileRemoved', fileId => {})
uploader.on('uploadStart', fileId => {})
uploader.on('uploadProgress', event => {})
uploader.on('uploadSuccess', (fileId, response) => {})
uploader.on('uploadError', (fileId, error) => {})
uploader.on('uploadComplete', () => {})
uploader.on('validationError', ({ file, error }) => {})
```

---

## 最佳实践

### 1. 文件验证

```typescript
const uploader = new Uploader({
  validation: {
    // 类型限制
    accept: 'image/jpeg,image/png,image/webp',
    
    // 大小限制
    maxSize: 10 * 1024 * 1024,  // 10MB
    minSize: 1024,              // 1KB
    
    // 数量限制
    maxFiles: 5,
    maxTotalSize: 50 * 1024 * 1024, // 50MB
    
    // 图片尺寸
    minWidth: 100,
    maxWidth: 4000,
    minHeight: 100,
    maxHeight: 4000,
    
    // 自定义验证
    validator: async (file) => {
      // 你的验证逻辑
      return file.name.length < 100
    }
  }
})
```

### 2. 错误处理

```typescript
uploader.on('uploadError', (fileId, error) => {
  console.error('Upload failed:', error.message)
  
  // 自动重试
  if (error.retryable) {
    setTimeout(() => {
      uploader.retry(fileId)
    }, 5000)
  } else {
    // 显示错误给用户
    alert(`上传失败: ${error.message}`)
  }
})
```

### 3. 进度显示

```typescript
uploader.on('uploadProgress', (event) => {
  const { progress, speed, timeRemaining } = event
  
  console.log(`进度: ${progress.toFixed(1)}%`)
  console.log(`速度: ${formatSpeed(speed)}`)
  console.log(`剩余: ${formatTime(timeRemaining)}`)
})
```

### 4. 图片优化

```typescript
const uploader = new Uploader({
  imageProcess: {
    // 自动压缩
    compress: true,
    quality: 0.8,
    
    // 尺寸限制
    maxWidth: 1920,
    maxHeight: 1080,
    
    // 格式转换
    format: 'webp',
    
    // 旋转（如果需要）
    rotate: 0,
    
    // 滤镜（可选）
    filters: [
      { type: 'brightness', value: 0.1 }
    ]
  }
})
```

### 5. 大文件上传

```typescript
const uploader = new Uploader({
  // 启用分片
  chunked: true,
  chunkSize: 5 * 1024 * 1024,  // 5MB per chunk
  
  // 并发控制
  concurrent: 3,
  
  // 失败重试
  retries: 3,
  
  // 超时设置
  timeout: 60000  // 60 秒
})
```

---

## 常见问题

### Q1: 如何自定义样式？

```css
:root {
  --uploader-primary-color: #your-color;
  --uploader-border-radius: 12px;
}
```

### Q2: 如何实现秒传？

```typescript
// 计算文件 MD5
import { hash } from '@ldesign/crypto'

const md5 = await hash.md5(fileBuffer)

// 发送到服务器检查
const exists = await checkFileExists(md5)

if (exists) {
  // 文件已存在，秒传
  uploader.emit('uploadSuccess', fileId, { url: exists.url })
}
```

### Q3: 如何限制上传速度？

```typescript
// 使用限速适配器
class ThrottledAdapter extends HTTPAdapter {
  private maxSpeed = 1024 * 1024 // 1MB/s
  
  async upload(file, options) {
    // 实现限速逻辑
  }
}
```

### Q4: 如何处理大量文件？

```typescript
// 使用虚拟滚动
const uploader = new Uploader({
  showDashboard: false  // 禁用内置 UI
})

// 使用 vue-virtual-scroller 或 react-window
```

### Q5: 如何集成到表单？

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <VueUploader ref="uploaderRef" :auto-upload="false" />
    <button type="submit">提交表单</button>
  </form>
</template>

<script setup>
const uploaderRef = ref()

const handleSubmit = async () => {
  // 先上传文件
  await uploaderRef.value.uploadAll()
  
  // 获取上传结果
  const files = uploaderRef.value.getFiles()
  const urls = files.map(f => f.metadata?.url)
  
  // 提交表单
  await submitForm({ fileUrls: urls })
}
</script>
```

---

## 🎓 学习资源

### 文档阅读顺序

1. **START_HERE.md** ← 你在这里
2. **QUICK_START.md** - 5 分钟上手
3. **README.md** - 完整功能介绍
4. **API.md** - API 详细参考
5. **CLOUD_STORAGE_GUIDE.md** - 云存储集成
6. **ADVANCED_FEATURES.md** - 高级功能

### 示例学习顺序

1. **Vanilla JS** - 理解核心 API
2. **Vue 或 React** - 学习框架集成
3. **修改代码** - 动手实践

---

## 🚀 下一步

### 初学者
1. ✅ 运行一个示例
2. ✅ 阅读 QUICK_START
3. ✅ 在项目中使用

### 进阶者
1. ✅ 阅读 API 文档
2. ✅ 学习云存储集成
3. ✅ 实现自定义适配器

### 专家
1. ✅ 阅读源码
2. ✅ 贡献代码
3. ✅ 创建插件

---

<div align="center">

**准备好开始了吗？** 🚀

[运行示例](./RUN_EXAMPLES.md) | [查看 API](./docs/API.md) | [贡献代码](./CONTRIBUTING.md)

</div>

