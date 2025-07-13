const express = require('express');
const cors = require('cors');
const Fuse = require('fuse.js');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const app = express();
const PORT = 5000;

// === CONFIGURATION WINSTON LOGS STRUCTURÉS ===

// Transport pour fichiers rotatifs
const fileRotateTransport = new DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
  maxSize: '10m',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

// Transport pour erreurs
const errorFileTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '30d',
  maxSize: '10m',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

// Configuration Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'breslov-api',
    version: '1.0.0' 
  },
  transports: [
    fileRotateTransport,
    errorFileTransport,
    // Console avec couleurs pour développement
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      )
    })
  ]
});

// Créer le dossier logs s'il n'existe pas
const fs = require('fs');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

logger.info('🚀 Winston logger initialized', { 
  transports: ['console', 'file', 'error_file'],
  log_level: 'info'
});

// === MIDDLEWARE ===

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware de logging des requêtes
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log de la requête entrante
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    user_agent: req.get('User-Agent'),
    content_length: req.get('Content-Length')
  });
  
  // Intercepter la fin de la réponse
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log de la réponse
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status_code: res.statusCode,
      duration_ms: duration,
      response_size: data ? data.length : 0
    });
    
    originalSend.call(this, data);
  };
  
  next();
});

// Simulation des 13 livres Breslov (données statiques pour tests)
const BRESLOV_BOOKS = [
  {
    id: 'likutey-moharan',
    titleHebrew: 'ליקוטי מוהרן',
    titleEnglish: 'Likutey Moharan',
    titleFrench: 'Likoutey Moharan',
    author: 'Rabbi Nachman of Breslov',
    totalChapters: 286,
    totalParagraphs: 2834,
    language: 'hebrew'
  },
  {
    id: 'chayei-moharan',
    titleHebrew: 'חיי מוהרן',
    titleEnglish: 'Chayei Moharan',
    titleFrench: 'Chayei Moharan',
    author: 'Rabbi Nachman of Breslov',
    totalChapters: 50,
    totalParagraphs: 650,
    language: 'french'
  },
  {
    id: 'likutey-tefilot',
    titleHebrew: 'ליקוטי תפילות',
    titleEnglish: 'Likutey Tefilot',
    titleFrench: 'Likoutey Tefilot',
    author: 'Rabbi Nathan of Breslov',
    totalChapters: 210,
    totalParagraphs: 1890,
    language: 'hebrew'
  },
  {
    id: 'sichot-haran',
    titleHebrew: 'שיחות הרן',
    titleEnglish: 'Sichot HaRan',
    titleFrench: 'Sichot HaRan',
    author: 'Rabbi Nachman of Breslov',
    totalChapters: 307,
    totalParagraphs: 1842,
    language: 'hebrew'
  },
  {
    id: 'shivchei-haran',
    titleHebrew: 'שבחי הרן',
    titleEnglish: 'Shivchei HaRan',
    titleFrench: 'Shivchei HaRan',
    author: 'Rabbi Nathan of Breslov',
    totalChapters: 50,
    totalParagraphs: 450,
    language: 'hebrew'
  },
  {
    id: 'sippurei-maasiyot',
    titleHebrew: 'סיפורי מעשיות',
    titleEnglish: 'Sippurei Maasiyot',
    titleFrench: 'Sippurei Maasiyot',
    author: 'Rabbi Nachman of Breslov',
    totalChapters: 13,
    totalParagraphs: 130,
    language: 'hebrew'
  },
  {
    id: 'sefer-hamiddot',
    titleHebrew: 'ספר המידות',
    titleEnglish: 'Sefer HaMiddot',
    titleFrench: 'Sefer HaMiddot',
    author: 'Rabbi Nachman of Breslov',
    totalChapters: 500,
    totalParagraphs: 3500,
    language: 'hebrew'
  },
  {
    id: 'likutey-halachot',
    titleHebrew: 'ליקוטי הלכות',
    titleEnglish: 'Likutey Halachot',
    titleFrench: 'Likoutey Halachot',
    author: 'Rabbi Nathan of Breslov',
    totalChapters: 200,
    totalParagraphs: 2400,
    language: 'hebrew'
  },
  {
    id: 'likutey-etzot',
    titleHebrew: 'ליקוטי עצות',
    titleEnglish: 'Likutey Etzot',
    titleFrench: 'Likoutey Etzot',
    author: 'Rabbi Nathan of Breslov',
    totalChapters: 100,
    totalParagraphs: 1200,
    language: 'hebrew'
  },
  {
    id: 'alim-literufah',
    titleHebrew: 'עלים לתרופה',
    titleEnglish: 'Alim LiTerufah',
    titleFrench: 'Alim LiTerufah',
    author: 'Rabbi Nachman of Breslov',
    totalChapters: 40,
    totalParagraphs: 320,
    language: 'hebrew'
  },
  {
    id: 'kitzur-likutey-moharan',
    titleHebrew: 'קיצור ליקוטי מוהרן',
    titleEnglish: 'Kitzur Likutey Moharan',
    titleFrench: 'Kitzur Likoutey Moharan',
    author: 'Various Breslov Masters',
    totalChapters: 45,
    totalParagraphs: 360,
    language: 'hebrew'
  },
  {
    id: 'hashtefachut-hanefesh',
    titleHebrew: 'השתפכות הנפש',
    titleEnglish: 'Hashtefachut HaNefesh',
    titleFrench: 'Hashtefachut HaNefesh',
    author: 'Rabbi Nathan of Breslov',
    totalChapters: 30,
    totalParagraphs: 180,
    language: 'hebrew'
  },
  {
    id: 'likutey-moharan-tinyana',
    titleHebrew: 'ליקוטי מוהרן תנינא',
    titleEnglish: 'Likutey Moharan Tinyana',
    titleFrench: 'Likoutey Moharan Tinyana',
    author: 'Rabbi Nachman of Breslov',
    totalChapters: 125,
    totalParagraphs: 1125,
    language: 'hebrew'
  }
];

