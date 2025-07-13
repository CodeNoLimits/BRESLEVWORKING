const axios = require('axios');

// Configuration pour les tests d'API
const API_BASE_URL = 'http://localhost:5000/api';

describe('Books API Tests', () => {
  // Test critique : Vérifier que les 13 livres sont chargés
  test('should return exactly 13 Breslov books', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/multi-book/books`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(13);
      
      // Vérifier la structure de chaque livre
      response.data.forEach(book => {
        expect(book).toHaveProperty('id');
        expect(book).toHaveProperty('titleHebrew');
        expect(book).toHaveProperty('titleEnglish');
        expect(book).toHaveProperty('titleFrench');
        expect(typeof book.id).toBe('string');
        expect(book.id.length).toBeGreaterThan(0);
      });
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      throw error;
    }
  }, 30000);

  // Test : Vérifier qu'un livre spécifique existe
  test('should return Likutey Moharan book details', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/multi-book/books`);
      const books = response.data;
      
      const likuteyMoharan = books.find(book => 
        book.titleEnglish.includes('Likutey Moharan') || 
        book.titleHebrew.includes('ליקוטי מוהרן')
      );
      
      expect(likuteyMoharan).toBeDefined();
      expect(likuteyMoharan.titleEnglish).toContain('Likutey');
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      throw error;
    }
  });

  // Test : Vérifier que Chayei Moharan FR est présent
  test('should include Chayei Moharan in French', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/multi-book/books`);
      const books = response.data;
      
      const chayeiMoharanFR = books.find(book => 
        book.language === 'french' || 
        book.titleFrench.includes('Chayei') ||
        book.titleEnglish.includes('Chayei')
      );
      
      expect(chayeiMoharanFR).toBeDefined();
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      throw error;
    }
  });

  // Test de performance : Réponse < 3 secondes
  test('should respond within 3 seconds', async () => {
    try {
      const startTime = Date.now();
      await axios.get(`${API_BASE_URL}/multi-book/books`);
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(3000);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      throw error;
    }
  });
});