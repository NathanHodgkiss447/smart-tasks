import React, { useMemo } from 'react';
import styles from './TaskStatistics.module.css';

const TaskStatistics = ({ tasks = [], isVisible = true }) => {
  const stats = useMemo(() => {
    if (!tasks.length) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        tasksCompletedToday: 0,
        overdueTasks: 0,
        pendingTasks: 0
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const tasksCompletedToday = tasks.filter(task => {
      if (!task.completed || !task.updatedAt) return false;
      const updatedDate = new Date(task.updatedAt);
      const taskDate = new Date(updatedDate.getFullYear(), updatedDate.getMonth(), updatedDate.getDate());
      return taskDate.getTime() === today.getTime();
    }).length;
    
    const overdueTasks = tasks.filter(task => {
      if (task.completed || !task.dueAt) return false;
      return new Date(task.dueAt) < now;
    }).length;

    const pendingTasks = tasks.length - completedTasks;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return {
      totalTasks: tasks.length,
      completedTasks,
      completionRate,
      tasksCompletedToday,
      overdueTasks,
      pendingTasks
    };
  }, [tasks]);

  if (!isVisible) return null;

  return (
    <div className={styles.statsPanel}>
      <div className={styles.statsHeader}>
        <h3 className={styles.statsTitle}>📊 Task Overview</h3>
      </div>
      
      <div className={styles.statsGrid}>
        {/* Completion Rate Card */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.completionRate}%</div>
            <div className={styles.statLabel}>Completion Rate</div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tasks Completed Today Card */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.tasksCompletedToday}</div>
            <div className={styles.statLabel}>Completed Today</div>
            <div className={styles.statSubtext}>
              Keep up the momentum!
            </div>
          </div>
        </div>

        {/* Overdue Tasks Card */}
        <div className={`${styles.statCard} ${stats.overdueTasks > 0 ? styles.statCardWarning : ''}`}>
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.overdueTasks}</div>
            <div className={styles.statLabel}>Overdue</div>
            <div className={styles.statSubtext}>
              {stats.overdueTasks > 0 ? 'Needs attention' : 'All caught up!'}
            </div>
          </div>
        </div>

        {/* Total Tasks Card */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.totalTasks}</div>
            <div className={styles.statLabel}>Total Tasks</div>
            <div className={styles.statSubtext}>
              {stats.pendingTasks} pending
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress Indicator */}
      <div className={styles.overallProgress}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Overall Progress</span>
          <span className={styles.progressPercentage}>{stats.completionRate}%</span>
        </div>
        <div className={styles.progressBarLarge}>
          <div 
            className={styles.progressFillLarge}
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        <div className={styles.progressStats}>
          <span className={styles.progressStat}>
            {stats.completedTasks} completed
          </span>
          <span className={styles.progressStat}>
            {stats.pendingTasks} remaining
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskStatistics;