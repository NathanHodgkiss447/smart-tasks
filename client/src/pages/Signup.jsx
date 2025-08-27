import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../api/http";
import styles from "./Auth.module.css";

export default function Signup() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await http.post("/auth/signup", { email, password });
      localStorage.setItem("token", data.token);
      nav("/");
    } catch (err) {
      setError(err?.response?.data?.error || "Signup failed");
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>✓</div>
          <div className={styles.logoText}>Smart Tasks</div>
        </div>
        
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Get started</h1>
          <p className={styles.authSubtitle}>Create your account to begin organizing</p>
        </div>
        
        <form onSubmit={onSubmit} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              placeholder="Password (minimum 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={8}
            />
          </div>
          
          {error && <p className={styles.error}>{String(error)}</p>}
          
          <button type="submit" className={styles.submitButton}>
            Create Account
          </button>
        </form>
        
        <div className={styles.authFooter}>
          Already have an account? <Link to="/login" className={styles.authLink}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
