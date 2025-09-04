import { useEffect, useState, useRef, useCallback } from "react";
import React from "react";
import { Link } from "react-router-dom";
import styles from "../components/Toolbar.module.css";
import dashboardStyles from "./Dashboard.module.css";
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
import ViewSwitcher from "../components/ViewSwitcher.jsx";
import GridView from "../components/GridView.jsx";
import KanbanView from "../components/KanbanView.jsx";
import TimelineView from "../components/TimelineView.jsx";
import TaskGrouping from "../components/TaskGrouping.jsx";
import EnhancedFilters from "../components/EnhancedFilters.jsx";
import FocusMode from "../components/FocusMode.jsx";
import { LoadingSpinner, ListLoadingSkeleton, EmptyState, ErrorState } from "../components/LoadingStates.jsx";

const FILTERS = ["all", "overdue", "today", "upcoming", "completed"];

export default function Dashboard() {
  // Basic state
  const [filter, setFilter] = useState("today");
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Enhanced dashboard state
  const [currentView, setCurrentView] = useState('list');
  const [grouping, setGrouping] = useState('none');
  const [density, setDensity] = useState('comfortable');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusPreset, setFocusPreset] = useState('minimal');
  const [focusSettings, setFocusSettings] = useState({});
  
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
    try {
      setLoading(true);
      setError(null);
      
      const [{ data: t }, { data: s }] = await Promise.all([
        http.get(`/tasks${filter === "all" ? "" : `?status=${filter}`}`),
        http.get("/reminders/summary"),
      ]);
      
      setTasks(t);
      setSummary(s);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
      showError('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  // Enhanced focus mode handlers
  const handleToggleFocus = () => {
    setFocusMode(prev => !prev);
    if (!focusMode) {
      showInfo("Focus mode enabled", "Applied focus filters and settings");
    } else {
      showInfo("Focus mode disabled", "Showing all tasks");
    }
  };
  
  const handleFocusPresetChange = (preset) => {
    setFocusPreset(preset);
    showInfo("Focus preset changed", `Applied ${preset} focus settings`);
  };
  
  const handleFocusSettingsChange = (settings) => {
    setFocusSettings(settings);
  };
  
  // View and filter handlers
  const handleViewChange = (view) => {
    setCurrentView(view);
    announceToScreenReader(`View changed to ${view}`);
  };
  
  const handleGroupingChange = (groupBy) => {
    setGrouping(groupBy);
    announceToScreenReader(`Grouping changed to ${groupBy}`);
  };
  
  const handleDensityChange = (newDensity) => {
    setDensity(newDensity);
    announceToScreenReader(`Display density changed to ${newDensity}`);
  };
  
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };
  
  const handlePriorityChange = (priority) => {
    setPriorityFilter(priority);
  };
  
  // Task move handler for Kanban
  const handleTaskMove = async (taskId, updates) => {
    try {
      await http.patch(`/tasks/${taskId}`, updates);
      await load(); // Reload to get updated tasks
      showSuccess("Task moved", "Task status updated successfully");
    } catch (error) {
      showError("Error", "Failed to move task");
    }
  };

  // Stats panel toggle
  const handleToggleStats = () => {
    setShowStats(prev => !prev);
  };

  // Enhanced task filtering
  const filteredTasks = React.useMemo(() => {
    let filtered = [...tasks];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Apply focus mode filters
    if (focusMode) {
      if (focusSettings.hideCompleted) {
        filtered = filtered.filter(task => !task.completed);
      }
      if (focusSettings.hideOverdue) {
        const now = new Date();
        filtered = filtered.filter(task => 
          !task.dueAt || new Date(task.dueAt) >= now || task.completed
        );
      }
      if (focusSettings.hideNoDate) {
        filtered = filtered.filter(task => task.dueAt);
      }
      if (focusSettings.hideLowPriority) {
        filtered = filtered.filter(task => task.priority !== 'low');
      }
    }
    
    return filtered;
  }, [tasks, searchQuery, priorityFilter, focusMode, focusSettings]);
  
  // Task statistics for focus mode
  const taskCounts = React.useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      overdue: tasks.filter(t => t.dueAt && new Date(t.dueAt) < new Date() && !t.completed).length,
      noDate: tasks.filter(t => !t.dueAt).length,
      lowPriority: tasks.filter(t => t.priority === 'low').length
    };
  }, [tasks]);
  
  // Skip to main content handler
  const skipToMainContent = useCallback(() => {
    mainContentRef.current?.focus();
  }, []);
  
  // Enhanced keyboard shortcuts
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
          // View switching shortcuts
          case 'v':
          case 'V':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const views = ['list', 'grid', 'kanban', 'timeline'];
              const currentIndex = views.indexOf(currentView);
              const nextView = views[(currentIndex + 1) % views.length];
              setCurrentView(nextView);
              announceToScreenReader(`View changed to ${nextView}`);
            }
            break;
          case 'd':
          case 'D':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const densities = ['comfortable', 'compact', 'minimal'];
              const currentIndex = densities.indexOf(density);
              const nextDensity = densities[(currentIndex + 1) % densities.length];
              setDensity(nextDensity);
              announceToScreenReader(`Density changed to ${nextDensity}`);
            }
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeyPress);
    return () => document.removeEventListener('keydown', handleGlobalKeyPress);
  }, [currentView, density]);
  
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
  
  // Retry handler for error state
  const handleRetry = () => {
    load();
  };
  
  // Clear all filters handler
  const handleClearFilters = () => {
    setFilter('all');
    setSearchQuery('');
    setPriorityFilter('all');
    setGrouping('none');
    showInfo('Filters cleared', 'All filters have been reset');
  };
  
  // Render tasks based on current view
  const renderTasksView = () => {
    const commonProps = {
      tasks: filteredTasks,
      onToggle: toggleComplete,
      onDelete: remove,
      selectedTasks: selectedTasks,
      onSelect: toggleTaskSelection,
      bulkMode: bulkMode,
      density: density,
      loading: loading
    };

    switch (currentView) {
      case 'grid':
        return <GridView {...commonProps} />;
        
      case 'kanban':
        return (
          <KanbanView 
            {...commonProps}
            onTaskMove={handleTaskMove}
          />
        );
        
      case 'timeline':
        return <TimelineView {...commonProps} />;
        
      case 'list':
      default:
        if (grouping !== 'none') {
          return (
            <TaskGrouping
              {...commonProps}
              viewMode="list"
              groupBy={grouping}
            />
          );
        }
        
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
            <div className={dashboardStyles.tasksList} role="list">
              <SortableContext
                items={filteredTasks.map((t) => t._id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredTasks.map((task) => (
                  <div key={task._id} role="listitem">
                    <TaskCard
                      task={task}
                      onToggle={toggleComplete}
                      onDelete={remove}
                      isSelected={isTaskSelected(task._id)}
                      onSelect={toggleTaskSelection}
                      bulkMode={bulkMode}
                      viewMode="list"
                      density={density}
                    />
                  </div>
                ))}
              </SortableContext>
            </div>
          </DndContext>
        );
    }
  };

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

      {/* Enhanced Dashboard Controls */}
      <div className={dashboardStyles.dashboardControls}>
        {/* Enhanced Filters */}
        <EnhancedFilters
          currentFilter={filter}
          onFilterChange={setFilter}
          currentGrouping={grouping}
          onGroupingChange={handleGroupingChange}
          currentDensity={density}
          onDensityChange={handleDensityChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          priorityFilter={priorityFilter}
          onPriorityChange={handlePriorityChange}
          showSearch={!focusMode || !focusSettings.minimizeActions}
          showGrouping={currentView === 'list'}
          showDensity={true}
          showPriority={true}
          compact={isMobile}
        />
        
        {/* View Switcher and Actions */}
        <div className={dashboardStyles.viewControls}>
          <ViewSwitcher 
            currentView={currentView}
            onViewChange={handleViewChange}
            className={dashboardStyles.viewSwitcher}
          />
          
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
        </div>
        
        {/* Focus Mode Controls */}
        <FocusMode 
          isActive={focusMode}
          onToggle={handleToggleFocus}
          currentPreset={focusPreset}
          onPresetChange={handleFocusPresetChange}
          settings={focusSettings}
          onSettingsChange={handleFocusSettingsChange}
          taskCounts={taskCounts}
        />
      </div>

      {/* Smart Reminder */}
      {!focusMode && <SmartReminder summary={summary} onApply={applySuggested} />}

      {/* Main Content */}
      <main 
        id="main-content"
        ref={mainContentRef}
        tabIndex="-1"
        role="main"
        aria-label="Tasks dashboard"
        className={dashboardStyles.mainContent}
      >
        {error ? (
          <ErrorState
            title="Failed to Load Tasks"
            description={error}
            onAction={handleRetry}
            className={dashboardStyles.errorState}
          />
        ) : loading ? (
          <ListLoadingSkeleton 
            itemCount={6}
            density={density}
            showFilters={false}
            showViewSwitcher={false}
          />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon={focusMode && tasks.length > 0 ? '🎉' : '📋'}
            title={focusMode && tasks.length > 0 ? 'All tasks focused!' : 'No tasks found'}
            description={
              focusMode && tasks.length > 0 
                ? 'Great job! All your tasks match the current focus settings.'
                : searchQuery 
                  ? `No tasks found matching "${searchQuery}"` 
                  : 'Create your first task to get started.'
            }
            actionLabel={!searchQuery && tasks.length === 0 ? 'Create First Task' : 'Clear Filters'}
            onAction={!searchQuery && tasks.length === 0 ? () => window.location.href = '/tasks/new' : handleClearFilters}
            className={dashboardStyles.emptyState}
          />
        ) : (
          <div 
            className={dashboardStyles.tasksContainer}
            id="tasks-content"
            role="region"
            aria-label={`${filteredTasks.length} tasks in ${currentView} view`}
          >
            {renderTasksView()}
          </div>
        )}
      </main>
      </div>
      
      {/* Screen reader only keyboard shortcuts help */}
      <div className="sr-only" aria-label="Enhanced keyboard shortcuts">
        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li>Numbers 1-5: Switch between status filters</li>
          <li>Ctrl+F: Toggle focus mode</li>
          <li>Ctrl+S: Toggle statistics panel</li>
          <li>Ctrl+N: Create new task</li>
          <li>Ctrl+V: Cycle through view modes (List, Grid, Kanban, Timeline)</li>
          <li>Ctrl+D: Cycle through display density (Comfortable, Compact, Minimal)</li>
          <li>Enter/Space on task: Toggle completion</li>
          <li>Ctrl+Delete on task: Delete task</li>
          <li>Ctrl+E on task: Edit task</li>
          <li>Tab: Navigate between interface elements</li>
          <li>Arrow keys: Navigate within lists and grids</li>
        </ul>
      </div>
    </>
  );
}
