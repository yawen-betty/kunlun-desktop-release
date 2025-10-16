// 导出路由 在 mait.ts 里使用
import { createRouter, createWebHashHistory }from 'vue-router';
import routes from './routers';

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior: () => {
        history.pushState(null, '', document.URL);
    }
});
/**
 * 路由拦截
 * 权限验证
 */

// @ts-ignore
router.beforeEach((to, from, next) => {
    next();
});

router.afterEach(() => {
    // 返回页面顶端
    window.scrollTo(0, 0);
});

export default router;
