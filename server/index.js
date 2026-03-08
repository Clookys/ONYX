import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createStorage } from "./storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const frontendDistDir = path.join(rootDir, "onyx-landing", "dist");

const port = Number(process.env.PORT || 10000);
const scanIntervalMs = Number(process.env.SCAN_INTERVAL_MS || 300000);

const CATEGORY_IDS = ["politique", "reglementaire", "concurrence", "sentiment", "tech"];

const DEFAULT_SOURCES = [
  { id: "src-lemonde", name: "Le Monde - Numeriques", url: "https://www.lemonde.fr/economie/rss_full.xml", category: "concurrence" },
  { id: "src-eurlex", name: "EUR-Lex", url: "https://eur-lex.europa.eu/rss.html?locale=fr", category: "reglementaire" },
  { id: "src-techcrunch", name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "tech" },
];

let scanInProgress = false;

function nowIso() {
  return new Date().toISOString();
}

function decodeEntities(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x2F;/g, "/");
}

function stripTags(value = "") {
  return decodeEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function sanitizeText(value, maxLength = 260) {
  const cleaned = stripTags(value || "");
  if (!cleaned) return "";
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 3)}...` : cleaned;
}

function safeDate(value) {
  if (!value) return nowIso();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? nowIso() : date.toISOString();
}

function categoryPriority(category) {
  if (category === "reglementaire" || category === "politique") return "haute";
  if (category === "sentiment" || category === "concurrence") return "critique";
  return "moyenne";
}

function hash(value) {
  return crypto.createHash("sha1").update(value).digest("hex");
}

function normalizeUrl(input) {
  const trimmed = String(input || "").trim();
  if (!trimmed) throw new Error("URL manquante");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Seules les URLs http(s) sont autorisees");
  }
  return url.toString();
}

function buildDefaultStore() {
  const ts = nowIso();
  return {
    sources: DEFAULT_SOURCES.map((source) => ({
      ...source,
      status: "active",
      lastScan: null,
      lastError: null,
      createdAt: ts,
      updatedAt: ts,
    })),
    articles: [],
    meta: {
      createdAt: ts,
      updatedAt: ts,
      lastGlobalScan: null,
    },
  };
}

const storage = createStorage({ rootDir, buildDefaultStore, nowIso });

async function fileExists(targetPath) {
  try {
    const stat = await fs.stat(targetPath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function extractTag(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(re);
  return match ? sanitizeText(match[1], 500) : "";
}

function parseRss(xmlText) {
  const items = [];

  const rssMatches = xmlText.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const rawItem of rssMatches) {
    const title = extractTag(rawItem, "title");
    const link = extractTag(rawItem, "link");
    const summary = extractTag(rawItem, "description");
    const publishedAt = extractTag(rawItem, "pubDate");
    if (title) {
      items.push({ title, url: link, summary, publishedAt });
    }
  }

  const atomMatches = xmlText.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  for (const rawEntry of atomMatches) {
    const title = extractTag(rawEntry, "title");
    const summary = extractTag(rawEntry, "summary") || extractTag(rawEntry, "content");
    const publishedAt = extractTag(rawEntry, "updated") || extractTag(rawEntry, "published");
    const linkMatch = rawEntry.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
    const url = linkMatch ? sanitizeText(linkMatch[1], 500) : "";
    if (title) {
      items.push({ title, url, summary, publishedAt });
    }
  }

  return items;
}

function parseHtmlAsArticle(htmlText, source) {
  const titleMatch = htmlText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descriptionMatch = htmlText.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || htmlText.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);

  const title = titleMatch ? sanitizeText(titleMatch[1]) : source.name;
  const summary = descriptionMatch ? sanitizeText(descriptionMatch[1], 500) : "";
  return title ? [{ title, url: source.url, summary, publishedAt: nowIso() }] : [];
}

function buildArticle(source, rawArticle) {
  const title = sanitizeText(rawArticle.title, 220) || "Sans titre";
  const url = rawArticle.url ? sanitizeText(rawArticle.url, 500) : source.url;
  const publishedAt = safeDate(rawArticle.publishedAt);
  const id = hash(`${source.id}|${url}|${title}`);

  return {
    id,
    sourceId: source.id,
    sourceName: source.name,
    category: source.category,
    title,
    url,
    summary: sanitizeText(rawArticle.summary, 500),
    sentiment: "neutre",
    priority: categoryPriority(source.category),
    publishedAt,
    createdAt: nowIso(),
  };
}

async function scanSource(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(source.url, {
      headers: {
        "user-agent": "ONYXBot/1.0 (+https://onyx.local)",
        accept: "text/html,application/xml,text/xml,application/rss+xml,application/atom+xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const body = await response.text();
    const trimmed = body.trim();

    const looksLikeXml = contentType.includes("xml") || /^<\?xml/i.test(trimmed) || /^<rss/i.test(trimmed) || /^<feed/i.test(trimmed);
    const parsed = looksLikeXml ? parseRss(body) : parseHtmlAsArticle(body, source);
    const articles = parsed.map((item) => buildArticle(source, item));

    return {
      ok: true,
      scannedAt: nowIso(),
      status: "active",
      lastError: null,
      articles,
    };
  } catch (error) {
    return {
      ok: false,
      scannedAt: nowIso(),
      status: "error",
      lastError: error instanceof Error ? error.message : "Erreur inconnue",
      articles: [],
    };
  } finally {
    clearTimeout(timeout);
  }
}

function sourceTrend(articles, sourceId) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  let recent = 0;
  let previous = 0;

  for (const article of articles) {
    if (article.sourceId !== sourceId) continue;
    const ts = new Date(article.createdAt).getTime();
    if (Number.isNaN(ts)) continue;
    if (ts >= now - oneDay) recent += 1;
    else if (ts >= now - 2 * oneDay) previous += 1;
  }

  if (previous === 0) {
    if (recent === 0) return "0%";
    return "+100%";
  }

  const delta = Math.round(((recent - previous) / previous) * 100);
  return `${delta >= 0 ? "+" : ""}${delta}%`;
}

function appendArticles(store, incoming) {
  const known = new Set(store.articles.map((article) => article.id));
  let added = 0;

  for (const article of incoming) {
    if (!known.has(article.id)) {
      known.add(article.id);
      store.articles.push(article);
      added += 1;
    }
  }

  store.articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (store.articles.length > 6000) {
    store.articles = store.articles.slice(0, 6000);
  }

  return added;
}

async function scanSources({ sourceId } = {}) {
  if (scanInProgress) {
    return { alreadyRunning: true, scanned: 0, addedArticles: 0 };
  }

  scanInProgress = true;

  try {
    const store = await storage.readStore();
    const targets = sourceId
      ? store.sources.filter((source) => source.id === sourceId)
      : store.sources;

    let scanned = 0;
    let addedArticles = 0;

    for (const source of targets) {
      scanned += 1;
      const result = await scanSource(source);
      const idx = store.sources.findIndex((item) => item.id === source.id);
      if (idx !== -1) {
        store.sources[idx] = {
          ...store.sources[idx],
          status: result.status,
          lastScan: result.scannedAt,
          lastError: result.lastError,
          updatedAt: nowIso(),
        };
      }
      addedArticles += appendArticles(store, result.articles);
    }

    store.meta.lastGlobalScan = nowIso();
    await storage.writeStore(store);
    return { alreadyRunning: false, scanned, addedArticles };
  } finally {
    scanInProgress = false;
  }
}

function getStatsPayload(store) {
  const now = Date.now();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const sourcesActive = store.sources.filter((source) => source.status !== "error").length;
  const articlesToday = store.articles.filter((article) => new Date(article.createdAt).getTime() >= startOfDay.getTime()).length;
  const alerts = store.articles.filter((article) => {
    const ts = new Date(article.createdAt).getTime();
    return ts >= now - 24 * 60 * 60 * 1000 && (article.priority === "critique" || article.priority === "haute");
  }).length;

  const scrapingUptime = store.sources.length === 0
    ? 100
    : Math.round((sourcesActive / store.sources.length) * 100);

  return {
    sourcesActive,
    totalSources: store.sources.length,
    articlesToday,
    alerts,
    scrapingUptime,
    lastGlobalScan: store.meta?.lastGlobalScan || null,
    scanInProgress,
  };
}

function relativeTime(input) {
  if (!input) return "jamais";
  const ts = new Date(input).getTime();
  if (Number.isNaN(ts)) return "inconnu";
  const diffMin = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (diffMin < 1) return "a l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `il y a ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  return `il y a ${diffDays} j`;
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

