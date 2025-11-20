import { useState } from 'react';
import { User, Trash2, Save, Edit2, X, ChevronRight } from 'lucide-react';

export default function Settings({ 
  isOpen, 
  onClose, 
  darkMode, 
  t, 
  username, 
  onUpdateUsername, 
  onClearChat 
}) {

  // hook
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(username);



  // ikinci render kontrolü 
  if (!isOpen) return null;

  const handleSave = () => {
    if (tempName.trim()) {
      onUpdateUsername(tempName);
      setIsEditing(false);
    }
  };

  // Düzenleme modunu açarken güncel ismi al
  const handleStartEditing = () => {
    setTempName(username);
    setIsEditing(true);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Arka Plan Karartma */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Kutusu */}
      <div className={`
        relative w-full max-w-md rounded-2xl shadow-2xl transform transition-all scale-100
        ${darkMode ? 'bg-[#18181b] border border-white/10 text-white' : 'bg-white border border-gray-100 text-gray-900'}
      `}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
          <h2 className="text-base font-semibold flex items-center gap-2">
            {t.settingsTitle}
          </h2>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* İçerik */}
        <div className="p-2">
          
          {/* Kullanıcı Adı */}
          <div className={`group flex flex-col p-3 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t.username}</span>
                  {!isEditing && <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{username}</span>}
                </div>
              </div>

              {/* Düzenleme Modu */}
              {isEditing ? (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <input 
                    type="text" 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()} 
                    className={`w-32 px-2 py-1 text-sm rounded border outline-none ${darkMode ? 'bg-black/30 border-white/20 text-white' : 'bg-white border-gray-300 text-black'}`}
                    autoFocus 
                  />
                  <button onClick={handleSave} className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleStartEditing} 
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  {t.edit}
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className={`h-px mx-3 my-1 ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`} />

          {/* Sohbeti Temizle */}
          <button 
            onClick={onClearChat}
            className={`w-full flex items-center justify-between p-3 rounded-xl group transition-colors ${darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${darkMode ? 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20' : 'bg-red-50 text-red-500 group-hover:bg-red-100'}`}>
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-200 group-hover:text-red-400' : 'text-gray-700 group-hover:text-red-600'}`}>
                  {t.clearChat}
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Bu işlem geri alınamaz
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 opacity-30 ${darkMode ? 'text-white' : 'text-black'}`} />
          </button>

        </div>
      </div>
    </div>
  );
}