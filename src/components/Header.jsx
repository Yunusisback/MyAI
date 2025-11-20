import { useState } from 'react';
import { PanelLeft, Moon, Sun, Download, Settings } from 'lucide-react';
import Lottie from 'lottie-react';
import eyeAnimation from '../assets/eye-animation.json';

export default function Header({ 
  showSidebar, 
  setShowSidebar, 
  darkMode, 
  toggleDarkMode, 
  language, 
  toggleLanguage, 
  selectedModel, 
  setSelectedModel, 
  onExportChat,
  onToggleSettings
}) {
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const models = [
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Hızlı / Fast' },
    { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', description: 'Güçlü / Powerful' },
    { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', description: 'Dengeli / Balanced' },
  ];

  return (
    <div className={`border-b transition-colors relative z-50 ${darkMode ? 'bg-black/50 backdrop-blur-sm border-white/10' : 'bg-white/80 backdrop-blur-sm border-gray-200'}`}>
      <div className="w-full px-4 sm:px-6 py-4 flex items-center justify-between">
        
        {/* Sol kısım Sidebar Toggle & Logo */}
        <div className="flex items-center gap-3">
          {!showSidebar && (
              <button onClick={() => setShowSidebar(true)} className={`p-2 -ml-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/10 text-gray-600 hover:text-black'}`}>
                <PanelLeft className="w-6 h-6" />
              </button>
          )}
          {!showSidebar && (
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center">
                    <Lottie animationData={eyeAnimation} loop={true} style={{ width: 40, height: 40 }} className="scale-[1.5]" />
                 </div>
             </div>
          )}
        </div>

        {/* sağ kısım */}
        <div className="flex items-center gap-2">
          
          {/* Model seçimi  */}
          <div className="relative">
            <button onClick={() => setShowModelDropdown(!showModelDropdown)} className={`text-sm px-3 py-2 rounded-lg border outline-none transition-colors flex items-center gap-2 font-medium ${darkMode ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'}`}>
              <span>{models.find(m => m.id === selectedModel)?.name}</span>
              <svg className={`w-4 h-4 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showModelDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />
                <div className={`absolute top-full right-0 mt-2 w-56 rounded-lg border shadow-lg z-50 overflow-hidden animate-fadeIn ${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'}`}>
                  {models.map((model) => (
                    <button key={model.id} onClick={() => { setSelectedModel(model.id); setShowModelDropdown(false); }} className={`w-full px-4 py-3 text-left transition-colors border-b last:border-b-0 ${selectedModel === model.id ? (darkMode ? 'bg-white/10 border-white/5' : 'bg-gray-50 border-gray-200') : (darkMode ? 'hover:bg-white/5 border-white/5' : 'hover:bg-gray-50 border-gray-100')}`}>
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

          {/*  dil (Language) */}
          <button onClick={toggleLanguage} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${darkMode ? 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/10' : 'border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-100'}`}>
            {language === 'tr' ? 'EN' : 'TR'}
          </button>

          {/*  tema (Dark Mode Toggle) */}
          <button onClick={toggleDarkMode} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/10 text-black/70'}`}>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {/* 4. Ayarlar (Settings) */}
          <button onClick={onToggleSettings} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/10 text-black/70'}`}>
            <Settings className="w-5 h-5" />
          </button>

          {/* 5. İndir (Export) */}
          <button onClick={onExportChat} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/10 text-black/70'}`}>
            <Download className="w-5 h-5" />
          </button>

        </div>
      </div>
    </div>
  );
}