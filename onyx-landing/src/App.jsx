import { useState } from "react";
import Landing from "./Landing.jsx";
import Radar from "./Radar.jsx";
import RadarV10 from "./RadarV10.jsx";

export default function App() {
  const [page, setPage] = useState("landing");

  if (page === "radar") {
    return <Radar onBack={() => setPage("landing")} />;
  }

  if (page === "radar-v10") {
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setPage("landing")}
          style={{
            position: "fixed",
            top: 14,
            left: 14,
            zIndex: 1200,
            border: "1px solid #ffffff2d",
            background: "rgba(5,5,8,0.85)",
            color: "#ffffffd0",
            borderRadius: 8,
            padding: "7px 10px",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Retour accueil
        </button>
        <RadarV10 />
      </div>
    );
  }

  return (
    <Landing
      onOpenRadar={() => setPage("radar")}
      onOpenRadarV10={() => setPage("radar-v10")}
    />
  );
}