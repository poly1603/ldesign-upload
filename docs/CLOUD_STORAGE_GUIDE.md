# Cloud Storage Integration Guide

This guide shows you how to integrate @ldesign/upload with various cloud storage providers.

## Table of Contents

- [Overview](#overview)
- [AWS S3](#aws-s3)
- [Aliyun OSS](#aliyun-oss)
- [Tencent COS](#tencent-cos)
- [Qiniu KODO](#qiniu-kodo)
- [Custom Adapter](#custom-adapter)

---

## Overview

@ldesign/upload uses a pluggable adapter system that allows you to integrate with any cloud storage provider. You can create custom adapters by extending the `BaseStorageAdapter` class.

### Adapter Interface

```typescript
interface StorageAdapter {
  name: string
  upload(file: File, options: UploadOptions): Promise<UploadResult>
  uploadChunk?(chunk: Blob, index: number, total: number, fileId: string): Promise<void>
  mergeChunks?(fileId: string, totalChunks: number): Promise<UploadResult>
  getSignedUrl?(file: File): Promise<string>
  abortUpload?(uploadId: string): void
  testChunk?(fileId: string, chunkIndex: number): Promise<boolean>
}
```

---

## AWS S3

### Option 1: Direct Upload with Presigned URLs

This is the recommended approach for browser-based uploads.

**Backend (Node.js/Express):**

```javascript
// server.js
const express = require('express')
const AWS = require('aws-sdk')

const app = express()
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

app.post('/api/s3/presigned-url', express.json(), async (req, res) => {
  const { filename, contentType } = req.body
  
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `uploads/${Date.now()}-${filename}`,
    ContentType: contentType,
    Expires: 300 // URL expires in 5 minutes
  }
  
  try {
    const url = await s3.getSignedUrlPromise('putObject', params)
    res.json({ url, key: params.Key })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

**Frontend:**

```typescript
import { BaseStorageAdapter } from '@ldesign/upload/adapters'

class S3Adapter extends BaseStorageAdapter {
  name = 's3'
  
  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    try {
      // 1. Get presigned URL from your backend
      const response = await fetch('/api/s3/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type
        })
      })
      
      const { url, key } = await response.json()
      
      // 2. Upload directly to S3
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })
      
      if (!uploadResponse.ok) {
        throw new Error('S3 upload failed')
      }
      
      // 3. Return success with the file URL
      const fileUrl = url.split('?')[0]
      return {
        success: true,
        url: fileUrl,
        data: { key }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }
}

// Usage
import { Uploader } from '@ldesign/upload'

const uploader = new Uploader({
  adapter: new S3Adapter(),
  container: '#uploader'
})
```

### Option 2: Multipart Upload for Large Files

```typescript
class S3MultipartAdapter extends BaseStorageAdapter {
  name = 's3-multipart'
  private uploadId?: string
  private parts: Array<{ ETag: string; PartNumber: number }> = []
  
  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    // Initiate multipart upload
    const initResponse = await fetch('/api/s3/multipart/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type })
    })
    
    const { uploadId, key } = await initResponse.json()
    this.uploadId = uploadId
    
    // Upload parts
    const chunkSize = 5 * 1024 * 1024 // 5MB
    const totalParts = Math.ceil(file.size / chunkSize)
    
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      await this.uploadPart(chunk, partNumber, uploadId, key)
      
      // Report progress
      options.onProgress?.((partNumber / totalParts) * 100)
    }
    
    // Complete multipart upload
    const completeResponse = await fetch('/api/s3/multipart/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId, key, parts: this.parts })
    })
    
    const { url } = await completeResponse.json()
    
    return { success: true, url }
  }
  
  private async uploadPart(chunk: Blob, partNumber: number, uploadId: string, key: string) {
    // Get presigned URL for this part
    const urlResponse = await fetch('/api/s3/multipart/part-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId, key, partNumber })
    })
    
    const { url } = await urlResponse.json()
    
    // Upload the part
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: chunk
    })
    
    const etag = uploadResponse.headers.get('ETag')
    if (etag) {
      this.parts.push({ ETag: etag, PartNumber: partNumber })
    }
  }
}
```

---

## Aliyun OSS

```typescript
import OSS from 'ali-oss'
import { BaseStorageAdapter } from '@ldesign/upload/adapters'

class OSSAdapter extends BaseStorageAdapter {
  name = 'oss'
  private client: OSS
  
