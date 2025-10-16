import {Path} from "@/api/Path.ts";

export class LoginPaths{
  /**
   * 登录
   * @type {Path}
   */
  static loginAPI: Path = {
    url: '/login',
    method: 'POST',
    prefix: ''
  };
}
