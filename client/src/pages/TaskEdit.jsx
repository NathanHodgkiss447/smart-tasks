import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import http from "../api/http";
import styles from "./TaskEdit.module.css";

// Icons as SVG components for better performance
const IconTitle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);

const IconDescription = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
  </svg>
);

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 12 2 2 4-4" />
    <path d="M21 12c.552 0 1-.448 1-1a10 10 0 0 0-10-10 1 1 0 0 0-1 1v10z" />
  </svg>
);

const IconSave = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17,21 17,13 7,13 7,21" />
    <polyline points="7,3 7,8 15,8" />
  </svg>
);

const IconCancel = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m18 6-12 12" />
    <path d="m6 6 12 12" />
  </svg>
);

const SaveStatus = ({ status }) => {
  const statusConfig = {
    idle: { text: "", className: "" },
    saving: { text: "Saving...", className: styles.statusSaving },
    saved: { text: "Saved", className: styles.statusSaved },
    error: { text: "Save failed", className: styles.statusError }
  };

  const config = statusConfig[status] || statusConfig.idle;
  
  return config.text ? (
    <div className={`${styles.saveStatus} ${config.className}`} aria-live="polite">
      {status === 'saving' && (
        <div className={styles.spinner} aria-label="Saving" />
      )}
      <span>{config.text}</span>
    </div>
  ) : null;
};

