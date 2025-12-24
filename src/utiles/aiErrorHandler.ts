import {Message} from 'view-ui-plus';
import {message} from '@/utiles/Message.ts';

/**
 * AI相关错误处理工具
 */
export class AiErrorHandler {
    private static readonly ERROR_MESSAGES: {[key: number]: string} = {
        526: '简历不存在或已被删除！',
        525: '免费模型次数已用完，自动切换为人工撰写模式！',
        520: '简历模版生成失败，自动切换为人工撰写模式！',
        521: '简历解析失败！',
        522: '简历诊断失败！',
        523: '简历撰写失败！',
        527: '内容润色失败！',
        528: '内容扩展失败！',
        529: '内容简化失败！',
        530: '内容总结失败！'
    };

    /**
     * 处理AI相关错误
     * @param code 错误码
     * @param onModeSwitch 模式切换回调（当错误码为525或520时调用）
     */
    static handleError(code: number, onModeSwitch?: ((isOpenModal: boolean) => void) | undefined): void {
        // 特定错误码需要切换模式
        if ([525, 520].includes(code) && onModeSwitch) {
            onModeSwitch(!(code === 520));
        }

        const errorMsg = this.ERROR_MESSAGES[code];
        if (errorMsg) {
            message.error(Message, errorMsg);
        }
    }
}
