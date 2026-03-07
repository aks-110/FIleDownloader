import { Link, useLocation } from "react-router-dom";
import { UploadCloud, DownloadCloud } from "lucide-react";

function Navbar() {
  const location = useLocation();

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: isActive ? "#4f46e5" : "#6b7280",
      textDecoration: "none",
      fontWeight: isActive ? "600" : "500",
      padding: "10px 18px",
      borderRadius: "8px",
      backgroundColor: isActive ? "rgba(79, 70, 229, 0.1)" : "transparent",
      transition: "all 0.2s ease",
    };
  };

  return (
    <nav
      style={{
        height: "70px",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <Link to="/" style={getLinkStyle("/")}>
        <UploadCloud size={20} />
        Upload
      </Link>

      <Link to="/download" style={getLinkStyle("/download")}>
        <DownloadCloud size={20} />
        Download
      </Link>
    </nav>
  );
}

export default Navbar;
