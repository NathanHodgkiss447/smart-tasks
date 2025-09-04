import React, { useState, useEffect } from 'react';
import styles from './FocusMode.module.css';

const FOCUS_PRESETS = [
  { id: 'minimal', label: 'Minimal Focus', icon: '🔍', description: 'Hide completed tasks and distractions' },
  { id: 'work', label: 'Work Focus', icon: '💼', description: 'Priority tasks and work-related items' },
  { id: 'today', label: 'Today Focus', icon: '📅', description: 'Only tasks due today' },
  { id: 'priority', label: 'Priority Focus', icon: '⚡', description: 'High priority tasks only' }
];

const FOCUS_SETTINGS = [
  { id: 'hideCompleted', label: 'Hide completed tasks', icon: '✅' },
  { id: 'hideOverdue', label: 'Hide overdue tasks', icon: '⚠️' },
  { id: 'hideNoDate', label: 'Hide tasks without due dates', icon: '📅' },
  { id: 'hideLowPriority', label: 'Hide low priority tasks', icon: '🟢' },
  { id: 'minimizeActions', label: 'Minimize task actions', icon: '🎯' },
  { id: 'reduceAnimations', label: 'Reduce animations', icon: '🎬' }
];

const FocusMode = ({ 
  isActive, 
  onToggle, 
  currentPreset = 'minimal', 
  onPresetChange,
  settings = {},
  onSettingsChange,
  taskCounts = {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    hideCompleted: true,
    hideOverdue: false,
    hideNoDate: false,
    hideLowPriority: false,
    minimizeActions: false,
    reduceAnimations: false,
    ...settings
  });

  useEffect(() => {
    if (isActive) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }

    return () => {
      document.body.classList.remove('focus-mode');
    };
  }, [isActive]);

  const handlePresetChange = (presetId) => {
    let newSettings = { ...customSettings };
    
    switch (presetId) {
      case 'minimal':
        newSettings = {
          hideCompleted: true,
          hideOverdue: false,
          hideNoDate: false,
          hideLowPriority: false,
          minimizeActions: true,
          reduceAnimations: true
        };
        break;
      case 'work':
        newSettings = {
          hideCompleted: true,
          hideOverdue: false,
          hideNoDate: true,
          hideLowPriority: true,
          minimizeActions: false,
          reduceAnimations: false
        };
        break;
      case 'today':
        newSettings = {
          hideCompleted: true,
          hideOverdue: true,
          hideNoDate: true,
          hideLowPriority: false,
          minimizeActions: false,
          reduceAnimations: false
        };
        break;
      case 'priority':
        newSettings = {
          hideCompleted: false,
          hideOverdue: false,
          hideNoDate: false,
          hideLowPriority: true,
          minimizeActions: true,
          reduceAnimations: true
        };
        break;
    }
    
    setCustomSettings(newSettings);
    onPresetChange?.(presetId);
    onSettingsChange?.(newSettings);
  };

  const handleSettingChange = (settingId, value) => {
    const newSettings = {
      ...customSettings,
      [settingId]: value
    };
    setCustomSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const toggleFocusMode = () => {
    onToggle?.();
    if (!isActive) {
      // Apply current preset when enabling focus mode
      onSettingsChange?.(customSettings);
    }
  };

  const getFilteredTaskCount = () => {
    if (!isActive || !taskCounts.total) return taskCounts.total || 0;
    
    let count = taskCounts.total || 0;
    
    if (customSettings.hideCompleted) {
      count -= (taskCounts.completed || 0);
    }
    if (customSettings.hideOverdue) {
      count -= (taskCounts.overdue || 0);
    }
    if (customSettings.hideNoDate) {
      count -= (taskCounts.noDate || 0);
    }
    if (customSettings.hideLowPriority) {
      count -= (taskCounts.lowPriority || 0);
    }
    
    return Math.max(0, count);
  };

  return (
    <div className={`${styles.focusMode} ${isActive ? styles.active : ''}`}>
      {/* Focus Mode Toggle */}
      <div className={styles.focusToggle}>
        <button
          className={`${styles.toggleButton} ${isActive ? styles.toggleActive : ''}`}
          onClick={toggleFocusMode}
          aria-pressed={isActive}
          title={isActive ? 'Exit Focus Mode' : 'Enter Focus Mode'}
        >
          <span className={styles.toggleIcon} aria-hidden="true">
            {isActive ? '🎯' : '👁️'}
          </span>
          <span className={styles.toggleLabel}>
            {isActive ? 'Focus On' : 'Focus Mode'}
          </span>
          {isActive && (
            <span className={styles.taskCount}>
              {getFilteredTaskCount()} tasks
            </span>
          )}
        </button>
        
        {isActive && (
          <button
            className={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="focus-settings"
            title={isExpanded ? 'Hide focus settings' : 'Show focus settings'}
          >
            <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`} aria-hidden="true">
              ⚙️
            </span>
          </button>
        )}
      </div>

      {/* Focus Settings */}
      {isActive && (
        <div
          id="focus-settings"
          className={`${styles.focusSettings} ${isExpanded ? styles.settingsExpanded : ''}`}
          role="group"
          aria-label="Focus mode settings"
        >
          {/* Focus Presets */}
          <div className={styles.presetsSection}>
            <h4 className={styles.sectionTitle}>Focus Presets</h4>
            <div className={styles.presets}>
              {FOCUS_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  className={`${styles.presetButton} ${currentPreset === preset.id ? styles.presetActive : ''}`}
                  onClick={() => handlePresetChange(preset.id)}
                  title={preset.description}
                >
                  <span className={styles.presetIcon} aria-hidden="true">
                    {preset.icon}
                  </span>
                  <span className={styles.presetLabel}>
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Settings */}
          <div className={styles.settingsSection}>
            <h4 className={styles.sectionTitle}>Custom Settings</h4>
            <div className={styles.settingsList}>
              {FOCUS_SETTINGS.map(setting => (
                <label
                  key={setting.id}
                  className={`${styles.settingItem} ${customSettings[setting.id] ? styles.settingActive : ''}`}
                >
                  <input
                    type="checkbox"
                    className={styles.settingCheckbox}
                    checked={customSettings[setting.id] || false}
                    onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
                    aria-describedby={`${setting.id}-desc`}
                  />
                  <span className={styles.settingIcon} aria-hidden="true">
                    {setting.icon}
                  </span>
                  <span className={styles.settingLabel}>
                    {setting.label}
                  </span>
                  <span className={styles.settingToggle} aria-hidden="true">
                    {customSettings[setting.id] ? '✓' : '○'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Focus Stats */}
          <div className={styles.statsSection}>
            <h4 className={styles.sectionTitle}>Focus Stats</h4>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Tasks:</span>
                <span className={styles.statValue}>{taskCounts.total || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Focused Tasks:</span>
                <span className={styles.statValue}>{getFilteredTaskCount()}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Hidden:</span>
                <span className={styles.statValue}>
                  {(taskCounts.total || 0) - getFilteredTaskCount()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;