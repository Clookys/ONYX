import { useState } from "react";
import Landing from "./Landing.jsx";
import Radar from "./Radar.jsx";

export default function App() {
  const [page, setPage] = useState("landing");

  if (page === "radar") {
    return <Radar onBack={() => setPage("landing")} />;
  }

  return (
    <Landing
      onOpenRadar={() => setPage("radar")}
      onOpenRadarV10={() => setPage("radar")}
    />
  );
}