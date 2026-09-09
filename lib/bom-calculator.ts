import {
  CalculatedBOM,
  GlassCut,
  HardwareItem,
  OuterFrameCut,
  ProfileBrand,
  SashCut,
  WindowDesign,
  WindowType,
} from './types';

// Standard profile face dimensions in mm
export const PROFILE_SPECS: Record<
  ProfileBrand,
  {
    frameWidth: number; // width of outer frame profile face
    sashWidth: number; // width of sash profile face
    mullionWidth: number;
    weldLoss: number; // mm burnt off per welded joint (standard 3mm * 2 = 6mm)
    steelClearance: number; // mm shorter than profile to allow corner weld
    costPerMeter: number;
    steelCostPerMeter: number;
  }
> = {
  VEKA: {
    frameWidth: 60,
    sashWidth: 68,
    mullionWidth: 78,
    weldLoss: 6,
    steelClearance: 30,
    costPerMeter: 310,
    steelCostPerMeter: 110,
  },
  REHAU: {
    frameWidth: 60,
    sashWidth: 65,
    mullionWidth: 76,
    weldLoss: 6,
    steelClearance: 30,
    costPerMeter: 295,
    steelCostPerMeter: 105,
  },
  KOMMERLING: {
    frameWidth: 70,
    sashWidth: 74,
    mullionWidth: 84,
    weldLoss: 6,
    steelClearance: 30,
    costPerMeter: 340,
    steelCostPerMeter: 120,
  },
  ALUPLAST: {
    frameWidth: 60,
    sashWidth: 65,
    mullionWidth: 74,
    weldLoss: 6,
    steelClearance: 30,
    costPerMeter: 280,
    steelCostPerMeter: 100,
  },
};

export const GLASS_RATES_PER_SQFT: Record<string, number> = {
  clear_5mm: 85,
  toughened_6mm: 150,
  dgu_5_12_5: 290,
  frosted_5mm: 115,
  tinted_reflective: 190,
};

