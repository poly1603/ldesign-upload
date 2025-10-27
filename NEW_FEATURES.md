# 🎉 新功能发布说明

## 版本 1.1.0 - 高级功能包

本次更新为 `@ldesign/upload` 添加了 **6 大高级功能模块**,显著提升了上传库的能力和性能。

---

## ✨ 新增功能概览

### 1. 📦 文件去重检测 - `DuplicationDetector`

**智能检测重复文件,避免浪费带宽和存储空间**

- 内容哈希检测(MD5) - 100% 准确
- 元数据指纹检测 - 快速判断
- 自动缓存管理(LocalStorage)
- 可配置缓存大小和过期时间

```typescript
import { DuplicationDetector } from '@ldesign/upload'

const detector = new DuplicationDetector()
const { isDuplicate } = await detector.isDuplicate(file)
```

### 2. 🚦 上传速率限流 - `RateLimiter` & `AdaptiveRateLimiter`

**控制上传速度,防止占用过多带宽**

- 固定速率限流
- 自适应智能限流(根据网络状况自动调整)
- 网络质量评估
- 动态带宽分配

```typescript
import { AdaptiveRateLimiter } from '@ldesign/upload'

const limiter = new AdaptiveRateLimiter(2 * 1024 * 1024) // 2MB/s
await limiter.throttle(chunkSize)
```

### 3. ⚡ WebWorker 处理池 - `WorkerPool`

**多线程处理 CPU 密集任务,不阻塞主线程**

- 图片压缩(后台处理)
- 文件哈希计算
- 优先级任务队列
- 自动Worker数量管理

```typescript
import { getWorkerPool } from '@ldesign/upload'

const pool = getWorkerPool()
const compressed = await pool.compressImage(file, { quality: 0.8 })
```

### 4. 💾 离线缓存 - `OfflineCache`

**基于 IndexedDB 的持久化存储**

- 文件离线缓存
- 上传状态持久化
- 分片级别缓存
- 自动过期清理
- 离线上传队列

```typescript
import { OfflineCache } from '@ldesign/upload'

const cache = new OfflineCache()
await cache.init()
await cache.cacheFile(fileId, file)
```

### 5. 🔐 MD5 哈希计算

**集成 @ldesign/crypto,实现文件完整性校验**

- 文件级 MD5 计算
- 分片级 MD5 计算
- 支持秒传功能
- 完整性验证

```typescript
import { ChunkManager } from '@ldesign/upload'

const manager = new ChunkManager()
const hash = await manager.calculateFileHash(file)
```

### 6. 🖼️ 图片模糊滤镜

**完整实现图片模糊效果**

- 高斯模糊算法
- 可配置模糊半径
- 支持滤镜组合

```typescript
import { ImageProcessor } from '@ldesign/upload'

const processor = new ImageProcessor()
await processor.applyFilters(file, [{ type: 'blur', value: 10 }])
```

---

## 📊 性能提升

- ⚡ **非阻塞处理**: Worker池处理图片压缩,主线程流畅
- ⚡ **并行计算**: 多文件哈希并行计算
- ⚡ **智能缓存**: IndexedDB优化读写性能
- ⚡ **自适应限流**: 网络状况自动调整,充分利用带宽

---

## 🚀 快速开始

### 安装

```bash
pnpm add @ldesign/upload@^1.1.0
```

### 综合示例

```typescript
import {
  Uploader,
  DuplicationDetector,
  AdaptiveRateLimiter,
  getWorkerPool,
  OfflineCache
} from '@ldesign/upload'

// 初始化组件
const detector = new DuplicationDetector()
const limiter = new AdaptiveRateLimiter(2 * 1024 * 1024)
const pool = getWorkerPool()
const cache = new OfflineCache()

await Promise.all([pool.init(), cache.init()])

// 创建上传器
const uploader = new Uploader({
  endpoint: '/api/upload',
  onFileAdded: async (fileItem) => {
    // 1. 检测重复
    if ((await detector.isDuplicate(fileItem.file)).isDuplicate) {
      uploader.removeFile(fileItem.id)
      return
    }
    
    // 2. Worker 压缩图片
    if (fileItem.file.type.startsWith('image/')) {
      const compressed = await pool.compressImage(fileItem.file, {
        quality: 0.8
      })
      fileItem.file = new File([compressed], fileItem.file.name)
    }
    
    // 3. 缓存文件
    await cache.cacheFile(fileItem.id, fileItem.file)
  },
  onUploadProgress: async (event) => {
    await limiter.throttle(event.uploadedSize)
  }
})
```

---

## 📚 文档

- **完整指南**: [docs/ADVANCED_FEATURES_NEW.md](./docs/ADVANCED_FEATURES_NEW.md)
- **更新日志**: [CHANGELOG.md](./CHANGELOG.md)
- **API 文档**: [docs/API.md](./docs/API.md)

---

## 🎯 使用场景

### 场景 1: 企业文档管理系统
**需求**: 防止重复上传,节省存储成本
**方案**: `DuplicationDetector` + 秒传功能

### 场景 2: 移动端图片上传
**需求**: 限制带宽使用,不影响用户体验
**方案**: `AdaptiveRateLimiter` + `WorkerPool` 图片压缩

### 场景 3: 大文件断点续传
**需求**: 支持离线上传,网络中断后恢复
**方案**: `OfflineCache` + `ChunkManager` 分片管理

### 场景 4: 高并发图片处理
**需求**: 批量压缩图片不卡顿
**方案**: `WorkerPool` 多线程处理

---

## ⚠️ 兼容性

### 浏览器支持
- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14
- 需要 Web Workers 支持
- 需要 IndexedDB 支持

### 依赖要求
- `@ldesign/crypto`: `^1.0.0` (可选,用于 MD5 计算)
- TypeScript >= 5.0

---

## 🔄 迁移指南

### 从 1.0.x 升级到 1.1.0

**完全向后兼容!** 无需修改现有代码。

所有新功能都是可选的,可以逐步集成:

```typescript
// 现有代码继续工作
const uploader = new Uploader({ endpoint: '/api/upload' })

// 逐步添加新功能
const detector = new DuplicationDetector()
// ... 在合适的地方使用
```

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议!

- [GitHub Issues](https://github.com/ldesign/upload/issues)
- [贡献指南](./CONTRIBUTING.md)

---

## 📄 许可证

MIT © LDesign Team

---

**Happy Uploading! 🚀**
