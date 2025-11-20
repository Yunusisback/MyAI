import Lottie from 'lottie-react';
import logoAnimation from '../assets/logo-animation.json';
import { Globe, TrendingUp, Plane, AlertTriangle } from 'lucide-react';

export default function WelcomeScreen({ t, darkMode, onPromptSelect }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex">
          <Lottie animationData={logoAnimation} loop={true} style={{ width: 140, height: 140 }} />
        </div>
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.welcomeTitle}</h2>
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {t.prompts.map((item, index) => {
          const icons = [Globe, AlertTriangle, TrendingUp, Plane];
          const IconComponent = icons[index] || Globe;
          
          const colors = [
            "text-blue-500 bg-blue-500/10",
            "text-orange-500 bg-orange-500/10",
            "text-green-500 bg-green-500/10",
            "text-purple-500 bg-purple-500/10"
          ];
          const colorClass = colors[index] || colors[0];

          return (
            <button 
              key={index} 
              onClick={() => onPromptSelect(item.prompt)} 
              className={`
                  group relative p-5 rounded-2xl text-left transition-all duration-300 
                  hover:-translate-y-1 border animate-fadeIn overflow-hidden
                  ${darkMode 
                      ? 'bg-white/5 hover:bg-white/10 border-white/5 shadow-black/20 backdrop-blur-xl' 
                      : 'bg-white hover:bg-gray-50 border-zinc-200 shadow-sm hover:shadow-md'
                  }
              `}
              style={{ animationDelay: `${index * 0.1 + 0.2}s`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-transparent via-transparent ${darkMode ? 'to-white/5' : 'to-blue-500/5'}`} />

              <div className="relative z-10 flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${colorClass} ${darkMode ? 'bg-opacity-20' : ''}`}>
                      <IconComponent className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.text}
                          </span>
                          <svg className={`w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${darkMode ? 'text-white/50' : 'text-black/50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                      <span className={`text-xs leading-relaxed line-clamp-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                          {item.prompt}
                      </span>
                  </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}