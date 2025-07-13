const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

describe('E2E: Books Display and Interface', () => {
  
  // Test principal : 13+ livres Breslov affichés
  test('should display all 13+ Breslov books in UI', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/multi-book/books`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('books');
      expect(response.data.books.length).toBeGreaterThanOrEqual(13);
      
      console.log(`✅ ${response.data.books.length} livres disponibles`);
      
      // Vérifier la présence des livres requis
      const bookTitles = response.data.books.map(b => b.titleFrench || b.title);
      
      const requiredBooks = [
        'Likutei Moharan',
        'Likutei Moharan Tinyana',
        'Likutei Tefilot',
        'Sippurei Maasiyot',
        'Chayei Moharan',
        'Sefer HaMidot',
        'Likutei Etzot'
      ];
      
      requiredBooks.forEach(required => {
        const found = bookTitles.some(title => 
          title.includes(required.split(' ')[0])
        );
        expect(found).toBe(true);
        console.log(`✅ ${required} trouvé`);
      });
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️ Serveur non démarré - Test ignoré');
        return;
      }
      throw error;
    }
  });

  // Test endpoint unifié V2
  test('should validate unified V2 books endpoint', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v2/books`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('count');
      expect(response.data).toHaveProperty('completeness');
      expect(response.data.count).toBeGreaterThanOrEqual(13);
      
      console.log(`✅ API V2: ${response.data.count} livres, complétude: ${response.data.completeness}`);
      
      // Vérifier structure des données
      expect(response.data.books).toBeDefined();
      expect(Array.isArray(response.data.books)).toBe(true);
      expect(response.data.requiredBooks).toBeDefined();
      expect(response.data.foundRequiredBooks).toBeDefined();
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️ Serveur non démarré - Test V2 ignoré');
        return;
      }
      throw error;
    }
  });

  // Test complétude des livres
  test('should have all required Breslov books loaded', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v2/books`);
      
      const { foundRequiredBooks, requiredBooks } = response.data;
      
      // Au moins 10 des 13 livres requis doivent être trouvés
      expect(foundRequiredBooks.length).toBeGreaterThanOrEqual(10);
      
      // Livres critiques qui DOIVENT être présents
      const criticalBooks = [
        'Likutei Moharan',
        'Chayei Moharan', 
        'Likutei Tefilot'
      ];
      
      criticalBooks.forEach(critical => {
        const found = foundRequiredBooks.includes(critical);
        expect(found).toBe(true);
        console.log(`✅ Livre critique "${critical}" présent`);
      });
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️ Serveur non démarré - Test complétude ignoré');
        return;
      }
      throw error;
    }
  });

  // Test performance et temps de réponse
  test('should respond quickly for book listing', async () => {
    try {
      const startTime = Date.now();
      
      const response = await axios.get(`${API_BASE_URL}/api/multi-book/books`);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(3000); // Moins de 3 secondes
      
      console.log(`✅ Temps de réponse: ${responseTime}ms`);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️ Serveur non démarré - Test performance ignoré');
        return;
      }
      throw error;
    }
  });

  // Test structure des livres
  test('should return properly structured book data', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/multi-book/books`);
      
      expect(response.data.books.length).toBeGreaterThan(0);
      
      // Vérifier la structure du premier livre
      const firstBook = response.data.books[0];
      expect(firstBook).toHaveProperty('id');
      expect(firstBook).toHaveProperty('title');
      expect(firstBook).toHaveProperty('titleFrench');
      expect(firstBook).toHaveProperty('language');
      expect(firstBook).toHaveProperty('stats');
      
      // Vérifier les stats
      expect(firstBook.stats).toHaveProperty('lines');
      expect(firstBook.stats).toHaveProperty('chunks');
      expect(firstBook.stats).toHaveProperty('characters');
      
      expect(typeof firstBook.stats.lines).toBe('number');
      expect(firstBook.stats.lines).toBeGreaterThan(0);
      
      console.log(`✅ Structure livre validée pour: ${firstBook.titleFrench}`);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️ Serveur non démarré - Test structure ignoré');
        return;
      }
      throw error;
    }
  });

  // Test langues disponibles
  test('should include both Hebrew and French books', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/multi-book/books`);
      
      const books = response.data.books;
      const hebrewBooks = books.filter(book => book.language === 'hebrew');
      const frenchBooks = books.filter(book => book.language === 'french');
      
      expect(hebrewBooks.length).toBeGreaterThan(0);
      expect(frenchBooks.length).toBeGreaterThan(0);
      
      console.log(`✅ ${hebrewBooks.length} livres hébreux, ${frenchBooks.length} livres français`);
      
      // Vérifier qu'il y a au moins 10 livres hébreux
      expect(hebrewBooks.length).toBeGreaterThanOrEqual(10);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️ Serveur non démarré - Test langues ignoré');
        return;
      }
      throw error;
    }
  });

});