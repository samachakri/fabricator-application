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

// 1. Calculate Frame Outer & Inner Dimensions
export function calculateFrameDimensions(design: ParametricWindowDesign): {
  width: number;
  height: number;
  perimeterMm: number;
  runningFt: number;
  areaSqFt: number;
  innerWidth: number;
  innerHeight: number;
} {
  const width = Math.max(300, design.width || 1800);
  const height = Math.max(300, design.height || 1500);
  const perimeterMm = 2 * (width + height);
  const runningFt = mmToRunningFt(perimeterMm);
  const areaSqFt = parseFloat(mm2ToSqFt(width * height).toFixed(2));
  const innerWidth = Math.max(200, width - 120);
  const innerHeight = Math.max(200, height - 120);
  return { width, height, perimeterMm, runningFt, areaSqFt, innerWidth, innerHeight };
}

// 2. Calculate Panel Dimensions based on ratio
export function calculatePanelDimensions(
  design: ParametricWindowDesign,
  panelIndex: number
): { width: number; height: number; x: number; y: number; areaSqFt: number } {
  const panel = design.panels[panelIndex];
  if (!panel) {
    return { width: 0, height: 0, x: 0, y: 0, areaSqFt: 0 };
  }
  const frameDeduction = 120;
  const innerWidth = Math.max(200, (design.width || 1800) - frameDeduction);
  const innerHeight = Math.max(200, (design.height || 1500) - frameDeduction);

  const width = Math.round(innerWidth * (panel.widthRatio || 1));
  const height = Math.round(innerHeight * (panel.heightRatio || 1));
  const x = Math.round(innerWidth * (panel.xRatio || 0));
  const y = Math.round(innerHeight * (panel.yRatio || 0));
  const areaSqFt = parseFloat(mm2ToSqFt(width * height).toFixed(2));

  return { width, height, x, y, areaSqFt };
}

// 3. Calculate Daylight Glass Dimensions inside Sash/Opening
export function calculateGlassDimensions(
  design: ParametricWindowDesign,
  panelIndex: number
): {
  glassId: string;
  width: number;
  height: number;
  areaSqFt: number;
  glassType: string;
  thickness: number;
  ratePerSqFt: number;
  totalCost: number;
} {
  const panelDims = calculatePanelDimensions(design, panelIndex);
  const panel = design.panels[panelIndex];
  if (!panel) {
    return {
      glassId: '',
      width: 0,
      height: 0,
      areaSqFt: 0,
      glassType: 'Toughened',
      thickness: 5,
      ratePerSqFt: 180,
      totalCost: 0,
    };
  }

  const isFixed = panel.panelType === 'fixed';
  const width = Math.max(50, isFixed ? panelDims.width - 20 : panelDims.width - 90);
  const height = Math.max(50, isFixed ? panelDims.height - 20 : panelDims.height - 90);
  const areaSqFt = parseFloat(mm2ToSqFt(width * height).toFixed(2));

  const cfg = design.glassConfigs[panel.glassId] || design.defaultGlass;
  const rate = cfg?.ratePerSqFt || 180;
  const totalCost = Math.round(areaSqFt * rate);

  return {
    glassId: panel.glassId,
    width,
    height,
    areaSqFt,
    glassType: cfg?.glassType || 'Toughened',
    thickness: cfg?.thickness || 5,
    ratePerSqFt: rate,
    totalCost,
  };
}

// 4. Calculate Glass Area directly
export function calculateGlassArea(widthMm: number, heightMm: number): { sqMm: number; sqFt: number } {
  const sqMm = Math.max(0, widthMm) * Math.max(0, heightMm);
  const sqFt = parseFloat(mm2ToSqFt(sqMm).toFixed(2));
  return { sqMm, sqFt };
}

