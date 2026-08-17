import React from 'react';
import { useTaskStore } from '../../stores/taskStore';
import './StatsCards.css';

export const StatsCards: React.FC = () => {
  const { tasks } = useTaskStore();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'done').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const overdue = tasks.filter((t) => t.is_overdue).length;

  return (
    <div className="stats-cards">
      <div className="stat-card" style={{ borderLeftColor: '#8B5CF6' }}>
        <div className="stat-number">{total}</div>
        <div className="stat-label">总</div>
      </div>
      <div className="stat-card" style={{ borderLeftColor: '#10B981' }}>
        <div className="stat-number">{completed}</div>
        <div className="stat-label">完</div>
      </div>
      <div className="stat-card" style={{ borderLeftColor: '#F59E0B' }}>
        <div className="stat-number">{pending}</div>
        <div className="stat-label">待</div>
      </div>
      <div className="stat-card" style={{ borderLeftColor: '#EF4444' }}>
        <div className="stat-number">{overdue}</div>
        <div className="stat-label">期</div>
      </div>
    </div>
  );
};
