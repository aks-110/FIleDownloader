import { Link, useLocation } from "react-router-dom";
import { UploadCloud, DownloadCloud } from "lucide-react";

function Navbar() {
  const location = useLocation();

  const getLinkStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: location.pathname === path ? "#111827" : "#6b7280",
    textDecoration: "none",
    fontWeight: location.pathname === path ? "600" : "500",
    padding: "8px 16px",
    borderRadius: "6px",
    backgroundColor: location.pathname === path ? "#f3f4f6" : "transparent",
    transition: "all 0.2s",
  });

  return (
    <nav
      style={{
        height: "60px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <Link to="/" style={getLinkStyle("/")}>
        <UploadCloud size={18} />
        Upload
      </Link>

      <Link to="/download" style={getLinkStyle("/download")}>
        <DownloadCloud size={18} />
        Download
      </Link>
    </nav>
  );
}

export default Navbar;