// 5. Calculate Total Profile Lengths
export function calculateProfileLength(design: ParametricWindowDesign): {
  frameRunningFt: number;
  sashRunningFt: number;
  mullionRunningFt: number;
  transomRunningFt: number;
  archRunningFt: number;
  totalRunningFt: number;
} {
  const W = Math.max(300, design.width || 1800);
  const H = Math.max(300, design.height || 1500);
  const innerW = Math.max(200, W - 120);
  const innerH = Math.max(200, H - 120);

  const frameRunningFt = mmToRunningFt(2 * (W + H));

  let mullionRunningFt = 0;
  if (design.mullions && design.mullions.length > 0) {
    mullionRunningFt = mmToRunningFt(design.mullions.length * innerH);
  }

  let transomRunningFt = 0;
  if (design.transoms && design.transoms.length > 0) {
    transomRunningFt = mmToRunningFt(design.transoms.length * innerW);
  }

  let sashRunningFt = 0;
  (design.panels || []).forEach((panel) => {
    if (panel.panelType !== 'fixed') {
      const pW = innerW * (panel.widthRatio || 1);
      const pH = innerH * (panel.heightRatio || 1);
      sashRunningFt += mmToRunningFt(2 * (pW + pH));
    }
  });

  let archRunningFt = 0;
  if (design.hasArch) {
    const archH = design.archHeight || 500;
    const a = W / 2;
    const b = archH;
    const arcLengthMm = Math.PI * Math.sqrt((a * a + b * b) / 2);
    archRunningFt = mmToRunningFt(arcLengthMm + W);
  }

  const totalRunningFt = parseFloat(
    (frameRunningFt + sashRunningFt + mullionRunningFt + transomRunningFt + archRunningFt).toFixed(2)
  );

  return {
    frameRunningFt: parseFloat(frameRunningFt.toFixed(2)),
    sashRunningFt: parseFloat(sashRunningFt.toFixed(2)),
    mullionRunningFt: parseFloat(mullionRunningFt.toFixed(2)),
    transomRunningFt: parseFloat(transomRunningFt.toFixed(2)),
    archRunningFt: parseFloat(archRunningFt.toFixed(2)),
    totalRunningFt,
  };
}

// 6. Calculate Mesh Area
export function calculateMeshArea(design: ParametricWindowDesign): {
  totalMeshAreaSqFt: number;
  meshCost: number;
} {
  let totalMeshAreaSqFt = 0;
  const innerW = Math.max(200, (design.width || 1800) - 120);
  const innerH = Math.max(200, (design.height || 1500) - 120);

  (design.panels || []).forEach((panel) => {
    if (panel.meshId) {
      const pW = innerW * (panel.widthRatio || 1);
      const pH = innerH * (panel.heightRatio || 1);
      const daylightW = Math.max(50, pW - 90);
      const daylightH = Math.max(50, pH - 90);
      totalMeshAreaSqFt += mm2ToSqFt(daylightW * daylightH);
    }
  });

  const rate = design.defaultMesh?.ratePerSqFt || 60;
  const meshCost = Math.round(totalMeshAreaSqFt * rate);
  return {
    totalMeshAreaSqFt: parseFloat(totalMeshAreaSqFt.toFixed(2)),
    meshCost,
  };
}

// 7. Calculate Hardware Quantity
export function calculateHardwareQuantity(design: ParametricWindowDesign): {
  handlesCount: number;
  rollersCount: number;
  locksCount: number;
  frictionStaysCount: number;
} {
  let handlesCount = 0;
  let rollersCount = 0;
  let locksCount = 0;
  let frictionStaysCount = 0;

  (design.panels || []).forEach((panel) => {
    if (panel.panelType === 'sliding') {
      handlesCount += 1;
      rollersCount += 2; // tandem rollers
      locksCount += 1;
    } else if (panel.panelType === 'casement') {
      handlesCount += 1;
      frictionStaysCount += 2;
      locksCount += 1;
    }
  });

  return { handlesCount, rollersCount, locksCount, frictionStaysCount };
}

