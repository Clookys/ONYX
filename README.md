# ONYX

Suite ONYX deployable sur Render (Web Service) avec :
- frontend React/Vite (`onyx-landing`)
- backend Node/Express (`server/index.js`)
- collecte automatique RSS/HTML
- API REST + stockage local JSON (`data/onyx.json`)

## Fonctionnalités livrées

- Ajout/suppression de sources dans Radar
- Scan manuel d'une source ou global
- Scan automatique périodique (`SCAN_INTERVAL_MS`, défaut 5 min)
- Flux d'articles alimenté par scraping (RSS/Atom + fallback page HTML)
- Dashboard de stats réelles (sources, articles, alertes, uptime)

## Déploiement Render (GitHub)

Dans Render -> New -> Web Service :
- Runtime : `Node`
- Build Command : `npm install && npm run build`
- Start Command : `npm run start`
- Root Directory : vide

## Variables utiles

- `SCAN_INTERVAL_MS` (optionnel): intervalle de scan en millisecondes
- `DATA_DIR` (optionnel): chemin des données persistées

Pour une vraie persistance Render, ajoutez un disque persistant et pointez `DATA_DIR` dessus (ex: `/var/data`).