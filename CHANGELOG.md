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

## [Unreleased]

### Planned Features
- WebRTC peer-to-peer upload
- Advanced video processing (trim, compress)
- File manager UI (list/grid view, search, filter)
- Upload history persistence
- Virtual scrolling for large file lists
- Web Workers for background processing
- More built-in storage adapters (S3, OSS, COS)

---

[1.0.0]: https://github.com/ldesign/upload/releases/tag/v1.0.0
[Unreleased]: https://github.com/ldesign/upload/compare/v1.0.0...HEAD

