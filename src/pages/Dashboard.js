import React from "react";
import AdminPanel from "./AdminPanel";
import TeacherPanel from "./TeacherPanel";
import StudentPanel from "./StudentPanel";
import AdminPage from "./AdminPage";
import TeacherPage from "./TeacherPage";

export default function Dashboard() {
  const role = localStorage.getItem("role");
  const user = localStorage.getItem("username");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e3f0ff 0%, #f7faff 100%)",
        padding: "0 0 40px 0",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "32px 24px 16px 24px",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px #1976d222",
          position: "relative",
          marginTop: 40,
        }}
      >
        <button
          style={{
            float: "right",
            background: "#e53935",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 18px",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 2px 8px #e5393533",
            marginTop: -8,
            marginRight: -8,
          }}
          onClick={() => {
            localStorage.removeItem("role");
            localStorage.removeItem("username");
            window.location.href = "/";
          }}
        >
          Logout
        </button>
        <h2
          style={{
            color: "#1976d2",
            marginBottom: 12,
            fontWeight: 700,
            letterSpacing: 1,
            fontSize: 28,
          }}
        >
          Welcome {user}{" "}
          <span style={{ color: "#388e3c", fontWeight: 500 }}>({role})</span>
        </h2>
        <div style={{ marginBottom: 24 }}>
          {role === "Admin" && <AdminPage />}
          {role === "Teacher" && <TeacherPage />}
          {role === "Student" && <StudentPanel />}
        </div>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e3eafc",
            margin: "24px 0",
          }}
        />
        <p
          style={{
            color: "#666",
            textAlign: "center",
            fontSize: 15,
          }}
        >
          Built with{" "}
          <span style={{ color: "#1976d2", fontWeight: 500 }}>
            OpenCV LBPH
          </span>{" "}
          face recognizer (no dlib required).
        </p>
      </div>
    </div>
  );
}
