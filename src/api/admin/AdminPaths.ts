import {Path} from "@/api/Path.ts";

export class AdminPaths {
  /**
   * 获取公共应用配置
   */
  static getConfig: Path = {
    url: '/config',
    method: 'GET',
    prefix: 'admin'
  }

  /**
   * 获取协议内容
   */
  static getAgreements: Path = {
    url: '/agreements/{type}',
    method: 'GET',
    prefix: 'admin'
  }

  /**
   * 获取AI注册引导
   */
  static getAiRegisterGuide: Path = {
    url: '/ai-register-guide',
    method: 'GET',
    prefix: 'admin'
  }
}