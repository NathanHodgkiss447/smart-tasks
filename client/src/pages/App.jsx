import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Dashboard from "./Dashboard.jsx";
import TaskEdit from "./TaskEdit.jsx";

function isAuthed() {
  return !!localStorage.getItem("token");
}
function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="container">
      <header className="appbar">
        <Link to="/" className="brand">
          Smart Tasks
        </Link>
        <nav>
          {isAuthed() ? (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/tasks/new"
          element={
            <Protected>
              <TaskEdit mode="create" />
            </Protected>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <Protected>
              <TaskEdit mode="edit" />
            </Protected>
          }
        />
      </Routes>
    </div>
  );
}
