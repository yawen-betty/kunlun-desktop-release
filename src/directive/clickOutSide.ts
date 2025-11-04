export default {
    mounted(el: any, binding: any) {
        // 在指令绑定到元素时执行的代码
        const onClickOutside = (event: any) => {
            if (!el.contains(event.target) && el !== event.target) {
                binding.value()
            }
        };
        document.addEventListener('click', onClickOutside);
        el._clickoutside = onClickOutside;
    },
    beforeUnmount(el: any) {
        // 在指令从元素上解绑时执行的代码
        document.removeEventListener('click', el._clickoutside);
        delete el._clickoutside;
    },
};
