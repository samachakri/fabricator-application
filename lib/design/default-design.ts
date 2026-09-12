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

  const sash2Config: SashComponentConfig = {
    openingDirection: 'sliding_right',
    hasMesh: false,
    meshType: 'Fiberglass',
    meshRatePerSqFt: 60,
    glassConfig: { ...defaultGlass },
    hardwareType: 'Standard Sliding Set',
    hardwareRate: 450,
  };

  const sash3Config: SashComponentConfig = {
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
    height: 1200,
    quantity: 1,
    unit: 'MM',

    profileBrand: 'VEKA',
    profileSystem: '60 mm',
    profileSeries: 'Sliding Series',
    profileColor: 'Clear',

    frameRatePerFt: 250,
    sashRatePerFt: 220,
    labourCostPerWindow: 1200,

    // 3 panels: Fixed | Sliding -> | Sliding <-
    panels: [
      {
        id: 'panel-01',
        name: 'Left Panel (Fixed)',
        panelType: 'fixed',
        openingDirection: 'fixed',
        xRatio: 0,
        widthRatio: 1 / 3,
        glassId: 'glass-01',
      },
      {
        id: 'panel-02',
        name: 'Center Panel (Sliding)',
        panelType: 'sliding',
        openingDirection: 'sliding_right',
        xRatio: 1 / 3,
        widthRatio: 1 / 3,
        sashId: 'sash-02',
        glassId: 'glass-02',
        hardwareId: 'hardware-02',
      },
      {
        id: 'panel-03',
        name: 'Right Panel (Sliding)',
        panelType: 'sliding',
        openingDirection: 'sliding_left',
        xRatio: 2 / 3,
        widthRatio: 1 / 3,
        sashId: 'sash-03',
        glassId: 'glass-03',
        meshId: 'mesh-03',
        hardwareId: 'hardware-03',
      },
    ],

    mullions: [
      { id: 'mullion-01', positionRatio: 1 / 3, width: 60 },
      { id: 'mullion-02', positionRatio: 2 / 3, width: 60 },
    ],
    transoms: [],

    glassConfigs: {
      'glass-01': { ...defaultGlass },
      'glass-02': { ...defaultGlass },
      'glass-03': { ...defaultGlass },
    },

    sashConfigs: {
      'sash-02': sash2Config,
      'sash-03': sash3Config,
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

// Convert legacy WindowDesign from store to ParametricWindowDesign
export function convertToParametricDesign(
  legacy: WindowDesign,
  projectId: string
): ParametricWindowDesign {
  // If legacy already has full parametric custom properties stored
  if (legacy.notes && legacy.notes.startsWith('PARAMETRIC_JSON:')) {
    try {
      const parsed = JSON.parse(legacy.notes.replace('PARAMETRIC_JSON:', ''));
      if (parsed && parsed.panels && parsed.panels.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Otherwise construct a parametric design based on legacy dimensions & type
  const base = createDefaultWindowDesign(legacy.id, legacy.name, projectId);
  base.width = legacy.width || 1800;
  base.height = legacy.height || 1200;
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
    name: `Window ${param.id} (${param.name || 'Sliding'})`,
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