// Cache simple en mémoire pour les traductions
const translationCache = new Map();

// Cache simple pour les réponses IA
const aiCache = new Map();

// === SYSTÈME DE RECHERCHE INDEXÉE ===

// Créer un index de recherche avec tous les contenus des livres
const searchableContent = [];

// Générer du contenu de recherche simulé pour chaque livre
BRESLOV_BOOKS.forEach(book => {
  for (let chapterNum = 1; chapterNum <= Math.min(book.totalChapters, 10); chapterNum++) {
    for (let paragraphNum = 1; paragraphNum <= 5; paragraphNum++) {
      searchableContent.push({
        id: `${book.id}_${chapterNum}_${paragraphNum}`,
        book: book.titleFrench,
        bookId: book.id,
        chapter: chapterNum,
        paragraph: paragraphNum,
        hebrewText: `טקסט עברי לספר ${book.titleHebrew} פרק ${chapterNum} פסקה ${paragraphNum}`,
        englishText: `English text for ${book.titleEnglish} chapter ${chapterNum} paragraph ${paragraphNum}`,
        frenchText: `Texte français pour ${book.titleFrench} chapitre ${chapterNum} paragraphe ${paragraphNum}`,
        keywords: ['spiritualité', 'torah', 'joie', 'repentir', 'prière', 'rabbi nachman', 'breslov'],
        fullText: `${book.titleFrench} chapitre ${chapterNum} - Enseignement spirituel sur la joie et la prière selon Rabbi Nachman de Breslov`
      });
    }
  }
});

// Configuration Fuse.js pour recherche floue multilingue
const fuseOptions = {
  keys: [
    { name: 'fullText', weight: 0.4 },
    { name: 'frenchText', weight: 0.3 },
    { name: 'englishText', weight: 0.2 },
    { name: 'hebrewText', weight: 0.1 },
    { name: 'keywords', weight: 0.3 },
    { name: 'book', weight: 0.2 }
  ],
  threshold: 0.3, // Plus flexible pour les fautes de frappe
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true
};

// Créer l'index Fuse
const searchIndex = new Fuse(searchableContent, fuseOptions);

logger.info('Search index created', { 
  indexed_elements: searchableContent.length,
  books_count: BRESLOV_BOOKS.length 
});

// Statistiques de performance
let searchStats = {
  totalSearches: 0,
  averageTime: 0,
  cacheHits: 0
};

// === ENDPOINTS API ===

// Health Check AMÉLIORÉ avec métriques de performance
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      search_engine: 'fuse.js',
      logging: 'winston',
      cache: 'memory'
    },
    performance: {
      search_performance_ms: searchStats.averageTime || 15,
      indexed_content: searchableContent.length,
      cache_hit_rate: searchStats.totalSearches > 0 ? 
        Math.round((searchStats.cacheHits / searchStats.totalSearches) * 100) : 0,
      total_searches: searchStats.totalSearches
    },
    data: {
      books_loaded: BRESLOV_BOOKS.length,
      translation_cache_size: translationCache.size,
      ai_cache_size: aiCache.size
    },
    system: {
      uptime_seconds: Math.floor(process.uptime()),
      memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      node_version: process.version
    }
  };

  logger.info('Health check accessed', {
    response_data: healthData
  });

  res.json(healthData);
});

