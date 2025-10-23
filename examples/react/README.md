# React Example

## 🚀 快速开始

```bash
pnpm install
pnpm dev
```

访问: http://localhost:5175

---

## 📋 示例内容

### 1. ReactUploader 组件
使用 Props 和 Ref 的组件方式

### 2. useUploader Hook
使用 Hook 的方式，更灵活的状态管理

### 3. 图片压缩
自动压缩图片后上传

### 4. 分片上传
支持 100MB 大文件上传

### 5. 拖拽区
拖拽和粘贴支持

### 6. 深色主题
Dark mode 支持

---

## 💡 代码说明

### 使用组件

```tsx
import { ReactUploader } from '@ldesign/upload/react'

function App() {
  return (
    <ReactUploader
      endpoint="/api/upload"
      autoUpload={true}
      onUploadSuccess={(fileId, response) => {
        console.log('上传成功！', response)
      }}
    />
  )
}
```

### 使用 Hook

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
      <button onClick={uploadAll}>上传全部</button>
    </div>
  )
}
```

### 使用 Ref 控制

```tsx
import { useRef } from 'react'
import { ReactUploader, type ReactUploaderRef } from '@ldesign/upload/react'

function App() {
  const uploaderRef = useRef<ReactUploaderRef>(null)
  
  const handleUploadAll = () => {
    uploaderRef.current?.uploadAll()
  }

  return (
    <div>
      <ReactUploader ref={uploaderRef} endpoint="/api/upload" />
      <button onClick={handleUploadAll}>上传全部</button>
    </div>
  )
}
```

---

## 🔧 修改示例

编辑 `src/App.tsx`，保存后自动热更新。

---

**Enjoy React!** ⚛️

