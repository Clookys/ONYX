import { useState, useEffect, useRef } from "react";

const MODULES = [
  {
    id: "radar",
    name: "RADAR",
    tagline: "Collecte & Scraping",
    description: "Surveillez automatiquement des centaines de sources web. ONYX Radar scrape, collecte et centralise toute l'information pertinente pour votre organisation — en temps réel.",
    features: ["Scraping automatique multi-sources", "Flux RSS, sites web, réseaux sociaux", "Détection de nouveaux contenus en temps réel", "Catégorisation intelligente", "Gestion des doublons"],
    icon: "◎",
    color: "#00f0ff",
    gradient: "linear-gradient(135deg, #00f0ff, #0080ff)",
  },
  {
    id: "pulse",
    name: "PULSE",
    tagline: "Sentiment & Tendances",
    description: "Comprenez ce qui se dit et ce qui se prépare. ONYX Pulse analyse le sentiment, détecte les signaux faibles et vous alerte avant tout le monde.",
    features: ["Analyse de sentiment par IA", "Détection de tendances émergentes", "Alertes intelligentes en temps réel", "Suivi de réputation", "Cartographie des opinions"],
    icon: "◈",
    color: "#b026ff",
    gradient: "linear-gradient(135deg, #b026ff, #ff003c)",
  },
  {
    id: "board",
    name: "BOARD",
    tagline: "Tableaux de bord",
    description: "Visualisez tout d'un coup d'œil. ONYX Board transforme vos données de veille en dashboards interactifs, classements et indicateurs actionnables.",
    features: ["Dashboards personnalisables", "Classements et scoring", "Visualisations temps réel", "Filtres multi-dimensions", "Widgets modulaires"],
    icon: "◇",
    color: "#ffb800",
    gradient: "linear-gradient(135deg, #ffb800, #ff6b00)",
  },
  {
    id: "brief",
    name: "BRIEF",
    tagline: "Exports & Rapports",
    description: "Transformez votre veille en livrables professionnels. ONYX Brief génère automatiquement des présentations PowerPoint et des rapports Word prêts à partager.",
    features: ["Export PowerPoint automatique", "Rapports Word structurés", "Templates personnalisables", "Synthèses IA", "Planification d'envois"],
    icon: "◆",
    color: "#00ff87",
    gradient: "linear-gradient(135deg, #00ff87, #00c9ff)",
  },
];

