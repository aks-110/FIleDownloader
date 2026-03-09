import { useState } from "react";
import axios from "axios";
import {
  Copy,
  UploadCloud,
  File,
  CheckCircle,
  Loader2,
} from "lucide-react";

function Upload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [fileId, setFileId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUpload = async () => {
    if (!file || !password) return;

    setLoading(true);
    setStatus("Processing...");

    try {
      // 1️⃣ Get presigned URL from backend
      const res = await axios.post("http://localhost:3000/geturl", {
        fileName: file.name,
        fileType: file.type,
        password: password,
      });

      // 2️⃣ Correct destructuring of backend response
      const { uploadUrl, id, qrDataUrl } = res.data;

      setFileId(id);
      setQrCode(qrDataUrl);
      setDownloadLink(`http://localhost:3000/download/${id}`);

      setStatus("Uploading...");

      // 3️⃣ Upload file to Backblaze using presigned URL
      await fetch(uploadUrl, {
        method: "PUT",
        body: file, // don't set headers, CORS-safe
      });

      setReady(true);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(downloadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      {!ready ? (
        <>
          <h2 className="card-title">
            <UploadCloud color="#6366f1" /> Secure Upload
          </h2>
          <p className="card-subtitle">Encrypt and share your files safely.</p>

          <div className="file-drop-area">
            <input
              type="file"
              className="hidden-file-input"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
              <>
                <File size={32} color="#6366f1" style={{ margin: "0 auto" }} />
                <p style={{ fontWeight: "600", marginTop: "10px" }}>
                  {file.name}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <UploadCloud
                  size={32}
                  color="#94a3b8"
                  style={{ margin: "0 auto" }}
                />
                <p style={{ color: "#64748b", marginTop: "10px" }}>
                  Drag & drop or click to select
                </p>
              </>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Protect with Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                className="text-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={loading || !file || !password}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <UploadCloud size={20} />
            )}
            {loading ? "Encrypting..." : "Encrypt & Upload"}
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "12px",
              color: "#64748b",
              fontSize: "0.9rem",
            }}
          >
            {status}
          </p>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <CheckCircle
            size={48}
            color="#10b981"
            style={{ margin: "0 auto 16px" }}
          />
          <h2 className="card-title" style={{ marginBottom: "20px" }}>
            Upload Complete
          </h2>

          {/* Display File ID */}
          {fileId && (
            <p style={{ fontSize: "0.9rem", color: "#374151", marginBottom: "12px" }}>
              File ID: <strong>{fileId}</strong>
            </p>
          )}

          {/* Shareable Link */}
          <div className="input-group" style={{ textAlign: "center" }}>
            <p className="input-label" style={{ textAlign: "left" }}>
              Shareable Link
            </p>
            <div
              style={{
                background: "#f8fafc",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                marginBottom: "12px",
                wordBreak: "break-all",
              }}
            >
              {downloadLink}
            </div>
            <button
              className="btn-primary"
              onClick={copyLink}
              style={{
                backgroundColor: "#f1f5f9",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
              }}
            >
              {copied ? (
                <CheckCircle size={18} color="#10b981" />
              ) : (
                <Copy size={18} />
              )}
              {copied ? "Copied to Clipboard" : "Copy Link"}
            </button>
          </div>

          {/* QR Code */}
          {qrCode && (
            <div style={{ margin: "24px 0" }}>
              <img
                src={qrCode}
                alt="QR Code"
                style={{
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  padding: "8px",
                  width: "130px",
                }}
              />
            </div>
          )}

          <button
            className="btn-primary"
            onClick={() => {
              setReady(false);
              setFile(null);
              setPassword("");
              setFileId("");
              setQrCode("");
              setDownloadLink("");
              setStatus("");
            }}
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}

export default Upload;