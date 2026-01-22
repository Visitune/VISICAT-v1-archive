import React, { useState } from 'react';
import { translations, Language } from '../services/translations';
import { BookOpen, GitBranch, Layers, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface UserGuideProps {
  lang: Language;
}

const UserGuide: React.FC<UserGuideProps> = ({ lang }) => {
  const t = translations[lang].guide;
  const [activeTab, setActiveTab] = useState<'app' | 'rca' | 'examples'>('rca');

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-500 mt-2">{t.subtitle}</p>
      </div>

      <div className="flex justify-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab('app')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'app' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
            {t.tabs.app}
        </button>
        <button
          onClick={() => setActiveTab('rca')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'rca' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
           {t.tabs.rca}
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'examples' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
           {t.tabs.examples}
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        
        {/* RCA EDUCATION */}
        {activeTab === 'rca' && (
            <div className="space-y-8">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{t.rcaTitle}</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Root Cause Analysis (RCA) is the process of discovering the root causes of problems in order to identify appropriate solutions. 
                        VISIcat supports two primary methods:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-3 mb-3 text-blue-800">
                            <GitBranch size={28} />
                            <h4 className="font-bold text-xl">{t.why5}</h4>
                        </div>
                        <p className="text-blue-900 mb-4">{t.why5Desc}</p>
                        <div className="bg-white p-4 rounded text-sm text-gray-600 shadow-sm">
                            <p className="font-semibold mb-2">Example:</p>
                            <ul className="list-decimal pl-4 space-y-1">
                                <li>The vehicle won't start. (The Problem)</li>
                                <li><strong>Why?</strong> The battery is dead.</li>
                                <li><strong>Why?</strong> The alternator is not functioning.</li>
                                <li><strong>Why?</strong> The alternator belt has broken.</li>
                                <li><strong>Why?</strong> The alternator belt was well beyond its useful service life and not replaced.</li>
                                <li><strong>Why?</strong> The vehicle was not maintained according to the recommended service schedule. (Root Cause)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-teal-50 p-6 rounded-lg border border-teal-100">
                        <div className="flex items-center gap-3 mb-3 text-teal-800">
                             <Layers size={28} />
                            <h4 className="font-bold text-xl">{t.fishbone}</h4>
                        </div>
                        <p className="text-teal-900 mb-4">{t.fishboneDesc}</p>
                        <ul className="space-y-2 text-sm text-gray-700 bg-white p-4 rounded shadow-sm">
                            <li className="flex gap-2"><span className="font-bold text-teal-700">M</span> {t.fishboneDetails.man}</li>
                            <li className="flex gap-2"><span className="font-bold text-teal-700">M</span> {t.fishboneDetails.machine}</li>
                            <li className="flex gap-2"><span className="font-bold text-teal-700">M</span> {t.fishboneDetails.material}</li>
                            <li className="flex gap-2"><span className="font-bold text-teal-700">M</span> {t.fishboneDetails.method}</li>
                            <li className="flex gap-2"><span className="font-bold text-teal-700">M</span> {t.fishboneDetails.env}</li>
                            <li className="flex gap-2"><span className="font-bold text-teal-700">M</span> {t.fishboneDetails.measure}</li>
                        </ul>
                    </div>
                </div>
            </div>
        )}

        {/* APP USAGE */}
        {activeTab === 'app' && (
             <div className="prose max-w-none text-gray-700">
                <h3>Workflow</h3>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>
                        <strong>Create an Incident:</strong> Go to "Non-Conformances" and click "New Record". 
                        Fill in the "Information" tab with the facts (Who, What, Where, When).
                    </li>
                    <li>
                        <strong>Analyze (RCA):</strong> Switch to the "RCA" tab. Choose your method (5 Whys or Ishikawa). 
                        You can use the <strong>Gemini AI</strong> button to auto-analyze the description.
                    </li>
                    <li>
                        <strong>Plan Actions:</strong> Once the root cause is found, go to "Action Plan". 
                        Define corrections (immediate fixes) and corrective actions (long-term fixes). Assign them to users.
                    </li>
                    <li>
                        <strong>Close:</strong> Once actions are done, change the NC status to "Closed". 
                        After a period of time, verify effectiveness and change to "Verified".
                    </li>
                </ol>
             </div>
        )}

        {/* EXAMPLES */}
        {activeTab === 'examples' && (
            <div className="space-y-8">
                {/* Scenario 1: Metal Contamination / Listeria (using new translations for Listeria example) */}
                <div className="border border-red-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-red-50 p-4 border-b border-red-200 flex items-center gap-2">
                        <AlertCircle className="text-red-600" />
                        <h4 className="font-bold text-lg text-red-900">{t.scenario1.title}</h4>
                    </div>
                    <div className="p-6 bg-white space-y-4">
                         <div className="bg-gray-50 p-3 rounded text-sm">
                            <span className="font-bold text-gray-900">Problem:</span> {t.scenario1.problem}
                         </div>
                         <div>
                             <h5 className="font-bold text-gray-800 mb-2">{t.scenario1.analysis}</h5>
                             <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                <li>{t.scenario1.why1}</li>
                                <li>{t.scenario1.why2}</li>
                                <li>{t.scenario1.why3}</li>
                                <li>{t.scenario1.why4}</li>
                             </ul>
                         </div>
                         <div className="flex flex-col md:flex-row gap-4">
                             <div className="flex-1 bg-red-50 p-3 rounded border border-red-100">
                                 <p className="text-sm font-bold text-red-800">{t.scenario1.root}</p>
                             </div>
                             <div className="flex-1 bg-green-50 p-3 rounded border border-green-100">
                                 <p className="text-sm font-bold text-green-800">{t.scenario1.action}</p>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Scenario 2: Labeling Error */}
                <div className="border border-amber-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-amber-50 p-4 border-b border-amber-200 flex items-center gap-2">
                        <AlertCircle className="text-amber-600" />
                        <h4 className="font-bold text-lg text-amber-900">{t.scenario2.title}</h4>
                    </div>
                    <div className="p-6 bg-white space-y-4">
                         <div className="bg-gray-50 p-3 rounded text-sm">
                            <span className="font-bold text-gray-900">Problem:</span> {t.scenario2.problem}
                         </div>
                         <div>
                             <h5 className="font-bold text-gray-800 mb-2">{t.scenario2.analysis}</h5>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                <div className="bg-blue-50 p-2 rounded text-blue-800">{t.scenario2.man}</div>
                                <div className="bg-blue-50 p-2 rounded text-blue-800">{t.scenario2.machine}</div>
                                <div className="bg-blue-50 p-2 rounded text-blue-800">{t.scenario2.method}</div>
                             </div>
                         </div>
                         <div className="flex flex-col md:flex-row gap-4">
                             <div className="flex-1 bg-red-50 p-3 rounded border border-red-100">
                                 <p className="text-sm font-bold text-red-800">{t.scenario2.root}</p>
                             </div>
                             <div className="flex-1 bg-green-50 p-3 rounded border border-green-100">
                                 <p className="text-sm font-bold text-green-800">{t.scenario2.action}</p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default UserGuide;