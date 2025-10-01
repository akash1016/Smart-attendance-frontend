import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

export default function TeacherPanel() {
  const webcamRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [usernames, setUsernames] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [manualUsernames, setManualUsernames] = useState("");
  const [multiResult, setMultiResult] = useState([]);
  const [webcamActive, setWebcamActive] = useState(false);

  // Fetch all student usernames for dropdown
  useEffect(() => {
    async function fetchUsernames() {
      try {
        const username = localStorage.getItem("username");
        const token = `demo-${username}`;
        const res = await fetch("http://127.0.0.1:5000/admin/get-all-student-usernames", {
          headers: {
            Authorization: token,
            username: username
          }
        });
        const data = await res.json();
        if (res.ok && data.ok && Array.isArray(data.usernames)) {
          setUsernames(data.usernames);
          if (data.usernames.length > 0) setSelectedUsername(data.usernames[0]);
        }
      } catch (e) {
        setStatus("Failed to load student usernames.");
      }
    }
    fetchUsernames();
  }, []);

  useEffect(() => {
    let id;
    if (running) {
      setWebcamActive(true);
      id = setInterval(() => {
        if (manualUsernames.trim()) {
          captureMultiple();
        } else {
          capture();
        }
      }, 3000);
    } else {
      setWebcamActive(false);
    }
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [running, selectedUsername, manualUsernames]);

  async function capture() {
    if (!selectedUsername) {
      setStatus("Please select a student username.");
      return;
    }
    if (!webcamRef.current) return;
    const src = webcamRef.current.getScreenshot();
    if (!src) return;
    const blob = await (await fetch(src)).blob();
    const fd = new FormData();
    fd.append("frame", blob, "frame.jpg");
    fd.append("username", selectedUsername);
    try {
      const res = await fetch("http://127.0.0.1:5000/attendance/mark", {
        method: "POST",
        body: fd,
      });
      const j = await res.json();
      if (j.ok) {
        setStatus(j.msg + (j.conf !== undefined ? ` (conf=${j.conf?.toFixed ? j.conf.toFixed(2) : j.conf})` : ""));
        setRunning(false);
        setWebcamActive(false);
      } else {
        setStatus(j.msg + (j.conf !== undefined ? ` (conf=${j.conf?.toFixed ? j.conf.toFixed(2) : j.conf})` : ""));
        if (j.msg && j.msg.toLowerCase().includes("already marked")) {
          setRunning(false);
          setWebcamActive(false);
        }
      }
    } catch (e) {
      setStatus("error");
    }
  }

  // New: Mark attendance for multiple usernames
  async function captureMultiple() {
    if (!manualUsernames.trim()) {
      setStatus("Please enter at least one username.");
      return;
    }
    if (!webcamRef.current) return;
    const src = webcamRef.current.getScreenshot();
    if (!src) return;
    const blob = await (await fetch(src)).blob();
    const names = manualUsernames.split(",").map(u => u.trim()).filter(Boolean);
    if (names.length === 0) {
      setStatus("Please enter at least one username.");
      return;
    }
    setMultiResult([]);
    let results = [];
    for (const uname of names) {
      const fd = new FormData();
      fd.append("frame", blob, "frame.jpg");
      fd.append("username", uname);
      try {
        const res = await fetch("http://127.0.0.1:5000/attendance/mark", {
          method: "POST",
          body: fd,
        });
        const j = await res.json();
        results.push({ username: uname, msg: j.msg, ok: j.ok, conf: j.conf });
        if (j.ok) {
          setRunning(false);
          setWebcamActive(false);
        }
      } catch (e) {
        results.push({ username: uname, msg: "error", ok: false });
      }
    }
    setMultiResult(results);
    setStatus("");
  }

  function handleStart() {
    setRunning(true);
    setWebcamActive(true);
    setStatus("Webcam started. Please position the student and wait for capture...");
    setMultiResult([]);
  }

  function handleStop() {
    setRunning(false);
    setWebcamActive(false);
    setStatus("Webcam stopped.");
    setMultiResult([]);
  }

  return (
    <div
      style={{
        border: "1px solid #1976d2",
        padding: 24,
        borderRadius: 12,
        background: "#f7faff",
        maxWidth: 400,
        margin: "32px auto",
        boxShadow: "0 2px 12px #1976d222"
      }}
    >
      <h2 style={{ color: "#1976d2", marginBottom: 20, textAlign: "center" }}>
        Teacher - Start Attendance
      </h2>
      <div style={{ marginBottom: 18, textAlign: "center" }}>
        <label style={{ fontWeight: 500, color: "#333" }}>
          Select Student:&nbsp;
          <select
            value={manualUsernames ? "" : selectedUsername}
            onChange={e => setSelectedUsername(e.target.value)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid #1976d2",
              background: "#fff",
              color: "#1976d2",
              fontWeight: 500
            }}
            disabled={!!manualUsernames}
          >
            {usernames.map(u => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 10, textAlign: "center" }}>
        <input
          type="text"
          value={manualUsernames}
          onChange={e => { setManualUsernames(e.target.value); if (e.target.value) setSelectedUsername(""); }}
          placeholder="Or type usernames, comma separated"
          style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb', minWidth: 220 }}
        />
        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
          (Select a student from dropdown, or enter one or more usernames above, comma separated)
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        {webcamActive ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
            height={240}
            style={{
              borderRadius: 8,
              border: "2px solid #1976d2",
              background: "#222"
            }}
          />
        ) : (
          <div
            style={{
              width: 320,
              height: 240,
              borderRadius: 8,
              border: "2px dashed #bbb",
              background: "#e3eafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888"
            }}
          >
            Webcam is off
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <button
          onClick={handleStart}
          disabled={running}
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 22px",
            fontWeight: 600,
            fontSize: 16,
            cursor: running ? "not-allowed" : "pointer",
            marginRight: 10,
            boxShadow: running ? "none" : "0 2px 8px #1976d233"
          }}
        >
          Start
        </button>
        <button
          onClick={handleStop}
          disabled={!running}
          style={{
            background: "#e53935",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 22px",
            fontWeight: 600,
            fontSize: 16,
            cursor: !running ? "not-allowed" : "pointer",
            boxShadow: !running ? "none" : "0 2px 8px #e5393533"
          }}
        >
          Stop
        </button>
      </div>
      {/* Show multiResult if present */}
      {multiResult && multiResult.length > 0 && (
        <div style={{ marginTop: 10, marginBottom: 8 }}>
          <div style={{ fontWeight: 500, color: '#1976d2', marginBottom: 4 }}>Results:</div>
          <ul style={{ paddingLeft: 18 }}>
            {multiResult.map((r, i) => (
              <li key={i} style={{ color: r.ok ? '#388e3c' : '#e53935' }}>
                <b>{r.username}:</b> {r.msg} {r.conf !== undefined ? <span style={{ color: '#1976d2' }}> (conf={r.conf?.toFixed ? r.conf.toFixed(2) : r.conf})</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div
        style={{
          minHeight: 28,
          textAlign: "center",
          color:
            status.toLowerCase().includes("error") || status.toLowerCase().includes("fail")
              ? "#e53935"
              : status.toLowerCase().includes("marked")
              ? "#388e3c"
              : "#1976d2",
          fontWeight: 500,
          fontSize: 15,
          marginTop: 8
        }}
      >
        {status}
      </div>
    </div>
  );
}
