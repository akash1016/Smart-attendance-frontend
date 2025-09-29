function ManualAttendanceTab() {
  const [students, setStudents] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const [date, setDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [results, setResults] = React.useState([]);

  React.useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("http://127.0.0.1:5000/admin/get-student-list", {
          headers: { Authorization: "demo-admin" }
        });
        const data = await res.json();
        if (res.ok && data.ok && Array.isArray(data.students)) {
          setStudents(data.students);
        }
      } catch {}
    }
    fetchStudents();
  }, []);

  function handleSelect(username) {
    setSelected(sel =>
      sel.includes(username)
        ? sel.filter(u => u !== username)
        : [...sel, username]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setResults([]);
    if (!date || selected.length === 0) {
      setStatus("Please select at least one student and a date.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/mark-attendance-manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "demo-admin"
        },
        body: JSON.stringify({ usernames: selected, date })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("Attendance marked successfully.");
        setResults(data.results || []);
        setSelected([]);
        setDate("");
      } else {
        setStatus(data.msg || "Failed to mark attendance.");
      }
    } catch (e) {
      setStatus("Failed to mark attendance.");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h3 style={{ marginBottom: 14, color: '#1976d2', letterSpacing: 0.5 }}>Manual Attendance</h3>
      <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: 18, borderRadius: 8, marginBottom: 18 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500, marginRight: 8 }}>Date:</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb' }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Select Students:</label>
          <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 6, background: '#fff', padding: 8 }}>
            {students.length === 0 ? (
              <div style={{ color: '#888' }}>No students found.</div>
            ) : (
              students.map(s => (
                <label key={s.username} style={{ display: 'block', marginBottom: 4, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(s.username)}
                    onChange={() => handleSelect(s.username)}
                    style={{ marginRight: 8 }}
                  />
                  {s.username} ({s.first_name} {s.last_name})
                </label>
              ))
            )}
          </div>
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
          {loading ? "Marking..." : "Mark Attendance"}
        </button>
        {status && <div style={{ color: status.includes("success") ? "green" : "#b00", marginTop: 10 }}>{status}</div>}
      </form>
      {results.length > 0 && (
        <div style={{ background: '#f0f4fa', borderRadius: 8, padding: 12 }}>
          <b>Results:</b>
          <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
            {results.map(r => (
              <li key={r.username} style={{ color: r.msg.includes('Already') ? '#b00' : 'green', marginBottom: 4 }}>
                {r.username}: {r.msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
function TeacherList() {
  const [teachers, setTeachers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [deletingId, setDeletingId] = React.useState(null);

  React.useEffect(() => {
    async function fetchTeachers() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://127.0.0.1:5000/admin/get-teacher-list", {
          headers: {
            Authorization: "demo-admin"
          }
        });
        const data = await res.json();
        if (res.ok && data.ok && Array.isArray(data.teachers)) {
          setTeachers(data.teachers);
        } else {
          setError(data.msg || "Failed to fetch teacher list.");
        }
      } catch (e) {
        setError("Failed to fetch teacher list.");
      }
      setLoading(false);
    }
    fetchTeachers();
  }, []);

  async function handleDeleteTeacher(username) {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    setDeletingId(username);
    try {
      // Backend API: /admin/delete-teacher/<username> (DELETE)
      const res = await fetch(`http://127.0.0.1:5000/admin/delete-teacher/${username}`, {
        method: "DELETE",
        headers: {
          Authorization: "demo-admin"
        }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTeachers(ts => ts.filter(t => t.username !== username));
      } else {
        alert(data.msg || "Failed to delete teacher.");
      }
    } catch (e) {
      alert("Failed to delete teacher.");
    }
    setDeletingId(null);
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
  <h3 style={{ marginBottom: 14, color: '#1565c0', letterSpacing: 0.5 }}>Teacher List</h3>
      {loading ? (
        <div>Loading teachers...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : teachers.length === 0 ? (
        <div style={{ color: "#888" }}>No teachers found.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#f0f4fa" }}>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Username</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>First Name</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Last Name</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Email</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}></th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t.profile_id}>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{t.username}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{t.first_name}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{t.last_name}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{t.email_id}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  <button
                    onClick={() => handleDeleteTeacher(t.username)}
                    disabled={deletingId === t.username}
                    style={{
                      background: deletingId === t.username ? "#ccc" : "#e53935",
                      color: deletingId === t.username ? "#666" : "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 10px",
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: 0.2,
                      cursor: deletingId === t.username ? "not-allowed" : "pointer",
                      transition: 'background 0.2s, color 0.2s'
                    }}
                  >
                    {deletingId === t.username ? "Deleting..." : "Delete"}
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
function generateTeacherUsername(first, last) {
  return (
    (first.trim().toLowerCase() + (last ? last.trim().toLowerCase() : ""))
      .replace(/\s+/g, "") + "_t_" + Math.floor(Math.random() * 1000)
  );
}

function generateTeacherPassword() {
  return Math.random().toString(36).slice(-8);
}

function AddTeacherForm() {
  const [form, setForm] = React.useState({ first_name: "", last_name: "", email_id: "" });
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [result, setResult] = React.useState(null);

  const adminToken = "demo-admin";

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setResult(null);
    const username = generateTeacherUsername(form.first_name, form.last_name);
    const password = generateTeacherPassword();
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/add-teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": adminToken,
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
        setStatus("Teacher added successfully!");
        setResult({ username: data.username, password: data.password });
        setForm({ first_name: "", last_name: "", email_id: "" });
      } else {
        setStatus(data.msg || "Failed to add teacher.");
      }
    } catch (e) {
      setStatus("Failed to add teacher.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 340, margin: "0 auto" }}>
  <h3 style={{ marginBottom: 12, color: '#1976d2', letterSpacing: 0.5 }}>Add Teacher</h3>
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
        {loading ? "Adding..." : "Add Teacher"}
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
function StudentList() {
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [deletingId, setDeletingId] = React.useState(null);

  React.useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://127.0.0.1:5000/admin/get-student-list", {
          headers: {
            Authorization: "demo-admin"
          }
        });
        const data = await res.json();
        if (res.ok && data.ok && Array.isArray(data.students)) {
          setStudents(data.students);
        } else {
          setError(data.msg || "Failed to fetch student list.");
        }
      } catch (e) {
        setError("Failed to fetch student list.");
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  async function handleDeleteStudent(username) {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    setDeletingId(username);
    try {
      // Backend API: /admin/delete-student/<username> (DELETE)
      const res = await fetch(`http://127.0.0.1:5000/admin/delete-student/${username}`, {
        method: "DELETE",
        headers: {
          Authorization: "demo-admin"
        }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStudents(sts => sts.filter(s => s.username !== username));
      } else {
        alert(data.msg || "Failed to delete student.");
      }
    } catch (e) {
      alert("Failed to delete student.");
    }
    setDeletingId(null);
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
  <h3 style={{ marginBottom: 14, color: '#1565c0', letterSpacing: 0.5 }}>Student List</h3>
      {loading ? (
        <div>Loading students...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : students.length === 0 ? (
        <div style={{ color: "#888" }}>No students found.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#f0f4fa" }}>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Username</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>First Name</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Last Name</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Email</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Face ID Status</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}></th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.profile_id}>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{s.username}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{s.first_name}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{s.last_name}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{s.email_id}</td>
                <td style={{ padding: 8, border: "1px solid #ddd", color: s.has_face_id ? "green" : "#b00", fontWeight: 500 }}>
                  {s.face_msg}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  <button
                    onClick={() => handleDeleteStudent(s.username)}
                    disabled={deletingId === s.username}
                    style={{
                      background: deletingId === s.username ? "#ccc" : "#e53935",
                      color: deletingId === s.username ? "#666" : "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 10px",
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: 0.2,
                      cursor: deletingId === s.username ? "not-allowed" : "pointer",
                      transition: 'background 0.2s, color 0.2s'
                    }}
                  >
                    {deletingId === s.username ? "Deleting..." : "Delete"}
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
function AddAnnouncementForm() {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [images, setImages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [announcements, setAnnouncements] = React.useState([]);
  const [fetching, setFetching] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState(null);

  function handleFileChange(e) {
    setImages(Array.from(e.target.files));
  }

  async function fetchAnnouncements() {
    setFetching(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/get-announcements");
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.announcements)) {
        setAnnouncements(data.announcements);
      } else {
        setAnnouncements([]);
      }
    } catch {
      setAnnouncements([]);
    }
    setFetching(false);
  }

  React.useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    images.forEach((img) => fd.append("images", img));
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/add-announcement", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("Announcement added successfully!");
        setTitle("");
        setDescription("");
        setImages([]);
        fetchAnnouncements();
      } else {
        setStatus(data.msg || "Failed to add announcement.");
      }
    } catch (e) {
      setStatus("Failed to add announcement.");
    }
    setLoading(false);
  }

  async function handleDeleteAnnouncement(id) {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://127.0.0.1:5000/admin/delete-announcement/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("Announcement deleted successfully!");
        fetchAnnouncements();
      } else {
        setStatus(data.msg || "Failed to delete announcement.");
      }
    } catch (e) {
      setStatus("Failed to delete announcement.");
    }
    setDeletingId(null);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
  <h3 style={{ marginBottom: 12, color: '#1976d2', letterSpacing: 0.5 }}>Add Announcement</h3>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            style={{ width: "100%", padding: 8, resize: "vertical" }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{
            display: 'inline-block',
            padding: '7px 18px',
            background: '#1976d2',
            color: '#fff',
            borderRadius: 4,
            fontWeight: 500,
            letterSpacing: 0.2,
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
            marginBottom: 0
          }}>
            Choose Files
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          {images.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>
              {images.length} image(s) selected
            </div>
          )}
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
          {loading ? "Adding..." : "Add Announcement"}
        </button>
        {status && <div style={{ color: status.includes("success") ? "green" : "red", marginTop: 10 }}>{status}</div>}
      </form>
      <div style={{ maxWidth: 500, margin: "32px auto 0 auto" }}>
        <h3 style={{ marginBottom: 10, marginTop: 30 }}>All Announcements</h3>
        {fetching ? (
          <div>Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div style={{ color: "#888" }}>No announcements found.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {announcements.map(a => (
              <div key={a.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14, background: "#fafbff", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: "#1976d2" }}>{a.title}</div>
                  <button
                    onClick={() => handleDeleteAnnouncement(a.id)}
                    disabled={deletingId === a.id}
                    style={{
                      background: deletingId === a.id ? "#ccc" : "#e53935",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 10px",
                      fontSize: 13,
                      cursor: deletingId === a.id ? "not-allowed" : "pointer"
                    }}
                  >
                    {deletingId === a.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
                <div style={{ margin: "6px 0 8px 0", color: "#444" }}>{a.description}</div>
                {Array.isArray(a.images) && a.images.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                    {a.images.filter(img => typeof img === "string" && img.trim().length > 0).map((img, i) => {
                      // If img starts with '/', prepend backend host
                      const src = img.startsWith("/") ? `http://127.0.0.1:5000${img}` : img;
                      return (
                        <img
                          key={i}
                          src={src}
                          alt="announcement"
                          style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 4, border: "1px solid #bbb" }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import AdminPanel from "./AdminPanel";

import React, { useState } from "react";
// Real backend URL for student registration
const REGISTER_URL = "http://127.0.0.1:5000/admin/add-student";

function generateUsername(first, last) {
  return (
    (first.trim().toLowerCase() + (last ? last.trim().toLowerCase() : ""))
      .replace(/\s+/g, "") + "_" + Math.floor(Math.random() * 1000)
  );
}

function generatePassword() {
  return Math.random().toString(36).slice(-8);
}


function RegisterStudentForm({ onRegistered, onNeedFace }) {
  const [form, setForm] = React.useState({ first_name: "", last_name: "", email_id: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // TODO: Replace with real admin username/token logic
  const adminUsername = "admin";
  const adminToken = `demo-${adminUsername}`;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function checkImageDirByEmail(email) {
    // Call backend to check if directory exists for student by email
    try {
      const res = await fetch(`http://127.0.0.1:5000/admin/validate-student-directory/${encodeURIComponent(email)}`);
      const data = await res.json();
      return data;
    } catch {
      return { ok: false };
    }
  }

  async function getUsernameByEmail(email) {
    // Backend endpoint to get username by email
    try {
      const res = await fetch(`http://127.0.0.1:5000/admin/get-username-by-email/${encodeURIComponent(email)}`);
      const data = await res.json();
      return data.username || null;
    } catch {
      return null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Always check directory by email first
    const dirData = await checkImageDirByEmail(form.email_id);
    if (dirData.ok && dirData.directory_exists) {
      setError("Student's Face ID is already added.");
      setLoading(false);
      return;
    }
    const username = generateUsername(form.first_name, form.last_name);
    const password = generatePassword();
    try {
      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": adminToken,
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
        const uname = data.username || username;
        const pwd = data.password || password;
        onRegistered({ username: uname, password: pwd });
        setForm({ first_name: "", last_name: "", email_id: "" });
        if (typeof onNeedFace === "function") {
          onNeedFace(uname);
        }
      } else if (data.msg && data.msg.toLowerCase().includes("email already exists")) {
        // Email exists, but directory did not exist, so allow face capture
        if (dirData.ok && dirData.username) {
          onRegistered({ username: dirData.username, password: "" });
          if (typeof onNeedFace === "function") {
            onNeedFace(dirData.username);
          }
        } else {
          setError(data.msg);
        }
      } else {
        setError(data.msg || "Failed to register student.");
      }
    } catch (e) {
      setError("Failed to register student.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 340, margin: "0 auto" }}>
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
      <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
        {loading ? "Registering..." : "Register Student"}
      </button>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </form>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("register");
  const [registered, setRegistered] = useState(null);

  return (
  <div style={{ border: "1px solid #bbb", padding: 16, borderRadius: 8 }}>
      <h2 style={{ color: '#0d47a1', letterSpacing: 0.5, marginBottom: 10 }}>Admin Page</h2>
  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => { setActiveTab("register"); }}
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
          Adding FaceID
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
          onClick={() => setActiveTab("addteacher")}
          style={{
            background: activeTab === "addteacher" ? "#1976d2" : "#eee",
            color: activeTab === "addteacher" ? "#fff" : "#222",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Add Teacher
        </button>
        <button
          onClick={() => setActiveTab("teacherlist")}
          style={{
            background: activeTab === "teacherlist" ? "#1976d2" : "#eee",
            color: activeTab === "teacherlist" ? "#fff" : "#222",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Teacher List
        </button>
        <button
          onClick={() => setActiveTab("announcement")}
          style={{
            background: activeTab === "announcement" ? "#1976d2" : "#eee",
            color: activeTab === "announcement" ? "#fff" : "#222",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Add Announcement
        </button>
        <button
          onClick={() => setActiveTab("manualattendance")}
          style={{
            background: activeTab === "manualattendance" ? "#1976d2" : "#eee",
            color: activeTab === "manualattendance" ? "#fff" : "#222",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Manual Attendance
        </button>
      </div>
  <div>
        {activeTab === "register" && (
          <div>
            {!registered ? (
              <RegisterStudentForm
                onRegistered={setRegistered}
                onNeedFace={(uname) => {
                  setRegistered((r) => ({ ...r, username: uname }));
                  setActiveTab("faceid");
                }}
              />
            ) : (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <h4>Student Registered!</h4>
                <div style={{ margin: "12px 0" }}>
                  <b>Username:</b> {registered.username}<br />
                  <b>Password:</b> {registered.password}
                </div>
                <p>Share these credentials with the student.</p>
                <button onClick={() => setRegistered(null)} style={{ padding: "6px 16px" }}>Register Another</button>
                <div style={{ marginTop: 16 }}>
                  <button
                    onClick={() => {
                      // Ensure both tab and registered state are set together
                      setActiveTab("faceid");
                      setRegistered(registered);
                    }}
                    style={{ padding: "8px 20px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, marginTop: 8 }}
                  >
                    Proceed to Add FaceID
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "announcement" && (
          <AddAnnouncementForm />
        )}
        {activeTab === "studentlist" && (
          <StudentList />
        )}
        {activeTab === "faceid" && (
          registered ? (
            <div>
              <h4>Capture FaceID for: {registered.username}</h4>
              <AdminPanel username={registered.username} />
              <div style={{ marginTop: 16 }}>
                <button onClick={() => { setActiveTab("register"); setRegistered(null); }} style={{ padding: "6px 16px" }}>Back to Register</button>
              </div>
            </div>
          ) : (
            <div style={{ color: "#b00", textAlign: "center", marginTop: 32 }}>
              Please register a student first.<br />
              <button onClick={() => setActiveTab("register")} style={{ marginTop: 12, padding: "6px 16px" }}>Go to Register</button>
            </div>
          )
        )}
        {activeTab === "addteacher" && (
          <AddTeacherForm />
        )}
        {activeTab === "teacherlist" && (
          <TeacherList />
        )}
        {activeTab === "manualattendance" && (
          <ManualAttendanceTab />
        )}
      </div>
    </div>
  );
}
