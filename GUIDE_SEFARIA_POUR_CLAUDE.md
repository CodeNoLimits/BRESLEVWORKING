# 📚 Guide Complet Sefaria API pour Claude

## Qu'est-ce que Sefaria ?

Sefaria est la plus grande bibliothèque numérique de textes juifs au monde, avec une API publique gratuite qui donne accès à :

- **Plus de 3000+ textes juifs** en hébreu/araméen avec traductions anglaises/françaises
- **Bible hébraïque complète** (Torah, Nevi'im, Ketuvim)
- **Talmud de Babylone et de Jérusalem**
- **Littérature rabbinique** (Mishnah, Tosefta, Midrash)
- **Commentaires classiques** (Rashi, Ramban, Ibn Ezra, etc.)
- **Philosophie juive** (Maïmonide, Saadia Gaon, etc.)
- **Hassidisme** incluant les textes de **Rabbi Nahman de Breslev**
- **Halakha moderne** (Mishna Berura, Shulhan Arukh)

## 🔗 URL de Base
```
https://www.sefaria.org/api/
```

## 📖 Types de Références Breslov Disponibles

### Format des Références Sefaria
Les références suivent le format : `[Titre du Livre].[Section].[Paragraph/Ligne]`

### Livres de Rabbi Nahman de Breslev Disponibles :

1. **Likutei Moharan** (ליקוטי מוהרן)
   - Format : `Likutei Moharan.1.1`, `Likutei Moharan.2.15`
   - Contenu : Enseignements principaux de Rabbi Nahman
   - Sections : 1-286 (première partie), 1-125 (seconde partie)

2. **Sippurei Maasiyot** (ספורי מעשיות)  
   - Format : `Sippurei Maasiyot.1.1`, `Sippurei Maasiyot.13.5`
   - Contenu : 13 contes mystiques de Rabbi Nahman
   - Sections : 1-13 histoires

3. **Likutei Tefilot** (ליקוטי תפילות)
   - Format : `Likutei Tefilot.1.1`
   - Contenu : Prières basées sur les enseignements
   - Sections : 1-210 prières

4. **Chayei Moharan** (חיי מוהרן)
   - Format : `Chayei Moharan.1.1`
   - Contenu : Biographie de Rabbi Nahman
   - Sections : 1-50+ chapitres

5. **Sichot HaRan** (שיחות הרן)
   - Format : `Sichot HaRan.1`
   - Contenu : Conversations et enseignements
   - Sections : 1-307 conversations

## 🚀 Endpoints API Essentiels

### 1. Recherche de Textes
```
GET /api/search-wrapper?q={terme_recherche}&field=text&format=json
```
**Exemple :**
```bash
curl "https://www.sefaria.org/api/search-wrapper?q=נח+נחמן&field=text&format=json"
```

### 2. Récupération d'un Texte Spécifique
```
GET /api/texts/{reference}?format=json
```
**Exemples :**
```bash
# Récupérer Likutei Moharan, section 1, paragraphe 1
curl "https://www.sefaria.org/api/texts/Likutei Moharan.1.1?format=json"

# Récupérer un conte de Sippurei Maasiyot
curl "https://www.sefaria.org/api/texts/Sippurei Maasiyot.1.1?format=json"
```

### 3. Index d'un Livre
```
GET /api/index/{title}?format=json
```
**Exemple :**
```bash
curl "https://www.sefaria.org/api/index/Likutei Moharan?format=json"
```

### 4. Recherche d'Index
```
GET /api/index/?format=json
```
Retourne la liste complète de tous les livres disponibles.

## 📋 Structure de Réponse JSON

### Réponse Text API
```json
{
  "ref": "Likutei Moharan.1.1",
  "heRef": "ליקוטי מוהרן א א",
  "text": ["English text paragraph 1", "English text paragraph 2"],
  "he": ["טקסט עברית פסקה 1", "טקסט עברית פסקה 2"],
  "versionTitle": "William C. Braude translation",
  "versionTitleInHebrew": "תרגום אנגלי",
  "categories": ["Chasidut", "Breslov"],
  "sectionNames": ["Chapter", "Paragraph"]
}
```

### Réponse Search API
```json
{
  "hits": [
    {
      "_source": {
        "ref": "Likutei Moharan.1.5",
        "content": "Text content matching search...",
        "version": "Breslov Research Institute"
      }
    }
  ],
  "total": 1247
}
```

## 🛠️ Exemples d'Utilisation en JavaScript

### Rechercher dans les Textes Breslov
```javascript
async function searchBreslovTexts(query) {
  const response = await fetch(
    `https://www.sefaria.org/api/search-wrapper?q=${encodeURIComponent(query)}&field=text&format=json`
  );
  const data = await response.json();
  
  // Filtrer uniquement les résultats Breslov
  const breslovResults = data.hits.filter(hit => 
    hit._source.ref.includes('Likutei Moharan') ||
    hit._source.ref.includes('Sippurei Maasiyot') ||
    hit._source.ref.includes('Chayei Moharan')
  );
  
  return breslovResults;
}
```

### Récupérer un Texte Breslov Spécifique
```javascript
async function getBreslovText(reference) {
  try {
    const response = await fetch(
      `https://www.sefaria.org/api/texts/${encodeURIComponent(reference)}?format=json`
    );
    
    if (!response.ok) {
      throw new Error(`Texte non trouvé: ${reference}`);
    }
    
    const data = await response.json();
    
    return {
      reference: data.ref,
      hebrewReference: data.heRef,
      englishText: data.text || [],
      hebrewText: data.he || [],
      categories: data.categories || [],
      book: data.book,
      available: true
    };
    
  } catch (error) {
    console.error(`Erreur récupération ${reference}:`, error);
    return { available: false, error: error.message };
  }
}
```

### Explorer un Livre Breslov Complet
```javascript
async function exploreBreslovBook(bookTitle) {
  try {
    // 1. Récupérer l'index du livre
    const indexResponse = await fetch(
      `https://www.sefaria.org/api/index/${encodeURIComponent(bookTitle)}?format=json`
    );
    const indexData = await indexResponse.json();
    
    // 2. Générer toutes les références possibles
    const references = [];
    if (indexData.schema && indexData.schema.lengths) {
      const lengths = indexData.schema.lengths;
      
      for (let chapter = 1; chapter <= lengths.length; chapter++) {
        for (let paragraph = 1; paragraph <= lengths[chapter - 1]; paragraph++) {
          references.push(`${bookTitle}.${chapter}.${paragraph}`);
        }
      }
    }
    
    return references;
    
  } catch (error) {
    console.error(`Erreur exploration ${bookTitle}:`, error);
    return [];
  }
}
```

## 🔍 Méthodes de Recherche Optimisées

### 1. Recherche par Mots-Clés Hébreux
```javascript
// Rechercher "אמונה" (foi) dans les textes Breslov
const query = "אמונה Breslov";
const results = await searchBreslovTexts(query);
```

### 2. Recherche par Concepts
```javascript
// Chercher des enseignements sur la joie
const joyTeachings = await searchBreslovTexts("שמחה joy Likutei Moharan");
```

### 3. Recherche dans un Livre Spécifique
```javascript
// Rechercher uniquement dans Sippurei Maasiyot
const storyResults = await searchBreslovTexts("מלך king Sippurei Maasiyot");
```

## ⚠️ Limitations et Bonnes Pratiques

### Limitations
- **Rate Limiting** : Maximum 1000 requêtes/heure par IP
- **Pas de textes français directs** : Principalement hébreu/anglais
- **Références exactes requises** : Format strict nécessaire
- **Disponibilité variable** : Tous les textes ne sont pas numérisés

### Bonnes Pratiques
- **Cache les réponses** pour éviter les requêtes répétitives
- **Gère les erreurs 404** pour les références inexistantes  
- **Utilise des timeouts** (5-10 secondes maximum)
- **Encode les URLs** avec `encodeURIComponent()`
- **Vérifie la disponibilité** avant de faire des requêtes bulk

## 🎯 Cas d'Usage pour Chayei Moharan

### 1. Recherche Contextuelle
```javascript
async function findChayeiMoharanContext(question) {
  // Rechercher d'abord dans Chayei Moharan
  const chayeiResults = await searchBreslovTexts(`${question} Chayei Moharan`);
  
  // Si pas de résultats, élargir aux autres textes Breslov
  if (chayeiResults.length === 0) {
    return await searchBreslovTexts(`${question} Breslov`);
  }
  
  return chayeiResults;
}
```

### 2. Récupération de Sections Complètes
```javascript
async function getChayeiMoharanChapter(chapterNumber) {
  const references = [];
  
  // Tenter de récupérer jusqu'à 50 paragraphes par chapitre
  for (let paragraph = 1; paragraph <= 50; paragraph++) {
    const ref = `Chayei Moharan.${chapterNumber}.${paragraph}`;
    const text = await getBreslovText(ref);
    
    if (text.available) {
      references.push(text);
    } else {
      break; // Arrêter si on atteint la fin du chapitre
    }
  }
  
  return references;
}
```

## 📝 Format de Réponse Recommandé

```javascript
function formatBreslovResponse(searchResults, originalQuestion) {
  return {
    question: originalQuestion,
    foundInSefaria: searchResults.length > 0,
    sources: searchResults.map(result => ({
      reference: result._source.ref,
      content: result._source.content,
      book: extractBookName(result._source.ref),
      relevanceScore: result._score
    })),
    summary: generateSummary(searchResults),
    recommendations: generateRecommendations(searchResults)
  };
}
```

## 🚀 Intégration avec l'Application Chayei Moharan

Pour intégrer Sefaria dans votre application :

1. **Créer un service Sefaria** avec les fonctions ci-dessus
2. **Ajouter un cache Redis/memory** pour optimiser les performances  
3. **Implémenter une recherche hybride** : Documents locaux + Sefaria API
4. **Créer des fallbacks intelligents** pour les références introuvables
5. **Ajouter de la traduction automatique** pour les textes hébreux

Cette API vous donne accès à la sagesse authentique de Rabbi Nahman de Breslev et à toute la littérature juive traditionnelle !