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
    <form onSubmit={s} style={{ maxWidth: 360, margin: "40px auto" }}>
      <div>
        <input
          placeholder="username"
          value={u}
          onChange={(e) => setU(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <input
          placeholder="password"
          type="password"
          value={p}
          onChange={(e) => setP(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="submit">Login</button>
      </div>
      <p style={{ marginTop: 12 }}>
        Demo: admin/admin123 teacher1/pass123 student1/pass123
      </p>
    </form>
  );
}
