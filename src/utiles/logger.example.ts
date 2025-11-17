/**
 * 简化版 logger 的使用示例
 *
 * 新的 logger 无需手动配置，它的行为由运行环境自动决定：
 * - 开发环境 (npm run dev): 所有日志都会在控制台打印。
 * - 生产环境 (打包后): INFO 及更高级别的日志会自动写入文件，DEBUG 日志被忽略。
 */
import { logger } from './logger';

/**
 * 示例1: 基本用法
 * 在浏览器开发者工具中查看控制台输出。
 */
function basicUsageExample() {
  console.log('--- 运行基本用法示例 ---');
  logger.debug('这是一条调试信息，只在开发环境显示。');
  logger.info('这是一条普通信息。');
  logger.success('操作已成功！');
  logger.warning('这是一个警告。');
  logger.error('发生了一个错误。');
  console.log('--------------------------\n');
}

/**
 * 示例2: 记录对象和数组
 * logger 会自动将对象和数组转换为可读的 JSON 字符串。
 */
function objectLoggingExample() {
  console.log('--- 运行记录对象示例 ---');
  const user = { id: 1, name: 'Alice', role: 'admin' };
  logger.info('当前用户信息:', user);

  const tasks = ['任务1', '任务2', '已完成'];
  logger.debug('用户任务列表:', tasks);
  console.log('--------------------------\n');
}

/**
 * 运行所有示例
 */
function runAllExamples() {
  console.log('=== 开始运行日志示例 ===');
  basicUsageExample();
  objectLoggingExample();
  console.log('==========================');
  console.log(
    '请检查浏览器开发者工具的控制台，查看不同日志级别的输出和颜色。\n' +
    '如果是在生产环境，ERROR 日志会被写入到应用的日志文件中。'
  );
}

// 导出函数以便在其他地方单独调用
export {
  runAllExamples
};
