import React from 'react';
import styles from './LoadingStates.module.css';

// Skeleton for TaskCard
export const TaskCardSkeleton = ({ density = 'comfortable' }) => (
  <div className={`${styles.taskSkeleton} ${styles[`density${density.charAt(0).toUpperCase() + density.slice(1)}`]}`}>
    <div className={styles.taskHeader}>
      <div className={styles.skeletonCheckbox} />
      <div className={styles.taskContent}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonMeta}>
          <div className={styles.skeletonChip} />
          <div className={styles.skeletonDate} />
        </div>
      </div>
      <div className={styles.skeletonDrag} />
    </div>
    {density !== 'minimal' && (
      <div className={styles.taskActions}>
        <div className={styles.skeletonButton} />
        <div className={styles.skeletonButton} />
      </div>
    )}
  </div>
);

// Skeleton for Filter Bar
export const FiltersSkeleton = () => (
  <div className={styles.filtersSkeleton}>
    <div className={styles.searchSkeleton} />
    <div className={styles.filterButtonsContainer}>
      {[...Array(5)].map((_, index) => (
        <div key={index} className={styles.filterButtonSkeleton} />
      ))}
    </div>
  </div>
);

// Skeleton for ViewSwitcher
export const ViewSwitcherSkeleton = () => (
  <div className={styles.viewSwitcherSkeleton}>
    <div className={styles.viewSwitcherTrack}>
      {[...Array(4)].map((_, index) => (
        <div key={index} className={styles.viewButtonSkeleton} />
      ))}
    </div>
  </div>
);

// Loading Spinner Component
export const LoadingSpinner = ({ 
  size = 'medium', 
  label = 'Loading...', 
  inline = false,
  color = 'accent' 
}) => {
  const sizeClass = `spinner${size.charAt(0).toUpperCase() + size.slice(1)}`;
  const colorClass = `spinner${color.charAt(0).toUpperCase() + color.slice(1)}`;
  
  return (
    <div 
      className={`${styles.spinnerContainer} ${inline ? styles.inline : ''}`}
      role="status"
      aria-label={label}
    >
      <div className={`${styles.spinner} ${styles[sizeClass]} ${styles[colorClass]}`}>
        <div className={styles.spinnerRing} />
        <div className={styles.spinnerRing} />
        <div className={styles.spinnerRing} />
      </div>
      {!inline && <span className={styles.spinnerLabel}>{label}</span>}
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Loading Dots Component
export const LoadingDots = ({ 
  label = 'Loading...', 
  color = 'accent',
  size = 'medium'
}) => {
  const sizeClass = `dots${size.charAt(0).toUpperCase() + size.slice(1)}`;
  const colorClass = `dots${color.charAt(0).toUpperCase() + color.slice(1)}`;
  
  return (
    <div className={styles.dotsContainer} role="status" aria-label={label}>
      <div className={`${styles.dots} ${styles[sizeClass]} ${styles[colorClass]}`}>
        <div className={styles.dot} />
        <div className={styles.dot} />
        <div className={styles.dot} />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Progressive Loading Component
export const ProgressiveLoader = ({ 
  progress = 0, 
  label = 'Loading...', 
  showPercentage = false,
  animated = true 
}) => (
  <div className={styles.progressiveLoader} role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
    <div className={styles.progressLabel}>
      {label}
      {showPercentage && <span className={styles.progressPercentage}>{Math.round(progress)}%</span>}
    </div>
    <div className={styles.progressTrack}>
      <div 
        className={`${styles.progressBar} ${animated ? styles.progressAnimated : ''}`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  </div>
);

// Pulse Animation for Loading States
export const PulsingCard = ({ children, isLoading = true }) => (
  <div className={`${styles.pulsingWrapper} ${isLoading ? styles.pulsing : ''}`}>
    {children}
  </div>
);

// Shimmer Effect Component
export const ShimmerEffect = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '' 
}) => (
  <div 
    className={`${styles.shimmerEffect} ${className}`}
    style={{ 
      width, 
      height, 
      borderRadius 
    }}
  />
);

// List Loading State
export const ListLoadingSkeleton = ({ 
  itemCount = 5, 
  density = 'comfortable',
  showFilters = true,
  showViewSwitcher = true 
}) => (
  <div className={styles.listLoadingContainer}>
    {showFilters && <FiltersSkeleton />}
    {showViewSwitcher && <ViewSwitcherSkeleton />}
    <div className={styles.listSkeleton}>
      {[...Array(itemCount)].map((_, index) => (
        <TaskCardSkeleton key={index} density={density} />
      ))}
    </div>
  </div>
);

// Empty State Component
export const EmptyState = ({ 
  icon = '📋',
  title = 'No items found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  onAction,
  className = ''
}) => (
  <div className={`${styles.emptyState} ${className}`}>
    <div className={styles.emptyIcon} aria-hidden="true">
      {icon}
    </div>
    <h3 className={styles.emptyTitle}>
      {title}
    </h3>
    <p className={styles.emptyDescription}>
      {description}
    </p>
    {actionLabel && onAction && (
      <button className={styles.emptyAction} onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

// Error State Component
export const ErrorState = ({ 
  icon = '⚠️',
  title = 'Something went wrong',
  description = 'An error occurred while loading the content.',
  actionLabel = 'Try Again',
  onAction,
  className = ''
}) => (
  <div className={`${styles.errorState} ${className}`}>
    <div className={styles.errorIcon} aria-hidden="true">
      {icon}
    </div>
    <h3 className={styles.errorTitle}>
      {title}
    </h3>
    <p className={styles.errorDescription}>
      {description}
    </p>
    {actionLabel && onAction && (
      <button className={styles.errorAction} onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

// Lazy Loading Trigger
export const LazyLoadTrigger = ({ 
  onLoadMore, 
  hasMore = true, 
  loading = false,
  threshold = 100 
}) => {
  React.useEffect(() => {
    if (!hasMore || loading || !onLoadMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    const trigger = document.getElementById('lazy-load-trigger');
    if (trigger) {
      observer.observe(trigger);
    }

    return () => {
      if (trigger) {
        observer.unobserve(trigger);
      }
    };
  }, [hasMore, loading, onLoadMore, threshold]);

  if (!hasMore) return null;

  return (
    <div id="lazy-load-trigger" className={styles.lazyLoadTrigger}>
      {loading ? (
        <LoadingSpinner size="small" label="Loading more..." inline />
      ) : (
        <span className={styles.lazyLoadText}>Scroll to load more</span>
      )}
    </div>
  );
};