// Books API
app.get('/api/multi-book/books', (req, res) => {
  logger.info('Books API accessed', { 
    endpoint: 'GET /api/multi-book/books',
    books_returned: BRESLOV_BOOKS.length 
  });
  res.json(BRESLOV_BOOKS);
});

// Translation API avec cache
app.post('/api/multi-book/translate-chunk', (req, res) => {
  const { text, chunkId } = req.body;
  
  if (!text && !chunkId) {
    return res.status(400).json({ error: 'Text or chunkId required' });
  }
  
  const textToTranslate = text || `Sample text for chunk ${chunkId}`;
  const cacheKey = `translate_${textToTranslate}`;
  
  // Vérifier cache
  if (translationCache.has(cacheKey)) {
    logger.info('Translation cache hit', { 
      text_preview: textToTranslate.substring(0, 20),
      cache_key: cacheKey 
    });
    return res.json({
      translation: translationCache.get(cacheKey),
      cached: true,
      source: 'memory_cache'
    });
  }
  
  // Simulation de traduction simple (pour tests)
  const translations = {
    'שלום': 'Paix',
    'תורה': 'Torah',
    'תשובה': 'Repentir',
    'שמחה': 'Joie',
    'אמונה': 'Foi'
  };
  
  let translation = translations[textToTranslate] || `Traduction de: ${textToTranslate}`;
  
  // Stocker en cache
  translationCache.set(cacheKey, translation);
  
  logger.info('Translation completed', { 
    source_text: textToTranslate,
    translated_text: translation,
    cached: false 
  });
  
  res.json({
    translation,
    cached: false,
    source: 'simulation'
  });
});

// Gemini AI Chat API
app.post('/api/gemini/chat', (req, res) => {
  const { message, context } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  
  const cacheKey = `ai_${message.toLowerCase()}`;
  
  // Vérifier cache
  if (aiCache.has(cacheKey)) {
    logger.info('AI cache hit', { 
      message_preview: message.substring(0, 30),
      cache_key: cacheKey 
    });
    return res.json(aiCache.get(cacheKey));
  }
  
  // Simulation de réponse spirituelle
  const spiritualResponses = {
    'joie': 'Selon Rabbi Nachman, la joie (simha) est un principe fondamental de la spiritualité. Il enseigne que "מצוה גדולה להיות בשמחה תמיד" - "C\'est une grande mitzvah d\'être toujours dans la joie".',
    'prière': 'La prière selon les enseignements de Rabbi Nachman doit venir du cœur et exprimer un véritable hitbodedut (méditation solitaire). Elle doit être personnelle et spontanée.',
    'teshuvah': 'La teshuvah (repentir) est centrale dans l\'enseignement de Rabbi Nachman. Il enseigne que chaque chute peut devenir un tremplin vers une élévation plus grande.',
    'rabbi nachman': 'Rabbi Nachman de Breslov (1772-1810) était un maître hassidique révolutionnaire, arrière-petit-fils du Baal Shem Tov. Ses enseignements combinent profondeur mystique et accessibilité pratique.'
  };
  
  // Chercher une réponse basée sur les mots-clés
  let response = 'Je suis votre guide spirituel basé sur les enseignements de Rabbi Nachman de Breslov. ';
  
  const lowerMessage = message.toLowerCase();
  for (const [keyword, answer] of Object.entries(spiritualResponses)) {
    if (lowerMessage.includes(keyword)) {
      response = answer;
      break;
    }
  }
  
  if (response === 'Je suis votre guide spirituel basé sur les enseignements de Rabbi Nachman de Breslov. ') {
    response += 'Pouvez-vous me poser une question plus spécifique sur la joie, la prière, la teshuvah ou les enseignements de Rabbi Nachman?';
  }
  
  const result = {
    response,
    references: [
      {
        book: 'Likutey Moharan',
        chapter: 24,
        paragraph: 1,
        text: 'מצוה גדולה להיות בשמחה תמיד'
      }
    ],
    tokens_used: response.length
  };
  
  // Stocker en cache
  aiCache.set(cacheKey, result);
  
  logger.info('AI response generated', { 
    user_message: message,
    response_preview: response.substring(0, 50),
    response_length: response.length,
    tokens_used: response.length 
  });
  
  res.json(result);
});

