import { useState, useCallback, useMemo } from 'react';

export const useBulkOperations = (tasks = []) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Get selected tasks objects
  const selectedTasks = useMemo(() => {
    return tasks.filter(task => selectedTaskIds.has(task._id));
  }, [tasks, selectedTaskIds]);

  // Check if a task is selected
  const isTaskSelected = useCallback((taskId) => {
    return selectedTaskIds.has(taskId);
  }, [selectedTaskIds]);

  // Toggle single task selection
  const toggleTaskSelection = useCallback((task) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(task._id)) {
        newSet.delete(task._id);
      } else {
        newSet.add(task._id);
      }
      return newSet;
    });
  }, []);

  // Select all tasks
  const selectAllTasks = useCallback(() => {
    const allTaskIds = new Set(tasks.map(task => task._id));
    setSelectedTaskIds(allTaskIds);
  }, [tasks]);

  // Deselect all tasks
  const deselectAllTasks = useCallback(() => {
    setSelectedTaskIds(new Set());
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (selectedTaskIds.size === tasks.length) {
      deselectAllTasks();
    } else {
      selectAllTasks();
    }
  }, [selectedTaskIds.size, tasks.length, selectAllTasks, deselectAllTasks]);

  // Check if all tasks are selected
  const areAllTasksSelected = useMemo(() => {
    return tasks.length > 0 && selectedTaskIds.size === tasks.length;
  }, [tasks.length, selectedTaskIds.size]);

  // Check if some tasks are selected (for indeterminate state)
  const areSomeTasksSelected = useMemo(() => {
    return selectedTaskIds.size > 0 && selectedTaskIds.size < tasks.length;
  }, [selectedTaskIds.size, tasks.length]);

  // Enter bulk mode
  const enterBulkMode = useCallback(() => {
    setBulkMode(true);
  }, []);

  // Exit bulk mode and clear selections
  const exitBulkMode = useCallback(() => {
    setBulkMode(false);
    setSelectedTaskIds(new Set());
  }, []);

  // Toggle bulk mode
  const toggleBulkMode = useCallback(() => {
    if (bulkMode) {
      exitBulkMode();
    } else {
      enterBulkMode();
    }
  }, [bulkMode, enterBulkMode, exitBulkMode]);

  // Bulk operations
  const bulkComplete = useCallback(async (onComplete) => {
    if (typeof onComplete === 'function') {
      const promises = selectedTasks.map(task => onComplete(task));
      await Promise.all(promises);
    }
    setSelectedTaskIds(new Set());
  }, [selectedTasks]);

  const bulkDelete = useCallback(async (onDelete) => {
    if (typeof onDelete === 'function') {
      const promises = selectedTasks.map(task => onDelete(task));
      await Promise.all(promises);
    }
    setSelectedTaskIds(new Set());
  }, [selectedTasks]);

  const bulkUpdate = useCallback(async (updateFn) => {
    if (typeof updateFn === 'function') {
      const promises = selectedTasks.map(task => updateFn(task));
      await Promise.all(promises);
    }
    setSelectedTaskIds(new Set());
  }, [selectedTasks]);

  // Auto-exit bulk mode when no tasks are selected
  const hasSelection = selectedTaskIds.size > 0;
  
  return {
    // State
    selectedTaskIds: Array.from(selectedTaskIds),
    selectedTasks,
    bulkMode,
    hasSelection,
    
    // Selection status
    areAllTasksSelected,
    areSomeTasksSelected,
    
    // Selection actions
    isTaskSelected,
    toggleTaskSelection,
    selectAllTasks,
    deselectAllTasks,
    toggleSelectAll,
    
    // Bulk mode
    enterBulkMode,
    exitBulkMode,
    toggleBulkMode,
    
    // Bulk operations
    bulkComplete,
    bulkDelete,
    bulkUpdate
  };
};