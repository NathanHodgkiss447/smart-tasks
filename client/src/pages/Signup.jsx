import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import React from "react";
import http from "../api/http";

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
    <div className="card">
      <h2>Create account</h2>
      <form onSubmit={onSubmit} className="form">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          placeholder="Password (min 8)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        {error && <p className="error">{String(error)}</p>}
        <button type="submit">Create account</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
