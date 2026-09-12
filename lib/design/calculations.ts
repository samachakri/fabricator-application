import {
  ParametricWindowDesign,
  WindowPriceEstimate,
  DesignComponentSummary,
} from './types';

// Convert mm2 to sq.ft (1 sq.m = 1,000,000 mm2 = 10.7639 sq.ft -> 1 sq.ft = 92903.04 mm2)
export function mm2ToSqFt(sqMm: number): number {
  return sqMm / 92903.04;
}

// Convert mm to running feet (1 ft = 304.8 mm)
export function mmToRunningFt(mm: number): number {
  return mm / 304.8;
}

// Convert inches to mm
export function inchToMm(inch: number): number {
  return Math.round(inch * 25.4);
}

// Convert mm to inches
export function mmToInch(mm: number): number {
  return parseFloat((mm / 25.4).toFixed(2));
}

// Calculate the dimensions of each panel based on overall width, height, and frame deductions
export function calculatePanelDimensions(
  design: ParametricWindowDesign,
  panelIndex: number
): { width: number; height: number; x: number; y: number; areaSqFt: number } {
  const panel = design.panels[panelIndex];
  if (!panel) {
    return { width: 0, height: 0, x: 0, y: 0, areaSqFt: 0 };
  }

  // Frame profile width deduction (typically 60mm per side = 120mm total)
  const frameDeduction = 120;
  const innerWidth = Math.max(200, design.width - frameDeduction);
  const innerHeight = Math.max(200, design.height - frameDeduction);

  const width = Math.round(innerWidth * panel.widthRatio);
  const height = Math.round(innerHeight * (panel.heightRatio || 1));
  const x = Math.round(innerWidth * panel.xRatio);
  const y = Math.round(innerHeight * (panel.yRatio || 0));

  const areaSqFt = parseFloat(mm2ToSqFt(width * height).toFixed(2));

  return { width, height, x, y, areaSqFt };
}

