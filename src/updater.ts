import { check, Update } from '@tauri-apps/plugin-updater';
// import { relaunch } from '@tauri-apps/api/process';
import {message} from "@/utiles/Message.ts";
import {Message} from "view-ui-plus";
import { relaunch } from '@tauri-apps/plugin-process';

interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
}

// 解析版本号
function parseVersion(version: string): VersionInfo {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

// 判断是否需要强制更新
function isForceUpdate(currentVersion: string, newVersion: string): boolean {
  const current = parseVersion(currentVersion);
  const latest = parseVersion(newVersion);

  // major 或 minor 变化 = 强制更新
  return latest.major > current.major || latest.minor > current.minor;
}

// 检查更新
export async function checkForUpdates(currentVersion: string, isManual: boolean = false) {
  try {
    const update = await check();
    console.info('//////////////////更新数据更新数据',update)

    if (!update) {
      if (isManual) {
        // 手动检查时提示已是最新版本
        message.success(Message, '当前已是最新版本！');
      }
      return null;
    }

    const { version: newVersion } = update;
    const forceUpdate = isForceUpdate(currentVersion, newVersion);
    return {
      update,
      newVersion,
      forceUpdate
    };
  } catch (error) {
    console.error('检查更新失败:', error);
    return null;
  }
}

// 执行更新
export async function performUpdate(update: Update, onProgress?: (progress: number) => void) {
  try {
    let downloaded = 0;
    let contentLength = 0;

    // 下载更新
    await update.downloadAndInstall((event: any) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength || 0;
          console.log(`开始下载，总大小: ${contentLength} bytes`);
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          const progress = contentLength > 0 ? (downloaded / contentLength) * 100 : 0;
          onProgress?.(progress);
          break;
        case 'Finished':
          console.log('下载完成');
          break;
      }
    });

    // 重启应用
    await relaunch();
  } catch (error) {
    console.error('更新失败:', error);
    throw error;
  }
}
