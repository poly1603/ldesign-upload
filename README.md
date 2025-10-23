# @ldesign/upload

<div align="center">

# 📤 @ldesign/upload

**功能强大、可在任意框架中使用的文件上传插件**

[![Version](https://img.shields.io/npm/v/@ldesign/upload)](https://www.npmjs.com/package/@ldesign/upload)
[![License](https://img.shields.io/npm/l/@ldesign/upload)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue)](./tsconfig.json)
[![Bundle Size](https://img.shields.io/badge/Bundle-~35KB-success)]()

[功能特性](#-功能特性) | [快速开始](#-快速开始) | [示例演示](#-示例演示) | [文档](#-文档) | [GitHub](#)

</div>

---

## ✨ 功能特性

### 🚀 核心上传能力
- ✅ **多种上传方式**: 点击、拖拽、粘贴、文件夹上传
- ✅ **分片上传**: 大文件切片上传，默认 5MB/片
- ✅ **断点续传**: 网络中断后自动恢复，进度持久化
- ✅ **并发控制**: 可配置同时上传数量（默认 3 个）
- ✅ **优先级队列**: 支持文件上传优先级
- ✅ **暂停/恢复/取消**: 完整的上传控制

### 📊 进度与状态
- ✅ **实时进度**: 0-100% 精确进度
- ✅ **上传速度**: 移动平均算法计算
- ✅ **剩余时间**: 智能估算
- ✅ **全局统计**: 多文件总体进度

### 🔍 文件验证
- ✅ **类型验证**: MIME 类型 + 文件扩展名
- ✅ **大小验证**: 单文件、总大小限制
- ✅ **尺寸验证**: 图片宽高验证
- ✅ **自定义验证器**: 支持异步验证

### 🖼️ 图片处理
- ✅ **智能压缩**: 质量、尺寸可调
- ✅ **旋转翻转**: 90°、180°、270°
- ✅ **图片滤镜**: 5 种内置滤镜
- ✅ **格式转换**: JPEG、PNG、WebP
- ✅ **缩略图**: 自动生成

### 🎥 视频处理
- ✅ **封面提取**: 指定时间截图
- ✅ **元数据解析**: 时长、分辨率
- ✅ **视频预览**: 内置播放器

### ☁️ 云存储集成
- ✅ **插件化架构**: 可扩展适配器系统
- ✅ **HTTP 适配器**: 内置标准上传
- ✅ **完整文档**: S3/OSS/COS/KODO 集成示例

### 🎨 精美 UI
- ✅ **现代化设计**: 精美的默认样式
- ✅ **主题系统**: Light/Dark 模式
- ✅ **响应式**: 完美支持移动端
- ✅ **流畅动画**: 进度条、状态切换

### 🔌 框架支持
- ✅ **Vanilla JS**: 零依赖核心库
- ✅ **Vue 3**: 组件 + Composable + 指令
- ✅ **React**: 组件 + Hook
- ✅ **Angular**: 组件（即将推出）

### 💻 开发体验
- ✅ **TypeScript**: 100% 类型安全
- ✅ **Tree-shaking**: 按需导入
- ✅ **零配置**: 开箱即用
- ✅ **详细文档**: 3000+ 行文档

---

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/upload

# 使用 npm
npm install @ldesign/upload

# 使用 yarn
yarn add @ldesign/upload
```

---

## 🚀 快速开始

### Vanilla JavaScript

```typescript
import { Uploader } from '@ldesign/upload'
import '@ldesign/upload/dist/style.css'

const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload',
  autoUpload: true,
  validation: {
    accept: 'image/*,video/*',
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  }
})

uploader.on('uploadSuccess', (fileId, response) => {
  console.log('上传成功！', response)
})
```

### Vue 3

```vue
<template>
  <VueUploader
    endpoint="/api/upload"
    :auto-upload="true"
    accept="image/*"
    :max-size="10 * 1024 * 1024"
    @upload-success="onSuccess"
  />
</template>

<script setup lang="ts">
import { VueUploader } from '@ldesign/upload/vue'
import '@ldesign/upload/dist/style.css'

const onSuccess = (fileId: string, response: any) => {
  console.log('上传成功！', response)
}
</script>
```

### React

```tsx
import { ReactUploader } from '@ldesign/upload/react'
import '@ldesign/upload/dist/style.css'

function App() {
  return (
    <ReactUploader
      endpoint="/api/upload"
      autoUpload={true}
      validation={{ accept: 'image/*', maxSize: 10 * 1024 * 1024 }}
      onUploadSuccess={(fileId, response) => {
        console.log('上传成功！', response)
      }}
    />
  )
}
```

---

## 🎯 示例演示

我们提供了 **3 个完整的示例项目**，展示所有功能：

### 1. Vanilla JavaScript 示例

```bash
cd libraries/upload/examples/vanilla
pnpm install && pnpm dev
```
🌐 访问: http://localhost:5173

### 2. Vue 3 示例

```bash
cd libraries/upload/examples/vue
pnpm install && pnpm dev
```
🌐 访问: http://localhost:5174

**包含 6 个完整示例**:
- VueUploader 组件
- useUploader Composable
- 图片压缩
- 分片上传
- 拖拽区
- 深色主题

### 3. React 示例

```bash
cd libraries/upload/examples/react
pnpm install && pnpm dev
```
🌐 访问: http://localhost:5175

**包含 6 个完整示例**:
- ReactUploader 组件
- useUploader Hook
- 图片压缩
- 分片上传
- 拖拽区
- 深色主题

---

## 💡 高级用法

### 分片上传 + 断点续传

```typescript
const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload',
  chunked: true,
  chunkSize: 5 * 1024 * 1024, // 5MB 分片
  concurrent: 3, // 同时上传 3 个分片
  retries: 3, // 失败重试 3 次
})
```

### 自定义云存储适配器

```typescript
import { BaseStorageAdapter } from '@ldesign/upload/adapters'

class S3Adapter extends BaseStorageAdapter {
  name = 's3'
  
  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    const presignedUrl = await this.getPresignedUrl(file)
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file
    })
    return { success: response.ok, url: presignedUrl.split('?')[0] }
  }
}

