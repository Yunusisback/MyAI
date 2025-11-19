import { User, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Lottie from 'lottie-react';
import logoAnimation from '../assets/logo-animation.json';

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
      className={`flex gap-5 w-full group ${isUser ? 'flex-row-reverse' : ''} items-start`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar Alanı */}
      <div
        className={`
          shrink-0 flex items-center justify-center rounded-full mt-1
          w-10 h-10 
          ${!isUser ? '-ml-3' : ''}
          ${
            isUser 
              ? (darkMode ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm')
              : 'bg-transparent overflow-visible' 
          }
        `}
      >
        {isUser ? (
          <User className="w-5 h-5" />
        ) : (
          /* AI Animasyonu */
          <div className="w-full h-full flex items-center justify-center">
             <Lottie 
               animationData={logoAnimation} 
               loop={true}
               className="scale-[1.5]" 
             />
          </div>
        )}
      </div>

      {/* Mesaj İçeriği */}
      <div className={`
        flex-1 max-w-[75%] sm:max-w-lg relative 
        ${isUser ? 'flex justify-end' : ''}
        mt-8
      `}>
        <div
          className={`px-5 py-3.5 transition-all shadow-sm ${
            isUser
              /* KULLANICI MESAJI */
              ? darkMode 
                ? 'bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl rounded-tr-sm' 
                : 'bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-2xl rounded-tr-sm'
              
              /* AI MESAJI  */
              : darkMode
                ? 'bg-white/5 backdrop-blur-md border border-white/5 text-zinc-100 rounded-2xl rounded-tl-sm' 
                : 'bg-white/60 backdrop-blur-md border border-zinc-200 text-zinc-900 rounded-2xl rounded-tl-sm' 
          }`}
        >
          <div className={`prose prose-sm max-w-none leading-7 ${
            darkMode ? 'prose-invert' : 'prose-zinc'
          }`}>
            <ReactMarkdown
              components={{
                a: ({ ...props }) => (
                  <a {...props} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" />
                ),
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : 'text';
                  
                  return !inline && match ? (
                    <div className={`my-4 rounded-lg overflow-hidden border shadow-sm ${
                        darkMode ? 'border-white/10' : 'border-zinc-200'
                    }`}>
                      <div className={`flex items-center justify-between px-4 py-2 text-xs font-mono ${
                        darkMode ? 'bg-[#1e1e1e] text-zinc-400 border-b border-white/5' : 'bg-zinc-100 text-zinc-500 border-b border-zinc-200'
                      }`}>
                        <span>{language}</span>
                        <button
                          onClick={() => copyToClipboard(String(children))}
                          className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Kopyalandı' : 'Kopyala'}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={darkMode ? vscDarkPlus : vs}
                        language={language}
                        PreTag="div"
                        customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code 
                      className={`px-1.5 py-0.5 rounded-md text-[13px] font-mono ${
                        darkMode ? 'bg-white/10 text-white' : 'bg-zinc-100 text-red-600 border border-zinc-200'
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

          {/* Aksiyon Butonları */}
          {!isUser && (
            <div className={`flex items-center gap-2 mt-2 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <button onClick={() => copyToClipboard(message)} className={`p-1.5 rounded transition-colors ${
                darkMode ? 'hover:bg-white/10 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600'
              }`} title="Kopyala">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <div className={`h-3 w-px mx-1 ${darkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />
              <button onClick={() => handleReaction('up')} className={`p-1.5 rounded transition-colors ${
                 darkMode ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
              } ${reaction === 'up' ? 'text-green-500' : 'text-zinc-400'}`}>
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button onClick={() => handleReaction('down')} className={`p-1.5 rounded transition-colors ${
                 darkMode ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
              } ${reaction === 'down' ? 'text-red-500' : 'text-zinc-400'}`}>
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}