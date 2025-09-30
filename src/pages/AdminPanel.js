import React, { useState, useRef } from "react";
import Webcam from "react-webcam";

export default function AdminPanel({ username }) {
  const webcamRef = useRef(null);
  const labels = ["front", "left", "right", "up", "down"];
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [captures, setCaptures] = useState([]); // store preview images

  async function capture() {
    if (!username) {
      setStatus("No username provided.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const src = webcamRef.current.getScreenshot();
      if (!src) {
        setStatus("Could not capture image. Please allow camera access.");
        setLoading(false);
        return;
      }
      setCaptures((prev) => [...prev, src]);
      const blob = await (await fetch(src)).blob();
      const fd = new FormData();
      fd.append("image", blob, "cap.jpg");
      fd.append("username", username);
      fd.append("label", labels[step]);
      const res = await fetch(
        "http://127.0.0.1:5000/admin/add-student-webcam",
        { method: "POST", body: fd }
      );
      const j = await res.json();
      setStatus(j.msg || "Captured successfully");
      if (step < labels.length - 1) {
        setStep((s) => s + 1);
      } else {
        setStatus("All captures done. Model retrained.");
      }
    } catch (e) {
      setStatus("Error capturing image.");
    }
    setLoading(false);
  }

  function reset() {
    setStep(0);
    setStatus("");
    setCaptures([]);
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8, maxWidth: 400, margin: "0 auto" }}>
      <h3 style={{ marginBottom: 8, color: '#1565c0', letterSpacing: 0.5 }}>Add FaceID for <span style={{ color: "#43a047" }}>{username}</span></h3>
      <div style={{ margin: "12px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={220}
            height={180}
            style={{ borderRadius: 8, border: "1px solid #aaa" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {captures.map((img, i) => (
              <img key={i} src={img} alt={`capture-${i}`} width={48} height={36} style={{ border: "1px solid #bbb", borderRadius: 4 }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ margin: "10px 0 4px 0", fontWeight: 500, color: '#1976d2' }}>
        Step {step + 1} of {labels.length}: <span style={{ color: "#f9a825" }}>{labels[step]}</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          onClick={capture}
          disabled={loading || step >= labels.length}
          style={{
            padding: "8px 18px",
            background: loading || step >= labels.length ? "#aaa" : "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: loading || step >= labels.length ? "not-allowed" : "pointer"
          }}
        >
          {step < labels.length - 1 ? "Capture" : step === labels.length - 1 ? "Finish" : "Done"}
        </button>
        <button
          onClick={reset}
          disabled={loading}
          style={{ padding: "8px 16px", borderRadius: 4, border: "1px solid #1976d2", background: "#fff", color: "#1976d2", cursor: loading ? "not-allowed" : "pointer" }}
        >
          Reset
        </button>
      </div>
      <div style={{ marginTop: 10, minHeight: 24, color: status.includes("error") ? "#b00" : "#1976d2" }}>
        {status}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: "#555" }}>
        Please follow the instructions for each pose. After all captures, the model will be retrained automatically.
      </div>
    </div>
  );
}

