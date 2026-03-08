import { useState } from "react";
import Landing from "./Landing.jsx";
import Demo from "./Demo.jsx";
import Radar from "./Radar.jsx";

export default function App() {
  const [page, setPage] = useState("landing");

  if (page === "demo") {
    return <Demo onBackToLanding={() => setPage("landing")} onOpenRadar={() => setPage("radar")} />;
  }

  if (page === "radar") {
    return <Radar onBack={() => setPage("demo")} />;
  }

  return <Landing onOpenDemo={() => setPage("demo")} />;
}
