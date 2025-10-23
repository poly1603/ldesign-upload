/**
 * @ldesign/upload - 上传组件
 */
export class Uploader {
  async upload(file: File) { console.info('Uploading:', file.name); return { success: true } }
}
export function createUploader() { return new Uploader() }






