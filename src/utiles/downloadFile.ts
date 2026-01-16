import {invoke} from '@tauri-apps/api/core';
import {message} from '@/utiles/Message.ts';
import {Message} from 'view-ui-plus';
import {save} from '@tauri-apps/plugin-dialog';
import {writeFile} from "@tauri-apps/plugin-fs";

/**
 * 下载PDF文件到本地
 * @param pdfUrl PDF文件链接
 * @param defaultFileName 默认文件名（可选）
 */
export async function downloadPdf(pdfUrl: string, defaultFileName = 'document.pdf') {
    try {
        const bytes = await invoke<number[]>('download_pdf', {url: pdfUrl});
        const blob = new Blob([new Uint8Array(bytes)], {type: 'application/pdf'});

        const handle = await (window as any).showSaveFilePicker({
            suggestedName: defaultFileName,
            types: [{
                description: 'PDF',
                accept: {'application/pdf': ['.pdf']}
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

export async function downloadImage(imageUrl: string, defaultFileName = 'image.jpg') {
    try {
        // 调用的是插件提供的 save 方法
        const filePath = await save({
            defaultPath: defaultFileName,
            filters: [{name: 'Image', extensions: ['jpg', 'jpeg']}]
        });

        if (!filePath) return;

        const bytes = await invoke<number[]>('download_pdf', {url: imageUrl});

        // 写入文件
        await writeFile(filePath, new Uint8Array(bytes));

        message.success(Message, '下载成功');
    } catch (error) {
        console.error(error);
        message.error(Message, '下载失败');
    }
}
