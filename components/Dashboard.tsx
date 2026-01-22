import React, { useState, useMemo } from 'react';
import { AppData, NCStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, FileWarning, Filter } from 'lucide-react';
import { translations, Language } from '../services/translations';

interface DashboardProps {
  data: AppData;
  lang: Language;
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']; // Red, Amber, Blue, Green
const STATUS_ORDER = [NCStatus.OPEN, NCStatus.IN_PROGRESS, NCStatus.CLOSED, NCStatus.VERIFIED];

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: number, icon: any, colorClass: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
      <Icon className={colorClass} size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ data, lang }) => {
  const t = translations[lang].dashboard;
  const statusLabels = translations[lang].status;
  const filterLabels = translations[lang].dashboard.filters;

  // Filter States
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All'); // 'All', 'Q1', 'Q2', 'Q3', 'Q4', or 'M1'...'M12' (using quarters for simplicity)
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');

  // Derive unique years from data
  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(data.ncs.map(nc => new Date(nc.dateOccurred).getFullYear().toString())));
    return uniqueYears.sort().reverse();
  }, [data.ncs]);

  // Filter Logic
  const filteredNCs = useMemo(() => {
    return data.ncs.filter(nc => {
      const ncDate = new Date(nc.dateOccurred);
      const year = ncDate.getFullYear().toString();
      const month = ncDate.getMonth(); // 0-11

      // Year Filter
      if (selectedYear !== 'All' && year !== selectedYear) return false;

      // Period Filter (Quarters)
      if (selectedPeriod !== 'All') {
        if (selectedPeriod === 'Q1' && (month < 0 || month > 2)) return false;
        if (selectedPeriod === 'Q2' && (month < 3 || month > 5)) return false;
        if (selectedPeriod === 'Q3' && (month < 6 || month > 8)) return false;
        if (selectedPeriod === 'Q4' && (month < 9 || month > 11)) return false;
      }

      // Dept Filter
      if (selectedDept !== 'All' && nc.department !== selectedDept) return false;

      // Source Filter
      if (selectedSource !== 'All' && nc.source !== selectedSource) return false;

      return true;
    });
  }, [data.ncs, selectedYear, selectedPeriod, selectedDept, selectedSource]);


  // KPI Calculations
  const total = filteredNCs.length;
  const open = filteredNCs.filter(n => n.status === NCStatus.OPEN).length;
  const inProgress = filteredNCs.filter(n => n.status === NCStatus.IN_PROGRESS).length;
  const closed = filteredNCs.filter(n => n.status === NCStatus.CLOSED || n.status === NCStatus.VERIFIED).length;

  // Chart Data Preparation
  const statusData = STATUS_ORDER.map(status => ({
    name: statusLabels[status],
    value: filteredNCs.filter(n => n.status === status).length
  }));

  const deptDataRaw = filteredNCs.reduce((acc, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const deptData = Object.keys(deptDataRaw).map(k => ({ name: k, count: deptDataRaw[k] }));

  const sourceDataRaw = filteredNCs.reduce((acc, curr) => {
    acc[curr.source] = (acc[curr.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sourceData = Object.keys(sourceDataRaw).map(k => ({ name: k, count: sourceDataRaw[k] }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">{t.title}</h2>
        <p className="text-gray-500">{t.subtitle} {data.settings.organizationName}</p>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-brand-700 font-semibold mr-2">
            <Filter size={20} />
            <span>{filterLabels.title}</span>
        </div>

        {/* Year Filter */}
        <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500"
        >
            <option value="All">{filterLabels.allYears}</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Period Filter (Quarters) */}
        <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500"
        >
            <option value="All">{filterLabels.allPeriods}</option>
            <option value="Q1">{filterLabels.q1}</option>
            <option value="Q2">{filterLabels.q2}</option>
            <option value="Q3">{filterLabels.q3}</option>
            <option value="Q4">{filterLabels.q4}</option>
        </select>

        {/* Dept Filter */}
        <select 
            value={selectedDept} 
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500"
        >
            <option value="All">{filterLabels.allDepts}</option>
            {data.settings.departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Source Filter */}
        <select 
            value={selectedSource} 
            onChange={(e) => setSelectedSource(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500"
        >
            <option value="All">{filterLabels.allSources}</option>
            {data.settings.sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t.kpi.total} value={total} icon={FileWarning} colorClass="text-gray-600" />
        <StatCard title={t.kpi.open} value={open} icon={AlertTriangle} colorClass="text-red-600" />
        <StatCard title={t.kpi.inProgress} value={inProgress} icon={Clock} colorClass="text-amber-600" />
        <StatCard title={t.kpi.closed} value={closed} icon={CheckCircle} colorClass="text-green-600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">{t.charts.status}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">{t.charts.dept}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
       {/* Charts Row 2 */}
       <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">{t.charts.source}</h3>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;