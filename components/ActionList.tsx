import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppData, ActionStatus, ActionType } from '../types';
import { translations, Language } from '../services/translations';
import { Filter, Search, Calendar, List, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ActionListProps {
  data: AppData;
  lang: Language;
}

interface FlattenedAction {
  id: string;
  description: string;
  type: ActionType;
  status: ActionStatus;
  assignee: string;
  startDate: string;
  deadline: string;
  ncId: string;
  ncRef: string;
  ncDept: string;
  completed: boolean;
}

const ActionList: React.FC<ActionListProps> = ({ data, lang }) => {
  const navigate = useNavigate();
  const t = translations[lang].actionsList;
  const actionStatusLabels = translations[lang].actionStatus;

  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [filterDept, setFilterDept] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Flatten actions
  const allActions: FlattenedAction[] = data.ncs.flatMap(nc => 
    nc.actions.map(action => ({
      ...action,
      ncId: nc.id,
      ncRef: nc.reference,
      ncDept: nc.department
    }))
  );

  // Filter logic
  const filteredActions = allActions.filter(a => {
    const matchDept = filterDept === 'All' || a.ncDept === filterDept;
    const matchAssignee = filterAssignee === 'All' || a.assignee === filterAssignee;
    // Map boolean 'completed' to status if status is undefined (legacy data support)
    const currentStatus = a.status || (a.completed ? ActionStatus.DONE : ActionStatus.PENDING);
    const matchStatus = filterStatus === 'All' || currentStatus === filterStatus;
    return matchDept && matchAssignee && matchStatus;
  });

  // Sort by deadline
  filteredActions.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const getStatusColor = (s: ActionStatus) => {
    switch (s) {
      case ActionStatus.DONE: return 'bg-green-100 text-green-800 border-green-200';
      case ActionStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200';
      case ActionStatus.DELAYED: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressWidth = (start: string, end: string) => {
     if(!start || !end) return 100;
     const now = new Date().getTime();
     const s = new Date(start).getTime();
     const e = new Date(end).getTime();
     if (e <= s) return 100;
     const total = e - s;
     const elapsed = now - s;
     const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
     return pct;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
                <List size={16} /> {t.viewList}
            </button>
            <button 
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'timeline' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
                <Calendar size={16} /> {t.viewGantt}
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <select 
            className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
        >
            <option value="All">{t.filterDept}</option>
            {data.settings.departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select 
            className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
        >
            <option value="All">{t.filterAssignee}</option>
            {data.settings.users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

         <select 
            className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
        >
            <option value="All">{t.filterStatus}</option>
            {Object.values(ActionStatus).map(s => <option key={s} value={s}>{actionStatusLabels[s]}</option>)}
        </select>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {filteredActions.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
                <AlertCircle size={48} className="text-gray-300" />
                <p>{t.empty}</p>
            </div>
        ) : (
            viewMode === 'list' ? (
                // LIST VIEW
                <div className="w-full">
                     <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 font-medium text-gray-600 text-sm">
                        <div className="col-span-4">{t.columns.desc}</div>
                        <div className="col-span-2">{t.columns.nc}</div>
                        <div className="col-span-2">{t.columns.assignee}</div>
                        <div className="col-span-2">{t.columns.status}</div>
                        <div className="col-span-2 text-right">{t.columns.deadline}</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {filteredActions.map(action => {
                            const currentStatus = action.status || (action.completed ? ActionStatus.DONE : ActionStatus.PENDING);
                            return (
                                <div key={action.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors items-center">
                                    <div className="col-span-12 md:col-span-4 font-medium text-gray-900">{action.description}</div>
                                    <div className="col-span-6 md:col-span-2">
                                        <button 
                                            onClick={() => navigate(`/ncs/${action.ncId}`)}
                                            className="text-brand-600 hover:underline text-sm font-mono"
                                        >
                                            {action.ncRef}
                                        </button>
                                        <div className="text-xs text-gray-500">{action.ncDept}</div>
                                    </div>
                                    <div className="col-span-6 md:col-span-2 text-sm text-gray-700">{action.assignee}</div>
                                    <div className="col-span-6 md:col-span-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentStatus)}`}>
                                            {actionStatusLabels[currentStatus] || currentStatus}
                                        </span>
                                    </div>
                                    <div className="col-span-6 md:col-span-2 text-right text-sm text-gray-600">
                                        {action.deadline}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                // TIMELINE VIEW (Simplified Gantt)
                <div className="p-6 space-y-6">
                    {filteredActions.map(action => {
                         const currentStatus = action.status || (action.completed ? ActionStatus.DONE : ActionStatus.PENDING);
                         const isDone = currentStatus === ActionStatus.DONE;
                         const progress = isDone ? 100 : getProgressWidth(action.startDate, action.deadline);
                         
                         return (
                            <div key={action.id} className="relative">
                                <div className="flex justify-between text-sm mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{action.description}</span>
                                        <span className="text-gray-400 text-xs">({action.ncRef})</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(currentStatus)}`}>
                                        {actionStatusLabels[currentStatus] || currentStatus}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>{action.startDate || 'Start'}</span>
                                    <span>{action.deadline || 'End'}</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-green-500' : 'bg-brand-500'}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                         );
                    })}
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default ActionList;