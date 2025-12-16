import {Path} from "@/api/Path.ts";

export class TutoringPaths {
  /**
   * 获取辅导记录列表
   */
  static getTutoringRecords: Path = {
    url: '/records',
    method: 'POST',
    prefix: 'tutoring'
  }

  /**
   * 删除辅导记录
   */
  static deleteTutoringRecord: Path = {
    url: '/{uuid}/delete',
    method: 'POST',
    prefix: 'tutoring'
  }

  /**
   * 下载辅导记录PDF
   */
  static downloadTutoringPdf: Path = {
    url: '/{uuid}/download',
    method: 'GET',
    prefix: 'tutoring'
  }
}
