import { ParametricWindowDesign } from '@/lib/design/types';

export type ProductionStage =
  | 'READY'
  | 'CUTTING'
  | 'ASSEMBLY'
  | 'QC'
  | 'REWORK'
  | 'COMPLETED';

export type ProductionPriority = 'High' | 'Normal' | 'Low';

export type MaterialStatus =
  | 'Materials Ready'
  | 'Materials Reserved'
  | 'Partially Available'
  | 'Shortage'
  | 'Ready';

export interface CuttingItem {
  id: string;
  profileCode: string; // e.g. "P-101", "P-202", "P-301"
  profileName: string; // e.g. "Frame Profile", "Sash Profile", "Mullion Profile"
  section: 'Frame' | 'Sash' | 'Mullion' | 'Transom' | 'Beading';
  lengthMm: number;
  quantity: number;
  completedQuantity: number;
  status: 'Pending' | 'Completed';
  completedBy?: string;
  completedAt?: string;
}

export interface AssemblyTask {
  id: string;
  category: 'Frame' | 'Sash' | 'Glass' | 'Hardware';
  title: string;
  description: string;
  component: string;
  hardwareType?: string;
  quantity?: number;
  instructions?: string;
  status: 'Pending' | 'Completed';
  completedBy?: string;
  completedAt?: string;
}

export interface QCCheckItem {
  id: string;
  category: 'Dimensions' | 'Frame' | 'Sash' | 'Glass' | 'Hardware' | 'Finish';
  label: string;
  designValue?: string;
  actualValue?: string;
  tolerance?: string;
  isToleranceWarning?: boolean;
  passed: boolean;
  notes?: string;
}

export interface ReworkTask {
  id: string;
  component: string;
  problem: string;
  description: string;
  priority: ProductionPriority;
  assignedTo: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  startedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface ProductionItem {
  id: string; // e.g. "W01"
  windowId: string;
  name: string; // e.g. "Sliding Window"
  type: string; // "Sliding Window", "Casement Window", "Mesh Door", "Fixed Window"
  dimensions: string; // "1800 × 1500 mm"
  width: number;
  height: number;
  stage: ProductionStage;
  status: 'Pending' | 'In Progress' | 'Completed';
  cuttingList: CuttingItem[];
  assemblyChecklist: AssemblyTask[];
  qcChecklist: QCCheckItem[];
  reworkTasks: ReworkTask[];
  designData?: ParametricWindowDesign;
}

export interface MaterialRequirement {
  material: string;
  required: string;
  available: string;
  status: 'Ready' | 'Shortage' | 'Reserved';
  shortageNote?: string;
}

export interface ProductionTiming {
  stage: ProductionStage;
  startedAt?: string;
  completedAt?: string;
  duration?: string;
  worker?: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  notes?: string;
}

export interface ManufacturingOrder {
  id: string; // e.g. "PO-1045"
  project: string; // e.g. "Rahul Residence"
  customer: string; // e.g. "Rahul Sharma"
  quotationId: string; // e.g. "QT-1024"
  windowsCount: number;
  doorsCount: number;
  windowsDoorsSummary: string; // e.g. "4 Windows + 1 Door" or "5"
  priority: ProductionPriority;
  currentStage: ProductionStage;
  materialStatus: MaterialStatus;
  assignedTo: string; // e.g. "Ramesh"
  dueDate: string; // e.g. "10 Sep"
  lastUpdated: string; // e.g. "Today, 2:15 PM"
  productionStartTimestamp?: string;
  completionTimestamp?: string;
  completedBy?: string;

  // Readiness checklist
  readinessChecklist: {
    quotationApproved: boolean;
    designCompleted: boolean;
    customerInfoAvailable: boolean;
    windowConfigurationComplete: boolean;
    materialsAvailable: boolean;
    materialsReserved: boolean;
    productionItemsGenerated: boolean;
  };

  // Materials
  materials: MaterialRequirement[];
  hasShortage: boolean;
  shortageReason?: string;

  // Items
  items: ProductionItem[];

  // Activity history & timings
  activityHistory: ActivityLogEntry[];
  timings: ProductionTiming[];
}
