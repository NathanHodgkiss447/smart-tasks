import React, { useState, useEffect } from 'react';
import { GROUPING_OPTIONS } from './TaskGrouping';
import styles from './EnhancedFilters.module.css';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Tasks', icon: '📋', color: '#6ea8fe' },
  { id: 'overdue', label: 'Overdue', icon: '⚠️', color: '#ff6b6b' },
  { id: 'today', label: 'Today', icon: '🔥', color: '#ffc107' },
  { id: 'upcoming', label: 'Upcoming', icon: '📅', color: '#6ea8fe' },
  { id: 'completed', label: 'Completed', icon: '✅', color: '#6efeb5' }
];

const PRIORITY_OPTIONS = [
  { id: 'all', label: 'All Priorities', icon: '🎯' },
  { id: 'high', label: 'High', icon: '🔴' },
  { id: 'med', label: 'Medium', icon: '🟡' },
  { id: 'low', label: 'Low', icon: '🟢' }
];

const DENSITY_OPTIONS = [
  { id: 'comfortable', label: 'Comfortable', icon: '💺' },
  { id: 'compact', label: 'Compact', icon: '📦' },
  { id: 'minimal', label: 'Minimal', icon: '🔍' }
];

const EnhancedFilters = ({
  currentFilter = 'all',
  onFilterChange,
  currentGrouping = 'none',
  onGroupingChange,
  currentDensity = 'comfortable',
  onDensityChange,
  searchQuery = '',
  onSearchChange,
  priorityFilter = 'all',
  onPriorityChange,
  showSearch = true,
  showGrouping = true,
  showDensity = true,
  showPriority = true,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (!compact) {
      setIsExpanded(true);
    }
  }, [compact]);

  const activeFilters = [];
  
  if (currentFilter !== 'all') {
    const filterOption = FILTER_OPTIONS.find(f => f.id === currentFilter);
    if (filterOption) activeFilters.push({ type: 'status', ...filterOption });
  }
  
  if (priorityFilter !== 'all') {
    const priorityOption = PRIORITY_OPTIONS.find(p => p.id === priorityFilter);
    if (priorityOption) activeFilters.push({ type: 'priority', ...priorityOption });
  }
  
  if (currentGrouping !== 'none') {
    const groupingOption = GROUPING_OPTIONS.find(g => g.id === currentGrouping);
    if (groupingOption) activeFilters.push({ type: 'grouping', ...groupingOption });
  }

  const clearFilter = (filterType, filterId) => {
    switch (filterType) {
      case 'status':
        onFilterChange?.('all');
        break;
      case 'priority':
        onPriorityChange?.('all');
        break;
      case 'grouping':
        onGroupingChange?.('none');
        break;
    }
  };

  const clearAllFilters = () => {
    onFilterChange?.('all');
    onPriorityChange?.('all');
    onGroupingChange?.('none');
    onSearchChange?.('');
  };

  return (
    <div className={`${styles.filtersContainer} ${compact ? styles.compact : ''}`}>
      {/* Search Bar */}
      {showSearch && (
        <div className={`${styles.searchContainer} ${searchFocused ? styles.focused : ''}`}>
          <div className={styles.searchIcon} aria-hidden="true">🔍</div>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              className={styles.searchClear}
              onClick={() => onSearchChange?.('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className={styles.activeFilters}>
          <div className={styles.activeFiltersHeader}>
            <span className={styles.activeFiltersLabel}>Active Filters:</span>
            <button
              className={styles.clearAllButton}
              onClick={clearAllFilters}
              aria-label="Clear all filters"
              title="Clear all filters"
            >
              Clear All
            </button>
          </div>
          <div className={styles.filterChips}>
            {activeFilters.map(filter => (
              <div
                key={`${filter.type}-${filter.id}`}
                className={styles.filterChip}
                style={{ '--chip-color': filter.color || '#6ea8fe' }}
              >
                <span className={styles.chipIcon} aria-hidden="true">
                  {filter.icon}
                </span>
                <span className={styles.chipLabel}>
                  {filter.label}
                </span>
                <button
                  className={styles.chipRemove}
                  onClick={() => clearFilter(filter.type, filter.id)}
                  aria-label={`Remove ${filter.label} filter`}
                  title={`Remove ${filter.label} filter`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Filters */}
      {compact && (
        <button
          className={styles.expandToggle}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="filter-options"
          title={isExpanded ? 'Hide filter options' : 'Show filter options'}
        >
          <span className={styles.expandIcon} aria-hidden="true">
            {isExpanded ? '▲' : '▼'}
          </span>
          <span>Filter Options</span>
        </button>
      )}

      {/* Filter Options */}
      <div
        id="filter-options"
        className={`${styles.filterOptions} ${!isExpanded ? styles.hidden : ''}`}
        role="group"
        aria-label="Filter and view options"
      >
        {/* Status Filters */}
        <div className={styles.filterSection}>
          <h4 className={styles.sectionTitle}>Status</h4>
          <div className={styles.filterButtons} role="radiogroup" aria-label="Task status">
            {FILTER_OPTIONS.map(filter => (
              <button
                key={filter.id}
                className={`${styles.filterButton} ${currentFilter === filter.id ? styles.active : ''}`}
                onClick={() => onFilterChange?.(filter.id)}
                role="radio"
                aria-checked={currentFilter === filter.id}
                title={filter.label}
                style={{ '--filter-color': filter.color }}
              >
                <span className={styles.buttonIcon} aria-hidden="true">
                  {filter.icon}
                </span>
                <span className={styles.buttonLabel}>
                  {filter.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        {showPriority && (
          <div className={styles.filterSection}>
            <h4 className={styles.sectionTitle}>Priority</h4>
            <div className={styles.filterButtons} role="radiogroup" aria-label="Task priority">
              {PRIORITY_OPTIONS.map(priority => (
                <button
                  key={priority.id}
                  className={`${styles.filterButton} ${priorityFilter === priority.id ? styles.active : ''}`}
                  onClick={() => onPriorityChange?.(priority.id)}
                  role="radio"
                  aria-checked={priorityFilter === priority.id}
                  title={priority.label}
                >
                  <span className={styles.buttonIcon} aria-hidden="true">
                    {priority.icon}
                  </span>
                  <span className={styles.buttonLabel}>
                    {priority.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grouping Options */}
        {showGrouping && (
          <div className={styles.filterSection}>
            <h4 className={styles.sectionTitle}>Group By</h4>
            <div className={styles.filterButtons} role="radiogroup" aria-label="Task grouping">
              {GROUPING_OPTIONS.map(grouping => (
                <button
                  key={grouping.id}
                  className={`${styles.filterButton} ${currentGrouping === grouping.id ? styles.active : ''}`}
                  onClick={() => onGroupingChange?.(grouping.id)}
                  role="radio"
                  aria-checked={currentGrouping === grouping.id}
                  title={grouping.label}
                >
                  <span className={styles.buttonIcon} aria-hidden="true">
                    {grouping.icon}
                  </span>
                  <span className={styles.buttonLabel}>
                    {grouping.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Density Controls */}
        {showDensity && (
          <div className={styles.filterSection}>
            <h4 className={styles.sectionTitle}>Display Density</h4>
            <div className={styles.filterButtons} role="radiogroup" aria-label="Display density">
              {DENSITY_OPTIONS.map(density => (
                <button
                  key={density.id}
                  className={`${styles.filterButton} ${currentDensity === density.id ? styles.active : ''}`}
                  onClick={() => onDensityChange?.(density.id)}
                  role="radio"
                  aria-checked={currentDensity === density.id}
                  title={density.label}
                >
                  <span className={styles.buttonIcon} aria-hidden="true">
                    {density.icon}
                  </span>
                  <span className={styles.buttonLabel}>
                    {density.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedFilters;