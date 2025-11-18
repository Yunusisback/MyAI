import { Sparkles, User, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';


export default function ChatMessage({ message, role, darkMode }) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [reaction, setReaction] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReaction = (type) => {
    setReaction(reaction === type ? null : type);
  };

  return (
    <div
      className={`flex gap-4 group ${isUser ? 'flex-row-reverse' : ''} items-start`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
          isUser 
            ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
            : darkMode ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>

      {/* Mesaj Container */}
      <div className="flex-1 max-w-3xl relative space-y-2">
        <div
          className={`px-4 py-3 rounded-xl transition-all ${
            isUser
              ? darkMode 
                ? 'bg-white text-black' 
                : 'bg-black text-white'
              : darkMode
                ? 'bg-white/5 border border-white/10 text-white'
                : 'bg-black/5 border border-black/10 text-black'
          }`}
        >
          <div className={`prose prose-sm max-w-none ${
            darkMode && !isUser ? 'prose-invert' : ''
          } ${isUser && !darkMode ? 'prose-invert' : ''}`}>
            <ReactMarkdown
              components={{
                // Paragraf
                p: ({ children }) => (
                  <p className="my-2 first:mt-0 last:mb-0 leading-relaxed">{children}</p>
                ),
                
                // Kod blokları
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="my-3 -mx-2 first:mt-0 last:mb-0 relative group/code">
                      <div className={`absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity`}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(String(children));
                          }}
                          className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                            darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-black/10 text-black/70 hover:bg-black/20'
                          }`}
                        >
                          <Copy className="w-3 h-3" />
                          Kopyala
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          background: darkMode ? '#1e1e1e' : '#1e1e1e',
                          fontSize: '0.875rem',
                        }}
                        className="no-scrollbar"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code 
                      className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                        darkMode && !isUser
                          ? 'bg-white/10' 
                          : isUser && darkMode
                            ? 'bg-black/20'
                            : isUser && !darkMode
                              ? 'bg-white/20'
                              : 'bg-black/10'
                      }`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                
                // Listeler
                ul: ({ children }) => (
                  <ul className="my-2 space-y-1 list-disc list-inside">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-2 space-y-1 list-decimal list-inside">{children}</ol>
                ),
                
                // Başlıklar
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mt-4 mb-2 first:mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold mt-3 mb-2 first:mt-0">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-bold mt-2 mb-1 first:mt-0">{children}</h3>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        </div>

        {/* Actions - Sadece AI mesajları için */}
        {!isUser && (
          <div className={`flex items-center gap-2 transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Reactions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleReaction('up')}
                className={`p-1.5 rounded-lg transition-all reaction-btn ${
                  reaction === 'up'
                    ? darkMode 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-green-500/20 text-green-600'
                    : darkMode
                      ? 'hover:bg-white/10 text-white/50 hover:text-white'
                      : 'hover:bg-black/10 text-black/50 hover:text-black'
                }`}
                title="İyi yanıt"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => handleReaction('down')}
                className={`p-1.5 rounded-lg transition-all reaction-btn ${
                  reaction === 'down'
                    ? darkMode 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-red-500/20 text-red-600'
                    : darkMode
                      ? 'hover:bg-white/10 text-white/50 hover:text-white'
                      : 'hover:bg-black/10 text-black/50 hover:text-black'
                }`}
                title="Kötü yanıt"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Kopyalama butonu*/}
            <button
              onClick={handleCopy}
              className={`px-2 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                darkMode
                  ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  : 'bg-black/5 text-black/70 hover:bg-black/10 border border-black/10'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Kopyalandı
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Kopyala
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}