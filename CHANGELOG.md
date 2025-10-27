# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Added

#### Core Features
- ✨ File upload with click, drag & drop, and paste support
- ✨ Chunked upload for large files with configurable chunk size
- ✨ Resume upload capability with progress persistence
- ✨ Real-time progress tracking with speed and time estimation
- ✨ Concurrent upload control (multiple files simultaneously)
- ✨ Priority queue management
- ✨ Comprehensive file validation (type, size, dimensions)

#### File Processing
- 🖼️ Image compression with quality and size controls
- 🖼️ Image rotation and flipping
- 🖼️ Image filters (grayscale, brightness, contrast, sepia)
- 🎥 Video thumbnail extraction
- 🎥 Video metadata parsing

#### Storage & Integration
- ☁️ Pluggable storage adapter system
- ☁️ Built-in HTTP adapter
- ☁️ Documentation for S3, OSS, COS adapter implementation
- 🔌 Vue 3 adapter (component, composable, directive)
- 🔌 React adapter (component, hook)
- 🔌 Angular adapter (component)

#### Developer Experience
- 📘 Full TypeScript support with comprehensive type definitions
- 🎨 Beautiful default UI with light/dark themes
- 🌐 i18n support
- 📦 Tree-shakeable exports
- 🧪 Unit and integration tests

### Technical Details

- **Core Managers**:
  - `FileManager`: Queue management, concurrent control, status tracking
  - `ChunkManager`: File chunking, resume capability, progress storage
  - `ValidationManager`: File validation with custom validators
  - `ProgressTracker`: Progress calculation with moving average speed
  - `InteractionManager`: Drag & drop, paste, file picker integration

- **Processors**:
  - `ImageProcessor`: Image manipulation (compress, rotate, flip, filter)
  - `VideoProcessor`: Video metadata and thumbnail extraction

- **Adapters**:
  - `BaseStorageAdapter`: Abstract base for custom adapters
  - `HTTPAdapter`: Standard HTTP upload implementation

- **Bundle Size**: ~35KB (gzipped, core only)

### Breaking Changes
- None (initial release)

### Migration Guide
- None (initial release)

---

## [1.1.0] - 2025-01-XX

### Added - Advanced Features 🚀

#### File Deduplication
- ✨ **DuplicationDetector**: Smart duplicate file detection
  - Content-based MD5 hashing for accurate detection
  - Metadata-based fingerprinting for fast detection
  - Configurable cache with automatic expiration
  - LocalStorage persistence for cache data

#### Upload Rate Limiting
- ✨ **RateLimiter**: Bandwidth control and throttling
  - Configurable upload speed limits (bytes/second)
  - Time-window based throttling algorithm
  - Dynamic rate adjustment support
  - Optimal chunk size calculation

- ✨ **AdaptiveRateLimiter**: Smart network-aware rate limiting
  - Automatic rate adjustment based on network conditions
  - Success rate and latency tracking
  - Network quality estimation (excellent/good/fair/poor)
  - Exponential backoff on failures

#### Web Workers Support
- ✨ **WorkerPool**: Multi-threaded task processing
  - CPU-intensive tasks offloaded to background threads
  - Image compression in workers (non-blocking)
  - File hash calculation in workers
  - Priority-based task queue
  - Automatic worker count based on CPU cores
  - Global singleton pattern for easy access

#### Offline Cache & Persistence
- ✨ **OfflineCache**: IndexedDB-based persistent storage
  - File caching for offline support
  - Upload state persistence across sessions
  - Chunk-level caching for resume capability
  - Automatic cache expiration and cleanup
  - Configurable cache size limits
  - Support for offline upload queue

#### Enhanced Cryptography
- 🔐 **MD5 Hash Calculation**: Integrated with @ldesign/crypto
  - File-level MD5 hashing for deduplication
  - Chunk-level MD5 for integrity verification
  - Support for instant upload (秒传) functionality
  - Graceful fallback when crypto unavailable

#### Image Processing Enhancements
- 🖼️ **Blur Filter**: Complete implementation
  - Gaussian blur using canvas filter API
  - Configurable blur radius
  - Optimized for modern browsers

### Performance Improvements
- ⚡ Non-blocking image compression via Web Workers
- ⚡ Parallel hash calculation for multiple files
- ⚡ Optimized cache operations with IndexedDB
- ⚡ Reduced main thread blocking

### Documentation
- 📚 New comprehensive guide: `docs/ADVANCED_FEATURES_NEW.md`
  - Detailed usage examples for all new features
  - Integration patterns with existing code
  - Performance optimization tips
  - Troubleshooting guide

### API Additions

```typescript
// New exports
export { DuplicationDetector } from './core'
export { RateLimiter, AdaptiveRateLimiter } from './core'
export { WorkerPool, getWorkerPool, terminateWorkerPool } from './core'
export { OfflineCache } from './core'
export type { WorkerTask, WorkerResult } from './core'

// Enhanced ChunkManager methods
ChunkManager.calculateChunkHash(chunk: Blob): Promise<string>
ChunkManager.calculateFileHash(file: File): Promise<string>
```

### Breaking Changes
- None (fully backward compatible)

### Migration Notes
- All new features are opt-in and don't affect existing code
- No changes required for current implementations
- New features can be gradually adopted as needed

---

## [Unreleased]

### Planned Features
- WebRTC peer-to-peer upload
- Advanced video processing (trim, compress)
- File manager UI (list/grid view, search, filter)
- Virtual scrolling for large file lists (partially done via WorkerPool)
- More built-in storage adapters (S3, OSS, COS, Azure)
- Angular adapter improvements
- Smart retry with circuit breaker pattern

---

[1.0.0]: https://github.com/ldesign/upload/releases/tag/v1.0.0
[Unreleased]: https://github.com/ldesign/upload/compare/v1.0.0...HEAD

