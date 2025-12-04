import {Spin} from 'view-ui-plus';
import {h} from 'vue';

export const showLoading = (text?: string) => {
    if (text) {
        Spin.show({render: () => h('div', text || '加载中...')});
    } else {
        Spin.show();
    }
};

export const hideLoading = () => {
    Spin.hide();
};

export const withLoading = async <T>(fn: () => Promise<T>, text?: string): Promise<T> => {
    showLoading(text);
    try {
        return await fn();
    } finally {
        hideLoading();
    }
};
