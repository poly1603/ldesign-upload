# Vanilla JavaScript Example

## 🚀 快速开始

```bash
pnpm install
pnpm dev
```

访问: http://localhost:5173

---

## 📋 示例内容

### 1. 基础上传
- 拖拽上传
- 点击上传
- 文件验证
- 进度显示

### 2. 图片压缩
- 自动压缩
- 质量控制
- 尺寸限制

### 3. API 参考
- 配置选项
- 方法调用
- 事件监听

---

## 💡 代码说明

```typescript
// 创建上传实例
const uploader = new Uploader({
  container: '#uploader',
  endpoint: '/api/upload',
  autoUpload: false,
  validation: {
    accept: '*',
    maxSize: 50 * 1024 * 1024,
    maxFiles: 10
  }
})

// 监听事件
uploader.on('fileAdded', (file) => {
  console.log('文件添加:', file.file.name)
})

uploader.on('uploadProgress', (event) => {
  console.log('上传进度:', event.progress + '%')
})
```

---

## 🔧 修改示例

直接编辑 `index.html`，保存后自动刷新。

---

**Enjoy!** 🎉

