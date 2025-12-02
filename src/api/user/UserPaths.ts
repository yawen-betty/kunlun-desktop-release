import { Path } from "@/api/Path.ts";

/**
 * 用户相关接口路径定义
 * 包含用户信息管理、模型账号配置等接口路径
 */
export class UserPaths {
    /**
     * 补全基本信息
     */
    static initProfile: Path = {
        url: '/profile/init',
        method: 'POST',
        prefix: 'user'
    };

    /**
     * 获取当前用户信息
     */
    static getProfile: Path = {
        url: '/profile',
        method: 'GET',
        prefix: 'user'
    };

    /**
     * 更新当前用户信息
     */
    static updateProfile: Path = {
        url: '/profile',
        method: 'PUT',
        prefix: 'user'
    };

    /**
     * 获取模型账号配置
     */
    static getModelAccount: Path = {
        url: '/model-account',
        method: 'GET',
        prefix: 'user'
    };

    /**
     * 保存模型账号配置
     */
    static saveModelAccount: Path = {
        url: '/model-account',
        method: 'POST',
        prefix: 'user'
    };

    /**
     * 注销账号
     */
    static deactivateAccount: Path = {
        url: '/deactivate',
        method: 'POST',
        prefix: 'user'
    };
}