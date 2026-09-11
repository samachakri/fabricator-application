export type WindowType =
  | 'sliding_2track'
  | 'sliding_3track'
  | 'casement_single'
  | 'casement_double'
  | 'fixed'
  | 'combination';

export type ProfileBrand = 'VEKA' | 'REHAU' | 'KOMMERLING' | 'ALUPLAST';

export type ProfileColor =
  | 'pure_white'
  | 'anthracite_grey'
  | 'golden_oak'
  | 'walnut'
  | 'jet_black';

export type GlassType =
  | 'clear_5mm'
  | 'toughened_6mm'
  | 'dgu_5_12_5'
  | 'frosted_5mm'
  | 'tinted_reflective';

export type MeshType = 'none' | 'ss304_mesh' | 'fiber_mesh';

export type ProjectStage =
  | 'sales'
  | 'design'
  | 'quotation'
  | 'payment'
  | 'production'
  | 'completed';

export interface OuterFrameCut {
  id: string;
  label: string; // e.g., "Top Frame", "Left Stile"
  length: number; // mm
  angleLeft: number; // 45 or 90
  angleRight: number; // 45 or 90
  profileCode: string;
  qty: number;
  status?: 'pending' | 'cut';
}

export interface SashCut {
  id: string;
  sashIndex: number;
  label: string; // e.g., "Sash 1 Left", "Sash 1 Top"
  length: number;
  angleLeft: number;
  angleRight: number;
  profileCode: string;
  qty: number;
  status?: 'pending' | 'cut';
}

export interface GlassCut {
  id: string;
  label: string;
  width: number;
  height: number;
  areaSqM: number;
  areaSqFt: number;
  glassType: GlassType;
  thickness: string;
  qty: number;
  status?: 'pending' | 'cut';
}

export interface HardwareItem {
  id: string;
  name: string;
  code: string;
  qty: number;
  unit: string;
  unitCost: number;
  binLocation: string;
}

export interface CalculatedBOM {
  outerFrameCuts: OuterFrameCut[];
  sashCuts: SashCut[];
  mullionCuts: OuterFrameCut[];
  glazingBeadCuts: OuterFrameCut[];
  reinforcementCuts: { label: string; length: number; profileCode: string; qty: number }[];
  glassPanels: GlassCut[];
  gasketMeters: number;
  woolpileMeters: number;
  hardware: HardwareItem[];
  totalProfileMeters: number;
  totalGlassSqFt: number;
  totalSteelMeters: number;
  estimatedMaterialCost: number;
  inventoryStatus: 'IN_STOCK' | 'LOW_STOCK' | 'SHORTAGE';
  shortageDetails?: string[];
}

export interface WindowDesign {
  id: string; // e.g. "W01"
  projectId: string;
  name: string; // e.g. "2 Track Sliding"
  type: WindowType;
  profileBrand: ProfileBrand;
  profileSeries?: string; // e.g. "VEKA 84BS"
  width: number; // in mm
  height: number; // in mm
  leftHeight?: number; // in mm (e.g. 0 to 4000)
  rightHeight?: number; // in mm (e.g. 0 to 4000)
  topWidth?: number; // in mm
  bottomWidth?: number; // in mm
  slopeAngle?: number; // degrees e.g. 45
  shapeType?: 'rectangle' | 'right_triangle' | 'trapezoid' | 'custom_polygon';
  cornerExtensions?: {
    corner: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
    type: 'triangle' | 'slope_45' | 'fixed_box';
    width: number;
    height: number;
    angle?: number;
  }[];
  tracks: number; // 2 or 3
  sashes: number; // 2, 3, 4
  mullions: number; // vertical mullions count
  transoms: number; // horizontal transoms count
  mullionPosition?: number; // percent or mm from left
  transomPosition?: number; // percent or mm from top
  openingDirection:
    | 'sliding_left'
    | 'sliding_right'
    | 'bi_parting'
    | 'casement_left'
    | 'casement_right'
    | 'french_both'
    | 'tilt_turn'
    | 'fixed';
  glassType: GlassType;
  meshType: MeshType;
  profileColor: ProfileColor;
  hardware: {
    handleType: 'crescent' | 'popup_flush' | 'espag_transmission' | 'friction_stay';
    lockingPoints: number;
    rollers: 'nylon_tandem' | 'brass_heavy' | 'standard';
    frictionHinges?: string;
  };
  quantity: number;
  unitPrice: number;
  status: 'DESIGNED' | 'QUOTED' | 'IN_PRODUCTION' | 'COMPLETED';
  calculatedBOM: CalculatedBOM;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}

