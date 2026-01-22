import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppData, NonConformance, NCStatus, NCSeverity } from '../types';
import { Search, Plus, Filter, ChevronRight } from 'lucide-react';
import { translations, Language } from '../services/translations';

interface NCListProps {
  data: AppData;
  updateData: (d: AppData) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  lang: Language;
}

const NCList: React.FC<NCListProps> = ({ data, updateData, showToast, lang }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  const t = translations[lang].list;
  const statusLabels = translations[lang].status;
  const severityLabels = translations[lang].severity;

  const filtered = data.ncs.filter(nc => {
    const matchesSearch = nc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          nc.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || nc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const createNewNC = () => {
    const newId = `nc-${Date.now()}`;
    const year = new Date().getFullYear();
    const count = data.ncs.length + 1;
    const paddedCount = count.toString().padStart(3, '0');
    
    const newNC: NonConformance = {
      id: newId,
      reference: `NC-${year}-${paddedCount}`,
      title: lang === 'fr' ? 'Nouvelle Non-Conformité' : 'New Non-Conformance',
      description: '',
      dateOccurred: new Date().toISOString().split('T')[0],
      status: NCStatus.OPEN,
      severity: NCSeverity.MINOR,
      source: data.settings.sources[0] || 'Internal',
      department: data.settings.departments[0] || 'General',
      location: data.settings.locations[0] || 'Site',
      rcaMethod: '5whys',
      fiveWhys: { why1: '', why2: '', why3: '', why4: '', why5: '' },
      ishikawa: { man: '', machine: '', material: '', method: '', environment: '', measurement: '' },
      rootCause: '',
      actions: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, ncs: [newNC, ...data.ncs] };
    updateData(newData);
    showToast(lang === 'fr' ? "Nouvelle fiche créée" : "New Non-Conformance created");
    navigate(`/ncs/${newNC.id}`);
  };

  const getStatusColor = (s: NCStatus) => {
    switch (s) {
      case NCStatus.OPEN: return 'bg-red-100 text-red-800 border border-red-200';
      case NCStatus.IN_PROGRESS: return 'bg-amber-100 text-amber-800 border border-amber-200';
      case NCStatus.CLOSED: return 'bg-blue-100 text-blue-800 border border-blue-200';
      case NCStatus.VERIFIED: return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityDot = (s: NCSeverity) => {
    switch (s) {
      case NCSeverity.CRITICAL: return 'bg-red-500';
      case NCSeverity.MAJOR: return 'bg-orange-500';
      case NCSeverity.MINOR: return 'bg-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>
        <button 
          onClick={createNewNC}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          {t.new}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select 
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">{t.filterAll}</option>
            {Object.values(NCStatus).map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 font-medium text-gray-600 text-sm">
          <div className="col-span-2">{t.columns.ref}</div>
          <div className="col-span-4">{t.columns.title}</div>
          <div className="col-span-2">{t.columns.dept}</div>
          <div className="col-span-2">{t.columns.status}</div>
          <div className="col-span-2 text-right">{t.columns.date}</div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t.empty}</div>
          ) : (
            filtered.map(nc => (
              <div 
                key={nc.id} 
                onClick={() => navigate(`/ncs/${nc.id}`)}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group items-center"
              >
                <div className="col-span-12 md:col-span-2 font-mono text-sm text-gray-600 flex items-center gap-2">
                   <span className={`w-2.5 h-2.5 rounded-full ${getSeverityDot(nc.severity)}`} title={severityLabels[nc.severity]}></span>
                   {nc.reference}
                </div>
                <div className="col-span-12 md:col-span-4 font-medium text-gray-900">{nc.title}</div>
                <div className="col-span-6 md:col-span-2 text-sm text-gray-600">{nc.department}</div>
                <div className="col-span-6 md:col-span-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(nc.status)}`}>
                    {statusLabels[nc.status]}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-2 text-right text-sm text-gray-500 flex items-center justify-end gap-2">
                  {nc.dateOccurred}
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-500" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NCList;