import { useState } from "react";
import Landing from "./Landing.jsx";
import Radar from "./Radar.jsx";
import WorldLive from "./WorldLive.jsx";

export default function App() {
  const [page, setPage] = useState("landing");

  if (page === "radar") {
    return <Radar onBack={() => setPage("landing")} onOpenWorld={() => setPage("world")} />;
  }

  if (page === "world") {
    return <WorldLive onBack={() => setPage("landing")} onOpenRadar={() => setPage("radar")} />;
  }

  return <Landing onOpenRadar={() => setPage("radar")} onOpenWorld={() => setPage("world")} />;
}
