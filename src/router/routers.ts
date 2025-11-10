/**
 * 在主框架之内显示
 */
const layout = function (meta: any) {
    return {
        path: meta.path,
        component: () => import('@/layouts/index.vue'),
        show: true,
        meta: {
            title: meta.title,
            icon: meta.icon
        },
        children: [{...meta}]
    }
}
const onlyHeader = function (meta: any) {
    return {
        path: meta.path,
        component: () => import('@/layouts/onlyHeader.vue'),
        show: false,
        meta: {
            title: meta.title
        },
        children: [{...meta}]
    }
}

// 展示菜单
const all = [
    {
        path: '/',
        redirect: '/resume'
    },
    // 登录
    onlyHeader({
        path: '/login',
        title: '登录',
        component: () => import('@/views/login/index.vue')
    }),
    // 基本信息收集
    onlyHeader({
        path: '/initProfile',
        title: '基本信息收集',
        component: () => import('@/views/initProfile/index.vue')
    }),
    // 简历制作
    layout({
        path: '/resume',
        title: '简历制作',
        icon: 'icon-resume',
        component: () => import('@/views/resume/index.vue')
    }),
    // 个人信息
    layout({
        path: '/personalInfo',
        title: '个人信息',
        icon: 'icon-gerenzhongxin',
        component: () => import('@/views/personalInfo/index.vue')
    })
]

// 重新组织后导出
const routes: any[] = [...all]

export default routes
