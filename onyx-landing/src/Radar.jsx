import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  { id: "all", label: "TOUT", color: "#00f0ff" },
  { id: "politique", label: "POLITIQUE", color: "#ff003c" },
  { id: "reglementaire", label: "RÉGLEMENTAIRE", color: "#b026ff" },
  { id: "concurrence", label: "CONCURRENCE", color: "#ffb800" },
  { id: "sentiment", label: "SENTIMENT", color: "#00ff87" },
  { id: "tech", label: "TECHNOLOGIE", color: "#0080ff" },
];

const MOCK_SOURCES = [
  { id: 1, name: "Le Monde", url: "lemonde.fr", status: "active", category: "politique", lastScan: "il y a 3 min", articles: 847, trend: "+12%" },
  { id: 2, name: "EUR-Lex", url: "eur-lex.europa.eu", status: "active", category: "reglementaire", lastScan: "il y a 8 min", articles: 234, trend: "+5%" },
  { id: 3, name: "TechCrunch", url: "techcrunch.com", status: "active", category: "tech", lastScan: "il y a 1 min", articles: 1203, trend: "+23%" },
  { id: 4, name: "Reuters", url: "reuters.com", status: "active", category: "concurrence", lastScan: "il y a 5 min", articles: 2104, trend: "+8%" },
  { id: 5, name: "Twitter/X Trends", url: "x.com", status: "scanning", category: "sentiment", lastScan: "en cours...", articles: 15420, trend: "+45%" },
  { id: 6, name: "Journal Officiel", url: "legifrance.gouv.fr", status: "active", category: "reglementaire", lastScan: "il y a 15 min", articles: 156, trend: "+2%" },
  { id: 7, name: "Bloomberg", url: "bloomberg.com", status: "error", category: "concurrence", lastScan: "échec", articles: 0, trend: "—" },
  { id: 8, name: "Assemblée Nationale", url: "assemblee-nationale.fr", status: "active", category: "politique", lastScan: "il y a 22 min", articles: 89, trend: "+1%" },
];

const MOCK_FEED = [
  { id: 1, source: "Le Monde", title: "Nouvelle directive européenne sur l'IA adoptée en commission", category: "reglementaire", time: "14:32", sentiment: "neutre", priority: "haute" },
  { id: 2, source: "Reuters", title: "Concurrent X annonce une levée de fonds de 200M€", category: "concurrence", time: "14:28", sentiment: "négatif", priority: "critique" },
  { id: 3, source: "TechCrunch", title: "Les tendances SaaS B2B pour 2026 : l'IA au centre", category: "tech", time: "14:15", sentiment: "positif", priority: "moyenne" },
  { id: 4, source: "Twitter/X", title: "Pic de mentions négatives détecté sur votre marque", category: "sentiment", time: "14:10", sentiment: "négatif", priority: "critique" },
  { id: 5, source: "Journal Officiel", title: "Décret n°2026-234 relatif à la protection des données", category: "reglementaire", time: "13:55", sentiment: "neutre", priority: "haute" },
  { id: 6, source: "Le Monde", title: "Remaniement ministériel : nouveau ministre du Numérique", category: "politique", time: "13:40", sentiment: "neutre", priority: "haute" },
  { id: 7, source: "Bloomberg", title: "Marchés européens en hausse de 2.3% après annonces BCE", category: "concurrence", time: "13:22", sentiment: "positif", priority: "moyenne" },
];

const STATS = [
  { label: "SOURCES ACTIVES", value: "0", sub: "/0", icon: "◉" },
  { label: "ARTICLES CAPTÉS", value: "0", sub: "aujourd'hui", icon: "⬡" },
  { label: "ALERTES", value: "0", sub: "non lues", icon: "⚡" },
  { label: "SCRAPING", value: "0", sub: "uptime", icon: "◈" },
];

function GlitchText({ text, className = "" }) {
  return (
    <span className={className} style={{
      position: "relative",
      display: "inline-block",
    }}>
      {text}
    </span>
  );
}

function PulsingDot({ color = "#00ff87", size = 8 }) {
  const [opacity, setOpacity] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(prev => prev === 1 ? 0.3 : 1);
    }, 800);
    return () => clearInterval(interval);
  }, []);
  return (
    <span style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: color,
      opacity,
      transition: "opacity 0.8s ease",
      boxShadow: `0 0 ${size}px ${color}`,
    }} />
  );
}

function ScanLine() {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPos(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: "none",
      overflow: "hidden",
      borderRadius: 12,
    }}>
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: `${pos}%`,
        height: 2,
        background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.15), transparent)",
      }} />
    </div>
  );
}

