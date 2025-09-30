
import React, { useState } from "react";

function AnnouncementListTab() {
	const [announcements, setAnnouncements] = useState([]);
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState("");

	React.useEffect(() => {
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

	return (
		<div style={{ maxWidth: 600, margin: "0 auto" }}>
			<h3 style={{ color: "#1976d2", marginBottom: 12 }}>Announcements</h3>
			{loading ? (
				<div>Loading announcements...</div>
			) : err ? (
				<div style={{ color: "#e53935" }}>{err}</div>
			) : announcements.length === 0 ? (
				<div style={{ color: "#888" }}>No announcements found.</div>
			) : (
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
						</div>
					))}
				</div>
			)}
		</div>
	);
}


function SubmitComplaintTab() {
	const [form, setForm] = useState({ title: "", description: "" });
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState("");

	function handleChange(e) {
		setForm({ ...form, [e.target.name]: e.target.value });
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		setStatus("");
		const username = localStorage.getItem("username");
		const token = `demo-${username}`;
		try {
			const res = await fetch("http://127.0.0.1:5000/student/submit-complaint", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: token
				},
				body: JSON.stringify({ title: form.title, description: form.description })
			});
			const data = await res.json();
			if (res.ok && data.ok) {
				setStatus("Complaint submitted successfully!");
				setForm({ title: "", description: "" });
			} else {
				setStatus(data.msg || "Failed to submit complaint.");
			}
		} catch (e) {
			setStatus("Failed to submit complaint.");
		}
		setLoading(false);
	}

	return (
		<div style={{ maxWidth: 400, margin: "0 auto" }}>
			<h3 style={{ color: "#1976d2", marginBottom: 12 }}>Submit Complaint</h3>
			<form onSubmit={handleSubmit} style={{ background: "#f7faff", padding: 16, borderRadius: 8 }}>
				<div style={{ marginBottom: 10 }}>
					<input
						name="title"
						placeholder="Title"
						value={form.title}
						onChange={handleChange}
						required
						style={{ width: "100%", padding: 8 }}
					/>
				</div>
				<div style={{ marginBottom: 10 }}>
					<textarea
						name="description"
						placeholder="Description"
						value={form.description}
						onChange={handleChange}
						required
						rows={4}
						style={{ width: "100%", padding: 8, resize: "vertical" }}
					/>
				</div>
				<button
					type="submit"
					disabled={loading}
					style={{ background: loading ? "#90caf9" : "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}
				>
					{loading ? "Submitting..." : "Submit Complaint"}
				</button>
			</form>
			{status && <div style={{ color: status.includes("success") ? "green" : "#e53935", marginTop: 12 }}>{status}</div>}
		</div>
	);
}

function AttendanceRecordsTab() {
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

	async function handleFetchRecords(e) {
		e.preventDefault();
		setLoading(true);
		setErr("");
		setRecords([]);
		const username = localStorage.getItem("username");
		try {
			const res = await fetch("http://127.0.0.1:5000/attendance/get-records", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, start_date: startDate, end_date: endDate })
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
			<h3 style={{ color: "#1976d2", marginBottom: 12 }}>My Attendance Records</h3>
			<form onSubmit={handleFetchRecords} style={{ background: "#f7faff", padding: 16, borderRadius: 8, marginBottom: 18 }}>
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
					disabled={loading}
					style={{ background: loading ? "#90caf9" : "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}
				>
					{loading ? "Fetching..." : "Get Records"}
				</button>
			</form>
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
			{records && records.length === 0 && !loading && (
				<div style={{ color: "#888", marginTop: 10 }}>No records found for selected interval.</div>
			)}
			{err && <div style={{ color: "#e53935", marginTop: 10 }}>{err}</div>}
		</div>
	);
}



export default function StudentPage() {
	const [activeTab, setActiveTab] = useState("attendancerecords");
		return (
			<div style={{ border: "1px solid #bbb", padding: 16, borderRadius: 8 }}>
				<h2 style={{ color: '#0d47a1', letterSpacing: 0.5, marginBottom: 10 }}>Student Page</h2>
				<div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
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
						onClick={() => setActiveTab("submitcomplaint")}
						style={{
							background: activeTab === "submitcomplaint" ? "#1976d2" : "#eee",
							color: activeTab === "submitcomplaint" ? "#fff" : "#222",
							border: "none",
							padding: "8px 16px",
							borderRadius: 4,
							cursor: "pointer"
						}}
					>
						Submit Complaint
					</button>
					<button
						onClick={() => setActiveTab("announcementlist")}
						style={{
							background: activeTab === "announcementlist" ? "#1976d2" : "#eee",
							color: activeTab === "announcementlist" ? "#fff" : "#222",
							border: "none",
							padding: "8px 16px",
							borderRadius: 4,
							cursor: "pointer"
						}}
					>
						Announcements
					</button>
				</div>
				<div>
					{activeTab === "attendancerecords" && <AttendanceRecordsTab />}
					{activeTab === "submitcomplaint" && <SubmitComplaintTab />}
					{activeTab === "announcementlist" && <AnnouncementListTab />}
				</div>
			</div>
		);
}
