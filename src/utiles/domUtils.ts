import { nextTick } from 'vue';

/**
 * 滚动到指定类名的最后一个元素底部
 * @param className DOM元素的类名
 */
export const scrollToBottom = (className: string) => {
  nextTick(() => {
    const elements = document.querySelectorAll(`.${className}`);
    if (elements.length > 0) {
      const lastElement = elements[elements.length - 1] as HTMLElement;
      lastElement.scrollTop = lastElement.scrollHeight;
    }
  });
};