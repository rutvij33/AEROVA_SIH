import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="intel-page" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div className="intel-card glass-card" style={{ maxWidth: 460, textAlign: "center", padding: 40 }}>
        <p className="dashboard-kicker">404 / Route Not Found</p>
        <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2rem", margin: "16px 0" }}>
          Lost in <span>Airspace</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", marginBottom: 24 }}>
          The requested coordinate or navigational endpoint does not exist.
        </p>
        <Link href="/" className="dashboard-refresh" style={{ display: "inline-flex" }}>
          <ArrowLeft size={14} /> Back to AEROVA
        </Link>
      </div>
    </div>
  );
}
