<template>
  <div class="app">
    <header class="header">
      <h1>📤 @ldesign/upload - Vue 3 Examples</h1>
      <p>Comprehensive file upload examples with Vue 3</p>
    </header>

    <div class="examples">
      <!-- Example 1: Component Usage -->
      <section class="example">
        <h2>1️⃣ VueUploader Component</h2>
        <p>Using the VueUploader component with props</p>

        <VueUploader endpoint="/api/upload" :max-files="5" :max-size="10 * 1024 * 1024" accept="image/*,video/*"
          :chunked="true" :chunk-size="5 * 1024 * 1024" :auto-upload="false" theme="light" @file-added="onFileAdded"
          @upload-progress="onUploadProgress" @upload-success="onUploadSuccess" @upload-error="onUploadError" />

        <div class="stats">
          <h3>Upload Statistics</h3>
          <p>Files Added: {{ filesAdded }}</p>
          <p>Upload Progress: {{ Math.round(uploadProgress) }}%</p>
          <p>Successful Uploads: {{ successCount }}</p>
          <p>Failed Uploads: {{ errorCount }}</p>
        </div>
      </section>

      <!-- Example 2: Composable Usage -->
      <section class="example">
        <h2>2️⃣ useUploader Composable</h2>
        <p>Using the useUploader composable for more control</p>

        <div ref="uploaderContainer" class="uploader-container"></div>

        <div class="controls">
          <button @click="uploadAll" :disabled="!files.length">
            Upload All ({{ files.length }})
          </button>
          <button @click="clear" :disabled="!files.length">
            Clear All
          </button>
          <button @click="openFilePicker">
            Add Files
          </button>
        </div>

        <div class="file-list">
          <h3>Files ({{ stats.total }})</h3>
          <div v-for="file in files" :key="file.id" class="file-item">
            <span class="file-name">{{ file.file.name }}</span>
            <span class="file-status">{{ file.status }}</span>
            <span class="file-progress">{{ Math.round(file.progress) }}%</span>
            <div class="file-actions">
              <button v-if="file.status === 'pending'" @click="uploadFile(file.id)" class="btn-small">
                Upload
              </button>
              <button v-if="file.status === 'uploading'" @click="pause(file.id)" class="btn-small">
                Pause
              </button>
              <button v-if="file.status === 'paused'" @click="resume(file.id)" class="btn-small">
                Resume
              </button>
              <button v-if="file.status === 'error'" @click="retry(file.id)" class="btn-small">
                Retry
              </button>
              <button @click="removeFile(file.id)" class="btn-small btn-danger">
                Remove
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Example 3: Image Compression -->
      <section class="example">
        <h2>3️⃣ With Image Compression</h2>
        <p>Automatically compress images before upload</p>

        <VueUploader endpoint="/api/upload" accept="image/*" :image-compress="true" :image-quality="0.8"
          :image-max-width="1920" :image-max-height="1080" :auto-upload="true"
          placeholder-text="Drop images here to compress and upload" @file-added="onImageAdded" />
      </section>

      <!-- Example 4: Chunked Upload -->
      <section class="example">
        <h2>4️⃣ Chunked Upload (Large Files)</h2>
        <p>Upload large files with chunking and resume capability</p>

        <VueUploader endpoint="/api/upload/chunk" :chunked="true" :chunk-size="5 * 1024 * 1024" :concurrent="3"
          :retries="3" :max-size="100 * 1024 * 1024" placeholder-text="Drop large files here (up to 100MB)"
          @upload-progress="onChunkProgress" />

        <div v-if="chunkingProgress" class="progress-info">
          <p>Chunking Progress: {{ Math.round(chunkingProgress) }}%</p>
          <p>Upload Speed: {{ formatSpeed(chunkingSpeed) }}</p>
          <p>Time Remaining: {{ formatTime(chunkingTimeRemaining) }}</p>
        </div>
      </section>

      <!-- Example 5: Drag & Drop Only -->
      <section class="example">
        <h2>5️⃣ Drag & Drop Zone</h2>
        <p>Drag and drop files into the zone</p>

        <VueUploader endpoint="/api/upload" :drag-drop="true" :paste="true" mode="compact"
          placeholder-text="Drag & Drop or Paste Files Here"
          placeholder-subtext="Supports images, videos, and documents" />
      </section>

      <!-- Example 6: Dark Theme -->
      <section class="example dark-section">
        <h2>6️⃣ Dark Theme</h2>
        <p>Upload with dark theme</p>

        <VueUploader endpoint="/api/upload" theme="dark" accept="*" placeholder-text="Upload any file type" />
      </section>
    </div>

    <!-- Log -->
    <section class="log-section">
      <h2>📝 Event Log</h2>
      <div class="log">
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          [{{ log.time }}] {{ log.message }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueUploader } from '@ldesign/upload/framework-adapters/vue'
import { useUploader } from '@ldesign/upload/framework-adapters/vue/useUploader'

