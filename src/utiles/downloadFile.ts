import { invoke } from '@tauri-apps/api/core';
import { message } from '@/utiles/Message.ts';
import { Message } from 'view-ui-plus';

/**
 * 下载PDF文件到本地
 * @param pdfUrl PDF文件链接
 * @param defaultFileName 默认文件名（可选）
 */
export async function downloadPdf(pdfUrl: string, defaultFileName = 'document.pdf') {
  try {
    const bytes = await invoke<number[]>('download_pdf', { url: pdfUrl });
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
    
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: defaultFileName,
      types: [{
        description: 'PDF',
        accept: { 'application/pdf': ['.pdf'] }
      }]
    });
    
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    
    message.success(Message, '已下载至本地！');
  } catch (error) {
    if ((error as any).name !== 'AbortError') {
      message.error(Message, '下载失败');
    }
  }
}

/**
 * 下载图片到本地
 * @param imageUrl 图片链接
 * @param defaultFileName 默认文件名（可选）
 */
export async function downloadImage(imageUrl: string, defaultFileName = 'image.jpg') {
  try {
    const bytes = await invoke<number[]>('download_pdf', { url: imageUrl });
    const blob = new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' });
    
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: defaultFileName,
      types: [{
        description: 'JPEG',
        accept: { 'image/jpeg': ['.jpg', '.jpeg'] }
      }]
    });
    
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    
    message.success(Message, '已下载至本地！');
  } catch (error) {
    if ((error as any).name !== 'AbortError') {
      message.error(Message, '下载失败');
    }
  }
}
