import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

export default function TeacherPanel() {
  const webcamRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [usernames, setUsernames] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
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
      id = setInterval(capture, 3000);
    } else {
      setWebcamActive(false);
    }
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [running, selectedUsername]);

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
      setStatus(j.msg + " " + (j.conf ? "conf=" + j.conf : ""));
      // If attendance is already marked for today, stop webcam
      if (
        j.msg &&
        (j.msg.toLowerCase().includes("already marked") ||
         j.msg.toLowerCase().includes("attendance is marked for today"))
      ) {
        setRunning(false);
        setWebcamActive(false);
      }
    } catch (e) {
      setStatus("error");
    }
  }

  function handleStart() {
    setRunning(true);
    setWebcamActive(true);
    setStatus("Webcam started. Please position the student and wait for capture...");
  }

  function handleStop() {
    setRunning(false);
    setWebcamActive(false);
    setStatus("Webcam stopped.");
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
            value={selectedUsername}
            onChange={e => setSelectedUsername(e.target.value)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid #1976d2",
              background: "#fff",
              color: "#1976d2",
              fontWeight: 500
            }}
          >
            {usernames.map(u => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
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