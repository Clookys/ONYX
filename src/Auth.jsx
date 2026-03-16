import { useState } from "react";
import { supabase } from "./supabase.js";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    setLoading(true); setError(null); setSuccess(null);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setSuccess("Compte créé ! Vérifiez vos emails pour confirmer.");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onAuth(data.user);
    }
    setLoading(false);
  };

  const S = { input: { width:"100%", padding:"12px 14px", boxSizing:"border-box", background:"rgba(255,255,255,0.02)", border:"1px solid #ffffff08", borderRadius:8, color:"#fff", fontSize:13, outline:"none", fontFamily:"'JetBrains Mono',monospace" } };

  return (
    <div style={{ minHeight:"100vh", background:"#050508", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Outfit',sans-serif", color:"#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{ width:380, maxWidth:"90vw", background:"#0b0b18", border:"1px solid #ffffff08", borderRadius:20, position:"relative", overflow:"hidden" }}>
        <div style={{ height:3, background:"linear-gradient(90deg, #00f0ff, #b026ff)" }}/>
        <div style={{ padding:"40px 32px 36px" }}>
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ width:48, height:48, borderRadius:12, margin:"0 auto 12px", background:"linear-gradient(135deg, #00f0ff, #b026ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, fontFamily:"'Orbitron',sans-serif", boxShadow:"0 0 30px rgba(0,240,255,0.3)" }}>O</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:22, fontWeight:800, letterSpacing:8, background:"linear-gradient(90deg, #00f0ff, #b026ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>ONYX</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:3, color:"#ffffff20", marginTop:4 }}>INTELLIGENCE SUITE</div>
          </div>
          {/* Tabs */}
          <div style={{ display:"flex", marginBottom:24, borderBottom:"1px solid #ffffff08" }}>
            {[{id:"login",l:"Connexion"},{id:"signup",l:"Inscription"}].map(t=>(
              <button key={t.id} type="button" onClick={()=>{setMode(t.id);setError(null);setSuccess(null);}} style={{ flex:1, padding:"10px 0", border:"none", borderBottom:`2px solid ${mode===t.id?"#00f0ff":"transparent"}`, background:"transparent", color:mode===t.id?"#00f0ff":"#ffffff25", fontSize:12, letterSpacing:2, cursor:"pointer", fontFamily:"'JetBrains Mono',monospace" }}>{t.l}</button>
            ))}
          </div>
          {/* Fields */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:"#ffffff20", fontFamily:"'JetBrains Mono',monospace", marginBottom:6 }}>EMAIL</div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com" style={S.input} onFocus={e=>{e.target.style.borderColor="#00f0ff33";}} onBlur={e=>{e.target.style.borderColor="#ffffff08";}}/>
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:"#ffffff20", fontFamily:"'JetBrains Mono',monospace", marginBottom:6 }}>MOT DE PASSE</div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={S.input} onKeyDown={e=>{if(e.key==="Enter")handleSubmit();}} onFocus={e=>{e.target.style.borderColor="#00f0ff33";}} onBlur={e=>{e.target.style.borderColor="#ffffff08";}}/>
          </div>
          {error && <div style={{ padding:"10px 14px", borderRadius:8, marginBottom:14, background:"rgba(255,0,60,0.06)", border:"1px solid #ff003c15", fontSize:11, color:"#ff003c", fontFamily:"'JetBrains Mono',monospace" }}>{error}</div>}
          {success && <div style={{ padding:"10px 14px", borderRadius:8, marginBottom:14, background:"rgba(0,255,135,0.06)", border:"1px solid #00ff8715", fontSize:11, color:"#00ff87", fontFamily:"'JetBrains Mono',monospace" }}>{success}</div>}
          <button type="button" onClick={handleSubmit} disabled={loading||!email||!password} style={{ width:"100%", padding:14, borderRadius:10, border:"none", background:loading?"#ffffff08":"linear-gradient(135deg, #00f0ff, #b026ff)", color:"#fff", fontSize:13, fontWeight:700, letterSpacing:3, cursor:loading?"wait":"pointer", fontFamily:"'Orbitron',sans-serif", textTransform:"uppercase", boxShadow:loading?"none":"0 0 30px rgba(0,240,255,0.2)", opacity:(!email||!password)?0.4:1 }}>
            {loading?"...":mode==="login"?"SE CONNECTER":"CRÉER MON COMPTE"}
          </button>
          <div style={{ textAlign:"center", marginTop:24, fontSize:10, color:"#ffffff12", fontFamily:"'JetBrains Mono',monospace" }}>
            {mode==="login"?"Pas encore de compte ? ":"Déjà un compte ? "}
            <button type="button" onClick={()=>{setMode(mode==="login"?"signup":"login");setError(null);setSuccess(null);}} style={{ background:"none", border:"none", color:"#00f0ff44", cursor:"pointer", fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>{mode==="login"?"S'inscrire":"Se connecter"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
