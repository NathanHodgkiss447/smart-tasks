import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import TaskCard from './TaskCard';
import styles from './KanbanView.module.css';

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'To Do', status: 'pending', color: '#6ea8fe' },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress', color: '#ffc107' },
  { id: 'completed', title: 'Completed', status: 'completed', color: '#6efeb5' }
];

const KanbanView = ({ 
  tasks, 
  onToggle, 
  onDelete, 
  selectedTasks, 
  onSelect, 
  bulkMode,
  density = 'comfortable',
  loading = false,
  onTaskMove = null 
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by status
  const groupedTasks = KANBAN_COLUMNS.reduce((acc, column) => {
    if (column.status === 'completed') {
      acc[column.id] = tasks.filter(task => task.completed);
    } else if (column.status === 'in-progress') {
      // For now, we'll use high priority incomplete tasks as "in-progress"
      acc[column.id] = tasks.filter(task => !task.completed && task.priority === 'high');
    } else {
      // All other incomplete tasks go to "todo"
      acc[column.id] = tasks.filter(task => !task.completed && task.priority !== 'high');
    }
    return acc;
  }, {});

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    // Handle moving between columns or within columns
    const activeTask = tasks.find(task => task._id === active.id);
    if (!activeTask) return;

    // If onTaskMove is provided, use it for column changes
    if (onTaskMove && over.id !== active.id) {
      const overColumn = KANBAN_COLUMNS.find(col => col.id === over.id);
      if (overColumn) {
        // Move to different column
        const updates = {};
        if (overColumn.status === 'completed') {
          updates.completed = true;
        } else if (overColumn.status === 'in-progress') {
          updates.completed = false;
          updates.priority = 'high';
        } else {
          updates.completed = false;
          updates.priority = activeTask.priority === 'high' ? 'med' : activeTask.priority;
        }
        onTaskMove(activeTask._id, updates);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.kanbanContainer}>
        <div className={styles.columns}>
          {KANBAN_COLUMNS.map(column => (
            <div key={column.id} className={styles.column}>
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle} style={{ color: column.color }}>
                  {column.title}
                </div>
                <div className={styles.columnCount}>...</div>
              </div>
              <div className={styles.columnContent}>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className={`${styles.kanbanCard} ${styles.skeleton}`}>
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

  const totalTasks = Object.values(groupedTasks).flat().length;

  return (
    <div className={styles.kanbanContainer}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
        <div className={`${styles.columns} ${styles[`density${density.charAt(0).toUpperCase() + density.slice(1)}`]}`}>
          {KANBAN_COLUMNS.map(column => {
            const columnTasks = groupedTasks[column.id] || [];
            
            return (
              <div key={column.id} className={styles.column} role="region" aria-label={`${column.title} column`}>
                <div 
                  className={styles.columnHeader}
                  style={{ '--column-color': column.color }}
                >
                  <div className={styles.columnTitle}>
                    <span className={styles.columnIcon} aria-hidden="true">
                      {column.status === 'completed' ? '✅' : 
                       column.status === 'in-progress' ? '🔄' : '📝'}
                    </span>
                    {column.title}
                  </div>
                  <div 
                    className={styles.columnCount}
                    aria-label={`${columnTasks.length} tasks`}
                  >
                    {columnTasks.length}
                  </div>
                </div>
                
                <SortableContext
                  items={columnTasks.map(task => task._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div 
                    className={styles.columnContent}
                    data-column={column.id}
                    role="list"
                    aria-label={`Tasks in ${column.title}`}
                  >
                    {columnTasks.length === 0 ? (
                      <div className={styles.emptyColumn}>
                        <div className={styles.emptyIcon} aria-hidden="true">
                          {column.status === 'completed' ? '🎉' : 
                           column.status === 'in-progress' ? '💪' : '🚀'}
                        </div>
                        <p className={styles.emptyText}>
                          {column.status === 'completed' ? 'No completed tasks' :
                           column.status === 'in-progress' ? 'No tasks in progress' :
                           'No pending tasks'}
                        </p>
                      </div>
                    ) : (
                      columnTasks.map(task => (
                        <div key={task._id} role="listitem">
                          <TaskCard
                            task={task}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            isSelected={selectedTasks?.includes?.(task._id) || false}
                            onSelect={onSelect}
                            bulkMode={bulkMode}
                            viewMode="kanban"
                            density={density}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>
      
      {/* Kanban info for screen readers */}
      <div className="sr-only" aria-live="polite">
        Kanban board showing {totalTasks} tasks across {KANBAN_COLUMNS.length} columns
      </div>
    </div>
  );
};

export default KanbanView;