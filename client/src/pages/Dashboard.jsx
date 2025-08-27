import { useEffect, useState } from "react";
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

const FILTERS = ["all", "overdue", "today", "upcoming", "completed"];

export default function Dashboard() {
  const [filter, setFilter] = useState("today");
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);

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
    const { data } = await http.patch(`/tasks/${task._id}`, {
      completed: !task.completed,
    });
    setTasks((prev) => prev.map((x) => (x._id === data._id ? data : x)));
  }

  async function remove(task) {
    await http.delete(`/tasks/${task._id}`);
    await load();
  }

  async function applySuggested(taskId, dueAt) {
    await http.patch(`/tasks/${taskId}`, { dueAt });
    load();
  }

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
    <div>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`${styles.filterButton} ${f === filter ? styles.filterButtonActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <Link to="/tasks/new" className={styles.newTaskButton}>
            <span className={styles.newTaskIcon}>+</span>
            New Task
          </Link>
        </div>
      </div>

      <SmartReminder summary={summary} onApply={applySuggested} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <div className="list">
          {tasks.length === 0 ? (
            <p className="muted">No tasks in this view.</p>
          ) : (
            <SortableContext
              items={tasks.map((t) => t._id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((t) => (
                <TaskCard
                  key={t._id}
                  task={t}
                  onToggle={toggleComplete}
                  onDelete={remove}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </DndContext>
    </div>
  );
}
