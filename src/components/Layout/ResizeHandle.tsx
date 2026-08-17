import React, { useState, useEffect, useRef } from 'react';
import './ResizeHandle.css';

export const ResizeHandle: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const lastResizeTime = useRef(0);
  const resizeThrottle = 50; // 节流：每50ms最多调用一次

  useEffect(() => {
    const handleMouseMove = async (e: MouseEvent) => {
      if (!isDragging) return;

      // 节流控制
      const now = Date.now();
      if (now - lastResizeTime.current < resizeThrottle) {
        return;
      }
      lastResizeTime.current = now;

      // 计算新的窗口大小
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      const newWidth = Math.max(300, Math.min(530, startSize.width + deltaX));
      const newHeight = Math.max(600, Math.min(1200, startSize.height + deltaY));

      // 调用 Electron API 调整窗口大小
      window.electronAPI.resizeWindow(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos, startSize]);

  const handleMouseDown = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });

    // 获取当前窗口大小
    const currentSize = await window.electronAPI.getWindowSize();
    setStartSize(currentSize);
  };

  return (
    <div
      className={`resize-handle ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      title="拖动调整窗口大小"
    >
      <div className="resize-handle-icon">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 11L11 1M4 11L11 4M7 11L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
};