export default function TaskEdit({ mode }) {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = mode === "edit";
  const formRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const titleInputRef = useRef(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "med",
    dueAt: "",
    completed: false,
  });
  
  const [initialForm, setInitialForm] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState("idle");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-save function with debouncing
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !isEdit || !id) return;
    
    setSaveStatus("saving");
    try {
      const payload = {
        ...form,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      };
      await http.patch(`/tasks/${id}`, payload);
      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      setInitialForm({ ...form });
      
      // Clear saved status after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
      setError(err?.response?.data?.error || "Auto-save failed");
      setTimeout(() => setSaveStatus("idle"), 5000);
    }
  }, [form, hasUnsavedChanges, isEdit, id]);

  // Debounced auto-save effect
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (hasUnsavedChanges && isEdit) {
      saveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 2000); // 2 second debounce
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, autoSave, isEdit]);

  // Load task data for edit mode
  useEffect(() => {
    if (isEdit && id) {
      setIsLoading(true);
      (async () => {
        try {
          const { data } = await http.get(`/tasks/${id}`);
          const formData = {
            title: data.title || "",
            description: data.description || "",
            priority: data.priority || "med",
            completed: !!data.completed,
            dueAt: data.dueAt
              ? new Date(data.dueAt).toISOString().slice(0, 16)
              : "",
          };
          setForm(formData);
          setInitialForm(formData);
        } catch (err) {
          setError(err?.response?.data?.error || "Failed to load task");
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [id, isEdit]);

  // Focus title input on mount
  useEffect(() => {
    if (titleInputRef.current && !isLoading) {
      titleInputRef.current.focus();
    }
  }, [isLoading]);

  // Check for unsaved changes
  useEffect(() => {
    if (initialForm) {
      const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);
      setHasUnsavedChanges(hasChanges);
    }
  }, [form, initialForm]);

  // Prevent navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(e);
      }
      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [form]);

  // Form validation
  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          errors.title = 'Title is required';
        } else if (value.length > 200) {
          errors.title = 'Title must be less than 200 characters';
        } else {
          delete errors.title;
        }
        break;
      case 'description':
        if (value.length > 1000) {
          errors.description = 'Description must be less than 1000 characters';
        } else {
          delete errors.description;
        }
        break;
      case 'dueAt':
        if (value && new Date(value) < new Date()) {
          errors.dueAt = 'Due date cannot be in the past';
        } else {
          delete errors.dueAt;
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError(""); // Clear general error when user types
    validateField(k, v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaveStatus("saving");
    
    // Validate all fields
    const isValid = Object.keys(form).every(key => validateField(key, form[key]));
    if (!isValid) {
      setSaveStatus("error");
      return;
    }
    
    try {
      const payload = {
        ...form,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      };
      if (isEdit) await http.patch(`/tasks/${id}`, payload);
      else await http.post(`/tasks`, payload);
      
      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      
      // Navigate after short delay to show save status
      setTimeout(() => nav("/"), 500);
    } catch (err) {
      setSaveStatus("error");
      setError(err?.response?.data?.error || "Save failed");
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        nav(-1);
      }
    } else {
      nav(-1);
    }
  };

  const handlePrioritySelect = (priority) => {
    update("priority", priority);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <div className={styles.spinner} />
          <p>Loading task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Header with title and save status */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{isEdit ? "Edit Task" : "Create New Task"}</h1>
            <p className={styles.subtitle}>
              {isEdit ? "Make changes to your task" : "Add a new task to your list"}
            </p>
          </div>
          <SaveStatus status={saveStatus} />
        </header>

        {/* Basic Information Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          
          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>
              <IconTitle />
              <span>Title *</span>
            </label>
            <input
              ref={titleInputRef}
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={`${styles.input} ${fieldErrors.title ? styles.inputError : ''}`}
              placeholder="Enter task title..."
              required
              aria-describedby={fieldErrors.title ? "title-error" : undefined}
              maxLength={200}
            />
            {fieldErrors.title && (
              <p id="title-error" className={styles.fieldError} role="alert">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              <IconDescription />
              <span>Description</span>
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className={`${styles.textarea} ${fieldErrors.description ? styles.inputError : ''}`}
              placeholder="Add more details about this task..."
              rows={4}
              aria-describedby={fieldErrors.description ? "description-error" : undefined}
              maxLength={1000}
            />
            <div className={styles.charCount}>
              {form.description.length}/1000 characters
            </div>
            {fieldErrors.description && (
              <p id="description-error" className={styles.fieldError} role="alert">
                {fieldErrors.description}
              </p>
            )}
          </div>
        </section>

        {/* Priority & Scheduling Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Priority & Scheduling</h2>
          
          <div className={styles.field}>
            <label className={styles.label}>
              <span>Priority Level</span>
            </label>
            <div className={styles.priorityGroup} role="radiogroup" aria-label="Priority level">
              {[{ value: 'low', label: 'Low', color: 'var(--ok)' },
                { value: 'med', label: 'Medium', color: '#ffc107' },
                { value: 'high', label: 'High', color: 'var(--danger)' }].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  className={`${styles.priorityButton} ${
                    form.priority === priority.value ? styles.priorityButtonActive : ''
                  }`}
                  onClick={() => handlePrioritySelect(priority.value)}
                  style={{ '--priority-color': priority.color }}
                  role="radio"
                  aria-checked={form.priority === priority.value}
                  aria-label={`Priority: ${priority.label}`}
                >
                  <span className={styles.priorityDot} />
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="dueAt" className={styles.label}>
              <IconClock />
              <span>Due Date & Time</span>
            </label>
            <input
              id="dueAt"
              type="datetime-local"
              value={form.dueAt}
              onChange={(e) => update("dueAt", e.target.value)}
              className={`${styles.input} ${fieldErrors.dueAt ? styles.inputError : ''}`}
              aria-describedby={fieldErrors.dueAt ? "dueAt-error" : undefined}
            />
            {fieldErrors.dueAt && (
              <p id="dueAt-error" className={styles.fieldError} role="alert">
                {fieldErrors.dueAt}
              </p>
            )}
          </div>
        </section>

        {/* Status Section - Only show in edit mode */}
        {isEdit && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Status</h2>
            
            <div className={styles.field}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={form.completed}
                  onChange={(e) => update("completed", e.target.checked)}
                  className={styles.toggleInput}
                  aria-describedby="completed-help"
                />
                <span className={styles.toggleSlider}>
                  <span className={styles.toggleIcon}>
                    <IconCheck />
                  </span>
                </span>
                <span className={styles.toggleText}>
                  <strong>{form.completed ? "Completed" : "In Progress"}</strong>
                  <small id="completed-help" className={styles.toggleHelp}>
                    {form.completed 
                      ? "This task is marked as completed"
                      : "Mark this task as completed when finished"}
                  </small>
                </span>
              </label>
            </div>
          </section>
        )}

        {/* Error Display */}
        {error && (
          <div className={styles.errorAlert} role="alert" aria-live="polite">
            <strong>Error:</strong> {String(error)}
          </div>
        )}

        {/* Actions */}
        <footer className={styles.actions}>
          <button 
            type="button" 
            onClick={handleCancel}
            className={styles.cancelButton}
            aria-label="Cancel and go back"
          >
            <IconCancel />
            Cancel
          </button>
          
          <div className={styles.primaryActions}>
            {isEdit && hasUnsavedChanges && (
              <span className={styles.unsavedIndicator} aria-live="polite">
                Unsaved changes
              </span>
            )}
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={Object.keys(fieldErrors).length > 0}
              aria-label={`${isEdit ? 'Update' : 'Create'} task (Ctrl+S)`}
            >
              <IconSave />
              {isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </footer>

        {/* Keyboard shortcuts help */}
        <div className={styles.shortcuts} aria-label="Keyboard shortcuts">
          <small>
            <kbd>Ctrl+S</kbd> Save • <kbd>Esc</kbd> Cancel
          </small>
        </div>
      </form>
    </div>
  );
}
