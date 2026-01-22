import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings as SettingsIcon, Menu, X, CheckCircle, ListTodo, BookOpen } from 'lucide-react';
import { seedDemoData, loadData, saveData } from './services/storage';
import { AppData, NonConformance } from './types';
import { translations, Language } from './services/translations';
import Dashboard from './components/Dashboard';
import NCList from './components/NCList';
import NCDetail from './components/NCDetail';
import ActionList from './components/ActionList';
import Settings from './components/Settings';
import UserGuide from './components/UserGuide';

// -- Sidebar Component --
const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  lang, 
  setLang 
}: { 
  isOpen: boolean; 
  setIsOpen: (o: boolean) => void;
  lang: Language;
  setLang: (l: Language) => void;
}) => {
  const location = useLocation();
  const t = translations[lang].nav;
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t.dashboard },
    { path: '/ncs', icon: FileText, label: t.ncs },
    { path: '/actions', icon: ListTodo, label: t.actions },
    { path: '/guide', icon: BookOpen, label: t.guide },
    { path: '/settings', icon: SettingsIcon, label: t.settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-brand-900 text-white transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img 
               src="https://raw.githubusercontent.com/M00N69/RAPPELCONSO/main/logo%2004%20copie.jpg" 
               alt="VISIpilot Logo" 
               className="h-10 w-10 rounded-full object-cover bg-white p-0.5" 
             />
             <h1 className="text-2xl font-bold tracking-tight">VISIcat</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-white hover:text-brand-200">
            <X size={24} />
          </button>
        </div>

        {/* Language Toggle */}
        <div className="px-4 mb-4">
          <div className="flex bg-brand-800 rounded-lg p-1">
            <button 
              onClick={() => setLang('en')}
              className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                lang === 'en' ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-200 hover:text-white'
              }`}
            >
              English
            </button>
            <button 
              onClick={() => setLang('fr')}
              className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                lang === 'fr' ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-200 hover:text-white'
              }`}
            >
              Français
            </button>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-brand-700 text-white' : 'text-brand-100 hover:bg-brand-800'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 bg-brand-950 text-xs text-brand-200">
          <p>VISIcat v1.0.0</p>
          <p>{t.footer}</p>
        </div>
      </div>
    </>
  );
};

// -- Main App Component --
export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>('fr'); // Default to French as requested
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    // Initial load
    const loaded = seedDemoData();
    setData(loaded);
  }, []);

  const handleUpdateData = (newData: AppData) => {
    setData(newData);
    saveData(newData);
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const t = translations[lang].common;

  if (!data) return <div className="flex h-screen items-center justify-center text-brand-600">{t.loading}</div>;

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} lang={lang} setLang={setLang} />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Mobile Header */}
          <header className="bg-white border-b border-gray-200 md:hidden flex items-center justify-between p-4 shadow-sm z-10">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="text-gray-600 mr-4">
                <Menu size={24} />
              </button>
              <img 
               src="https://raw.githubusercontent.com/M00N69/RAPPELCONSO/main/logo%2004%20copie.jpg" 
               alt="VISIpilot Logo" 
               className="h-8 w-8 rounded-full object-cover mr-2" 
              />
              <h1 className="text-lg font-bold text-gray-800">VISIcat</h1>
            </div>
            {/* Mobile Lang Toggle (Icon only to save space) */}
            <button 
              onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
              className="text-brand-600 font-bold bg-brand-50 px-2 py-1 rounded text-xs border border-brand-100"
            >
              {lang.toUpperCase()}
            </button>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard data={data} lang={lang} />} />
              <Route path="/ncs" element={<NCList data={data} updateData={handleUpdateData} showToast={showToast} lang={lang} />} />
              <Route path="/ncs/:id" element={<NCDetail data={data} updateData={handleUpdateData} showToast={showToast} lang={lang} />} />
              <Route path="/actions" element={<ActionList data={data} lang={lang} />} />
              <Route path="/guide" element={<UserGuide lang={lang} />} />
              <Route path="/settings" element={<Settings data={data} updateData={handleUpdateData} showToast={showToast} lang={lang} />} />
            </Routes>
          </main>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all animate-bounce ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } flex items-center gap-2 z-50`}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.msg}
          </div>
        )}
      </div>
    </HashRouter>
  );
}