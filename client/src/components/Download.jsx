import { useState, useEffect } from "react";
import axios from "axios";
import { Copy, UploadCloud, File, CheckCircle, Loader2 } from "lucide-react";

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

  // Restore upload data after refresh (valid for 5 minutes)
  useEffect(() => {
    const saved = localStorage.getItem("uploadData");

    if (saved) {
      const data = JSON.parse(saved);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (now - data.timestamp < fiveMinutes) {
        setFileId(data.fileId);
        setQrCode(data.qrCode);
        setDownloadLink(data.downloadLink);
        setReady(true);
      } else {
        localStorage.removeItem("uploadData");
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!file || !password) return;

    setLoading(true);
    setStatus("Processing...");

    try {
      // Calculate file size in MB
      const fileSizeMB = file.size / (1024 * 1024);

      // Decide expiry
      let expiry;
      if (fileSizeMB < 10) {
        expiry = 3600; // 1 hour
      } else {
        expiry = 86400; // 1 day
      }

      // Request backend
      const res = await axios.post("http://localhost:3000/geturl", {
        fileName: file.name,
        fileType: file.type,
        password: password,
        expiry: expiry,
      });

      const { uploadUrl, id, qrDataUrl } = res.data;

      const link = `http://localhost:3000/download/${id}`;

      setFileId(id);
      setQrCode(qrDataUrl);
      setDownloadLink(link);

      setStatus("Uploading...");

      // Upload file to storage
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });

      setReady(true);
      setStatus("");

      // Save upload result for 5 minutes
      localStorage.setItem(
        "uploadData",
        JSON.stringify({
          fileId: id,
          qrCode: qrDataUrl,
          downloadLink: link,
          timestamp: Date.now(),
        }),
      );
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

  const uploadAnotherFile = () => {
    localStorage.removeItem("uploadData");

    setReady(false);
    setFile(null);
    setPassword("");
    setFileId("");
    setQrCode("");
    setDownloadLink("");
    setStatus("");
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

          <h2 className="card-title">Upload Complete</h2>

          {fileId && (
            <p style={{ marginBottom: "12px" }}>
              File ID: <strong>{fileId}</strong>
            </p>
          )}

          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                background: "#f8fafc",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                wordBreak: "break-all",
              }}
            >
              {downloadLink}
            </div>

            <button
              className="btn-primary"
              onClick={copyLink}
              style={{ marginTop: "10px" }}
            >
              {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>

          {qrCode && (
            <div style={{ margin: "20px 0" }}>
              <img
                src={qrCode}
                alt="QR Code"
                style={{ width: "130px", border: "1px solid #cbd5e1" }}
              />
            </div>
          )}

          <button className="btn-primary" onClick={uploadAnotherFile}>
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}

export default Upload;
