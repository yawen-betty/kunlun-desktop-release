import { Path } from "@/api/Path.ts";

/**
 * 文件相关接口路径定义
 * 包含文件上传等接口路径
 */
export class FilePaths {
    /**
     * 上传文件
     */
    static upload: Path = {
        url: '/upload',
        method: 'POST',
        prefix: 'file'
    };
}