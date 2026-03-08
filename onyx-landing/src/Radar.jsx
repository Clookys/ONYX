import { useCallback, useEffect, useMemo, useState } from "react";

const CATEGORIES = [
  { id: "all", label: "TOUT", color: "#00f0ff" },
  { id: "politique", label: "POLITIQUE", color: "#ff003c" },
  { id: "reglementaire", label: "REGLEMENTAIRE", color: "#b026ff" },
  { id: "concurrence", label: "CONCURRENCE", color: "#ffb800" },
  { id: "sentiment", label: "SENTIMENT", color: "#00ff87" },
  { id: "tech", label: "TECHNOLOGIE", color: "#0080ff" },
];

const STATUS_COLORS = {
  active: "#00ff87",
  error: "#ff003c",
  scanning: "#00f0ff",
};

function categoryMeta(categoryId) {
  return CATEGORIES.find((cat) => cat.id === categoryId) || CATEGORIES[0];
}

function relativeTime(dateStr) {
  if (!dateStr) return "jamais";
  const ts = new Date(dateStr).getTime();
  if (Number.isNaN(ts)) return "inconnu";
  const diffMin = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (diffMin < 1) return "a l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `il y a ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  return `il y a ${diffDays} j`;
}

function formatClock(value) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function statusLabel(source) {
  if (source.status === "error") return "ERREUR";
  if (source.status === "scanning") return "SCAN";
  return "ACTIF";
}

