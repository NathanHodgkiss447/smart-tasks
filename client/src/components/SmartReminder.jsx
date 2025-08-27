import React from "react";

export default function SmartReminder({ summary, onApply }) {
  if (!summary) return null;
  return (
    <div className="reminder">
      <div>
        <strong>Overdue:</strong> {summary.overdueCount} &nbsp;|&nbsp;{" "}
        <strong>Due Today:</strong> {summary.dueToday?.length || 0}
      </div>
      {summary.suggested?.length > 0 && (
        <div className="suggest">
          <span>Suggestions:</span>
          {summary.suggested.slice(0, 3).map((s) => (
            <button
              key={s.taskId}
              onClick={() => onApply(s.taskId, s.suggestedDueAt)}
            >
              Set due for task {s.taskId.slice(-4)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