// Example 1: Component stats
const filesAdded = ref(0)
const uploadProgress = ref(0)
const successCount = ref(0)
const errorCount = ref(0)

// Example 2: Composable
const uploaderContainer = ref<HTMLElement>()
const {
  files,
  stats,
  uploadFile,
  uploadAll,
  pause,
  resume,
  retry,
  removeFile,
  clear,
  openFilePicker
} = useUploader({
  container: uploaderContainer,
  endpoint: '/api/upload',
  autoUpload: false,
  chunked: true,
})

// Example 4: Chunked upload
const chunkingProgress = ref(0)
const chunkingSpeed = ref(0)
const chunkingTimeRemaining = ref(0)

// Logs
const logs = ref<Array<{ time: string; message: string }>>([])

const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message })
  if (logs.value.length > 50) {
    logs.value.pop()
  }
}

// Event handlers
const onFileAdded = (file: any) => {
  filesAdded.value++
  addLog(`✅ File added: ${file.file.name}`)
}

const onUploadProgress = (event: any) => {
  uploadProgress.value = event.progress
  addLog(`📊 Upload progress: ${Math.round(event.progress)}%`)
}

const onUploadSuccess = (fileId: string, response: any) => {
  successCount.value++
  addLog(`✅ Upload success: ${fileId}`)
}

const onUploadError = (fileId: string, error: Error) => {
  errorCount.value++
  addLog(`❌ Upload error: ${error.message}`)
}

const onImageAdded = (file: any) => {
  addLog(`🖼️ Image added for compression: ${file.file.name}`)
}

const onChunkProgress = (event: any) => {
  chunkingProgress.value = event.progress
  chunkingSpeed.value = event.speed
  chunkingTimeRemaining.value = event.timeRemaining
}

// Utility functions
const formatSpeed = (bytesPerSecond: number) => {
  if (bytesPerSecond === 0) return '0 KB/s'
  const kb = bytesPerSecond / 1024
  if (kb < 1024) return `${kb.toFixed(2)} KB/s`
  return `${(kb / 1024).toFixed(2)} MB/s`
}

const formatTime = (seconds: number) => {
  if (!isFinite(seconds)) return '--'
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${Math.ceil(seconds % 60)}s`
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.header p {
  color: #666;
}

.examples {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}

.example {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.example h2 {
  margin-bottom: 0.5rem;
  color: #333;
}

.example p {
  margin-bottom: 1.5rem;
  color: #666;
}

.dark-section {
  background: #1f2937;
}

.dark-section h2,
.dark-section p {
  color: #f9fafb;
}

.uploader-container {
  min-height: 200px;
}

.stats,
.progress-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 4px;
}

.stats h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.stats p,
.progress-info p {
  margin: 0.25rem 0;
  color: #666;
}

.controls {
  margin: 1rem 0;
  display: flex;
  gap: 0.5rem;
}

.controls button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.controls button:hover {
  background: #2563eb;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-list {
  margin-top: 1rem;
}

.file-list h3 {
  margin-bottom: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background: #e5e7eb;
}

.file-progress {
  font-size: 0.875rem;
  color: #666;
}

.file-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-small {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-small:hover {
  background: #2563eb;
}

.btn-danger {
  background: #ef4444;
}

.btn-danger:hover {
  background: #dc2626;
}

.log-section {
  max-width: 1200px;
  margin: 2rem auto 0;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.log-section h2 {
  margin-bottom: 1rem;
}

.log {
  max-height: 300px;
  overflow-y: auto;
  background: #1f2937;
  color: #10b981;
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.log-entry {
  margin-bottom: 0.25rem;
}
</style>
