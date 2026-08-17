const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

/**
 * 创建系统托盘
 */
function createTray(mainWindow) {
  // 托盘图标（临时使用空图标，后续替换）
  const iconPath = path.join(__dirname, '../assets/icons/tray.png');

  // 创建托盘图标
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
  } catch (error) {
    // 如果图标不存在，创建一个空的
    trayIcon = nativeImage.createEmpty();
  }

  const tray = new Tray(trayIcon);

  // 设置提示文本
  tray.setToolTip('山药List');

  // 创建上下文菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏',
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: '快捷添加任务',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('tray-action', 'quick-add');
      },
    },
    { type: 'separator' },
    {
      label: '设置',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('tray-action', 'settings');
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        mainWindow.destroy();
        process.exit(0);
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // 单击托盘图标显示/隐藏窗口
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  return tray;
}

/**
 * 更新托盘徽章（显示未完成任务数）
 */
function updateTrayBadge(tray, count) {
  if (count > 0) {
    tray.setTitle(` ${count}`);
  } else {
    tray.setTitle('');
  }
}

module.exports = {
  createTray,
  updateTrayBadge,
};
