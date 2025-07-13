# 📚 API Le Compagnon du Cœur v1.0

API REST pour l'application spirituelle d'étude des textes de Rabbi Nachman de Breslov.

## 🔗 Base URL

```
Production: https://breslov-app.replit.app/api
Development: http://localhost:5000/api
```

## 🔑 Authentication

L'API est actuellement publique. Une authentification JWT est prévue pour la v2.

## 📋 Endpoints

### 📖 Books - Gestion des livres

#### GET /multi-book/books
Récupère la liste complète des 13 livres Breslov disponibles.

**Response:**
```json
[
  {
    "id": "likutey-moharan",
    "titleHebrew": "ליקוטי מוהר\"ן",
    "titleEnglish": "Likutey Moharan",
    "titleFrench": "Likoutey Moharan",
    "author": "Rabbi Nachman of Breslov",
    "totalChapters": 286,
    "totalParagraphs": 2834,
    "language": "hebrew"
  },
  // ... 12 autres livres
]
```

**Status Codes:**
- `200 OK` : Succès
- `500 Internal Server Error` : Erreur serveur

---

#### GET /multi-book/books/:bookId
Récupère les détails complets d'un livre spécifique avec tout son contenu.

**Parameters:**
- `bookId` (string) : Identifiant du livre (ex: "likutey-moharan")

**Response:**
```json
{
  "id": "likutey-moharan",
  "titleHebrew": "ליקוטי מוהר\"ן",
  "titleEnglish": "Likutey Moharan",
  "titleFrench": "Likoutey Moharan",
  "chapters": [
    {
      "number": 1,
      "title": "אשרי תמימי דרך",
      "paragraphs": [
        {
          "number": 1,
          "text": "אַשְׁרֵי תְמִימֵי דָרֶךְ הַהֹלְכִים בְּתוֹרַת ה'...",
          "chunkId": "likutey-moharan_1_1"
        }
      ]
    }
  ]
}
```

---

### 🌐 Translation - Service de traduction

#### POST /multi-book/translate-chunk
Traduit un texte hébreu en français via l'IA Gemini.

**Request Body:**
```json
{
  "chunkId": "likutey-moharan_1_1"
}
// OU
{
  "text": "שלום עולם"
}
```

**Response:**
```json
{
  "translation": "Paix dans le monde",
  "cached": false,
  "source": "gemini"
}
```

**Status Codes:**
- `200 OK` : Traduction réussie
- `400 Bad Request` : Paramètres manquants
- `500 Internal Server Error` : Erreur de traduction

**Notes:**
- Cache de 30 minutes pour optimiser les performances
- Support du texte direct ou par chunk ID
- Limite : 5000 caractères par requête

---

### 🤖 AI Chat - Intelligence Artificielle

#### POST /gemini/chat
Interaction conversationnelle avec l'IA spécialisée dans les enseignements de Rabbi Nachman.

**Request Body:**
```json
{
  "message": "Parle-moi de la joie selon Rabbi Nachman",
  "context": "likutey-moharan",  // optionnel
  "temperature": 0.7              // optionnel (0.0-1.0)
}
```

**Response:**
```json
{
  "response": "Selon Rabbi Nachman, la joie (simha) est un principe fondamental...",
  "references": [
    {
      "book": "Likutey Moharan",
      "chapter": 24,
      "paragraph": 1,
      "text": "מִצְוָה גְּדוֹלָה לִהְיוֹת בְּשִׂמְחָה תָּמִיד"
    }
  ],
  "tokens_used": 245
}
```

**Status Codes:**
- `200 OK` : Réponse générée
- `400 Bad Request` : Message manquant
- `429 Too Many Requests` : Limite dépassée (100/min)
- `500 Internal Server Error` : Erreur Gemini

---

### 🔊 Text-to-Speech - Synthèse vocale

#### GET /tts/voices
Liste toutes les voix disponibles pour la synthèse vocale.

