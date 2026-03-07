import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { DownloadCloud, Lock, FileKey, Loader2 } from "lucide-react";

function Download() {
  const { id } = useParams();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!password) {
      setStatus("Please enter a password.");
      return;
    }

    setLoading(true);
    setStatus("Verifying...");

    try {
      const res = await axios.post(`http://localhost:3000/download/${id}`, {
        password: password,
      });

      window.location.href = res.data.downloadUrl;
      setStatus("Download starting...");
    } catch (err) {
      console.error(err);
      setStatus("Incorrect password or file missing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div
        style={{
          background: "#e0e7ff",
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <FileKey size={32} color="#6366f1" />
      </div>

      <h2 className="card-title">Secure Download</h2>
      <p className="card-subtitle">Enter the password to unlock your file.</p>

      <div className="input-group">
        <div className="input-wrapper">
          {/* <Lock size={18} className="input-icon" /> */}
          <input
            type="password"
            className="text-input"
            placeholder="Enter file password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDownload()}
          />
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={handleDownload}
        disabled={loading || !password}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <DownloadCloud size={20} />
        )}
        {loading ? "Verifying..." : "Unlock & Download"}
      </button>

      {status && (
        <p
          style={{
            marginTop: "16px",
            fontSize: "0.9rem",
            color: status.includes("Incorrect") ? "#ef4444" : "#64748b",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}

export default Download;
