import {Path} from "@/api/Path.ts";

export class InterviewPaths {
  /**
   * 获取面试记录列表
   */
  static getInterviewRecords: Path = {
    url: '/records',
    method: 'POST',
    prefix: 'interview'
  }

  /**
   * 删除面试记录
   */
  static deleteInterviewRecord: Path = {
    url: '/{uuid}/delete',
    method: 'POST',
    prefix: 'interview'
  }
}
