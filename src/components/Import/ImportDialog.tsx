import React, { useRef } from 'react';
import { useTaskStore, Task } from '../../stores/taskStore';
import { useDiaryStore } from '../../stores/diaryStore';
import { useTabStore } from '../../stores/tabStore';
import { useTranslation } from '../../i18n/useTranslation';
import * as XLSX from 'xlsx';
import '../Task/AddTaskDialog.css';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setTasks } = useTaskStore();
  const { saveDiary } = useDiaryStore();
  const { tabs, addTab } = useTabStore();

  if (!isOpen) {
    return null;
  }

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.json')) {
        // 导入 JSON
        const text = await file.text();
        const importedData = JSON.parse(text);

        // 检查是否是新格式的完整备份
        if (importedData.version && importedData.data) {
          // 新格式：包含所有数据
          const { tasks: importedTasks, diaries: importedDiaries, tabs: importedTabs } = importedData.data;

          let tasksCount = 0;
          let diariesCount = 0;
          let tabsCount = 0;

          // 确认导入
          const confirmed = window.confirm(
            `将导入以下数据（覆盖现有数据）：\n\n` +
            `📋 任务: ${importedTasks?.length || 0}\n` +
            `📖 日记: ${importedDiaries?.length || 0}\n` +
            `🏷️  标签: ${importedTabs?.length || 0}\n\n` +
            `⚠️ 警告：此操作将覆盖所有现有数据！\n是否继续？`
          );

          if (!confirmed) {
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            return;
          }

          // 导入任务
          if (importedTasks && Array.isArray(importedTasks)) {
            const validTasks = importedTasks.filter((task: any) => task.title);
            setTasks(validTasks);
            tasksCount = validTasks.length;
          }

          // 导入日记
          if (importedDiaries && Array.isArray(importedDiaries)) {
            importedDiaries.forEach((diary: any) => {
              if (diary.date && diary.content) {
                saveDiary(diary.date, diary.content);
                diariesCount++;
              }
            });
          }

          // 导入自定义标签
          if (importedTabs && Array.isArray(importedTabs)) {
            importedTabs.forEach((tab: any) => {
              if (tab.type === 'custom' && !tabs.find(t => t.id === tab.id)) {
                addTab(tab);
                tabsCount++;
              }
            });
          }

          alert(`✅ 导入成功！\n\n📋 任务: ${tasksCount}\n📖 日记: ${diariesCount}\n🏷️  标签: ${tabsCount}`);
          onClose();

        } else if (Array.isArray(importedData)) {
          // 旧格式：仅包含任务数组
          const validTasks = importedData.filter((task: any) => task.title);

          const confirmed = window.confirm(
            `将导入 ${validTasks.length} 个任务（覆盖现有任务）\n\n⚠️ 警告：此操作将覆盖所有现有任务！\n是否继续？`
          );

          if (!confirmed) {
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            return;
          }

          setTasks(validTasks);
          alert(`✅ 成功导入 ${validTasks.length} 个任务！`);
          onClose();

        } else {
          alert('无效的 JSON 文件格式');
        }

      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // 导入 Excel（仅支持任务）
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
          alert('Excel 文件为空');
          return;
        }

        const newTasks: Task[] = data.map((row: any, index: number) => ({
          id: index + 1,
          title: row['标题'] || row['title'] || row['任务'] || '未命名任务',
          status: row['状态'] === '已完成' || row['status'] === 'done' ? 'done' : 'pending',
          progress: parseInt(row['进度'] || row['progress'] || '0') || 0,
          note: row['备注'] || row['note'] || '',
          tab_id: row['分类'] || row['tab_id'] || '',
          due_date: row['截止日期'] || row['due_date'] || '',
          due_time: row['截止时间'] || row['due_time'] || '',
          repeat_type: row['重复'] || row['repeat_type'] || 'none',
          is_pinned: row['置顶'] === '是' || row['is_pinned'] === true,
          is_overdue: false,
          order_index: index,
          created_at: new Date().toISOString(),
        }));

        const confirmed = window.confirm(
          `将导入 ${newTasks.length} 个任务（覆盖现有任务）\n\n⚠️ 警告：此操作将覆盖所有现有任务！\n是否继续？`
        );

        if (!confirmed) {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        setTasks(newTasks);
        alert(`✅ 成功导入 ${newTasks.length} 个任务！`);
        onClose();

      } else {
        alert('不支持的文件格式，请使用 .json 或 .xlsx 文件');
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请检查文件格式');
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="add-task-dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">📥 {t('importData')}</h3>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-form">
          <p style={{ marginBottom: '16px', color: '#666', fontSize: '13px', textAlign: 'center' }}>
            支持导入 JSON 或 Excel 文件
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,.xlsx,.xls"
            style={{ display: 'none' }}
          />

          <div className="dialog-actions">
            <button className="btn btn-primary" onClick={handleImportJSON} style={{ flexDirection: 'column', gap: '4px', padding: '16px' }}>
              <span style={{ fontSize: '24px' }}>📄</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>选择文件</span>
              <span style={{ fontSize: '11px', opacity: '0.8' }}>支持 .json / .xlsx</span>
            </button>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', fontSize: '12px', color: '#666' }}>
            <strong>提示：</strong>
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              <li>JSON 文件应包含任务数组</li>
              <li>Excel 文件第一行应为标题行</li>
              <li>支持的列名：标题、状态、备注、截止日期等</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
