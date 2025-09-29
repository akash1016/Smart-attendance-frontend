import React, { useEffect, useState } from "react";
import axios from "axios";
export default function StudentPanel() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    async function l() {
      const r = await axios.get("http://127.0.0.1:5000/attendance/report");
      setRows(r.data.rows);
    }
    l();
  }, []);
  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <h3>Student Dashboard</h3>
      <ul>
        {rows.map((r, i) => (
          <li key={i}>
            {r.student} - {new Date(r.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
