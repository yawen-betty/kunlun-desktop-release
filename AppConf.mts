import * as fs from 'fs';
class AppConfig {
    /**
     * 编码
     * @type {string}
     */
    // @ts-ignore
    encoding: BufferEncoding = 'utf-8';

    /**
     * 构建时间戳
     * @type {number}
     */
    timestamp: number = Date.now();

    /**
     * 构建环境
     *
     * @type {"dev" | "test" | "local" | "prod"}
     */
    env: 'dev' | 'test' | 'prod' | 'local' = 'dev';

    /**
     * package.json 数据
     *
     */
    package: any;

    /**
     * 配置 package.json中 config部分.
     * @type {{[p: string]: {baseUrl: string, basePath: string, downloadUrl: string}}}
     */
    config: {
        'baseUrl': string,
        'basePath': string,
        'downloadUrl': string
    };

    build: {
        'name': string
    };

    constructor() {
        const buildData = fs.readFileSync('package.json', {encoding: this.encoding});
        this.package = JSON.parse(buildData);
        // @ts-ignore
        this.env = process.env.APP_ENV || 'dev';
        this.config = this.package.config[this.env];
        this.build = this.package.config.build;
    }

    genConfig() {
        //= =============================================================
        console.info('$baseUrl=>', this.config.baseUrl);
        console.info('$basePath=>', this.config.basePath);
        console.info('$downloadUrl=>', this.config.downloadUrl)

        //= ===============================================
        const now = new Date(this.timestamp);
        const dataStr = now.getFullYear() + '' + ((now.getMonth() + 1) < 10 ? ('0' + (now.getMonth() + 1)) :(now.getMonth() + 1)) + '' + ((now.getDate()) < 10 ? ('0' + (now.getDate())) :(now.getDate()));
        const buildVersion = `V${this.package.version}-${this.env[0].toLocaleUpperCase()}${dataStr}`;
        const evn = `/**
 * 该文件自动生成,请不要手动修改!
 * 执行 npm run config:xxxx 进生成. xxxx:[local,dev,test,prod]
 */
export class Config {
  static readonly version: string = '${this.package.version}';
  static readonly packageTime: string = '${dataStr}';
  static readonly timestamp: number = ${this.timestamp};
  static readonly baseUrl = '${this.config.baseUrl}';
  static readonly basePath = '${this.config.basePath}';
  static readonly downloadUrl = '${this.config.downloadUrl}';
  static readonly env : 'dev' | 'test' | 'prod' | 'local' = '${this.env}';
  static readonly buildVersion: string = '${buildVersion}';
  static readonly buildName: string = '${this.build.name}';
}
`;
        fs.writeFileSync('src/Config.ts', evn, this.encoding);
    }

}

const config = new AppConfig();

config.genConfig();
