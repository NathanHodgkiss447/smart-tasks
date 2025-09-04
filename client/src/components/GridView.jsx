import React from 'react';
import TaskCard from './TaskCard';
import styles from './GridView.module.css';

const GridView = ({ 
  tasks, 
  onToggle, 
  onDelete, 
  selectedTasks, 
  onSelect, 
  bulkMode,
  density = 'comfortable',
  loading = false 
}) => {
  if (loading) {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.grid}>
          {[...Array(6)].map((_, index) => (
            <div key={index} className={`${styles.gridItem} ${styles.skeleton}`}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} style={{ width: '70%' }} />
              </div>
              <div className={styles.skeletonActions} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon} aria-hidden="true">⊞</div>
        <h3 className={styles.emptyTitle}>No tasks in grid view</h3>
        <p className={styles.emptyDescription}>
          Tasks will appear here as cards when you have some to work on.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      <div 
        className={`${styles.grid} ${styles[`density${density.charAt(0).toUpperCase() + density.slice(1)}`]}`}
        role="grid"
        aria-label={`${tasks.length} tasks in grid view`}
      >
        {tasks.map((task, index) => (
          <div 
            key={task._id} 
            className={styles.gridItem}
            role="gridcell"
            aria-rowindex={Math.floor(index / 3) + 1}
            aria-colindex={(index % 3) + 1}
          >
            <TaskCard
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              isSelected={selectedTasks?.includes?.(task._id) || false}
              onSelect={onSelect}
              bulkMode={bulkMode}
              viewMode="grid"
              density={density}
            />
          </div>
        ))}
      </div>
      
      {/* Grid info for screen readers */}
      <div className="sr-only" aria-live="polite">
        Grid view showing {tasks.length} tasks in a responsive card layout
      </div>
    </div>
  );
};

export default GridView;