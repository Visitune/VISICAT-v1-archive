import React, { useRef } from 'react';
import { AppData, AppSettings } from '../types';
import { exportData, importData } from '../services/storage';
import { Trash2, Plus, Download, Upload, AlertCircle, Key } from 'lucide-react';
import { translations, Language } from '../services/translations';

interface SettingsProps {
  data: AppData;
  updateData: (d: AppData) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  lang: Language;
}

const ListManager = ({ title, items, onUpdate }: { title: string, items: string[], onUpdate: (items: string[]) => void }) => {
    const [newItem, setNewItem] = React.useState('');

    const add = () => {
        if (newItem.trim()) {
            onUpdate([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const remove = (idx: number) => {
        const n = [...items];
        n.splice(idx, 1);
        onUpdate(n);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-2 mb-4">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-white border border-gray-200 p-2 rounded text-gray-700">
                        <span>{item}</span>
                        <button onClick={() => remove(idx)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:border-brand-500 bg-white text-gray-900"
                    placeholder="Add new..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && add()}
                />
                <button onClick={add} className="bg-brand-600 text-white p-1.5 rounded hover:bg-brand-700 shadow-sm">
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
};

const Settings: React.FC<SettingsProps> = ({ data, updateData, showToast, lang }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang].settings;

  const updateSettings = (key: keyof AppSettings, value: any) => {
      const newSettings = { ...data.settings, [key]: value };
      updateData({ ...data, settings: newSettings });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        try {
            const imported = await importData(file);
            const msg = t.overwrite.replace('{count}', imported.ncs.length.toString());
            if(confirm(msg)) {
                updateData(imported);
                showToast(t.importSuccess);
            }
        } catch (err) {
            showToast(t.importError, "error");
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.orgName}</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-lg p-3 max-w-md bg-white text-gray-900"
            value={data.settings.organizationName}
            onChange={(e) => updateSettings('organizationName', e.target.value)}
          />
      </div>

      {/* API Key Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Key size={18} className="text-brand-600" />
            <label className="block text-sm font-medium text-gray-700">{t.apiKey}</label>
          </div>
          <p className="text-xs text-gray-500 mb-3">{t.apiKeyDesc}</p>
          <input 
            type="password" 
            className="w-full border border-gray-300 rounded-lg p-3 max-w-md bg-white text-gray-900 font-mono"
            value={data.settings.apiKey || ''}
            onChange={(e) => updateSettings('apiKey', e.target.value)}
            placeholder="AIzaSy..."
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ListManager title={t.dept} items={data.settings.departments} onUpdate={(v) => updateSettings('departments', v)} />
          <ListManager title={t.loc} items={data.settings.locations} onUpdate={(v) => updateSettings('locations', v)} />
          <ListManager title={t.src} items={data.settings.sources} onUpdate={(v) => updateSettings('sources', v)} />
          <ListManager title={t.users} items={data.settings.users} onUpdate={(v) => updateSettings('users', v)} />
      </div>

      <div className="bg-brand-50 border border-brand-100 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2">
              {t.dataMgmt}
          </h3>
          <p className="text-sm text-brand-700 mb-6 max-w-2xl">
              {t.dataDesc}
              <br/><br/>
              <span className="flex items-center gap-1 font-semibold"><AlertCircle size={14}/> {t.warning}</span>
          </p>

          <div className="flex gap-4">
              <button 
                onClick={() => exportData(data)}
                className="flex items-center gap-2 bg-white border border-brand-200 text-brand-700 px-4 py-2 rounded-lg hover:bg-brand-50 shadow-sm"
              >
                  <Upload size={18} /> {t.export}
              </button>
              <div className="relative">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 shadow-sm"
                  >
                      <Download size={18} /> {t.import}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImport} 
                    accept=".json" 
                    className="hidden"
                  />
              </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;