export function calculateWindowBOM(
  window: Pick<
    WindowDesign,
    | 'id'
    | 'type'
    | 'width'
    | 'height'
    | 'profileBrand'
    | 'tracks'
    | 'sashes'
    | 'glassType'
    | 'meshType'
    | 'hardware'
  >
): CalculatedBOM {
  const brand = window.profileBrand || 'VEKA';
  const specs = PROFILE_SPECS[brand] || PROFILE_SPECS.VEKA;
  const W = Math.max(300, window.width || 1200);
  const H = Math.max(300, window.height || 1200);
  const type = window.type || 'sliding_2track';

  const outerFrameCuts: OuterFrameCut[] = [];
  const sashCuts: SashCut[] = [];
  const mullionCuts: OuterFrameCut[] = [];
  const glazingBeadCuts: OuterFrameCut[] = [];
  const reinforcementCuts: { label: string; length: number; profileCode: string; qty: number }[] = [];
  const glassPanels: GlassCut[] = [];
  const hardware: HardwareItem[] = [];

  const profileCodePrefix = `${brand.substring(0, 3)}-`;

  // 1. OUTER FRAME CUTS (4 pieces with 45°/45° cuts + welding allowance)
  // Top & Bottom Horizontal
  const frameHLength = Math.round(W + specs.weldLoss);
  outerFrameCuts.push({
    id: `${window.id}-OF-TOP`,
    label: 'Outer Frame Top',
    length: frameHLength,
    angleLeft: 45,
    angleRight: 45,
    profileCode: `${profileCodePrefix}FR-01`,
    qty: 1,
    status: 'pending',
  });
  outerFrameCuts.push({
    id: `${window.id}-OF-BOT`,
    label: 'Outer Frame Bottom (Track/Cill)',
    length: frameHLength,
    angleLeft: 45,
    angleRight: 45,
    profileCode: `${profileCodePrefix}FR-01`,
    qty: 1,
    status: 'pending',
  });

  // Left & Right Vertical
  const frameVLength = Math.round(H + specs.weldLoss);
  outerFrameCuts.push({
    id: `${window.id}-OF-LFT`,
    label: 'Outer Frame Left Jamb',
    length: frameVLength,
    angleLeft: 45,
    angleRight: 45,
    profileCode: `${profileCodePrefix}FR-01`,
    qty: 1,
    status: 'pending',
  });
  outerFrameCuts.push({
    id: `${window.id}-OF-RGT`,
    label: 'Outer Frame Right Jamb',
    length: frameVLength,
    angleLeft: 45,
    angleRight: 45,
    profileCode: `${profileCodePrefix}FR-01`,
    qty: 1,
    status: 'pending',
  });

  // Steel Reinforcement for Outer Frame
  reinforcementCuts.push({
    label: 'Frame Steel (Horizontal)',
    length: Math.round(W - specs.steelClearance * 2),
    profileCode: 'STL-U-20x25',
    qty: 2,
  });
  reinforcementCuts.push({
    label: 'Frame Steel (Vertical)',
    length: Math.round(H - specs.steelClearance * 2),
    profileCode: 'STL-U-20x25',
    qty: 2,
  });

  // 2. SASHES & GLASS CALCULATION
  const innerWidth = W - 2 * specs.frameWidth;
  const innerHeight = H - 2 * specs.frameWidth;

  if (type === 'sliding_2track') {
    // 2-Track Sliding: 2 equal sashes overlapping in center
    const sashOverlap = 35; // mm overlap in center
    const sashW = Math.round((innerWidth + sashOverlap) / 2 + specs.weldLoss);
    const sashH = Math.round(innerHeight - 8 + specs.weldLoss); // 8mm roller/track clearance

    for (let i = 1; i <= 2; i++) {
      // 2 horizontal per sash
      sashCuts.push({
        id: `${window.id}-S${i}-H`,
        sashIndex: i,
        label: `Sash ${i} Top/Bottom Rail`,
        length: sashW,
        angleLeft: 45,
        angleRight: 45,
        profileCode: `${profileCodePrefix}SA-SL`,
        qty: 2,
        status: 'pending',
      });
      // 2 vertical per sash
      sashCuts.push({
        id: `${window.id}-S${i}-V`,
        sashIndex: i,
        label: `Sash ${i} Left/Right Stile`,
        length: sashH,
        angleLeft: 45,
        angleRight: 45,
        profileCode: `${profileCodePrefix}SA-SL`,
        qty: 2,
        status: 'pending',
      });

      // Glass for sash i
      const glassW = Math.round(sashW - specs.weldLoss - 2 * specs.sashWidth - 10);
      const glassH = Math.round(sashH - specs.weldLoss - 2 * specs.sashWidth - 10);
      const areaSqFt = Number(((glassW * glassH) / 92903).toFixed(2));
      const areaSqM = Number(((glassW * glassH) / 1000000).toFixed(2));

      glassPanels.push({
        id: `${window.id}-GL-0${i}`,
        label: `Sash ${i} Glass Pane`,
        width: glassW,
        height: glassH,
        areaSqFt,
        areaSqM,
        glassType: window.glassType || 'clear_5mm',
        thickness: window.glassType === 'dgu_5_12_5' ? '22mm DGU' : '5mm',
        qty: 1,
        status: 'pending',
      });
    }

    // Hardware for 2-Track Sliding
    hardware.push({
      id: 'HD-ROL-01',
      name: 'Double Nylon Tandem Rollers (Heavy Duty)',
      code: 'ROL-NYL-TD',
      qty: 4,
      unit: 'pcs',
      unitCost: 140,
      binLocation: 'Bin H-02',
    });
    hardware.push({
      id: 'HD-LCK-01',
      name: 'Touch Pop-up Flush Handle with Key Lock',
      code: 'LCK-POP-01',
      qty: 2,
      unit: 'sets',
      unitCost: 350,
      binLocation: 'Bin L-14',
    });
    hardware.push({
      id: 'HD-INT-01',
      name: 'Aluminium Interlock Sealing Profile with Woolpile',
      code: 'INT-ALU-SL',
      qty: 2,
      unit: 'pcs',
      unitCost: 180,
      binLocation: 'Rack AL-03',
    });
    hardware.push({
      id: 'HD-WEEP-01',
      name: 'Weep Hole Drainage Caps with Flap Valve',
      code: 'CAP-WEEP-01',
      qty: 4,
      unit: 'pcs',
      unitCost: 15,
      binLocation: 'Bin P-08',
    });
  } else if (type === 'sliding_3track') {
    // 3-Track Sliding: 3 panels (or 2 sash + 1 mesh)
    const sashOverlap = 50;
    const sashW = Math.round((innerWidth + sashOverlap * 2) / 3 + specs.weldLoss);
    const sashH = Math.round(innerHeight - 8 + specs.weldLoss);

    const activeSashes = window.meshType !== 'none' ? 2 : 3;

    for (let i = 1; i <= activeSashes; i++) {
      sashCuts.push({
        id: `${window.id}-S${i}-H`,
        sashIndex: i,
        label: `Sash ${i} Rails`,
        length: sashW,
        angleLeft: 45,
        angleRight: 45,
        profileCode: `${profileCodePrefix}SA-SL`,
        qty: 2,
        status: 'pending',
      });
      sashCuts.push({
        id: `${window.id}-S${i}-V`,
        sashIndex: i,
        label: `Sash ${i} Stiles`,
        length: sashH,
        angleLeft: 45,
        angleRight: 45,
        profileCode: `${profileCodePrefix}SA-SL`,
        qty: 2,
        status: 'pending',
      });

      const glassW = Math.round(sashW - specs.weldLoss - 2 * specs.sashWidth - 10);
      const glassH = Math.round(sashH - specs.weldLoss - 2 * specs.sashWidth - 10);
      glassPanels.push({
        id: `${window.id}-GL-0${i}`,
        label: `Glass Pane ${i}`,
        width: glassW,
        height: glassH,
        areaSqFt: Number(((glassW * glassH) / 92903).toFixed(2)),
        areaSqM: Number(((glassW * glassH) / 1000000).toFixed(2)),
        glassType: window.glassType || 'clear_5mm',
        thickness: window.glassType === 'dgu_5_12_5' ? '22mm DGU' : '5mm',
        qty: 1,
        status: 'pending',
      });
    }

    if (window.meshType !== 'none') {
      sashCuts.push({
        id: `${window.id}-SMESH-H`,
        sashIndex: 3,
        label: 'Mesh Sash Rails',
        length: sashW,
        angleLeft: 45,
        angleRight: 45,
        profileCode: `${profileCodePrefix}SA-MSH`,
        qty: 2,
        status: 'pending',
      });
      sashCuts.push({
        id: `${window.id}-SMESH-V`,
        sashIndex: 3,
        label: 'Mesh Sash Stiles',
        length: sashH,
        angleLeft: 45,
        angleRight: 45,
        profileCode: `${profileCodePrefix}SA-MSH`,
        qty: 2,
        status: 'pending',
      });
      hardware.push({
        id: 'HD-MSH-01',
        name: 'SS-304 High-Tensile Mosquito Mesh Screen',
        code: 'MSH-SS304',
        qty: 1,
        unit: 'sq.m',
        unitCost: 450,
        binLocation: 'Roll Bay M-1',
      });
    }

    hardware.push({
      id: 'HD-ROL-02',
      name: 'Triple Track Heavy-Duty Brass Rollers',
      code: 'ROL-BRS-3T',
      qty: 6,
      unit: 'pcs',
      unitCost: 165,
      binLocation: 'Bin H-03',
    });
    hardware.push({
      id: 'HD-LCK-02',
      name: 'Multi-Point Locking Transmission Bar & Handle',
      code: 'LCK-ESPG-SL',
      qty: 2,
      unit: 'sets',
      unitCost: 480,
      binLocation: 'Bin L-15',
    });
  } else if (type === 'casement_single') {
    // Casement Single Sash (Outward / Inward opening)
    const rebateClearance = 8; // mm all around
    const sashW = Math.round(innerWidth - rebateClearance + specs.weldLoss);
    const sashH = Math.round(innerHeight - rebateClearance + specs.weldLoss);

    sashCuts.push({
      id: `${window.id}-CS-H`,
      sashIndex: 1,
      label: 'Casement Sash Rails',
      length: sashW,
      angleLeft: 45,
      angleRight: 45,
      profileCode: `${profileCodePrefix}SA-CS`,
      qty: 2,
      status: 'pending',
    });
    sashCuts.push({
      id: `${window.id}-CS-V`,
      sashIndex: 1,
      label: 'Casement Sash Stiles',
      length: sashH,
      angleLeft: 45,
      angleRight: 45,
      profileCode: `${profileCodePrefix}SA-CS`,
      qty: 2,
      status: 'pending',
    });

    const glassW = Math.round(sashW - specs.weldLoss - 2 * specs.sashWidth - 10);
    const glassH = Math.round(sashH - specs.weldLoss - 2 * specs.sashWidth - 10);
    glassPanels.push({
      id: `${window.id}-GL-01`,
      label: 'Casement Glass Pane',
      width: glassW,
      height: glassH,
      areaSqFt: Number(((glassW * glassH) / 92903).toFixed(2)),
      areaSqM: Number(((glassW * glassH) / 1000000).toFixed(2)),
      glassType: window.glassType || 'clear_5mm',
      thickness: window.glassType === 'dgu_5_12_5' ? '24mm DGU' : '6mm Toughened',
      qty: 1,
      status: 'pending',
    });

    hardware.push({
      id: 'HD-HNG-01',
      name: '304 Stainless Steel Friction Stay Hinges (14-inch)',
      code: 'HNG-FS-14',
      qty: 2,
      unit: 'pcs (pair)',
      unitCost: 320,
      binLocation: 'Bin F-04',
    });
    hardware.push({
      id: 'HD-CSH-01',
      name: 'Casement Espagnolette Multi-point Transmission Rod',
      code: 'ESPAG-800',
      qty: 1,
      unit: 'pcs',
      unitCost: 380,
      binLocation: 'Rack E-01',
    });
    hardware.push({
      id: 'HD-HND-01',
      name: 'Architectural Die-Cast Casement Handle',
      code: 'HND-ARC-01',
      qty: 1,
      unit: 'pcs',
      unitCost: 240,
      binLocation: 'Bin H-11',
    });
  } else if (type === 'casement_double') {
    // Casement Double (French Window / Master & Slave sashes)
    const sashW = Math.round((innerWidth - 12) / 2 + specs.weldLoss);
    const sashH = Math.round(innerHeight - 8 + specs.weldLoss);

    for (let i = 1; i <= 2; i++) {
      sashCuts.push({
        id: `${window.id}-CS${i}-H`,
        sashIndex: i,
        label: `Sash ${i} Rails`,
        length: sashW,
        angleLeft: 45,
        angleRight: 45,
        profileCode: `${profileCodePrefix}SA-CS`,
        qty: 2,
        status: 'pending',
      });
      sashCuts.push({
        id: `${window.id}-CS${i}-V`,
        sashIndex: i,
        label: `Sash ${i} Stiles`,
        length: sashH,
        angleLeft: 45,
        angleRight: 45,
        profileCode: `${profileCodePrefix}SA-CS`,
        qty: 2,
        status: 'pending',
      });

      const glassW = Math.round(sashW - specs.weldLoss - 2 * specs.sashWidth - 10);
      const glassH = Math.round(sashH - specs.weldLoss - 2 * specs.sashWidth - 10);
      glassPanels.push({
        id: `${window.id}-GL-0${i}`,
        label: `French Sash ${i} Pane`,
        width: glassW,
        height: glassH,
        areaSqFt: Number(((glassW * glassH) / 92903).toFixed(2)),
        areaSqM: Number(((glassW * glassH) / 1000000).toFixed(2)),
        glassType: window.glassType || 'clear_5mm',
        thickness: window.glassType === 'dgu_5_12_5' ? '24mm DGU' : '6mm Toughened',
        qty: 1,
        status: 'pending',
      });
    }

    hardware.push({
      id: 'HD-HNG-02',
      name: 'Friction Stays 16-inch Heavy Gauge',
      code: 'HNG-FS-16',
      qty: 4,
      unit: 'pcs',
      unitCost: 350,
      binLocation: 'Bin F-05',
    });
    hardware.push({
      id: 'HD-SLV-01',
      name: 'Slave Sash Concealed Shoot Bolt Mechanism',
      code: 'BLT-SHT-CN',
      qty: 2,
      unit: 'sets',
      unitCost: 280,
      binLocation: 'Bin B-02',
    });
    hardware.push({
      id: 'HD-HND-02',
      name: 'Key-Locking Casement Handle',
      code: 'HND-KEY-CS',
      qty: 1,
      unit: 'pcs',
      unitCost: 290,
      binLocation: 'Bin H-12',
    });
  } else {
    // Fixed Window / Direct Glazing
    const glassW = Math.round(innerWidth - 10);
    const glassH = Math.round(innerHeight - 10);
    glassPanels.push({
      id: `${window.id}-GL-FX`,
      label: 'Fixed Panoramic Glass',
      width: glassW,
      height: glassH,
      areaSqFt: Number(((glassW * glassH) / 92903).toFixed(2)),
      areaSqM: Number(((glassW * glassH) / 1000000).toFixed(2)),
      glassType: window.glassType || 'clear_5mm',
      thickness: window.glassType === 'dgu_5_12_5' ? '24mm DGU' : '6mm Toughened',
      qty: 1,
      status: 'pending',
    });

    hardware.push({
      id: 'HD-GLZ-01',
      name: 'Glazing Bridge Support Blocks & Shims',
      code: 'GLZ-BRG-01',
      qty: 8,
      unit: 'pcs',
      unitCost: 15,
      binLocation: 'Bin G-09',
    });
  }

  // 3. GLAZING BEADS (4 pieces per glass panel with 45° cuts)
  glassPanels.forEach((glass, idx) => {
    glazingBeadCuts.push({
      id: `${window.id}-GB-${idx + 1}-H`,
      label: `Glazing Bead H Pane ${idx + 1}`,
      length: glass.width + 12,
      angleLeft: 45,
      angleRight: 45,
      profileCode: `${profileCodePrefix}GB-01`,
      qty: 2,
      status: 'pending',
    });
    glazingBeadCuts.push({
      id: `${window.id}-GB-${idx + 1}-V`,
      label: `Glazing Bead V Pane ${idx + 1}`,
      length: glass.height + 12,
      angleLeft: 45,
      angleRight: 45,
      profileCode: `${profileCodePrefix}GB-01`,
      qty: 2,
      status: 'pending',
    });
  });

  // 4. METERS & QUANTITY TOTALS
  let totalProfileMeters = 0;
  outerFrameCuts.forEach((c) => (totalProfileMeters += (c.length * c.qty) / 1000));
  sashCuts.forEach((c) => (totalProfileMeters += (c.length * c.qty) / 1000));
  mullionCuts.forEach((c) => (totalProfileMeters += (c.length * c.qty) / 1000));
  glazingBeadCuts.forEach((c) => (totalProfileMeters += (c.length * c.qty) / 1000));
  totalProfileMeters = Number(totalProfileMeters.toFixed(2));

  let totalSteelMeters = 0;
  reinforcementCuts.forEach((r) => (totalSteelMeters += (r.length * r.qty) / 1000));
  totalSteelMeters = Number(totalSteelMeters.toFixed(2));

  let totalGlassSqFt = 0;
  glassPanels.forEach((g) => (totalGlassSqFt += g.areaSqFt * g.qty));
  totalGlassSqFt = Number(totalGlassSqFt.toFixed(2));

  const perimeterMeters = ((W + H) * 2) / 1000;
  const gasketMeters = Number((perimeterMeters * 2.5).toFixed(1));
  const woolpileMeters = Number((perimeterMeters * 3).toFixed(1));

  // 5. ESTIMATED MATERIAL COST
  const profileCost = totalProfileMeters * specs.costPerMeter;
  const steelCost = totalSteelMeters * specs.steelCostPerMeter;
  const glassRate = GLASS_RATES_PER_SQFT[window.glassType || 'clear_5mm'] || 85;
  const glassCost = totalGlassSqFt * glassRate;
  const hardwareCost = hardware.reduce((acc, h) => acc + h.qty * h.unitCost, 0);
  const gasketCost = gasketMeters * 28 + woolpileMeters * 18;

  const estimatedMaterialCost = Math.round(
    profileCost + steelCost + glassCost + hardwareCost + gasketCost
  );

  return {
    outerFrameCuts,
    sashCuts,
    mullionCuts,
    glazingBeadCuts,
    reinforcementCuts,
    glassPanels,
    gasketMeters,
    woolpileMeters,
    hardware,
    totalProfileMeters,
    totalGlassSqFt,
    totalSteelMeters,
    estimatedMaterialCost,
    inventoryStatus: 'IN_STOCK',
  };
}
