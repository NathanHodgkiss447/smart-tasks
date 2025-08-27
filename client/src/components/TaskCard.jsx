import { Link } from "react-router-dom";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./TaskCard.module.css";

export default function TaskCard({ task, onToggle, onDelete }) {
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

  const dueLabel = task.dueAt
    ? new Date(task.dueAt).toLocaleString()
    : "No due date";
  
  const isOverdue = task.dueAt && new Date(task.dueAt) < new Date() && !task.completed;

  const cardClasses = [
    styles.card,
    task.completed && styles.cardCompleted,
    isOverdue && styles.cardOverdue,
    isDragging && styles.isDragging,
  ].filter(Boolean).join(' ');

  const priorityClasses = [
    styles.priorityChip,
    styles[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`]
  ].join(' ');

  const dueDateClasses = [
    styles.dueDate,
    isOverdue && styles.dueDateOverdue
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cardClasses}
      {...attributes}
    >
      <div className={styles.cardHeader}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={task.completed}
          onChange={() => onToggle(task)}
        />
        <div className={styles.cardContent}>
          <div className={styles.cardTitle}>{task.title}</div>
          <div className={styles.cardMeta}>
            <span className={priorityClasses}>
              {task.priority}
            </span>
            <span className={dueDateClasses}>
              📅 {dueLabel}
            </span>
          </div>
        </div>
        <div
          className={styles.dragHandle}
          {...listeners}
          title="Drag to reorder"
        >
          ⋮⋮
        </div>
      </div>
      <div className={styles.cardActions}>
        <Link to={`/tasks/${task._id}`} className={`${styles.actionButton} ${styles.editButton}`}>
          Edit
        </Link>
        <button 
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={() => onDelete(task)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
