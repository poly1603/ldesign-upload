# 🚀 @ldesign/upload - 快速启动指南

## 📖 目录

- [立即运行示例](#立即运行示例)
- [在项目中使用](#在项目中使用)
- [API 快速参考](#api-快速参考)
- [常见问题](#常见问题)

---

## 🎯 立即运行示例

### 方式 1: Vanilla JavaScript 示例

```bash
cd libraries/upload/examples/vanilla
pnpm install
pnpm dev
```

打开浏览器访问: **http://localhost:5173**

**示例包含:**
- ✅ 基础上传
- ✅ 图片压缩
- ✅ 拖拽上传
- ✅ 进度跟踪
- ✅ 事件日志

---

### 方式 2: Vue 3 示例

```bash
cd libraries/upload/examples/vue
pnpm install
pnpm dev
```

打开浏览器访问: **http://localhost:5174**

**示例包含:**
- ✅ VueUploader 组件用法
- ✅ useUploader Composable 用法
- ✅ 图片压缩示例
- ✅ 分片上传示例
- ✅ 拖拽区示例
- ✅ 深色主题示例

---

### 方式 3: React 示例

```bash
cd libraries/upload/examples/react
pnpm install
pnpm dev
```

打开浏览器访问: **http://localhost:5175**

**示例包含:**
- ✅ ReactUploader 组件用法
- ✅ useUploader Hook 用法
- ✅ 图片压缩示例
- ✅ 分片上传示例
- ✅ 拖拽区示例
- ✅ 深色主题示例

---

## 💻 在项目中使用

### Vanilla JavaScript

```bash
npm install @ldesign/upload
```

```typescript
import { Uploader } from '@ldesign/upload'
import '@ldesign/upload/dist/style.css'

const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload',
  autoUpload: true,
  validation: {
    accept: 'image/*',
    maxSize: 10 * 1024 * 1024 // 10MB
  }
})

uploader.on('uploadSuccess', (fileId, response) => {
  console.log('Uploaded!', response)
})
```

---

### Vue 3

```bash
npm install @ldesign/upload
```

**选项 1: 使用组件**

```vue
<template>
  <VueUploader
    endpoint="/api/upload"
    :auto-upload="true"
    accept="image/*"
    @upload-success="onSuccess"
  />
</template>

<script setup lang="ts">
import { VueUploader } from '@ldesign/upload/vue'
import '@ldesign/upload/dist/style.css'

const onSuccess = (fileId: string, response: any) => {
  console.log('Uploaded!', response)
}
</script>
```

**选项 2: 使用 Composable**

```vue
<template>
  <div ref="container"></div>
  <button @click="uploadAll">Upload All</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUploader } from '@ldesign/upload/vue'

const container = ref<HTMLElement>()

const { files, uploadAll } = useUploader({
  container,
  endpoint: '/api/upload'
})
</script>
```

---

### React

```bash
npm install @ldesign/upload
```

**选项 1: 使用组件**

```tsx
import { ReactUploader } from '@ldesign/upload/react'
import '@ldesign/upload/dist/style.css'

function App() {
  return (
    <ReactUploader
      endpoint="/api/upload"
      autoUpload={true}
      validation={{ accept: 'image/*' }}
      onUploadSuccess={(fileId, response) => {
        console.log('Uploaded!', response)
      }}
    />
  )
}
```

**选项 2: 使用 Hook**

```tsx
import { useRef } from 'react'
import { useUploader } from '@ldesign/upload/react'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { files, uploadAll } = useUploader({
    container: containerRef,
    endpoint: '/api/upload'
  })

  return (
    <div>
      <div ref={containerRef}></div>
      <button onClick={uploadAll}>Upload All</button>
    </div>
  )
}
```

---

## 📚 API 快速参考

### 配置选项

```typescript
{
  // 基础配置
  container: '#uploader',           // 容器选择器
  endpoint: '/api/upload',          // 上传端点
  autoUpload: false,                // 自动上传
  
  // 验证规则
  validation: {
    accept: 'image/*,video/*',      // 接受的文件类型
    maxSize: 10 * 1024 * 1024,      // 最大文件大小
    maxFiles: 5,                    // 最大文件数量
  },
  
  // 分片配置
  chunked: true,                    // 启用分片
  chunkSize: 5 * 1024 * 1024,       // 分片大小 (5MB)
  concurrent: 3,                    // 并发上传数
  retries: 3,                       // 重试次数
  
  // 图片处理
  imageProcess: {
    compress: true,                 // 压缩
    quality: 0.8,                   // 质量
    maxWidth: 1920,                 // 最大宽度
    maxHeight: 1080,                // 最大高度
  },
  
  // UI 配置
  theme: 'light',                   // 主题 (light/dark/auto)
  mode: 'inline',                   // 模式 (inline/compact/modal)
  dragDrop: true,                   // 拖拽上传
  paste: true,                      // 粘贴上传
}
```

### 方法

```typescript
uploader.addFile(file)              // 添加文件
uploader.uploadFile(fileId)         // 上传文件
uploader.uploadAll()                // 上传全部
uploader.pause(fileId)              // 暂停
uploader.resume(fileId)             // 恢复
uploader.cancel(fileId)             // 取消
uploader.retry(fileId)              // 重试
uploader.removeFile(fileId)         // 删除
uploader.clear()                    // 清空
uploader.openFilePicker()           // 打开文件选择器
uploader.getFiles()                 // 获取所有文件
uploader.getStats()                 // 获取统计信息
```

### 事件

```typescript
uploader.on('fileAdded', (file) => {})
uploader.on('uploadProgress', (event) => {})
uploader.on('uploadSuccess', (fileId, response) => {})
uploader.on('uploadError', (fileId, error) => {})
uploader.on('uploadComplete', () => {})
```

---

## ❓ 常见问题

### Q: 如何上传到云存储 (S3/OSS/COS)?

A: 创建自定义适配器：

```typescript
import { BaseStorageAdapter } from '@ldesign/upload/adapters'

class S3Adapter extends BaseStorageAdapter {
  async upload(file, options) {
    // 实现 S3 上传逻辑
  }
}

const uploader = new Uploader({
  adapter: new S3Adapter()
})
```

详见: [云存储集成指南](./docs/CLOUD_STORAGE_GUIDE.md)

---

### Q: 如何自定义 UI 样式?

A: 使用 CSS 变量覆盖：

```css
:root {
  --uploader-primary-color: #ff6b6b;
  --uploader-border-radius: 12px;
}
```

---

### Q: 如何处理大文件上传?

A: 启用分片上传：

```typescript
const uploader = new Uploader({
  chunked: true,
  chunkSize: 5 * 1024 * 1024, // 5MB
  concurrent: 3,
  retries: 3
})
```

---

### Q: 如何在 Vue/React 中使用?

A: 查看对应的示例项目：

- Vue: `examples/vue/`
- React: `examples/react/`

---

## 📖 更多资源

- [完整文档](./README.md)
- [API 参考](./docs/API.md)
- [云存储指南](./docs/CLOUD_STORAGE_GUIDE.md)
- [更新日志](./CHANGELOG.md)

---

**享受使用 @ldesign/upload！** 🎉

