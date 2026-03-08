import { useState } from "react";
import Landing from "./Landing.jsx";
import Radar from "./Radar.jsx";

export default function App() {
  const [page, setPage] = useState("landing");
  return page === "radar"
    ? <Radar onBack={() => setPage("landing")} />
    : <Landing onOpenRadar={() => setPage("radar")} />;
}
