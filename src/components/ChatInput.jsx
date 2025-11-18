import { ArrowUp, Paperclip, Mic } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ input, setInput, onSend, loading, darkMode, selectedModel }) {
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  
  // Otomatik yükseklik ayarlama

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 128);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } else {
      alert('Tarayıcınız ses tanıma özelliğini desteklemiyor.');
    }
  };

  return (
    <div
      className={`border-t transition-colors ${
        darkMode ? 'border-white/10 bg-black/50 backdrop-blur-sm' : 'border-black/10 bg-white/50 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div
          className={`relative flex items-center gap-2 rounded-2xl transition-all border ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
          } ${
            isFocused 
              ? darkMode 
                ? 'shadow-[0_0_20px_rgba(255,255,255,0.6)] border-white/20' 
                : 'shadow-[0_0_20px_rgba(0,0,0,0.5)] border-black/20'
              : ''
          } px-2 py-2`}
        >
          {/* Ataç Butonu */}
          <button
            type="button"
            className={`p-2 rounded-lg transition-colors shrink-0 ${
              darkMode ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-black/10 text-black/50 hover:text-black'
            }`}
            onClick={() => alert('Dosya yükleme özelliği yakında!')}
            aria-label="Dosya ekle"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Mesajınızı yazın..."
            disabled={loading}
            className={`flex-1 bg-transparent outline-none border-none text-sm resize-none py-2 px-2 max-h-32 no-scrollbar leading-6 ${
              darkMode ? 'text-white placeholder-white/30' : 'text-black placeholder-black/30'
            } disabled:opacity-50 focus:outline-none focus:ring-0`}
            style={{ boxShadow: 'none' }}
          />

          {/* Ses butonu */}
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors shrink-0 ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse-slow'
                : darkMode 
                  ? 'hover:bg-white/10 text-white/50 hover:text-white' 
                  : 'hover:bg-black/10 text-black/50 hover:text-black'
            } disabled:opacity-50`}
            aria-label="Sesli mesaj"
            title={isRecording ? 'Dinleniyor...' : 'Sesli mesaj'}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Gönder Butonu */}
          <button
            type="button"
            onClick={onSend}
            disabled={!input.trim() || loading}
            className={`p-2 rounded-lg transition-all flex items-center justify-center shrink-0 ${
              !input.trim() || loading
                ? 'opacity-30 cursor-not-allowed'
                : darkMode 
                  ? 'bg-white text-black hover:bg-white/90' 
                  : 'bg-black text-white hover:bg-black/90'
            }`}
            aria-label="Mesaj gönder"
          >
            {loading ? (
              <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${
                darkMode ? 'border-black' : 'border-white'
              }`} />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Alt bilgi */}
        <p className={`text-xs text-center mt-3 transition-colors ${
          darkMode ? 'text-white/30' : 'text-black/30'
        }`}>
          Groq {selectedModel ? selectedModel.replace('llama-', 'Llama ').replace('mixtral-', 'Mixtral ') : 'Llama 3.1'}  
        </p>
      </div>
    </div>
  );
}