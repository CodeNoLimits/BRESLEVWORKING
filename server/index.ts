import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { registerChayeiMoharanFrenchRoutes } from './routes/chayeiMoharanFrench.js';
import { registerMultiBookRoutes } from './routes/multiBook.js';
import { createServer } from 'http';

// Configuration ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Créer le serveur HTTP
const server = createServer(app);

// Middlewares robustes
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Mode fallback: servir les fichiers statiques depuis client
console.log('📦 Mode fallback simple - serving static files only');

// Servir les fichiers statiques depuis client
app.use(express.static(path.join(__dirname, '../client')));

// Route spéciale pour l'interface Chayei Moharan complète
app.get('/chayei-moharan', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/chayei-moharan-complete.html'));
});

// Route spéciale pour l'interface Lecteur Sefaria
app.get('/sefaria-reader', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/breslov-reader-sefaria.html'));
});

// Route spéciale pour l'interface Trilingue (mix parfait)
app.get('/trilingue', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/chayei-moharan-trilingue.html'));
});

// Route spéciale pour l'interface Carrés Trilingue (layout spécifique)
app.get('/carre-trilingue', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/carre-trilingue.html'));
});

// Route de test pour analyser tous les livres
app.get('/test-books', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/test-all-books.html'));
});

// Routes API essentielles
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gemini: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 🚀 ENDPOINT UNIFIÉ - Interface 13+ Livres
app.get('/api/v2/books', async (req, res) => {
  try {
    // Accéder directement au multiBookProcessor
    const { multiBookProcessor } = await import('./services/multiBookProcessor.js');
    await multiBookProcessor.initialize();
    const books = multiBookProcessor.getAvailableBooks();
    
    // Mapping des livres requis avec leurs titres français réels
    const REQUIRED_BOOKS_MAP = {
      'Likutei Moharan': ['Les Enseignements de Rabbi Nahman'],
      'Likutei Moharan Tinyana': ['Les Enseignements de Rabbi Nahman - Tome 2'], 
      'Likutei Tefilot': ['Recueil de Prières'],
      'Likutei Etzot': ['Recueil de Conseils'],
      'Kitzur Likutei Moharan': ['Abrégé des Enseignements'],
      'Chayey Moharan': ['Chayei Moharan', 'La Vie de Rabbi Nahman'],
      'Sefer HaMiddot': ['Le Livre des Traits de Caractère'],
      'Sipurey Maasiyot': ['Les Contes de Rabbi Nahman'],
      'Shivchey HaRan': ['Les Louanges de Rabbi Nahman'],
      'Alim LiTerufah': ['Feuilles de Guérison'],
      'Hashtefachut HaNefesh': ['Épanchement de l\'Âme'],
      'Shmot HaTzadikim': ['Les Noms des Justes']
    };
    
    // Vérification de complétude - Algorithme basé sur mapping réel
    const bookTitles = books.map(b => b.titleFrench || b.title);
    console.log(`[API-V2] ${bookTitles.length} titres disponibles`);
    
    const foundBooks = Object.keys(REQUIRED_BOOKS_MAP).filter(required => {
      const possibleTitles = REQUIRED_BOOKS_MAP[required];
      const found = possibleTitles.some(possibleTitle => 
        bookTitles.some(actualTitle => 
          actualTitle.toLowerCase().includes(possibleTitle.toLowerCase())
        )
      );
      if (found) {
        console.log(`[API-V2] ✅ Trouvé: ${required}`);
      } else {
        console.log(`[API-V2] ❌ Manque: ${required} (cherche: ${possibleTitles.join(' ou ')})`);
      }
      return found;
    });
    
    console.log(`[API-V2] ${books.length} livres trouvés, ${foundBooks.length}/13 requis`);
    
    res.json({
      success: true,
      count: books.length,
      books: books,
      requiredBooks: Object.keys(REQUIRED_BOOKS_MAP),
      foundRequiredBooks: foundBooks,
      completeness: `${foundBooks.length}/${Object.keys(REQUIRED_BOOKS_MAP).length}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[API-V2] Erreur:', error);
    
    const FALLBACK_BOOKS = [
      'Likutei Moharan', 'Likutei Moharan Tinyana', 'Likutei Tefilot',
      'Likutei Etzot', 'Kitzur Likutei Moharan', 'Chayey Moharan',
      'Sefer HaMiddot', 'Sipurey Maasiyot', 'Shivchey HaRan',
      'Alim LiTerufah', 'Hashtefachut HaNefesh', 'Shmot HaTzadikim'
    ];
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      fallbackBooks: FALLBACK_BOOKS,
      timestamp: new Date().toISOString()
    });
  }
});

// === ACTIVATION ROUTES CHAYEI MOHARAN DU 3 JUILLET ===
console.log('📚 Activation des routes Chayei Moharan & Multi-Livres...');
try {
  registerChayeiMoharanFrenchRoutes(app);
  registerMultiBookRoutes(app);
  console.log('✅ Routes Chayei Moharan activées avec succès');
} catch (error) {
  console.error('❌ Erreur activation routes Chayei Moharan:', error);
}

// === ACTIVATION ROUTES SEFARIA DIRECT TEXT ===
console.log('📜 Activation des routes Sefaria Direct Text...');
try {
  const { registerSefariaDirectTextRoutes } = await import('./routes/sefariaDirectText.js');
  registerSefariaDirectTextRoutes(app);
  console.log('✅ Routes Sefaria Direct Text activées avec succès');
} catch (error) {
  console.error('❌ Erreur activation routes Sefaria Direct Text:', error);
}

// Route Gemini spirituelle pour Le Compagnon du Cœur avec vraie API
app.post('/api/gemini/quick', async (req, res) => {
  console.log('[Gemini Quick] Requête reçue:', req.body);
  
  try {
    const { message, context } = req.body;
    
    if (!message) {
      console.log('[Gemini Quick] Message manquant');
      return res.status(400).json({ 
        error: 'Message manquant',
        response: 'Rabbi Nahman vous guide avec sagesse.'
      });
    }

    console.log(`[Gemini Quick] Traitement message: "${message}"`);

    // Utiliser la vraie API Gemini si disponible
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Tu es un expert des enseignements de Rabbi Nahman de Breslev (1772-1810), fondateur du hassidisme de Breslev. Réponds à cette question de manière précise et informative en français, en te basant sur tes connaissances historiques et spirituelles authentiques sur Rabbi Nahman, ses voyages, sa vie à Ouman, Lemberg, et ses enseignements:

Question: ${message}

Donne une réponse factuelle et précise. Si tu ne connais pas une information spécifique, dis-le clairement au lieu d'inventer.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        console.log(`[Gemini Quick] Réponse Gemini reçue: "${text.substring(0, 100)}..."`);
        
        return res.json({
          response: text,
          context: 'Réponse basée sur les connaissances historiques de Rabbi Nahman de Breslev',
          success: true,
          timestamp: new Date().toISOString(),
          source: 'Gemini AI'
        });

      } catch (geminiError) {
        console.error('[Gemini Quick] Erreur API Gemini:', geminiError);
        // Fallback en cas d'erreur Gemini
      }
    }

    // Fallback: Réponses contextuelles basées sur la question
    let response = "Rabbi Nahman vous guide avec sagesse.";
    
    const questionLower = message.toLowerCase();
    
    if (questionLower.includes('lemberg') || questionLower.includes('lviv') || questionLower.includes('lwów')) {
      response = "Rabbi Nahman s'est rendu à Lemberg (aujourd'hui Lviv en Ukraine) plusieurs fois. Il y a vécu notamment entre 1802-1807, période importante de son enseignement. Lemberg était un centre important de la vie juive à cette époque.";
    } else if (questionLower.includes('ouman') || questionLower.includes('uman')) {
      response = "Rabbi Nahman s'est installé à Ouman en Ukraine en 1810, où il a passé les derniers mois de sa vie. Il y est décédé le 18 Tishrei 5571 (4 octobre 1810). Ouman est devenu un lieu de pèlerinage majeur pour les hassidim de Breslev.";
    } else if (questionLower.includes('voyage') || questionLower.includes('partir')) {
      response = "Rabbi Nahman a entrepris plusieurs voyages importants au cours de sa vie, notamment en Terre d'Israël (1798-1799), et ses déplacements entre Breslov, Lemberg et finalement Ouman. Chaque voyage avait une signification spirituelle profonde dans son enseignement.";
    } else if (questionLower.includes('date') || questionLower.includes('quand')) {
      response = "Pour des dates précises concernant Rabbi Nahman de Breslev (1772-1810), il serait préférable de consulter des sources historiques spécialisées comme les biographies de 'Chayei Moharan' ou 'Shivchei HaRan' qui documentent sa vie de manière détaillée.";
    }
    
    console.log(`[Gemini Quick] Réponse contextuelle générée: "${response.substring(0, 50)}..."`);
    
    const result = {
      response: response,
      context: 'Enseignements et histoire de Rabbi Nahman de Breslev',
      success: true,
      timestamp: new Date().toISOString(),
      source: 'Connaissances contextuelles'
    };

    res.json(result);

  } catch (error) {
    console.error('[Gemini Quick] Erreur complète:', error);
    res.status(500).json({ 
      error: 'Erreur de traitement',
      response: 'Une erreur est survenue. Veuillez réessayer votre question sur Rabbi Nahman.',
      success: false
    });
  }
});

// Route catch-all pour SPA - servir index.html pour toutes les routes non-API
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  console.log(`[Fallback] Serving index.html for: ${req.path}`);
  res.sendFile(path.join(__dirname, '../client/index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Internal server error');
    }
  });
});

// Démarrage du serveur
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Serveur Chayei Moharan sur le port', PORT);
  console.log('📚 Application: http://0.0.0.0:' + PORT);
  console.log('🩺 Santé: http://0.0.0.0:' + PORT + '/api/health');
  if (process.env.GEMINI_API_KEY) {
    console.log('✅ GEMINI_API_KEY configurée');
  } else {
    console.log('⚠️ GEMINI_API_KEY manquante');
  }
});

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});