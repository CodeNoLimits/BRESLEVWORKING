// Application autonome Le Compagnon du Cœur - Version du 6 juillet
// Compatible avec tous les navigateurs et serveurs

const { useState, useEffect, createElement: h } = React;

// Composant principal Chayei Moharan
function ChayeiMoharanApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // TTS System amélioré - Version du 6 juillet
  const speak = (text) => {
    if (!text || !text.trim()) {
      console.log('🔇 TTS: Pas de texte à lire');
      return;
    }
    
    console.log('🔊 TTS: Lecture de:', text.substring(0, 50) + '...');
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTTSActive(false);
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.lang = 'fr-FR';
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;

        utterance.onstart = () => {
          console.log('🎵 TTS: Lecture démarrée');
          setIsTTSActive(true);
        };
        
        utterance.onend = () => {
          console.log('✅ TTS: Lecture terminée');
          setIsTTSActive(false);
        };
        
        utterance.onerror = (event) => {
          console.error('❌ TTS: Erreur:', event.error);
          setIsTTSActive(false);
        };

        // S'assurer que la voix française est disponible
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
        if (frenchVoice) {
          utterance.voice = frenchVoice;
          console.log('🗣️ TTS: Utilisation voix française:', frenchVoice.name);
        }

        window.speechSynthesis.speak(utterance);
        console.log('🎤 TTS: Commande speak() exécutée');
      }, 200);
    } else {
      console.warn('⚠️ TTS: speechSynthesis non supporté');
    }
  };

  const stopSpeaking = () => {
    console.log('🛑 TTS: Arrêt demandé');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTTSActive(false);
    }
  };

  // STT System optimisé du 3 juillet
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Votre navigateur ne supporte pas la reconnaissance vocale.');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      stopSpeaking(); // Arrêter TTS quand STT démarre
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Recherche avec API Gemini
  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    setIsLoading(true);
    console.log('🔍 Recherche spirituelle:', query);
    
    try {
      const response = await fetch('/api/gemini/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `En tant que sage spécialiste des enseignements de Rabbi Nahman de Breslev, réponds à cette question spirituelle: "${query}"`,
          context: 'Chayei Moharan - Enseignements de Rabbi Nahman de Breslev'
        })
      });

      console.log('📡 Réponse API statut:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données reçues:', data);
        
        const spiritualAnswer = data.response || data.text || 'Rabbi Nahman vous guide avec sagesse.';
        
        setSearchResult({
          answer: spiritualAnswer,
          sources: [data.context || 'Chayei Moharan - Enseignements de Rabbi Nahman'],
          foundInDocument: true,
          timestamp: data.timestamp
        });
        
        // Auto-lecture TTS
        console.log('🔊 TTS auto-lecture démarrant...');
        setTimeout(() => {
          speak(spiritualAnswer);
        }, 500);
        
      } else {
        const errorData = await response.text();
        console.error('❌ Erreur API:', response.status, errorData);
        throw new Error(`Erreur API: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Erreur recherche complète:', error);
      setSearchResult({
        answer: 'Une erreur est survenue. Rabbi Nahman vous accompagne toujours. Veuillez réessayer.',
        sources: [],
        foundInDocument: false
      });
    }
    setIsLoading(false);
  };

  // Chargement initial et configuration TTS
  useEffect(() => {
    setChapters([
      { number: 1, title: 'Enseignements spirituels de Rabbi Nahman' },
      { number: 2, title: 'La joie dans le service divin' },
      { number: 3, title: 'La foi et la proximité divine' }
    ]);

    // Charger les voix TTS
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('🗣️ TTS: Voix disponibles:', voices.length);
        const frenchVoices = voices.filter(voice => voice.lang.startsWith('fr'));
        console.log('🇫🇷 TTS: Voix françaises:', frenchVoices.map(v => v.name));
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  return h('div', { className: 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white' }, [
    
    // Header avec contrôles TTS/STT
    h('header', { 
      key: 'header',
      className: 'bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-6 py-4'
    }, [
      h('div', { 
        key: 'header-content',
        className: 'flex items-center justify-between'
      }, [
        h('div', {
          key: 'title',
          className: 'flex items-center space-x-3'
        }, [
          h('span', { key: 'icon', className: 'text-2xl' }, '❤️'),
          h('h1', { 
            key: 'title-text',
            className: 'text-2xl font-bold text-amber-400'
          }, 'Le Compagnon du Cœur')
        ]),
        
        h('div', {
          key: 'controls',
          className: 'flex items-center space-x-2'
        }, [
          h('button', {
            key: 'mic-btn',
            onClick: isListening ? () => setIsListening(false) : startListening,
            className: `p-3 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`,
            title: 'Reconnaissance vocale'
          }, isListening ? '🔴' : '🎤'),
          
          h('button', {
            key: 'tts-btn',
            onClick: isTTSActive ? stopSpeaking : () => speak("Test de la lecture vocale"),
            className: `p-3 rounded-lg transition-colors ${
              isTTSActive 
                ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`,
            title: 'Lecture vocale'
          }, isTTSActive ? '🔇' : '🔊')
        ])
      ])
    ]),

    // Zone principale
    h('div', { key: 'main', className: 'flex flex-1' }, [
      
      // Sidebar
      h('div', { 
        key: 'sidebar',
        className: 'w-80 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 p-6'
      }, [
        h('div', { key: 'sidebar-content' }, [
          h('h2', {
            key: 'sidebar-title',
            className: 'text-lg font-semibold text-amber-400 mb-4 flex items-center'
          }, [
            h('span', { key: 'sparkles', className: 'mr-2' }, '✨'),
            'Modes d\'Interaction'
          ]),
          
          h('div', { key: 'modes', className: 'space-y-2 mb-6' }, [
            h('div', {
              key: 'chat-mode',
              className: 'w-full p-3 rounded-lg bg-amber-600/20 border border-amber-500/50 text-amber-300'
            }, [
              h('div', { key: 'chat-icon', className: 'flex items-start space-x-3' }, [
                h('span', { key: 'icon' }, '💬'),
                h('div', { key: 'content' }, [
                  h('div', { key: 'label', className: 'font-medium' }, 'Conversation Spirituelle'),
                  h('div', { key: 'desc', className: 'text-xs opacity-75 mt-1' }, 'Dialogue sur les enseignements')
                ])
              ])
            ])
          ]),

          h('div', { 
            key: 'teachings',
            className: 'bg-slate-700/30 rounded-lg p-4'
          }, [
            h('h3', {
              key: 'teachings-title',
              className: 'text-amber-400 font-medium mb-2'
            }, '🕊️ Enseignements Disponibles'),
            h('ul', {
              key: 'teachings-list',
              className: 'text-sm text-slate-300 space-y-1'
            }, [
              h('li', { key: 'item1' }, '• Chayei Moharan (Vie de Rabbi Nahman)'),
              h('li', { key: 'item2' }, '• Likutei Moharan (Recueil d\'Enseignements)'),
              h('li', { key: 'item3' }, '• Sippurei Maasiyot (Contes Mystiques)'),
              h('li', { key: 'item4' }, '• Likutei Tefilot (Recueil de Prières)')
            ])
          ])
        ])
      ]),

      // Zone de contenu
      h('div', { key: 'content-area', className: 'flex-1 flex flex-col' }, [
        
        // Zone de recherche
        h('div', { 
          key: 'search-area',
          className: 'p-6'
        }, [
          h('div', { 
            key: 'search-box',
            className: 'flex items-end space-x-4'
          }, [
            h('div', { key: 'input-container', className: 'flex-1' }, [
              h('textarea', {
                key: 'search-input',
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                onKeyPress: (e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch();
                  }
                },
                placeholder: 'Posez votre question spirituelle...',
                className: 'w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50',
                rows: 3,
                disabled: isLoading
              }),
            ]),
            
            h('button', {
              key: 'send-btn',
              onClick: () => handleSearch(),
              disabled: !searchQuery.trim() || isLoading,
              className: 'p-4 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            }, '📤')
          ])
        ]),

        // Zone de messages
        h('div', { 
          key: 'messages-area',
          className: 'flex-1 overflow-y-auto p-6 space-y-4'
        }, [
          
          // Message de bienvenue
          !searchResult && h('div', {
            key: 'welcome',
            className: 'text-center text-slate-400 py-12'
          }, [
            h('div', { key: 'heart', className: 'text-6xl mb-4' }, '❤️'),
            h('h3', { 
              key: 'welcome-title',
              className: 'text-xl font-semibold mb-2'
            }, 'Bienvenue dans Le Compagnon du Cœur'),
            h('p', {
              key: 'welcome-text',
              className: 'text-slate-500'
            }, 'Posez une question spirituelle ou explorez les enseignements de Rabbi Nahman de Breslev')
          ]),

          // Résultat de recherche
          searchResult && h('div', {
            key: 'search-result',
            className: 'bg-slate-700/50 p-6 rounded-lg border border-slate-600/50'
          }, [
            h('h3', {
              key: 'result-title',
              className: 'text-lg font-semibold text-green-400 mb-4'
            }, '🔍 Réponse de Rabbi Nahman'),
            
            h('div', {
              key: 'result-content',
              className: 'text-slate-100 leading-relaxed mb-4'
            }, searchResult.answer),
            
            searchResult.sources.length > 0 && h('div', {
              key: 'sources',
              className: 'border-t border-slate-600/50 pt-3'
            }, [
              h('div', {
                key: 'sources-label',
                className: 'text-xs text-slate-400 mb-1'
              }, 'Sources :'),
              ...searchResult.sources.map((source, idx) => 
                h('div', {
                  key: idx,
                  className: 'text-xs text-slate-500'
                }, source)
              )
            ]),
            
            h('div', {
              key: 'result-controls',
              className: 'flex gap-2 mt-4'
            }, [
              h('button', {
                key: 'listen-btn',
                onClick: () => speak(searchResult.answer),
                className: 'px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm'
              }, '🔊 Écouter')
            ])
          ]),

          // Indicateur de chargement
          isLoading && h('div', {
            key: 'loading',
            className: 'bg-slate-700/50 p-4 rounded-lg border border-slate-600/50'
          }, [
            h('div', {
              key: 'loading-content',
              className: 'flex items-center space-x-2'
            }, [
              h('div', {
                key: 'spinner',
                className: 'animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500'
              }),
              h('span', {
                key: 'loading-text',
                className: 'text-slate-300'
              }, 'Rabbi Nahman réfléchit...')
            ])
          ])
        ])
      ])
    ])
  ]);
}

// Initialisation de l'application
console.log('🕊️ Le Compagnon du Cœur - Version autonome du 6 juillet...');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(ChayeiMoharanApp));

console.log('✅ Le Compagnon du Cœur - Application spirituelle active!');