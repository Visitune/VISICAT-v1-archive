import { AppData, AppSettings, NonConformance, NCStatus, NCSeverity, ActionType, ActionStatus } from '../types';

const STORAGE_KEY = 'visicat_data_v1';

const DEFAULT_SETTINGS: AppSettings = {
  organizationName: 'Mon Entreprise Qualité',
  departments: ['Production', 'Qualité', 'Maintenance', 'Logistique', 'R&D'],
  locations: ['Ligne 1', 'Ligne 2', 'Entrepôt A', 'Laboratoire'],
  sources: ['Audit Interne', 'Plainte Client', 'Problème Fournisseur', 'Tour de Terrain'],
  users: ['Jean Dupont', 'Marie Martin', 'Michel Lambert', 'Sophie Bernard'],
  apiKey: ''
};

const DEFAULT_DATA: AppData = {
  ncs: [],
  settings: DEFAULT_SETTINGS
};

export const loadData = (): AppData => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return DEFAULT_DATA;
    }
    const data = JSON.parse(serialized);
    
    // Migration: ensure settings has apiKey
    if (!data.settings.apiKey) {
        data.settings.apiKey = '';
    }

    // Migration: ensure all NCs have ishikawa object if loaded from old version
    data.ncs = data.ncs.map((nc: any) => ({
        ...nc,
        rcaMethod: nc.rcaMethod || '5whys',
        ishikawa: nc.ishikawa || { man: '', machine: '', material: '', method: '', environment: '', measurement: '' }
    }));
    return data;
  } catch (e) {
    console.error("Failed to load data", e);
    return DEFAULT_DATA;
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data (likely quota exceeded)", e);
    alert("Error saving data. Local storage might be full (check attachment sizes).");
  }
};

export const exportData = (data: AppData) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `visicat_export_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result) as AppData;
        if (!data.ncs || !data.settings) throw new Error("Invalid format");
        
        // Ensure apiKey field exists after import
        if (!data.settings.apiKey) data.settings.apiKey = '';

        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};

// Seed some demo data if empty
export const seedDemoData = (): AppData => {
  const currentData = loadData();
  if (currentData.ncs.length > 0) return currentData;

  const today = new Date();
  const dateStr = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
  };

  const demoNCs: NonConformance[] = [
    {
      id: 'nc-demo-1',
      reference: 'NC-2023-001',
      title: 'Contamination métallique Lot A45',
      description: 'Lors du contrôle de détection des métaux, le détecteur n\'a pas rejeté une pièce test sur la Ligne 1. Un contrôle manuel ultérieur a trouvé une petite limaille métallique dans le produit.',
      dateOccurred: dateStr(-5),
      status: NCStatus.OPEN,
      severity: NCSeverity.CRITICAL,
      source: 'Audit Interne',
      department: 'Production',
      location: 'Ligne 1',
      rcaMethod: '5whys',
      fiveWhys: { why1: '', why2: '', why3: '', why4: '', why5: '' },
      ishikawa: { man: '', machine: '', material: '', method: '', environment: '', measurement: '' },
      rootCause: '',
      actions: [
        {
          id: 'act-demo-1a',
          description: 'Calibrer le détecteur de métaux',
          type: ActionType.IMMEDIATE,
          status: ActionStatus.DONE,
          assignee: 'Michel Lambert',
          startDate: dateStr(-4),
          deadline: dateStr(-3),
          resources: 'Kit de calibration',
          attachments: [],
          completed: true
        },
        {
            id: 'act-demo-1b',
            description: 'Reformer les opérateurs sur les procédures de test',
            type: ActionType.CORRECTIVE,
            status: ActionStatus.IN_PROGRESS,
            assignee: 'Sophie Bernard',
            startDate: dateStr(-1),
            deadline: dateStr(2),
            resources: 'Support de formation',
            attachments: [],
            completed: false
        }
      ],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'nc-demo-2',
      reference: 'NC-2023-002',
      title: 'Erreur d\'étiquetage',
      description: 'Les étiquettes pour la variante "Épicé" ont été appliquées sur des contenants "Doux" pendant 30 minutes.',
      dateOccurred: dateStr(-15),
      status: NCStatus.CLOSED,
      severity: NCSeverity.MAJOR,
      source: 'Plainte Client',
      department: 'Production',
      location: 'Ligne 2',
      rcaMethod: 'ishikawa',
      fiveWhys: { why1: '', why2: '', why3: '', why4: '', why5: '' },
      ishikawa: { 
          man: 'Fatigue opérateur, contrôles manqués', 
          machine: 'Mauvais réglage étiqueteuse', 
          material: 'Étiquettes visuellement similaires', 
          method: 'Procédure de changement de série peu claire', 
          environment: 'Mauvais éclairage zone étiquetage', 
          measurement: '' 
      },
      rootCause: 'Similitude visuelle des étiquettes et manque d\'identification secondaire distincte causant une erreur opérateur.',
      actions: [
        {
          id: 'act-1',
          description: 'Mise en quarantaine du stock affecté',
          type: ActionType.IMMEDIATE,
          status: ActionStatus.DONE,
          assignee: 'Jean Dupont',
          startDate: dateStr(-15),
          deadline: dateStr(-14),
          resources: 'Zone de quarantaine',
          attachments: [],
          completed: true
        }
      ],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const newData = { ...currentData, ncs: demoNCs };
  saveData(newData);
  return newData;
};