function NeonCard({ color, children, style = {} }) {
  return (
    <div
      style={{
        border: `1px solid ${color}30`,
        borderRadius: 12,
        background: "rgba(8,10,20,0.86)",
        boxShadow: `0 0 24px ${color}10`,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          height: 1,
          width: "100%",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
      {children}
    </div>
  );
}

function AddSourceModal({ onClose, onSubmit, loading, error }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("tech");

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit({ name, url, category });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        padding: 20,
      }}
    >
      <NeonCard color="#00f0ff" style={{ width: "min(560px, 100%)", padding: 26 }}>
        <form onClick={(event) => event.stopPropagation()} onSubmit={submit}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "#00f0ff",
              fontSize: 12,
              letterSpacing: 2,
              marginBottom: 14,
            }}
          >
            + AJOUTER UNE SOURCE
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nom de la source"
              required
              style={inputStyle}
            />
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="URL (ex: https://techcrunch.com/feed/)"
              required
              style={inputStyle}
            />
            <select value={category} onChange={(event) => setCategory(event.target.value)} style={inputStyle}>
              {CATEGORIES.filter((cat) => cat.id !== "all").map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div style={{ color: "#ff5f7a", marginTop: 12, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button type="button" onClick={onClose} style={secondaryButtonStyle}>
              Annuler
            </button>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? "Ajout..." : "Ajouter et scanner"}
            </button>
          </div>
        </form>
      </NeonCard>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid #00f0ff33",
  background: "#080b16",
  color: "#ffffff",
  padding: "12px 14px",
  outline: "none",
  fontFamily: "'Exo 2', sans-serif",
};

const primaryButtonStyle = {
  flex: 1,
  borderRadius: 8,
  border: "1px solid #00f0ff88",
  background: "linear-gradient(135deg, #00f0ff22, #0080ff22)",
  color: "#00f0ff",
  padding: "11px 14px",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  flex: 1,
  borderRadius: 8,
  border: "1px solid #ffffff20",
  background: "transparent",
  color: "#ffffffa8",
  padding: "11px 14px",
  cursor: "pointer",
};

function Stat({ label, value, sub, color }) {
  return (
    <NeonCard color={color} style={{ padding: "16px 20px", flex: 1, minWidth: 210 }}>
      <div style={{ color: "#ffffff88", fontSize: 11, letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      <div style={{ color, fontSize: 34, fontWeight: 800, marginTop: 6, fontFamily: "'Orbitron', sans-serif" }}>{value}</div>
      <div style={{ color: "#ffffff55", marginTop: 3, fontSize: 12 }}>{sub}</div>
    </NeonCard>
  );
}

function SourceRow({ source, onScan, onDelete }) {
  const cat = categoryMeta(source.category);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr 90px 100px",
        gap: 10,
        alignItems: "center",
        borderBottom: "1px solid #ffffff12",
        padding: "12px 16px",
        fontSize: 13,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "#fff", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{source.name}</div>
        <a href={source.url} target="_blank" rel="noreferrer" style={{ color: "#7ec7ff", textDecoration: "none", fontSize: 12 }}>
          {source.url}
        </a>
        {source.lastError && <div style={{ color: "#ff5f7a", fontSize: 11, marginTop: 2 }}>{source.lastError}</div>}
      </div>

      <div>
        <span
          style={{
            border: `1px solid ${cat.color}66`,
            color: cat.color,
            borderRadius: 6,
            padding: "3px 8px",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {cat.label}
        </span>
      </div>

      <div style={{ color: STATUS_COLORS[source.status] || "#ffffff" }}>{statusLabel(source)}</div>
      <div style={{ color: "#ffffff88" }}>{source.lastScanLabel || relativeTime(source.lastScan)}</div>
      <div style={{ color: "#ffffffcc", textAlign: "right", fontWeight: 700 }}>{source.articles || 0}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        <button onClick={() => onScan(source.id)} style={miniActionButton("#00f0ff")}>
          Scan
        </button>
        <button onClick={() => onDelete(source.id)} style={miniActionButton("#ff003c")}>
          Suppr
        </button>
      </div>
    </div>
  );
}

function miniActionButton(color) {
  return {
    border: `1px solid ${color}55`,
    color,
    background: "transparent",
    borderRadius: 6,
    padding: "5px 8px",
    cursor: "pointer",
    fontSize: 11,
  };
}

function FeedItem({ item }) {
  const cat = categoryMeta(item.category);
  const priorityColor = item.priority === "critique" ? "#ff003c" : item.priority === "haute" ? "#ffb800" : "#00f0ff";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "block",
        textDecoration: "none",
        borderBottom: "1px solid #ffffff12",
        padding: "12px 16px",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
        <span style={{ color: cat.color, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{cat.label}</span>
        <span style={{ color: "#ffffff66", fontSize: 11 }}>{item.sourceName}</span>
        <span style={{ color: priorityColor, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{item.priority?.toUpperCase()}</span>
        <span style={{ color: "#ffffff66", fontSize: 11 }}>{relativeTime(item.createdAt)}</span>
      </div>
      <div style={{ color: "#ffffffee", fontWeight: 600 }}>{item.title}</div>
      {item.summary && <div style={{ color: "#ffffff88", fontSize: 13, marginTop: 4 }}>{item.summary}</div>}
    </a>
  );
}

export default function ONYXRadar({ onBack }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("sources");
  const [clock, setClock] = useState(new Date());

  const [stats, setStats] = useState({
    sourcesActive: 0,
    totalSources: 0,
    articlesToday: 0,
    alerts: 0,
    scrapingUptime: 0,
    lastGlobalScan: null,
    scanInProgress: false,
  });
  const [sources, setSources] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanBusy, setScanBusy] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchDashboard = useCallback(
    async (withLoader = false) => {
      if (withLoader) setLoading(true);
      try {
        const [statsRes, sourcesRes, feedRes] = await Promise.all([
          fetch("/api/stats"),
          fetch(`/api/sources?category=${encodeURIComponent(activeCategory)}`),
          fetch(`/api/feed?category=${encodeURIComponent(activeCategory)}&limit=60`),
        ]);

        if (!statsRes.ok || !sourcesRes.ok || !feedRes.ok) {
          throw new Error("Impossible de charger les donnees");
        }

        const statsData = await statsRes.json();
        const sourcesData = await sourcesRes.json();
        const feedData = await feedRes.json();

        setStats(statsData);
        setSources(Array.isArray(sourcesData.sources) ? sourcesData.sources : []);
        setFeed(Array.isArray(feedData.feed) ? feedData.feed : []);
        setGlobalError("");
      } catch (error) {
        setGlobalError(error instanceof Error ? error.message : "Erreur reseau");
      } finally {
        if (withLoader) setLoading(false);
      }
    },
    [activeCategory],
  );

  useEffect(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const poll = setInterval(() => {
      fetchDashboard(false);
    }, 20000);
    return () => clearInterval(poll);
  }, [fetchDashboard]);

  const addSource = async ({ name, url, category }) => {
    setModalLoading(true);
    setModalError("");
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, category }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Ajout impossible");
      }

      setShowModal(false);
      await fetchDashboard(false);
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setModalLoading(false);
    }
  };

  const scanAll = async () => {
    setScanBusy(true);
    try {
      await fetch("/api/scan", { method: "POST" });
      setTimeout(() => fetchDashboard(false), 1000);
      setTimeout(() => fetchDashboard(false), 4000);
    } finally {
      setScanBusy(false);
    }
  };

  const scanOne = async (id) => {
    await fetch(`/api/sources/${id}/scan`, { method: "POST" });
    setTimeout(() => fetchDashboard(false), 1000);
  };

  const deleteOne = async (id) => {
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
    await fetchDashboard(false);
  };

  const subtitle = useMemo(() => {
    if (stats.scanInProgress || scanBusy) return "SCAN EN COURS";
    if (stats.lastGlobalScan) return `Dernier scan ${relativeTime(stats.lastGlobalScan)}`;
    return "Pret a scanner";
  }, [stats.scanInProgress, stats.lastGlobalScan, scanBusy]);

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "#fff",
        background: "radial-gradient(circle at 15% 10%, #07172d 0%, #05050b 45%, #020204 100%)",
        fontFamily: "'Exo 2', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 16px 28px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onBack && (
              <button onClick={onBack} style={secondaryButtonStyle}>
                ← Accueil
              </button>
            )}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                background: "linear-gradient(135deg, #00f0ff, #b026ff)",
                boxShadow: "0 0 28px #00f0ff55",
              }}
            >
              O
            </div>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: 4, fontSize: 20 }}>ONYX RADAR</div>
              <div style={{ color: "#8fd3ff", fontSize: 12 }}>{subtitle}</div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#00f0ff", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{formatClock(clock)}</div>
            <div style={{ color: "#ffffff88", fontSize: 12 }}>SYSTEM ONLINE</div>
          </div>
        </header>

        {globalError && (
          <NeonCard color="#ff003c" style={{ marginBottom: 12, padding: "12px 14px", color: "#ff9db0" }}>
            {globalError}
          </NeonCard>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <Stat label="SOURCES" value={`${stats.sourcesActive}/${stats.totalSources}`} sub="actives" color="#00f0ff" />
          <Stat label="ARTICLES" value={stats.articlesToday} sub="aujourd'hui" color="#ffb800" />
          <Stat label="ALERTES" value={stats.alerts} sub="24h" color="#ff003c" />
          <Stat label="UPTIME" value={`${stats.scrapingUptime}%`} sub="collecte" color="#00ff87" />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                border: `1px solid ${activeCategory === cat.id ? cat.color : "#ffffff22"}`,
                background: activeCategory === cat.id ? `${cat.color}22` : "transparent",
                color: activeCategory === cat.id ? cat.color : "#ffffff88",
                borderRadius: 999,
                padding: "7px 12px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 0 }}>
          <button onClick={() => setActiveTab("sources")} style={tabStyle(activeTab === "sources")}>
            SOURCES
          </button>
          <button onClick={() => setActiveTab("feed")} style={tabStyle(activeTab === "feed")}>
            FLUX LIVE
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={scanAll} disabled={scanBusy || stats.scanInProgress} style={miniActionButton("#00ff87")}>
            {scanBusy || stats.scanInProgress ? "Scan..." : "Scanner tout"}
          </button>
          <button onClick={() => setShowModal(true)} style={miniActionButton("#00f0ff")}>
            + Source
          </button>
        </div>

        <NeonCard color="#00f0ff" style={{ borderTopLeftRadius: 0, overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: 20, color: "#ffffff88" }}>Chargement...</div>
          ) : activeTab === "sources" ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 90px 100px",
                  gap: 10,
                  padding: "10px 16px",
                  borderBottom: "1px solid #ffffff1a",
                  fontSize: 11,
                  color: "#ffffff88",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <div>SOURCE</div>
                <div>CATEGORIE</div>
                <div>STATUT</div>
                <div>DERNIER SCAN</div>
                <div style={{ textAlign: "right" }}>ART.</div>
                <div style={{ textAlign: "right" }}>ACTIONS</div>
              </div>
              {sources.length === 0 ? (
                <div style={{ padding: 20, color: "#ffffff88" }}>Aucune source pour ce filtre.</div>
              ) : (
                sources.map((source) => (
                  <SourceRow key={source.id} source={source} onScan={scanOne} onDelete={deleteOne} />
                ))
              )}
            </>
          ) : (
            <>
              {feed.length === 0 ? (
                <div style={{ padding: 20, color: "#ffffff88" }}>Aucun article collecté pour le moment.</div>
              ) : (
                feed.map((item) => <FeedItem key={item.id} item={item} />)
              )}
            </>
          )}
        </NeonCard>
      </div>

      {showModal && (
        <AddSourceModal
          onClose={() => {
            if (!modalLoading) {
              setShowModal(false);
              setModalError("");
            }
          }}
          onSubmit={addSource}
          loading={modalLoading}
          error={modalError}
        />
      )}
    </div>
  );
}

function tabStyle(active) {
  return {
    border: "1px solid #ffffff24",
    borderBottom: "none",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    background: active ? "#0b1124" : "transparent",
    color: active ? "#00f0ff" : "#ffffff88",
    cursor: "pointer",
    padding: "10px 14px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
  };
}