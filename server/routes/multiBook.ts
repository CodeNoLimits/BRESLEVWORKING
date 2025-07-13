import { Express, Request, Response } from 'express';
import { multiBookProcessor } from '../services/multiBookProcessor.js';

export function registerMultiBookRoutes(app: Express) {
  console.log('[Route] Configuration routes Multi-Livres...');

  // Route pour obtenir la liste des livres disponibles
  app.get('/api/multi-book/books', async (req: Request, res: Response) => {
    try {
      await multiBookProcessor.initialize();
      const books = multiBookProcessor.getAvailableBooks();
      
      res.json({
        books,
        totalBooks: books.length
      });
    } catch (error) {
      console.error('[MultiBook] Erreur récupération livres:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des livres',
        details: String(error)
      });
    }
  });

  // Route pour rechercher dans tous les livres avec textes originaux
  app.post('/api/multi-book/search', async (req: Request, res: Response) => {
    try {
      const { query, bookIds, includeOriginal = true } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Question manquante' });
      }

      console.log(`[MultiBook] Recherche globale: "${query}"`);
      
      const result = await multiBookProcessor.searchAcrossBooks(query, bookIds);
      
      // Enrichir avec les textes originaux si demandé
      if (includeOriginal && result.relevantChunks) {
        result.relevantChunks = result.relevantChunks.map(chunk => ({
          ...chunk,
          originalText: chunk.content, // Texte hébreu original
          language: chunk.isRTL ? 'hebrew' : 'french',
          id: chunk.id || `${chunk.bookId}-${chunk.chunkIndex}`,
          reference: `${chunk.bookTitle} - Section ${chunk.chunkIndex + 1}`
        }));
      }
      
      console.log(`[MultiBook] Résultat enrichi:`, {
        answer: result.answer.substring(0, 100) + '...',
        booksSearched: result.bookResults.length,
        overallFound: result.overallFound,
        originalTexts: result.relevantChunks?.length || 0
      });
      
      res.json(result);
    } catch (error) {
      console.error('[MultiBook] Erreur recherche:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la recherche',
        details: String(error)
      });
    }
  });

  // Route pour rechercher dans un livre spécifique avec textes originaux
  app.post('/api/multi-book/search/:bookId', async (req: Request, res: Response) => {
    try {
      const { bookId } = req.params;
      const { query, includeOriginal = true } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Question manquante' });
      }

      console.log(`[MultiBook] Recherche dans ${bookId}: "${query}"`);
      
      const result = await multiBookProcessor.searchInSpecificBook(bookId, query);
      
      // Enrichir avec les textes originaux si demandé
      if (includeOriginal && result.relevantChunks) {
        result.relevantChunks = result.relevantChunks.map(chunk => ({
          ...chunk,
          originalText: chunk.content, // Texte hébreu original
          language: chunk.isRTL ? 'hebrew' : 'french',
          id: chunk.id || `${bookId}-${chunk.chunkIndex}`,
          reference: `${chunk.bookTitle} - Section ${chunk.chunkIndex + 1}`
        }));
      }
      
      res.json(result);
    } catch (error) {
      console.error('[MultiBook] Erreur recherche livre spécifique:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la recherche',
        details: String(error)
      });
    }
  });

  // Route pour ajouter un nouveau livre
  app.post('/api/multi-book/add-book', async (req: Request, res: Response) => {
    try {
      const { id, title, titleFrench, titleHebrew, filename, language } = req.body;
      
      if (!id || !title || !titleFrench || !filename || !language) {
        return res.status(400).json({ error: 'Paramètres manquants pour ajouter un livre' });
      }

      console.log(`[MultiBook] Ajout du livre: ${title}`);
      
      const success = await multiBookProcessor.addNewBook({
        id,
        title,
        titleFrench,
        titleHebrew,
        filename,
        language
      });
      
      if (success) {
        const books = multiBookProcessor.getAvailableBooks();
        res.json({
          success: true,
          message: `Livre "${titleFrench}" ajouté avec succès`,
          books
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Erreur lors de l\'ajout du livre' 
        });
      }
    } catch (error) {
      console.error('[MultiBook] Erreur ajout livre:', error);
      res.status(500).json({ 
        error: 'Erreur lors de l\'ajout du livre',
        details: String(error)
      });
    }
  });

  // Route pour traduire un chunk hébreu à la demande
  app.post('/api/multi-book/translate-chunk', async (req: Request, res: Response) => {
    try {
      const { chunkId } = req.body;
      
      if (!chunkId) {
        return res.status(400).json({ error: 'ID du chunk manquant' });
      }
      
      const translation = await multiBookProcessor.translateChunk(chunkId);
      
      res.json({ 
        success: true, 
        translation,
        chunkId
      });
    } catch (error) {
      console.error('[MultiBook] Erreur traduction chunk:', error);
      res.status(500).json({ error: 'Erreur lors de la traduction' });
    }
  });

  // Route pour récupérer une section spécifique d'un livre (pour l'affichage)
  app.get('/api/multi-book/section/:bookTitle/:sectionNumber', async (req: Request, res: Response) => {
    try {
      const { bookTitle, sectionNumber } = req.params;
      const section = parseInt(sectionNumber);
      
      if (isNaN(section) || section < 1) {
        return res.status(400).json({ 
          error: 'Numéro de section invalide',
          success: false 
        });
      }

      console.log(`[MultiBook] Récupération section ${section} du livre "${bookTitle}"`);
      
      const result = await multiBookProcessor.getBookSection(decodeURIComponent(bookTitle), section);
      
      if (result.success) {
        res.json({
          success: true,
          hebrewText: result.hebrewText,
          englishText: result.englishText,
          frenchText: result.frenchText,
          totalSegments: result.englishText.length,
          hebrewSegments: result.hebrewText.length,
          bookId: result.bookId,
          currentSection: section,
          totalSections: result.totalChunks
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error,
          hebrewText: [],
          englishText: [],
          frenchText: [],
          totalSegments: 0,
          hebrewSegments: 0
        });
      }
    } catch (error) {
      console.error('[MultiBook] Erreur récupération section:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération de la section',
        success: false,
        details: String(error)
      });
    }
  });

  console.log('[Route] Routes Multi-Livres configurées ✓');
}