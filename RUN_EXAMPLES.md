# 🚀 运行示例指南

## 快速启动所有示例

### 方式 1: 单独运行每个示例

#### Vanilla JavaScript 示例
```bash
cd libraries/upload/examples/vanilla
pnpm install
pnpm dev
```
🌐 访问: http://localhost:5173

#### Vue 3 示例
```bash
cd libraries/upload/examples/vue
pnpm install
pnpm dev
```
🌐 访问: http://localhost:5174

#### React 示例
```bash
cd libraries/upload/examples/react
pnpm install
pnpm dev
```
🌐 访问: http://localhost:5175

---

### 方式 2: 从根目录运行（推荐）

如果你在 `libraries/upload/` 目录下：

```bash
# 安装所有依赖
pnpm install

# 运行 Vanilla 示例
cd examples/vanilla && pnpm install && pnpm dev

# 或者 Vue 示例
cd examples/vue && pnpm install && pnpm dev

# 或者 React 示例
cd examples/react && pnpm install && pnpm dev
```

---

## 📋 示例清单

### 1. Vanilla JavaScript 示例 ✅

**文件**: `examples/vanilla/index.html`

**包含示例**:
- ✅ 基础上传（点击、拖拽）
- ✅ 带图片压缩的上传
- ✅ 事件监听和日志
- ✅ 统计信息显示
- ✅ API 参考代码

**特色**:
- 纯 JavaScript，无需编译
- 直接导入源码，支持热更新
- 完整的事件日志系统

---

### 2. Vue 3 示例 ✅

**文件**: `examples/vue/src/App.vue`

**包含示例**:
1. **VueUploader 组件** - 使用 Props 和事件
2. **useUploader Composable** - 响应式状态管理
3. **图片压缩** - 自动压缩后上传
4. **分片上传** - 大文件支持（100MB）
5. **拖拽区** - 拖拽和粘贴
6. **深色主题** - Dark mode 支持

**特色**:
- 完整的 TypeScript 支持
- 响应式数据绑定
- 组合式 API 演示
- 事件日志显示

---

### 3. React 示例 ✅

**文件**: `examples/react/src/App.tsx`

**包含示例**:
1. **ReactUploader 组件** - 使用 Props 和 Ref
2. **useUploader Hook** - 状态管理
3. **图片压缩** - 自动压缩后上传
4. **分片上传** - 大文件支持（100MB）
5. **拖拽区** - 拖拽和粘贴
6. **深色主题** - Dark mode 支持

**特色**:
- 完整的 TypeScript 支持
- Hooks 和 Ref 控制
- 函数式组件
- 事件日志显示

---

## 🎯 每个示例演示的功能

### 所有示例都包含：

✅ **文件选择**
- 点击上传按钮
- 拖拽文件到区域
- 粘贴文件（部分示例）

✅ **文件验证**
- 类型验证 (image/*, video/*)
- 大小验证 (10MB - 100MB)
- 数量限制

✅ **上传控制**
- 手动上传
- 自动上传
- 批量上传
- 暂停/恢复
- 取消/重试

✅ **进度显示**
- 单文件进度
- 上传速度
- 剩余时间
- 全局统计

✅ **图片处理**
- 自动压缩
- 质量控制
- 尺寸限制

✅ **分片上传**
- 5MB 分片
- 并发控制
- 断点续传

✅ **UI 主题**
- 明亮模式
- 深色模式
- 响应式布局

---

## 💡 使用技巧

### 1. 查看控制台
所有示例都会在控制台输出详细日志，打开浏览器开发者工具查看。

### 2. 修改代码
直接修改示例源码，Vite 会自动热更新。

### 3. 测试功能
- 拖拽文件到拖拽区
- 粘贴图片（在 Vue/React 示例中）
- 点击按钮手动控制上传
- 尝试暂停/恢复功能

### 4. 调试
示例都使用源码（不是编译后的），方便调试和学习。

---

## 🐛 故障排除

### 问题：端口已被占用

**解决**：修改 `vite.config.ts` 中的端口：
```typescript
export default defineConfig({
  server: {
    port: 3000 // 改成其他端口
  }
})
```

### 问题：模块解析失败

**解决**：确保已经安装依赖：
```bash
pnpm install
```

### 问题：上传失败

**原因**：示例使用的是模拟端点 `/api/upload`

**解决**：
1. 修改 `endpoint` 为你的真实 API
2. 或者使用本地 mock 服务器
3. 或者查看控制台了解上传流程

---

## 📚 下一步

1. **运行示例** - 了解所有功能
2. **阅读代码** - 学习实现细节
3. **查看文档** - [API.md](../docs/API.md)
4. **在项目中使用** - 开始集成

---

**开始探索吧！** 🎉

