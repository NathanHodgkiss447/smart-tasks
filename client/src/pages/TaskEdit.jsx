import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import http from "../api/http";

export default function TaskEdit({ mode }) {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "med",
    dueAt: "",
    completed: false,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        const { data } = await http.get(`/tasks/${id}`);
        setForm({
          title: data.title || "",
          description: data.description || "",
          priority: data.priority || "med",
          completed: !!data.completed,
          dueAt: data.dueAt
            ? new Date(data.dueAt).toISOString().slice(0, 16)
            : "",
        });
      })();
    }
  }, [id, isEdit]);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // test change 2
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      };
      if (isEdit) await http.patch(`/tasks/${id}`, payload);
      else await http.post(`/tasks`, payload);
      nav("/");
    } catch (err) {
      setError(err?.response?.data?.error || "Save failed");
    }
  }

  return (
    <div className="card">
      <h2>{isEdit ? "Edit Task" : "New Task"}</h2>
      <form onSubmit={onSubmit} className="form">
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Description"
          rows={4}
        />
        <label className="row">
          <span>Priority</span>
          <select
            value={form.priority}
            onChange={(e) => update("priority", e.target.value)}
          >
            <option value="low">low</option>
            <option value="med">med</option>
            <option value="high">high</option>
          </select>
        </label>
        <label className="row">
          <span>Due</span>
          <input
            type="datetime-local"
            value={form.dueAt}
            onChange={(e) => update("dueAt", e.target.value)}
          />
        </label>
        <label className="row">
          <span>Completed</span>
          <input
            type="checkbox"
            checked={form.completed}
            onChange={(e) => update("completed", e.target.checked)}
          />
        </label>
        {error && <p className="error">{String(error)}</p>}
        <div className="actions">
          <button type="button" onClick={() => nav(-1)}>
            Cancel
          </button>
          <button className="primary" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
