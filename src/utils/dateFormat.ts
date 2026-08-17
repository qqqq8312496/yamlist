/**
 * 日期格式化工具函数
 */

/**
 * 将日期字符串格式化为 "MM月DD日星期X" 格式
 * @param dateStr 日期字符串，格式如 "2024-01-15" 或 "2024-1-15"
 * @returns 格式化后的日期字符串，如 "01月15日星期一"
 */
export function formatDateWithWeekday(dateStr: string): string {
  if (!dateStr) return '';

  try {
    // 解析日期字符串
    const date = new Date(dateStr);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return dateStr; // 如果解析失败，返回原字符串
    }

    // 获取月、日
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 获取星期
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];

    return `${month}月${day}日星期${weekday}`;
  } catch (error) {
    console.error('日期格式化失败:', error);
    return dateStr;
  }
}

/**
 * 格式化时间字符串
 * @param timeStr 时间字符串，格式如 "14:30"
 * @returns 格式化后的时间字符串
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  return timeStr;
}
