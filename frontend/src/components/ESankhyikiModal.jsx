import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  X, Database, ExternalLink, Copy, Check, Download, 
  ShieldCheck, ArrowUpRight, Clock, FileCode
} from "lucide-react";

export default function ESankhyikiModal({ isOpen, onClose }) {
  const [feedData, setFeedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("json");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/v1";
      fetch(`${apiBase}/esankhyiki/export`)
        .then((res) => res.json())
        .then((data) => {
          setFeedData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch eSankhyiki feed", err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (feedData) {
      const textToCopy = activeTab === "json" 
        ? JSON.stringify(feedData, null, 2)
        : sdmxXmlContent;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!feedData) return;
    const content = activeTab === "json" 
      ? JSON.stringify(feedData, null, 2) 
      : sdmxXmlContent;
    const mimeType = activeTab === "json" ? "application/json" : "application/xml";
    const filename = `aerova_esankhyiki_sdmx_${new Date().toISOString().slice(0, 10)}.${activeTab === "json" ? "json" : "xml"}`;
    
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sdmxXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<mes:StructureSpecificData xmlns:mes="http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message"
                           xmlns:str="http://www.sdmx.org/resources/sdmxml/schemas/v2_1/structure"
                           xmlns:gen="http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic">
  <mes:Header>
    <mes:ID>${feedData?.header?.id || "ESK_AEROVA_2026"}</mes:ID>
    <mes:Test>false</mes:Test>
    <mes:Prepared>${feedData?.header?.prepared || new Date().toISOString()}</mes:Prepared>
    <mes:Sender id="AEROVA_ENGINE">
      <mes:Name xml:lang="en">AEROVA Real-time Airfare Ingestion Engine</mes:Name>
    </mes:Sender>
    <mes:Receiver id="MOSPI_ESANKHYIKI">
      <mes:Name xml:lang="en">MoSPI eSankhyiki Open Data Catalogue</mes:Name>
    </mes:Receiver>
  </mes:Header>
  <mes:DataSet structureRef="IN_NSO_CPI_COICOP_0733" action="Information">
    <gen:Series>
      <gen:SeriesKey>
        <gen:Value id="FREQ" value="D"/>
        <gen:Value id="REF_AREA" value="IND"/>
        <gen:Value id="COICOP" value="07.3.3"/>
        <gen:Value id="BASE_YEAR" value="2024"/>
      </gen:SeriesKey>
      <gen:Obs>
        <gen:ObsDimension id="TIME_PERIOD" value="${feedData?.dataset?.observation_date || new Date().toISOString().slice(0, 10)}"/>
        <gen:ObsValue value="${feedData?.dataset?.value || 153.88}"/>
        <gen:Attributes>
          <gen:Value id="OBS_STATUS" value="${feedData?.dataset?.status || "A"}"/>
          <gen:Value id="UNIT_MEASURE" value="INDEX"/>
          <gen:Value id="SAMPLE_SIZE" value="${feedData?.dataset?.attributes?.sample_size || 250}"/>
          <gen:Value id="METHOD" value="LASPEYRES_JEVONS"/>
        </gen:Attributes>
      </gen:Obs>
    </gen:Series>
  </mes:DataSet>
</mes:StructureSpecificData>`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-card" 
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Modal Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "16px",
          marginBottom: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)"
            }}>
              <Database size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "#0f172a", letterSpacing: "-0.01em" }}>
                  MoSPI eSankhyiki SDMX Feed
                </h2>
                <span style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#16a34a"
                }}>
                  ● Live Stream
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "3px 0 0" }}>
                National Statistical Office (NSO) SDMX 2.1 &amp; JSON-STAT Machine Ingestion
              </p>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href="/esankhyiki"
              onClick={onClose}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#0284c7",
                padding: "6px 12px",
                borderRadius: 8,
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                textDecoration: "none"
              }}
            >
              Open Full Page <ArrowUpRight size={13} />
            </Link>
            <button 
              onClick={onClose} 
              style={{ 
                background: "#f1f5f9", 
                border: "none", 
                color: "#64748b", 
                cursor: "pointer", 
                padding: "8px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Portal Quick Banner */}
        <div style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.82rem" }}>Target Portal:</span>
              <span style={{ color: "#0284c7", fontWeight: 600, fontSize: "0.82rem" }}>esankhyiki.mospi.gov.in</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
              COICOP 07.3.3 (Passenger Transport by Air) · Base Year 2024=100.0 · Flash Nowcast
            </div>
          </div>
          <a 
            href="https://esankhyiki.mospi.gov.in/data-catalogue" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              fontSize: "0.75rem",
              padding: "6px 14px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              color: "#0f172a",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          >
            <span>Visit MoSPI Portal</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Action Controls & Format Switcher */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 10
        }}>
          <div style={{
            display: "inline-flex",
            background: "#f1f5f9",
            borderRadius: 8,
            padding: 3,
            border: "1px solid #e2e8f0"
          }}>
            <button
              onClick={() => setActiveTab("json")}
              style={{
                border: "none",
                padding: "4px 12px",
                borderRadius: 6,
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                background: activeTab === "json" ? "#ffffff" : "transparent",
                color: activeTab === "json" ? "#0f172a" : "#64748b",
                boxShadow: activeTab === "json" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
              }}
            >
              SDMX-JSON
            </button>
            <button
              onClick={() => setActiveTab("xml")}
              style={{
                border: "none",
                padding: "4px 12px",
                borderRadius: 6,
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                background: activeTab === "xml" ? "#ffffff" : "transparent",
                color: activeTab === "xml" ? "#0f172a" : "#64748b",
                boxShadow: activeTab === "xml" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
              }}
            >
              SDMX-ML (XML)
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleCopy}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.72rem",
                padding: "5px 12px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                color: "#334155",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {copied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
              <span>{copied ? "Copied!" : "Copy Payload"}</span>
            </button>

            <button
              onClick={handleDownload}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.72rem",
                padding: "5px 12px",
                background: "#0284c7",
                border: "none",
                borderRadius: 6,
                color: "#ffffff",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              <Download size={12} />
              <span>Download {activeTab.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Code Viewer */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <pre style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "12px",
            padding: "16px",
            color: "#38bdf8",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.76rem",
            lineHeight: 1.5,
            overflowX: "auto",
            maxHeight: "260px",
            margin: 0
          }}>
            {loading 
              ? "// Ingesting live eSankhyiki SDMX stream..." 
              : activeTab === "json" 
              ? JSON.stringify(feedData, null, 2) 
              : sdmxXmlContent}
          </pre>
        </div>

        {/* Benefits List */}
        <div style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "16px"
        }}>
          <h4 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 8px", fontSize: "0.82rem" }}>
            Key MoSPI Operational Advantages (SIH26056):
          </h4>
          <ul style={{
            paddingLeft: "18px",
            margin: 0,
            color: "#475569",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            fontSize: "0.76rem"
          }}>
            <li><strong>Zero Survey Lag:</strong> From 45 days manual delay to near-real-time (T+0) flash CPI augmentation.</li>
            <li><strong>Dynamic Pricing Capture:</strong> Covers 5 advance purchase windows (1d to 45d) across 10 trunk routes.</li>
            <li><strong>Turnkey SDMX 2.1:</strong> Direct drop-in ingestion for eSankhyiki data engineering pipelines.</li>
          </ul>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
            Base Year: 2024 = 100.0 · Formula: Laspeyres over Jevons aggregates
          </span>
          <button 
            onClick={onClose} 
            style={{
              padding: "7px 20px",
              background: "#0f172a",
              color: "#ffffff",
              borderRadius: 8,
              border: "none",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
