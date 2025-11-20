import { ArrowUp, Paperclip, Mic, Square } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ input, setInput, onSend, onStop, loading, darkMode, selectedModel, placeholderText }) {
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) onSend();
    }
  };
  
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

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } else {
      alert('Tarayıcınız ses tanıma özelliğini desteklemiyor.');
    }
  };
 
  return (
    <div
      className={`border-t transition-colors ${
        darkMode ? 'border-white/5 bg-black/50 backdrop-blur-md' : 'border-black/5 bg-white/50 backdrop-blur-md'
      }`}
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div
          className={`relative flex items-center gap-2 rounded-2xl  px-3 py-3
            transition-all duration-300 ease-out
            ${
            darkMode 
              ? isFocused 
                ? 'bg-black border-white 500/50 shadow-[0_0_40px_-10px_rgba(255,255,246,2.9)] -translate-y-0.5' 
                : 'bg-[#1a1a1a] border-white/5 shadow-none translate-y-0 hover:border-white/10' 
              : isFocused
                ? 'bg-white border-bl-500/30 shadow-[0_0_40px_-10px_rgba(60,60,60,4.9)] -translate-y-0.5'
                : 'bg-white border-zinc-200 shadow-sm translate-y-0 hover:border-zinc-300'
          }`}
        >
          <button
            type="button"
            className={`p-2 rounded-lg transition-colors shrink-0 ${
              darkMode ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-black/10 text-black/50 hover:text-black'
            }`}
            onClick={() => alert('Dosya yükleme özelliği yakında!')}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholderText || "Mesajınızı yazın..."} 
            disabled={loading}
            className={`flex-1 bg-transparent outline-none border-none text-sm resize-none py-2 px-2 max-h-32 no-scrollbar leading-6 ${
              darkMode ? 'text-white placeholder-white/30' : 'text-black placeholder-black/30'
            } disabled:opacity-50 focus:outline-none focus:ring-0`}
            style={{ boxShadow: 'none' }}
          />

          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors shrink-0 ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : darkMode 
                  ? 'hover:bg-white/10 text-white/50 hover:text-white' 
                  : 'hover:bg-black/10 text-black/50 hover:text-black'
            } disabled:opacity-50`}
          >
            <Mic className="w-5 h-5" />
          </button>

          {loading ? (
             <button
                type="button"
                onClick={onStop}
                className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center shrink-0 ${
                  darkMode ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'
                }`}
             >
               <div className="animate-pulse">
                 <Square className="w-5 h-5 fill-current" />
               </div>
             </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!input.trim()}
              className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center shrink-0 ${
                !input.trim()
                  ? 'opacity-30 cursor-default'
                  : darkMode 
                    ? 'bg-white text-black hover:bg-white/90 hover:scale-105' 
                    : 'bg-black text-white hover:bg-black/90 hover:scale-105'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <p className={`text-xs text-center mt-3 transition-colors duration-500 ${
          darkMode ? 'text-white/20' : 'text-black/20'
        }`}>
          Groq {selectedModel ? selectedModel.replace('llama-', 'Llama ').replace('mixtral-', 'Mixtral ') : 'Llama 3.1'}  
        </p>
      </div>
    </div>
  );
}