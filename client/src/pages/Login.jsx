import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../api/http";
import SplashScreen from "../components/SplashScreen";
import styles from "./Auth.module.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await http.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      nav("/");
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    }
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>✓</div>
            <div className={styles.logoText}>Smart Tasks</div>
          </div>
          
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Welcome back</h1>
            <p className={styles.authSubtitle}>Sign in to your account to continue</p>
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>
            
            {error && <p className={styles.error}>{String(error)}</p>}
            
            <button type="submit" className={styles.submitButton}>
              Sign In
            </button>
          </form>
          
          <div className={styles.authFooter}>
            New here? <Link to="/signup" className={styles.authLink}>Create an account</Link>
          </div>
        </div>
      </div>
    </>
  );
}