const uploader = new Uploader({
  adapter: new S3Adapter()
})
```

### 图片自动压缩

```typescript
const uploader = new Uploader({
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

### 批量操作

```typescript
import { BatchProcessor } from '@ldesign/upload'

const processor = new BatchProcessor()

// 批量压缩所有图片
const results = await processor.batchCompress(files, {
  quality: 0.8,
  maxWidth: 1920
})

// 按类型分组
const groups = processor.groupFilesByType(files)
console.log('Images:', groups.get('image')?.length)

// 排序
const sortedBySize = processor.sortFilesBySize(files, false)
```

---

## 📚 文档

### 核心文档
- [快速开始指南](./QUICK_START.md) - 5 分钟上手
- [API 文档](./docs/API.md) - 完整 API 参考
- [云存储集成](./docs/CLOUD_STORAGE_GUIDE.md) - S3/OSS/COS 集成
- [高级功能](./docs/ADVANCED_FEATURES.md) - 批量操作、错误处理、历史记录

### 示例项目
- [运行示例指南](./RUN_EXAMPLES.md) - 如何运行所有示例
- [示例目录](./examples/README.md) - 示例概览

### 开发文档
- [贡献指南](./CONTRIBUTING.md) - 如何贡献代码
- [更新日志](./CHANGELOG.md) - 版本历史

---

## 🎨 自定义样式

使用 CSS 变量自定义主题：

```css
:root {
  --uploader-primary-color: #3b82f6;
  --uploader-success-color: #10b981;
  --uploader-error-color: #ef4444;
  --uploader-border-radius: 8px;
  --uploader-font-family: system-ui, sans-serif;
}
```

---

## 📊 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

---

## 🏗️ 技术架构

```
@ldesign/upload
├── 核心层 (Vanilla JS)
│   ├── Uploader - 主类
│   ├── FileManager - 队列管理
│   ├── ChunkManager - 分片管理
│   ├── ValidationManager - 验证
│   ├── ProgressTracker - 进度
│   └── InteractionManager - 交互
├── 处理器层
│   ├── ImageProcessor - 图片处理
│   └── VideoProcessor - 视频处理
├── 适配器层
│   ├── HTTPAdapter - HTTP 上传
│   └── BaseStorageAdapter - 云存储基类
├── UI 层
│   ├── Dashboard - 主面板
│   ├── FileItem - 文件项
│   └── DropZone - 拖拽区
└── 框架适配层
    ├── Vue 3 - 组件 + Composable
    └── React - 组件 + Hook
```

---

## 📈 性能

- **Bundle 大小**: ~35KB (gzipped, 核心 + UI)
- **Tree-shakeable**: 按需导入，更小体积
- **零依赖**: 核心库无外部依赖
- **高性能**: 移动平均算法、断点续传

---

## 🤝 贡献

欢迎贡献！请阅读 [贡献指南](./CONTRIBUTING.md)。

---

## 📄 许可证

MIT © LDesign Team

---

## 🔗 相关链接

- [GitHub 仓库](#)
- [问题反馈](#)
- [讨论区](#)
- [LDesign 官网](#)

---

## 🌟 Star History

如果这个项目对您有帮助，请给我们一个 ⭐️！

---

**Built with ❤️ by LDesign Team**
