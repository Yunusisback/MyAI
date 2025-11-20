import { Plus, MessageSquare, Settings, Trash2, User, PanelLeft, Archive, MoreHorizontal } from 'lucide-react';
import Lottie from 'lottie-react';
import eyeAnimation from '../assets/eye-animation.json';

// Tarihe göre gruplama etiketi oluşturur 
const getRelativeDateLabel = (dateString, language) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return language === 'tr' ? 'Bugün' : 'Today';
  if (diffDays === 2) return language === 'tr' ? 'Dün' : 'Yesterday';
  if (diffDays <= 7) return language === 'tr' ? 'Önceki 7 Gün' : 'Previous 7 Days';
  if (diffDays <= 30) return language === 'tr' ? 'Önceki 30 Gün' : 'Previous 30 Days';
  
  return date.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long' });
};

export default function Sidebar({ 
  showSidebar, 
  toggleSidebar, 
  darkMode, 
  t, 
  chats, 
  activeChatId, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat, 
  onToggleSettings, 
  username 
}) {

  // Sohbetleri tarihe göre gruplar
  const groupedChats = chats.reduce((groups, chat) => {
    const label = getRelativeDateLabel(chat.date, localStorage.getItem('language') || 'tr');
    (groups[label] ??= []).push(chat);
    return groups;
  }, {});

  const sortedGroupKeys = Object.keys(groupedChats);

  return (
    <>
      {/* Sidebar ana container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 w-[260px]
        ${darkMode ? 'bg-[#09090b] border-white/5' : 'bg-[#f9f9f9] border-zinc-200'}
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative ${showSidebar ? 'lg:w-[260px]' : 'lg:w-0 lg:border-none'}
      `}>
        
        {/* Header */}
        <div className="px-3 pt-4 pb-2 shrink-0">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={onNewChat}>
              <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden">
                <Lottie animationData={eyeAnimation} loop={true} style={{ width: 45, height: 45 }} className="scale-[1.6]" />
              </div>
              <span className={`font-bold text-base tracking-tight group-hover:opacity-80 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                MyAI
              </span>
            </div>
            <button onClick={toggleSidebar} className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-zinc-400 hover:bg-white/10' : 'text-zinc-500 hover:bg-zinc-200'}`}>
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>

          <button onClick={onNewChat} className={`
            group flex items-center justify-between w-full px-3 py-2.5 rounded-lg border shadow-sm transition-all
            ${darkMode ? 'bg-zinc-900 hover:bg-zinc-800 border-white/5 text-zinc-200' : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'}
          `}>
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">{t.newChat}</span>
            </div>
            <span className="text-[10px] opacity-40 border border-current px-1 rounded">Ctrl+N</span>
          </button>
        </div>

        {/* Sohbet listesi */}
        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          {chats.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-center opacity-40">
              <MessageSquare className="w-8 h-8 mb-2 stroke-1" />
              <span className="text-xs">Geçmiş bulunamadı</span>
            </div>
          ) : (
            sortedGroupKeys.map(groupLabel => (
              <div key={groupLabel} className="mb-6">
                <h3 className={`px-2 mb-2 text-[11px] font-medium opacity-50 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {groupLabel}
                </h3>
                <div className="space-y-0.5">
                  {groupedChats[groupLabel].map(chat => (
                    <div key={chat.id} className="relative group">
                      <button
                        onClick={() => onSelectChat(chat.id)}
                        className={`
                          w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all
                          ${activeChatId === chat.id
                            ? darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-200/80 text-black font-medium'
                            : darkMode ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                          }
                        `}
                      >
                        <span className="flex-1 text-[13px] truncate leading-5 pr-6">{chat.title}</span>
                      </button>

                      {/* Sil butonu  */}
                      <div className={`absolute right-1 top-1/2 -translate-y-1/2 ${activeChatId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        <button
                          onClick={e => { e.stopPropagation(); onDeleteChat(chat.id); }}
                          className={`p-1.5 rounded-md transition-colors ${darkMode ? 'hover:bg-red-500/20 hover:text-red-400 text-zinc-500' : 'hover:bg-red-100 hover:text-red-600 text-zinc-400'}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer  */}
        <div className={`p-2 mt-auto border-t ${darkMode ? 'border-white/5 bg-[#09090b]' : 'border-zinc-200 bg-[#f9f9f9]'}`}>
          <div className="space-y-0.5 mb-2">
            <button className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${darkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'}`}>
              <Archive className="w-4 h-4" />
              <span>{t.projects}</span>
            </button>
            <button onClick={onToggleSettings} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${darkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'}`}>
              <Settings className="w-4 h-4" />
              <span>{t.settings}</span>
            </button>
          </div>

          {/* Kullanıcı profili */}
          <div className={`flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors cursor-pointer group ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${darkMode ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-white'}`}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className={`text-sm font-medium truncate mb-1 ${darkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>{username}</div>
              <div className={`text-[10px] truncate ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>{t.freePlan}</div>
            </div>
            <MoreHorizontal className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`} />
          </div>
        </div>
      </div>

      {/* Mobil overlay */}
      {showSidebar && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={toggleSidebar} />}
    </>
  );
}