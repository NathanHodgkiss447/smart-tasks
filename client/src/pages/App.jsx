import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Dashboard from "./Dashboard.jsx";
import TaskEdit from "./TaskEdit.jsx";
import styles from "../components/AppBar.module.css";

function isAuthed() {
  return !!localStorage.getItem("token");
}
function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const authenticated = isAuthed();

  return (
    <div className="container">
      {!isAuthPage && (
        <header className={styles.appBar}>
          <Link to="/" className={styles.brand}>
            <div className={styles.brandIcon}>✓</div>
            Smart Tasks
          </Link>
          <nav className={styles.nav}>
            {authenticated ? (
              <div className={styles.userSection}>
                <div className={styles.userAvatar}>U</div>
                <div className={styles.userInfo}>
                  <p className={styles.welcomeText}>Welcome back</p>
                  <p className={styles.userName}>User</p>
                </div>
                <button
                  className={styles.logoutButton}
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className={styles.navLink}>Login</Link>
                <Link to="/signup" className={styles.navLink}>Signup</Link>
              </>
            )}
          </nav>
        </header>
      )}

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
