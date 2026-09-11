'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { calculateWindowBOM } from './bom-calculator';
import {
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY,
  INITIAL_PROJECTS,
} from './seed-data';
import {
  Customer,
  InventoryItem,
  PaymentRecord,
  Project,
  QuotationData,
  WindowDesign,
} from './types';

interface StoreContextType {
  projects: Project[];
  customers: Customer[];
  inventory: InventoryItem[];
  getProject: (id: string) => Project | undefined;
  getWindow: (projectId: string, windowId: string) => WindowDesign | undefined;
  createCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  createProject: (data: {
    name: string;
    customerId?: string;
    newCustomer?: Omit<Customer, 'id'>;
    siteAddress: string;
    projectType: 'Residential' | 'Commercial' | 'Villa' | 'Builder / Apartment';
    withInitialWindow?: boolean;
    location?: string;
  }) => Project;
  addWindow: (
    projectId: string,
    windowData: Partial<WindowDesign>
  ) => WindowDesign | null;
  updateWindow: (
    projectId: string,
    windowId: string,
    updates: Partial<WindowDesign>
  ) => void;
  duplicateWindow: (projectId: string, windowId: string) => WindowDesign | null;
  deleteWindow: (projectId: string, windowId: string) => void;
  generateQuotation: (
    projectId: string,
    options?: { discountPercent?: number; notes?: string }
  ) => QuotationData | null;
  createQuotationRevision: (
    projectId: string,
    notes: string,
    newGrandTotal?: number
  ) => void;
  approveQuotation: (projectId: string) => void;
  recordPayment: (
    projectId: string,
    payment: Omit<PaymentRecord, 'id' | 'projectId' | 'receiptNumber'>
  ) => PaymentRecord | null;
  startProduction: (projectId: string, workerName?: string) => boolean;
  updateCuttingStatus: (
    projectId: string,
    cutId: string,
    isCut: boolean
  ) => void;
  updateProductionProgress: (
    projectId: string,
    stage: 'Cutting' | 'Assembly' | 'QC' | 'Completed',
    progress: number
  ) => void;
  updateQCStatus: (
    projectId: string,
    passed: boolean,
    checklist: any,
    notes: string
  ) => void;
  completeProject: (projectId: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => InventoryItem;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  adjustStock: (id: string, deltaQty: number, reason?: string) => void;
  deleteInventoryItem: (id: string) => void;
  brands: string[];
  addBrand: (brandName: string) => void;
  updateBrand: (oldBrandName: string, newBrandName: string) => void;
  deleteBrand: (brandName: string) => void;
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY_PROJECTS = 'fabricator_pro_projects_v2';
const STORAGE_KEY_CUSTOMERS = 'fabricator_pro_customers_v2';
const STORAGE_KEY_INVENTORY = 'fabricator_pro_inventory_v2';
const STORAGE_KEY_BRANDS = 'fabricator_pro_brands_v1';

const DEFAULT_BRANDS = [
  'VEKA Systems India',
  'Tata Steel Tubes Division',
  'Kommerling Profiline',
  'Rehau Acoustic Glazing',
  'Prominance Hardware',
  'Aluplast Profile Systems',
  'Saint-Gobain Glass India',
  'SecuSeal German Standard',
  'Generic / OEM',
];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
      const savedCustomers = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
      const savedInventory = localStorage.getItem(STORAGE_KEY_INVENTORY);
      const savedBrands = localStorage.getItem(STORAGE_KEY_BRANDS);

      if (savedProjects) setProjects(JSON.parse(savedProjects));
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
      if (savedInventory) setInventory(JSON.parse(savedInventory));
      if (savedBrands) {
        setBrands(JSON.parse(savedBrands));
      } else {
        const brandSet = new Set<string>(DEFAULT_BRANDS);
        INITIAL_INVENTORY.forEach((i) => {
          if (i.brandName) brandSet.add(i.brandName);
        });
        setBrands(Array.from(brandSet));
      }
    } catch (e) {
      console.warn('Failed to load store from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
      localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
      localStorage.setItem(STORAGE_KEY_BRANDS, JSON.stringify(brands));
    } catch (e) {
      console.warn('Failed to save store to localStorage', e);
    }
  }, [projects, customers, inventory, brands, isLoaded]);

  const getProject = (id: string) => projects.find((p) => p.id === id);

  const getWindow = (projectId: string, windowId: string) => {
    const proj = getProject(projectId);
    return proj?.windows.find((w) => w.id === windowId);
  };

  const createCustomer = (data: Omit<Customer, 'id'>): Customer => {
    const newCust: Customer = {
      ...data,
      id: `CUST-${String(customers.length + 1).padStart(2, '0')}`,
    };
    setCustomers((prev) => [...prev, newCust]);
    return newCust;
  };

  const createProject = (data: {
    name: string;
    customerId?: string;
    newCustomer?: Omit<Customer, 'id'>;
    siteAddress: string;
    projectType: 'Residential' | 'Commercial' | 'Villa' | 'Builder / Apartment';
    withInitialWindow?: boolean;
    location?: string;
  }): Project => {
    let customer: Customer;
    if (data.customerId) {
      customer = customers.find((c) => c.id === data.customerId) || customers[0];
    } else if (data.newCustomer) {
      customer = createCustomer(data.newCustomer);
    } else {
      customer = customers[0];
    }

    const nextIdNum = 1043 + projects.length;
    const projId = `PRJ-${nextIdNum}`;

    const initialWindows: WindowDesign[] = [];
    let initialValue = 0;

    if (data.withInitialWindow) {
      const w01: WindowDesign = {
        id: 'W01',
        projectId: projId,
        name: 'Window 01 (2 Track Sliding)',
        type: 'sliding_2track',
        profileBrand: 'VEKA',
        profileSeries: 'VEKA 84BS',
        width: 1500,
        height: 1200,
        tracks: 2,
        sashes: 2,
        mullions: 0,
        transoms: 0,
        openingDirection: 'sliding_left',
        glassType: 'clear_5mm',
        meshType: 'none',
        profileColor: 'pure_white',
        hardware: {
          handleType: 'popup_flush',
          lockingPoints: 2,
          rollers: 'nylon_tandem',
        },
        quantity: 1,
        unitPrice: 14500,
        status: 'DESIGNED',
        calculatedBOM: {} as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      w01.calculatedBOM = calculateWindowBOM(w01);
      w01.unitPrice = Math.round(w01.calculatedBOM.estimatedMaterialCost * 1.5);
      initialWindows.push(w01);
      initialValue = w01.unitPrice;
    }

    const newProject: Project = {
      id: projId,
      name: data.name,
      customerId: customer.id,
      customer,
      siteAddress: data.siteAddress,
      location: data.location || customer.address || 'Hyderabad',
      projectType: data.projectType,
      currentStage: 'design',
      status: 'Designing',
      dealStage: data.withInitialWindow ? 'Design & CAD' : 'New Inquiry',
      dealOwner: { name: 'Chakri S.', avatar: 'CS', color: 'bg-[#0A2E8A]' },
      lastActivity: {
        type: data.withInitialWindow ? 'cad' : 'clock',
        text: data.withInitialWindow ? 'CAD drafting ongoing' : 'Inquired just now',
      },
      specSummary: data.withInitialWindow
        ? '1 Window (VEKA 84BS)'
        : 'Pending Window Measurements',
      estimatedValue: initialValue,
      windows: initialWindows,
      quotation: null,
      payments: [],
      productionOrder: null,
      designLocked: false,
      nextAction: data.withInitialWindow ? 'Complete Measurements' : 'Send Quotation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const addWindow = (
    projectId: string,
    windowData: Partial<WindowDesign>
  ): WindowDesign | null => {
    const project = getProject(projectId);
    if (!project) return null;

    const count = project.windows.length + 1;
    const windowId = `W${String(count).padStart(2, '0')}`;

    const defaults: WindowDesign = {
      id: windowId,
      projectId,
      name: windowData.name || (windowData.type === 'casement_single' ? 'Casement Window' : '2 Track Sliding'),
      type: windowData.type || 'sliding_2track',
      profileBrand: windowData.profileBrand || 'VEKA',
      profileSeries: `${windowData.profileBrand || 'VEKA'} 84BS`,
      width: windowData.width || 1200,
      height: windowData.height || 1500,
      tracks: windowData.tracks || 2,
      sashes: windowData.sashes || 2,
      mullions: 0,
      transoms: 0,
      openingDirection: windowData.openingDirection || 'sliding_left',
      glassType: windowData.glassType || 'clear_5mm',
      meshType: windowData.meshType || 'none',
      profileColor: windowData.profileColor || 'pure_white',
      hardware: windowData.hardware || {
        handleType: 'popup_flush',
        lockingPoints: 2,
        rollers: 'nylon_tandem',
      },
      quantity: 1,
      unitPrice: 15000,
      status: 'DESIGNED',
      calculatedBOM: {} as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...windowData,
    };

    defaults.calculatedBOM = calculateWindowBOM(defaults);
    defaults.unitPrice = Math.round(defaults.calculatedBOM.estimatedMaterialCost * 1.5);

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newWindows = [...p.windows, defaults];
        const newTotal = newWindows.reduce((sum, w) => sum + w.unitPrice * w.quantity, 0);
        return {
          ...p,
          windows: newWindows,
          estimatedValue: newTotal,
          currentStage: 'design',
          status: 'Designing',
          nextAction: 'Review Design / Quotation',
          updatedAt: new Date().toISOString(),
        };
      })
    );

    return defaults;
  };

  const updateWindow = (
    projectId: string,
    windowId: string,
    updates: Partial<WindowDesign>
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedWindows = p.windows.map((w) => {
          if (w.id !== windowId) return w;
          const merged = { ...w, ...updates, updatedAt: new Date().toISOString() };
          merged.calculatedBOM = calculateWindowBOM(merged);
          merged.unitPrice = Math.round(merged.calculatedBOM.estimatedMaterialCost * 1.5);
          return merged;
        });

        const newEstimatedValue = updatedWindows.reduce(
          (sum, w) => sum + w.unitPrice * w.quantity,
          0
        );

        return {
          ...p,
          windows: updatedWindows,
          estimatedValue: newEstimatedValue,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const duplicateWindow = (projectId: string, windowId: string) => {
    const project = getProject(projectId);
    if (!project) return null;
    const target = project.windows.find((w) => w.id === windowId);
    if (!target) return null;

    const count = project.windows.length + 1;
    const newId = `W${String(count).padStart(2, '0')}`;

    const cloned: WindowDesign = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newWindows = [...p.windows, cloned];
        const newTotal = newWindows.reduce((sum, w) => sum + w.unitPrice * w.quantity, 0);
        return {
          ...p,
          windows: newWindows,
          estimatedValue: newTotal,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    return cloned;
  };

  const deleteWindow = (projectId: string, windowId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const filtered = p.windows.filter((w) => w.id !== windowId);
        const newTotal = filtered.reduce((sum, w) => sum + w.unitPrice * w.quantity, 0);
        return {
          ...p,
          windows: filtered,
          estimatedValue: newTotal,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const generateQuotation = (
    projectId: string,
    options?: { discountPercent?: number; notes?: string }
  ): QuotationData | null => {
    const project = getProject(projectId);
    if (!project || project.windows.length === 0) return null;

    let profileCost = 0;
    let glassCost = 0;
    let steelCost = 0;
    let hardwareCost = 0;

    project.windows.forEach((w) => {
      const bom = w.calculatedBOM;
      if (bom) {
        profileCost += (bom.totalProfileMeters * 310) * w.quantity;
        glassCost += (bom.totalGlassSqFt * 120) * w.quantity;
        steelCost += (bom.totalSteelMeters * 110) * w.quantity;
        hardwareCost +=
          bom.hardware.reduce((sum, h) => sum + h.qty * h.unitCost, 0) *
          w.quantity;
      }
    });

    const fabricationLaborCost = Math.round(
      project.windows.reduce(
        (sum, w) => sum + ((w.width * w.height) / 92903) * 75 * w.quantity,
        0
      )
    );
    const installationCost = 12000 + project.windows.length * 800;
    const transportationCost = 5000;

    const subtotal = Math.round(
      profileCost +
        glassCost +
        steelCost +
        hardwareCost +
        fabricationLaborCost +
        installationCost +
        transportationCost
    );

    const discountPercent = options?.discountPercent ?? 5;
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const taxableAmount = subtotal - discountAmount;
    const gstPercent = 18;
    const gstAmount = Math.round((taxableAmount * gstPercent) / 100);
    const grandTotal = taxableAmount + gstAmount;
    const advancePercentage = 50;
    const advanceRequired = Math.round((grandTotal * advancePercentage) / 100);

    const newQuotation: QuotationData = {
      id: `QT-${1023 + Math.floor(Math.random() * 800)}`,
      projectId,
      version: 1,
      revisions: [
        {
          version: 1,
          date: new Date().toISOString().split('T')[0],
          grandTotal,
          notes: options?.notes || `Quotation generated for ${project.windows.length} windows`,
          createdBy: 'Chakri (FabricatorPro)',
        },
      ],
      status: 'Sent',
      profileCost: Math.round(profileCost),
      glassCost: Math.round(glassCost),
      steelCost: Math.round(steelCost),
      hardwareCost: Math.round(hardwareCost),
      fabricationLaborCost,
      installationCost,
      transportationCost,
      subtotal,
      discountPercent,
      discountAmount,
      gstPercent,
      gstAmount,
      grandTotal,
      advancePercentage,
      advanceRequired,
      notes:
        options?.notes ||
        'Profiles conform to EN 12608 Class A standard with multi-point locking. Saint-Gobain toughened/clear glass.',
      terms: [
        '50% advance along with order confirmation to release for profile cutting.',
        '40% upon completion of fabrication before dispatch from facility.',
        '10% upon installation and sign-off by site supervisor.',
        'Profile warranty: 10 Years against discoloration / warping. Hardware warranty: 2 Years.',
      ],
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          quotation: newQuotation,
          currentStage: 'quotation',
          status: 'Quotation Sent',
          estimatedValue: grandTotal,
          nextAction: 'Customer Approval',
          updatedAt: new Date().toISOString(),
        };
      })
    );

    return newQuotation;
  };

  const createQuotationRevision = (
    projectId: string,
    notes: string,
    newGrandTotal?: number
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId || !p.quotation) return p;
        const currentQ = p.quotation;
        const newVersion = currentQ.version + 1;
        const updatedTotal = newGrandTotal || currentQ.grandTotal;

        const newRevision = {
          version: newVersion,
          date: new Date().toISOString().split('T')[0],
          grandTotal: updatedTotal,
          notes,
          createdBy: 'Chakri (FabricatorPro)',
        };

        const updatedQuotation: QuotationData = {
          ...currentQ,
          version: newVersion,
          grandTotal: updatedTotal,
          advanceRequired: Math.round((updatedTotal * currentQ.advancePercentage) / 100),
          revisions: [...currentQ.revisions, newRevision],
          status: 'Revised',
        };

        return {
          ...p,
          quotation: updatedQuotation,
          estimatedValue: updatedTotal,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const approveQuotation = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId || !p.quotation) return p;
        return {
          ...p,
          quotation: {
            ...p.quotation,
            status: 'Approved',
          },
          designLocked: true,
          currentStage: 'payment',
          status: 'Quotation Sent',
          nextAction: 'Record Advance Payment',
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const recordPayment = (
    projectId: string,
    payment: Omit<PaymentRecord, 'id' | 'projectId' | 'receiptNumber'>
  ): PaymentRecord | null => {
    const project = getProject(projectId);
    if (!project) return null;

    const receiptNumber = `REC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: PaymentRecord = {
      ...payment,
      id: `PAY-${Date.now().toString().slice(-6)}`,
      projectId,
      receiptNumber,
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedPayments = [...p.payments, newRecord];
        const totalPaid = updatedPayments.reduce((sum, r) => sum + r.amount, 0);

        const advanceRequired = p.quotation?.advanceRequired || p.estimatedValue * 0.5;
        const hasMetAdvance = totalPaid >= advanceRequired;

        return {
          ...p,
          payments: updatedPayments,
          status: hasMetAdvance ? 'Advance Received' : p.status,
          currentStage: hasMetAdvance ? 'production' : 'payment',
          nextAction: hasMetAdvance ? 'Start Production' : 'Collect Remaining Advance',
          updatedAt: new Date().toISOString(),
        };
      })
    );

    return newRecord;
  };

  const startProduction = (projectId: string, workerName = 'Mahesh (Senior Fabricator)') => {
    const project = getProject(projectId);
    if (!project) return false;

    const totalPaid = project.payments.reduce((sum, p) => sum + p.amount, 0);
    const advanceRequired = project.quotation?.advanceRequired || project.estimatedValue * 0.5;

    if (!project.quotation || project.quotation.status !== 'Approved') {
      alert('Quotation must be Approved before starting production.');
      return false;
    }
    if (totalPaid < advanceRequired) {
      alert(`Advance payment requirement not met. Received: ₹${totalPaid.toLocaleString()}, Required: ₹${advanceRequired.toLocaleString()}`);
      return false;
    }

    const productionOrder = {
      id: `PO-${Math.floor(8000 + Math.random() * 1999)}`,
      projectId,
      status: 'Cutting' as const,
      cuttingProgress: 15,
      assemblyProgress: 0,
      qcChecklist: {
        dimensionsVerified: false,
        weldsCleaned: false,
        reinforcementChecked: false,
        glassGasketsTight: false,
        hardwareSmoothAction: false,
        protectiveFilmIntact: true,
      },
      qcStatus: 'Pending' as const,
      qcNotes: 'Cutting order generated and dispatched to shop floor station #1.',
      allocatedWorker: workerName,
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          currentStage: 'production',
          status: 'In Production',
          productionOrder,
          nextAction: 'Execute Cutting & Assembly',
          updatedAt: new Date().toISOString(),
        };
      })
    );

    setInventory((prev) =>
      prev.map((item) => {
        if (item.category === 'Profile') {
          return {
            ...item,
            reservedQty: item.reservedQty + 40,
            availableQty: Math.max(0, item.availableQty - 40),
          };
        }
        return item;
      })
    );

    return true;
  };

  const updateCuttingStatus = (
    projectId: string,
    cutId: string,
    isCut: boolean
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedWindows = p.windows.map((w) => {
          const bom = w.calculatedBOM;
          if (!bom) return w;
          return {
            ...w,
            calculatedBOM: {
              ...bom,
              outerFrameCuts: bom.outerFrameCuts.map((c) =>
                c.id === cutId ? { ...c, status: isCut ? ('cut' as const) : ('pending' as const) } : c
              ),
              sashCuts: bom.sashCuts.map((c) =>
                c.id === cutId ? { ...c, status: isCut ? ('cut' as const) : ('pending' as const) } : c
              ),
            },
          };
        });

        let totalCuts = 0;
        let completedCuts = 0;
        updatedWindows.forEach((w) => {
          w.calculatedBOM.outerFrameCuts.forEach((c) => {
            totalCuts++;
            if (c.status === 'cut') completedCuts++;
          });
          w.calculatedBOM.sashCuts.forEach((c) => {
            totalCuts++;
            if (c.status === 'cut') completedCuts++;
          });
        });

        const cuttingProgress = totalCuts > 0 ? Math.round((completedCuts / totalCuts) * 100) : 100;

        return {
          ...p,
          windows: updatedWindows,
          productionOrder: p.productionOrder
            ? {
                ...p.productionOrder,
                cuttingProgress,
                status: cuttingProgress === 100 ? 'Assembly' : 'Cutting',
              }
            : null,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateProductionProgress = (
    projectId: string,
    stage: 'Cutting' | 'Assembly' | 'QC' | 'Completed',
    progress: number
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId || !p.productionOrder) return p;
        return {
          ...p,
          productionOrder: {
            ...p.productionOrder,
            status: stage,
            cuttingProgress: stage === 'Cutting' ? progress : 100,
            assemblyProgress: stage === 'Assembly' ? progress : stage === 'QC' || stage === 'Completed' ? 100 : p.productionOrder.assemblyProgress,
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateQCStatus = (
    projectId: string,
    passed: boolean,
    checklist: any,
    notes: string
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId || !p.productionOrder) return p;
        return {
          ...p,
          productionOrder: {
            ...p.productionOrder,
            qcChecklist: checklist,
            qcStatus: passed ? 'Passed' : 'Rework',
            qcNotes: notes,
            status: passed ? 'Completed' : 'Assembly',
          },
          currentStage: passed ? 'completed' : 'production',
          status: passed ? 'Completed' : 'In Production',
          nextAction: passed ? 'Dispatch & Installation' : 'Rework Quality Issues',
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const completeProject = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          currentStage: 'completed',
          status: 'Completed',
          nextAction: 'Ready for Dispatch / Warranty Issuance',
          productionOrder: p.productionOrder
            ? {
                ...p.productionOrder,
                status: 'Completed',
                cuttingProgress: 100,
                assemblyProgress: 100,
                qcStatus: 'Passed',
                completedAt: new Date().toISOString(),
              }
            : null,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>): InventoryItem => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `INV-${Date.now().toString().slice(-4)}`,
    };
    setInventory((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        // Recalculate status if stock values changed
        if (updates.currentStock !== undefined || updates.minStock !== undefined) {
          const cur = updated.currentStock;
          const min = updated.minStock;
          updated.status = cur === 0 ? 'Out of Stock' : cur <= min ? 'Low Stock' : 'In Stock';
        }
        return updated;
      })
    );
  };

  const adjustStock = (id: string, deltaQty: number, _reason?: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newQty = Math.max(0, item.currentStock + deltaQty);
        return {
          ...item,
          currentStock: newQty,
          status: newQty === 0 ? 'Out of Stock' : newQty <= item.minStock ? 'Low Stock' : 'In Stock',
        };
      })
    );
  };

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const addBrand = (brandName: string) => {
    const trimmed = brandName.trim();
    if (!trimmed) return;
    setBrands((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  };

  const updateBrand = (oldBrandName: string, newBrandName: string) => {
    const trimmed = newBrandName.trim();
    if (!trimmed || trimmed === oldBrandName) return;

    // Update brands list
    setBrands((prev) => prev.map((b) => (b === oldBrandName ? trimmed : b)));

    // Update all inventory items with this brand name
    setInventory((prev) =>
      prev.map((item) => {
        if (item.brandName === oldBrandName || item.brand === oldBrandName) {
          return {
            ...item,
            brandName: trimmed,
            brand: trimmed as any,
          };
        }
        return item;
      })
    );
  };

  const deleteBrand = (brandName: string) => {
    setBrands((prev) => prev.filter((b) => b !== brandName));
  };

  const resetToDefaults = () => {
    setProjects(INITIAL_PROJECTS);
    setCustomers(INITIAL_CUSTOMERS);
    setInventory(INITIAL_INVENTORY);
    setBrands(DEFAULT_BRANDS);
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
    localStorage.removeItem(STORAGE_KEY_CUSTOMERS);
    localStorage.removeItem(STORAGE_KEY_INVENTORY);
    localStorage.removeItem(STORAGE_KEY_BRANDS);
  };

  return (
    <StoreContext.Provider
      value={{
        projects,
        customers,
        inventory,
        getProject,
        getWindow,
        createCustomer,
        createProject,
        addWindow,
        updateWindow,
        duplicateWindow,
        deleteWindow,
        generateQuotation,
        createQuotationRevision,
        approveQuotation,
        recordPayment,
        startProduction,
        updateCuttingStatus,
        updateProductionProgress,
        updateQCStatus,
        completeProject,
        addInventoryItem,
        updateInventoryItem,
        adjustStock,
        deleteInventoryItem,
        brands,
        addBrand,
        updateBrand,
        deleteBrand,
        resetToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
