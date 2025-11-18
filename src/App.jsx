import { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { sendMessage } from './api/aiService';
import { Sparkles, Moon, Sun, Settings, User, Menu, X, Download, Plus, MessageSquare, Trash2, Archive, HelpCircle } from 'lucide-react';

function App() {

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! Size nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Misafir');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3.1-8b-instant');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [conversations, setConversations] = useState([
    { id: 1, title: 'Yeni Konuşma', date: 'Bugün', messages: 3 }
  ]);
  const messagesEndRef = useRef(null);

  // Mesajların en altına otomatik kaydırma
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Karanlık mod tercihini localStorage dan yükle
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Karanlık modu değiştir
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  // Kullanıcı adını kaydet
  const handleSaveName = () => {
    if (tempName.trim()) {
      setUsername(tempName);
      localStorage.setItem('username', tempName);
      setIsEditingName(false);
    }
  };

  // Sohbeti temizle
  const handleClearChat = () => {
    setMessages([{ role: 'assistant', content: 'Merhaba! Size nasıl yardımcı olabilirim?' }]);
    setShowSettings(false);
  };

  // Yeni sohbet başlat
  const handleNewChat = () => {
    handleClearChat();
    setShowSidebar(false);
  };

  // Sohbeti dışa aktar (txt dosyası)
  const handleExportChat = () => {
    const chatText = messages.map(msg => 
      `${msg.role === 'user' ? 'Kullanıcı' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Önerilen promptlar
  const suggestedPrompts = [
    { text: 'Bugün Neler Oldu?', prompt: 'Dünyadan ve Türkiyeden Haberler' },
    { text: 'Küresel Kriz Analizi', prompt: 'Son dönemde dünya çapında öne çıkan bir jeopolitik çatışmayı veya ekonomik krizi analiz et ve olası etkilerini değerlendir' },
    { text: 'Enflasyon ve Ekonomi ', prompt: 'Türkiye\'de son üç ayda enflasyonun tüketime etkileri hakkında kısa bir analiz sun.' },
    { text: 'Seyahat Tavsiyeleri', prompt: 'Vizesiz seyahat edilebilecek en popüler 3 ülke ve bütçe dostu konaklama önerilerini listele' },
  ];

  // Kullanılabilir modeller
  const models = [
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Hızlı ve verimli' },
    { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', description: 'Güçlü ve akıllı' },
    { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', description: 'Dengeli performans' },
  ];

  // Model seçimi
  const handleModelSelect = (modelId) => {
    setSelectedModel(modelId);
    setShowModelDropdown(false);
  };

  // Mesaj gönderme işlemi
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage, { role: 'assistant', content: '' }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const apiMessages = newMessages.slice(0, -1).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      await sendMessage(
        apiMessages,
        selectedModel,
        (token) => {
          setMessages(prev => 
            prev.map((msg, i) => 
              i === prev.length - 1 
                ? { ...msg, content: msg.content + token } 
                : msg
            )
          );
        },
        () => setLoading(false)
      );
    } catch (error) {
      setMessages(prev => 
        prev.map((msg, i) => 
          i === prev.length - 1 
            ? { ...msg, content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' } 
            : msg
        )
      );
      setLoading(false);
    }
  };

  // Önerilen prompt seçildiğinde inputa yaz
  const handleSuggestedPrompt = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className={`flex h-screen transition-colors duration-200 ${
      darkMode ? 'bg-black dot-grid-pattern' : 'bg-white dot-grid-pattern-light'
    }`}>
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 border-r ${
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      } ${
        darkMode 
          ? 'bg-neutral-900 border-white/10' 
          : 'bg-gray-50 border-black/10'     
      } lg:relative lg:translate-x-0`}>
        
        {/* Sidebar Üst Kısım */}
        <div className={`p-4 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              darkMode ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Yeni Konuşma</span>
          </button>
        </div>

        {/* Ana Navigasyon */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
          {/* Sabit Menü Öğeleri */}
          <div className="space-y-1">
            <button
              onClick={() => alert('Projeler sayfasına yönlendirilecek.')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                darkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/70 hover:text-black'
              }`}
            >
              <Archive className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Projeler</span>
            </button>

            <button
              onClick={() => { setShowSettings(prev => !prev); setShowSidebar(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                darkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/70 hover:text-black'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Ayarlar</span>
            </button>
            
            <button
              onClick={() => alert('Yardım / Dokümantasyon sayfasına yönlendirilecek.')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                darkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/70 hover:text-black'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Yardım</span>
            </button>
          </div>

          {/* Geçmiş Konuşmalar Listesi */}
          <div className='pt-2 border-t border-dashed'>
            <h3 className={`text-xs font-semibold mb-3 px-2 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
              GEÇMİŞ
            </h3>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors group ${
                  darkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/70 hover:text-black'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>{conv.date}</p>
                </div>
                <Trash2 className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                  darkMode ? 'text-white/40 hover:text-red-400' : 'text-black/40 hover:text-red-600'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Alt Kısım */}
        <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            darkMode ? 'bg-white/5' : 'bg-black/5'
          }`}>
            <User className={`w-4 h-4 ${darkMode ? 'text-white/50' : 'text-black/50'}`} />
            <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-black/70'}`}>{username}</span>
          </div>
        </div>
      </div>

      {/* Mobil için overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col">
        
        {/* Üst Bar (Header) */}
        <div className={`border-b transition-colors ${
          darkMode ? 'bg-black/50 backdrop-blur-sm border-white/10' : 'bg-white/50 backdrop-blur-sm border-black/10'
        }`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            
            <div className="flex items-center gap-3">
              {/* Mobil menü butonu */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-2.5 rounded-lg transition-colors lg:hidden ${
                  darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-black'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <Sparkles className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-black'}`} />
                <h1 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                  AI Assistant
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              
              {/* Model Seçici */}
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className={`text-sm px-4 py-2.5 rounded-lg border outline-none transition-colors flex items-center gap-2 font-medium ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10' 
                      : 'bg-black/5 border-black/10 text-black/80 hover:bg-black/10'
                  }`}
                >
                  <span>{models.find(m => m.id === selectedModel)?.name}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Model Dropdown Menüsü */}
                {showModelDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowModelDropdown(false)}
                    />
                    <div className={`absolute top-full right-0 mt-2 w-56 rounded-lg border shadow-lg z-50 overflow-hidden animate-fadeIn ${
                      darkMode 
                        ? 'bg-black border-white/10' 
                        : 'bg-white border-black/10'
                    }`}>
                      {models.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleModelSelect(model.id)}
                          className={`w-full px-4 py-3 text-left transition-colors border-b last:border-b-0 ${
                            selectedModel === model.id
                              ? darkMode
                                ? 'bg-white/10 border-white/5'
                                : 'bg-black/10 border-black/5'
                              : darkMode
                                ? 'hover:bg-white/5 border-white/5'
                                : 'hover:bg-black/5 border-black/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                darkMode ? 'text-white' : 'text-black'
                              }`}>
                                {model.name}
                              </p>
                              <p className={`text-xs mt-0.5 ${
                                darkMode ? 'text-white/40' : 'text-black/40'
                              }`}>
                                {model.description}
                              </p>
                            </div>
                            {selectedModel === model.id && (
                              <svg 
                                className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-black'}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Sohbeti Dışa Aktar */}
              <button
                onClick={handleExportChat}
                className={`p-2.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-black/10 text-black/70 hover:text-black'
                }`}
                title="Export Chat"
              >
                <Download className="w-5 h-5" />
              </button>

              {/* Tema  */}
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-black/10 text-black/70 hover:text-black'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Ayarlar Butonu */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-black/10 text-black/70 hover:text-black'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Ayarlar Paneli */}
        {showSettings && (
          <div className={`border-b transition-colors ${
            darkMode ? 'bg-black/50 border-white/10' : 'bg-white/50 border-black/10'
          }`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-4">
              <h2 className={`text-sm font-semibold ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                Ayarlar
              </h2>

              <div className="space-y-3">
                <div>
                  <label className={`text-xs mb-2 block ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    Kullanıcı Adı
                  </label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm border outline-none focus:ring-1 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-white/5 border-white/10 text-white' 
                            : 'bg-black/5 border-black/10 text-black'
                        }`}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Kaydet
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                        {username}
                      </span>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className={`text-xs px-3 py-1 rounded transition-colors ${
                          darkMode ? 'text-blue-400 hover:bg-white/5' : 'text-blue-600 hover:bg-black/5'
                        }`}
                      >
                        Düzenle
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleClearChat}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    darkMode 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                      : 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20'
                  }`}
                >
                  Sohbeti Temizle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mesaj Alanı */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            
            {/* Boş durum önerilen sorular bölümü */}
            {messages.length === 1 && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <div className="text-center space-y-3">
                  <div className={`inline-flex p-4 rounded-2xl ${
                    darkMode ? 'bg-white/5' : 'bg-black/5'
                  }`}>
                    <Sparkles className={`w-12 h-12 ${darkMode ? 'text-white' : 'text-black'}`} />
                  </div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                    Nasıl yardımcı olabilirim?
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    Aşağıdaki önerilerden birini seçin veya kendi sorunuzu yazın
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {suggestedPrompts.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(item.prompt)}
                      className={`p-4 rounded-xl text-left transition-all hover:scale-[1.02] border ${
                        darkMode 
                          ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white' 
                          : 'bg-black/10 hover:bg-black/20 border-black/10 text-black'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-sm font-medium">{item.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mesaj Listesi */}
            {messages.length > 1 && (
              <div className="space-y-6">
                {messages.slice(1).map((msg, index) => (
                  <div 
                    key={index}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ChatMessage 
                      message={msg.content} 
                      role={msg.role}
                      darkMode={darkMode}
                    />
                  </div>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Giriş Alanı */}
        <ChatInput 
          input={input}
          setInput={setInput}
          onSend={handleSend}
          loading={loading}
          darkMode={darkMode}
          selectedModel={selectedModel}
        />
      </div>
    </div>
  );
}

export default App;