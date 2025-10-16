import { ObjectDirective } from 'vue';

const clearableSelect: ObjectDirective = {
    mounted(el: HTMLElement, binding) {
        // 等待DOM更新完成后执行
        setTimeout(() => {
            initClearButton(el, binding);
        }, 0);
    },

    updated(el: HTMLElement, binding) {
        updateClearButton(el, binding);
    }
};

function initClearButton(el: HTMLElement, binding: any) {
    // 查找合适的插入点
    const wrapper = el;

    if (!wrapper) return;

    // 创建清空按钮
    const clearBtn = document.createElement('i');

    clearBtn.className = 'ivu-icon ivu-icon-ios-close-circle ivu-select-arrow';
    clearBtn.style.cssText = `
    display: none;
    cursor: pointer;
  `;

    // 添加事件监听
    clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleClear(binding, el);
    });

    // 监听鼠标事件
    wrapper.addEventListener('mouseenter', () => {
        toggleClearButton(binding, clearBtn, true, el);
    });

    wrapper.addEventListener('mouseleave', () => {
        toggleClearButton(binding, clearBtn, false, el);
    });

    wrapper.appendChild(clearBtn);

    // 保存引用
    (wrapper as any)._clearBtn = clearBtn;
}

function handleClear(binding: any, el: HTMLElement) {
    const { value } = binding;

    // 方法1: 直接修改传递进来的响应式数据
    if (Array.isArray(value.data)) {
        value.data.splice(0); // 清空数组
        value.onClear();
        const tagElements = el.querySelectorAll('.ivu-select-dropdown');

        if (tagElements && tagElements[0]) {
            (tagElements[0] as HTMLElement).style.top = '32px';
        }
    }
}

function toggleClearButton(binding: any, clearBtn: HTMLElement, show: boolean, el: HTMLElement) {
    // 使用querySelectorAll来查找元素
    const tagElements = el.querySelectorAll('.ivu-tag');
    const hasValue = tagElements.length > 0;

    const btn = clearBtn.parentElement;

    if (!btn) return;

    const arrow = el.querySelectorAll('.ivu-icon-ios-arrow-down');

    if (hasValue && show) {
        clearBtn.style.display = 'block';
        if (arrow.length > 0) {
            (arrow[0] as HTMLElement).style.display = 'none';
        }
    } else {
        clearBtn.style.display = 'none';
        if (arrow.length > 0) {
            (arrow[0] as HTMLElement).style.display = 'block';
        }
    }
}

function updateClearButton(el: HTMLElement, binding: any) {
    const wrapper = el;
    const clearBtn = (wrapper as any)?._clearBtn;

    if (!wrapper || !clearBtn) return;
    const isShow = el.classList.value.includes('ivu-select-show-clear');

    // 使用响应式数据判断按钮显示隐藏
    toggleClearButton(binding, clearBtn, isShow, el);
}

export default clearableSelect;
