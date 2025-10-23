# 👋 开始使用 @ldesign/upload

## 🎯 你想做什么？

### 1️⃣ 快速查看效果（推荐）

**运行任意一个示例项目**：

```bash
# 选择一个示例
cd examples/vanilla   # 或 vue 或 react
pnpm install
pnpm dev
```

然后在浏览器中打开显示的地址（通常是 localhost:5173）

---

### 2️⃣ 5 分钟学会使用

阅读 [QUICK_START.md](./QUICK_START.md)

包含：
- 基础用法
- Vue 用法
- React 用法
- 常见问题

---

### 3️⃣ 在我的项目中使用

#### Vanilla JavaScript
```typescript
import { Uploader } from '@ldesign/upload'
import '@ldesign/upload/dist/style.css'

const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload',
  autoUpload: true
})
```

#### Vue 3
```vue
<template>
  <VueUploader endpoint="/api/upload" />
</template>

<script setup>
import { VueUploader } from '@ldesign/upload/vue'
</script>
```

#### React
```tsx
import { ReactUploader } from '@ldesign/upload/react'

<ReactUploader endpoint="/api/upload" />
```

---

### 4️⃣ 深入学习 API

阅读 [API.md](./docs/API.md)

包含：
- 完整配置选项
- 所有方法说明
- 事件列表
- 类型定义

---

### 5️⃣ 集成云存储

阅读 [CLOUD_STORAGE_GUIDE.md](./docs/CLOUD_STORAGE_GUIDE.md)

包含：
- AWS S3 集成
- 阿里云 OSS 集成
- 腾讯云 COS 集成
- 七牛云 KODO 集成

---

### 6️⃣ 学习高级功能

阅读 [ADVANCED_FEATURES.md](./docs/ADVANCED_FEATURES.md)

包含：
- 批量操作
- 错误处理
- 上传历史
- 性能优化

---

## 🚦 推荐学习路径

### 新手路径
1. 运行 Vanilla JS 示例 (5 分钟)
2. 阅读 QUICK_START.md (5 分钟)
3. 在项目中使用 (10 分钟)

### 进阶路径
1. 运行 Vue/React 示例 (10 分钟)
2. 阅读 API.md (20 分钟)
3. 学习云存储集成 (15 分钟)
4. 研究高级功能 (20 分钟)

### 专家路径
1. 阅读源码 (src/)
2. 运行测试 (pnpm test)
3. 创建自定义适配器
4. 贡献代码

---

## 📞 需要帮助？

- 📖 查看 [README.md](./README.md)
- 💡 查看 [示例](./examples/)
- 🐛 [报告问题](#)
- 💬 [讨论区](#)

---

**开始你的上传之旅吧！** 🚀

