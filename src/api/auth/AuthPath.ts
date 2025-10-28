import {Path} from "@/api/Path.ts";

export class AuthPath {
  /**
   * 微信登录接口
   * @type {Path}
   */
  static wechatLogin: Path = {
    url: '/login/wechat',
    method: 'POST',
    prefix: 'auth'
  }
}