const app = express();
app.use(express.json({ limit: "256kb" }));

app.get("/api/health", asyncHandler(async (_req, res) => {
  const store = await storage.readStore();
  res.json({ ok: true, scanInProgress, storage: storage.mode, sources: store.sources.length, articles: store.articles.length });
}));

app.get("/api/categories", (_req, res) => {
  res.json({ categories: CATEGORY_IDS });
});

app.get("/api/stats", asyncHandler(async (_req, res) => {
  const store = await storage.readStore();
  res.json(getStatsPayload(store));
}));

app.get("/api/sources", asyncHandler(async (req, res) => {
  const category = String(req.query.category || "all");
  const store = await storage.readStore();
  const filtered = category === "all"
    ? store.sources
    : store.sources.filter((source) => source.category === category);

  const payload = filtered.map((source) => {
    const articlesCount = store.articles.filter((article) => article.sourceId === source.id).length;
    return {
      ...source,
      articles: articlesCount,
      trend: sourceTrend(store.articles, source.id),
      lastScanLabel: relativeTime(source.lastScan),
    };
  });

  res.json({ sources: payload });
}));

app.get("/api/feed", asyncHandler(async (req, res) => {
  const category = String(req.query.category || "all");
  const limit = Math.max(1, Math.min(200, Number(req.query.limit || 60)));
  const store = await storage.readStore();

  const items = store.articles
    .filter((article) => category === "all" || article.category === category)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  res.json({ feed: items });
}));

