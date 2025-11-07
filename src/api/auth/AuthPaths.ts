import {Path} from "@/api/Path.ts";

/**
 * 认证相关接口路径定义
 * 包含微信登录、退出登录、二维码生成等接口路径
 */
export class AuthPaths {
    /**
     * 微信登录
     */
    static wechatLogin: Path = {
        url: '/login/wechat',
        method: 'POST',
        prefix: 'auth'
    };

    /**
     * 退出登录
     */
    static logout: Path = {
        url: '/logout',
        method: 'POST',
        prefix: 'auth'
    };

    /**
     * 微信登录回调
     */
    static wechatCallback: Path = {
        url: '/wechat/callback',
        method: 'GET',
        prefix: 'auth'
    };

    /**
     * 获取登录Token
     */
    static getToken: Path = {
        url: '/token',
        method: 'GET',
        prefix: 'auth'
    };

    /**
     * 生成微信扫码登录二维码
     */
    static generateQrcode: Path = {
        url: '/qrcode/generate',
        method: 'GET',
        prefix: 'auth'
    };
}
