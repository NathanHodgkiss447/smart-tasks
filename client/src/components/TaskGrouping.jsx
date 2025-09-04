import React, { useState, useMemo } from 'react';
import TaskCard from './TaskCard';
import styles from './TaskGrouping.module.css';

const GROUPING_OPTIONS = [
  { id: 'none', label: 'No Grouping', icon: '☰' },
  { id: 'priority', label: 'By Priority', icon: '🔥' },
  { id: 'status', label: 'By Status', icon: '📊' },
  { id: 'dueDate', label: 'By Due Date', icon: '📅' },
  { id: 'completed', label: 'By Completion', icon: '✅' }
];

const TaskGrouping = ({ 
  tasks, 
  onToggle, 
  onDelete, 
  selectedTasks, 
  onSelect, 
  bulkMode,
  viewMode = 'list',
  density = 'comfortable',
  loading = false,
  groupBy = 'none'
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return [{ key: 'all', label: 'All Tasks', tasks, type: 'default' }];
    }

    const groups = {};
    
    tasks.forEach(task => {
      let groupKey, groupLabel, groupType = 'default';
      
      switch (groupBy) {
        case 'priority':
          groupKey = task.priority;
          groupLabel = `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`;
          groupType = task.priority;
          break;
          
        case 'status':
          if (task.completed) {
            groupKey = 'completed';
            groupLabel = 'Completed';
            groupType = 'completed';
          } else {
            groupKey = 'active';
            groupLabel = 'Active';
            groupType = 'active';
          }
          break;
          
        case 'dueDate':
          if (!task.dueAt) {
            groupKey = 'no-date';
            groupLabel = 'No Due Date';
            groupType = 'nodate';
          } else {
            const due = new Date(task.dueAt);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
              groupKey = 'overdue';
              groupLabel = 'Overdue';
              groupType = 'overdue';
            } else if (diffDays === 0) {
              groupKey = 'today';
              groupLabel = 'Today';
              groupType = 'today';
            } else if (diffDays <= 7) {
              groupKey = 'week';
              groupLabel = 'This Week';
              groupType = 'upcoming';
            } else {
              groupKey = 'later';
              groupLabel = 'Later';
              groupType = 'future';
            }
          }
          break;
          
        case 'completed':
          groupKey = task.completed ? 'done' : 'todo';
          groupLabel = task.completed ? 'Completed Tasks' : 'To Do';
          groupType = task.completed ? 'completed' : 'active';
          break;
          
        default:
          groupKey = 'all';
          groupLabel = 'All Tasks';
          groupType = 'default';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          label: groupLabel,
          type: groupType,
          tasks: []
        };
      }
      
      groups[groupKey].tasks.push(task);
    });
    
    // Sort groups by priority/importance
    const groupOrder = {
      'overdue': 1,
      'today': 2,
      'high': 3,
      'active': 4,
      'week': 5,
      'med': 6,
      'upcoming': 7,
      'low': 8,
      'later': 9,
      'future': 10,
      'done': 11,
      'completed': 12,
      'no-date': 13,
      'nodate': 14,
      'all': 15
    };
    
    return Object.entries(groups)
      .sort(([a], [b]) => (groupOrder[a] || 999) - (groupOrder[b] || 999))
      .map(([key, group]) => ({ key, ...group }));
  }, [tasks, groupBy]);

  const toggleGroup = (groupKey) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const getGroupIcon = (type, taskCount) => {
    switch (type) {
      case 'high': return '🔴';
      case 'med': return '🟡';
      case 'low': return '🟢';
      case 'overdue': return '⚠️';
      case 'today': return '🔥';
      case 'upcoming': return '📅';
      case 'future': return '📆';
      case 'completed': return '✅';
      case 'active': return '⚡';
      case 'nodate': return '📝';
      default: return taskCount > 0 ? '📋' : '📭';
    }
  };

  if (loading) {
    return (
      <div className={styles.groupContainer}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className={styles.group}>
            <div className={`${styles.groupHeader} ${styles.skeleton}`}>
              <div className={styles.skeletonGroupTitle} />
            </div>
            <div className={styles.groupContent}>
              {[...Array(2)].map((_, taskIndex) => (
                <div key={taskIndex} className={`${styles.groupTask} ${styles.skeleton}`}>
                  <div className={styles.skeletonTask} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalTasks = groupedTasks.reduce((sum, group) => sum + group.tasks.length, 0);

  return (
    <div className={`${styles.groupContainer} ${styles[`density${density.charAt(0).toUpperCase() + density.slice(1)}`]}`}>
      {groupedTasks.map(group => {
        const isCollapsed = collapsedGroups.has(group.key);
        const hasMultipleGroups = groupedTasks.length > 1;
        
        return (
          <div 
            key={group.key}
            className={`${styles.group} ${styles[`group${group.type.charAt(0).toUpperCase() + group.type.slice(1)}`]}`}
            role="region"
            aria-label={`${group.label} - ${group.tasks.length} tasks`}
          >
            {hasMultipleGroups && (
              <div className={styles.groupHeader}>
                <button
                  className={styles.groupToggle}
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={!isCollapsed}
                  aria-controls={`group-content-${group.key}`}
                  title={isCollapsed ? 'Expand group' : 'Collapse group'}
                >
                  <span className={styles.groupIcon} aria-hidden="true">
                    {getGroupIcon(group.type, group.tasks.length)}
                  </span>
                  <h3 className={styles.groupTitle}>
                    {group.label}
                  </h3>
                  <span 
                    className={styles.groupCount}
                    aria-label={`${group.tasks.length} tasks`}
                  >
                    {group.tasks.length}
                  </span>
                  <span 
                    className={`${styles.collapseIcon} ${isCollapsed ? styles.collapsed : ''}`}
                    aria-hidden="true"
                  >
                    ▼
                  </span>
                </button>
              </div>
            )}
            
            <div 
              id={`group-content-${group.key}`}
              className={`${styles.groupContent} ${isCollapsed ? styles.contentCollapsed : ''}`}
              role="list"
              aria-label={`Tasks in ${group.label}`}
            >
              {group.tasks.length === 0 ? (
                <div className={styles.emptyGroup}>
                  <div className={styles.emptyIcon} aria-hidden="true">
                    {getGroupIcon(group.type, 0)}
                  </div>
                  <p className={styles.emptyText}>No tasks in this group</p>
                </div>
              ) : (
                group.tasks.map(task => (
                  <div key={task._id} className={styles.groupTask} role="listitem">
                    <TaskCard
                      task={task}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      isSelected={selectedTasks?.includes?.(task._id) || false}
                      onSelect={onSelect}
                      bulkMode={bulkMode}
                      viewMode={viewMode}
                      density={density}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
      
      {/* Group info for screen readers */}
      <div className="sr-only" aria-live="polite">
        Tasks grouped by {GROUPING_OPTIONS.find(opt => opt.id === groupBy)?.label || 'none'}. 
        Showing {totalTasks} tasks across {groupedTasks.length} groups.
      </div>
    </div>
  );
};

export default TaskGrouping;
export { GROUPING_OPTIONS };