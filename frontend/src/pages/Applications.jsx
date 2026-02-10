import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Applications() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await api.get("/applications", { params: { user: localStorage.getItem("user") } });
      setApps(res.data.applications || []);
    }
    load();
  }, []);

  const advance = async (appId, toStatus) => {
    const user = localStorage.getItem("user") || "test@gmail.com";
    await api.post(`/applications/${user}/email/${appId}/status`, { status: toStatus });
    setApps((s) => s.map((a) => (a.id === appId ? { ...a, status: toStatus, history: [...(a.history || []), { status: toStatus, at: new Date().toISOString() }] } : a)));
  };

  return (
    <div>
      <h2>Applications</h2>
      {apps.map((a) => (
        <div key={a.id} style={{ border: "1px solid #ddd", padding: 10, margin: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>{a.jobTitle}</strong> — {a.company}
              <div style={{ fontSize: 12, color: "#666" }}>{a.status}</div>
            </div>
            <div>
              {a.status !== "Interview" && <button onClick={() => advance(a.id, "Interview")}>Mark Interview</button>}
              {a.status !== "Offer" && <button onClick={() => advance(a.id, "Offer")}>Mark Offer</button>}
              {a.status !== "Rejected" && <button onClick={() => advance(a.id, "Rejected")}>Mark Rejected</button>}
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <em>Timeline:</em>
            <ul>
              {(a.history || []).map((h, idx) => (
                <li key={idx}>{h.status} at {new Date(h.at).toLocaleString()}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
