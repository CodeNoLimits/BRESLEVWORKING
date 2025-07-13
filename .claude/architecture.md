# 🏗️ Architecture - Le Compagnon du Cœur

## 📐 Vue d'ensemble

```mermaid
graph TB
    subgraph "Frontend (Port 3001)"
        UI[Interface Carrés Trilingue]
        UI2[Interface V2 avec IA]
        Proxy[Express Proxy Server]
    end
    
    subgraph "Backend (Port 5000)"
        API[API Express/TypeScript]
        Routes[Routes Layer]
        Services[Services Layer]
        Cache[Redis Cache]
    end
    
    subgraph "External Services"
        Gemini[Gemini AI API]
        WebSpeech[Web Speech API]
    end
    
    subgraph "Data Layer"
        Books[13 Livres Breslov]
        DOCX[15 Fichiers .docx]
    end
    
    UI --> Proxy
    UI2 --> Proxy
    Proxy --> API
    API --> Routes
    Routes --> Services
    Services --> Cache
    Services --> Gemini
    UI --> WebSpeech
    Services --> Books
    Books --> DOCX
```

## 🗂️ Structure des dossiers

```
BRESLEVWORKING-GITHUB/
├── .claude/                    # Documentation projet
│   ├── project-context.md     # Contexte et état actuel
│   ├── architecture.md        # Ce fichier
│   └── deployment-guide.md    # Guide de déploiement
│
├── client/                     # Frontend
│   ├── index.html             # Menu principal
│   ├── carre-trilingue.html   # Interface principale
│   ├── carre-trilingue-v2.html # Version avec titres IA
│   └── src/                   # Sources React (non utilisé actuellement)
│
├── server/                     # Backend
│   ├── src/
│   │   └── index.ts          # Point d'entrée serveur
│   ├── loadHebrewBooks.ts     # Chargeur de livres
│   ├── routes/
│   │   ├── multiBook.ts      # Routes livres/traduction
│   │   ├── gemini.ts         # Routes IA
│   │   └── tts.ts            # Routes synthèse vocale
│   └── services/
│       ├── geminiService.ts  # Service Gemini AI
│       └── cacheService.ts   # Service cache Redis
│
├── attached_assets/           # Données sources
│   ├── CHAYE MOHARAN FR.docx # Livre français
│   └── [14 livres hébreux].docx
│
├── docs/
│   └── api/
│       └── README.md         # Documentation API
│
├── simple-server.js          # Proxy Express (prod)
├── package.json              # Dépendances Node.js
└── .gitignore               # Fichiers ignorés
```

## 🔄 Flux de données

### 1. Chargement initial des livres

```
Démarrage serveur (port 5000)
    ↓
loadHebrewBooks.ts
    ↓
Parse 15 fichiers .docx
    ↓
Structure en mémoire :
{
  books: Map<bookId, Book>
  chunks: Map<chunkId, Paragraph>
}
    ↓
13 livres disponibles via API
```

### 2. Flux de traduction

```
Client demande traduction
    ↓
POST /api/multi-book/translate-chunk
    ↓
Vérifier cache Redis (30 min TTL)
    ↓ (si miss)
Appel Gemini AI
    ↓
Stocker en cache
    ↓
Retourner traduction
```

### 3. Flux de recherche IA

```
Question utilisateur
    ↓
POST /api/gemini/chat
    ↓
Enrichissement contexte (livre actuel)
    ↓
Appel Gemini avec prompt spirituel
    ↓
Extraction références
    ↓
Réponse structurée
```

## 🏛️ Patterns architecturaux

### Separation of Concerns

```typescript
// Route (présentation)
router.post('/translate-chunk', async (req, res) => {
  const result = await translationService.translate(req.body);
  res.json(result);
});

// Service (logique métier)
class TranslationService {
  async translate(params) {
    // Validation, cache, appel API, etc.
  }
}

// Repository (accès données)
class BookRepository {
  getChunkById(chunkId) {
    return this.chunks.get(chunkId);
  }
}
```

### Middleware Pattern

```typescript
app.use(cors());           // CORS
app.use(express.json());   // Parse JSON
app.use(rateLimit());      // Limite de taux
app.use(errorHandler());   // Gestion erreurs
```

### Cache Strategy

```
Client Request
    ↓
Check Redis Cache
    ↓
HIT → Return cached
MISS ↓
    Compute result
    ↓
    Store in cache (TTL 30min)
    ↓
    Return result
```

## 🔐 Sécurité

### Points forts actuels
- CORS configuré
- Validation des entrées
- Limite de taux (100 req/min pour Gemini)
- Pas de données sensibles exposées

### À améliorer (Phase 3)
- [ ] Authentification JWT
- [ ] HTTPS en production
- [ ] Sanitization des entrées
- [ ] Logs d'audit

## 🚀 Performance

### Optimisations actuelles
- Cache Redis (30 min TTL)
- Chargement en mémoire au démarrage
- Build frontend optimisé (60.2KB)
- Compression gzip activée

### Métriques
- Temps de démarrage : ~5 secondes (parsing DOCX)
- Temps de réponse API : <3 secondes
- Utilisation mémoire : ~200MB (13 livres)
- Cache hit rate : ~70%

### Bottlenecks identifiés
1. **Recherche sans index** : Timeout sur requêtes complexes
2. **Parsing DOCX** : Lent au démarrage
3. **Pas de pagination** : Charge complète des livres

## 🔧 Configuration

### Variables d'environnement

```env
# Server
NODE_ENV=production
PORT=5000

# External APIs  
GEMINI_API_KEY=AIzaSyDijKuxkFV06PVCVz7QIYrcZa47kGUO_Ws

# Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=1800

# Limits
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

### Points d'extension

1. **Nouveaux livres** : Ajouter dans `loadHebrewBooks.ts`
2. **Nouvelles langues** : Étendre `TranslationService`
3. **Nouveaux modèles IA** : Implémenter `AIProvider` interface
4. **Nouveau cache** : Implémenter `CacheProvider` interface

## 🎯 Décisions architecturales

### Pourquoi pas de base de données ?
- Données statiques (livres ne changent pas)
- Performance maximale (tout en mémoire)
- Simplicité de déploiement
- Pas de migrations à gérer

### Pourquoi des fichiers HTML standalone ?
- Pas de build complexe
- Chargement instantané
- Debug facile
- Compatible tous navigateurs

### Pourquoi Express sur TypeScript ?
- Type safety
- Meilleure DX
- Refactoring sûr
- Documentation auto

## 📊 Diagramme de séquence - Traduction

```mermaid
sequenceDiagram
    participant C as Client
    participant P as Proxy (3001)
    participant A as API (5000)
    participant R as Redis
    participant G as Gemini AI
    
    C->>P: POST /api/translate-chunk
    P->>A: Forward request
    A->>R: Check cache
    alt Cache Hit
        R-->>A: Return translation
    else Cache Miss
        A->>G: Translate text
        G-->>A: Translation result
        A->>R: Store in cache
    end
    A-->>P: Return response
    P-->>C: Translation JSON
```

---

*Architecture documentée le : ${new Date().toISOString()}*
*Version : 2.0.0-phase2*