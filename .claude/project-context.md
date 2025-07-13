# 📋 Le Compagnon du Cœur - Contexte du Projet

## 🎯 Vue d'ensemble

Application spirituelle complète pour l'étude des enseignements de Rabbi Nachman de Breslov, offrant :
- 13 livres complets de la collection Breslov (46,600+ lignes)
- Interface trilingue (Hébreu, Anglais, Français)
- IA conversationnelle avec Gemini
- Synthèse vocale multilingue (21 voix françaises)
- Recherche spirituelle contextuelle

## 📊 État actuel (Phase 1 complétée)

### ✅ Fonctionnalités opérationnelles

1. **Bibliothèque complète** : 13/13 livres Breslov
   - 1 livre en français : Chayei Moharan FR
   - 12 livres en hébreu avec traduction API
   - Total : 46,600+ lignes de texte authentique

2. **API de traduction** : 100% fonctionnelle
   - Support texte direct et chunk ID
   - Cache intelligent 30 minutes
   - Hébreu → Français via Gemini

3. **Intelligence Artificielle** : Gemini intégré
   - Réponses spirituelles contextuelles
   - Références exactes aux textes
   - Mode conversationnel

4. **Interface utilisateur** : Carrés trilingue
   - Layout responsive Hébreu/Anglais/Français
   - TTS avec 21 voix françaises (Amélie par défaut)
   - Navigation intuitive entre les livres

## 🏗️ Architecture technique

### Backend (Express/TypeScript)
- **Port** : 5000
- **Structure** :
  ```
  server/
  ├── loadHebrewBooks.ts     # Chargement des 13 livres
  ├── routes/
  │   ├── multiBook.ts       # API livres et traduction
  │   ├── gemini.ts          # API IA
  │   └── tts.ts             # API synthèse vocale
  └── services/
      ├── geminiService.ts   # Service Gemini
      └── cacheService.ts    # Cache Redis
  ```

### Frontend (React/TypeScript)
- **Port** : 3001 (proxy vers 5000)
- **Composants principaux** :
  - `carre-trilingue.html` : Interface principale
  - `carre-trilingue-v2.html` : Version avec titres IA
  - Standalone React apps avec Babel

### Données
- **Source** : 15 fichiers .docx hébreux dans `attached_assets/`
- **Format** : Texte structuré par livre/chapitre/paragraphe
- **Stockage** : Mémoire (chargement au démarrage)

## 🔌 Endpoints API actifs

### Livres
- `GET /api/multi-book/books` : Liste des 13 livres avec métadonnées
- `GET /api/multi-book/books/:id` : Détails d'un livre spécifique

### Traduction
- `POST /api/multi-book/translate-chunk`
  - Body : `{ chunkId: string }` ou `{ text: string }`
  - Response : `{ translation: string, cached: boolean }`

### Intelligence Artificielle
- `POST /api/gemini/chat`
  - Body : `{ message: string, context?: string }`
  - Response : `{ response: string, references: Array }`

### Synthèse Vocale
- `GET /api/tts/voices` : Liste des voix disponibles
- `POST /api/tts/speak` : Génération audio (Web Speech API)

### Santé
- `GET /api/health` : Status et métriques

## ⚙️ Configuration

### Variables d'environnement
```env
NODE_ENV=production
PORT=5000
GEMINI_API_KEY=AIzaSyDijKuxkFV06PVCVz7QIYrcZa47kGUO_Ws
REDIS_URL=redis://localhost:6379
CACHE_TTL=1800  # 30 minutes
```

### Dépendances critiques
- Express 4.x
- TypeScript 5.x
- Gemini AI SDK
- Redis (cache)
- DOCX parser

## 📈 Performances

- **Build** : 60.2KB optimisé
- **Temps de réponse** : <3 secondes
- **Charge supportée** : 100 requêtes/minute
- **Cache hit rate** : ~70% (traductions)

## 🚧 Points d'attention

1. **Recherche** : Pas d'index (timeout sur requêtes complexes)
2. **Persistance** : Données en mémoire uniquement
3. **Limites API** : Gemini 100 req/min
4. **Mobile** : Interface non optimisée

## 🎯 Prochaines étapes (Phase 2)

1. Documentation API complète (OpenAPI)
2. Tests automatisés (Jest, 90%+ coverage)
3. Optimisation recherche (Elasticsearch)
4. Logs structurés (Winston)
5. Mode PWA avec offline

## 📝 Notes de développement

- Approche incrémentale obligatoire
- Pas de régression sur l'existant
- Git push après chaque modification
- Tests avant changements majeurs

---

*Document créé le : ${new Date().toISOString()}*
*Version : 2.0.0-phase2*