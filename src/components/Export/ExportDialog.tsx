import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { useDiaryStore } from '../../stores/diaryStore';
import { useTabStore } from '../../stores/tabStore';
import { useTranslation } from '../../i18n/useTranslation';
import '../Task/AddTaskDialog.css';
import './ExportDialog.css';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { tasks } = useTaskStore();
  const { diaries } = useDiaryStore();
  const { tabs } = useTabStore();
  const [format, setFormat] = useState<'json' | 'txt'>('json');
  const [dateRange, setDateRange] = useState<'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  // 根据时间段过滤任务
  const filteredTasks = tasks.filter(task => {
    if (dateRange === 'all') return true;

    if (!task.due_date) return false; // 没有截止日期的任务不包含在自定义时间段内

    const taskDate = new Date(task.due_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && taskDate < start) return false;
    if (end && taskDate > end) return false;

    return true;
  });

  const handleExport = () => {
    let content = '';
    let filename = '';
    let mimeType = '';

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      // JSON 格式导出 - 导出所有数据
      const exportData = {
        version: '1.0',
        exportTime: new Date().toISOString(),
        data: {
          tasks: filteredTasks,
          diaries: diaries,
          tabs: tabs.filter(tab => tab.type === 'custom'), // 只导出自定义标签
        },
      };
      content = JSON.stringify(exportData, null, 2);
      filename = `yamlist-backup-${timestamp}.json`;
      mimeType = 'application/json';
    } else {
      // TXT 格式导出
      const lines = [
        '='.repeat(50),
        '山药List 数据导出',
        `导出时间: ${new Date().toLocaleString('zh-CN')}`,
        '='.repeat(50),
        '',
        `📋 任务总数: ${filteredTasks.length}`,
        `📖 日记总数: ${diaries.length}`,
        `🏷️  自定义标签: ${tabs.filter(tab => tab.type === 'custom').length}`,
        '',
        '='.repeat(50),
        '任务列表',
        '='.repeat(50),
        '',
      ];

      filteredTasks.forEach((task, index) => {
        lines.push(`${index + 1}. ${task.title}`);
        lines.push(`   状态: ${task.status === 'done' ? '✓ 已完成' : task.status === 'progress' ? '⏳ 进行中' : '⭕ 待办'}`);

        if (task.due_date) {
          lines.push(`   截止: ${task.due_date}${task.due_time ? ' ' + task.due_time : ''}`);
        }

        if (task.repeat_type && task.repeat_type !== 'none') {
          const repeatMap = {
            daily: '每天',
            weekly: '每周',
            monthly: '每月',
          };
          lines.push(`   重复: ${repeatMap[task.repeat_type as keyof typeof repeatMap] || task.repeat_type}`);
        }

        if (task.note) {
          lines.push(`   备注: ${task.note}`);
        }

        if (task.is_pinned) {
          lines.push(`   📌 已置顶`);
        }

        if (task.is_overdue) {
          lines.push(`   ⚠️ 已逾期`);
        }

        lines.push('');
      });

      // 添加日记部分
      if (diaries.length > 0) {
        lines.push('');
        lines.push('='.repeat(50));
        lines.push('日记列表');
        lines.push('='.repeat(50));
        lines.push('');

        diaries.forEach((diary, index) => {
          lines.push(`${index + 1}. ${diary.date}`);
          lines.push(`   ${diary.content}`);
          lines.push('');
        });
      }

      content = lines.join('\n');
      filename = `yamlist-backup-${timestamp}.txt`;
      mimeType = 'text/plain';
    }

    // 创建下载链接
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 显示成功消息
    alert(`✅ 成功导出数据到 ${filename}\n\n📋 任务: ${filteredTasks.length}\n📖 日记: ${diaries.length}\n🏷️  标签: ${tabs.filter(tab => tab.type === 'custom').length}`);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const stats = {
    total: filteredTasks.length,
    pending: filteredTasks.filter(t => t.status === 'pending').length,
    progress: filteredTasks.filter(t => t.status === 'progress').length,
    done: filteredTasks.filter(t => t.status === 'done').length,
    overdue: filteredTasks.filter(t => t.is_overdue).length,
  };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 10001 }} onClick={handleBackdropClick}>
      <div className="add-task-dialog export-dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">📤 {t('exportData')}</h2>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-form">
          {/* 统计信息 */}
          <div className="export-stats-box">
            <div className="export-stats-title">
              📊 {t('statistics')}
            </div>
            <div className="export-stats-grid">
              <div className="export-stat-item">
                <span>{t('totalTasks')}</span>
                <span className="export-stat-value total">{stats.total}</span>
              </div>
              <div className="export-stat-item">
                <span>{t('completed')}</span>
                <span className="export-stat-value done">{stats.done}</span>
              </div>
              <div className="export-stat-item">
                <span>{t('incomplete')}</span>
                <span className="export-stat-value pending">{stats.pending}</span>
              </div>
              <div className="export-stat-item">
                <span>{t('incomplete')}</span>
                <span className="export-stat-value progress">{stats.progress}</span>
              </div>
              {stats.overdue > 0 && (
                <div className="export-stat-item full-width">
                  <span>⚠️ {t('tabOverdue')}</span>
                  <span className="export-stat-value overdue">{stats.overdue}</span>
                </div>
              )}
            </div>
          </div>

          {/* 时间段选择 */}
          <div className="form-group">
            <label className="form-label">{t('export')}</label>
            <div className="export-date-range">
              <label className={`export-range-option ${dateRange === 'all' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="dateRange"
                  value="all"
                  checked={dateRange === 'all'}
                  onChange={() => setDateRange('all')}
                />
                {t('allTasks')}
              </label>

              <label className={`export-range-option ${dateRange === 'custom' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="dateRange"
                  value="custom"
                  checked={dateRange === 'custom'}
                  onChange={() => setDateRange('custom')}
                />
                {t('export')}
              </label>
            </div>

            {/* 自定义时间段输入 */}
            {dateRange === 'custom' && (
              <div className="export-custom-dates">
                <div className="export-date-inputs">
                  <div className="export-date-group">
                    <label>{t('dueDate')}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="export-date-group">
                    <label>{t('dueDate')}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="export-date-tip">
                  💡 将导出截止日期在此时间段内的任务
                </div>
              </div>
            )}
          </div>

          {/* 格式选择 */}
          <div className="form-group">
            <label className="form-label">{t('export')}</label>
            <div className="export-format-options">
              <label className={`export-format-card ${format === 'json' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                />
                <div className="export-format-name">JSON</div>
                <div className="export-format-desc">结构化数据，可导入</div>
              </label>

              <label className={`export-format-card ${format === 'txt' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="txt"
                  checked={format === 'txt'}
                  onChange={() => setFormat('txt')}
                />
                <div className="export-format-name">TXT</div>
                <div className="export-format-desc">纯文本，易读</div>
              </label>
            </div>
          </div>

          {/* 预览提示 */}
          <div className="export-tip">
            💡 提示: 导出的文件将保存到下载文件夹
          </div>

          {/* 按钮组 */}
          <div className="dialog-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleExport}
              disabled={filteredTasks.length === 0}
            >
              📤 {t('export')} ({filteredTasks.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
