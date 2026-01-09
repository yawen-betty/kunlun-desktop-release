/**
 * 渠道配置
 */
export const CHANNEL_CONFIG = {
    // boss: {
    //   /** 首页 URL */
    //   homeUrl: 'https://www.zhipin.com/',
    //   /** 搜索页面 URL */
    //   searchUrl: 'https://www.zhipin.com/',
    //   /** 登录验证 API */
    //   loginCheckApi: '/wapi/zpgeek/agreement/update/tip.json',
    //   /** 登录成功状态码 */
    //   loginSuccessCode: 0,
    //   /** Cookie 域名 */
    //   cookieDomain: '.zhipin.com',
    //   /** 监听职位的接口 */
    //   positionNetUrl: 'web/competitive/jobDetail.json',
    //   /** 监听公司的接口 */
    //   companyNetUrl: '/zpCommon/toggle/all',
    //   /** 搜索列表接口 用来判断是否有职位 */
    //   positionCountUrl: '/search/joblist.json'
    // },
    zhilian: {
        homeUrl: 'https://www.zhaopin.com/',
        searchUrl: 'https://www.zhaopin.com/sou/',
        loginCheckApi: '/user/detail',
        loginSuccessCode: 200,
        cookieDomain: '.zhaopin.com',
        positionNetUrl: 'experiment/config',
        companyNetUrl: 'experiment/config',
        positionCountUrl: '/search/positions'
    },
    guopin: {
        homeUrl: 'https://www.iguopin.com/',
        searchUrl: 'https://www.iguopin.com/job/list?keyword=',
        loginCheckApi: '/personal/user/account/v1/userinfo',
        loginSuccessCode: 200,
        cookieDomain: '.chinahr.com',
        positionNetUrl: '/api/jobs/v1/info',
        companyNetUrl: '/company/index/v1/home',
        positionCountUrl: 'api/jobs/v1/recom-job'
    }
};

/** AI 任务超时时间（毫秒） */
export const AI_TASK_TIMEOUT = 5000;
