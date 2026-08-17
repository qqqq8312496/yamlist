import React, { useMemo } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { useTabStore } from '../../stores/tabStore';
import { useTranslation } from '../../i18n/useTranslation';
import '../Task/AddTaskDialog.css';

interface StatsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsDialog: React.FC<StatsDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { tasks } = useTaskStore();
  const { tabs } = useTabStore();

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const progress = tasks.filter(t => t.status === 'progress').length;
    const done = tasks.filter(t => t.status === 'done').length;
    const overdue = tasks.filter(t => t.is_overdue && t.status !== 'done').length;
    const pinned = tasks.filter(t => t.is_pinned).length;
    const repeated = tasks.filter(t => t.repeat_type && t.repeat_type !== 'none').length;

    // 完成率
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    // 按标签统计
    const byTab: Record<string, { total: number; done: number; pending: number }> = {};
    const customTabs = tabs.filter(t => t.type === 'custom');

    customTabs.forEach(tab => {
      const tabTasks = tasks.filter(t => t.tab_id === tab.id);
      byTab[tab.id] = {
        total: tabTasks.length,
        done: tabTasks.filter(t => t.status === 'done').length,
        pending: tabTasks.filter(t => t.status !== 'done').length,
      };
    });

    // 本周完成统计
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // 本周一
    weekStart.setHours(0, 0, 0, 0);

    const completedThisWeek = tasks.filter(t => {
      if (t.status !== 'done' || !t.created_at) return false;
      const taskDate = new Date(t.created_at);
      return taskDate >= weekStart;
    }).length;

    return {
      total,
      pending,
      progress,
      done,
      overdue,
      pinned,
      repeated,
      completionRate,
      byTab,
      completedThisWeek,
    };
  }, [tasks, tabs]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const customTabs = tabs.filter(t => t.type === 'custom');

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="add-task-dialog" style={{ maxWidth: '550px' }}>
        <div className="dialog-header">
          <h2 className="dialog-title">📊 {t('statistics')}</h2>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-form" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* 总览统计 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '16px' }}>
              📈 {t('statistics')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{t('totalTasks')}</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#8b5cf6' }}>{stats.total}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{t('completionRate')}</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{stats.completionRate}%</div>
              </div>
            </div>

            {/* 进度条 */}
            <div style={{ marginTop: '16px' }}>
              <div style={{
                height: '8px',
                background: 'rgba(0, 0, 0, 0.08)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${stats.completionRate}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          </div>

          {/* 状态统计 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '12px' }}>
              📋 {t('statistics')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                borderRadius: '10px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>⭕ {t('incomplete')}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#3b82f6' }}>{stats.pending}</div>
              </div>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                borderRadius: '10px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>⏳ {t('incomplete')}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#f59e0b' }}>{stats.progress}</div>
              </div>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>✓ {t('completed')}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981' }}>{stats.done}</div>
              </div>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>⚠️ {t('tabOverdue')}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#ef4444' }}>{stats.overdue}</div>
              </div>
            </div>
          </div>

          {/* 特殊统计 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '12px' }}>
              ⭐ 特殊标记
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(245, 158, 11, 0.08)',
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>📌</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>{stats.pinned}</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>置顶任务</div>
              </div>
              <div style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(6, 182, 212, 0.08)',
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔁</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#06b6d4' }}>{stats.repeated}</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{t('tabRepeat')}</div>
              </div>
              <div style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(99, 102, 241, 0.08)',
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎯</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#6366f1' }}>{stats.completedThisWeek}</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{t('weekCompleted')}</div>
              </div>
            </div>
          </div>

          {/* 标签统计 */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '12px' }}>
              🏷️ {t('tags')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {customTabs.map(tab => {
                const tabStats = stats.byTab[tab.id];
                if (!tabStats || tabStats.total === 0) return null;

                const tabCompletionRate = Math.round((tabStats.done / tabStats.total) * 100);

                return (
                  <div
                    key={tab.id}
                    style={{
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '10px',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>
                        {tab.icon} {tab.name}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: tab.color }}>
                        {tabCompletionRate}%
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#888', marginBottom: '6px' }}>
                      <span>{t('totalTasks')}: {tabStats.total}</span>
                      <span>•</span>
                      <span>{t('completed')}: {tabStats.done}</span>
                      <span>•</span>
                      <span>{t('incomplete')}: {tabStats.pending}</span>
                    </div>
                    <div style={{
                      height: '4px',
                      background: 'rgba(0, 0, 0, 0.08)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${tabCompletionRate}%`,
                        height: '100%',
                        background: tab.color || '#8b5cf6',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 关闭按钮 */}
          <div className="dialog-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
