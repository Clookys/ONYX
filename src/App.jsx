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

  if (page === "landing") return <Landing onStart={() => setPage(user ? "radar" : "auth")} onDemo={() => setPage("demo")} user={user} onLogout={handleLogout} />;
  if (page === "auth") return <Auth onAuth={(u) => { setUser(u); setPage("radar"); }} onBack={() => setPage("landing")} />;
  if (page === "demo") return <Radar onBack={() => setPage("landing")} isDemo={true} />;
  if (page === "radar") return <Radar onBack={() => setPage("landing")} user={user} onLogout={handleLogout} />;
  return null;
}