export interface QuotationRevision {
  version: number;
  date: string;
  grandTotal: number;
  notes: string;
  createdBy: string;
}

export interface QuotationData {
  id: string; // e.g. "QT-1023"
  projectId: string;
  version: number;
  revisions: QuotationRevision[];
  status: 'Draft' | 'Sent' | 'Approved' | 'Revised' | 'Rejected';
  profileCost: number;
  glassCost: number;
  steelCost: number;
  hardwareCost: number;
  fabricationLaborCost: number;
  installationCost: number;
  transportationCost: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  gstPercent: number;
  gstAmount: number;
  grandTotal: number;
  advancePercentage: number;
  advanceRequired: number;
  notes: string;
  terms: string[];
  createdAt: string;
  validUntil: string;
}

export interface PaymentRecord {
  id: string;
  projectId: string;
  receiptNumber: string;
  amount: number;
  paymentType: 'Advance (50%)' | 'Mid-Production (30%)' | 'Final Balance (20%)' | 'Custom';
  method: 'UPI' | 'Bank NEFT/RTGS' | 'Cheque' | 'Cash';
  reference: string;
  date: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  specSubtitle?: string;
  seriesClassification?: string;
  seriesCategory?: 'all' | 'casement' | 'sliding' | 'tilt_turn' | 'hardware' | 'glass_steel' | 'other';
  brand: ProfileBrand | 'Generic' | 'Saint-Gobain' | 'AIS' | 'Tata Steel' | 'Roto / Prominance' | 'Aluplast';
  brandName?: string;
  category: 'Profile' | 'Glass' | 'Steel' | 'Hardware' | 'Gasket' | 'Accessory';
  unit: string;
  stockQty: number;
  reservedQty: number;
  availableQty: number;
  currentStock: number;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  secondaryStockDetail?: string;
  reorderPoint: number;
  unitPrice: number;
  binLocation: string;
  rackLocation?: string;
  iconType?: 'profile' | 'steel' | 'sliding' | 'glass' | 'hardware' | 'gasket' | 'roll';
}

export interface ProductionOrder {
  id: string; // e.g. "PO-8821"
  projectId: string;
  status: 'Cutting' | 'Assembly' | 'QC' | 'Completed';
  cuttingProgress: number; // 0 - 100
  assemblyProgress: number; // 0 - 100
  qcChecklist: {
    dimensionsVerified: boolean;
    weldsCleaned: boolean;
    reinforcementChecked: boolean;
    glassGasketsTight: boolean;
    hardwareSmoothAction: boolean;
    protectiveFilmIntact: boolean;
  };
  qcStatus: 'Pending' | 'Passed' | 'Rework';
  qcNotes: string;
  allocatedWorker: string;
  createdAt: string;
  completedAt?: string;
}

export type DealStage =
  | 'New Inquiry'
  | 'Site Survey'
  | 'Design & CAD'
  | 'Quotation Sent'
  | 'Advance Pending'
  | 'Won - In Production';

export interface Project {
  id: string; // e.g. "PRJ-1042"
  name: string; // e.g. "Ramesh Residence"
  customerId: string;
  customer: Customer;
  siteAddress: string;
  projectType: 'Residential' | 'Commercial' | 'Villa' | 'Builder / Apartment';
  currentStage: ProjectStage;
  status: 'Designing' | 'Quotation Sent' | 'Advance Received' | 'In Production' | 'Completed';
  dealStage?: DealStage;
  dealOwner?: { name: string; avatar: string; color?: string };
  lastActivity?: {
    type: 'mail' | 'phone' | 'calendar' | 'cad' | 'eye' | 'payment' | 'clock';
    text: string;
    subText?: string;
  };
  specSummary?: string;
  location?: string;
  estimatedValue: number;
  windows: WindowDesign[];
  quotation: QuotationData | null;
  payments: PaymentRecord[];
  productionOrder: ProductionOrder | null;
  designLocked: boolean;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
}
