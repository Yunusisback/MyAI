import { useState, useRef, useEffect, useMemo } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import { sendMessage } from './api/aiService';
import { translations } from './constants/translations';

function App() {
  // Temel durumlar
  const [showSidebar, setShowSidebar] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'tr');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : true;
  });
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Misafir');
  const [selectedModel, setSelectedModel] = useState('llama-3.1-8b-instant');

  // Ref'ler
  const messagesEndRef = useRef(null);
  const tokenQueueRef = useRef([]);
  const typingIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  const t = translations[language];

  // Aktif sohbet mesajları 
  const messages = useMemo(() => {
    const chat = chats.find(c => c.id === activeChatId);
    return chat ? chat.messages : [];
  }, [chats, activeChatId]);


  
  // Yeni sohbet oluştur
  function handleNewChat() {
    const newId = Date.now();
    const welcome = language === 'tr' ? 'Merhaba! Size nasıl yardımcı olabilirim?' : 'Hello! How can I help you?';
    const newChat = {
      id: newId,
      title: language === 'tr' ? 'Yeni Konuşma' : 'New Chat',
      date: new Date().toISOString(),
      messages: [{ role: 'assistant', content: welcome }]
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    if (window.innerWidth < 1024) setShowSidebar(false);
  }

  // Otomatik scroll
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  // LocalStorage senkronizasyonu
  useEffect(() => localStorage.setItem('chatHistory', JSON.stringify(chats)), [chats]);
  
  // Başlangıç kontrolü
  useEffect(() => {
    if (chats.length === 0 && !activeChatId) handleNewChat();
    else if (chats.length > 0 && !activeChatId) setActiveChatId(chats[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dil ve tema değiştir
  const toggleLanguage = () => {
    const newLang = language === 'tr' ? 'en' : 'tr';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  // Kullanıcı adı güncelle
  const handleUpdateUsername = (newName) => {
    setUsername(newName);
    localStorage.setItem('username', newName);
  };

  // Sohbet sil
  const handleDeleteChat = (id) => {
    const remaining = chats.filter(c => c.id !== id);
    setChats(remaining);
    if (activeChatId === id) {
      remaining.length > 0 ? setActiveChatId(remaining[0].id) : handleNewChat();
    }
  };

  // Mevcut sohbeti temizle
  const handleClearChat = () => {
    setChats(prev => prev.map(c =>
      c.id === activeChatId ? { ...c, messages: [{ role: 'assistant', content: t.welcomeTitle }] } : c
    ));
    setShowSettings(false);
  };

  // Sohbeti dışa aktar
  const handleExportChat = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Yanıt üretimi durdur
  const handleStop = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    clearInterval(typingIntervalRef.current);
    setLoading(false);
  };

  // Mesaj gönder
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    let currentChatId = activeChatId;
    if (!currentChatId) {
      handleNewChat();
      currentChatId = Date.now();
    }

    clearInterval(typingIntervalRef.current);
    tokenQueueRef.current = [];

    const userMessage = { role: 'user', content: input };

    // Kullanıcı mesajını ekle  boş AI mesajı
    setChats(prev => prev.map(c => {
      if (c.id === currentChatId) {
        const isFirst = c.messages.length === 1;
        const title = isFirst ? input.slice(0, 30) + (input.length > 30 ? '...' : '') : c.title;
        return {
          ...c,
          title,
          messages: [...c.messages, userMessage, { role: 'assistant', content: '' }]
        };
      }
      return c;
    }));

    setInput('');
    setLoading(true);
    abortControllerRef.current = new AbortController();

    // Yazma animasyonu
    typingIntervalRef.current = setInterval(() => {
      if (tokenQueueRef.current.length > 0) {
        const char = tokenQueueRef.current.shift();
        setChats(prev => prev.map(chat => {
          if (chat.id === currentChatId) {
            const msgs = [...chat.messages];
            msgs[msgs.length - 1].content += char;
            return { ...chat, messages: msgs };
          }
          return chat;
        }));
      }
    }, 10);

    try {
      const chat = chats.find(c => c.id === currentChatId) || { messages: [] };
      const apiMessages = [...chat.messages, userMessage].map(m => ({ role: m.role, content: m.content }));

      await sendMessage(
        apiMessages,
        selectedModel,
        (token) => tokenQueueRef.current.push(...token.split('')),
        () => {
          const check = setInterval(() => {
            if (tokenQueueRef.current.length === 0) {
              clearInterval(check);
              clearInterval(typingIntervalRef.current);
              setLoading(false);
            }
          }, 100);
        },
        abortControllerRef.current.signal
      );
    } catch (err) {
      if (err.name !== 'AbortError') console.error('API Hatası:', err);
      clearInterval(typingIntervalRef.current);
      setLoading(false);
    }
  };

  return (
    <div className={`flex h-screen transition-colors duration-200 ${darkMode ? 'bg-[#09090b] text-white' : 'bg-white text-gray-900'}`}>
      
      {/* Sidebar */}
      <Sidebar
        showSidebar={showSidebar}
        toggleSidebar={() => setShowSidebar(!showSidebar)}
        darkMode={darkMode}
        t={t}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={(id) => {
          setActiveChatId(id);
          if (window.innerWidth < 1024) setShowSidebar(false);
        }}
        onDeleteChat={handleDeleteChat}
        onToggleSettings={() => setShowSettings(true)}
        username={username}
      />

      {/* Ana içerik */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Üst bar */}
        <Header
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          language={language}
          toggleLanguage={toggleLanguage}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          onExportChat={handleExportChat}
          onToggleSettings={() => setShowSettings(true)}
        />

        {/* Ayarlar modalı */}
        <Settings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          darkMode={darkMode}
          t={t}
          username={username}
          onUpdateUsername={handleUpdateUsername}
          onClearChat={handleClearChat}
        />

        {/* Mesaj alanı */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {messages.length <= 1 ? (
              <WelcomeScreen t={t} darkMode={darkMode} onPromptSelect={setInput} />
            ) : (
              <div className="space-y-10 sm:space-y-12">
                {messages.slice(1).map((msg, i) => (
                  <div key={i} className="animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                    <ChatMessage message={msg.content} role={msg.role} darkMode={darkMode} />
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Giriş alanı */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onStop={handleStop}
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