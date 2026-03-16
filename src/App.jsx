import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import Auth from "./Auth.jsx";
import Landing from "./Landing.jsx";
import Radar from "./Radar.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("landing");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
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

  // Landing is always public
  if (page === "landing") return <Landing onOpenRadar={() => { user ? setPage("radar") : setPage("auth"); }} user={user} onLogout={handleLogout} />;
  // Auth gate before Radar
  if (page === "auth" && !user) return <Auth onAuth={(u) => { setUser(u); setPage("radar"); }} onBack={() => setPage("landing")} />;
  // Radar requires auth
  if (page === "radar" || page === "auth") return <Radar onBack={() => setPage("landing")} user={user} onLogout={handleLogout} />;
  return <Landing onOpenRadar={() => setPage(user ? "radar" : "auth")} user={user} onLogout={handleLogout} />;
}
