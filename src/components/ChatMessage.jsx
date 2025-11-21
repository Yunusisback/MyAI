import { User, Copy, Check, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Lottie from 'lottie-react';
import logoAnimation from '../assets/logo-animation.json';

// yazıyor typing animasyonu
const TypingIndicator = ({ darkMode }) => (
  <div className={`flex items-center gap-1 p-2 h-6 mt-1`}>
    <div className={`w-1.5 h-1.5 rounded-full typing-dot ${darkMode ? 'bg-zinc-400' : 'bg-zinc-500'}`}></div>
    <div className={`w-1.5 h-1.5 rounded-full typing-dot ${darkMode ? 'bg-zinc-400' : 'bg-zinc-500'}`}></div>
    <div className={`w-1.5 h-1.5 rounded-full typing-dot ${darkMode ? 'bg-zinc-400' : 'bg-zinc-500'}`}></div>
  </div>
);

export default function ChatMessage({ message, role, darkMode }) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [reaction, setReaction] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReaction = (type) => {
    setReaction(reaction === type ? null : type);
  };

  return (
    <div
      className={`flex gap-4 sm:gap-6 w-full group ${isUser ? 'flex-row-reverse' : ''} items-start`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* avatar */}
      <div
        className={`
          shrink-0 flex items-center justify-center rounded-full mt-1
          w-9 h-9 sm:w-10 sm:h-10
          ${!isUser ? '-ml-2' : ''}
          ${
            isUser 
              ? (darkMode ? 'bg-transparent text-white' : 'bg-transparent text-zinc-900')
              : 'bg-transparent overflow-visible' 
          }
        `}
      >
        {isUser ? (
          // Kullanıcı Avatarı (Sadece İkon)
          <div className={`p-1.5 rounded-md ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
             <User className="w-5 h-5" strokeWidth={2} />
          </div>
        ) : (
          // AI Animasyonu
          <div className="w-full h-full flex items-center justify-center">
             <Lottie 
               animationData={logoAnimation} 
               loop={true}
               className="scale-[1.6]" 
             />
          </div>
        )}
      </div>

      {/* mesaj içeriği*/}
      <div className={`
        flex-1 max-w-[85%] sm:max-w-3xl relative 
        ${isUser ? 'flex justify-end' : ''}
        mt-2
      `}>
     
        <div
          className={`px-1 sm:px-5 py-1 sm:py-2 transition-all ${
            isUser
              ? (darkMode ? 'text-zinc-100' : 'text-zinc-900')
              : 'text-transparent'
          }`}
        >
          
          {/* Loading Kontrolü */}
          {!isUser && !message ? (
             <TypingIndicator darkMode={darkMode} />
          ) : (
            <div className={`prose prose-sm sm:prose-base max-w-none leading-7 wrap-break-words ${
                darkMode ? 'prose-invert text-zinc-300' : 'prose-zinc text-zinc-800'
            }`}>
                <ReactMarkdown
                components={{
                    a: ({ ...props }) => (
                        <a {...props} className="text-blue-500 hover:underline font-medium" target="_blank" rel="noopener noreferrer" />
                    ),
                    table: ({children}) => (
                        <div className="overflow-x-auto my-4 rounded-lg border border-opacity-50 border-gray-700">
                            <table className="min-w-full divide-y divide-gray-700">{children}</table>
                        </div>
                    ),
                    code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : 'text';
                        const codeString = String(children).replace(/\n$/, '');
                        
                        return !inline && match ? (
                        <div className={`my-6 rounded-xl overflow-hidden border shadow-md ${
                            darkMode ? 'border-white/10 bg-[#1e1e1e]' : 'border-zinc-200 bg-zinc-50'
                        }`}>
                            <div className={`flex items-center justify-between px-4 py-2.5 ${
                            darkMode ? 'bg-[#2d2d2d] border-b border-white/5' : 'bg-zinc-100 border-b border-zinc-200'
                            }`}>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <span className={`ml-3 text-xs font-mono font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    {language}
                                </span>
                            </div>

                            <button
                                onClick={() => copyToClipboard(codeString)}
                                className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded transition-colors ${
                                darkMode 
                                    ? 'text-zinc-400 hover:text-white hover:bg-white/10' 
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'
                                }`}
                            >
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Kopyalandı' : 'Kopyala'}
                            </button>
                            </div>

                            <div className="text-[13px] sm:text-sm font-mono">
                            <SyntaxHighlighter
                                style={darkMode ? vscDarkPlus : vs}
                                language={language}
                                PreTag="div"
                                customStyle={{ 
                                    margin: 0, 
                                    borderRadius: 0, 
                                    padding: '1.5rem',
                                    background: 'transparent' 
                                }}
                                {...props}
                            >
                                {codeString}
                            </SyntaxHighlighter>
                            </div>
                        </div>
                        ) : (
                        <code 
                            className={`px-1.5 py-0.5 rounded-md text-[0.9em] font-mono font-medium ${
                            darkMode ? 'bg-white/10 text-zinc-200' : 'bg-zinc-100 text-pink-600 border border-zinc-200'
                            }`} 
                            {...props}
                        >
                            {children}
                        </code>
                        );
                    }
                }}
                >
                {message}
                </ReactMarkdown>
            </div>
          )}

          {/* aksiyon butonları */}
          {!isUser && message && (
            <div className={`flex items-center gap-1 mt-2 -ml-2 transition-opacity duration-300 ${
              isHovered || copied ? 'opacity-100' : 'opacity-0'
            }`}>
              <button onClick={() => copyToClipboard(message)} className={`p-1.5 rounded-md transition-colors ${
                darkMode ? 'hover:bg-white/10 text-zinc-500 hover:text-zinc-300' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600'
              }`} title="Kopyala">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              
              <button onClick={() => handleReaction('up')} className={`p-1.5 rounded-md transition-colors ${
                 darkMode ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
              } ${reaction === 'up' ? 'text-green-500 bg-green-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <ThumbsUp className="w-4 h-4" />
              </button>
              
              <button onClick={() => handleReaction('down')} className={`p-1.5 rounded-md transition-colors ${
                 darkMode ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
              } ${reaction === 'down' ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <ThumbsDown className="w-4 h-4" />
              </button>

               <button className={`p-1.5 rounded-md transition-colors ${
                darkMode ? 'hover:bg-white/10 text-zinc-500 hover:text-zinc-300' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600'
              }`} title="Yeniden Oluştur">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}