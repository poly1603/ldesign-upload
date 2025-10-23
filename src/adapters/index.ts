/**
 * Storage Adapters
 * 
 * This module exports the base adapter class and built-in adapters.
 * 
 * ## Creating Custom Adapters
 * 
 * To create a custom adapter for your cloud storage provider:
 * 
 * ```typescript
 * import { BaseStorageAdapter } from '@ldesign/upload/adapters'
 * 
 * class S3Adapter extends BaseStorageAdapter {
 *   name = 's3'
 *   
 *   async upload(file: File, options: UploadOptions): Promise<UploadResult> {
 *     // 1. Get presigned URL from your backend
 *     const presignedUrl = await this.getPresignedUrl(file)
 *     
 *     // 2. Upload directly to S3
 *     const response = await fetch(presignedUrl, {
 *       method: 'PUT',
 *       body: file,
 *       headers: { 'Content-Type': file.type }
 *     })
 *     
 *     if (!response.ok) {
 *       return { success: false, error: 'Upload failed' }
 *     }
 *     
 *     return { success: true, url: presignedUrl.split('?')[0] }
 *   }
 *   
 *   private async getPresignedUrl(file: File): Promise<string> {
 *     const response = await fetch('/api/s3/presigned-url', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({
 *         filename: file.name,
 *         contentType: file.type
 *       })
 *     })
 *     const data = await response.json()
 *     return data.url
 *   }
 * }
 * ```
 * 
 * ## Example: Aliyun OSS Adapter
 * 
 * ```typescript
 * import OSS from 'ali-oss'
 * import { BaseStorageAdapter } from '@ldesign/upload/adapters'
 * 
 * class OSSAdapter extends BaseStorageAdapter {
 *   name = 'oss'
 *   private client: OSS
 *   
 *   constructor(config: OSS.Options) {
 *     super()
 *     this.client = new OSS(config)
 *   }
 *   
 *   async upload(file: File, options: UploadOptions): Promise<UploadResult> {
 *     try {
 *       const result = await this.client.put(file.name, file, {
 *         progress: (p) => {
 *           options.onProgress?.(p * 100)
 *         }
 *       })
 *       
 *       return {
 *         success: true,
 *         url: result.url,
 *         data: result
 *       }
 *     } catch (error) {
 *       return {
 *         success: false,
 *         error: error.message
 *       }
 *     }
 *   }
 *   
 *   // Multipart upload for large files
 *   async uploadChunk(chunk: Blob, index: number, total: number, fileId: string): Promise<void> {
 *     // OSS multipart upload implementation
 *   }
 * }
 * ```
 * 
 * ## Example: Tencent COS Adapter
 * 
 * ```typescript
 * import COS from 'cos-js-sdk-v5'
 * import { BaseStorageAdapter } from '@ldesign/upload/adapters'
 * 
 * class COSAdapter extends BaseStorageAdapter {
 *   name = 'cos'
 *   private client: COS
 *   
 *   constructor(config: COS.COSOptions) {
 *     super()
 *     this.client = new COS(config)
 *   }
 *   
 *   async upload(file: File, options: UploadOptions): Promise<UploadResult> {
 *     return new Promise((resolve) => {
 *       this.client.putObject({
 *         Bucket: 'your-bucket',
 *         Region: 'your-region',
 *         Key: file.name,
 *         Body: file,
 *         onProgress: (progressData) => {
 *           options.onProgress?.(progressData.percent * 100)
 *         }
 *       }, (err, data) => {
 *         if (err) {
 *           resolve({ success: false, error: err.message })
 *         } else {
 *           resolve({
 *             success: true,
 *             url: data.Location,
 *             data
 *           })
 *         }
 *       })
 *     })
 *   }
 * }
 * ```
 * 
 * ## Usage
 * 
 * ```typescript
 * import { Uploader } from '@ldesign/upload'
 * import { S3Adapter } from './adapters/s3'
 * 
 * const uploader = new Uploader({
 *   adapter: new S3Adapter({
 *     // S3 configuration
 *   })
 * })
 * ```
 */

export { BaseStorageAdapter, HTTPAdapter } from './BaseAdapter'
export type { StorageAdapter, UploadOptions, UploadResult } from '../types'

