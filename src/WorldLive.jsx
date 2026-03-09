import { useEffect, useMemo, useRef, useState } from "react";

const FEEDS = [
  { id: "f1", name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { id: "f2", name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { id: "f3", name: "The Guardian World", url: "https://www.theguardian.com/world/rss" },
  { id: "f4", name: "UN News", url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml" },
  { id: "f5", name: "DW World", url: "https://rss.dw.com/rdf/rss-en-world" },
];

const REGION_RULES = [
  { label: "Moyen-Orient", keys: ["israel", "gaza", "iran", "syria", "lebanon", "yemen", "hamas", "hezbollah", "houthi", "jerusalem", "tel aviv"] },
  { label: "Europe", keys: ["ukraine", "russia", "nato", "eu", "europe", "balkans", "black sea"] },
  { label: "Ameriques", keys: ["united states", "usa", "canada", "mexico", "brazil", "argentina", "colombia"] },
  { label: "Asie-Pacifique", keys: ["china", "taiwan", "korea", "japan", "philippines", "south china sea", "india", "pakistan"] },
  { label: "Afrique", keys: ["sahel", "sudan", "ethiopia", "somalia", "niger", "mali", "congo", "africa"] },
];

const TOPIC_RULES = [
  { label: "Conflit", keys: ["war", "attack", "missile", "drone", "strike", "troops", "battle", "offensive", "ceasefire", "military"] },
  { label: "Cyber", keys: ["cyber", "hack", "malware", "ransomware", "disinformation", "influence", "propaganda"] },
  { label: "Diplomatie", keys: ["summit", "talks", "meeting", "negotiation", "sanctions", "resolution", "security council"] },
  { label: "Energie", keys: ["oil", "gas", "pipeline", "opec", "energy", "nuclear"] },
  { label: "Economie", keys: ["inflation", "market", "trade", "tariff", "supply chain", "shipping"] },
  { label: "Humanitaire", keys: ["refugee", "aid", "civilian", "casualties", "food", "health emergency", "cholera", "famine"] },
];

const SIGNAL_CRITICAL = ["breaking", "attack", "missile", "drone", "troops", "casualties", "killed", "critical", "emergency", "escalation"];
const SIGNAL_ELEVATED = ["sanctions", "cyber", "strike", "warning", "tension", "border", "mobilization", "evacuation"];

const cleanTxt = (v) => String(v || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const hasKey = (txt, keys) => keys.some((k) => txt.includes(k));
const pickRule = (txt, rules, fallback) => rules.find((r) => hasKey(txt, r.keys))?.label || fallback;

const scoreSignal = (txt) => {
  let score = 0;
  if (hasKey(txt, SIGNAL_CRITICAL)) score += 2;
  if (hasKey(txt, SIGNAL_ELEVATED)) score += 1;
  if (hasKey(txt, ["disinformation", "propaganda", "influence"])) score += 1;
  return score;
};

const signalLevel = (score) => (score >= 3 ? "High" : score >= 2 ? "Medium" : "Low");

const normalizeFeedItems = (items = []) =>
  items
    .map((i) => ({
      title: String(i?.title || ""),
      link: String(i?.link || i?.guid || ""),
      description: String(i?.description || i?.summary || ""),
      content: String(i?.content || i?.description || i?.summary || ""),
      pubDate: String(i?.pubDate || i?.published || i?.updated || ""),
    }))
    .filter((i) => i.title || i.link);

const parseXmlFeed = (xmlText) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  if (doc.querySelector("parsererror")) return [];

  return normalizeFeedItems(
    Array.from(doc.querySelectorAll("item, entry")).map((n) => {
      const linkNode = n.querySelector("link");
      const href = linkNode?.getAttribute?.("href");
      const link = href || linkNode?.textContent || n.querySelector("guid")?.textContent || "";
      return {
        title: n.querySelector("title")?.textContent || "",
        link,
        description: n.querySelector("description")?.textContent || n.querySelector("summary")?.textContent || "",
        content:
          n.querySelector("content\\:encoded")?.textContent ||
          n.querySelector("content")?.textContent ||
          n.querySelector("description")?.textContent ||
          "",
        pubDate:
          n.querySelector("pubDate")?.textContent ||
          n.querySelector("published")?.textContent ||
          n.querySelector("updated")?.textContent ||
          "",
      };
    })
  );
};

const fetchFeedItems = async (srcUrl) => {
  const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(srcUrl)}&count=35`;
  try {
    const r = await fetch(rss2jsonUrl);
    const d = await r.json();
    if (d?.status === "ok" && Array.isArray(d.items) && d.items.length) return normalizeFeedItems(d.items);
  } catch {}

  try {
    const r = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(srcUrl)}`);
    if (r.ok) {
      const xml = await r.text();
      const parsed = parseXmlFeed(xml);
      if (parsed.length) return parsed;
    }
  } catch {}

  try {
    const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(srcUrl)}`);
    if (r.ok) {
      const d = await r.json();
      const parsed = parseXmlFeed(String(d?.contents || ""));
      if (parsed.length) return parsed;
    }
  } catch {}

  return [];
};

export default function WorldLive({ onBack, onOpenRadar }) {
  const [articles, setArticles] = useState([]);
  const [sourceState, setSourceState] = useState(() => Object.fromEntries(FEEDS.map((f) => [f.id, { ok: null }])));
  const [lastFetch, setLastFetch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [zone, setZone] = useState("all");
  const fetchingRef = useRef(false);

  const refresh = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    try {
      const newState = {};
      const incoming = [];

      for (const src of FEEDS) {
        const items = await fetchFeedItems(src.url);
        newState[src.id] = { ok: items.length > 0 };

        items.forEach((i, idx) => {
          const title = cleanTxt(i.title) || "Sans titre";
          const sum = cleanTxt(i.description).slice(0, 320);
          const content = cleanTxt(i.content).slice(0, 1700);
          const url = String(i.link || "").trim();
          const parsedTs = Date.parse(i.pubDate || "");
          const ts = Number.isFinite(parsedTs) ? parsedTs : Date.now() - idx * 60000;
          const blob = `${title} ${sum}`.toLowerCase();
          const region = pickRule(blob, REGION_RULES, "Global");
          const topic = pickRule(blob, TOPIC_RULES, "General");
          const score = scoreSignal(blob);
          incoming.push({
            id: `${src.id}_${ts}_${idx}`,
            source: src.name,
            sourceId: src.id,
            title,
            sum,
            content,
            url,
            ts,
            date: new Date(ts).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
            region,
            topic,
            signal: signalLevel(score),
          });
        });
      }

      setSourceState((prev) => ({ ...prev, ...newState }));
      setArticles((prev) => {
        const seen = new Set(prev.map((a) => a.url || `${a.source}|${a.title}|${a.ts}`).filter(Boolean));
        const fresh = incoming.filter((a) => {
          const k = a.url || `${a.source}|${a.title}|${a.ts}`;
          if (!k || seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        return [...fresh, ...prev].sort((a, b) => b.ts - a.ts).slice(0, 800);
      });
      setLastFetch(new Date());
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    refresh();
    const timer = setInterval(() => refresh(), 3 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const okSources = useMemo(() => Object.values(sourceState).filter((s) => s.ok).length, [sourceState]);
  const dayArticles = useMemo(() => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    return articles.filter((a) => a.ts >= since);
  }, [articles]);
  const highSignals = useMemo(() => dayArticles.filter((a) => a.signal === "High").length, [dayArticles]);
  const topicCount = useMemo(() => {
    const m = {};
    dayArticles.forEach((a) => {
      m[a.topic] = (m[a.topic] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [dayArticles]);
  const regionCount = useMemo(() => {
    const m = {};
    dayArticles.forEach((a) => {
      m[a.region] = (m[a.region] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [dayArticles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (zone !== "all" && a.region !== zone) return false;
      if (!q) return true;
      const x = q.toLowerCase();
      return (
        a.title.toLowerCase().includes(x) ||
        a.sum.toLowerCase().includes(x) ||
        a.source.toLowerCase().includes(x) ||
        a.topic.toLowerCase().includes(x)
      );
    });
  }, [articles, q, zone]);

  return (
    <div style={{ minHeight: "100vh", background: "#05070f", color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "18px 18px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {onBack && (
            <button type="button" onClick={onBack} style={{ border: "1px solid #ffffff20", background: "transparent", color: "#ffffffc0", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}>
              Accueil
            </button>
          )}
          {onOpenRadar && (
            <button type="button" onClick={onOpenRadar} style={{ border: "1px solid #00f0ff35", background: "rgba(0,240,255,0.08)", color: "#00f0ff", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}>
              Ouvrir Radar
            </button>
          )}
          <button type="button" onClick={refresh} disabled={loading} style={{ border: "1px solid #ffffff20", background: "transparent", color: loading ? "#00f0ff" : "#ffffffa0", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}>
            {loading ? "Actualisation..." : "Actualiser"}
          </button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#ffffff80", fontFamily: "'JetBrains Mono', monospace" }}>
            {lastFetch ? `MAJ ${lastFetch.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "Aucune MAJ"}
          </span>
        </div>

        <div style={{ border: "1px solid #00f0ff2a", borderRadius: 12, padding: "14px 14px 12px", marginBottom: 12, background: "linear-gradient(135deg, rgba(0,240,255,0.08), rgba(176,38,255,0.05))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <h1 style={{ fontSize: 22, margin: 0, fontFamily: "'Orbitron', sans-serif", letterSpacing: 2, color: "#00f0ff" }}>LIVE MONDE</h1>
            <span style={{ fontSize: 12, color: "#ffffff90" }}>Page dediee aux signaux mondiaux en direct</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8, marginBottom: 10 }}>
            <div style={{ border: "1px solid #00f0ff30", borderRadius: 8, padding: "8px 10px", background: "rgba(0,0,0,0.2)" }}><div style={{ fontSize: 11, color: "#00f0ff90" }}>Articles 24h</div><div style={{ fontSize: 24, fontWeight: 700 }}>{dayArticles.length}</div></div>
            <div style={{ border: "1px solid #ff4d6d35", borderRadius: 8, padding: "8px 10px", background: "rgba(0,0,0,0.2)" }}><div style={{ fontSize: 11, color: "#ff4d6d90" }}>Signal High</div><div style={{ fontSize: 24, fontWeight: 700 }}>{highSignals}</div></div>
            <div style={{ border: "1px solid #ffffff20", borderRadius: 8, padding: "8px 10px", background: "rgba(0,0,0,0.2)" }}><div style={{ fontSize: 11, color: "#ffffff8a" }}>Sources OK</div><div style={{ fontSize: 24, fontWeight: 700 }}>{okSources}/{FEEDS.length}</div></div>
            <div style={{ border: "1px solid #ffffff20", borderRadius: 8, padding: "8px 10px", background: "rgba(0,0,0,0.2)" }}><div style={{ fontSize: 11, color: "#ffffff8a" }}>Hotspot</div><div style={{ fontSize: 20, fontWeight: 700 }}>{regionCount[0]?.[0] || "Global"}</div></div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {topicCount.slice(0, 7).map(([t, n]) => (
              <span key={t} style={{ fontSize: 12, padding: "3px 8px", borderRadius: 999, border: "1px solid #ffffff2a", background: "rgba(255,255,255,0.08)" }}>{t} {n}</span>
            ))}
            {topicCount.length === 0 && <span style={{ fontSize: 12, color: "#ffffff95" }}>Aucun signal recu pour le moment.</span>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un sujet, source, mot-clé..." style={{ flex: 1, minWidth: 240, padding: "9px 10px", borderRadius: 8, border: "1px solid #ffffff25", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }} />
          <select value={zone} onChange={(e) => setZone(e.target.value)} style={{ minWidth: 200, padding: "9px 10px", borderRadius: 8, border: "1px solid #ffffff25", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}>
            <option value="all" style={{ color: "#000" }}>Toutes zones</option>
            {regionCount.map(([r]) => <option key={r} value={r} style={{ color: "#000" }}>{r}</option>)}
          </select>
        </div>

        {articles.length === 0 && !loading && (
          <div style={{ border: "1px solid #ff4d6d30", background: "rgba(255,77,109,0.06)", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 14, marginBottom: 6, color: "#ffd8df" }}>Aucune donnee live recue pour l'instant.</div>
            <div style={{ fontSize: 12, color: "#ffffffc0", marginBottom: 8 }}>Etat des sources:</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 6 }}>
              {FEEDS.map((f) => (
                <div key={f.id} style={{ border: "1px solid #ffffff20", borderRadius: 7, padding: "6px 8px", background: "rgba(0,0,0,0.2)", fontSize: 12 }}>
                  <span style={{ color: sourceState[f.id]?.ok ? "#00ff87" : "#ffb4c0" }}>{sourceState[f.id]?.ok ? "OK" : "KO"}</span> {f.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 8 }}>
          {filtered.map((a) => {
            const sigColor = a.signal === "High" ? "#ff4d6d" : a.signal === "Medium" ? "#ffb800" : "#00ff87";
            return (
              <article key={a.id} style={{ border: "1px solid #ffffff1c", borderLeft: `3px solid ${sigColor}`, borderRadius: 10, background: "rgba(255,255,255,0.03)", padding: "10px 11px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ color: "#00f0ff", fontSize: 12, fontWeight: 600 }}>{a.source}</span>
                  <span style={{ fontSize: 11, color: sigColor, border: `1px solid ${sigColor}55`, borderRadius: 999, padding: "1px 7px" }}>{a.signal}</span>
                  <span style={{ fontSize: 11, color: "#ffffff8d", border: "1px solid #ffffff26", borderRadius: 999, padding: "1px 7px" }}>{a.region}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#ffffff75", fontFamily: "'JetBrains Mono', monospace" }}>{a.date}</span>
                </div>
                <h2 style={{ margin: "0 0 5px", fontSize: 17, lineHeight: 1.35 }}>{a.title}</h2>
                <p style={{ margin: 0, color: "#ffffffbf", fontSize: 13, lineHeight: 1.55 }}>{a.sum}</p>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#ffffff98" }}>{a.topic}</span>
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", color: "#00f0ff", textDecoration: "none", fontSize: 12 }}>
                      Ouvrir la source
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
