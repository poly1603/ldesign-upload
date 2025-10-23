# Vue 3 Example

## 🚀 快速开始

```bash
pnpm install
pnpm dev
```

访问: http://localhost:5174

---

## 📋 示例内容

### 1. VueUploader 组件
使用 Props 和事件的组件方式

### 2. useUploader Composable
使用组合式 API 的方式，更灵活的控制

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

```vue
<template>
  <VueUploader
    endpoint="/api/upload"
    :auto-upload="true"
    @upload-success="onSuccess"
  />
</template>

<script setup lang="ts">
import { VueUploader } from '@ldesign/upload/vue'

const onSuccess = (fileId, response) => {
  console.log('上传成功！', response)
}
</script>
```

### 使用 Composable

```vue
<template>
  <div ref="container"></div>
  <button @click="uploadAll">上传全部</button>
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

### 使用指令

```vue
<template>
  <div v-uploader="{ endpoint: '/api/upload' }"></div>
</template>

<script setup lang="ts">
import { vUploader } from '@ldesign/upload/vue'
</script>
```

---

## 🔧 修改示例

编辑 `src/App.vue`，保存后自动热更新。

---

**Enjoy Vue 3!** 💚