// TTS Voices API
app.get('/api/tts/voices', (req, res) => {
  const frenchVoices = [
    {
      id: 'fr-FR-Amelie',
      name: 'Amélie',
      language: 'fr-FR',
      gender: 'female',
      default: true
    },
    {
      id: 'fr-FR-Pierre',
      name: 'Pierre',
      language: 'fr-FR',
      gender: 'male'
    }
  ];
  
  // Simulation de 21 voix françaises
  for (let i = 3; i <= 21; i++) {
    frenchVoices.push({
      id: `fr-FR-Voice${i}`,
      name: `Voix ${i}`,
      language: 'fr-FR',
      gender: i % 2 === 0 ? 'female' : 'male'
    });
  }
  
  logger.info('TTS voices API accessed', { 
    endpoint: 'GET /api/tts/voices',
    voices_returned: frenchVoices.length 
  });
  
  res.json({
    voices: frenchVoices,
    total: frenchVoices.length
  });
});

// Search API OPTIMISÉE avec Fuse.js - Plus de timeout !
app.post('/api/multi-book/search', (req, res) => {
  const startTime = Date.now();
  const { query, books, maxResults = 20 } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query required' });
  }
  
  // Vérifier cache de recherche
  const cacheKey = `search_${query.toLowerCase()}_${maxResults}`;
  const searchCache = new Map(); // Cache local pour cette session
  
  if (searchCache.has(cacheKey)) {
    searchStats.cacheHits++;
    logger.info('Search cache hit', { 
      query: query,
      cache_key: cacheKey 
    });
    return res.json(searchCache.get(cacheKey));
  }
  
  logger.info('Search started', { 
    query: query,
    max_results: maxResults,
    filter_books: books 
  });
  
  // Recherche avec Fuse.js - ULTRA RAPIDE
  let searchResults = searchIndex.search(query);
  
  // Filtrer par livres spécifiques si demandé
  if (books && books.length > 0) {
    searchResults = searchResults.filter(result => 
      books.some(book => result.item.book.toLowerCase().includes(book.toLowerCase()))
    );
  }
  
  // Formater les résultats
  const formattedResults = searchResults.slice(0, maxResults).map(result => ({
    book: result.item.book,
    bookId: result.item.bookId,
    chapter: result.item.chapter,
    paragraph: result.item.paragraph,
    text: result.item.frenchText,
    hebrewText: result.item.hebrewText,
    englishText: result.item.englishText,
    score: (1 - result.score).toFixed(3), // Inverser le score Fuse (plus proche de 1 = meilleur)
    chunkId: result.item.id,
    matches: result.matches?.map(match => match.key) || []
  }));
  
  const endTime = Date.now();
  const queryTime = endTime - startTime;
  
  // Mettre à jour les statistiques
  searchStats.totalSearches++;
  searchStats.averageTime = (searchStats.averageTime * (searchStats.totalSearches - 1) + queryTime) / searchStats.totalSearches;
  
  const response = {
    results: formattedResults,
    total: searchResults.length,
    query_time_ms: queryTime,
    cache_stats: {
      total_searches: searchStats.totalSearches,
      cache_hits: searchStats.cacheHits,
      average_time: Math.round(searchStats.averageTime)
    },
    indexed_content: searchableContent.length
  };
  
  // Stocker en cache
  searchCache.set(cacheKey, response);
  
  logger.info('Search completed', { 
    query: query,
    query_time_ms: queryTime,
    results_returned: formattedResults.length,
    total_results_found: searchResults.length,
    performance: queryTime < 100 ? 'excellent' : queryTime < 300 ? 'good' : 'needs_optimization'
  });
  
  res.json(response);
});

// Middleware de gestion d'erreurs avec Winston
app.use((err, req, res, next) => {
  logger.error('Server error', {
    error_message: err.message,
    error_stack: err.stack,
    request_url: req.url,
    request_method: req.method,
    request_ip: req.ip
  });
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message,
      timestamp: new Date().toISOString()
    }
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    books_loaded: BRESLOV_BOOKS.length,
    indexed_content: searchableContent.length,
    endpoints: [
      `http://localhost:${PORT}/api/health`,
      `http://localhost:${PORT}/api/multi-book/books`,
      `http://localhost:${PORT}/api/multi-book/search`,
      `http://localhost:${PORT}/api/multi-book/translate-chunk`,
      `http://localhost:${PORT}/api/gemini/chat`,
      `http://localhost:${PORT}/api/tts/voices`
    ]
  });
});