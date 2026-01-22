export enum NCStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  CLOSED = 'Closed',
  VERIFIED = 'Verified'
}

export enum NCSeverity {
  MINOR = 'Minor',
  MAJOR = 'Major',
  CRITICAL = 'Critical'
}

export enum ActionType {
  IMMEDIATE = 'Immediate',
  CORRECTIVE = 'Corrective',
  PREVENTIVE = 'Preventive'
}

export enum ActionStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
  DELAYED = 'Delayed'
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // Base64
  date: string;
}

export interface ActionPlan {
  id: string;
  description: string;
  type: ActionType;
  status: ActionStatus;
  assignee: string;
  startDate: string;
  deadline: string;
  resources: string; 
  attachments: Attachment[];
  completed: boolean; 
}

export interface FiveWhys {
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
}

export interface Ishikawa {
  man: string;      // Main d'oeuvre
  machine: string;  // Matériel
  material: string; // Matière
  method: string;   // Méthode
  environment: string; // Milieu (Mother Nature)
  measurement: string; // Mesure
}

export interface NonConformance {
  id: string;
  reference: string;
  title: string;
  description: string;
  dateOccurred: string;
  status: NCStatus;
  severity: NCSeverity;
  source: string; 
  department: string;
  location: string;
  
  // RCA Methods
  rcaMethod: '5whys' | 'ishikawa' | 'combined'; // Selector
  fiveWhys: FiveWhys;
  ishikawa: Ishikawa;
  rootCause: string;

  // Actions
  actions: ActionPlan[];

  // Files
  attachments: Attachment[];
  
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  organizationName: string;
  departments: string[];
  locations: string[];
  sources: string[];
  users: string[]; 
  apiKey: string; // User provided Gemini API Key
}

export interface AppData {
  ncs: NonConformance[];
  settings: AppSettings;
}