app.post("/api/sources", asyncHandler(async (req, res) => {
  const name = sanitizeText(req.body?.name || "", 80);
  const rawUrl = req.body?.url || "";
  const category = String(req.body?.category || "").trim();

  if (!name) {
    return res.status(400).json({ error: "Nom de source requis" });
  }
  if (!CATEGORY_IDS.includes(category)) {
    return res.status(400).json({ error: "Categorie invalide" });
  }

  const url = normalizeUrl(rawUrl);

  const store = await storage.readStore();
  if (store.sources.some((source) => source.url === url)) {
    return res.status(409).json({ error: "Cette source existe deja" });
  }

  const ts = nowIso();
  const source = {
    id: crypto.randomUUID(),
    name,
    url,
    category,
    status: "active",
    lastScan: null,
    lastError: null,
    createdAt: ts,
    updatedAt: ts,
  };

  store.sources.push(source);
  await storage.writeStore(store);
  await scanSources({ sourceId: source.id });

  res.status(201).json({ source });
}));

app.delete("/api/sources/:id", asyncHandler(async (req, res) => {
  const id = String(req.params.id || "");
  const store = await storage.readStore();
  const before = store.sources.length;
  store.sources = store.sources.filter((source) => source.id !== id);

  if (store.sources.length === before) {
    return res.status(404).json({ error: "Source introuvable" });
  }

  store.articles = store.articles.filter((article) => article.sourceId !== id);
  await storage.writeStore(store);
  res.json({ ok: true });
}));

app.post("/api/sources/:id/scan", asyncHandler(async (req, res) => {
  const id = String(req.params.id || "");
  const store = await storage.readStore();
  if (!store.sources.some((source) => source.id === id)) {
    return res.status(404).json({ error: "Source introuvable" });
  }

  const result = await scanSources({ sourceId: id });
  res.json(result);
}));

app.post("/api/scan", asyncHandler(async (_req, res) => {
  const result = await scanSources();
  res.json(result);
}));

app.use(express.static(frontendDistDir, { index: false }));

app.get("*", asyncHandler(async (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  const indexPath = path.join(frontendDistDir, "index.html");
  if (await fileExists(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(503).send("Frontend non build. Executez d'abord npm run build.");
}));

app.use((error, _req, res, _next) => {
  console.error("Request failed:", error);
  res.status(500).json({ error: error instanceof Error ? error.message : "Erreur serveur" });
});

app.listen(port, "0.0.0.0", async () => {
  await storage.ensureReady();
  console.log(`ONYX API + frontend running on port ${port}`);
  console.log(`Storage mode: ${storage.mode} (${storage.description})`);

  setTimeout(() => {
    scanSources().catch((error) => {
      console.error("Initial scan failed:", error);
    });
  }, 2000);

  setInterval(() => {
    scanSources().catch((error) => {
      console.error("Scheduled scan failed:", error);
    });
  }, scanIntervalMs);
});