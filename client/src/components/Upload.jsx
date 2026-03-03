import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import { generateId } from "../utils/generateId";
import { FileUp, Share2, Copy, File } from "lucide-react";

function Upload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [fileId, setFileId] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file || !password) {
      alert("File and Password required");
      return;
    }

    setStatus("Uploading...");
    const id = generateId();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    formData.append("id", id);

    try {
      await axios.post("http://localhost:5000/upload", formData);

      const link = `${window.location.origin}/download?id=${id}`;
      setFileId(id);
      setShareLink(link);
      setStatus("Success");
    } catch (err) {
      setStatus("");
      alert("Upload failed. Ensure backend is running.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");
  };

  const whatsappShare = () => {
    const url = `https://wa.me/?text=I've shared a secure file with you.%0A%0A*Link:* ${shareLink}%0A*Password:* ${password}`;
    window.open(url, "_blank");
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h2>Secure Upload</h2>
        </div>

        {!fileId ? (
          <>
            <div className="form-group">
              <label htmlFor="file-upload" className="file-upload-box">
                {file ? (
                  <>
                    <File size={32} color="#4b5563" />
                    <span style={{ color: "#111827", fontWeight: "500" }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      Click to change file
                    </span>
                  </>
                ) : (
                  <>
                    <FileUp size={32} color="#9ca3af" />
                    <span style={{ color: "#4b5563" }}>
                      Click to browse files
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                      Any file format supported
                    </span>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
            </div>

            <div className="form-group">
              <label>Encryption Password</label>
              <input
                type="password"
                placeholder="Set a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleUpload}
              disabled={status === "Uploading..."}
            >
              <FileUp size={18} />
              {status === "Uploading..."
                ? "Encrypting & Uploading..."
                : "Upload File"}
            </button>
          </>
        ) : (
          <div className="result-box">
            <div className="result-item">
              <span style={{ color: "#6b7280" }}>File ID</span>
              <strong style={{ fontFamily: "monospace" }}>{fileId}</strong>
            </div>
            <div className="result-item">
              <span style={{ color: "#6b7280" }}>Password</span>
              <strong style={{ fontFamily: "monospace" }}>{password}</strong>
            </div>

            <div className="qr-wrapper">
              <QRCodeSVG value={shareLink} size={160} level="H" />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
              <button className="btn-secondary" onClick={copyToClipboard}>
                <Copy size={18} /> Copy Link
              </button>
              <button className="btn-primary" onClick={whatsappShare}>
                <Share2 size={18} /> WhatsApp
              </button>
            </div>

            <button
              className="btn-secondary"
              style={{ marginTop: "10px", border: "none" }}
              onClick={() => {
                setFileId("");
                setFile(null);
                setPassword("");
              }}
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
