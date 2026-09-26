import {
  ParametricWindowDesign,
  GlassComponentConfig,
  SashComponentConfig,
} from './types';
import { WindowDesign, GlassType, ProfileBrand } from '@/lib/types';
import { calculateWindowBOM } from '@/lib/bom-calculator';

// Standard 1800 x 1200 mm 3-panel sliding window matching Stitch reference screenshot
export function createDefaultWindowDesign(
  windowId: string = 'W01',
  name: string = 'Living Room',
  projectId: string = 'PRJ-1042'
): ParametricWindowDesign {
  const defaultGlass: GlassComponentConfig = {
    glassType: 'Toughened',
    thickness: 5,
    color: 'Clear',
    ratePerSqFt: 180,
  };

  const sash1Config: SashComponentConfig = {
    openingDirection: 'sliding_right',
    hasMesh: false,
    meshType: 'Fiberglass',
    meshRatePerSqFt: 60,
    glassConfig: { ...defaultGlass },
    hardwareType: 'Standard Sliding Set',
    hardwareRate: 450,
  };

  const sash2Config: SashComponentConfig = {
    openingDirection: 'sliding_left',
    hasMesh: true,
    meshType: 'Fiberglass',
    meshRatePerSqFt: 60,
    glassConfig: { ...defaultGlass },
    hardwareType: 'Standard Sliding Set',
    hardwareRate: 500,
  };

  return {
    id: windowId,
    name,
    projectId,
    windowType: 'Sliding Window',
    width: 1800,
    height: 1500,
    quantity: 1,
    unit: 'MM',

    profileBrand: 'VEKA',
    profileSystem: '60 mm',
    profileSeries: 'Sliding Series',
    profileColor: 'Pure White',

    frameRatePerFt: 250,
    sashRatePerFt: 220,
    labourCostPerWindow: 1200,

    // 2 sliding panels: Sliding Right -> | Sliding Left <- with center meeting rail
    panels: [
      {
        id: 'panel-01',
        name: 'Panel 01',
        panelType: 'sliding',
        openingDirection: 'sliding_right',
        xRatio: 0,
        widthRatio: 0.5,
        sashId: 'sash-01',
        glassId: 'glass-01',
        hardwareId: 'hardware-01',
      },
      {
        id: 'panel-02',
        name: 'Panel 02',
        panelType: 'sliding',
        openingDirection: 'sliding_left',
        xRatio: 0.5,
        widthRatio: 0.5,
        sashId: 'sash-02',
        glassId: 'glass-02',
        meshId: 'mesh-02',
        hardwareId: 'hardware-02',
      },
    ],

    mullions: [
      { id: 'mullion-01', positionRatio: 0.5, width: 60 },
    ],
    transoms: [],

    glassConfigs: {
      'glass-01': { ...defaultGlass },
      'glass-02': { ...defaultGlass },
    },

    sashConfigs: {
      'sash-01': sash1Config,
      'sash-02': sash2Config,
    },

    defaultGlass,
    defaultMesh: {
      type: 'Fiberglass',
      ratePerSqFt: 60,
    },
    defaultHardware: {
      type: 'Standard Sliding Set',
      rate: 450,
    },
  };
}

// Create blank parametric window design ready for drag-and-drop
export function createBlankWindowDesign(
  windowId: string = 'W01',
  name: string = 'W01',
  projectId: string = 'PRJ-1042'
): ParametricWindowDesign {
  const defaultGlass: GlassComponentConfig = {
    glassType: 'Toughened',
    thickness: 5,
    color: 'Clear',
    ratePerSqFt: 180,
  };

  return {
    id: windowId,
    name,
    projectId,
    windowType: 'Sliding Window',
    width: 0,
    height: 0,
    quantity: 1,
    unit: 'MM',

    profileBrand: 'VEKA',
    profileSystem: '60 mm',
    profileSeries: 'Sliding Series',
    profileColor: 'Clear',

    frameRatePerFt: 250,
    sashRatePerFt: 220,
    labourCostPerWindow: 1200,

    panels: [],
    mullions: [],
    transoms: [],

    glassConfigs: {},
    sashConfigs: {},

    defaultGlass,
    defaultMesh: {
      type: 'Fiberglass',
      ratePerSqFt: 60,
    },
    defaultHardware: {
      type: 'Standard Sliding Set',
      rate: 450,
    },
  };
}

// Convert legacy WindowDesign from store to ParametricWindowDesign
export function convertToParametricDesign(
  legacy: WindowDesign,
  projectId: string
): ParametricWindowDesign {
  // If legacy already has full parametric custom properties stored
  if (legacy.notes && legacy.notes.startsWith('PARAMETRIC_JSON:')) {
    try {
      const parsed = JSON.parse(legacy.notes.replace('PARAMETRIC_JSON:', ''));
      if (parsed && Array.isArray(parsed.panels)) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Otherwise construct a blank design (empty canvas) — user drags shapes to populate
  const base = createBlankWindowDesign(legacy.id, legacy.name || legacy.id, projectId);
  base.width = legacy.width || 0;
  base.height = legacy.height || 0;
  base.quantity = legacy.quantity || 1;
  base.profileBrand = (legacy.profileBrand as any) || 'VEKA';

  // Map glass type
  if (legacy.glassType === 'toughened_6mm') {
    base.defaultGlass.glassType = 'Toughened';
    base.defaultGlass.thickness = 6;
    base.defaultGlass.ratePerSqFt = 180;
  } else if (legacy.glassType === 'dgu_5_12_5') {
    base.defaultGlass.glassType = 'DGU / IGU';
    base.defaultGlass.thickness = 12;
    base.defaultGlass.ratePerSqFt = 290;
  }

  return base;
}

// Convert ParametricWindowDesign back to store WindowDesign for backward compatibility
export function convertToStoreWindowDesign(
  param: ParametricWindowDesign
): Partial<WindowDesign> {
  const brand = (param.profileBrand || 'VEKA') as ProfileBrand;
  const glassType: GlassType =
    param.defaultGlass.glassType === 'Toughened'
      ? 'toughened_6mm'
      : param.defaultGlass.glassType === 'DGU / IGU'
      ? 'dgu_5_12_5'
      : 'clear_5mm';

  const bom = calculateWindowBOM({
    id: param.id,
    type: 'sliding_3track',
    width: param.width,
    height: param.height,
    profileBrand: brand,
    tracks: 3,
    sashes: param.panels.filter((p) => p.panelType !== 'fixed').length || 2,
    glassType,
    meshType: 'none',
    hardware: {
      handleType: 'popup_flush',
      lockingPoints: 2,
      rollers: 'nylon_tandem',
    },
  });

  return {
    id: param.id,
    name: param.id,
    width: param.width,
    height: param.height,
    quantity: param.quantity,
    profileBrand: brand,
    profileSeries: param.profileSeries,
    glassType,
    calculatedBOM: bom,
    notes: `PARAMETRIC_JSON:${JSON.stringify(param)}`,
  };
}
