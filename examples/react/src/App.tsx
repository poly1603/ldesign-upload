import React, { useState, useRef } from 'react'
import { ReactUploader, type ReactUploaderRef } from '@ldesign/upload/framework-adapters/react'
import { useUploader } from '@ldesign/upload/framework-adapters/react/useUploader'
import type { FileItem } from '@ldesign/upload'
import './App.css'

interface Log {
  time: string
  message: string
}

function App() {
  // Example 1: Component with ref
  const uploaderRef = useRef<ReactUploaderRef>(null)
  const [filesAdded, setFilesAdded] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)

  // Example 2: useUploader hook
  const containerRef = useRef<HTMLDivElement>(null)
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
    openFilePicker,
  } = useUploader({
    container: containerRef,
    endpoint: '/api/upload',
    autoUpload: false,
    chunked: true,
  })

  // Example 4: Chunked upload state
  const [chunkingProgress, setChunkingProgress] = useState(0)
  const [chunkingSpeed, setChunkingSpeed] = useState(0)
  const [chunkingTimeRemaining, setChunkingTimeRemaining] = useState(0)

  // Logs
  const [logs, setLogs] = useState<Log[]>([])

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [{ time, message }, ...prev.slice(0, 49)])
  }

  // Event handlers
  const handleFileAdded = (file: FileItem) => {
    setFilesAdded((prev) => prev + 1)
    addLog(`✅ File added: ${file.file.name}`)
  }

  const handleUploadProgress = (event: any) => {
    setUploadProgress(event.progress)
    addLog(`📊 Upload progress: ${Math.round(event.progress)}%`)
  }

  const handleUploadSuccess = (fileId: string) => {
    setSuccessCount((prev) => prev + 1)
    addLog(`✅ Upload success: ${fileId}`)
  }

  const handleUploadError = (fileId: string, error: Error) => {
    setErrorCount((prev) => prev + 1)
    addLog(`❌ Upload error: ${error.message}`)
  }

  const handleImageAdded = (file: FileItem) => {
    addLog(`🖼️ Image added for compression: ${file.file.name}`)
  }

  const handleChunkProgress = (event: any) => {
    setChunkingProgress(event.progress)
    setChunkingSpeed(event.speed)
    setChunkingTimeRemaining(event.timeRemaining)
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

  return (
    <div className="app">
      <header className="header">
        <h1>📤 @ldesign/upload - React Examples</h1>
        <p>Comprehensive file upload examples with React</p>
      </header>

      <div className="examples">
        {/* Example 1: Component Usage */}
        <section className="example">
          <h2>1️⃣ ReactUploader Component</h2>
          <p>Using the ReactUploader component with props and ref</p>

          <ReactUploader
            ref={uploaderRef}
            endpoint="/api/upload"
            validation={{
              maxFiles: 5,
              maxSize: 10 * 1024 * 1024,
              accept: 'image/*,video/*',
            }}
            chunked={true}
            chunkSize={5 * 1024 * 1024}
            autoUpload={false}
            theme="light"
            onFileAdded={handleFileAdded}
            onUploadProgress={handleUploadProgress}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />

          <div className="stats">
            <h3>Upload Statistics</h3>
            <p>Files Added: {filesAdded}</p>
            <p>Upload Progress: {Math.round(uploadProgress)}%</p>
            <p>Successful Uploads: {successCount}</p>
            <p>Failed Uploads: {errorCount}</p>
          </div>

          <div className="controls">
            <button onClick={() => uploaderRef.current?.uploadAll()}>
              Upload All
            </button>
            <button onClick={() => uploaderRef.current?.clear()}>
              Clear
            </button>
          </div>
        </section>

        {/* Example 2: Hook Usage */}
        <section className="example">
          <h2>2️⃣ useUploader Hook</h2>
          <p>Using the useUploader hook for more control</p>

          <div ref={containerRef} className="uploader-container"></div>

          <div className="controls">
            <button onClick={() => uploadAll()} disabled={!files.length}>
              Upload All ({files.length})
            </button>
            <button onClick={() => clear()} disabled={!files.length}>
              Clear All
            </button>
            <button onClick={() => openFilePicker()}>Add Files</button>
          </div>

          <div className="file-list">
            <h3>Files ({stats.total})</h3>
            {files.map((file) => (
              <div key={file.id} className="file-item">
                <span className="file-name">{file.file.name}</span>
                <span className="file-status">{file.status}</span>
                <span className="file-progress">
                  {Math.round(file.progress)}%
                </span>
                <div className="file-actions">
                  {file.status === 'pending' && (
                    <button
                      onClick={() => uploadFile(file.id)}
                      className="btn-small"
                    >
                      Upload
                    </button>
                  )}
                  {file.status === 'uploading' && (
                    <button
                      onClick={() => pause(file.id)}
                      className="btn-small"
                    >
                      Pause
                    </button>
                  )}
                  {file.status === 'paused' && (
                    <button
                      onClick={() => resume(file.id)}
                      className="btn-small"
                    >
                      Resume
                    </button>
                  )}
                  {file.status === 'error' && (
                    <button
                      onClick={() => retry(file.id)}
                      className="btn-small"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="btn-small btn-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Example 3: Image Compression */}
        <section className="example">
          <h2>3️⃣ With Image Compression</h2>
          <p>Automatically compress images before upload</p>

          <ReactUploader
            endpoint="/api/upload"
            validation={{ accept: 'image/*' }}
            imageProcess={{
              compress: true,
              quality: 0.8,
              maxWidth: 1920,
              maxHeight: 1080,
            }}
            autoUpload={true}
            placeholder={{
              text: 'Drop images here to compress and upload',
            }}
            onFileAdded={handleImageAdded}
          />
        </section>

        {/* Example 4: Chunked Upload */}
        <section className="example">
          <h2>4️⃣ Chunked Upload (Large Files)</h2>
          <p>Upload large files with chunking and resume capability</p>

          <ReactUploader
            endpoint="/api/upload/chunk"
            chunked={true}
            chunkSize={5 * 1024 * 1024}
            concurrent={3}
            retries={3}
            validation={{ maxSize: 100 * 1024 * 1024 }}
            placeholder={{
              text: 'Drop large files here (up to 100MB)',
            }}
            onUploadProgress={handleChunkProgress}
          />

          {chunkingProgress > 0 && (
            <div className="progress-info">
              <p>Chunking Progress: {Math.round(chunkingProgress)}%</p>
              <p>Upload Speed: {formatSpeed(chunkingSpeed)}</p>
              <p>Time Remaining: {formatTime(chunkingTimeRemaining)}</p>
            </div>
          )}
        </section>

        {/* Example 5: Drag & Drop Only */}
        <section className="example">
          <h2>5️⃣ Drag & Drop Zone</h2>
          <p>Drag and drop files into the zone</p>

          <ReactUploader
            endpoint="/api/upload"
            dragDrop={true}
            paste={true}
            mode="compact"
            placeholder={{
              text: 'Drag & Drop or Paste Files Here',
              subtext: 'Supports images, videos, and documents',
            }}
          />
        </section>

        {/* Example 6: Dark Theme */}
        <section className="example dark-section">
          <h2>6️⃣ Dark Theme</h2>
          <p>Upload with dark theme</p>

          <ReactUploader
            endpoint="/api/upload"
            theme="dark"
            validation={{ accept: '*' }}
            placeholder={{ text: 'Upload any file type' }}
          />
        </section>
      </div>

      {/* Log */}
      <section className="log-section">
        <h2>📝 Event Log</h2>
        <div className="log">
          {logs.map((log, index) => (
            <div key={index} className="log-entry">
              [{log.time}] {log.message}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App

