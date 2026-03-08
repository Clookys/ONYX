# Déployer ONYX sur Render (Web Service)

## Configuration Render

- Type : **Web Service**
- Runtime : **Node**
- Root Directory : **laisser vide**
- Build Command : `npm install && npm run build`
- Start Command : `npm run start`

## Ce qui est déployé

- API backend : `server/index.js`
- Frontend buildé : `onyx-landing/dist`
- Endpoints API : `/api/*`

## Persistance des données

Par défaut, les données sont stockées dans `data/onyx.json`.
Sur Render, sans disque persistant, les données peuvent être perdues après redémarrage.

Pour rendre l'app durable :
1. Ajouter un persistent disk dans Render.
2. Définir `DATA_DIR` vers le chemin monté (ex: `/var/data`).

## Variables optionnelles

- `SCAN_INTERVAL_MS` (défaut: `300000`, soit 5 minutes)
- `DATA_DIR` (chemin de stockage persistant)