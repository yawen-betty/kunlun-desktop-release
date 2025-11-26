import {Path} from '@/api/Path.ts';

/**
 * 管理相关接口路径定义
 * 包含应用配置、协议内容、AI注册引导等接口路径
 */
export class AdminPaths {
    /**
     * 获取公共应用配置
     */
    static getConfig: Path = {
        url: '/config',
        method: 'GET',
        prefix: 'admin'
    };

    /**
     * 获取协议内容
     */
    static getAgreements: Path = {
        url: '/agreements/{type}',
        method: 'GET',
        prefix: 'admin'
    };

    /**
     * 获取AI注册引导
     */
    static getAiRegisterGuide: Path = {
        url: '/ai-register-guide',
        method: 'GET',
        prefix: 'admin'
    };

    /**
     * 获取增值服务列表
     */
    static queryValueAddedServiceList: Path = {
        url: '/queryValueAddedServiceList',
        method: 'GET',
        prefix: 'admin'
    };

    /**
     * 提交问题反馈
     */
    static addFeedback: Path = {
        url: '/add/feedback',
        method: 'POST',
        prefix: 'admin'
    };

    /**
     * 获取反馈的回复列表
     */
    static queryFeedbackList: Path = {
        url: '/queryFeedbackList',
        method: 'POST',
        prefix: 'admin'
    };

    /**
     * 预约咨询
     */
    static getMakeAdvice: Path = {
        url: '/getMakeAdvice/{uuid}',
        method: 'GET',
        prefix: 'admin'
    };

    /**
     * 获取帮助中心状态
     */
    static getHelpCenterStatus: Path = {
        url: '/getHelpCenterStatus',
        method: 'GET',
        prefix: 'admin'
    };

    /**
     * 获取帮助中心内容
     */
    static getHelpCenter: Path = {
        url: '/getHelpCenter',
        method: 'GET',
        prefix: 'admin'
    };

    /**
     * 获取官网地址
     */
    static getWebsiteUrl: Path = {
        url: '/getWebsiteUrl',
        method: 'GET',
        prefix: 'admin'
    };
}