// Main Calculation Engine for Real-Time Pricing
export function calculateWindowPrice(
  design: ParametricWindowDesign
): WindowPriceEstimate {
  const W = Math.max(300, design.width || 1800);
  const H = Math.max(300, design.height || 1200);
  const qty = Math.max(1, design.quantity || 1);

  const totalAreaSqFt = parseFloat(mm2ToSqFt(W * H).toFixed(2));

  // 1. Outer Frame Profile Length (perimeter)
  // Perimeter in mm = 2 * (W + H)
  const framePerimeterMm = 2 * (W + H);
  const frameRunningFt = mmToRunningFt(framePerimeterMm);
  const frameRate = design.frameRatePerFt || 250;
  let totalFrameCost = frameRunningFt * frameRate;

  // Mullions profile length (vertical division profiles)
  let mullionsRunningFt = 0;
  if (design.mullions && design.mullions.length > 0) {
    mullionsRunningFt = mmToRunningFt(design.mullions.length * (H - 120));
    totalFrameCost += mullionsRunningFt * frameRate;
  }

  // Transoms profile length (horizontal division profiles)
  let transomsRunningFt = 0;
  if (design.transoms && design.transoms.length > 0) {
    transomsRunningFt = mmToRunningFt(design.transoms.length * (W - 120));
    totalFrameCost += transomsRunningFt * frameRate;
  }

  // 2. Sash Profile Length (for movable panels)
  let sashRunningFt = 0;
  let totalGlassAreaSqFt = 0;
  let totalGlassCost = 0;
  let totalMeshAreaSqFt = 0;
  let totalMeshCost = 0;
  let totalHardwareCost = 0;

  const innerW = Math.max(200, W - 120);
  const innerH = Math.max(200, H - 120);

  design.panels.forEach((panel) => {
    const pW = innerW * panel.widthRatio;
    const pH = innerH * (panel.heightRatio || 1);

    // Glass calculation
    const glassConfig = design.glassConfigs[panel.glassId] || design.defaultGlass;
    // Sash deduction for daylight glass: 45mm each side
    const daylightW = panel.panelType === 'fixed' ? pW - 20 : pW - 90;
    const daylightH = panel.panelType === 'fixed' ? pH - 20 : pH - 90;
    const glassAreaSqFt = mm2ToSqFt(Math.max(50, daylightW) * Math.max(50, daylightH));

    totalGlassAreaSqFt += glassAreaSqFt;
    totalGlassCost += glassAreaSqFt * (glassConfig.ratePerSqFt || 180);

    // Sash profile perimeter if panel is sliding or casement
    if (panel.panelType !== 'fixed') {
      const sashPerimeterMm = 2 * (pW + pH);
      sashRunningFt += mmToRunningFt(sashPerimeterMm);

      const sashConfig = design.sashConfigs[panel.sashId || ''] || null;
      if (sashConfig) {
        if (sashConfig.hasMesh) {
          totalMeshAreaSqFt += glassAreaSqFt;
          totalMeshCost += glassAreaSqFt * (sashConfig.meshRatePerSqFt || design.defaultMesh.ratePerSqFt || 60);
        }
        totalHardwareCost += sashConfig.hardwareRate || design.defaultHardware.rate || 450;
      } else {
        totalHardwareCost += design.defaultHardware.rate || 450;
      }
    }
  });

  const sashRate = design.sashRatePerFt || 220;
  const totalSashCost = sashRunningFt * sashRate;
  const totalProfileCost = Math.round(totalFrameCost + totalSashCost);
  const totalProfileLengthFt = parseFloat((frameRunningFt + mullionsRunningFt + transomsRunningFt + sashRunningFt).toFixed(2));

  // Round values
  const profileCostRounded = totalProfileCost;
  const glassCostRounded = Math.round(totalGlassCost);
  const hardwareCostRounded = Math.round(totalHardwareCost);
  const meshCostRounded = Math.round(totalMeshCost);
  const labourCostRounded = Math.round(design.labourCostPerWindow || 1200);

  const singleWindowTotal =
    profileCostRounded +
    glassCostRounded +
    hardwareCostRounded +
    meshCostRounded +
    labourCostRounded;

  const totalCost = singleWindowTotal * qty;

  return {
    profileCost: profileCostRounded * qty,
    glassCost: glassCostRounded * qty,
    hardwareCost: hardwareCostRounded * qty,
    meshCost: meshCostRounded * qty,
    labourCost: labourCostRounded * qty,
    totalCost,
    totalAreaSqFt: parseFloat((totalAreaSqFt * qty).toFixed(2)),
    totalGlassAreaSqFt: parseFloat((totalGlassAreaSqFt * qty).toFixed(2)),
    totalProfileLengthFt: parseFloat((totalProfileLengthFt * qty).toFixed(2)),
    totalMeshAreaSqFt: parseFloat((totalMeshAreaSqFt * qty).toFixed(2)),
  };
}

// Generate the 5-item structured component list matching the Stitch reference
export function getComponentSummaryList(
  design: ParametricWindowDesign,
  estimate: WindowPriceEstimate
): DesignComponentSummary[] {
  const defaultGlass = design.defaultGlass;
  const meshItem = design.defaultMesh;
  const hwItem = design.defaultHardware;

  return [
    {
      id: 'frame-overall',
      type: 'frame',
      name: 'Frame',
      subtitle: `${design.profileBrand} Frame Profile`,
      rateDescription: `₹ ${design.frameRatePerFt} / running ft`,
      cost: estimate.profileCost,
    },
    {
      id: 'sash-overall',
      type: 'sash',
      name: 'Sash',
      subtitle: `${design.profileBrand} Sliding Sash`,
      rateDescription: `₹ ${design.sashRatePerFt} / running ft`,
      cost: estimate.hardwareCost,
    },
    {
      id: 'glass-overall',
      type: 'glass',
      name: 'Glass',
      subtitle: `${defaultGlass.thickness}mm ${defaultGlass.glassType}`,
      rateDescription: `₹ ${defaultGlass.ratePerSqFt} / sq.ft`,
      cost: estimate.glassCost,
    },
    {
      id: 'mesh-overall',
      type: 'mesh',
      name: 'Mesh',
      subtitle: `${meshItem.type} Mesh`,
      rateDescription: `₹ ${meshItem.ratePerSqFt} / sq.ft`,
      cost: estimate.meshCost,
    },
    {
      id: 'hardware-overall',
      type: 'hardware',
      name: 'Hardware',
      subtitle: `${hwItem.type}`,
      rateDescription: `₹ ${hwItem.rate} / set`,
      cost: estimate.hardwareCost,
    },
  ];
}
