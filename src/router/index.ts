// 导出路由 在 mait.ts 里使用
import {createRouter, createWebHashHistory} from 'vue-router';
import routes from './routers';
import {auth} from '@/utiles/tauriCommonds';

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
router.beforeEach(async (to, from, next) => {
    // 处理根路径，根据登录状态跳转
    if (to.path === '/') {
        const token = await auth.getToken();
        next(token ? '/resume' : '/login');
        return;
    }
    next();
});

router.afterEach(() => {
    // 返回页面顶端
    window.scrollTo(0, 0);
});

export default router;
