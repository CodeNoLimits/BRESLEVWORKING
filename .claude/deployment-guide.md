# 🚀 Guide de Déploiement - Le Compagnon du Cœur

## 📋 Vue d'ensemble

Guide complet pour déployer l'application spirituelle en développement et production.

## 🏠 Déploiement Local (Développement)

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git
- Redis (optionnel, pour cache)

### Installation rapide

```bash
# 1. Cloner le repository
git clone https://github.com/CodeNoLimits/BRESLEVWORKING.git
cd BRESLEVWORKING

# 2. Installer les dépendances
npm install

# 3. Configuration environnement
cp .env.example .env
# Éditer .env avec vos clés API

# 4. Démarrer l'application
npm start
```

### Configuration environnement (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Proxy Configuration
PROXY_PORT=3001

# External APIs
GEMINI_API_KEY=votre_clé_gemini_ici

# Cache Configuration
REDIS_URL=redis://localhost:6379
CACHE_TTL=1800

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

### Démarrage étape par étape

#### Option A : Développement complet
```bash
# Terminal 1 : Backend sur port 5000
cd server/
node loadHebrewBooks.js  # ou votre script de démarrage backend

# Terminal 2 : Proxy frontend sur port 3001
npm start

# Terminal 3 : Tests (optionnel)
npm test
```

#### Option B : Frontend seul (fichiers HTML)
```bash
# Serveur web simple pour tester les fichiers HTML
cd client/
python -m http.server 8080
# Ou
npx serve .
```

## 🚀 Déploiement Production - Phase 3

### 🎯 Architecture de déploiement
- **Frontend** : Vercel (ou Netlify) - Plan gratuit
- **Backend** : Render.com - Plan gratuit  
- **Base de données** : Fichiers statiques + Cache mémoire
- **CDN** : Inclus avec Vercel/Netlify

## ☁️ Déploiement Vercel (Frontend) - RECOMMANDÉ

### 1. Préparation Vercel

#### Installation Vercel CLI
```bash
npm i -g vercel
vercel login
```

#### Configuration vercel.json
Le fichier `vercel.json` est déjà configuré avec :
- Proxy automatique vers Render backend
- Headers CORS
- Routing SPA
- Cache optimisé

#### Déploiement
```bash
# Depuis le dossier racine
vercel --prod

# Ou via GitHub (recommandé)
# 1. Connecter le repo sur vercel.com
# 2. Auto-deploy à chaque push
```

### 2. Variables d'environnement Vercel
Dans le dashboard Vercel :
```
NEXT_PUBLIC_API_URL = https://breslov-api.onrender.com
NEXT_PUBLIC_APP_NAME = Le Compagnon du Cœur
NODE_ENV = production
```

## 🔧 Déploiement Render (Backend)

### 1. Configuration automatique
Le fichier `render.yaml` configure :
- Service web Node.js
- Auto-deploy depuis GitHub
- Variables d'environnement
- Health checks
- CORS headers

### 2. Déploiement Render
```bash
# 1. Connecter GitHub repo sur render.com
# 2. Utiliser render.yaml (infrastructure as code)
# 3. Configure les secrets :
GEMINI_API_KEY = AIzaSyDijKuxkFV06PVCVz7QIYrcZa47kGUO_Ws
JWT_SECRET = auto-généré
```

### 3. URL de production
- **Frontend** : https://le-compagnon-du-coeur.vercel.app
- **Backend** : https://breslov-api.onrender.com

## 🌐 Alternative : Déploiement Netlify

### Configuration netlify.toml
```bash
# Connecter repo GitHub sur netlify.com
# Le fichier netlify.toml est déjà configuré
# Deploy automatique à chaque push
```

## ☁️ Déploiement Replit (Backup)

### 1. Configuration Replit

#### .replit
```toml
run = "npm start"
entrypoint = "simple-server.js"

[env]
NODE_ENV = "production"
PORT = "5000"

[nix]
channel = "stable-21_11"

[nix.deps]
pkgs = ["nodejs-18_x", "npm-8_x"]
```

#### replit.nix
```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.npm-8_x
    pkgs.redis
  ];
}
```

### 2. Variables d'environnement Replit

Dans l'onglet "Secrets" de Replit :

```
GEMINI_API_KEY = AIzaSyDijKuxkFV06PVCVz7QIYrcZa47kGUO_Ws
NODE_ENV = production
REDIS_URL = redis://localhost:6379
```

