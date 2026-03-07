# Déployer ONYX Landing sur Render

## Méthode 1 : Via GitHub (recommandé)

### 1. Pousser sur GitHub
```bash
cd onyx-landing
git init
git add .
git commit -m "ONYX Landing Page"
git remote add origin https://github.com/Clookys/ONYX.git
git push -u origin main --force
```

### 2. Sur Render.com
1. Créer un compte sur render.com (gratuit)
2. Cliquer "New" → "Static Site"
3. Connecter votre repo GitHub Clookys/ONYX
4. Configurer :
   - **Name** : onyx-landing
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
5. Cliquer "Create Static Site"

C'est tout ! Render build et déploie automatiquement.
Votre site sera accessible sur : https://onyx-landing.onrender.com

### 3. Domaine personnalisé (optionnel)
- Aller dans Settings → Custom Domains
- Ajouter votre domaine (ex: onyx.io)
- Configurer le DNS chez votre registrar

## Méthode 2 : Netlify (alternative)
1. Aller sur app.netlify.com
2. Drag & drop le dossier `dist` (après avoir fait `npm run build`)
3. C'est en ligne !

## Pour tester en local d'abord
```bash
cd onyx-landing
npm install
npm run dev
# Ouvrir http://localhost:5173
```
