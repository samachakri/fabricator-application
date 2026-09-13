export type WindowComponentType =
  | 'frame'
  | 'sash'
  | 'glass'
  | 'mesh'
  | 'mullion'
  | 'transom'
  | 'panel'
  | 'hardware';

export type ProfileBrandName = 'VEKA' | 'REHAU' | 'KOMMERLING' | 'ALUPLAST' | 'Other';
export type GlassTypeName = 'Clear' | 'Toughened' | 'Laminated' | 'Frosted' | 'Tinted' | 'DGU / IGU';
export type MeshTypeName = 'Fiberglass' | 'Stainless Steel' | 'Pleated' | 'None';
export type HardwareTypeName = 'Standard Sliding Set' | 'Touch Lock' | 'Tandem Roller' | 'Espag Handle' | 'Friction Stay' | 'Cylinder Lock';
export type OpeningDirectionType =
  | 'fixed'
  | 'sliding_left'
  | 'sliding_right'
  | 'casement_left'
  | 'casement_right'
  | 'tilt_turn'
  | 'top_hung';

export interface GlassComponentConfig {
  glassType: GlassTypeName;
  thickness: number; // in mm, e.g. 5, 6, 8, 10
  color: string; // 'Clear', 'Frosted', 'Bronze Tinted', etc.
  ratePerSqFt: number;
}

export interface SashComponentConfig {
  openingDirection: OpeningDirectionType;
  hasMesh: boolean;
  meshType?: MeshTypeName;
  meshRatePerSqFt?: number;
  glassConfig: GlassComponentConfig;
  hardwareType: HardwareTypeName;
  hardwareRate: number;
}

export interface DesignPanel {
  id: string; // e.g. "panel-01"
  name: string; // e.g. "Left Panel (Fixed)"
  panelType: 'fixed' | 'sliding' | 'casement';
  openingDirection: OpeningDirectionType;
  xRatio: number; // 0 to 1 (left proportion)
  widthRatio: number; // 0 to 1 (width proportion)
  yRatio?: number; // 0 to 1 (for horizontal splits)
  heightRatio?: number;
  sashId?: string;
  glassId: string;
  meshId?: string;
  hardwareId?: string;
}

export interface DesignMullion {
  id: string; // e.g. "mullion-01"
  positionRatio: number; // 0 to 1
  width: number; // mm, typically 60-84mm
}

export interface DesignTransom {
  id: string; // e.g. "transom-01"
  positionRatio: number; // 0 to 1
  height: number; // mm
}

export interface DesignComponentSummary {
  id: string;
  type: WindowComponentType;
  name: string;
  subtitle: string;
  rateDescription: string;
  cost: number;
}

export interface ParametricWindowDesign {
  id: string; // e.g. "W01"
  name: string; // e.g. "Living Room"
  projectId: string;
  windowType: 'Sliding Window' | 'Casement Window' | 'Combination Window' | 'Fixed Window';
  width: number; // overall width in mm
  height: number; // overall height in mm
  quantity: number;
  unit: 'MM' | 'INCH';

  // Profile system
  profileBrand: ProfileBrandName;
  profileSystem: string; // e.g. "60 mm", "70 mm", "88 mm"
  profileSeries: string; // e.g. "Sliding Series", "Casement Series"
  profileColor: string; // e.g. "Clear", "Pure White", "Anthracite Grey", "Golden Oak"

  // Rates
  frameRatePerFt: number;
  sashRatePerFt: number;
  labourCostPerWindow: number;

  // Structural divisions
  panels: DesignPanel[];
  mullions: DesignMullion[];
  transoms: DesignTransom[];

  // Component configs
  glassConfigs: Record<string, GlassComponentConfig>;
  sashConfigs: Record<string, SashComponentConfig>;

  // Global defaults
  defaultGlass: GlassComponentConfig;
  defaultMesh: {
    type: MeshTypeName;
    ratePerSqFt: number;
  };
  defaultHardware: {
    type: HardwareTypeName;
    rate: number;
  };

  // Arch head configuration (Arch + Window combination)
  hasArch?: boolean;
  archType?: 'round' | 'gothic' | 'segmental';
  archHeight?: number; // mm rise of arch on top of window
  archSpokes?: number; // number of radial mullion spokes

  // Additional sections / custom hardware added manually by user
  customSections?: CustomSectionItem[];

  // Optional manual price overrides
  manualProfileCost?: number;
  manualGlassCost?: number;
  manualHardwareCost?: number;
  manualMeshCost?: number;
  manualLabourCost?: number;
}

export interface CustomSectionItem {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unitPrice: number;
}

export interface WindowPriceEstimate {
  profileCost: number;
  glassCost: number;
  hardwareCost: number;
  meshCost: number;
  labourCost: number;
  customSectionsCost?: number;
  totalCost: number;
  totalAreaSqFt: number;
  totalGlassAreaSqFt: number;
  totalProfileLengthFt: number;
  totalMeshAreaSqFt: number;
}
