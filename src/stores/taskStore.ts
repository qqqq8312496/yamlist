import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 判断任务是否逾期
const isTaskOverdue = (dueDate?: string, dueTime?: string): boolean => {
  if (!dueDate) return false;

  const now = new Date();
  const dueDateObj = new Date(dueDate);

  if (dueTime) {
    const [hours, minutes] = dueTime.split(':').map(Number);
    dueDateObj.setHours(hours, minutes, 0, 0);
  } else {
    // 如果没有时间，设置为当天23:59:59
    dueDateObj.setHours(23, 59, 59, 999);
  }

  return now > dueDateObj;
};

// 计算下一次重复任务的日期
const getNextRepeatDate = (currentDate: string, repeatType: string): string => {
  const date = new Date(currentDate);

  switch (repeatType) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return currentDate;
  }

  return date.toISOString().split('T')[0];
};

export interface Task {
  id: number;
  title: string;
  status: 'pending' | 'done' | 'strike' | 'progress';
  progress: number;
  note?: string;
  tab_id?: string;
  due_date?: string;
  due_time?: string;
  repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  repeat_config?: any;
  is_overdue?: boolean;
  is_pinned?: boolean;
  order_index?: number;
  created_at?: string;
}

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  toggleTaskStatus: (id: number) => void;
  pinTask: (id: number) => void;
  clearCompleted: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      // Neutral demo data keeps a fresh install useful without exposing private dates or notes.
      tasks: [
        {
          id: 1,
          title: '试试添加一个任务',
          status: 'pending',
          progress: 0,
          note: '任务、标签和心情都可以随时修改',
          is_pinned: true,
          order_index: 0,
          tab_id: 'all',
        },
        {
          id: 2,
          title: '探索主题配色',
          status: 'progress',
          progress: 60,
          order_index: 1,
          tab_id: 'life',
        },
        {
          id: 3,
          title: '整理本周计划',
          status: 'pending',
          progress: 0,
          order_index: 2,
          tab_id: 'work',
        },
      ],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) =>
        set((state) => {
          const maxId = state.tasks.length > 0 ? Math.max(...state.tasks.map(t => t.id)) : 0;
          const newTask: Task = {
            id: maxId + 1,
            title: task.title,
            status: 'pending',
            progress: 0,
            note: task.note,
            due_date: task.due_date,
            due_time: task.due_time,
            repeat_type: task.repeat_type as any,
            tab_id: task.tab_id,
            is_pinned: task.is_pinned || false,
            is_overdue: isTaskOverdue(task.due_date, task.due_time),
            order_index: state.tasks.length,
            created_at: new Date().toISOString(),
          };
          return {
            tasks: [...state.tasks, newTask],
          };
        }),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === id) {
              const updatedTask = { ...task, ...updates };
              // 重新计算逾期状态
              updatedTask.is_overdue = isTaskOverdue(updatedTask.due_date, updatedTask.due_time);
              return updatedTask;
            }
            return task;
          }),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      toggleTaskStatus: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          const newStatus: Task['status'] = task.status === 'done' ? 'pending' : 'done';

          // 如果是重复任务且刚完成，创建下一次任务
          if (newStatus === 'done' && task.repeat_type && task.repeat_type !== 'none' && task.due_date) {
            const maxId = state.tasks.length > 0 ? Math.max(...state.tasks.map(t => t.id)) : 0;
            const nextDate = getNextRepeatDate(task.due_date, task.repeat_type);

            const nextTask: Task = {
              ...task,
              id: maxId + 1,
              status: 'pending',
              progress: 0,
              due_date: nextDate,
              is_overdue: false,
              created_at: new Date().toISOString(),
            };

            return {
              tasks: [
                ...state.tasks.map((t) =>
                  t.id === id ? { ...t, status: newStatus as Task['status'] } : t
                ),
                nextTask,
              ],
            };
          }

          return {
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, status: newStatus as Task['status'] } : t
            ),
          };
        }),
      pinTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, is_pinned: !task.is_pinned } : task
          ),
        })),
      clearCompleted: () =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.status !== 'done'),
        })),
    }),
    {
      name: 'yamlist-tasks',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
