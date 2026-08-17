import React, { useEffect, useState } from 'react';
import { useToastStore, Toast as ToastType } from '../../stores/toastStore';
import './Toast.css';

const ToastIcon: React.FC<{ type: ToastType['type'] }> = ({ type }) => {
  switch (type) {
    case 'success':
      return <span className="toast-icon success">✓</span>;
    case 'error':
      return <span className="toast-icon error">✕</span>;
    case 'warning':
      return <span className="toast-icon warning">⚠</span>;
    case 'info':
    default:
      return <span className="toast-icon info">ℹ</span>;
  }
};

const ToastItem: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const { removeToast } = useToastStore();
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  return (
    <div
      className={`toast-item toast-${toast.type} ${isExiting ? 'toast-exit' : ''}`}
      onClick={handleClose}
    >
      <ToastIcon type={toast.type} />
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close" onClick={handleClose}>✕</button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
