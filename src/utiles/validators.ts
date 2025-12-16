/**
 * 手机号校验
 */
export const validateMobile = (rule: any, value: string, callback: any) => {
    if (value.length !== 11) {
        callback(new Error('手机号格式有误'));
        return;
    }
    if (!value.startsWith('1')) {
        callback(new Error('手机号格式有误'));
        return;
    }
    if (new Set(value).size === 1) {
        callback(new Error('手机号格式有误'));
        return;
    }
    callback();
};

/**
 * 邮箱校验
 */
export const validateEmail = (rule: any, value: string, callback: any) => {
    if (/[\u4e00-\u9fa5]/.test(value)) {
        callback(new Error('邮箱格式有误'));
        return;
    }
    if (/[\u{1F000}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{3000}-\u{303F}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u.test(value)) {
        callback(new Error('邮箱不能包含表情符号'));
        return;
    }
    const atCount = (value.match(/@/g) || []).length;
    if (atCount !== 1) {
        callback(new Error('邮箱格式有误'));
        return;
    }
    const [local, domain] = value.split('@');
    if (!local || !domain) {
        callback(new Error('邮箱格式有误'));
        return;
    }
    if (/\.{2,}/.test(value) || !domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
        callback(new Error('邮箱格式有误'));
        return;
    }
    callback();
};

/**
 * 处理用户名 开始
 */

export const hasChineseCharacters = (str: string) => {
    return str.length >= 2 ? str.substring(str.length - 2) : str;
};
