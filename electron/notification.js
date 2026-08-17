const { Notification } = require('electron');

/**
 * 显示系统通知
 */
function showNotification(options) {
  const { title, body, icon } = options;

  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title || '山药List',
      body: body || '',
      icon: icon || '',
      silent: false,
    });

    notification.show();

    return notification;
  }

  return null;
}

/**
 * 显示任务逾期通知
 */
function showOverdueNotification(task) {
  return showNotification({
    title: '任务逾期提醒',
    body: `任务"${task.title}"已逾期，请尽快处理！`,
    icon: 'warning',
  });
}

/**
 * 显示任务提醒通知
 */
function showTaskReminder(task, advanceMinutes) {
  const timeText = advanceMinutes > 0 ? `${advanceMinutes}分钟后` : '现在';
  return showNotification({
    title: '任务提醒',
    body: `任务"${task.title}"将在${timeText}到期`,
    icon: 'info',
  });
}

module.exports = {
  showNotification,
  showOverdueNotification,
  showTaskReminder,
};
