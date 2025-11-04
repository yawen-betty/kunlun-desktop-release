import {Path} from "@/api/Path.ts";

export class FilePaths {
  /**
   * 上传文件
   */
  static upload: Path = {
    url: '/upload',
    method: 'POST',
    prefix: 'file'
  }
}