### 3. Structure de déploiement Replit

```
replit-workspace/
├── .replit                 # Config Replit
├── replit.nix             # Dépendances Nix
├── package.json           # Scripts et dépendances
├── simple-server.js       # Point d'entrée principal
├── server/                # Backend
├── client/                # Frontend
└── attached_assets/       # Fichiers .docx (15 livres)
```

### 4. Script de démarrage Replit

Le fichier `simple-server.js` gère :
- Proxy frontend (port 3001→5000)
- Service des fichiers statiques
- Redirection des routes API

## 🌐 Déploiement Vercel/Netlify

### Vercel

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "simple-server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/simple-server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Commandes Vercel
```bash
# Installation
npm i -g vercel

# Déploiement
vercel --prod

# Configuration des secrets
vercel env add GEMINI_API_KEY
```

### Netlify

#### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "client"

[build.environment]
  NODE_ENV = "production"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🐳 Déploiement Docker

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Exposer les ports
EXPOSE 5000 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Commande de démarrage
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    volumes:
      - ./attached_assets:/app/attached_assets:ro

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### Commandes Docker
```bash
# Build et démarrage
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up -d

# Logs
docker-compose logs -f app
```

## 🔧 Monitoring et Maintenance

### Health Checks

```bash
# Vérifier l'état de l'application
curl http://localhost:5000/api/health

# Vérifier les livres chargés
curl http://localhost:5000/api/multi-book/books | jq length

# Test de performance
time curl http://localhost:5000/api/multi-book/books
```

### Logs

```bash
# Logs du serveur
tail -f logs/server.log

# Logs d'erreur
tail -f logs/error.log

# Monitoring Redis
redis-cli monitor
```

### Métriques importantes

```bash
# Utilisation mémoire
ps aux | grep node

# Connexions actives
netstat -an | grep :5000

# Espace disque
du -sh attached_assets/
```

## 🚨 Troubleshooting

### Problèmes courants

#### 1. Livres non chargés (0/13)
```bash
# Vérifier les fichiers DOCX
ls -la attached_assets/*.docx

# Vérifier les logs de parsing
npm start 2>&1 | grep -i "book"

# Solution : Vérifier permissions et encoding
```

#### 2. Traduction échoue
```bash
# Vérifier la clé Gemini
echo $GEMINI_API_KEY

# Tester l'API
curl -X POST http://localhost:5000/api/multi-book/translate-chunk \
  -d '{"text":"שלום"}' -H "Content-Type: application/json"

# Solution : Régénérer la clé API
```

#### 3. Proxy non fonctionnel
```bash
# Vérifier les ports
lsof -i :3001
lsof -i :5000

# Vérifier la config proxy
cat simple-server.js | grep -A5 createProxyMiddleware

# Solution : Redémarrer avec ports libres
```

#### 4. Performance dégradée
```bash
# Vérifier le cache Redis
redis-cli info memory

# Analyser les requêtes lentes
npm run test:performance

# Solution : Optimiser cache et requêtes
```

### Logs d'erreur utiles

```bash
# Erreur de parsing DOCX
"Error parsing book: [filename]"

# Erreur API Gemini
"Gemini API error: rate limit exceeded"

# Erreur cache Redis
"Redis connection failed"

# Erreur proxy
"Proxy error: ECONNREFUSED"
```

## 📊 Checklist de déploiement

### Pré-déploiement
- [ ] Tests passent (npm test)
- [ ] Variables d'environnement configurées
- [ ] 15 fichiers .docx présents dans attached_assets/
- [ ] Clé Gemini API valide
- [ ] Build optimisé (<100KB)

### Post-déploiement
- [ ] Health check répond 200
- [ ] 13 livres chargés (GET /api/multi-book/books)
- [ ] Traduction fonctionne (POST /api/multi-book/translate-chunk)
- [ ] IA répond (POST /api/gemini/chat)
- [ ] Interface accessible (port 3001)
- [ ] Performance <3 secondes

### Monitoring continu
- [ ] Logs sans erreurs critiques
- [ ] Utilisation mémoire stable
- [ ] Cache hit rate >50%
- [ ] Temps de réponse API <2s
- [ ] Uptime >99%

## 🔄 Pipeline CI/CD (futur)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Replit
        run: |
          # Script de déploiement automatique
```

---

*Guide de déploiement créé le : ${new Date().toISOString()}*
*Version : 2.0.0-phase2*