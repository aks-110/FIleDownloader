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

  const [timeLeft, setTimeLeft] = useState(0);
  const [expiryTime, setExpiryTime] = useState(null);
  const [initialTime, setInitialTime] = useState(0);

  const [progress, setProgress] = useState(0);

  // -------------------------
  // Restore state after refresh
  // -------------------------

  useEffect(() => {
    const saved = localStorage.getItem("uploadData");

    if (!saved) return;

    const data = JSON.parse(saved);

    if (Date.now() > data.expiry) {
      localStorage.removeItem("uploadData");
      return;
    }

    setFileId(data.id);
    setQrCode(data.qrCode);
    setDownloadLink(data.link);

    setExpiryTime(data.expiry);
    setInitialTime(data.initialTime);

    const remaining = Math.floor((data.expiry - Date.now()) / 1000);
    setTimeLeft(remaining);

    setReady(true);
  }, []);

  // -------------------------
  // Countdown timer
  // -------------------------

  useEffect(() => {
    if (!expiryTime) return;

    const interval = setInterval(() => {
      const remaining = Math.floor((expiryTime - Date.now()) / 1000);

      if (remaining <= 0) {
        clearInterval(interval);
        localStorage.removeItem("uploadData");
        setReady(false);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  // -------------------------
  // Upload
  // -------------------------

  const handleUpload = async () => {
    if (!file || !password) return;

    setLoading(true);
    setProgress(0);
    setStatus("Processing...");

    try {
      const fileSizeMB = file.size / (1024 * 1024);

      let expiry;

      if (fileSizeMB < 10) {
        expiry = 3600; // 1 hour
      } else {
        expiry = 86400; // 1 day
      }

      const res = await axios.post("http://localhost:3000/geturl", {
        fileName: file.name,
        fileType: file.type,
        password: password,
        expiry: expiry,
      });

      const { uploadUrl, id, qrDataUrl } = res.data;

      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          setProgress(percent);
          setStatus(`Uploading... ${percent}%`);
        },
      });

      const link = `http://localhost:5173/download/${id}`;

      const expire = Date.now() + expiry * 1000;

      localStorage.setItem(
        "uploadData",
        JSON.stringify({
          id,
          qrCode: qrDataUrl,
          link,
          expiry: expire,
          initialTime: expiry,
        }),
      );

      setFileId(id);
      setQrCode(qrDataUrl);
      setDownloadLink(link);

      setExpiryTime(expire);
      setTimeLeft(expiry);
      setInitialTime(expiry);

      setReady(true);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Copy link
  // -------------------------

  const copyLink = () => {
    navigator.clipboard.writeText(downloadLink);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------
  // Upload another file
  // -------------------------

  const uploadAnother = () => {
    localStorage.removeItem("uploadData");

    setFile(null);
    setPassword("");

    setFileId("");
    setQrCode("");
    setDownloadLink("");

    setReady(false);
    setStatus("");
    setProgress(0);

    setTimeLeft(0);
    setExpiryTime(null);
    setInitialTime(0);
  };

  // -------------------------
  // Circle timer
  // -------------------------

  const CircleTimer = ({ timeLeft, initialTime }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;

    const progressCircle = timeLeft / initialTime;

    return (
      <svg width="120" height="120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />

        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#6366f1"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progressCircle)}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />

        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="14">
          {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}
        </text>
      </svg>
    );
  };

  // -------------------------
  // UI
  // -------------------------

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
                <File size={32} color="#6366f1" />
                <p>{file.name}</p>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <UploadCloud size={32} color="#94a3b8" />
                <p>Drag & drop or click to select</p>
              </>
            )}
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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

            {loading ? "Uploading..." : "Encrypt & Upload"}
          </button>

          <p>{status}</p>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <CheckCircle
            size={48}
            color="#10b981"
            style={{ marginBottom: "10px" }}
          />

          <h2>Upload Complete</h2>

          {timeLeft > 0 && (
            <div style={{ margin: "20px 0" }}>
              <CircleTimer timeLeft={timeLeft} initialTime={initialTime} />
              <p style={{ fontSize: "0.85rem" }}>File expires automatically</p>
            </div>
          )}

          <p>
            File ID: <strong>{fileId}</strong>
          </p>

          <div style={{ marginTop: "20px" }}>
            <p>Shareable Link</p>

            <div
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
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
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>

          {qrCode && (
            <div style={{ marginTop: "20px" }}>
              <img src={qrCode} alt="QR Code" style={{ width: "130px" }} />
            </div>
          )}

          <button
            className="btn-primary"
            onClick={uploadAnother}
            style={{ marginTop: "20px" }}
          >
            <UploadCloud size={18} /> Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}

export default Upload;
