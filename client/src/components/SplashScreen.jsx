import React, { useState, useEffect } from "react";
import styles from "../pages/Auth.module.css";

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={styles.splashScreen}>
      <div className={styles.splashLogo}>
        <div className={styles.splashIcon}>✓</div>
        <h1 className={styles.splashTitle}>Smart Tasks - V9</h1>
        <p className={styles.splashSubtitle}>Intelligent task management</p>
      </div>
    </div>
  );
}
