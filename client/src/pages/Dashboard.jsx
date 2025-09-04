import { useEffect, useState, useRef, useCallback } from "react";
import React from "react";
import { Link } from "react-router-dom";
import styles from "../components/Toolbar.module.css";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import http from "../api/http.js";
import TaskCard from "../components/TaskCard.jsx";
import SmartReminder from "../components/SmartReminder.jsx";
import QuickActionsToolbar from "../components/QuickActionsToolbar.jsx";
import TaskStatistics from "../components/TaskStatistics.jsx";
import ToastContainer, { useToasts } from "../components/ToastNotifications.jsx";
import { useBulkOperations } from "../hooks/useBulkOperations.js";

const FILTERS = ["all", "overdue", "today", "upcoming", "completed"];

export default function Dashboard() {
  const [filter, setFilter] = useState("today");
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Refs for accessibility
  const skipLinkRef = useRef(null);
  const mainContentRef = useRef(null);
  const filtersRef = useRef(null);
  
  // Check if mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setShowMobileMenu(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toast notifications
  const {
    toasts,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  } = useToasts();

  // Bulk operations
  const {
    selectedTasks,
    bulkMode,
    hasSelection,
    isTaskSelected,
    toggleTaskSelection,
    toggleBulkMode,
    exitBulkMode,
    bulkComplete,
    bulkDelete,
    bulkUpdate
  } = useBulkOperations(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function load() {
    const [{ data: t }, { data: s }] = await Promise.all([
      http.get(`/tasks${filter === "all" ? "" : `?status=${filter}`}`),
      http.get("/reminders/summary"),
    ]);
    setTasks(t);
    setSummary(s);
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function toggleComplete(task) {
    try {
      const { data } = await http.patch(`/tasks/${task._id}`, {
        completed: !task.completed,
      });
      setTasks((prev) => prev.map((x) => (x._id === data._id ? data : x)));
      
      if (data.completed) {
        showSuccess("Task completed!", `"${task.title}" marked as complete`);
      } else {
        showInfo("Task reopened", `"${task.title}" marked as incomplete`);
      }
    } catch (error) {
      showError("Error", "Failed to update task");
    }
  }

  async function remove(task) {
    try {
      await http.delete(`/tasks/${task._id}`);
      await load();
      showSuccess("Task deleted", `"${task.title}" was removed`);
    } catch (error) {
      showError("Error", "Failed to delete task");
    }
  }

  async function applySuggested(taskId, dueAt) {
    try {
      await http.patch(`/tasks/${taskId}`, { dueAt });
      load();
      showSuccess("Task rescheduled", "Due date updated successfully");
    } catch (error) {
      showError("Error", "Failed to reschedule task");
    }
  }

  // Bulk operation handlers
  const handleBulkComplete = async () => {
    try {
      await bulkComplete(toggleComplete);
      showSuccess(
        "Bulk operation completed", 
        `${selectedTasks.length} tasks marked as complete`
      );
      exitBulkMode();
    } catch (error) {
      showError("Error", "Failed to complete selected tasks");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedTasks.length} selected tasks? This cannot be undone.`)) {
      return;
    }

    try {
      await bulkDelete(remove);
      showSuccess(
        "Bulk operation completed", 
        `${selectedTasks.length} tasks deleted`
      );
      exitBulkMode();
    } catch (error) {
      showError("Error", "Failed to delete selected tasks");
    }
  };

  const handleBulkReschedule = async () => {
    const newDate = window.prompt("Enter new due date (YYYY-MM-DD):");
    if (!newDate) return;

    try {
      await bulkUpdate(async (task) => {
        await http.patch(`/tasks/${task._id}`, { dueAt: new Date(newDate) });
      });
      showSuccess(
        "Bulk operation completed", 
        `${selectedTasks.length} tasks rescheduled`
      );
      exitBulkMode();
      load();
    } catch (error) {
      showError("Error", "Failed to reschedule selected tasks");
    }
  };

  // Focus mode toggle
  const handleToggleFocus = () => {
    setFocusMode(prev => !prev);
    if (!focusMode) {
      showInfo("Focus mode enabled", "Hiding completed tasks and distractions");
    } else {
      showInfo("Focus mode disabled", "Showing all tasks");
    }
  };

  // Stats panel toggle
  const handleToggleStats = () => {
    setShowStats(prev => !prev);
  };

  // Filter tasks based on focus mode
  const filteredTasks = focusMode ? tasks.filter(task => !task.completed) : tasks;
  
  // Skip to main content handler
  const skipToMainContent = useCallback(() => {
    mainContentRef.current?.focus();
  }, []);
  
  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      // Skip navigation with Tab
      if (e.key === 'Tab' && e.shiftKey) {
        return; // Allow normal tab navigation
      }
      
      // Global shortcuts (only when not in input fields)
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        switch (e.key) {
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
            e.preventDefault();
            const filterIndex = parseInt(e.key) - 1;
            if (filterIndex < FILTERS.length) {
              setFilter(FILTERS[filterIndex]);
              // Announce filter change
              const announcement = `Filter changed to ${FILTERS[filterIndex]}`;
              announceToScreenReader(announcement);
            }
            break;
          case 'f':
          case 'F':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              handleToggleFocus();
            }
            break;
          case 's':
          case 'S':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              handleToggleStats();
            }
            break;
          case 'n':
          case 'N':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              window.location.href = '/tasks/new';
            }
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeyPress);
    return () => document.removeEventListener('keydown', handleGlobalKeyPress);
  }, []);
  
  // Screen reader announcements
  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <>
      {/* Skip Navigation Link */}
      <a 
        href="#main-content" 
        className="skip-link"
        ref={skipLinkRef}
        onClick={(e) => {
          e.preventDefault();
          skipToMainContent();
        }}
      >
        Skip to main content
      </a>
      
      <div role="banner" aria-label="Smart Tasks Dashboard">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar
        focusMode={focusMode}
        onToggleFocus={handleToggleFocus}
        onShowStats={handleToggleStats}
        selectedTasks={selectedTasks}
        onBulkComplete={handleBulkComplete}
        onBulkDelete={handleBulkDelete}
        onBulkReschedule={handleBulkReschedule}
      />

      {/* Task Statistics Panel */}
      <TaskStatistics tasks={tasks} isVisible={showStats} />

      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button 
          className={styles.mobileMenuToggle}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-expanded={showMobileMenu}
          aria-controls="filter-toolbar"
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
      )}

      {/* Filter Toolbar */}
      <nav 
        className={`${styles.toolbar} ${isMobile && !showMobileMenu ? styles.toolbarHidden : ''}`}
        id="filter-toolbar"
        aria-label="Task filters"
        ref={filtersRef}
      >
        <div className={styles.filters} role="tablist" aria-label="Filter tasks">
          {FILTERS.map((f, index) => (
            <button
              key={f}
              className={`${styles.filterButton} ${f === filter ? styles.filterButtonActive : ""}`}
              onClick={() => setFilter(f)}
              role="tab"
              aria-selected={f === filter}
              aria-controls="tasks-list"
              aria-label={`Filter by ${f} tasks (Press ${index + 1})`}
              title={`Keyboard shortcut: ${index + 1}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          {!focusMode && (
            <Link 
              to="/tasks/new" 
              className={styles.newTaskButton}
              aria-label="Create new task (Ctrl+N)"
              title="Keyboard shortcut: Ctrl+N"
            >
              <span className={styles.newTaskIcon} aria-hidden="true">+</span>
              New Task
            </Link>
          )}
          
          {/* Bulk Mode Toggle */}
          <button 
            className={`${styles.newTaskButton} ${bulkMode ? styles.filterButtonActive : ''}`}
            onClick={toggleBulkMode}
            style={{ marginLeft: '8px', padding: '8px 16px' }}
            aria-pressed={bulkMode}
            aria-describedby="bulk-mode-help"
          >
            {bulkMode ? 'Exit Bulk' : 'Select Multiple'}
          </button>
          
          <div id="bulk-mode-help" className="sr-only">
            Use bulk mode to select and perform actions on multiple tasks
          </div>
        </div>
      </nav>

      {/* Smart Reminder */}
      {!focusMode && <SmartReminder summary={summary} onApply={applySuggested} />}

      {/* Main Content */}
      <main 
        id="main-content"
        ref={mainContentRef}
        tabIndex="-1"
        role="main"
        aria-label="Tasks list"
      >
        {/* Tasks List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <div 
            className="list" 
            id="tasks-list"
            role="list"
            aria-label={`${filteredTasks.length} ${filter} tasks`}
            aria-live="polite"
          >
            {filteredTasks.length === 0 ? (
              <div 
                className="muted" 
                role="status" 
                aria-live="polite"
                style={{ textAlign: 'center', padding: '2rem' }}
              >
                {focusMode && tasks.length > 0 
                  ? "All tasks completed! Great job! 🎉"
                  : "No tasks in this view."
                }
              </div>
            ) : (
              <SortableContext
                items={filteredTasks.map((t) => t._id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredTasks.map((t, index) => (
                  <TaskCard
                    key={t._id}
                    task={t}
                    onToggle={toggleComplete}
                    onDelete={remove}
                    isSelected={isTaskSelected(t._id)}
                    onSelect={toggleTaskSelection}
                    bulkMode={bulkMode}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        </DndContext>
      </main>
      </div>
      
      {/* Screen reader only keyboard shortcuts help */}
      <div className="sr-only" aria-label="Keyboard shortcuts">
        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li>Numbers 1-5: Switch between filters</li>
          <li>Ctrl+F: Toggle focus mode</li>
          <li>Ctrl+S: Toggle statistics</li>
          <li>Ctrl+N: Create new task</li>
          <li>Enter/Space on task: Toggle completion</li>
          <li>Ctrl+Delete on task: Delete task</li>
          <li>Ctrl+E on task: Edit task</li>
        </ul>
      </div>
    </>
  );
}
