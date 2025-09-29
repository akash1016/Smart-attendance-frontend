import React, { useState, useEffect } from "react";
import TeacherPanel from "./TeacherPanel";
import AdminPanel from "./AdminPanel";

function generateUsername(first, last) {
  return (
    (first.trim().toLowerCase() + (last ? last.trim().toLowerCase() : ""))
      .replace(/\s+/g, "") + "_" + Math.floor(Math.random() * 1000)
  );

function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

function RegisterStudentForm({ onRegistered }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email_id: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setResult(null);
    const username = generateUsername(form.first_name, form.last_name);
    const password = generatePassword();
    const actingUsername = localStorage.getItem("username");
    const token = `demo-${actingUsername}`;
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/add-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          username,
          password,
          first_name: form.first_name,
          last_name: form.last_name,
          email_id: form.email_id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("Student added successfully!");
        setResult({ username: data.username, password: data.password });
        setForm({ first_name: "", last_name: "", email_id: "" });
        if (typeof onRegistered === "function") onRegistered({ username: data.username, password: data.password });
      } else {
        setStatus(data.msg || "Failed to add student.");
      }
    } catch (e) {
      setStatus("Failed to add student.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 340, margin: "0 auto" }}>
      <h3 style={{ marginBottom: 12, color: '#1976d2', letterSpacing: 0.5 }}>Register Student</h3>
      <div style={{ marginBottom: 8 }}>
        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 8 }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <input
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 8 }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <input
          name="email_id"
          placeholder="Email"
          type="email"
          value={form.email_id}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 8 }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "8px 16px",
          background: loading ? "#90caf9" : "#1976d2",
          color: loading ? "#eee" : "#fff",
          border: "none",
          borderRadius: 4,
          fontWeight: 500,
          letterSpacing: 0.2,
          cursor: loading ? "not-allowed" : "pointer",
          transition: 'background 0.2s, color 0.2s'
        }}
      >
        {loading ? "Registering..." : "Register Student"}
      </button>
      {status && <div style={{ color: status.includes("success") ? "green" : "red", marginTop: 10 }}>{status}</div>}
      {result && (
        <div style={{ marginTop: 14, background: "#f0f4fa", padding: 10, borderRadius: 6 }}>
          <b>Username:</b> {result.username}<br />
          <b>Password:</b> {result.password}
        </div>
      )}
    </form>
  );
}
function StudentListTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deleting, setDeleting] = useState({}); // Track deleting state per student

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, []);

  async function fetchStudents() {
    setLoading(true);
    setErr("");
    try {
      const username = localStorage.getItem("username");
      const token = `demo-${username}`;
      const res = await fetch("http://127.0.0.1:5000/admin/get-student-list", {
        headers: { Authorization: token }
      });
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.students)) {
        setStudents(data.students);
      } else {
        setErr(data.msg || "Failed to fetch students.");
      }
    } catch (e) {
      setErr("Failed to fetch students.");
    }
    setLoading(false);
  }

  async function handleDelete(username) {
    if (!window.confirm(`Are you sure you want to delete student "${username}"?`)) return;
    setDeleting(prev => ({ ...prev, [username]: true }));
    try {
      const actingUsername = localStorage.getItem("username");
      const token = `demo-${actingUsername}`;
      const res = await fetch(`http://127.0.0.1:5000/admin/delete-student/${username}`, {
        method: "DELETE",
        headers: { Authorization: token }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStudents(students => students.filter(s => s.username !== username));
      } else {
        alert(data.msg || "Failed to delete student.");
      }
    } catch (e) {
      alert("Failed to delete student.");
    }
    setDeleting(prev => ({ ...prev, [username]: false }));
  }

  return (
    <div style={{ marginTop: 8 }}>
      <h3 style={{ color: "#1976d2", marginBottom: 10 }}>Student List</h3>
      {loading && <div>Loading...</div>}
      {err && <div style={{ color: "#e53935" }}>{err}</div>}
      {!loading && !err && (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#f7faff" }}>
          <thead>
            <tr style={{ background: "#e3f0ff" }}>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Username</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Name</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Email</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Face ID</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.profile_id}>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{s.username}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  {s.first_name} {s.last_name}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{s.email_id}</td>
                <td style={{ padding: 8, border: "1px solid #ddd", color: s.has_face_id ? "#388e3c" : "#e53935" }}>
                  {s.face_msg}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  <button
                    onClick={() => handleDelete(s.username)}
                    disabled={deleting[s.username]}
                    style={{
                      background: "#e53935",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 14px",
                      cursor: deleting[s.username] ? "not-allowed" : "pointer",
                      fontWeight: 500
                    }}
                  >
                    {deleting[s.username] ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

  const [activeTab, setActiveTab] = useState("attendance");
  const [faceUsername, setFaceUsername] = useState("");
  const [studentOptions, setStudentOptions] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch student list for FaceID tab
  useEffect(() => {
    if (activeTab === "faceid") {
      async function fetchStudents() {
        setLoadingStudents(true);
        try {
          const username = localStorage.getItem("username");
          const token = `demo-${username}`;
          const res = await fetch("http://127.0.0.1:5000/admin/get-student-list", {
            headers: { Authorization: token }
          });
          const data = await res.json();
          if (res.ok && data.ok && Array.isArray(data.students)) {
            setStudentOptions(data.students);
            if (data.students.length > 0) setFaceUsername(data.students[0].username);
          } else {
            setStudentOptions([]);
          }
        } catch {
          setStudentOptions([]);
        }
        setLoadingStudents(false);
      }
      fetchStudents();
    }
  }, [activeTab]);

  return (
    <div style={{ border: "1px solid #bbb", padding: 16, borderRadius: 8 }}>
      <h2 style={{ color: '#0d47a1', letterSpacing: 0.5, marginBottom: 10 }}>Teacher Page</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab("attendance")}
          style={{
            background: activeTab === "attendance" ? "#1976d2" : "#eee",
            color: activeTab === "attendance" ? "#fff" : "#222",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab("studentlist")}
          style={{
            background: activeTab === "studentlist" ? "#1976d2" : "#eee",
            color: activeTab === "studentlist" ? "#fff" : "#222",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Student List
        </button>
        <button
          onClick={() => setActiveTab("register")}
          style={{
            background: activeTab === "register" ? "#1976d2" : "#eee",
            color: activeTab === "register" ? "#fff" : "#222",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Register Student
        </button>
        <button
          onClick={() => setActiveTab("faceid")}
          style={{
            background: activeTab === "faceid" ? "#1976d2" : "#eee",
            color: activeTab === "faceid" ? "#fff" : "#222",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          FaceID
        </button>
      </div>
      <div>
        {activeTab === "attendance" && <TeacherPanel />}
        {activeTab === "studentlist" && <StudentListTab />}
        {activeTab === "register" && <RegisterStudentForm />}
        {activeTab === "faceid" && (
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <h3 style={{ color: "#1976d2", marginBottom: 12 }}>Add FaceID for Student</h3>
            {loadingStudents ? (
              <div>Loading students...</div>
            ) : studentOptions.length === 0 ? (
              <div style={{ color: "#888" }}>No students found.</div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500, marginRight: 8 }}>Select Student:</label>
                <select
                  value={faceUsername}
                  onChange={e => setFaceUsername(e.target.value)}
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #bbb' }}
                >
                  {studentOptions.map(s => (
                    <option key={s.username} value={s.username}>
                      {s.username} ({s.first_name} {s.last_name})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {faceUsername && <AdminPanel username={faceUsername} />}
          </div>
        )}
      </div>
    </div>
  );
}
