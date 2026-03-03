import { useState, useEffect } from "react";
import axios from "axios";
import { DownloadCloud, Lock } from "lucide-react";

function Download() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Automatically fill ID if accessed via shared link
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get("id");
    if (sharedId) setId(sharedId);
  }, []);

  const handleDownload = async () => {
    if (!id || !password) {
      alert("ID and Password required");
      return;
    }

    setStatus("Verifying...");

    try {
      const response = await axios.post(
        "http://localhost:5000/download",
        { id, password },
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `secure_file_${id}`); // Default name, extension handled by OS usually
      document.body.appendChild(link);
      link.click();

      setStatus("");
      setPassword(""); // Clear password on success
    } catch (err) {
      setStatus("");
      alert("Access Denied: Wrong password or file not found.");
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h2>Retrieve File</h2>
        </div>

        <div className="form-group">
          <label>Secure File ID</label>
          <input
            type="text"
            placeholder="e.g. ABCD-EFGH-12"
            value={id}
            onChange={(e) => setId(e.target.value)}
            readOnly={window.location.search.includes("id=")} // Prevent editing if from link
            style={{
              backgroundColor: window.location.search.includes("id=")
                ? "#f3f4f6"
                : "#ffffff",
              fontFamily: "monospace",
            }}
          />
        </div>

        <div className="form-group">
          <label>Decryption Password</label>
          <input
            type="password"
            placeholder="Enter password to unlock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleDownload}
          disabled={status === "Verifying..."}
          style={{ marginTop: "1rem" }}
        >
          {status === "Verifying..." ? (
            "Decrypting..."
          ) : (
            <>
              <Lock size={18} />
              Unlock & Download
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Download;
