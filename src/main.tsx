import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CalendarWindow } from './CalendarWindow';
import './styles/global.css';
import './styles/themes.css';
import './styles/animations.css';

// 检测是否是日历窗口模式（支持查询参数和hash两种方式）
const urlParams = new URLSearchParams(window.location.search);
const isCalendarMode = urlParams.get('calendar') === '1' || window.location.hash === '#calendar';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isCalendarMode ? <CalendarWindow /> : <App />}
  </React.StrictMode>
);
