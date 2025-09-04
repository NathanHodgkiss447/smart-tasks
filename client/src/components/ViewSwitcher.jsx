import React from 'react';
import styles from './ViewSwitcher.module.css';

const VIEWS = [
  { id: 'list', label: 'List', icon: '☰', description: 'Traditional list view' },
  { id: 'grid', label: 'Grid', icon: '⊞', description: 'Card-based grid layout' },
  { id: 'kanban', label: 'Kanban', icon: '⫴', description: 'Kanban board with columns' },
  { id: 'timeline', label: 'Timeline', icon: '◴', description: 'Timeline view for deadlines' }
];

const ViewSwitcher = ({ currentView, onViewChange, className = '' }) => {
  return (
    <div className={`${styles.viewSwitcher} ${className}`} role="tablist" aria-label="View options">
      <div className={styles.switcherTrack}>
        <div 
          className={styles.activeIndicator}
          style={{
            transform: `translateX(${VIEWS.findIndex(v => v.id === currentView) * 100}%)`
          }}
          aria-hidden="true"
        />
        
        {VIEWS.map((view, index) => (
          <button
            key={view.id}
            className={`${styles.viewButton} ${currentView === view.id ? styles.active : ''}`}
            onClick={() => onViewChange(view.id)}
            role="tab"
            aria-selected={currentView === view.id}
            aria-controls="tasks-content"
            title={`${view.description} (${index + 1})`}
            aria-describedby={`view-${view.id}-desc`}
          >
            <span className={styles.viewIcon} aria-hidden="true">
              {view.icon}
            </span>
            <span className={styles.viewLabel}>
              {view.label}
            </span>
            
            {/* Hidden description for screen readers */}
            <span 
              id={`view-${view.id}-desc`} 
              className="sr-only"
            >
              {view.description}
            </span>
          </button>
        ))}
      </div>
      
      {/* View count indicator */}
      <div className={styles.viewInfo} aria-live="polite">
        <span className={styles.viewCount}>
          {VIEWS.findIndex(v => v.id === currentView) + 1} of {VIEWS.length}
        </span>
      </div>
    </div>
  );
};

export default ViewSwitcher;