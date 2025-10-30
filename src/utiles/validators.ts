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
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    callback(new Error('邮箱格式有误'));
    return;
  }
  callback();
};