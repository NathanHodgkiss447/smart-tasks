import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../api/http";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    <div className="card">
      <h2>Log in</h2>
      <form onSubmit={onSubmit} className="form">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        {error && <p className="error">{String(error)}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  );
}
