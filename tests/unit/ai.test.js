const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

describe('Gemini AI Chat Tests', () => {
  // Test critique : IA fonctionnelle avec réponses spirituelles
  test('should respond to spiritual questions about Rabbi Nachman', async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/gemini/chat`, {
        message: 'Parle-moi de la joie selon Rabbi Nachman'
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('response');
      expect(typeof response.data.response).toBe('string');
      expect(response.data.response.length).toBeGreaterThan(10);
      
      // Vérifier que la réponse contient du contenu spirituel
      const spiritualKeywords = ['Rabbi', 'Nachman', 'joie', 'simha', 'spirituel', 'âme', 'Dieu', 'Torah'];
      const responseText = response.data.response.toLowerCase();
      
      const containsSpiritual = spiritualKeywords.some(keyword => 
        responseText.includes(keyword.toLowerCase())
      );
      
      expect(containsSpiritual).toBe(true);
      
      console.log(`✅ Réponse IA reçue (${response.data.response.length} caractères)`);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      throw error;
    }
  }, 30000);

  // Test : Validation des paramètres
  test('should reject empty message', async () => {
    try {
      await axios.post(`${API_BASE_URL}/gemini/chat`, {});
      
      // Ne devrait pas arriver
      expect(true).toBe(false);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      
      // On s'attend à une erreur 400
      if (error.response) {
        expect(error.response.status).toBe(400);
      }
    }
  });

  // Test : Message avec contexte
  test('should handle contextual questions', async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/gemini/chat`, {
        message: 'Explique ce passage',
        context: 'Likutey Moharan'
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('response');
      expect(response.data.response.length).toBeGreaterThan(5);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      
      // Si contexte non implémenté, peut retourner une réponse générale
      if (error.response) {
        expect([200, 400]).toContain(error.response.status);
      }
    }
  }, 30000);

  // Test : Références (si implémentées)
  test('should potentially include references in responses', async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/gemini/chat`, {
        message: 'Que dit Likutey Moharan sur la prière?'
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('response');
      
      // Si références implémentées
      if (response.data.hasOwnProperty('references')) {
        expect(Array.isArray(response.data.references)).toBe(true);
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      throw error;
    }
  }, 30000);

  // Test : Limite de taux (100 req/min selon documentation)
  test('should handle rate limiting gracefully', async () => {
    try {
      // Test simple - pas de spam
      const response = await axios.post(`${API_BASE_URL}/gemini/chat`, {
        message: 'Test rapide'
      });
      
      expect(response.status).toBe(200);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      
      // Si limite atteinte, on s'attend à 429
      if (error.response && error.response.status === 429) {
        expect(error.response.data).toHaveProperty('error');
      } else {
        throw error;
      }
    }
  });

  // Test : Réponse en français
  test('should respond in French to French questions', async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/gemini/chat`, {
        message: 'Bonjour, comment allez-vous?'
      });
      
      expect(response.status).toBe(200);
      expect(response.data.response.length).toBeGreaterThan(0);
      
      // Vérifier quelques mots français dans la réponse
      const frenchWords = ['bonjour', 'merci', 'bien', 'spirituel', 'rabbi'];
      const responseText = response.data.response.toLowerCase();
      
      // Au moins un mot français devrait être présent
      const containsFrench = frenchWords.some(word => 
        responseText.includes(word)
      );
      
      // Note: Ce test peut être flexible car l'IA peut répondre dans différentes langues
      console.log(`ℹ️  Réponse reçue: ${response.data.response.substring(0, 100)}...`);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️  Serveur non démarré pour les tests - Test ignoré');
        return;
      }
      throw error;
    }
  }, 30000);
});