// 8. Calculate Complete Material Requirements
export function calculateMaterialRequirement(design: ParametricWindowDesign): {
  profileLengths: ReturnType<typeof calculateProfileLength>;
  totalGlassAreaSqFt: number;
  meshArea: ReturnType<typeof calculateMeshArea>;
  hardware: ReturnType<typeof calculateHardwareQuantity>;
} {
  const profileLengths = calculateProfileLength(design);
  const meshArea = calculateMeshArea(design);
  const hardware = calculateHardwareQuantity(design);

  let totalGlassAreaSqFt = 0;
  (design.panels || []).forEach((_, idx) => {
    const g = calculateGlassDimensions(design, idx);
    totalGlassAreaSqFt += g.areaSqFt;
  });

  if (design.hasArch) {
    const W = Math.max(300, design.width || 1800);
    const archH = design.archHeight || 500;
    const archGlassSqFt = mm2ToSqFt((Math.PI * (W / 2) * archH) / 2);
    totalGlassAreaSqFt += archGlassSqFt;
  }

  return {
    profileLengths,
    totalGlassAreaSqFt: parseFloat(totalGlassAreaSqFt.toFixed(2)),
    meshArea,
    hardware,
  };
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

  // 2. Variables for Glass, Sash, Mesh & Hardware
  let sashRunningFt = 0;
  let totalGlassAreaSqFt = 0;
  let totalGlassCost = 0;
  let totalMeshAreaSqFt = 0;
  let totalMeshCost = 0;
  let totalHardwareCost = 0;

  // Arch Head Profile & Glass (Arch + Window Combination)
  let archGlassAreaSqFt = 0;
  if (design.hasArch) {
    const archH = design.archHeight || 500;
    const a = W / 2;
    const b = archH;
    const arcLengthMm = Math.PI * Math.sqrt((a * a + b * b) / 2);
    const archRunningFt = mmToRunningFt(arcLengthMm + W);
    totalFrameCost += archRunningFt * (frameRate * 1.25);

    archGlassAreaSqFt = mm2ToSqFt((Math.PI * a * b) / 2);
    totalGlassAreaSqFt += archGlassAreaSqFt;
    totalGlassCost += archGlassAreaSqFt * (design.defaultGlass.ratePerSqFt || 180);
  }

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

  // Round values or use manual overrides
  const profileCostRounded =
    design.manualProfileCost !== undefined ? design.manualProfileCost : totalProfileCost;
  const glassCostRounded =
    design.manualGlassCost !== undefined ? design.manualGlassCost : Math.round(totalGlassCost);
  const hardwareCostRounded =
    design.manualHardwareCost !== undefined
      ? design.manualHardwareCost
      : Math.round(totalHardwareCost);
  const meshCostRounded =
    design.manualMeshCost !== undefined ? design.manualMeshCost : Math.round(totalMeshCost);
  const labourCostRounded =
    design.manualLabourCost !== undefined
      ? design.manualLabourCost
      : Math.round(design.labourCostPerWindow || 1200);

  // Custom sections added manually by user
  const customSectionsCost = (design.customSections || []).reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice),
    0
  );

  const singleWindowTotal =
    profileCostRounded +
    glassCostRounded +
    hardwareCostRounded +
    meshCostRounded +
    labourCostRounded +
    customSectionsCost;

  const totalCost = singleWindowTotal * qty;

  return {
    profileCost: profileCostRounded * qty,
    glassCost: glassCostRounded * qty,
    hardwareCost: hardwareCostRounded * qty,
    meshCost: meshCostRounded * qty,
    labourCost: labourCostRounded * qty,
    customSectionsCost: customSectionsCost * qty,
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

// =========================================================================
// WINDOORCRAFT NATIVE QUOTE & CUTTING LIST GENERATOR
// =========================================================================

export interface QuoteItemRow {
  name: string;
  category: 'profile' | 'glass' | 'hardware' | 'accessory';
  price: number;
  count: number;
  unit: string;
  amount: number;
}

export interface ProfileCutItem {
  code: string;
  name: string;
  lengthMm: number;
  cutAngle: string;
  qty: number;
  tag: string;
}

export interface GlassCutItem {
  tag: string;
  spec: string;
  widthMm: number;
  heightMm: number;
  areaSqM: number;
  qty: number;
}

export function generateWindoorQuoteData(design: ParametricWindowDesign): {
  items: QuoteItemRow[];
  profiles: ProfileCutItem[];
  glassPanes: GlassCutItem[];
  subtotal: number;
} {
  const W = Math.max(400, design.width || 1800);
  const H = Math.max(300, design.height || 1200);
  const archH = design.hasArch ? (design.archHeight || 500) : 0;
  const frameFace = 60;
  const innerW = Math.max(200, W - frameFace * 2);
  const innerH = Math.max(200, H - frameFace * 2);

  const seriesName = design.seriesName || (design.panels.some(p => p.panelType === 'sliding') ? 'S_CRAFT_PREMIUM_SLIDING_SERIES' : 'C_CRAFT_PREMIUM_CASEMENT_SERIES');
  const frameProfileName = seriesName.includes('SLIDING') ? 'RSC-42VF_OUTER FRAME-60X45' : 'SMALL CASEMENT FRAME-42X40';
  const sashProfileName = seriesName.includes('SLIDING') ? 'SLIDING SASH-84X40' : 'CASEMENT SASH-60X40';
  const beadName = 'CASEMENT BIG BEAD-35X20';

  const items: QuoteItemRow[] = [];
  const profiles: ProfileCutItem[] = [];
  const glassPanes: GlassCutItem[] = [];

  // 1. Outer Frame Cuts (Top, Bottom, Left, Right)
  profiles.push(
    { code: 'FRM-01', name: frameProfileName, lengthMm: W, cutAngle: '45°-45°', qty: 1, tag: 'Frame Top' },
    { code: 'FRM-02', name: frameProfileName, lengthMm: W, cutAngle: '45°-45°', qty: 1, tag: 'Frame Bottom' },
    { code: 'FRM-03', name: frameProfileName, lengthMm: H, cutAngle: '45°-45°', qty: 1, tag: 'Frame Left' },
    { code: 'FRM-04', name: frameProfileName, lengthMm: H, cutAngle: '45°-45°', qty: 1, tag: 'Frame Right' }
  );

  const framePerimeterM = ((2 * (W + H)) / 1000);
  items.push({
    name: frameProfileName,
    category: 'profile',
    price: 165,
    count: parseFloat(framePerimeterM.toFixed(2)),
    unit: 'm',
    amount: parseFloat((framePerimeterM * 165).toFixed(2)),
  });

  // 2. Mullions / Transoms
  (design.mullions || []).forEach((m, idx) => {
    profiles.push({
      code: `MUL-0${idx + 1}`,
      name: 'MULLION PROFILE-60X50',
      lengthMm: innerH,
      cutAngle: '90°-90°',
      qty: 1,
      tag: `Mullion #${idx + 1}`,
    });
  });

  (design.transoms || []).forEach((t, idx) => {
    profiles.push({
      code: `TRN-0${idx + 1}`,
      name: 'TRANSOM PROFILE-60X50',
      lengthMm: innerW,
      cutAngle: '90°-90°',
      qty: 1,
      tag: `Transom #${idx + 1}`,
    });
  });

  // 3. Panels, Sashes, Glass & Glazing Beads
  let totalBeadLengthM = 0;
  let totalSashLengthM = 0;

  design.panels.forEach((p, idx) => {
    const pW = Math.round(innerW * (p.widthRatio || 1));
    const pH = Math.round(innerH * (p.heightRatio || 1));
    const isFixed = p.panelType === 'fixed';
    const tag = p.name || (isFixed ? `F${idx + 1}` : `S${idx + 1}`);

    // Glass cut size
    const gW = isFixed ? pW - 20 : pW - 90;
    const gH = isFixed ? pH - 20 : pH - 90;
    const gAreaM2 = parseFloat(((gW * gH) / 1000000).toFixed(3));
    const spec = `${design.defaultGlass?.thickness || 5}mm ${design.defaultGlass?.glassType || 'Clear Non T'}`;

    glassPanes.push({
      tag,
      spec,
      widthMm: gW,
      heightMm: gH,
      areaSqM: gAreaM2,
      qty: 1,
    });

    items.push({
      name: `${spec}-${tag}`,
      category: 'glass',
      price: 742.72,
      count: gAreaM2,
      unit: 'm²',
      amount: parseFloat((gAreaM2 * 742.72).toFixed(2)),
    });

    // Glazing bead perimeter
    const beadM = ((2 * (gW + gH)) / 1000);
    totalBeadLengthM += beadM;

    // Sash Profile if sliding / casement
    if (!isFixed) {
      const sW = pW + 10;
      const sH = pH;
      const sashM = ((2 * (sW + sH)) / 1000);
      totalSashLengthM += sashM;

      profiles.push(
        { code: `SSH-${tag}-T`, name: sashProfileName, lengthMm: sW, cutAngle: '45°-45°', qty: 1, tag: `${tag} Top Rail` },
        { code: `SSH-${tag}-B`, name: sashProfileName, lengthMm: sW, cutAngle: '45°-45°', qty: 1, tag: `${tag} Bottom Rail` },
        { code: `SSH-${tag}-L`, name: sashProfileName, lengthMm: sH, cutAngle: '45°-45°', qty: 1, tag: `${tag} Left Stile` },
        { code: `SSH-${tag}-R`, name: sashProfileName, lengthMm: sH, cutAngle: '45°-45°', qty: 1, tag: `${tag} Right Stile` }
      );
    }
  });

  if (totalBeadLengthM > 0) {
    items.push({
      name: beadName,
      category: 'profile',
      price: 165,
      count: parseFloat(totalBeadLengthM.toFixed(2)),
      unit: 'm',
      amount: parseFloat((totalBeadLengthM * 165).toFixed(2)),
    });
  }

  if (totalSashLengthM > 0) {
    items.push({
      name: sashProfileName,
      category: 'profile',
      price: 95,
      count: parseFloat(totalSashLengthM.toFixed(2)),
      unit: 'm',
      amount: parseFloat((totalSashLengthM * 95).toFixed(2)),
    });
  }

  // 4. Arch Head Profile & Curved Glass (if arch present)
  if (design.hasArch && archH > 0) {
    const a = W / 2;
    const b = archH;
    const archArcM = parseFloat(((Math.PI * Math.sqrt((a * a + b * b) / 2)) / 1000).toFixed(2));
    const archGlassM2 = parseFloat((((Math.PI * a * b) / 2) / 1000000).toFixed(3));
    const archSpec = `${design.defaultGlass?.thickness || 5}mm ${design.archType === 'gothic' ? 'Gothic Arch Glass' : 'Round Arch Glass'}`;

    profiles.push({
      code: 'ARC-TOP',
      name: 'ARCHED PROFILE-BENT',
      lengthMm: Math.round(archArcM * 1000),
      cutAngle: 'Custom Radial',
      qty: 1,
      tag: 'Arch Head Curve',
    });

    glassPanes.push({
      tag: 'ARCH-F0',
      spec: archSpec,
      widthMm: W - frameFace * 2,
      heightMm: archH - frameFace,
      areaSqM: archGlassM2,
      qty: 1,
    });

    items.push({
      name: 'ARCHED PROFILE-BENT-42X40',
      category: 'profile',
      price: 280,
      count: archArcM,
      unit: 'm',
      amount: parseFloat((archArcM * 280).toFixed(2)),
    });

    items.push({
      name: `${archSpec}-ARCH-F0`,
      category: 'glass',
      price: 950,
      count: archGlassM2,
      unit: 'm²',
      amount: parseFloat((archGlassM2 * 950).toFixed(2)),
    });
  }

  // 5. Standard Accessories Matching WindoorCraft Table
  items.push(
    { name: 'Crew 3.0X19mm', category: 'hardware', price: 2, count: 16, unit: 'pcs', amount: 32 },
    { name: 'Fastener 8X80', category: 'hardware', price: 5, count: 16, unit: 'pcs', amount: 80 },
    { name: 'Fastener Hole cap', category: 'accessory', price: 1, count: 16, unit: 'pcs', amount: 16 },
    { name: 'Window packer 3mm', category: 'accessory', price: 2, count: 16, unit: 'pcs', amount: 32 },
    { name: 'Window packer 2mm', category: 'accessory', price: 2, count: 16, unit: 'pcs', amount: 32 },
    { name: 'Drainage cap', category: 'accessory', price: 10, count: 4.8, unit: 'pcs', amount: 48 }
  );

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  return {
    items,
    profiles,
    glassPanes,
    subtotal: parseFloat(subtotal.toFixed(2)),
  };
}

