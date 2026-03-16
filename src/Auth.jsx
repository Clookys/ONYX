import { useState } from "react";
import { supabase } from "./supabase.js";

export default function Auth({ onAuth, onBack }) {
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
      else setSuccess("Compte créé ! Vérifiez vos emails.");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onAuth(data.user);
    }
    setLoading(false);
  };

  const inp = { width:"100%", padding:"11px 14px", boxSizing:"border-box", background:"#252525", border:"1px solid #333", borderRadius:8, color:"#e8e8e8", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.2s" };

  return (
    <div style={{ minHeight:"100vh", background:"#141414", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", color:"#e8e8e8" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
      <div style={{ width:380, maxWidth:"90vw", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:16, position:"relative" }}>
        <div style={{ height:2, background:"linear-gradient(90deg, #6d9fff, #a78bfa)", borderRadius:"16px 16px 0 0", opacity:0.6 }}/>
        <div style={{ padding:"36px 32px 32px" }}>
          {onBack && <button type="button" onClick={onBack} style={{ background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:13, marginBottom:16, padding:0, fontFamily:"'DM Sans',sans-serif" }}>← Retour</button>}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ width:40, height:40, borderRadius:10, margin:"0 auto 10px", background:"linear-gradient(135deg, #6d9fff, #a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#fff" }}>O</div>
            <div style={{ fontSize:22, fontWeight:700, letterSpacing:2, color:"#e8e8e8" }}>ONYX</div>
            <div style={{ fontSize:11, color:"#555", marginTop:4 }}>Intelligence Suite</div>
          </div>
          <div style={{ display:"flex", marginBottom:20, gap:4 }}>
            {[{id:"login",l:"Connexion"},{id:"signup",l:"Inscription"}].map(t=>(
              <button key={t.id} type="button" onClick={()=>{setMode(t.id);setError(null);setSuccess(null);}} style={{ flex:1, padding:"9px 0", borderRadius:6, border:`1px solid ${mode===t.id?"#444":"#2a2a2a"}`, background:mode===t.id?"#252525":"transparent", color:mode===t.id?"#e8e8e8":"#555", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>{t.l}</button>
            ))}
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#666", marginBottom:5, fontWeight:500 }}>Email</div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com" style={inp} onFocus={e=>{e.target.style.borderColor="#6d9fff55";}} onBlur={e=>{e.target.style.borderColor="#333";}}/>
          </div>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11, color:"#666", marginBottom:5, fontWeight:500 }}>Mot de passe</div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp} onKeyDown={e=>{if(e.key==="Enter")handleSubmit();}} onFocus={e=>{e.target.style.borderColor="#6d9fff55";}} onBlur={e=>{e.target.style.borderColor="#333";}}/>
          </div>
          {error && <div style={{ padding:"10px 12px", borderRadius:6, marginBottom:12, background:"#2a1a1a", border:"1px solid #3a2020", fontSize:12, color:"#f87171" }}>{error}</div>}
          {success && <div style={{ padding:"10px 12px", borderRadius:6, marginBottom:12, background:"#1a2a1a", border:"1px solid #203a20", fontSize:12, color:"#34d399" }}>{success}</div>}
          <button type="button" onClick={handleSubmit} disabled={loading||!email||!password} style={{ width:"100%", padding:12, borderRadius:8, border:"none", background:loading?"#333":"linear-gradient(135deg, #6d9fff, #a78bfa)", color:"#fff", fontSize:13, fontWeight:600, cursor:loading?"wait":"pointer", fontFamily:"'DM Sans',sans-serif", opacity:(!email||!password)?0.4:1, transition:"opacity 0.2s" }}>
            {loading?"...":mode==="login"?"Se connecter":"Créer mon compte"}
          </button>
        </div>
      </div>
    </div>
  );
}
