import { useState } from "react";
import axios from "axios";
import { DownloadCloud, FileKey, Loader2 } from "lucide-react";

function Download() {
  const [fileId, setFileId] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    // Basic validation for both fields
    if (!fileId || !password) {
      setStatus("Please enter both File ID and password.");
      return;
    }

    setLoading(true);
    setStatus("Verifying...");

    try {
      // Updated: ID is removed from the URL and moved into the data body
      const res = await axios.post(`http://localhost:3000/download`, {
        id: fileId,
        password: password,
      });

      // Assuming the server returns a temporary download link
      window.location.href = res.data.downloadUrl;
      setStatus("Download starting...");
    } catch (err) {
      console.error(err);
      setStatus("Incorrect ID, password, or file missing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ textAlign: "center", maxWidth: "400px", margin: "40px auto" }}>
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
      <p className="card-subtitle">Enter your credentials to access the file.</p>

      <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* File ID Input */}
        <div className="input-wrapper">
          <input
            type="text"
            className="text-input"
            placeholder="Enter File ID"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className="input-wrapper">
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
        style={{ marginTop: "20px", width: "100%" }}
        disabled={loading || !password || !fileId}
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