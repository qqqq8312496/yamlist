import React, { useEffect, useRef, useState } from 'react';
import { Task, useTaskStore } from '../../stores/taskStore';
import { useUIStore } from '../../stores/uiStore';
import { useBackgroundStore } from '../../stores/backgroundStore';
import { TaskItem } from './TaskItem';
import './TaskList.css';

interface TaskListProps {
  activeTab: string;
  onEditTask?: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ activeTab, onEditTask }) => {
  const { tasks } = useTaskStore();
  const { hideCompleted } = useUIStore();
  const { taskAreaColor, backgroundImage, opacity } = useBackgroundStore();
  const listRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);

  // 根据激活的标签过滤任务
  let filteredTasks = tasks.filter((task) => {
    // 系统标签
    if (activeTab === 'all') return task.status !== 'done';
    if (activeTab === 'completed') return task.status === 'done';
    if (activeTab === 'repeat') return task.repeat_type && task.repeat_type !== 'none';
    if (activeTab === 'overdue') return task.is_overdue && task.status !== 'done';

    // 自定义标签 - 根据 tab_id 过滤
    return task.tab_id === activeTab;
  });

  // 如果隐藏已完成，过滤掉已完成的任务
  if (hideCompleted && activeTab !== 'completed') {
    filteredTasks = filteredTasks.filter(task => task.status !== 'done');
  }

  // 排序：置顶 -> 逾期 -> 普通 -> 已完成
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    if (a.is_overdue && !b.is_overdue) return -1;
    if (!a.is_overdue && b.is_overdue) return 1;
    return (a.order_index || 0) - (b.order_index || 0);
  });

  // 检测是否有滚动内容
  useEffect(() => {
    const checkScroll = () => {
      if (listRef.current) {
        const hasScrollableContent = listRef.current.scrollHeight > listRef.current.clientHeight;
        setHasScroll(hasScrollableContent);
      }
    };

    checkScroll();

    // 监听窗口大小变化
    const resizeObserver = new ResizeObserver(checkScroll);
    if (listRef.current) {
      resizeObserver.observe(listRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [sortedTasks]);

  return (
    <div
      ref={listRef}
      className={`task-list ${hasScroll ? 'has-scroll' : ''}`}
      style={{
        background: taskAreaColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: opacity / 100,
      }}
    >
      {sortedTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <div className="empty-text">暂无任务</div>
        </div>
      ) : (
        sortedTasks.map((task) => <TaskItem key={task.id} task={task} onEditClick={onEditTask} />)
      )}

      {/* 底部任务统计 */}
      <div className="task-count-text">
        共 {filteredTasks.length} 项任务
      </div>
    </div>
  );
};