**Response:**
```json
{
  "voices": [
    {
      "id": "fr-FR-Amelie",
      "name": "Amélie",
      "language": "fr-FR",
      "gender": "female",
      "default": true
    },
    // ... 20 autres voix françaises
  ],
  "total": 21
}
```

#### POST /tts/speak
Génère la synthèse vocale d'un texte (utilise Web Speech API côté client).

**Request Body:**
```json
{
  "text": "Bonjour, bienvenue dans l'étude",
  "voice": "fr-FR-Amelie",    // optionnel
  "rate": 0.9,                // optionnel (0.1-2.0)
  "pitch": 1.0                // optionnel (0-2.0)
}
```

**Response:**
```json
{
  "success": true,
  "voice_used": "fr-FR-Amelie",
  "instructions": "use_web_speech_api"
}
```

---

### 🔍 Search - Recherche (Beta)

#### POST /multi-book/search
Recherche de texte dans l'ensemble de la collection Breslov.

**Request Body:**
```json
{
  "query": "תשובה",
  "books": ["likutey-moharan"],  // optionnel, tous par défaut
  "maxResults": 10,               // optionnel, défaut: 20
  "language": "hebrew"            // optionnel
}
```

**Response:**
```json
{
  "results": [
    {
      "book": "Likutey Moharan",
      "chapter": 6,
      "paragraph": 3,
      "text": "...התשובה היא...",
      "score": 0.95,
      "chunkId": "likutey-moharan_6_3"
    }
  ],
  "total": 47,
  "query_time_ms": 234
}
```

⚠️ **Note:** Endpoint en beta, peut timeout sur requêtes complexes (pas d'index).

---

### 🏥 Health Check

#### GET /health
Vérifie l'état de santé de l'API et ses dépendances.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-13T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "redis": "ok",
    "gemini": "ok"
  },
  "books_loaded": 13,
  "uptime_seconds": 3600
}
```

---

## 🚨 Gestion des erreurs

Toutes les erreurs suivent ce format :

```json
{
  "error": {
    "code": "TRANSLATION_FAILED",
    "message": "Unable to translate text",
    "details": "Gemini API rate limit exceeded",
    "timestamp": "2024-01-13T10:30:00Z"
  }
}
```

### Codes d'erreur communs

| Code | Description |
|------|-------------|
| `BOOK_NOT_FOUND` | Livre inexistant |
| `TRANSLATION_FAILED` | Échec de traduction |
| `AI_ERROR` | Erreur Gemini IA |
| `RATE_LIMIT` | Limite de taux dépassée |
| `INVALID_PARAMS` | Paramètres invalides |

---

## 📈 Limites et quotas

| Ressource | Limite | Fenêtre |
|-----------|--------|---------|
| Requêtes API | 1000 | Par heure |
| Gemini Chat | 100 | Par minute |
| Traduction | 500 | Par heure |
| Taille texte | 5000 | Caractères |
| Cache TTL | 30 | Minutes |

---

## 🔄 Exemples d'utilisation

### Exemple complet : Charger et traduire un texte

```bash
# 1. Récupérer la liste des livres
curl http://localhost:5000/api/multi-book/books

# 2. Charger un livre spécifique
curl http://localhost:5000/api/multi-book/books/likutey-moharan

# 3. Traduire un paragraphe
curl -X POST http://localhost:5000/api/multi-book/translate-chunk \
  -H "Content-Type: application/json" \
  -d '{"chunkId": "likutey-moharan_1_1"}'

# 4. Poser une question à l'IA
curl -X POST http://localhost:5000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quelle est la signification de ce passage?"}'
```

---

## 📝 Notes de version

### v1.0.0 (Actuelle)
- 13 livres Breslov complets
- Traduction hébreu-français via Gemini
- Chat IA contextuel
- TTS 21 voix françaises

### v2.0.0 (Prévue)
- Authentification JWT
- Recherche indexée (Elasticsearch)
- WebSocket pour chat temps réel
- Mode offline avec PWA

---

*Documentation générée le : ${new Date().toISOString()}*