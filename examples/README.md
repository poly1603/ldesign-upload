# @ldesign/upload - Examples

这个目录包含了 @ldesign/upload 的完整使用示例。

## 📂 示例列表

### 1. Vanilla JavaScript 示例

**目录**: `vanilla/`

展示纯 JavaScript 的基础用法，无需任何框架。

**启动方式**:
```bash
cd vanilla
pnpm install
pnpm dev
```

**访问**: http://localhost:5173

**包含示例**:
- 基础文件上传
- 带图片压缩的上传
- 拖拽上传
- 进度跟踪
- 事件监听

---

### 2. Vue 3 示例

**目录**: `vue/`

展示 Vue 3 的组件和 Composable 用法。

**启动方式**:
```bash
cd vue
pnpm install
pnpm dev
```

**访问**: http://localhost:5174

**包含示例**:
1. VueUploader 组件用法
2. useUploader Composable 用法
3. 图片压缩
4. 分片上传 (大文件)
5. 拖拽区
6. 深色主题

---

### 3. React 示例

**目录**: `react/`

展示 React 的组件和 Hook 用法。

**启动方式**:
```bash
cd react
pnpm install
pnpm dev
```

**访问**: http://localhost:5175

**包含示例**:
1. ReactUploader 组件用法
2. useUploader Hook 用法
3. 图片压缩
4. 分片上传 (大文件)
5. 拖拽区
6. 深色主题

---

## 🎓 学习路径

### 新手推荐顺序：

1. **先看 Vanilla JS 示例** - 了解核心 API
2. **然后看 Vue 或 React 示例** - 学习框架集成
3. **阅读 API 文档** - 深入了解所有功能
4. **查看云存储指南** - 学习高级集成

---

## 📝 代码片段

### 基础用法

```typescript
import { Uploader } from '@ldesign/upload'

const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload'
})
```

### Vue 组件

```vue
<VueUploader
  endpoint="/api/upload"
  :auto-upload="true"
/>
```

### React 组件

```tsx
<ReactUploader
  endpoint="/api/upload"
  autoUpload={true}
/>
```

---

## 🔧 修改示例

所有示例都可以直接修改源码查看效果：

1. 编辑示例文件
2. 保存后自动热更新
3. 在浏览器中查看变化

---

## 🐛 遇到问题？

1. 检查控制台错误
2. 查看 [API 文档](../docs/API.md)
3. 查看 [完整 README](../README.md)

---

**Happy Coding!** 🎉

