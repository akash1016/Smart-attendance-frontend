import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const nav = useNavigate();
  async function s(e) {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/auth/login", {
        username: u,
        password: p,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);
      nav("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  }
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)"
    }}>
      <form
        onSubmit={s}
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 24px 0 #b6c2e2a0",
          padding: "32px 28px 24px 28px",
          minWidth: 320,
          maxWidth: 360,
          width: "100%"
        }}
      >
        <h2 style={{
          textAlign: "center",
          marginBottom: 24,
          color: "#1976d2",
          letterSpacing: 1
        }}>Smart Attendance Login</h2>
        <div style={{ marginBottom: 18 }}>
          <input
            placeholder="Username"
            value={u}
            onChange={(e) => setU(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #b6c2e2",
              borderRadius: 6,
              fontSize: 16,
              outline: "none",
              transition: "border 0.2s",
              marginBottom: 2
            }}
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <input
            placeholder="Password"
            type="password"
            value={p}
            onChange={(e) => setP(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #b6c2e2",
              borderRadius: 6,
              fontSize: 16,
              outline: "none",
              transition: "border 0.2s"
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px 0",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: 1,
            cursor: "pointer",
            boxShadow: "0 2px 8px #b6c2e230"
          }}
        >
          Login
        </button>
        <p style={{
          marginTop: 18,
          color: "#888",
          fontSize: 13,
          textAlign: "center"
        }}>
          <span style={{ color: "#1976d2", fontWeight: 500 }}>Demo:</span> admin/admin123 &nbsp; teacher1/pass123 &nbsp; student1/pass123
        </p>
      </form>
    </div>
  );
}
