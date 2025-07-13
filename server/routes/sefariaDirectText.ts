import { Request, Response } from 'express';
import { extractCompleteBook } from '../fullTextExtractor.js';

export function registerSefariaDirectTextRoutes(app: any) {
  console.log('[Route] Configuration routes Sefaria Direct Text...');

  // Route pour récupérer texte hébreu + anglais direct depuis Sefaria
  app.get('/api/sefaria-direct/:bookTitle/:sectionNumber?', async (req: Request, res: Response) => {
    try {
      const { bookTitle, sectionNumber } = req.params;
      
      console.log(`[SefariaDirectText] Extraction: ${bookTitle}${sectionNumber ? ` section ${sectionNumber}` : ''}`);
      
      const result = await extractCompleteBook(bookTitle, sectionNumber || null);
      
      res.json({
        success: true,
        book: result.book,
        reference: result.ref,
        title: result.title,
        hebrewText: result.he,
        englishText: result.text,
        totalSegments: result.text.length,
        hebrewSegments: result.he.length
      });
      
    } catch (error) {
      console.error('[SefariaDirectText] Erreur extraction:', error);
      res.status(500).json({ 
        error: 'Erreur lors de l\'extraction du texte',
        details: String(error)
      });
    }
  });

  // Route pour recherche avec IA dans les textes crawlés
  app.post('/api/sefaria-direct/search', async (req: Request, res: Response) => {
    try {
      const { query, bookTitle, sectionNumber } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Question manquante' });
      }

      console.log(`[SefariaDirectText] Recherche IA: "${query}" dans ${bookTitle}${sectionNumber ? ` section ${sectionNumber}` : ''}`);
      
      // Récupérer le texte depuis Sefaria
      const textData = await extractCompleteBook(bookTitle, sectionNumber || null);
      
      // Utiliser Gemini pour analyser le texte crawlé
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Tu es un guide spirituel expert en enseignements de Rabbi Nahman de Breslev. 

Voici le texte original hébreu et anglais du livre "${textData.book}" - ${textData.title}:

TEXTE HÉBREU:
${textData.he.slice(0, 5).join('\n\n')}

TEXTE ANGLAIS:
${textData.text.slice(0, 5).join('\n\n')}

Question de l'utilisateur: "${query}"

Instructions:
- Réponds en français en te basant UNIQUEMENT sur ce texte
- Cite les passages pertinents en hébreu et en anglais
- Fournis une analyse spirituelle profonde
- Si l'information n'est pas dans ce texte, dis-le clairement
- Reste dans le contexte de Rabbi Nahman et de ses enseignements`;

      const result = await model.generateContent(prompt);
      const answer = result.response.text();

      res.json({
        success: true,
        query,
        answer,
        sourceBook: textData.book,
        sourceReference: textData.ref,
        hebrewSegments: textData.he.length,
        englishSegments: textData.text.length,
        foundInText: true
      });

    } catch (error) {
      console.error('[SefariaDirectText] Erreur recherche IA:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la recherche',
        details: String(error)
      });
    }
  });

  // Route pour traduction française paresseuse
  app.post('/api/sefaria-direct/translate', async (req: Request, res: Response) => {
    try {
      const { text, language, bookTitle } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Texte manquant' });
      }

      console.log(`[SefariaDirectText] Traduction française: ${text.substring(0, 100)}...`);
      
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Traduis ce passage de Rabbi Nahman de Breslev en français avec respect spirituel et mystique:

"${text}"

Instructions:
- Traduction française élégante et spirituelle
- Préserve les termes hébreux importants (comme "tzadik", "tikkun", etc.)
- Garde le sens mystique et profond des enseignements
- Format lisible avec paragraphes clairs
- Évite les paraphrases, reste fidèle au texte original

Livre source: ${bookTitle || 'Texte de Rabbi Nahman'}`;

      const result = await model.generateContent(prompt);
      const translation = result.response.text();

      res.json({
        success: true,
        translation,
        originalText: text,
        language: 'french',
        sourceBook: bookTitle
      });

    } catch (error) {
      console.error('[SefariaDirectText] Erreur traduction française:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la traduction française',
        details: String(error)
      });
    }
  });

  console.log('[Route] Routes Sefaria Direct Text configurées ✓');
}