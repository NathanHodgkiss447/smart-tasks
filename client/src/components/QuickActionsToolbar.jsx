import React from 'react';
import { Link } from 'react-router-dom';
import styles from './QuickActionsToolbar.module.css';

const QuickActionsToolbar = ({ 
  onQuickAdd, 
  onShowStats, 
  focusMode, 
  onToggleFocus, 
  selectedTasks = [],
  onBulkComplete,
  onBulkDelete,
  onBulkReschedule
}) => {
  const hasBulkSelection = selectedTasks.length > 0;

  return (
    <div className={styles.toolbar}>
      <div className={styles.leftSection}>
        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <Link to="/tasks/new" className={styles.actionButton}>
            <span className={styles.icon}>+</span>
            Quick Add
          </Link>
          
          <button 
            className={styles.actionButton} 
            onClick={onShowStats}
            title="View task statistics"
          >
            <span className={styles.icon}>📊</span>
            Stats
          </button>
          
          <button 
            className={`${styles.actionButton} ${focusMode ? styles.actionButtonActive : ''}`}
            onClick={onToggleFocus}
            title="Toggle focus mode"
          >
            <span className={styles.icon}>🎯</span>
            Focus Mode
          </button>
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Bulk Actions - Only show when tasks are selected */}
        {hasBulkSelection && (
          <div className={styles.bulkActions}>
            <span className={styles.selectionCount}>
              {selectedTasks.length} selected
            </span>
            
            <button 
              className={styles.bulkButton}
              onClick={onBulkComplete}
              title="Mark selected tasks as complete"
            >
              <span className={styles.icon}>✓</span>
              Complete
            </button>
            
            <button 
              className={styles.bulkButton}
              onClick={onBulkReschedule}
              title="Reschedule selected tasks"
            >
              <span className={styles.icon}>📅</span>
              Reschedule
            </button>
            
            <button 
              className={`${styles.bulkButton} ${styles.bulkButtonDanger}`}
              onClick={onBulkDelete}
              title="Delete selected tasks"
            >
              <span className={styles.icon}>🗑️</span>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActionsToolbar;