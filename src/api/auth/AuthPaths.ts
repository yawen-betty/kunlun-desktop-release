import { Path } from "@/api/Path";

export class AuthPaths {
    /**
     * 微信登录
     */
    static wechatLogin: Path = {
        url: '/login/wechat',
        method: 'POST',
        prefix: 'auth'
    };
}