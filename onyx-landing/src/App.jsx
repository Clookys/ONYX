import { useEffect, useState } from "react";
import Landing from "./Landing.jsx";
import Radar from "./Radar.jsx";
import RadarV10 from "./RadarV10.jsx";

const HASH_TO_PAGE = {
  "#radar-demo": "radar",
  "#radar-v10": "radar-v10",
};

function getPageFromLocation() {
  if (typeof window === "undefined") {
    return "landing";
  }

  return HASH_TO_PAGE[window.location.hash] || "landing";
}

export default function App() {
  const [page, setPage] = useState(getPageFromLocation);

  useEffect(() => {
    const syncPage = () => setPage(getPageFromLocation());
    window.addEventListener("hashchange", syncPage);
    window.addEventListener("popstate", syncPage);
    return () => {
      window.removeEventListener("hashchange", syncPage);
      window.removeEventListener("popstate", syncPage);
    };
  }, []);

  const navigate = (nextPage) => {
    setPage(nextPage);

    if (nextPage === "landing") {
      window.history.pushState({}, "", `${window.location.pathname}${window.location.search}`);
      return;
    }

    window.location.hash = nextPage === "radar-v10" ? "radar-v10" : "radar-demo";
  };

  if (page === "radar-v10") {
    return <RadarV10 onBack={() => navigate("landing")} />;
  }

  if (page === "radar") {
    return <Radar onBack={() => navigate("landing")} />;
  }

  return (
    <Landing
      onOpenRadar={() => navigate("radar")}
      onOpenRadarV10={() => navigate("radar-v10")}
    />
  );
}