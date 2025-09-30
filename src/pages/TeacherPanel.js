// Attendance Records Tab

// Manual Attendance Tab


import React, { useState, useEffect } from "react";
import TeacherPanel from "./TeacherPanel";
import AdminPanel from "./AdminPanel";

export default TeacherPage;
// Announcement Tab Components

function ManualAttendanceTab() {
  const [usernames, setUsernames] = useState([]);
  const [selected, setSelected] = useState([]);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchUsernames();
    // eslint-disable-next-line
  }, []);

  async function fetchUsernames() {
    setLoading(true);
    setErr("");
    try {
      const username = localStorage.getItem("username");
      const token = `demo-${username}`;
      const res = await fetch("http://127.0.0.1:5000/admin/get-all-student-usernames", {
        headers: { Authorization: token, username }
      });
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.usernames)) {
        setUsernames(data.usernames);
      } else {
        setErr(data.msg || "Failed to fetch usernames.");
      }
    } catch (e) {
      setErr("Failed to fetch usernames.");
    }
    setLoading(false);
  }

  function handleSelectChange(e) {
    const opts = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setSelected(opts);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const username = localStorage.getItem("username");
    const token = `demo-${username}`;
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/mark-attendance-manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({ usernames: selected, date })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResult(data.results);
      } else {
        setResult([{ username: "", msg: data.msg || "Failed to mark attendance." }]);
      }
    } catch (e) {
      setResult([{ username: "", msg: "Failed to mark attendance." }]);
    }
    setSubmitting(false);
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <h3 style={{ color: "#1976d2", marginBottom: 12 }}>Manual Attendance</h3>
      {loading ? (
        <div>Loading students...</div>
      ) : err ? (
        <div style={{ color: "#e53935" }}>{err}</div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: "#f7faff", padding: 16, borderRadius: 8 }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 500, marginRight: 8 }}>Date:</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb' }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 500, marginRight: 8 }}>Select Students:</label>
            <select
              multiple
              value={selected}
              onChange={handleSelectChange}
              style={{ width: "100%", minHeight: 90, padding: 6, borderRadius: 4, border: '1px solid #bbb' }}
              required
            >
              {usernames.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>(Hold Ctrl/Cmd to select multiple)</div>
          </div>
          <button
            type="submit"
            disabled={submitting || selected.length === 0}
            style={{ background: submitting ? "#90caf9" : "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontWeight: 500, cursor: submitting ? "not-allowed" : "pointer" }}
          >
            {submitting ? "Marking..." : "Mark Present"}
          </button>
        </form>
      )}
      {result && (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ marginBottom: 6, color: '#1976d2' }}>Result</h4>
          <ul style={{ paddingLeft: 18 }}>
            {result.map((r, i) => (
              <li key={i} style={{ color: r.msg.includes('Marked present') ? '#388e3c' : '#e53935' }}>
                {r.username ? <b>{r.username}:</b> : null} {r.msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AttendanceRecordsTab() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [fetchingStudents, setFetchingStudents] = useState(true);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, []);

  async function fetchStudents() {
    setFetchingStudents(true);
    setErr("");
    try {
      const username = localStorage.getItem("username");
      const token = `demo-${username}`;
      const res = await fetch("http://127.0.0.1:5000/admin/get-all-student-usernames", {
        headers: { Authorization: token, username }
      });
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.usernames)) {
        setStudents(data.usernames);
        if (data.usernames.length > 0) setSelectedStudent(data.usernames[0]);
      } else {
        setErr(data.msg || "Failed to fetch students.");
      }
    } catch (e) {
      setErr("Failed to fetch students.");
    }
    setFetchingStudents(false);
  }

  async function handleFetchRecords(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setRecords([]);
    try {
      const res = await fetch("http://127.0.0.1:5000/attendance/get-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: selectedStudent, start_date: startDate, end_date: endDate })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setRecords(data.records);
      } else {
        setErr(data.msg || "Failed to fetch records.");
      }
    } catch (e) {
      setErr("Failed to fetch records.");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h3 style={{ color: "#1976d2", marginBottom: 12 }}>Attendance Records</h3>
      {fetchingStudents ? (
        <div>Loading students...</div>
      ) : err ? (
        <div style={{ color: "#e53935" }}>{err}</div>
      ) : (
        <form onSubmit={handleFetchRecords} style={{ background: "#f7faff", padding: 16, borderRadius: 8, marginBottom: 18 }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 500, marginRight: 8 }}>Student:</label>
            <select
              value={selectedStudent}
              onChange={e => setSelectedStudent(e.target.value)}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb', minWidth: 160 }}
              required
            >
              {students.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 500, marginRight: 8 }}>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
              style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb' }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 500, marginRight: 8 }}>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              required
              style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !selectedStudent}
            style={{ background: loading ? "#90caf9" : "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Fetching..." : "Get Records"}
          </button>
        </form>
      )}
      {records && records.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#f7faff" }}>
            <thead>
              <tr style={{ background: "#e3f0ff" }}>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Date</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Status</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.attendance_id}>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.attendance_date}</td>
                  <td style={{ padding: 8, border: "1px solid #ddd", color: r.status === 'Present' ? '#388e3c' : '#e53935' }}>{r.status}</td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {records && records.length === 0 && !loading && !fetchingStudents && (
        <div style={{ color: "#888", marginTop: 10 }}>No records found for selected interval.</div>
      )}
    </div>
  );
}

function AnnouncementTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addStatus, setAddStatus] = useState("");
  const [form, setForm] = useState({ title: "", description: "" });
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line
  }, []);

  async function fetchAnnouncements() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/get-announcements");
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.announcements)) {
        setAnnouncements(data.announcements);
      } else {
        setErr(data.msg || "Failed to fetch announcements.");
      }
    } catch (e) {
      setErr("Failed to fetch announcements.");
    }
    setLoading(false);
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreview(files.map(file => URL.createObjectURL(file)));
  }

  async function handleAddAnnouncement(e) {
    e.preventDefault();
    setAdding(true);
    setAddStatus("");
    const username = localStorage.getItem("username");
    const token = `demo-${username}`;
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    images.forEach(img => formData.append("images", img));
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/add-announcement", {
        method: "POST",
        headers: { Authorization: token },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setAddStatus("Announcement added!");
        setForm({ title: "", description: "" });
        setImages([]);
        setPreview([]);
        setShowAdd(false);
        fetchAnnouncements();
      } else {
        setAddStatus(data.msg || "Failed to add announcement.");
      }
    } catch (e) {
      setAddStatus("Failed to add announcement.");
    }
    setAdding(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this announcement?")) return;
    setDeleting(prev => ({ ...prev, [id]: true }));
    const username = localStorage.getItem("username");
    const token = `demo-${username}`;
    try {
      const res = await fetch(`http://127.0.0.1:5000/admin/delete-announcement/${id}`, {
        method: "DELETE",
        headers: { Authorization: token }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setAnnouncements(anns => anns.filter(a => a.id !== id));
      } else {
        alert(data.msg || "Failed to delete announcement.");
      }
    } catch (e) {
      alert("Failed to delete announcement.");
    }
    setDeleting(prev => ({ ...prev, [id]: false }));
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ color: "#1976d2", margin: 0 }}>Announcements</h3>
        <button
          onClick={() => setShowAdd(v => !v)}
          style={{ background: showAdd ? "#e3f0ff" : "#1976d2", color: showAdd ? "#1976d2" : "#fff", border: "none", borderRadius: 4, padding: "6px 14px", fontWeight: 500, cursor: "pointer" }}
        >
          {showAdd ? "Cancel" : "Add Announcement"}
        </button>
      </div>
      {showAdd && (
        <form onSubmit={handleAddAnnouncement} style={{ background: "#f7faff", padding: 16, borderRadius: 8, marginBottom: 18 }}>
          <div style={{ marginBottom: 8 }}>
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleFormChange}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleFormChange}
              required
              rows={3}
              style={{ width: "100%", padding: 8, resize: "vertical" }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {preview.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                {preview.map((src, i) => (
                  <img key={i} src={src} alt="preview" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4, border: "1px solid #bbb" }} />
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={adding}
            style={{ background: adding ? "#90caf9" : "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontWeight: 500, cursor: adding ? "not-allowed" : "pointer" }}
          >
            {adding ? "Adding..." : "Add Announcement"}
          </button>
          {addStatus && <div style={{ color: addStatus.includes("added") ? "green" : "red", marginTop: 8 }}>{addStatus}</div>}
        </form>
      )}
      {loading && <div>Loading...</div>}
      {err && <div style={{ color: "#e53935" }}>{err}</div>}
      {!loading && !err && announcements.length === 0 && <div style={{ color: "#888" }}>No announcements found.</div>}
      {!loading && !err && announcements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {announcements.map(a => (
            <div key={a.id} style={{ background: "#f7faff", borderRadius: 8, padding: 14, border: "1px solid #e3f0ff", position: "relative" }}>
              <div style={{ fontWeight: 600, fontSize: 17, color: "#1976d2" }}>{a.title}</div>
              <div style={{ margin: "6px 0 8px 0", color: "#333" }}>{a.description}</div>
              {a.images && a.images.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  {a.images.map((img, i) => (
                    <img key={i} src={`http://127.0.0.1:5000${img}`} alt="ann" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 4, border: "1px solid #bbb" }} />
                  ))}
                </div>
              )}
              <button
                onClick={() => handleDelete(a.id)}
                disabled={deleting[a.id]}
                style={{ position: "absolute", top: 10, right: 10, background: "#e53935", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", fontWeight: 500, cursor: deleting[a.id] ? "not-allowed" : "pointer" }}
              >
                {deleting[a.id] ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



function generateUsername(first, last) {
  return (
    (first.trim().toLowerCase() + (last ? last.trim().toLowerCase() : ""))
      .replace(/\s+/g, "") + "_" + Math.floor(Math.random() * 1000)
    );
  }

function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

function RegisterStudentForm({ onRegistered, onSwitchToFaceID }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email_id: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [newUsername, setNewUsername] = useState("");

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
        setNewUsername(data.username);
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
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              style={{
                padding: "8px 16px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontWeight: 500,
                marginTop: 8,
                cursor: "pointer"
              }}
              onClick={() => onSwitchToFaceID && onSwitchToFaceID(newUsername)}
            >
              Proceed to Add FaceID
            </button>
          </div>
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


function TeacherPage() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [faceUsername, setFaceUsername] = useState("");
  const [studentOptions, setStudentOptions] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Handler to switch to FaceID tab and pre-select username
  function handleSwitchToFaceID(username) {
    setActiveTab("faceid");
    setFaceUsername(username);
  }

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
            // Only set faceUsername if not already set (e.g., after registration)
            if (!faceUsername && data.students.length > 0) setFaceUsername(data.students[0].username);
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
        <button
          onClick={() => setActiveTab("attendancerecords")}
          style={{
            background: activeTab === "attendancerecords" ? "#1976d2" : "#eee",
            color: activeTab === "attendancerecords" ? "#fff" : "#222",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Attendance Records
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
          Announcement
        </button>
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
        {activeTab === "manualattendance" && <ManualAttendanceTab />}
        {activeTab === "attendancerecords" && <AttendanceRecordsTab />}
        {activeTab === "studentlist" && <StudentListTab />}
        {activeTab === "register" && <RegisterStudentForm onSwitchToFaceID={handleSwitchToFaceID} />}
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
        {activeTab === "announcement" && <AnnouncementTab />}
      </div>
    </div>
  );
}


