import {Path} from "@/api/Path.ts";

export class AdminPath {
  /**
   * 获取公共应用配置接口
   * @type {Path}
   */
  static getConfig: Path = {
    url: '/config',
    method: 'GET',
    prefix: 'admin'
  }

  /**
   * 获取协议内容接口
   * @type {Path}
   */
  static getAgreement: Path = {
    url: '/agreements/{type}',
    method: 'GET',
    prefix: 'admin'
  }
}