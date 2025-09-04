import React, { useState, useCallback, useEffect } from 'react';
import styles from './ToastNotifications.module.css';

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [onRemove, toast.duration]);

  const getIcon = (type) => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return '✅';
      case TOAST_TYPES.ERROR:
        return '❌';
      case TOAST_TYPES.WARNING:
        return '⚠️';
      case TOAST_TYPES.INFO:
      default:
        return 'ℹ️';
    }
  };

  const toastClasses = [
    styles.toast,
    styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`],
    toast.isExiting && styles.toastExiting
  ].filter(Boolean).join(' ');

  return (
    <div className={toastClasses}>
      <div className={styles.toastIcon}>
        {getIcon(toast.type)}
      </div>
      <div className={styles.toastContent}>
        <div className={styles.toastTitle}>{toast.title}</div>
        {toast.message && (
          <div className={styles.toastMessage}>{toast.message}</div>
        )}
      </div>
      <button 
        className={styles.toastClose}
        onClick={onRemove}
        aria-label="Close notification"
      >
        ×
      </button>
      <div className={styles.toastProgress} />
    </div>
  );
};

// Custom hook for managing toasts
export const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: TOAST_TYPES.INFO,
      duration: 4000,
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title, message, duration) => {
    return addToast({ type: TOAST_TYPES.SUCCESS, title, message, duration });
  }, [addToast]);

  const showError = useCallback((title, message, duration) => {
    return addToast({ type: TOAST_TYPES.ERROR, title, message, duration });
  }, [addToast]);

  const showWarning = useCallback((title, message, duration) => {
    return addToast({ type: TOAST_TYPES.WARNING, title, message, duration });
  }, [addToast]);

  const showInfo = useCallback((title, message, duration) => {
    return addToast({ type: TOAST_TYPES.INFO, title, message, duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default ToastContainer;