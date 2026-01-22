import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppData, NonConformance, NCStatus, NCSeverity, ActionType, ActionPlan, ActionStatus } from '../types';
import { generateRCA, generateActions, generateIshikawa } from '../services/gemini';
import { translations, Language } from '../services/translations';
import { ArrowLeft, Save, Trash2, Bot, Sparkles, Upload, File as FileIcon, X, CheckSquare, Square, Download, ChevronDown, ChevronUp, Paperclip, GitBranch, Layers } from 'lucide-react';

interface NCDetailProps {
  data: AppData;
  updateData: (d: AppData) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  lang: Language;
}

const NCDetail: React.FC<NCDetailProps> = ({ data, updateData, showToast, lang }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'rca' | 'actions' | 'files'>('info');
  const [nc, setNC] = useState<NonConformance | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const t = translations[lang].detail;
  const tCommon = translations[lang].common;
  const statusLabels = translations[lang].status;
  const severityLabels = translations[lang].severity;
  const actionTypeLabels = translations[lang].actionType;
  const actionStatusLabels = translations[lang].actionStatus;

  useEffect(() => {
    const found = data.ncs.find(n => n.id === id);
    if (found) {
        // Ensure structure for legacy data
        if (!found.ishikawa) {
            found.ishikawa = { man: '', machine: '', material: '', method: '', environment: '', measurement: '' };
        }
        if (!found.rcaMethod) {
            found.rcaMethod = '5whys';
        }
        setNC(found);
    } else {
      navigate('/ncs');
    }
  }, [id, data.ncs, navigate]);

  if (!nc) return null;

  const handleSave = () => {
    const updatedNC = { ...nc, updatedAt: new Date().toISOString() };
    const updatedNCs = data.ncs.map(n => n.id === nc.id ? updatedNC : n);
    updateData({ ...data, ncs: updatedNCs });
    showToast(t.saved);
  };

  const handleDelete = () => {
    if (confirm(tCommon.confirmDelete)) {
      const filteredNCs = data.ncs.filter(n => n.id !== nc.id);
      updateData({ ...data, ncs: filteredNCs });
      showToast(t.deleted);
      navigate('/ncs');
    }
  };

  const updateField = (field: keyof NonConformance, value: any) => {
    setNC({ ...nc, [field]: value });
  };

  // -- AI Handlers --
  const checkApiKey = (): string | null => {
      if (!data.settings.apiKey) {
          showToast(tCommon.missingKey, "error");
          return null;
      }
      return data.settings.apiKey;
  };

  const handleAiAnalysis = async () => {
    const apiKey = checkApiKey();
    if (!apiKey) return;

    if (!nc.description) {
        showToast(tCommon.missingDesc, "error");
        return;
    }
    setIsAiLoading(true);
    try {
        let newNC = { ...nc };

        // 1. Run 5 Whys if selected or combined
        if (nc.rcaMethod === '5whys' || nc.rcaMethod === 'combined') {
            const res5W = await generateRCA(nc.description, nc.severity, lang, apiKey);
            newNC.fiveWhys = {
                why1: res5W.why1 || '',
                why2: res5W.why2 || '',
                why3: res5W.why3 || '',
                why4: res5W.why4 || '',
                why5: res5W.why5 || '',
            };
            if (!newNC.rootCause) newNC.rootCause = res5W.rootCause;
        }

        // 2. Run Ishikawa if selected or combined
        if (nc.rcaMethod === 'ishikawa' || nc.rcaMethod === 'combined') {
            const resFish = await generateIshikawa(nc.description, lang, apiKey);
            newNC.ishikawa = {
                man: resFish.man || '',
                machine: resFish.machine || '',
                material: resFish.material || '',
                method: resFish.method || '',
                environment: resFish.environment || '',
                measurement: resFish.measurement || ''
            };
            if (nc.rcaMethod === 'ishikawa' && resFish.rootCause) {
                newNC.rootCause = resFish.rootCause;
            }
        }
        
        setNC(newNC);
        showToast(tCommon.rcaGenerated);

    } catch (e) {
        showToast(tCommon.aiError, "error");
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleAiActions = async () => {
    const apiKey = checkApiKey();
    if (!apiKey) return;

    if (!nc.rootCause) {
        showToast(tCommon.missingRoot, "error");
        return;
    }
    setIsAiLoading(true);
    try {
        const result = await generateActions(nc.rootCause, nc.severity, lang, apiKey);
        if (result.actions) {
            const newActions: ActionPlan[] = result.actions.map((a: any, idx: number) => ({
                id: `act-${Date.now()}-${idx}`,
                description: a.description,
                type: a.type as ActionType,
                status: ActionStatus.PENDING,
                assignee: '', 
                startDate: new Date().toISOString().split('T')[0],
                deadline: '', 
                resources: '',
                attachments: [],
                completed: false
            }));
            setNC(prev => {
                if(!prev) return null;
                return {
                    ...prev,
                    actions: [...prev.actions, ...newActions]
                }
            });
            showToast(tCommon.actionsGenerated);
        }
    } catch (e) {
        showToast(tCommon.aiError, "error");
    } finally {
        setIsAiLoading(false);
    }
  };

  // -- File Handler for NC --
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { 
            if(!confirm(tCommon.largeFile)) return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
            const base64 = evt.target?.result as string;
            setNC({
                ...nc,
                attachments: [
                    ...nc.attachments,
                    {
                        id: `file-${Date.now()}`,
                        name: file.name,
                        type: file.type,
                        data: base64,
                        date: new Date().toISOString()
                    }
                ]
            });
        };
        reader.readAsDataURL(file);
    }
  };

  // -- Update Helpers --
  const updateFiveWhys = (key: keyof typeof nc.fiveWhys, value: string) => {
      setNC({ ...nc, fiveWhys: { ...nc.fiveWhys, [key]: value } });
  };
  
  const updateIshikawa = (key: keyof typeof nc.ishikawa, value: string) => {
      setNC({ ...nc, ishikawa: { ...nc.ishikawa, [key]: value } });
  };

  const updateAction = (idx: number, field: keyof ActionPlan, value: any) => {
      const newActions = [...nc.actions];
      newActions[idx] = { ...newActions[idx], [field]: value };
      
      // Sync completed boolean if status changes
      if (field === 'status') {
          newActions[idx].completed = value === ActionStatus.DONE;
      }
      // Sync status if completed boolean changes (legacy)
      if (field === 'completed') {
          newActions[idx].status = value ? ActionStatus.DONE : ActionStatus.IN_PROGRESS;
      }

      setNC({ ...nc, actions: newActions });
  };

  const deleteAction = (idx: number) => {
      const newActions = nc.actions.filter((_, i) => i !== idx);
      setNC({ ...nc, actions: newActions });
  };

  const addAction = () => {
      setNC({
          ...nc,
          actions: [
              ...nc.actions,
              {
                  id: `act-${Date.now()}`,
                  description: '',
                  type: ActionType.CORRECTIVE,
                  status: ActionStatus.PENDING,
                  assignee: '',
                  startDate: new Date().toISOString().split('T')[0],
                  deadline: '',
                  resources: '',
                  attachments: [],
                  completed: false
              }
          ]
      })
  };

  const handleActionFileUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { 
            if(!confirm(tCommon.largeFile)) return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
            const base64 = evt.target?.result as string;
            const newActions = [...nc.actions];
            newActions[idx].attachments.push({
                id: `act-file-${Date.now()}`,
                name: file.name,
                type: file.type,
                data: base64,
                date: new Date().toISOString()
            });
            setNC({ ...nc, actions: newActions });
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/ncs')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-gray-500 font-bold text-lg">{nc.reference}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                 nc.status === NCStatus.OPEN ? 'bg-red-100 text-red-800' : 
                 nc.status === NCStatus.VERIFIED ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>{statusLabels[nc.status]}</span>
            </div>
            <input 
              type="text" 
              value={nc.title} 
              onChange={(e) => updateField('title', e.target.value)}
              className="text-gray-900 font-bold text-xl bg-transparent border-none p-0 focus:ring-0 w-full md:w-96 placeholder-gray-400"
              placeholder="Enter Title..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 size={20} />
          </button>
          <button 
            onClick={handleSave} 
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg shadow-sm"
          >
            <Save size={18} /> {t.save}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {['info', 'rca', 'actions', 'files'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab 
                ? 'border-brand-600 text-brand-700' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.tabs[tab as keyof typeof t.tabs]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
        
        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 col-span-2">
               <label className="block text-sm font-medium text-gray-700">{t.info.desc}</label>
               <textarea 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none min-h-[120px] bg-white text-gray-900"
                  value={nc.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder={t.info.descPlaceholder}
               />
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t.info.date}</label>
                <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900"
                    value={nc.dateOccurred}
                    onChange={(e) => updateField('dateOccurred', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t.info.severity}</label>
                <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900"
                    value={nc.severity}
                    onChange={(e) => updateField('severity', e.target.value)}
                >
                    {Object.values(NCSeverity).map(s => <option key={s} value={s}>{severityLabels[s]}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t.info.status}</label>
                <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900"
                    value={nc.status}
                    onChange={(e) => updateField('status', e.target.value)}
                >
                    {Object.values(NCStatus).map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t.info.dept}</label>
                <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900"
                    value={nc.department}
                    onChange={(e) => updateField('department', e.target.value)}
                >
                    {data.settings.departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t.info.source}</label>
                <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900"
                    value={nc.source}
                    onChange={(e) => updateField('source', e.target.value)}
                >
                    {data.settings.sources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t.info.location}</label>
                <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900"
                    value={nc.location}
                    onChange={(e) => updateField('location', e.target.value)}
                >
                    {data.settings.locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>
          </div>
        )}

        {/* RCA TAB */}
        {activeTab === 'rca' && (
            <div className="space-y-6">
                <div className="bg-brand-50 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between border border-brand-100 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full text-brand-600">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-brand-900">Gemini AI Assistant</h4>
                            <p className="text-sm text-brand-700">{t.rca.aiHelp}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleAiAnalysis}
                        disabled={isAiLoading}
                        className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2 shadow-sm w-full md:w-auto justify-center"
                    >
                        {isAiLoading ? tCommon.aiLoading : (
                            <>
                                <Sparkles size={18} /> {t.rca.autoAnalyze}
                            </>
                        )}
                    </button>
                </div>
                
                {/* Method Selector */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.rca.method}</label>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => updateField('rcaMethod', '5whys')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                nc.rcaMethod === '5whys' ? 'bg-white border-brand-500 text-brand-700 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-300'
                            }`}
                        >
                            <GitBranch size={16} className="inline mr-2" />
                            {t.rca.method5W}
                        </button>
                        <button 
                            onClick={() => updateField('rcaMethod', 'ishikawa')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                nc.rcaMethod === 'ishikawa' ? 'bg-white border-brand-500 text-brand-700 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-300'
                            }`}
                        >
                            <Layers size={16} className="inline mr-2" />
                            {t.rca.methodFish}
                        </button>
                         <button 
                            onClick={() => updateField('rcaMethod', 'combined')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                nc.rcaMethod === 'combined' ? 'bg-white border-brand-500 text-brand-700 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-300'
                            }`}
                        >
                            {t.rca.methodComb}
                        </button>
                    </div>
                </div>

                {/* 5 Whys Content */}
                {(nc.rcaMethod === '5whys' || nc.rcaMethod === 'combined') && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                         <h3 className="font-bold text-gray-800 border-b pb-2">5 Whys Analysis</h3>
                        {[1, 2, 3, 4, 5].map((num) => {
                            const key = `why${num}` as keyof typeof nc.fiveWhys;
                            return (
                                <div key={num} className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0 mt-1">
                                        {num}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Why?</label>
                                        <input 
                                            type="text" 
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900"
                                            value={nc.fiveWhys[key]}
                                            onChange={(e) => updateFiveWhys(key, e.target.value)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Ishikawa Content */}
                {(nc.rcaMethod === 'ishikawa' || nc.rcaMethod === 'combined') && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="font-bold text-gray-800 border-b pb-2 mt-4">Ishikawa (6M) Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['man', 'machine', 'material', 'method', 'environment', 'measurement'].map((cat) => (
                                <div key={cat} className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700 capitalize">
                                        {t.rca.ishikawa[cat as keyof typeof t.rca.ishikawa]}
                                    </label>
                                    <textarea 
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900"
                                        value={nc.ishikawa[cat as keyof typeof nc.ishikawa]}
                                        onChange={(e) => updateIshikawa(cat as keyof typeof nc.ishikawa, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t border-gray-200 pt-6 mt-6">
                    <label className="block text-sm font-bold text-gray-800 mb-2">{t.rca.final}</label>
                    <textarea 
                        className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 transition-colors"
                        rows={3}
                        value={nc.rootCause}
                        onChange={(e) => updateField('rootCause', e.target.value)}
                        placeholder={t.rca.finalPlaceholder}
                    />
                </div>
            </div>
        )}

        {/* ACTIONS TAB */}
        {activeTab === 'actions' && (
            <div className="space-y-6">
                 <div className="bg-brand-50 p-4 rounded-lg flex items-center justify-between border border-brand-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full text-brand-600">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-brand-900">Gemini AI Assistant</h4>
                            <p className="text-sm text-brand-700">{t.actions.aiHelp}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleAiActions}
                        disabled={isAiLoading}
                        className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                        {isAiLoading ? tCommon.aiLoading : (
                            <>
                                <Sparkles size={18} /> {t.actions.suggest}
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-4">
                    {nc.actions.length === 0 && (
                        <p className="text-center text-gray-400 py-8 italic">{t.actions.empty}</p>
                    )}
                    {nc.actions.map((act, idx) => {
                        const isExpanded = expandedAction === act.id;
                        return (
                        <div key={act.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            {/* Action Header (Always visible) */}
                            <div className="p-4 flex items-center gap-3 bg-gray-50 border-b border-gray-100 cursor-pointer" onClick={() => setExpandedAction(isExpanded ? null : act.id)}>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateAction(idx, 'status', act.status === ActionStatus.DONE ? ActionStatus.IN_PROGRESS : ActionStatus.DONE);
                                    }}
                                    className={`shrink-0 ${act.status === ActionStatus.DONE ? 'text-green-600' : 'text-gray-300 hover:text-gray-400'}`}
                                >
                                    {act.status === ActionStatus.DONE ? <CheckSquare size={24}/> : <Square size={24}/>}
                                </button>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900 truncate">{act.description || t.actions.placeholder}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                                            act.status === ActionStatus.DONE ? 'bg-green-100 text-green-800 border-green-200' : 
                                            act.status === ActionStatus.DELAYED ? 'bg-red-100 text-red-800 border-red-200' : 
                                            'bg-blue-100 text-blue-800 border-blue-200'
                                        }`}>{actionStatusLabels[act.status] || 'Pending'}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex gap-4 mt-1">
                                        <span>{act.assignee || 'Unassigned'}</span>
                                        <span>{act.deadline || 'No Deadline'}</span>
                                    </div>
                                </div>
                                
                                <button className="text-gray-400">
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t.actions.placeholder}</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900"
                                                value={act.description}
                                                onChange={(e) => updateAction(idx, 'description', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t.actions.status}</label>
                                            <select 
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900"
                                                value={act.status || ActionStatus.PENDING}
                                                onChange={(e) => updateAction(idx, 'status', e.target.value)}
                                            >
                                                {Object.values(ActionStatus).map(v => <option key={v} value={v}>{actionStatusLabels[v]}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t.actions.type}</label>
                                            <select 
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900"
                                                value={act.type}
                                                onChange={(e) => updateAction(idx, 'type', e.target.value)}
                                            >
                                                {Object.values(ActionType).map(v => <option key={v} value={v}>{actionTypeLabels[v]}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t.actions.assignee}</label>
                                            <select 
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900"
                                                value={act.assignee}
                                                onChange={(e) => updateAction(idx, 'assignee', e.target.value)}
                                            >
                                                <option value="">{t.actions.assignee}</option>
                                                {data.settings.users.map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t.actions.dates}</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="date"
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900"
                                                    value={act.startDate ? act.startDate.split('T')[0] : ''}
                                                    onChange={(e) => updateAction(idx, 'startDate', e.target.value)}
                                                />
                                                <input 
                                                    type="date"
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900"
                                                    value={act.deadline ? act.deadline.split('T')[0] : ''}
                                                    onChange={(e) => updateAction(idx, 'deadline', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t.actions.resources}</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900"
                                                value={act.resources || ''}
                                                onChange={(e) => updateAction(idx, 'resources', e.target.value)}
                                                placeholder="Budget, People, Tools..."
                                            />
                                        </div>

                                        {/* Action Attachments */}
                                        <div className="col-span-2 border-t border-gray-100 pt-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-medium text-gray-500">{t.files.upload} ({act.attachments?.length || 0})</label>
                                                <label className="cursor-pointer text-brand-600 hover:text-brand-700 text-xs flex items-center gap-1">
                                                    <Paperclip size={14} /> {t.actions.attach}
                                                    <input type="file" className="hidden" onChange={(e) => handleActionFileUpload(idx, e)} />
                                                </label>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {act.attachments?.map((file, fileIdx) => (
                                                    <div key={file.id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                                        <button 
                                                            onClick={() => {
                                                                const newActions = [...nc.actions];
                                                                newActions[idx].attachments = newActions[idx].attachments.filter((_, i) => i !== fileIdx);
                                                                setNC({ ...nc, actions: newActions });
                                                            }}
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end pt-2">
                                        <button onClick={() => deleteAction(idx)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                                            <Trash2 size={16} /> {t.delete}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )})}
                    
                    <button 
                        onClick={addAction}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-500 hover:text-brand-600 font-medium transition-colors bg-white hover:bg-gray-50"
                    >
                        + {t.actions.add}
                    </button>
                </div>
            </div>
        )}

        {/* FILES TAB */}
        {activeTab === 'files' && (
            <div className="space-y-6">
                <div className="flex justify-center">
                    <label className="cursor-pointer bg-white hover:bg-gray-50 border-2 border-dashed border-brand-300 rounded-xl p-8 flex flex-col items-center gap-2 w-full max-w-lg transition-colors shadow-sm">
                        <Upload className="text-brand-600" size={32} />
                        <span className="font-medium text-brand-800">{t.files.upload}</span>
                        <span className="text-xs text-brand-500">{t.files.limit}</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {nc.attachments.map((file, idx) => (
                        <div key={file.id} className="border border-gray-200 p-4 rounded-lg flex items-center justify-between gap-3 bg-white shadow-sm">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-gray-100 p-2 rounded text-gray-600">
                                    <FileIcon size={20} />
                                </div>
                                <div className="truncate">
                                    <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
                                    <p className="text-xs text-gray-500">{new Date(file.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <a 
                                    href={file.data} 
                                    download={file.name}
                                    className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                                    title={t.files.download}
                                >
                                    <Download size={16} />
                                </a>
                                <button 
                                    onClick={() => {
                                        const newFiles = nc.attachments.filter((_, i) => i !== idx);
                                        setNC({ ...nc, attachments: newFiles });
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default NCDetail;