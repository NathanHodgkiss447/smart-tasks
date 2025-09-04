import { Link } from "react-router-dom";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./TaskCard.module.css";

export default function TaskCard({ 
  task, 
  onToggle, 
  onDelete, 
  isSelected = false, 
  onSelect = null, 
  bulkMode = false,
  viewMode = 'list',
  density = 'comfortable' 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDueDate = (dueAt) => {
    if (!dueAt) return { label: "No due date", type: "nodate" };
    
    const due = new Date(dueAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`, 
        type: "overdue" 
      };
    } else if (diffDays === 0) {
      return { 
        label: `Today at ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 
        type: "today" 
      };
    } else if (diffDays === 1) {
      return { 
        label: `Tomorrow at ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 
        type: "upcoming" 
      };
    } else if (diffDays <= 7) {
      return { 
        label: `${due.toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' })}`, 
        type: "upcoming" 
      };
    } else {
      return { 
        label: due.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), 
        type: "future" 
      };
    }
  };

  const dueDateInfo = formatDueDate(task.dueAt);
  const isOverdue = dueDateInfo.type === 'overdue' && !task.completed;

  const cardClasses = [
    styles.card,
    styles[`card${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`],
    styles[`density${density.charAt(0).toUpperCase() + density.slice(1)}`],
    task.completed && styles.cardCompleted,
    isOverdue && styles.cardOverdue,
    dueDateInfo.type === 'today' && styles.cardToday,
    dueDateInfo.type === 'upcoming' && styles.cardUpcoming,
    task.priority === 'high' && styles.cardHighPriority,
    isDragging && styles.isDragging,
    isSelected && styles.cardSelected,
    bulkMode && styles.cardBulkMode,
  ].filter(Boolean).join(' ');

  const priorityClasses = [
    styles.priorityChip,
    styles[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`]
  ].join(' ');

  const dueDateClasses = [
    styles.dueDate,
    styles[`dueDate${dueDateInfo.type.charAt(0).toUpperCase() + dueDateInfo.type.slice(1)}`]
  ].filter(Boolean).join(' ');

  // Progress calculation (placeholder - can be enhanced with subtasks)
  const progress = task.completed ? 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cardClasses}
      {...attributes}
    >
      {/* Status Bar */}
      <div className={`${styles.statusBar} ${styles[`status${dueDateInfo.type.charAt(0).toUpperCase() + dueDateInfo.type.slice(1)}`]}`} />
      
      <div className={styles.cardHeader}>
        {bulkMode && onSelect && (
          <input
            type="checkbox"
            className={`${styles.checkbox} ${styles.selectCheckbox}`}
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(task);
            }}
            aria-label={`Select task: ${task.title}`}
          />
        )}
        
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={task.completed}
          onChange={() => onToggle(task)}
          aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        
        <div className={styles.cardContent}>
          <div className={styles.cardTitle}>
            <span className={styles.titleText}>{task.title}</span>
            {task.priority === 'high' && (
              <span className={styles.priorityIndicator} aria-label="High priority">
                ⚡
              </span>
            )}
          </div>
          
          {density !== 'minimal' && (
            <div className={styles.cardMeta}>
              <span className={priorityClasses}>
                {task.priority}
              </span>
              <span className={dueDateClasses}>
                <span className={styles.dateIcon} aria-hidden="true">
                  {dueDateInfo.type === 'overdue' ? '⚠️' : 
                   dueDateInfo.type === 'today' ? '🔥' :
                   dueDateInfo.type === 'upcoming' ? '📅' : '📆'}
                </span>
                {dueDateInfo.label}
              </span>
            </div>
          )}
        </div>
        
        <div
          className={styles.dragHandle}
          {...listeners}
          title="Drag to reorder"
          aria-label="Drag to reorder task"
        >
          ⋮⋮
        </div>
      </div>
      
      {/* Progress bar for visual feedback */}
      {progress > 0 && progress < 100 && (
        <div className={styles.progressContainer}>
          <div 
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {density !== 'minimal' && (
        <div className={styles.cardActions}>
          <Link 
            to={`/tasks/${task._id}`} 
            className={`${styles.actionButton} ${styles.editButton}`}
            data-edit-link
            aria-label={`Edit task: ${task.title}`}
          >
            <span className={styles.actionIcon} aria-hidden="true">✏️</span>
            <span className={styles.actionLabel}>Edit</span>
          </Link>
          <button 
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => onDelete(task)}
            aria-label={`Delete task: ${task.title}`}
          >
            <span className={styles.actionIcon} aria-hidden="true">🗑️</span>
            <span className={styles.actionLabel}>Delete</span>
          </button>
        </div>
      )}
      
      {/* Mobile Quick Actions (shown on swipe) */}
      <div className={styles.quickActions} style={{ opacity: 0 }}>
        <button 
          className={`${styles.quickAction} ${styles.quickComplete}`}
          onClick={() => onToggle(task)}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed ? '↶' : '✓'}
        </button>
        <button 
          className={`${styles.quickAction} ${styles.quickDelete}`}
          onClick={() => onDelete(task)}
          aria-label={`Delete ${task.title}`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
