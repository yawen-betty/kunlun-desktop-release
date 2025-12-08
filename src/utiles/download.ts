import {image} from "@/utiles/tauriCommonds.ts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {Message} from "view-ui-plus";
import {message} from "@/utiles/Message.ts";

/**
 * 下载文件
 * @param el dom类名
 * @param ext 文件后缀
 * @param name 文件名
 */
export const download = async (el: string, ext: 'jpg' | 'pdf', name: string) => {
    const previewEl = document.querySelector(el) as HTMLElement;
    if (!previewEl) return;

    try {
        // 转换图片为 base64
        const imgEl = previewEl.querySelector('.avatar') as HTMLImageElement;
        if (imgEl && imgEl.src && !imgEl.src.startsWith('data:')) {
            imgEl.src = await image.toBase64(imgEl.src);
        }
        const canvas = await html2canvas(previewEl, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true
        });

        const fileName = `${name}.${ext}`;

        let blob: Blob;
        if (ext === 'jpg') {
            blob = await new Promise(resolve => canvas.toBlob(resolve as any, 'image/jpeg', 0.95));
        } else {
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pdf = new jsPDF('p', 'mm', [imgWidth, imgHeight]);
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, imgWidth, imgHeight);
            blob = pdf.output('blob');
        }

        const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [{
                description: ext.toUpperCase(),
                accept: {[ext === 'jpg' ? 'image/jpeg' : 'application/pdf']: [`.${ext}`]}
            }]
        });

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();

        message.success(Message, '下载成功');
    } catch (error) {
        if ((error as any).name !== 'AbortError') {
            message.success(Message, '下载失败');
        }
    }
};
