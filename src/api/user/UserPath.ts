import {Path} from "@/api/Path.ts";

export class UserPath {
  /**
   * 补全基本信息接口
   * @type {Path}
   */
  static initProfile: Path = {
    url: '/profile/init',
    method: 'POST',
    prefix: 'user'
  }

  /**
   * 获取当前用户信息接口
   * @type {Path}
   */
  static getProfile: Path = {
    url: '/profile',
    method: 'GET',
    prefix: 'user'
  }

  /**
   * 更新当前用户信息接口
   * @type {Path}
   */
  static updateProfile: Path = {
    url: '/profile',
    method: 'PUT',
    prefix: 'user'
  }

  /**
   * 上传头像接口
   * @type {Path}
   */
  static uploadAvatar: Path = {
    url: '/avatar/upload',
    method: 'POST',
    prefix: 'user'
  }

  /**
   * 获取模型账号配置接口
   * @type {Path}
   */
  static getModelAccount: Path = {
    url: '/model-account',
    method: 'GET',
    prefix: 'user'
  }

  /**
   * 保存模型账号配置接口
   * @type {Path}
   */
  static saveModelAccount: Path = {
    url: '/model-account',
    method: 'POST',
    prefix: 'user'
  }
}