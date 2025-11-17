/**
 * 简化的日志模块
 * - 开发环境：在控制台输出彩色的、所有级别的日志。
 * - 生产环境：将 'info' 及更高级别的日志写入到应用日志目录的 app.log 文件中。
 */
import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

// 定义日志级别
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

/**
 * 将日志写入文件（仅在生产环境）
 * @param message 要记录的日志消息
 */
async function fileLog(message: string) {
  // if (import.meta.env.PROD) {
  //   try {
  //     // 使用 Tauri API 写入到应用的默认日志目录
  //     // append: true 会在文件末尾追加，而不是覆盖
  //     await writeTextFile('app.log', `${message}\n`, { dir: BaseDirectory.Log, append: true });
  //   } catch (e) {
  //     // 如果文件写入失败，在控制台打印一个错误，避免应用崩溃
  //     console.error('Failed to write to log file:', e);
  //   }
  // }
}

/**
 * 核心日志处理函数
 * @param level 日志级别
 * @param messages 日志内容
 */
function handleLog(level: LogLevel, messages: any[]) {
  // 仅在开发环境显示 DEBUG 级别的日志
  if (level === LogLevel.DEBUG && !import.meta.env.DEV) {
    return;
  }

  const now = new Date().toISOString();
  // 将所有消息（包括对象）转换成字符串
  const formattedMessages = messages.map(msg =>
    typeof msg === 'object' ? JSON.stringify(msg, null, 2) : String(msg)
  ).join(' ');

  const logString = `[${now}] [${level}] ${formattedMessages}`;

  // 根据不同级别，在控制台使用不同方法和颜色
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(logString);
      break;
    case LogLevel.INFO:
      console.info(logString);
      break;
    case LogLevel.SUCCESS:
      console.log(`%c${logString}`, 'color: #28a745'); // 绿色
      break;
    case LogLevel.WARNING:
      console.warn(logString);
      break;
    case LogLevel.ERROR:
      console.error(logString);
      break;
  }

  // 在生产环境中，将 INFO 及以上级别的日志写入文件  TODO
  // if (level !== LogLevel.DEBUG) {
  //   fileLog(logString);
  // }
}

/**
 * 导出的 logger 对象，用法：logger.info('message', { object })
 */
export const logger = {
  debug: (...messages: any[]) => handleLog(LogLevel.DEBUG, messages),
  info: (...messages: any[]) => handleLog(LogLevel.INFO, messages),
  success: (...messages: any[]) => handleLog(LogLevel.SUCCESS, messages),
  warning: (...messages: any[]) => handleLog(LogLevel.WARNING, messages),
  error: (...messages: any[]) => handleLog(LogLevel.ERROR, messages),
};