const USECASES = [
  { title: "Veille Concurrentielle", desc: "Suivez vos concurrents en temps réel", icon: "⚔", color: "#ff003c" },
  { title: "Veille Réglementaire", desc: "Ne manquez plus aucun décret ou directive", icon: "⚖", color: "#b026ff" },
  { title: "Veille Politique", desc: "Anticipez les décisions qui impactent votre secteur", icon: "🏛", color: "#ffb800" },
  { title: "Veille Médias & Réputation", desc: "Contrôlez votre image en temps réel", icon: "📡", color: "#00f0ff" },
  { title: "Veille Technologique", desc: "Restez à la pointe de l'innovation", icon: "⚡", color: "#00ff87" },
  { title: "Intelligence Économique", desc: "Prenez des décisions basées sur les données", icon: "◈", color: "#0080ff" },
];

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const num = parseInt(target);
    if (isNaN(num)) return;
    let current = 0;
    const step = Math.max(1, Math.floor(num / 50));
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { setCount(num); clearInterval(timer); }
      else setCount(current);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function ConnectionLines() {
  return (
    <svg width="100%" height="120" viewBox="0 0 800 120" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.6 }}>
      <defs>
        <linearGradient id="lineGrad1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="50%" stopColor="#b026ff" />
          <stop offset="100%" stopColor="#ffb800" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Central hub */}
      <circle cx="400" cy="60" r="16" fill="none" stroke="url(#lineGrad1)" strokeWidth="2" filter="url(#glow)">
        <animate attributeName="r" values="14;18;14" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="400" cy="60" r="5" fill="#fff">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Lines to modules */}
      {[100, 267, 533, 700].map((x, i) => {
        const colors = ["#00f0ff", "#b026ff", "#ffb800", "#00ff87"];
        return (
          <g key={i}>
            <line x1="400" y1="60" x2={x} y2="60" stroke={colors[i]} strokeWidth="1.5" strokeDasharray="6 4" filter="url(#glow)">
              <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
            </line>
            <circle cx={x} cy="60" r="8" fill="none" stroke={colors[i]} strokeWidth="1.5" filter="url(#glow)" />
            <circle cx={x} cy="60" r="3" fill={colors[i]}>
              <animate attributeName="opacity" values="1;0.4;1" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
      {/* Flowing particles */}
      {[0, 1, 2, 3].map(i => {
        const colors = ["#00f0ff", "#b026ff", "#ffb800", "#00ff87"];
        const targets = [100, 267, 533, 700];
        return (
          <circle key={`p${i}`} r="2" fill={colors[i]}>
            <animate attributeName="cx" values={`400;${targets[i]};400`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="cy" values="60;60;60" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        );
      })}
    </svg>
  );
}

export default function OnyxProductPage() {
  const [activeModule, setActiveModule] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const sectionStyle = {
    padding: "100px 40px",
    maxWidth: 1200,
    margin: "0 auto",
    position: "relative",
  };

  return (
    <div style={{
      background: "#050508",
      color: "#fff",
      fontFamily: "'Outfit', sans-serif",
      minHeight: "100vh",
      overflowX: "hidden",
    }}>
      {/* Background effects */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: -300, left: "50%", transform: "translateX(-50%)",
          width: 1000, height: 1000, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 60%)",
        }} />
        <div style={{
          position: "absolute", bottom: -400, right: -200,
          width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(176,38,255,0.05) 0%, transparent 60%)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "linear-gradient(rgba(0,240,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.015) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
      </div>

      {/* ===================== HERO ===================== */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "120px 40px 80px" }}>
        {/* Logo mark */}
        <div style={{
          width: 80, height: 80, margin: "0 auto 32px",
          background: "linear-gradient(135deg, #00f0ff, #b026ff)",
          borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, fontWeight: 900, fontFamily: "'Orbitron', sans-serif",
          boxShadow: "0 0 60px rgba(0,240,255,0.3), 0 0 120px rgba(176,38,255,0.15)",
          animation: "float 6s ease-in-out infinite",
        }}>
          O
        </div>

        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(48px, 8vw, 86px)",
          fontWeight: 900,
          letterSpacing: 12,
          marginBottom: 8,
          background: "linear-gradient(135deg, #00f0ff 0%, #b026ff 50%, #ff003c 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.1,
        }}>
          ONYX
        </h1>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          letterSpacing: 6,
          color: "#ffffff55",
          marginBottom: 40,
          textTransform: "uppercase",
        }}>
          Intelligence Suite
        </p>

        <h2 style={{
          fontSize: "clamp(22px, 3.5vw, 38px)",
          fontWeight: 300,
          color: "#ffffffcc",
          maxWidth: 700,
          margin: "0 auto 24px",
          lineHeight: 1.4,
        }}>
          Toute votre veille.<br />
          <span style={{ fontWeight: 700, color: "#fff" }}>Une seule plateforme.</span>
        </h2>

        <p style={{
          fontSize: 18,
          color: "#ffffff66",
          maxWidth: 600,
          margin: "0 auto 48px",
          lineHeight: 1.7,
        }}>
          ONYX réunit collecte, analyse, visualisation et reporting dans un écosystème unifié. Fini les 10 outils séparés — voyez tout, ne manquez rien.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{
            padding: "16px 40px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #00f0ff, #0080ff)",
            color: "#050508",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 2,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            boxShadow: "0 0 40px rgba(0,240,255,0.3)",
            transition: "all 0.3s",
            textTransform: "uppercase",
          }}>
            Démarrer gratuitement
          </button>
          <button style={{
            padding: "16px 40px",
            borderRadius: 12,
            border: "1px solid #ffffff22",
            background: "rgba(255,255,255,0.03)",
            color: "#ffffffaa",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: 1,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            transition: "all 0.3s",
          }}>
            Voir la démo
          </button>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 60,
          marginTop: 80,
          flexWrap: "wrap",
        }}>
          {[
            { value: "4", suffix: "", label: "Modules intégrés" },
            { value: "100", suffix: "+", label: "Types de sources" },
            { value: "360", suffix: "°", label: "Couverture de veille" },
            { value: "1", suffix: "", label: "Plateforme unifiée" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 42,
                fontWeight: 800,
                color: ["#00f0ff", "#b026ff", "#ffb800", "#00ff87"][i],
                textShadow: `0 0 30px ${["#00f0ff", "#b026ff", "#ffb800", "#00ff87"][i]}44`,
              }}>
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 13, color: "#ffffff55", marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== WHAT IS ONYX ===================== */}
      <section style={{ ...sectionStyle, textAlign: "center" }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: 4,
          color: "#00f0ff88",
          marginBottom: 16,
          textTransform: "uppercase",
        }}>
          ◈ Le problème
        </div>
        <h2 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: 700,
          marginBottom: 32,
          letterSpacing: 3,
        }}>
          Votre veille est fragmentée
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 40,
          alignItems: "center",
          maxWidth: 900,
          margin: "0 auto",
        }}>
          <div style={{
            padding: 32,
            borderRadius: 16,
            background: "rgba(255,0,60,0.05)",
            border: "1px solid rgba(255,0,60,0.15)",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#ff003c", marginBottom: 16 }}>Avant ONYX</div>
            <div style={{ fontSize: 14, color: "#ffffff77", lineHeight: 2 }}>
              Google Alerts + Feedly + Mention + Excel + PowerPoint + Email + ... 😵
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 32, fontWeight: 700, color: "#ff003c", marginTop: 16,
            }}>10+ outils</div>
          </div>

          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 28,
            color: "#ffffff33",
          }}>→</div>

          <div style={{
            padding: 32,
            borderRadius: 16,
            background: "rgba(0,255,135,0.05)",
            border: "1px solid rgba(0,255,135,0.15)",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#00ff87", marginBottom: 16 }}>Avec ONYX</div>
            <div style={{ fontSize: 14, color: "#ffffff77", lineHeight: 2 }}>
              Tout est connecté, tout est centralisé, tout est automatisé.
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 32, fontWeight: 700, color: "#00ff87", marginTop: 16,
            }}>1 plateforme</div>
          </div>
        </div>
      </section>

      {/* ===================== MODULES ===================== */}
      <section style={{ ...sectionStyle }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, letterSpacing: 4, color: "#b026ff88",
            marginBottom: 16, textTransform: "uppercase",
          }}>
            ◈ L'écosystème
          </div>
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 700, letterSpacing: 3, marginBottom: 16,
          }}>
            4 modules. 1 mission.
          </h2>
          <p style={{ color: "#ffffff55", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
            Chaque module est puissant seul. Ensemble, ils sont inarrêtables.
          </p>
        </div>

        {/* Connection visualization */}
        <div style={{ marginBottom: 40 }}>
          <ConnectionLines />
          <div style={{
            display: "flex", justifyContent: "space-around", marginTop: -8,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2,
          }}>
            {MODULES.map(m => (
              <span key={m.id} style={{ color: m.color }}>{m.name}</span>
            ))}
          </div>
          <div style={{
            textAlign: "center", marginTop: 8,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, color: "#ffffff33", letterSpacing: 2,
          }}>
            INTERCONNEXION TOTALE
          </div>
        </div>

        {/* Module cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {MODULES.map((mod, i) => (
            <div
              key={mod.id}
              onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
              style={{
                padding: 32,
                borderRadius: 16,
                background: activeModule === mod.id ? `rgba(${mod.id === 'radar' ? '0,240,255' : mod.id === 'pulse' ? '176,38,255' : mod.id === 'board' ? '255,184,0' : '0,255,135'},0.06)` : "rgba(255,255,255,0.02)",
                border: `1px solid ${activeModule === mod.id ? mod.color + '44' : '#ffffff0a'}`,
                cursor: "pointer",
                transition: "all 0.4s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top glow line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: activeModule === mod.id ? mod.gradient : "transparent",
                transition: "all 0.4s",
              }} />

              <div style={{
                fontSize: 32, marginBottom: 16,
                filter: `drop-shadow(0 0 10px ${mod.color}66)`,
              }}>{mod.icon}</div>

              <div style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 18, fontWeight: 700,
                letterSpacing: 3, marginBottom: 4,
              }}>
                <span style={{ color: "#ffffff44" }}>ONYX</span>{" "}
                <span style={{ color: mod.color }}>{mod.name}</span>
              </div>

              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, letterSpacing: 2,
                color: "#ffffff44", marginBottom: 16,
                textTransform: "uppercase",
              }}>{mod.tagline}</div>

              <p style={{
                fontSize: 14, color: "#ffffff88",
                lineHeight: 1.7, marginBottom: 16,
              }}>{mod.description}</p>

              {/* Expandable features */}
              <div style={{
                maxHeight: activeModule === mod.id ? 300 : 0,
                overflow: "hidden",
                transition: "max-height 0.5s ease",
              }}>
                <div style={{
                  borderTop: `1px solid ${mod.color}22`,
                  paddingTop: 16, marginTop: 8,
                }}>
                  {mod.features.map((f, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      marginBottom: 10,
                    }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: mod.color,
                        boxShadow: `0 0 8px ${mod.color}`,
                      }} />
                      <span style={{ fontSize: 13, color: "#ffffffaa" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, color: mod.color, letterSpacing: 1,
                opacity: activeModule === mod.id ? 0 : 0.6,
                transition: "opacity 0.3s",
              }}>
                Cliquez pour en savoir plus →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== INTERCONNECTION ===================== */}
      <section style={{
        ...sectionStyle,
        textAlign: "center",
        background: "linear-gradient(180deg, transparent, rgba(0,240,255,0.02), transparent)",
        borderTop: "1px solid #ffffff06",
        borderBottom: "1px solid #ffffff06",
        maxWidth: "100%",
        padding: "100px 40px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, letterSpacing: 4, color: "#ffb80088",
            marginBottom: 16, textTransform: "uppercase",
          }}>
            ◈ La force d'ONYX
          </div>
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 700, letterSpacing: 3, marginBottom: 24,
          }}>
            Tout est connecté
          </h2>
          <p style={{
            fontSize: 18, color: "#ffffff66", maxWidth: 650,
            margin: "0 auto 60px", lineHeight: 1.7,
          }}>
            Chaque module alimente les autres. Radar collecte → Pulse analyse → Board visualise → Brief exporte. Un flux continu, sans friction.
          </p>

          {/* Pipeline visualization */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            flexWrap: "wrap",
          }}>
            {MODULES.map((mod, i) => (
              <div key={mod.id} style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  padding: "20px 28px",
                  borderRadius: 12,
                  border: `1px solid ${mod.color}33`,
                  background: `${mod.color}08`,
                  textAlign: "center",
                  minWidth: 140,
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{mod.icon}</div>
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 13, fontWeight: 700,
                    color: mod.color, letterSpacing: 2,
                  }}>{mod.name}</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9, color: "#ffffff44",
                    letterSpacing: 1, marginTop: 4,
                  }}>{mod.tagline}</div>
                </div>
                {i < MODULES.length - 1 && (
                  <div style={{
                    width: 50,
                    height: 2,
                    background: `linear-gradient(90deg, ${mod.color}, ${MODULES[i + 1].color})`,
                    position: "relative",
                    margin: "0 -1px",
                  }}>
                    <div style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "#ffffff44",
                      fontSize: 14,
                    }}>→</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 40,
            display: "flex",
            gap: 24,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            {[
              { text: "Données partagées entre modules", icon: "🔗" },
              { text: "Zéro configuration, zéro friction", icon: "⚡" },
              { text: "Un seul abonnement pour tout", icon: "💎" },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "12px 24px",
                borderRadius: 100,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #ffffff0a",
                fontSize: 13,
                color: "#ffffffaa",
              }}>
                {item.icon} {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== USE CASES ===================== */}
      <section style={{ ...sectionStyle }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, letterSpacing: 4, color: "#00ff8788",
            marginBottom: 16, textTransform: "uppercase",
          }}>
            ◈ Cas d'usage
          </div>
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 700, letterSpacing: 3,
          }}>
            Pour chaque type de veille
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}>
          {USECASES.map((uc, i) => (
            <div key={i} style={{
              padding: "28px 24px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid #ffffff08",
              textAlign: "center",
              transition: "all 0.3s",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = uc.color + "33";
              e.currentTarget.style.background = uc.color + "08";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#ffffff08";
              e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{uc.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: "#ffffffdd" }}>{uc.title}</div>
              <div style={{ fontSize: 13, color: "#ffffff55", lineHeight: 1.5 }}>{uc.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section style={{
        padding: "100px 40px 120px",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: 60,
          borderRadius: 24,
          background: "linear-gradient(135deg, rgba(0,240,255,0.06), rgba(176,38,255,0.06))",
          border: "1px solid rgba(0,240,255,0.12)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, #00f0ff, #b026ff, #ff003c)",
          }} />
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700, letterSpacing: 3, marginBottom: 16,
          }}>
            Prêt à tout voir ?
          </h2>
          <p style={{
            fontSize: 16, color: "#ffffff66", marginBottom: 36,
            maxWidth: 450, margin: "0 auto 36px", lineHeight: 1.7,
          }}>
            Rejoignez les organisations qui ne manquent plus rien. Commencez avec ONYX Radar — c'est gratuit.
          </p>
          <button style={{
            padding: "18px 48px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #00f0ff, #b026ff)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 2,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            boxShadow: "0 0 50px rgba(0,240,255,0.25), 0 0 100px rgba(176,38,255,0.15)",
            transition: "all 0.3s",
            textTransform: "uppercase",
          }}>
            Lancer ONYX →
          </button>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer style={{
        padding: "40px",
        borderTop: "1px solid #ffffff08",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 16, fontWeight: 700, letterSpacing: 4,
          marginBottom: 12,
          background: "linear-gradient(90deg, #00f0ff, #b026ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>ONYX</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, color: "#ffffff33",
          letterSpacing: 2,
        }}>
          INTELLIGENCE SUITE — RADAR · PULSE · BOARD · BRIEF
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, color: "#ffffff22",
          letterSpacing: 1, marginTop: 16,
        }}>
          © 2026 ONYX / Clookys — See everything. Miss nothing.
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050508; }
        ::-webkit-scrollbar-thumb { background: #ffffff15; border-radius: 3px; }
      `}</style>
    </div>
  );
}
