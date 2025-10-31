import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {Config} from "../src/Config";

interface FileInfo {
  signature: string;
  size: number;
}

interface PlatformInfo {
  signature: string;
  url: string;
  size: number;
}

interface LatestJson {
  version: string;
  notes: string;
  pub_date: string;
  platforms: {
    [key: string]: PlatformInfo;
  };
}

class LatestGenerator {
  encoding: BufferEncoding = 'utf-8';
  package: any;
  platform: string;
  bundlePath: string;

  constructor() {
    const packageData = fs.readFileSync('package.json', { encoding: this.encoding });
    this.package = JSON.parse(packageData);
    this.platform = process.platform;
    this.bundlePath = path.join('src-tauri', 'target', 'release', 'bundle');
  }

  private getTarget(): string {
    const platform = process.platform; // 'darwin', 'win32', 'linux'
    
    // 根据平台生成简化的 target 标识符
    switch (platform) {
      case 'darwin':
        return 'darwin';
      case 'win32':
        return 'windows';
      case 'linux':
        return 'linux';
      default:
        return platform;
    }
  }

  private getDownloadUrl(): string {
    // 从 tauri.conf.json 读取 endpoints 配置
    const tauriConfigPath = path.join('src-tauri', 'tauri.conf.json');
    const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, this.encoding));
    
    const endpoint = tauriConfig.plugins?.updater?.endpoints?.[0];
    if (!endpoint) {
      throw new Error('No updater endpoint found in tauri.conf.json');
    }
    
    // 替换 {{target}} 为实际的 target 值
    const target = this.getTarget();
    return endpoint.replace('{{target}}', target).replace('/latest.json', '/');
  }

  private getFileInfo(filePath: string): FileInfo {
    const buffer = fs.readFileSync(filePath);
    const signature = crypto.createHash('sha256').update(buffer).digest('hex');
    const size = buffer.length;
    return { signature, size };
  }

  private getPlatformFiles(): string[] {
    const bundleDir = this.bundlePath;

    if (!fs.existsSync(bundleDir)) {
      throw new Error(`Bundle directory not found: ${bundleDir}`);
    }

    const files: string[] = [];

    switch (this.platform) {
      case 'darwin': // macOS
        const macosDir = path.join(bundleDir, 'macos');
        if (fs.existsSync(macosDir)) {
          const macosFiles = fs.readdirSync(macosDir);
          files.push(...macosFiles.filter(f => f.endsWith('.dmg') || f.endsWith('.app.tar.gz')));
        }
        break;

      case 'win32': // Windows
        const nsis = path.join(bundleDir, 'nsis');
        const msi = path.join(bundleDir, 'msi');

        if (fs.existsSync(nsis)) {
          const nsisFiles = fs.readdirSync(nsis);
          files.push(...nsisFiles.filter(f => f.endsWith('.exe')));
        }
        if (fs.existsSync(msi)) {
          const msiFiles = fs.readdirSync(msi);
          files.push(...msiFiles.filter(f => f.endsWith('.msi')));
        }
        break;

      case 'linux': // Linux
        const deb = path.join(bundleDir, 'deb');
        const rpm = path.join(bundleDir, 'rpm');
        const appimage = path.join(bundleDir, 'appimage');

        if (fs.existsSync(deb)) {
          const debFiles = fs.readdirSync(deb);
          files.push(...debFiles.filter(f => f.endsWith('.deb')));
        }
        if (fs.existsSync(rpm)) {
          const rpmFiles = fs.readdirSync(rpm);
          files.push(...rpmFiles.filter(f => f.endsWith('.rpm')));
        }
        if (fs.existsSync(appimage)) {
          const appimageFiles = fs.readdirSync(appimage);
          files.push(...appimageFiles.filter(f => f.endsWith('.AppImage')));
        }
        break;
    }

    return files;
  }

  generateLatest() {
    console.info('Platform:', this.platform);
    console.info('Bundle path:', this.bundlePath);

    const files = this.getPlatformFiles();
    console.info('Found files:', files);

    if (files.length === 0) {
      throw new Error('No platform files found');
    }

    const downloadUrl = this.getDownloadUrl();
    const target = this.getTarget();
    console.info('Target:', target);
    console.info('Download URL base:', downloadUrl);

    const platforms: { [key: string]: PlatformInfo } = {};

    files.forEach(file => {
      const filePath = path.join(this.bundlePath, this.getPlatformSubDir(), file);
      const fileInfo = this.getFileInfo(filePath);

      // 根据文件扩展名确定平台标识
      let platformKey = '';
      if (file.endsWith('.dmg')) platformKey = 'darwin-x86_64';
      else if (file.endsWith('.app.tar.gz')) platformKey = 'darwin-aarch64';
      else if (file.endsWith('.exe')) platformKey = 'windows-x86_64';
      else if (file.endsWith('.msi')) platformKey = 'windows-x86_64';
      else if (file.endsWith('.deb')) platformKey = 'linux-x86_64';
      else if (file.endsWith('.rpm')) platformKey = 'linux-x86_64';
      else if (file.endsWith('.AppImage')) platformKey = 'linux-x86_64';

      if (platformKey) {
        platforms[platformKey] = {
          signature: fileInfo.signature,
          url: `${downloadUrl}${file}`, // 使用动态获取的 URL
          size: fileInfo.size
        };
      }
    });

    const latestJson: LatestJson = {
      version: this.package.version,
      notes: "更新说明", // 可以从环境变量或参数获取
      pub_date: new Date().toISOString(),
      platforms
    };

    const outputPath = path.join(this.bundlePath, 'latest.json');
    fs.writeFileSync(outputPath, JSON.stringify(latestJson, null, 2), this.encoding);

    console.info('Generated latest.json at:', outputPath);
    console.info('Content:', JSON.stringify(latestJson, null, 2));
  }

  private getPlatformSubDir(): string {
    switch (this.platform) {
      case 'darwin': return 'macos';
      case 'win32': return 'nsis'; // 或 'msi'，根据实际情况
      case 'linux': return 'deb'; // 或其他，根据实际情况
      default: return '';
    }
  }
}

const generator = new LatestGenerator();
generator.generateLatest();