function NeonBorder({ color = "#00f0ff", children, style = {} }) {
  return (
    <div style={{
      border: `1px solid ${color}22`,
      borderRadius: 12,
      background: "rgba(10,10,20,0.8)",
      backdropFilter: "blur(20px)",
      position: "relative",
      overflow: "hidden",
      ...style,
    }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${color}66, transparent)`,
      }} />
      {children}
    </div>
  );
}

function StatCard({ stat, index }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(stat.value.replace(/,/g, ""));
  
  useEffect(() => {
    if (isNaN(numericValue)) { setCount(-1); return; }
    const duration = 1500;
    const steps = 40;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const colors = ["#00f0ff", "#ff003c", "#b026ff", "#00ff87"];
  const c = colors[index % colors.length];

  return (
    <NeonBorder color={c} style={{ padding: "20px 24px", flex: 1, minWidth: 180 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#ffffff55", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
        {stat.icon} {stat.label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color: c, fontFamily: "'Orbitron', sans-serif", textShadow: `0 0 30px ${c}44` }}>
        {count === -1 ? stat.value : count.toLocaleString()}
        <span style={{ fontSize: 16, color: "#ffffff44", marginLeft: 4 }}>{stat.sub}</span>
      </div>
    </NeonBorder>
  );
}

function SourceRow({ source }) {
  const cat = CATEGORIES.find(c => c.id === source.category);
  const statusColors = { active: "#00ff87", scanning: "#00f0ff", error: "#ff003c" };
  const statusLabels = { active: "ACTIF", scanning: "SCAN...", error: "ERREUR" };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "14px 20px",
      borderBottom: "1px solid #ffffff08",
      transition: "background 0.2s",
      cursor: "pointer",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,240,255,0.04)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div style={{ width: 36, display: "flex", justifyContent: "center" }}>
        <PulsingDot color={statusColors[source.status]} size={source.status === "scanning" ? 10 : 8} />
      </div>
      <div style={{ flex: 2, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffffdd" }}>{source.name}</div>
        <div style={{ fontSize: 11, color: "#ffffff44", fontFamily: "'JetBrains Mono', monospace" }}>{source.url}</div>
      </div>
      <div style={{ width: 120 }}>
        <span style={{
          fontSize: 10,
          letterSpacing: 2,
          padding: "4px 10px",
          borderRadius: 4,
          background: `${cat?.color}15`,
          color: cat?.color,
          border: `1px solid ${cat?.color}33`,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {cat?.label}
        </span>
      </div>
      <div style={{ width: 100, fontSize: 12, color: "#ffffff55", fontFamily: "'JetBrains Mono', monospace" }}>
        {statusLabels[source.status]}
      </div>
      <div style={{ width: 100, fontSize: 12, color: "#ffffff55", textAlign: "right" }}>
        {source.lastScan}
      </div>
      <div style={{ width: 80, fontSize: 14, color: "#ffffffcc", textAlign: "right", fontWeight: 600 }}>
        {source.articles.toLocaleString()}
      </div>
      <div style={{ width: 60, fontSize: 12, textAlign: "right", color: source.trend.includes("+") ? "#00ff87" : "#ffffff44", fontFamily: "'JetBrains Mono', monospace" }}>
        {source.trend}
      </div>
    </div>
  );
}

function FeedItem({ item }) {
  const cat = CATEGORIES.find(c => c.id === item.category);
  const priorityColors = { critique: "#ff003c", haute: "#ffb800", moyenne: "#00f0ff" };
  const sentimentIcons = { positif: "▲", négatif: "▼", neutre: "◆" };
  const sentimentColors = { positif: "#00ff87", négatif: "#ff003c", neutre: "#ffffff44" };

  return (
    <div style={{
      padding: "16px 20px",
      borderBottom: "1px solid #ffffff08",
      borderLeft: `3px solid ${priorityColors[item.priority]}`,
      cursor: "pointer",
      transition: "background 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,240,255,0.04)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: cat?.color, letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace" }}>
            {item.source.toUpperCase()}
          </span>
          <span style={{ fontSize: 10, color: "#ffffff33" }}>|</span>
          <span style={{
            fontSize: 9,
            padding: "2px 8px",
            borderRadius: 3,
            background: `${priorityColors[item.priority]}18`,
            color: priorityColors[item.priority],
            letterSpacing: 1,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {item.priority.toUpperCase()}
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#ffffff33", fontFamily: "'JetBrains Mono', monospace" }}>{item.time}</span>
      </div>
      <div style={{ fontSize: 14, color: "#ffffffcc", lineHeight: 1.5, marginBottom: 6 }}>
        {item.title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: sentimentColors[item.sentiment], fontSize: 10 }}>{sentimentIcons[item.sentiment]}</span>
        <span style={{ fontSize: 10, color: sentimentColors[item.sentiment], fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
          {item.sentiment.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function AddSourceModal({ onClose }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("politique");

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }} onClick={onClose}>
      <NeonBorder color="#00f0ff" style={{ padding: 40, width: 480, maxWidth: "90vw" }}>
        <div onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#00f0ff", marginBottom: 24, fontFamily: "'JetBrains Mono', monospace" }}>
            ◈ NOUVELLE SOURCE
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff44", display: "block", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>NOM</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Financial Times"
              style={{
                width: "100%", padding: "12px 16px",
                background: "rgba(0,240,255,0.05)",
                border: "1px solid #00f0ff22",
                borderRadius: 8, color: "#fff",
                fontSize: 14, outline: "none",
                fontFamily: "'JetBrains Mono', monospace",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff44", display: "block", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>URL</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://ft.com"
              style={{
                width: "100%", padding: "12px 16px",
                background: "rgba(0,240,255,0.05)",
                border: "1px solid #00f0ff22",
                borderRadius: 8, color: "#fff",
                fontSize: 14, outline: "none",
                fontFamily: "'JetBrains Mono', monospace",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff44", display: "block", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>CATÉGORIE</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 6,
                    border: `1px solid ${category === cat.id ? cat.color : "#ffffff15"}`,
                    background: category === cat.id ? `${cat.color}18` : "transparent",
                    color: category === cat.id ? cat.color : "#ffffff55",
                    fontSize: 10,
                    letterSpacing: 2,
                    cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: "all 0.2s",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "14px",
                borderRadius: 8, border: "1px solid #ffffff15",
                background: "transparent", color: "#ffffff55",
                fontSize: 12, letterSpacing: 2, cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ANNULER
            </button>
            <button
              style={{
                flex: 2, padding: "14px",
                borderRadius: 8, border: "1px solid #00f0ff44",
                background: "linear-gradient(135deg, #00f0ff15, #00f0ff08)",
                color: "#00f0ff",
                fontSize: 12, letterSpacing: 2, cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: "0 0 20px rgba(0,240,255,0.1)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px rgba(0,240,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(0,240,255,0.1)"}
            >
              ⚡ LANCER LE SCRAPING
            </button>
          </div>
        </div>
      </NeonBorder>
    </div>
  );
}

function MiniGraph() {
  const points = Array.from({ length: 24 }, (_, i) => ({
    x: i,
    y: 30 + Math.random() * 50 + (i > 18 ? 20 : 0),
  }));
  const max = Math.max(...points.map(p => p.y));
  const svgW = 280, svgH = 80;
  const path = points.map((p, i) => {
    const x = (p.x / 23) * svgW;
    const y = svgH - (p.y / max) * svgH;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  const areaPath = path + ` L${svgW},${svgH} L0,${svgH} Z`;

  return (
    <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="graphGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#graphGrad)" />
      <path d={path} fill="none" stroke="#00f0ff" strokeWidth="2" />
    </svg>
  );
}

export default function ONYXRadar({ onBack }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAddSource, setShowAddSource] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("sources");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&family=Exo+2:wght@300;400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredSources = activeCategory === "all" ? MOCK_SOURCES : MOCK_SOURCES.filter(s => s.category === activeCategory);
  const filteredFeed = activeCategory === "all" ? MOCK_FEED : MOCK_FEED.filter(f => f.category === activeCategory);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#06060e",
      color: "#fff",
      fontFamily: "'Exo 2', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: -200, right: -200,
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,240,255,0.06), transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: -200, left: -100,
        width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(176,38,255,0.05), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <header style={{
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #ffffff08",
        position: "relative",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "1px solid #ffffff15", borderRadius: 8, color: "#ffffff66", cursor: "pointer", padding: "6px 14px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, transition: "all 0.2s" }} onMouseEnter={e=>{e.target.style.borderColor="#00f0ff44";e.target.style.color="#00f0ff";}} onMouseLeave={e=>{e.target.style.borderColor="#ffffff15";e.target.style.color="#ffffff66";}}>← Accueil</button>}
          <div style={{
            width: 40, height: 40,
            background: "linear-gradient(135deg, #00f0ff, #b026ff)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900,
            fontFamily: "'Orbitron', sans-serif",
            boxShadow: "0 0 20px rgba(0,240,255,0.3)",
          }}>
            O
          </div>
          <div>
            <div style={{
              fontSize: 20, fontWeight: 800, letterSpacing: 6,
              fontFamily: "'Orbitron', sans-serif",
              background: "linear-gradient(90deg, #00f0ff, #b026ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              ONYX
            </div>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#00f0ff88", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
              RADAR MODULE
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{
            fontSize: 12, color: "#ffffff44",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 2,
          }}>
            {currentTime.toLocaleTimeString("fr-FR")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PulsingDot color="#00ff87" />
            <span style={{ fontSize: 10, color: "#00ff87", letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace" }}>
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ padding: "24px 40px", position: "relative", zIndex: 10 }}>
        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Activity graph */}
        <NeonBorder color="#00f0ff" style={{ padding: "16px 24px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 10, letterSpacing: 3, color: "#ffffff44", fontFamily: "'JetBrains Mono', monospace" }}>
              ◈ ACTIVITÉ DE COLLECTE — 24H
            </span>
            <span style={{ fontSize: 10, color: "#00f0ff88", fontFamily: "'JetBrains Mono', monospace" }}>
              2,847 articles captés
            </span>
          </div>
          <MiniGraph />
          <ScanLine />
        </NeonBorder>

        {/* Category filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 6,
                border: `1px solid ${activeCategory === cat.id ? cat.color : "#ffffff10"}`,
                background: activeCategory === cat.id ? `${cat.color}12` : "transparent",
                color: activeCategory === cat.id ? cat.color : "#ffffff44",
                fontSize: 10,
                letterSpacing: 2,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                transition: "all 0.3s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 0 }}>
          {["sources", "feed"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 28px",
                border: "1px solid #ffffff08",
                borderBottom: activeTab === tab ? "1px solid transparent" : "1px solid #ffffff08",
                borderRadius: "8px 8px 0 0",
                background: activeTab === tab ? "rgba(10,10,20,0.8)" : "transparent",
                color: activeTab === tab ? "#00f0ff" : "#ffffff33",
                fontSize: 11,
                letterSpacing: 2,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                transition: "all 0.2s",
              }}
            >
              {tab === "sources" ? "◉ SOURCES" : "⚡ FLUX EN DIRECT"}
            </button>
          ))}
          <div style={{ flex: 1, borderBottom: "1px solid #ffffff08" }} />
          <button
            onClick={() => setShowAddSource(true)}
            style={{
              padding: "10px 24px",
              borderRadius: "8px 8px 0 0",
              border: "1px solid #00f0ff33",
              borderBottom: "none",
              background: "linear-gradient(135deg, rgba(0,240,255,0.08), transparent)",
              color: "#00f0ff",
              fontSize: 11,
              letterSpacing: 2,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              boxShadow: "0 -2px 15px rgba(0,240,255,0.08)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 -2px 25px rgba(0,240,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 -2px 15px rgba(0,240,255,0.08)"}
          >
            + AJOUTER SOURCE
          </button>
        </div>

        {/* Content panel */}
        <NeonBorder color="#00f0ff" style={{ borderRadius: "0 0 12px 12px", borderTop: "none" }}>
          {activeTab === "sources" ? (
            <>
              <div style={{
                display: "flex",
                padding: "12px 20px",
                borderBottom: "1px solid #ffffff10",
                fontSize: 9,
                letterSpacing: 2,
                color: "#ffffff33",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                <div style={{ width: 36 }} />
                <div style={{ flex: 2 }}>SOURCE</div>
                <div style={{ width: 120 }}>CATÉGORIE</div>
                <div style={{ width: 100 }}>STATUT</div>
                <div style={{ width: 100, textAlign: "right" }}>DERNIER SCAN</div>
                <div style={{ width: 80, textAlign: "right" }}>ARTICLES</div>
                <div style={{ width: 60, textAlign: "right" }}>TREND</div>
              </div>
              {filteredSources.map(source => (
                <SourceRow key={source.id} source={source} />
              ))}
            </>
          ) : (
            filteredFeed.map(item => (
              <FeedItem key={item.id} item={item} />
            ))
          )}
        </NeonBorder>
      </main>

      {/* Footer */}
      <footer style={{
        padding: "16px 40px",
        borderTop: "1px solid #ffffff08",
        display: "flex",
        justifyContent: "space-between",
        fontSize: 10,
        color: "#ffffff22",
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: 2,
      }}>
        <span>ONYX RADAR v1.0.0-alpha</span>
        <span>SUITE ONYX — RADAR · PULSE · BOARD · BRIEF</span>
      </footer>

      {showAddSource && <AddSourceModal onClose={() => setShowAddSource(false)} />}
    </div>
  );
}
