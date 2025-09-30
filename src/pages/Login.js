import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PasswordResetForm({ onClose }) {
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const token = `demo-${username}`;
    try {
      const res = await axios.post("http://127.0.0.1:5000/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword
      }, {
        headers: { Authorization: token, Username: username }
      });
      if (res.data && res.data.ok) {
        setStatus("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
      } else {
        setStatus(res.data.msg || "Failed to change password.");
      }
    } catch (err) {
      setStatus(err.response?.data?.msg || "Failed to change password.");
    }
    setLoading(false);
  }

  return (
    <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 12px #b6c2e230", padding: 24, maxWidth: 340, margin: "24px auto" }}>
      <h3 style={{ color: "#1976d2", marginBottom: 16, textAlign: "center" }}>Reset Password</h3>
      <form onSubmit={handleReset}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #b6c2e2" }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Old Password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #b6c2e2" }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #b6c2e2" }}
          />
        </div>
        <div style={{ marginBottom: 10, fontSize: 13 }}>
          <label>
            <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} style={{ marginRight: 6 }} /> Show Passwords
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "8px 0", background: loading ? "#90caf9" : "#1976d2", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
        {status && <div style={{ color: status.includes("success") ? "green" : "#e53935", marginTop: 12, textAlign: "center" }}>{status}</div>}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button type="button" onClick={onClose} style={{ background: "#eee", color: "#1976d2", border: "none", borderRadius: 6, padding: "6px 18px", cursor: "pointer" }}>Close</button>
        </div>
      </form>
    </div>
  );
}

export default function Login() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [showReset, setShowReset] = useState(false);
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
      <div style={{ width: "100%", maxWidth: 400 }}>
        {showReset ? (
          <PasswordResetForm onClose={() => setShowReset(false)} />
        ) : (
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
            <button
              type="button"
              onClick={() => setShowReset(true)}
              style={{
                width: "100%",
                marginTop: 14,
                padding: "8px 0",
                background: "#eee",
                color: "#1976d2",
                border: "none",
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 15,
                cursor: "pointer"
              }}
            >
              Reset Password
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
        )}
      </div>
    </div>
  );
}
