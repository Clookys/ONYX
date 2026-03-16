import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import Auth from "./Auth.jsx";
import Landing from "./Landing.jsx";
import Radar from "./Radar.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("landing");

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage("landing");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, letterSpacing: 6, background: "linear-gradient(90deg, #00f0ff, #b026ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ONYX</div>
    </div>
  );

  if (!user) return <Auth onAuth={(u) => setUser(u)} />;

  if (page === "radar") return <Radar onBack={() => setPage("landing")} user={user} onLogout={handleLogout} />;
  return <Landing onOpenRadar={() => setPage("radar")} user={user} onLogout={handleLogout} />;
}