  constructor(config: OSS.Options) {
    super()
    this.client = new OSS(config)
  }
  
  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    try {
      const result = await this.client.put(file.name, file, {
        progress: (p) => {
          options.onProgress?.(p * 100)
        }
      })
      
      return {
        success: true,
        url: result.url,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }
  
  // Multipart upload for large files
  async uploadChunk(chunk: Blob, index: number, total: number, fileId: string): Promise<void> {
    // OSS multipart upload implementation
    // See ali-oss documentation for details
  }
}

// Usage
const uploader = new Uploader({
  adapter: new OSSAdapter({
    region: 'oss-cn-hangzhou',
    accessKeyId: 'your-access-key-id',
    accessKeySecret: 'your-access-key-secret',
    bucket: 'your-bucket-name'
  })
})
```

---

## Tencent COS

```typescript
import COS from 'cos-js-sdk-v5'
import { BaseStorageAdapter } from '@ldesign/upload/adapters'

class COSAdapter extends BaseStorageAdapter {
  name = 'cos'
  private client: COS
  
  constructor(config: COS.COSOptions) {
    super()
    this.client = new COS(config)
  }
  
  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    return new Promise((resolve) => {
      this.client.putObject({
        Bucket: 'your-bucket-name',
        Region: 'ap-guangzhou',
        Key: file.name,
        Body: file,
        onProgress: (progressData) => {
          options.onProgress?.(progressData.percent * 100)
        }
      }, (err, data) => {
        if (err) {
          resolve({
            success: false,
            error: err.message
          })
        } else {
          resolve({
            success: true,
            url: `https://${data.Location}`,
            data
          })
        }
      })
    })
  }
}

// Usage
const uploader = new Uploader({
  adapter: new COSAdapter({
    SecretId: 'your-secret-id',
    SecretKey: 'your-secret-key'
  })
})
```

---

## Qiniu KODO

```typescript
import * as qiniu from 'qiniu-js'
import { BaseStorageAdapter } from '@ldesign/upload/adapters'

class KODOAdapter extends BaseStorageAdapter {
  name = 'kodo'
  private domain: string
  
  constructor(domain: string) {
    super()
    this.domain = domain
  }
  
  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    try {
      // Get upload token from your backend
      const tokenResponse = await fetch('/api/qiniu/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name })
      })
      
      const { token, key } = await tokenResponse.json()
      
      // Upload to Qiniu
      const observable = qiniu.upload(file, key, token)
      
      return new Promise((resolve) => {
        observable.subscribe({
          next: (result) => {
            options.onProgress?.(result.total.percent)
          },
          error: (error) => {
            resolve({
              success: false,
              error: error.message
            })
          },
          complete: (result) => {
            resolve({
              success: true,
              url: `https://${this.domain}/${result.key}`,
              data: result
            })
          }
        })
      })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }
}

// Usage
const uploader = new Uploader({
  adapter: new KODOAdapter('your-domain.com')
})
```

---

## Custom Adapter

Create your own adapter for any storage provider:

```typescript
import { BaseStorageAdapter, UploadOptions, UploadResult } from '@ldesign/upload/adapters'

class CustomStorageAdapter extends BaseStorageAdapter {
  name = 'custom'
  private apiEndpoint: string
  private apiKey: string
  
  constructor(endpoint: string, apiKey: string) {
    super()
    this.apiEndpoint = endpoint
    this.apiKey = apiKey
  }
  
  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`)
      }
      
      const data = await response.json()
      
      return {
        success: true,
        url: data.url,
        data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }
  
  // Optional: Implement chunked upload
  async uploadChunk(
    chunk: Blob,
    index: number,
    total: number,
    fileId: string
  ): Promise<void> {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('index', String(index))
    formData.append('total', String(total))
    formData.append('fileId', fileId)
    
    const response = await fetch(`${this.apiEndpoint}/chunk`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Chunk upload failed')
    }
  }
  
  // Optional: Implement chunk merging
  async mergeChunks(fileId: string, totalChunks: number): Promise<UploadResult> {
    const response = await fetch(`${this.apiEndpoint}/merge`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileId, totalChunks })
    })
    
    if (!response.ok) {
      throw new Error('Merge failed')
    }
    
    const data = await response.json()
    return {
      success: true,
      url: data.url,
      data
    }
  }
  
  // Optional: Abort upload
  abortUpload(uploadId: string): void {
    fetch(`${this.apiEndpoint}/abort/${uploadId}`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey
      }
    })
  }
}

// Usage
const uploader = new Uploader({
  adapter: new CustomStorageAdapter('https://api.example.com/upload', 'your-api-key')
})
```

---

## Best Practices

1. **Security**: Never expose your API keys in frontend code. Use your backend to generate presigned URLs or temporary tokens.

2. **Large Files**: Use multipart/chunked upload for files larger than 5MB.

3. **Error Handling**: Implement proper error handling and retry logic in your adapters.

4. **Progress Reporting**: Use the `onProgress` callback to provide user feedback.

5. **CORS**: Configure CORS properly on your storage bucket for browser uploads.

6. **Validation**: Validate files on both frontend and backend.

---

For more information, see the [API Documentation](./API.md).

