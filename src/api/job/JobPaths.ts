import {Path} from "@/api/Path.ts";

export class JobPaths {
  /**
   * 创建一个新的求职任务
   */
  static createJobTask: Path = {
    url: '/job-tasks',
    method: 'POST',
    prefix: 'job'
  }

  /**
   * 获取当前执行的求职任务及职位列表
   */
  static getJobTask: Path = {
    url: '/job-tasks',
    method: 'GET',
    prefix: 'job'
  }

  /**
   * 删除一个求职任务
   */
  static deleteJobTask: Path = {
    url: '/job-tasks/{uuid}',
    method: 'DELETE',
    prefix: 'job'
  }

  /**
   * 激活或停用一个求职任务
   */
  static activateJobTask: Path = {
    url: '/job-tasks/activation',
    method: 'PUT',
    prefix: 'job'
  }

  /**
   * 获取匹配的职位列表（分页）
   */
  static queryMatchedPositions: Path = {
    url: '/matched-positions/query',
    method: 'POST',
    prefix: 'job'
  }

  /**
   * 标记或取消标记感兴趣的职位
   */
  static markPositionInterest: Path = {
    url: '/matched-positions/{uuid}/interest',
    method: 'PUT',
    prefix: 'job'
  }

  /**
   * 切换并激活指定的求职任务
   */
  static switchJobTask: Path = {
    url: '/job-tasks/{uuid}/switch',
    method: 'PUT',
    prefix: 'job'
  }

  /**
   * 获取除当前执行任务外的所有求职任务
   */
  static getOtherJobTasks: Path = {
    url: '/job-tasks/others',
    method: 'GET',
    prefix: 'job'
  }

  /**
   * 爬虫专用，批量入库职位数据
   */
  static crawlPositions: Path = {
    url: '/job-tasks/positions/crawl',
    method: 'POST',
    prefix: 'job'
  }
}