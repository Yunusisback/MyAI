import { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { sendMessage } from './api/aiService';
import { Moon, Sun, Settings, User, PanelLeft, Download, Plus, MessageSquare, Trash2, Archive, HelpCircle, ChevronRight, Globe } from 'lucide-react';
import Lottie from 'lottie-react';
import eyeAnimation from './assets/eye-animation.json'; 
import logoAnimation from './assets/logo-animation.json';
import { translations } from './constants/translations';

function App() {
  const [showSidebar, setShowSidebar] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  
  // Dil State
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'tr';
  });

  // Seçili dilin çevirilerini al
  const t = translations[language];

  const [messages, setMessages] = useState([{ role: 'assistant', content: language === 'tr' ? 'Merhaba! Size nasıl yardımcı olabilirim?' : 'Hello! How can I help you?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode !== null ? savedDarkMode === 'true' : true;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Misafir');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);
  const [selectedModel, setSelectedModel] = useState('llama-3.1-8b-instant');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  
  const [conversations] = useState([{ id: 1, title: language === 'tr' ? 'Yeni Konuşma' : 'New Chat', date: 'Bugün', messages: 3 }]);
  
  const messagesEndRef = useRef(null);
  const tokenQueueRef = useRef([]); 
  const typingIntervalRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  // Dil Değiştirme Fonksiyonu 
  const toggleLanguage = () => {
    const newLang = language === 'tr' ? 'en' : 'tr';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUsername(tempName);
      localStorage.setItem('username', tempName);
      setIsEditingName(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{ role: 'assistant', content: language === 'tr' ? 'Merhaba! Size nasıl yardımcı olabilirim?' : 'Hello! How can I help you?' }]);
    setShowSettings(false);
  };

  const handleNewChat = () => {
    handleClearChat();
    if (window.innerWidth < 1024) setShowSidebar(false);
  };

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const handleExportChat = () => {
    const chatText = messages.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const models = [
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Hızlı / Fast' },
    { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', description: 'Güçlü / Powerful' },
    { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', description: 'Dengeli / Balanced' },
  ];

  const handleModelSelect = (modelId) => { setSelectedModel(modelId); setShowModelDropdown(false); };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    tokenQueueRef.current = [];

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage, { role: 'assistant', content: '' }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const apiMessages = newMessages.slice(0, -1).map(msg => ({ role: msg.role, content: msg.content }));

    typingIntervalRef.current = setInterval(() => {
      if (tokenQueueRef.current.length > 0) {
        const char = tokenQueueRef.current.shift(); 
        setMessages(prev => 
          prev.map((msg, i) => 
            i === prev.length - 1 
              ? { ...msg, content: msg.content + char } 
              : msg
          )
        );
      }
    }, 10);

    try {
      await sendMessage(
        apiMessages,
        selectedModel,
        (token) => {
          const chars = token.split('');
          tokenQueueRef.current.push(...chars);
        },
        () => {
          const checkQueue = setInterval(() => {
            if (tokenQueueRef.current.length === 0) {
              clearInterval(checkQueue);
              clearInterval(typingIntervalRef.current);
              setLoading(false);
            }
          }, 100);
        }
      );
    } catch (error) {
      console.error("API Hatası:", error);
      clearInterval(typingIntervalRef.current);
      setMessages(prev => prev.map((msg, i) => i === prev.length - 1 ? { ...msg, content: 'Error occurred. Please try again.' } : msg));
      setLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt) => setInput(prompt);

  return (
    <div className={`flex h-screen transition-colors duration-200 ${
      darkMode ? 'bg-[#09090b] text-white' : 'bg-white text-gray-900'
    }`}>
      
      {/* SIDEBAR  */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 overflow-hidden
        ${darkMode ? 'bg-[#09090b] border-white/5' : 'bg-zinc-50 border-zinc-200'}
        w-[280px]
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative
        ${showSidebar ? 'lg:w-[280px]' : 'lg:w-0 lg:border-none'}
      `}>
        
        {/* LOGO ALANI */}
        <div className="px-6 pt-8 pb-6 flex items-center justify-between min-w-[280px]">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center">
                  <Lottie 
                    animationData={eyeAnimation} 
                    loop={true}
                    style={{ width: 55, height: 55 }}
                    className="scale-[1.6]" 
                  />
                </div>
                <span className={`font-bold text-lg tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                  AI Assistant
                </span>
            </div>

            <button 
              onClick={toggleSidebar} 
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200'
              }`}
              title="Kenar çubuğunu kapat"
            >
                <PanelLeft className="w-5 h-5" />
            </button>
        </div>

        {/* KONUŞMA BUTONU */}
        <div className="px-4 pb-6 min-w-[280px]">
          <button onClick={handleNewChat} className={`
            group flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 border shadow-sm
            ${
              darkMode 
                ? 'bg-white/5 hover:bg-white/10 border-white/5 text-white hover:border-white/10' 
                : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300'
            }
          `}>
             <div className={`
               p-1 rounded-lg transition-colors
               ${darkMode ? 'bg-blue-600 text-white' : 'bg-black text-white'}
             `}>
               <Plus className="w-4 h-4" />
             </div>
             <span className="text-sm font-medium">{t.newChat}</span> 
          </button>
        </div>

        {/* MENÜ LİSTESİ */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-thin min-w-[280px]">
           
           {/* Araçlar */}
           <div className="space-y-1">
             <button onClick={() => alert('Projeler')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors text-sm font-medium ${
                 darkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
               }`}><Archive className="w-4 h-4 shrink-0" /><span>{t.projects}</span></button>
             <button onClick={() => { setShowSettings(prev => !prev); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors text-sm font-medium ${
                 darkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
               }`}><Settings className="w-4 h-4 shrink-0" /><span>{t.settings}</span></button>
             <button onClick={() => alert('Yardım')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors text-sm font-medium ${
                 darkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
               }`}><HelpCircle className="w-4 h-4 shrink-0" /><span>{t.help}</span></button>
           </div>

           {/* Geçmiş */}
           <div>
             <h3 className={`text-[11px] font-bold px-4 mb-3 tracking-widest uppercase ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{t.history}</h3>
             <div className="space-y-1">
                {conversations.map((conv) => (
                  <button key={conv.id} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors group ${
                      darkMode ? 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                    }`}>
                    <span className="flex-1 text-sm truncate opacity-90">{conv.title}</span>
                    <Trash2 className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-400 hover:text-red-600'}`} />
                  </button>
                ))}
             </div>
           </div>
        </div>

        {/* PROFİL */}
        <div className={`p-4 mt-auto min-w-[280px] border-t ${darkMode ? 'border-white/5' : 'border-zinc-200'}`}>
          <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer group ${darkMode ? 'hover:bg-white/5' : 'hover:bg-zinc-100'}`}>
             <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${darkMode ? 'bg-zinc-800 text-white border border-white/10' : 'bg-white text-zinc-900 border border-zinc-200'}`}>
                <User className="w-4 h-4" />
             </div>
             <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${darkMode ? 'text-zinc-200 group-hover:text-white' : 'text-zinc-700 group-hover:text-black'}`}>{username}</div>
                <div className={`text-xs truncate ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>{t.freePlan}</div>
             </div>
          </div>
        </div>
      </div>

      {showSidebar && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setShowSidebar(false)} />}

      {/*  ANA İÇERİK  */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* HEADER */}
        <div className={`border-b transition-colors relative z-50 ${
            darkMode ? 'bg-black/50 backdrop-blur-sm border-white/10' : 'bg-white/80 backdrop-blur-sm border-gray-200'
        }`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              
              {/* Sidebar Açma Butonu */}
              {!showSidebar && (
                  <button onClick={toggleSidebar} className={`p-2 -ml-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/10 text-gray-600 hover:text-black'}`} title="Kenar çubuğunu göster">
                    <PanelLeft className="w-6 h-6" />
                  </button>
              )}
              
              {!showSidebar && (
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <Lottie 
                          animationData={eyeAnimation} 
                          loop={true}
                          style={{ width: 40, height: 40 }}
                          className="scale-[1.5]" 
                        />
                     </div>
                 </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* DİL DEĞİŞTİRME BUTONU  */}
              <button 
                onClick={toggleLanguage} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                  darkMode 
                    ? 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/10' 
                    : 'border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
                title="Dili Değiştir / Switch Language"
              >
                {language === 'tr' ? 'EN' : 'TR'}
              </button>

              <div className="relative">
                <button onClick={() => setShowModelDropdown(!showModelDropdown)} className={`text-sm px-3 py-2 rounded-lg border outline-none transition-colors flex items-center gap-2 font-medium ${
                    darkMode ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}>
                  <span>{models.find(m => m.id === selectedModel)?.name}</span>
                  <svg className={`w-4 h-4 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showModelDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />
                    <div className={`absolute top-full right-0 mt-2 w-56 rounded-lg border shadow-lg z-50 overflow-hidden animate-fadeIn ${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'}`}>
                      {models.map((model) => (
                        <button key={model.id} onClick={() => handleModelSelect(model.id)} className={`w-full px-4 py-3 text-left transition-colors border-b last:border-b-0 ${
                            selectedModel === model.id ? (darkMode ? 'bg-white/10 border-white/5' : 'bg-gray-50 border-gray-200') : (darkMode ? 'hover:bg-white/5 border-white/5' : 'hover:bg-gray-50 border-gray-100')
                          }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>{model.name}</p>
                              <p className={`text-xs mt-0.5 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{model.description}</p>
                            </div>
                            {selectedModel === model.id && <svg className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button onClick={handleExportChat} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/10 text-black/70'}`}><Download className="w-5 h-5" /></button>
              <button onClick={toggleDarkMode} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/10 text-black/70'}`}>{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
              <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/10 text-black/70'}`}><Settings className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className={`border-b transition-colors relative z-40 animate-slideDown ${darkMode ? 'bg-black/50 border-white/10' : 'bg-white/50 border-gray-200'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-4">
              <h2 className={`text-sm font-semibold ${darkMode ? 'text-white/70' : 'text-black/70'}`}>{t.settingsTitle}</h2>
              <div className="space-y-3">
                <div>
                  <label className={`text-xs mb-2 block ${darkMode ? 'text-white/50' : 'text-black/50'}`}>{t.username}</label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveName()} className={`flex-1 px-3 py-2 rounded-lg text-sm border outline-none ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-black focus:border-blue-500'}`} autoFocus />
                      <button onClick={handleSaveName} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">{t.save}</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-black/70'}`}>{username}</span>
                      <button onClick={() => setIsEditingName(true)} className={`text-xs px-3 py-1 rounded ${darkMode ? 'text-blue-400 hover:bg-white/5' : 'text-blue-600 hover:bg-black/5'}`}>{t.edit}</button>
                    </div>
                  )}
                </div>
                <button onClick={handleClearChat} className={`w-full px-4 py-2 rounded-lg text-sm font-medium border ${darkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100'}`}>{t.clearChat}</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {messages.length === 1 && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex">
                    <Lottie 
                      animationData={logoAnimation} 
                      loop={true}
                      style={{ width: 200, height: 200  }}
                    />
                  </div>
                  
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.welcomeTitle}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {t.prompts.map((item, index) => (
                    <button key={index} onClick={() => handleSuggestedPrompt(item.prompt)} className={`p-4 rounded-xl text-left transition-all hover:scale-[1.02] border ${darkMode ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-900 shadow-sm'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{item.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.length > 1 && (
              <div className="space-y-10 sm:space-y-12">
                {messages.slice(1).map((msg, index) => (
                  <div key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                    <ChatMessage message={msg.content} role={msg.role} darkMode={darkMode} />
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <ChatInput 
           input={input} 
           setInput={setInput} 
           onSend={handleSend} 
           loading={loading} 
           darkMode={darkMode} 
           selectedModel={selectedModel} 
           placeholderText={t.inputPlaceholder} 
        />
      </div>
    </div>
  );
}

export default App;