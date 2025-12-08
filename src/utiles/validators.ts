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
