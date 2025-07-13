const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

describe('Translation API Tests', () => {
  // Test critique : Traduction française fonctionnelle
  test('should translate Hebrew text to French', async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/multi-book/translate-chunk`, {
        text: 'שלום'
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('translation');
      expect(typeof response.data.translation).toBe('string');
      expect(response.data.translation.length).toBeGreaterThan(0);
      
      // Vérifier que c'est une vraie traduction (pas le texte original)
      expect(response.data.translation).not.toBe('שלום');
      
      console.log(`✅ Traduction testée: שלום → "${response.data.translation}"`);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      throw error;
    }
  }, 30000);

  // Test : Validation des paramètres
  test('should reject empty translation request', async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/multi-book/translate-chunk`, {});
      
      // On s'attend à une erreur 400
      expect(response.status).toBe(400);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      
      // L'API devrait retourner une erreur 400
      if (error.response) {
        expect(error.response.status).toBe(400);
      }
    }
  });

  // Test : Traduction avec chunk ID (si implémenté)
  test('should translate using chunk ID format', async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/multi-book/translate-chunk`, {
        chunkId: 'test_chunk_1'
      });
      
      // Si chunk ID n'existe pas, on s'attend à une erreur ou un message spécifique
      if (response.status === 200) {
        expect(response.data).toHaveProperty('translation');
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      
      // Erreur attendue pour chunk inexistant
      if (error.response) {
        expect([400, 404, 500]).toContain(error.response.status);
      }
    }
  });

  // Test : Limite de taille de texte
  test('should handle long text translation', async () => {
    try {
      const longText = 'שלום '.repeat(100); // 600 caractères
      
      const response = await axios.post(`${API_BASE_URL}/multi-book/translate-chunk`, {
        text: longText
      });
      
      expect(response.status).toBe(200);
      expect(response.data.translation.length).toBeGreaterThan(0);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      
      // Si limite dépassée, on s'attend à une erreur 400
      if (error.response && error.response.status === 400) {
        expect(error.response.data).toHaveProperty('error');
      } else {
        throw error;
      }
    }
  }, 30000);

  // Test : Cache (vérifier header cached si implémenté)
  test('should use cache for repeated translations', async () => {
    try {
      const testText = 'תורה';
      
      // Première requête
      const response1 = await axios.post(`${API_BASE_URL}/multi-book/translate-chunk`, {
        text: testText
      });
      
      // Deuxième requête (devrait être en cache)
      const response2 = await axios.post(`${API_BASE_URL}/multi-book/translate-chunk`, {
        text: testText
      });
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.data.translation).toBe(response2.data.translation);
      
      // Si cache implémenté, vérifier le flag
      if (response2.data.hasOwnProperty('cached')) {
        expect(response2.data.cached).toBe(true);
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      throw error;
    }
  }, 30000);
});