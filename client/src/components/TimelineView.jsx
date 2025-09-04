import React, { useMemo } from 'react';
import TaskCard from './TaskCard';
import styles from './TimelineView.module.css';

const TimelineView = ({ 
  tasks, 
  onToggle, 
  onDelete, 
  selectedTasks, 
  onSelect, 
  bulkMode,
  density = 'comfortable',
  loading = false 
}) => {
  // Group tasks by date
  const groupedTasks = useMemo(() => {
    const groups = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    tasks.forEach(task => {
      let groupKey;
      let groupLabel;
      let groupType;
      
      if (!task.dueAt) {
        groupKey = 'no-date';
        groupLabel = 'No Due Date';
        groupType = 'nodate';
      } else {
        const due = new Date(task.dueAt);
        const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < -1) {
          groupKey = `overdue-${Math.abs(diffDays)}`;
          groupLabel = `Overdue by ${Math.abs(diffDays)} days`;
          groupType = 'overdue';
        } else if (diffDays === -1) {
          groupKey = 'yesterday';
          groupLabel = 'Yesterday';
          groupType = 'overdue';
        } else if (diffDays === 0) {
          groupKey = 'today';
          groupLabel = 'Today';
          groupType = 'today';
        } else if (diffDays === 1) {
          groupKey = 'tomorrow';
          groupLabel = 'Tomorrow';
          groupType = 'upcoming';
        } else if (diffDays <= 7) {
          groupKey = `week-${diffDays}`;
          groupLabel = due.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
          groupType = 'upcoming';
        } else if (diffDays <= 30) {
          groupKey = `month-${diffDays}`;
          groupLabel = due.toLocaleDateString([], { month: 'short', day: 'numeric' });
          groupType = 'future';
        } else {
          groupKey = `future-${diffDays}`;
          groupLabel = due.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
          groupType = 'future';
        }
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          label: groupLabel,
          type: groupType,
          tasks: [],
          date: task.dueAt ? new Date(task.dueAt) : new Date('3000-01-01') // Far future for no-date tasks
        };
      }
      
      groups[groupKey].tasks.push(task);
    });
    
    // Sort groups by date
    const sortedGroups = Object.entries(groups)
      .sort(([, a], [, b]) => {
        if (a.type === 'nodate' && b.type !== 'nodate') return 1;
        if (b.type === 'nodate' && a.type !== 'nodate') return -1;
        return a.date.getTime() - b.date.getTime();
      })
      .map(([key, group]) => ({ key, ...group }));
    
    return sortedGroups;
  }, [tasks]);

  if (loading) {
    return (
      <div className={styles.timelineContainer}>
        <div className={styles.timeline}>
          {[...Array(4)].map((_, index) => (
            <div key={index} className={styles.timelineGroup}>
              <div className={styles.groupHeader}>
                <div className={`${styles.groupMarker} ${styles.skeleton}`} />
                <div className={`${styles.groupTitle} ${styles.skeleton}`} style={{ width: '120px', height: '20px' }} />
              </div>
              <div className={styles.groupTasks}>
                {[...Array(2)].map((_, taskIndex) => (
                  <div key={taskIndex} className={`${styles.timelineCard} ${styles.skeleton}`}>
                    <div className={styles.skeletonContent} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon} aria-hidden="true">◴</div>
        <h3 className={styles.emptyTitle}>No tasks in timeline view</h3>
        <p className={styles.emptyDescription}>
          Tasks will appear here organized by their due dates when you have some to work on.
        </p>
      </div>
    );
  }

  const totalTasks = groupedTasks.reduce((sum, group) => sum + group.tasks.length, 0);

  return (
    <div className={styles.timelineContainer}>
      <div 
        className={`${styles.timeline} ${styles[`density${density.charAt(0).toUpperCase() + density.slice(1)}`]}`}
        role="feed"
        aria-label={`Timeline view with ${totalTasks} tasks organized by due date`}
      >
        {groupedTasks.map((group, groupIndex) => (
          <div 
            key={group.key}
            className={`${styles.timelineGroup} ${styles[`group${group.type.charAt(0).toUpperCase() + group.type.slice(1)}`]}`}
            role="region"
            aria-label={`${group.label} - ${group.tasks.length} tasks`}
          >
            <div className={styles.groupHeader}>
              <div 
                className={`${styles.groupMarker} ${styles[`marker${group.type.charAt(0).toUpperCase() + group.type.slice(1)}`]}`}
                aria-hidden="true"
              >
                <span className={styles.markerIcon}>
                  {group.type === 'overdue' ? '⚠️' :
                   group.type === 'today' ? '🔥' :
                   group.type === 'upcoming' ? '📅' :
                   group.type === 'future' ? '📆' : '📝'}
                </span>
              </div>
              
              <div className={styles.groupTitleContainer}>
                <h3 className={styles.groupTitle}>
                  {group.label}
                </h3>
                <span 
                  className={styles.groupCount}
                  aria-label={`${group.tasks.length} tasks`}
                >
                  {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className={styles.groupTasks} role="list">
              {group.tasks.map((task, taskIndex) => (
                <div 
                  key={task._id}
                  className={styles.timelineCard}
                  role="listitem"
                >
                  <TaskCard
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    isSelected={selectedTasks?.includes?.(task._id) || false}
                    onSelect={onSelect}
                    bulkMode={bulkMode}
                    viewMode="timeline"
                    density={density}
                  />
                  
                  {/* Timeline connector line (except for last item) */}
                  {taskIndex < group.tasks.length - 1 && (
                    <div className={styles.taskConnector} aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Group connector line (except for last group) */}
            {groupIndex < groupedTasks.length - 1 && (
              <div className={styles.groupConnector} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
      
      {/* Timeline info for screen readers */}
      <div className="sr-only" aria-live="polite">
        Timeline view showing {totalTasks} tasks organized by due date across {groupedTasks.length} time periods
      </div>
    </div>
  );
};

export default TimelineView;