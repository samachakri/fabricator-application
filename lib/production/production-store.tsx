'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ManufacturingOrder,
  ProductionStage,
  ProductionItem,
  CuttingItem,
  AssemblyTask,
  QCCheckItem,
  ReworkTask,
  ActivityLogEntry,
} from './types';

// Helper to create cutting list for a window item
function createCuttingList(windowId: string, width: number, height: number): CuttingItem[] {
  return [
    {
      id: `${windowId}-cut-01`,
      profileCode: 'P-101',
      profileName: 'Frame Profile P-101',
      section: 'Frame',
      lengthMm: width,
      quantity: 2,
      completedQuantity: 2,
      status: 'Completed',
      completedBy: 'Ramesh',
      completedAt: '10:42 AM',
    },
    {
      id: `${windowId}-cut-02`,
      profileCode: 'P-101',
      profileName: 'Frame Profile P-101',
      section: 'Frame',
      lengthMm: height,
      quantity: 2,
      completedQuantity: 1,
      status: 'Pending',
    },
    {
      id: `${windowId}-cut-03`,
      profileCode: 'P-202',
      profileName: 'Sash Profile P-202',
      section: 'Sash',
      lengthMm: Math.round(width / 2) + 20,
      quantity: 2,
      completedQuantity: 0,
      status: 'Pending',
    },
    {
      id: `${windowId}-cut-04`,
      profileCode: 'P-202',
      profileName: 'Sash Profile P-202',
      section: 'Sash',
      lengthMm: height - 80,
      quantity: 2,
      completedQuantity: 0,
      status: 'Pending',
    },
    {
      id: `${windowId}-cut-05`,
      profileCode: 'P-301',
      profileName: 'Mullion Profile P-301',
      section: 'Mullion',
      lengthMm: height - 60,
      quantity: 1,
      completedQuantity: 0,
      status: 'Pending',
    },
  ];
}

// Helper to create assembly checklist
function createAssemblyChecklist(windowId: string): AssemblyTask[] {
  return [
    {
      id: `${windowId}-asm-01`,
      category: 'Frame',
      title: 'Frame pieces assembled',
      description: 'Align outer frame profiles on fabrication bed',
      component: `${windowId} Frame`,
      status: 'Completed',
      completedBy: 'Ramesh',
      completedAt: '11:15 AM',
    },
    {
      id: `${windowId}-asm-02`,
      category: 'Frame',
      title: 'Corners joined & welded',
      description: 'Fusion weld 45° mitred corner joints with steel inserts',
      component: `${windowId} Frame`,
      status: 'Completed',
      completedBy: 'Ramesh',
      completedAt: '11:30 AM',
    },
    {
      id: `${windowId}-asm-03`,
      category: 'Frame',
      title: 'Frame alignment checked',
      description: 'Check diagonal squareness (tolerance ±1.5 mm)',
      component: `${windowId} Frame`,
      status: 'Completed',
      completedBy: 'Ramesh',
      completedAt: '11:45 AM',
    },
    {
      id: `${windowId}-asm-04`,
      category: 'Sash',
      title: 'Sash pieces assembled',
      description: 'Assemble sliding sash profiles with corner cleats',
      component: `${windowId} Sash`,
      status: 'Completed',
      completedBy: 'Ramesh',
      completedAt: '12:05 PM',
    },
    {
      id: `${windowId}-asm-05`,
      category: 'Sash',
      title: 'Rollers installed',
      description: 'Install 2 nylon tandem rollers on the bottom of each sash',
      component: `${windowId} Sash`,
      hardwareType: 'Sliding Roller',
      quantity: 4,
      instructions: 'Install 2 rollers on each sash. Check height adjustment screws.',
      status: 'Completed',
      completedBy: 'Ramesh',
      completedAt: '12:20 PM',
    },
    {
      id: `${windowId}-asm-06`,
      category: 'Glass',
      title: 'Glass installed',
      description: 'Place 5mm toughened glass with setting blocks',
      component: `${windowId} Glass`,
      status: 'Completed',
      completedBy: 'Suresh',
      completedAt: '12:40 PM',
    },
    {
      id: `${windowId}-asm-07`,
      category: 'Glass',
      title: 'Beading completed',
      description: 'Snap-fit PVC glazing beads with rubber wedge gasket',
      component: `${windowId} Beading`,
      status: 'Completed',
      completedBy: 'Suresh',
      completedAt: '1:00 PM',
    },
    {
      id: `${windowId}-asm-08`,
      category: 'Hardware',
      title: 'Handles installed',
      description: 'Fit pop-up touch lock handles on sliding sashes',
      component: `${windowId} Hardware`,
      status: 'Completed',
      completedBy: 'Ramesh',
      completedAt: '1:25 PM',
    },
    {
      id: `${windowId}-asm-09`,
      category: 'Hardware',
      title: 'Locks installed',
      description: 'Install striker plates and verify smooth engagement',
      component: `${windowId} Hardware`,
      status: 'Pending',
    },
    {
      id: `${windowId}-asm-10`,
      category: 'Hardware',
      title: 'Hardware & weather-strip checked',
      description: 'Verify wool pile weather-strips and interlocks',
      component: `${windowId} Hardware`,
      status: 'Pending',
    },
  ];
}

// Helper to create QC checklist
function createQCChecklist(windowId: string, width: number, height: number): QCCheckItem[] {
  return [
    {
      id: `${windowId}-qc-01`,
      category: 'Dimensions',
      label: 'Width verified against design',
      designValue: `${width} mm`,
      actualValue: `${width - 2} mm`,
      tolerance: '±2.0 mm',
      isToleranceWarning: false,
      passed: true,
      notes: 'Within tolerance (1798 mm)',
    },
    {
      id: `${windowId}-qc-02`,
      category: 'Dimensions',
      label: 'Height verified against design',
      designValue: `${height} mm`,
      actualValue: `${height} mm`,
      tolerance: '±2.0 mm',
      isToleranceWarning: false,
      passed: true,
      notes: 'Exact match',
    },
    {
      id: `${windowId}-qc-03`,
      category: 'Dimensions',
      label: 'Diagonal squareness checked',
      designValue: 'Equal diagonals',
      actualValue: 'Δ 1.0 mm',
      tolerance: '±2.0 mm',
      isToleranceWarning: false,
      passed: true,
    },
    {
      id: `${windowId}-qc-04`,
      category: 'Frame',
      label: 'Frame alignment correct',
      passed: true,
      notes: 'Frame square and true',
    },
    {
      id: `${windowId}-qc-05`,
      category: 'Frame',
      label: 'Corners properly joined & cleaned',
      passed: true,
      notes: 'Welds deburred cleanly',
    },
    {
      id: `${windowId}-qc-06`,
      category: 'Frame',
      label: 'No visible damage / protective tape intact',
      passed: true,
    },
    {
      id: `${windowId}-qc-07`,
      category: 'Sash',
      label: 'Sash alignment correct in outer frame',
      passed: true,
    },
    {
      id: `${windowId}-qc-08`,
      category: 'Sash',
      label: 'Sliding movement smooth with no binding',
      passed: false,
      notes: 'Right sash roller slightly tight',
    },
    {
      id: `${windowId}-qc-09`,
      category: 'Sash',
      label: 'Rollers functioning properly',
      passed: true,
    },
    {
      id: `${windowId}-qc-10`,
      category: 'Glass',
      label: 'Correct glass type (Toughened)',
      passed: true,
    },
    {
      id: `${windowId}-qc-11`,
      category: 'Glass',
      label: 'Correct thickness (5mm)',
      passed: true,
    },
    {
      id: `${windowId}-qc-12`,
      category: 'Glass',
      label: 'No cracks, bubbles, or scratches',
      passed: true,
    },
    {
      id: `${windowId}-qc-13`,
      category: 'Glass',
      label: 'Glass properly seated with gaskets',
      passed: true,
    },
    {
      id: `${windowId}-qc-14`,
      category: 'Hardware',
      label: 'Handles and touch locks working smoothly',
      passed: true,
    },
    {
      id: `${windowId}-qc-15`,
      category: 'Finish',
      label: 'Colour correct (Clear / Pure White)',
      passed: true,
    },
    {
      id: `${windowId}-qc-16`,
      category: 'Finish',
      label: 'Surface finish acceptable, zero scratches',
      passed: true,
    },
  ];
}

// Initial orders matching Stitch screenshot media_1789198084656.png
const INITIAL_ORDERS: ManufacturingOrder[] = [
  {
    id: 'PO-1045',
    project: 'Rahul Residence',
    customer: 'Rahul Sharma',
    quotationId: 'QT-1024',
    windowsCount: 4,
    doorsCount: 1,
    windowsDoorsSummary: '4 Windows + 1 Door',
    priority: 'High',
    currentStage: 'CUTTING',
    materialStatus: 'Materials Reserved',
    assignedTo: 'Ramesh',
    dueDate: '10 Sep',
    lastUpdated: 'Today, 2:15 PM',
    productionStartTimestamp: '10 Sep 2026, 11:10 AM',
    readinessChecklist: {
      quotationApproved: true,
      designCompleted: true,
      customerInfoAvailable: true,
      windowConfigurationComplete: true,
      materialsAvailable: true,
      materialsReserved: true,
      productionItemsGenerated: true,
    },
    materials: [
      { material: 'VEKA Profile P-101', required: '7.2 m', available: '12 m', status: 'Ready' },
      { material: 'Glass (5mm Toughened)', required: '2.7 m²', available: '4.5 m²', status: 'Ready' },
      {
        material: 'Mesh (Stainless Steel 304)',
        required: '1.5 m²',
        available: '0.8 m²',
        status: 'Shortage',
        shortageNote: 'Material shortage — 0.7 m² required',
      },
    ],
    hasShortage: true,
    shortageReason: 'Insufficient Mesh (0.7 m² shortage)',
    items: [
      {
        id: 'W01',
        windowId: 'W01',
        name: 'Sliding Window',
        type: 'Sliding Window',
        dimensions: '1800 × 1500 mm',
        width: 1800,
        height: 1500,
        stage: 'CUTTING',
        status: 'In Progress',
        cuttingList: createCuttingList('W01', 1800, 1500),
        assemblyChecklist: createAssemblyChecklist('W01'),
        qcChecklist: createQCChecklist('W01', 1800, 1500),
        reworkTasks: [],
      },
      {
        id: 'W02',
        windowId: 'W02',
        name: 'Casement Window',
        type: 'Casement Window',
        dimensions: '1200 × 1500 mm',
        width: 1200,
        height: 1500,
        stage: 'ASSEMBLY',
        status: 'Pending',
        cuttingList: createCuttingList('W02', 1200, 1500),
        assemblyChecklist: createAssemblyChecklist('W02'),
        qcChecklist: createQCChecklist('W02', 1200, 1500),
        reworkTasks: [],
      },
      {
        id: 'W03',
        windowId: 'W03',
        name: 'Mesh Door',
        type: 'Mesh Door',
        dimensions: '900 × 2100 mm',
        width: 900,
        height: 2100,
        stage: 'QC',
        status: 'Pending',
        cuttingList: createCuttingList('W03', 900, 2100),
        assemblyChecklist: createAssemblyChecklist('W03'),
        qcChecklist: createQCChecklist('W03', 900, 2100),
        reworkTasks: [],
      },
      {
        id: 'W04',
        windowId: 'W04',
        name: 'Fixed Window',
        type: 'Fixed Window',
        dimensions: '600 × 1200 mm',
        width: 600,
        height: 1200,
        stage: 'READY',
        status: 'Pending',
        cuttingList: createCuttingList('W04', 600, 1200),
        assemblyChecklist: createAssemblyChecklist('W04'),
        qcChecklist: createQCChecklist('W04', 600, 1200),
        reworkTasks: [],
      },
      {
        id: 'W05',
        windowId: 'W05',
        name: 'Sliding Window',
        type: 'Sliding Window',
        dimensions: '1500 × 1200 mm',
        width: 1500,
        height: 1200,
        stage: 'READY',
        status: 'Pending',
        cuttingList: createCuttingList('W05', 1500, 1200),
        assemblyChecklist: createAssemblyChecklist('W05'),
        qcChecklist: createQCChecklist('W05', 1500, 1200),
        reworkTasks: [],
      },
    ],
    activityHistory: [
      { id: 'act-1', action: 'Production Order Created', user: 'System', timestamp: '10:20 AM' },
      { id: 'act-2', action: 'Materials Reserved', user: 'Inventory System', timestamp: '10:35 AM' },
      { id: 'act-3', action: 'Production Started', user: 'Karthik (Manager)', timestamp: '11:10 AM' },
      { id: 'act-4', action: 'Cutting Completed for Frame W01', user: 'Ramesh (Worker)', timestamp: '12:30 PM' },
      { id: 'act-5', action: 'Moved to Assembly stage', user: 'Ramesh', timestamp: '12:35 PM' },
    ],
    timings: [
      { stage: 'READY', startedAt: '10:20 AM', completedAt: '11:10 AM', duration: '50m', worker: 'Karthik' },
      { stage: 'CUTTING', startedAt: '11:10 AM', worker: 'Ramesh' },
    ],
  },
  {
    id: 'PO-1044',
    project: 'Villa Project',
    customer: 'Arjun Constructions',
    quotationId: 'QT-1022',
    windowsCount: 8,
    doorsCount: 0,
    windowsDoorsSummary: '8 Windows',
    priority: 'Normal',
    currentStage: 'ASSEMBLY',
    materialStatus: 'Materials Ready',
    assignedTo: 'Suresh',
    dueDate: '11 Sep',
    lastUpdated: 'Today, 11:30 AM',
    readinessChecklist: {
      quotationApproved: true,
      designCompleted: true,
      customerInfoAvailable: true,
      windowConfigurationComplete: true,
      materialsAvailable: true,
      materialsReserved: true,
      productionItemsGenerated: true,
    },
    materials: [
      { material: 'VEKA 70mm Profile', required: '14.5 m', available: '20 m', status: 'Ready' },
      { material: 'DGU 5+12+5 Glass', required: '6.2 m²', available: '8.0 m²', status: 'Ready' },
    ],
    hasShortage: false,
    items: [
      {
        id: 'W01',
        windowId: 'W01',
        name: 'Casement Window',
        type: 'Casement Window',
        dimensions: '1400 × 1600 mm',
        width: 1400,
        height: 1600,
        stage: 'ASSEMBLY',
        status: 'In Progress',
        cuttingList: createCuttingList('W01', 1400, 1600),
        assemblyChecklist: createAssemblyChecklist('W01'),
        qcChecklist: createQCChecklist('W01', 1400, 1600),
        reworkTasks: [],
      },
    ],
    activityHistory: [
      { id: 'act-1', action: 'Cutting Completed', user: 'Ravi', timestamp: 'Yesterday, 4:00 PM' },
      { id: 'act-2', action: 'Assembly In Progress', user: 'Suresh', timestamp: 'Today, 9:00 AM' },
    ],
    timings: [
      { stage: 'CUTTING', startedAt: 'Yesterday, 1:00 PM', completedAt: 'Yesterday, 4:00 PM', duration: '3h', worker: 'Ravi' },
      { stage: 'ASSEMBLY', startedAt: 'Today, 9:00 AM', worker: 'Suresh' },
    ],
  },
  {
    id: 'PO-1043',
    project: 'Office Building',
    customer: 'Global Infra',
    quotationId: 'QT-1019',
    windowsCount: 5,
    doorsCount: 2,
    windowsDoorsSummary: '5 Windows + 2 Doors',
    priority: 'High',
    currentStage: 'QC',
    materialStatus: 'Partially Available',
    assignedTo: 'Karthik',
    dueDate: '10 Sep',
    lastUpdated: 'Today, 9:45 AM',
    readinessChecklist: {
      quotationApproved: true,
      designCompleted: true,
      customerInfoAvailable: true,
      windowConfigurationComplete: true,
      materialsAvailable: true,
      materialsReserved: true,
      productionItemsGenerated: true,
    },
    materials: [
      { material: 'Heavy Duty Mullion', required: '8.4 m', available: '10 m', status: 'Ready' },
      { material: 'Toughened 8mm Glass', required: '5.1 m²', available: '6 m²', status: 'Ready' },
    ],
    hasShortage: false,
    items: [
      {
        id: 'W01',
        windowId: 'W01',
        name: 'Fixed Glass Partition',
        type: 'Fixed Window',
        dimensions: '2400 × 1800 mm',
        width: 2400,
        height: 1800,
        stage: 'QC',
        status: 'In Progress',
        cuttingList: createCuttingList('W01', 2400, 1800),
        assemblyChecklist: createAssemblyChecklist('W01'),
        qcChecklist: createQCChecklist('W01', 2400, 1800),
        reworkTasks: [],
      },
    ],
    activityHistory: [
      { id: 'act-1', action: 'Assembly Completed', user: 'Suresh', timestamp: 'Today, 9:15 AM' },
      { id: 'act-2', action: 'QC Inspection Started', user: 'Karthik', timestamp: 'Today, 9:45 AM' },
    ],
    timings: [
      { stage: 'CUTTING', duration: '2h 10m', worker: 'Ramesh' },
      { stage: 'ASSEMBLY', duration: '3h 30m', worker: 'Suresh' },
      { stage: 'QC', startedAt: 'Today, 9:45 AM', worker: 'Karthik' },
    ],
  },
  {
    id: 'PO-1042',
    project: 'Lake View Residence',
    customer: 'Priya Nair',
    quotationId: 'QT-1018',
    windowsCount: 3,
    doorsCount: 0,
    windowsDoorsSummary: '3 Windows',
    priority: 'Normal',
    currentStage: 'READY',
    materialStatus: 'Ready',
    assignedTo: 'Vikram',
    dueDate: '12 Sep',
    lastUpdated: 'Yesterday, 6:20 PM',
    readinessChecklist: {
      quotationApproved: true,
      designCompleted: true,
      customerInfoAvailable: true,
      windowConfigurationComplete: true,
      materialsAvailable: true,
      materialsReserved: true,
      productionItemsGenerated: true,
    },
    materials: [
      { material: 'VEKA 60mm Profile', required: '6.0 m', available: '15 m', status: 'Ready' },
      { material: '5mm Clear Glass', required: '3.2 m²', available: '10 m²', status: 'Ready' },
    ],
    hasShortage: false,
    items: [
      {
        id: 'W01',
        windowId: 'W01',
        name: 'Sliding Window',
        type: 'Sliding Window',
        dimensions: '1600 × 1200 mm',
        width: 1600,
        height: 1200,
        stage: 'READY',
        status: 'Pending',
        cuttingList: createCuttingList('W01', 1600, 1200),
        assemblyChecklist: createAssemblyChecklist('W01'),
        qcChecklist: createQCChecklist('W01', 1600, 1200),
        reworkTasks: [],
      },
    ],
    activityHistory: [
      { id: 'act-1', action: 'Quotation Approved', user: 'Sales', timestamp: 'Yesterday, 5:00 PM' },
      { id: 'act-2', action: 'Production Order Created', user: 'System', timestamp: 'Yesterday, 6:20 PM' },
    ],
    timings: [{ stage: 'READY', startedAt: 'Yesterday, 6:20 PM' }],
  },
  {
    id: 'PO-1041',
    project: 'Sunrise Apartments',
    customer: 'Sunrise Builders',
    quotationId: 'QT-1015',
    windowsCount: 6,
    doorsCount: 1,
    windowsDoorsSummary: '6 Windows + 1 Door',
    priority: 'Low',
    currentStage: 'CUTTING',
    materialStatus: 'Shortage',
    assignedTo: 'Ravi',
    dueDate: '13 Sep',
    lastUpdated: 'Yesterday, 4:10 PM',
    readinessChecklist: {
      quotationApproved: true,
      designCompleted: true,
      customerInfoAvailable: true,
      windowConfigurationComplete: true,
      materialsAvailable: false,
      materialsReserved: false,
      productionItemsGenerated: true,
    },
    materials: [
      { material: 'Rehau 60mm Outer Frame', required: '18 m', available: '12 m', status: 'Shortage', shortageNote: 'Short by 6 m' },
    ],
    hasShortage: true,
    shortageReason: 'Insufficient Rehau 60mm Frame (6 m shortage)',
    items: [],
    activityHistory: [
      { id: 'act-1', action: 'Production Started', user: 'Manager', timestamp: 'Yesterday, 2:00 PM' },
      { id: 'act-2', action: 'Cutting Paused - Profile Shortage', user: 'Ravi', timestamp: 'Yesterday, 4:10 PM' },
    ],
    timings: [{ stage: 'CUTTING', startedAt: 'Yesterday, 2:00 PM', worker: 'Ravi' }],
  },
  {
    id: 'PO-1040',
    project: 'Green Valley',
    customer: 'Mehta Developers',
    quotationId: 'QT-1014',
    windowsCount: 10,
    doorsCount: 0,
    windowsDoorsSummary: '10 Windows',
    priority: 'Normal',
    currentStage: 'ASSEMBLY',
    materialStatus: 'Materials Ready',
    assignedTo: 'Suresh',
    dueDate: '14 Sep',
    lastUpdated: 'Yesterday, 1:25 PM',
    readinessChecklist: {
      quotationApproved: true,
      designCompleted: true,
      customerInfoAvailable: true,
      windowConfigurationComplete: true,
      materialsAvailable: true,
      materialsReserved: true,
      productionItemsGenerated: true,
    },
    materials: [{ material: 'VEKA 60mm White Profile', required: '24 m', available: '30 m', status: 'Ready' }],
    hasShortage: false,
    items: [],
    activityHistory: [{ id: 'act-1', action: 'Cutting Completed', user: 'Ramesh', timestamp: 'Yesterday, 1:25 PM' }],
    timings: [
      { stage: 'CUTTING', duration: '4h 15m', worker: 'Ramesh' },
      { stage: 'ASSEMBLY', startedAt: 'Yesterday, 1:25 PM', worker: 'Suresh' },
    ],
  },
  {
    id: 'PO-1039',
    project: 'City Mall',
    customer: 'Metro Projects',
    quotationId: 'QT-1011',
    windowsCount: 12,
    doorsCount: 3,
    windowsDoorsSummary: '12 Windows + 3 Doors',
    priority: 'High',
    currentStage: 'REWORK',
    materialStatus: 'Ready',
    assignedTo: 'Karthik',
    dueDate: '11 Sep',
    lastUpdated: 'Yesterday, 11:00 AM',
    readinessChecklist: {
      quotationApproved: true,
      designCompleted: true,
      customerInfoAvailable: true,
      windowConfigurationComplete: true,
      materialsAvailable: true,
      materialsReserved: true,
      productionItemsGenerated: true,
    },
    materials: [{ material: 'All Required Materials', required: 'Fully Stocked', available: 'In Stock', status: 'Ready' }],
    hasShortage: false,
    items: [
      {
        id: 'W01',
        windowId: 'W01',
        name: 'Casement Window',
        type: 'Casement Window',
        dimensions: '1500 × 1800 mm',
        width: 1500,
        height: 1800,
        stage: 'REWORK',
        status: 'In Progress',
        cuttingList: createCuttingList('W01', 1500, 1800),
        assemblyChecklist: createAssemblyChecklist('W01'),
        qcChecklist: createQCChecklist('W01', 1500, 1800),
        reworkTasks: [
          {
            id: 'rw-01',
            component: 'W01 Sash',
            problem: 'Roller alignment',
            description: 'Right sash is not sliding smoothly. Rollers misaligned by 3mm.',
            priority: 'High',
            assignedTo: 'Ramesh',
            status: 'In Progress',
            createdAt: 'Yesterday, 11:00 AM',
            startedAt: 'Yesterday, 11:30 AM',
          },
        ],
      },
    ],
    activityHistory: [
      { id: 'act-1', action: 'QC Inspection Failed', user: 'Karthik (QC)', timestamp: 'Yesterday, 10:45 AM', notes: 'Right sash roller not sliding smoothly' },
      { id: 'act-2', action: 'Rework Task Created', user: 'Karthik', timestamp: 'Yesterday, 11:00 AM', notes: 'Assigned to Ramesh' },
    ],
    timings: [
      { stage: 'CUTTING', duration: '3h', worker: 'Ravi' },
      { stage: 'ASSEMBLY', duration: '4h', worker: 'Suresh' },
      { stage: 'QC', startedAt: 'Yesterday, 10:00 AM', completedAt: 'Yesterday, 10:45 AM', duration: '45m', worker: 'Karthik' },
      { stage: 'REWORK', startedAt: 'Yesterday, 11:00 AM', worker: 'Ramesh' },
    ],
  },
  {
    id: 'PO-1038',
    project: 'Residential Villa',
    customer: 'Sharma Residence',
    quotationId: 'QT-1008',
    windowsCount: 4,
    doorsCount: 0,
    windowsDoorsSummary: '4 Windows',
    priority: 'Normal',
    currentStage: 'COMPLETED',
    materialStatus: 'Ready',
    assignedTo: 'Vikram',
    dueDate: '09 Sep',
    lastUpdated: '2 days ago',
    completionTimestamp: '09 Sep 2026, 3:05 PM',
    completedBy: 'Karthik',
    readinessChecklist: {
      quotationApproved: true,
      designCompleted: true,
      customerInfoAvailable: true,
      windowConfigurationComplete: true,
      materialsAvailable: true,
      materialsReserved: true,
      productionItemsGenerated: true,
    },
    materials: [{ material: 'Material Consumed', required: '100%', available: 'Consumed', status: 'Ready' }],
    hasShortage: false,
    items: [],
    activityHistory: [
      { id: 'act-1', action: 'QC Passed', user: 'Karthik', timestamp: '09 Sep, 2:30 PM' },
      { id: 'act-2', action: 'Production Completed', user: 'Karthik', timestamp: '09 Sep, 3:05 PM' },
    ],
    timings: [
      { stage: 'CUTTING', duration: '2h', worker: 'Ramesh' },
      { stage: 'ASSEMBLY', duration: '3h', worker: 'Suresh' },
      { stage: 'QC', duration: '45m', worker: 'Karthik' },
      { stage: 'COMPLETED', completedAt: '09 Sep, 3:05 PM', worker: 'Karthik' },
    ],
  },
  {
    id: 'PO-1037',
    project: 'Commercial Space',
    customer: 'Bright Spaces',
    quotationId: 'QT-1007',
    windowsCount: 7,
    doorsCount: 1,
    windowsDoorsSummary: '7 Windows + 1 Door',
    priority: 'Normal',
    currentStage: 'QC',
    materialStatus: 'Materials Ready',
    assignedTo: 'Ramesh',
    dueDate: '10 Sep',
    lastUpdated: '2 days ago',
    readinessChecklist: {
      quotationApproved: true,
      designCompleted: true,
      customerInfoAvailable: true,
      windowConfigurationComplete: true,
      materialsAvailable: true,
      materialsReserved: true,
      productionItemsGenerated: true,
    },
    materials: [{ material: 'All Materials', required: 'Fully Delivered', available: 'Available', status: 'Ready' }],
    hasShortage: false,
    items: [],
    activityHistory: [{ id: 'act-1', action: 'Assembly Completed', user: 'Suresh', timestamp: '2 days ago' }],
    timings: [{ stage: 'QC', startedAt: '2 days ago', worker: 'Ramesh' }],
  },
  {
    id: 'PO-1036',
    project: 'Farm House',
    customer: 'Reddy Farms',
    quotationId: 'QT-1005',
    windowsCount: 5,
    doorsCount: 0,
    windowsDoorsSummary: '5 Windows',
    priority: 'Low',
    currentStage: 'READY',
    materialStatus: 'Ready',
    assignedTo: 'Suresh',
    dueDate: '12 Sep',
    lastUpdated: '3 days ago',
    readinessChecklist: {
      quotationApproved: true,
      designCompleted: true,
      customerInfoAvailable: true,
      windowConfigurationComplete: true,
      materialsAvailable: true,
      materialsReserved: true,
      productionItemsGenerated: true,
    },
    materials: [{ material: 'Standard Profiles', required: 'Ready in warehouse', available: 'In Stock', status: 'Ready' }],
    hasShortage: false,
    items: [],
    activityHistory: [{ id: 'act-1', action: 'Order Created from Quotation', user: 'System', timestamp: '3 days ago' }],
    timings: [{ stage: 'READY', startedAt: '3 days ago' }],
  },
];

interface ProductionContextType {
  orders: ManufacturingOrder[];
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  getOrder: (id: string) => ManufacturingOrder | undefined;

  // Real workflow actions
  startProduction: (orderId: string, workerName?: string) => void;
  markCutComplete: (orderId: string, windowId: string, cutId: string, workerName?: string) => void;
  completeCuttingStage: (orderId: string, workerName?: string) => void;
  markAssemblyTaskComplete: (orderId: string, windowId: string, taskId: string, workerName?: string) => void;
  completeAssemblyStage: (orderId: string, workerName?: string) => void;
  passQualityControl: (orderId: string, inspectorName?: string) => void;
  failQualityControlAndCreateRework: (
    orderId: string,
    windowId: string,
    reworkData: {
      component: string;
      problem: string;
      description: string;
      priority: 'High' | 'Normal' | 'Low';
      assignedTo: string;
    }
  ) => void;
  startRework: (orderId: string, reworkId: string) => void;
  completeRework: (orderId: string, reworkId: string, resolutionNotes: string, workerName?: string) => void;
  completeProduction: (orderId: string, completedBy?: string) => void;
  resolveShortage: (orderId: string, materialName: string) => void;
  createProductionOrderFromQuotation: (quotationData: {
    quotationId: string;
    project: string;
    customer: string;
    windowsCount: number;
    doorsCount: number;
    priority?: 'High' | 'Normal' | 'Low';
    dueDate?: string;
  }) => ManufacturingOrder;
}

const ProductionContext = createContext<ProductionContextType | null>(null);

const STORAGE_KEY = 'fabricator_pro_production_orders_v2';

export const ProductionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<ManufacturingOrder[]>(INITIAL_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to localStorage
  const saveOrders = (updated: ManufacturingOrder[]) => {
    setOrders(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const getOrder = (id: string) => orders.find((o) => o.id === id);

  // 1. Start Production (Ready -> Cutting)
  const startProduction = (orderId: string, workerName = 'Ramesh') => {
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const newActivity: ActivityLogEntry = {
        id: `act-${Date.now()}`,
        action: 'Production Started -> Cutting Assigned',
        user: workerName,
        timestamp: now,
        notes: `PO moved to Cutting stage. Assigned to ${workerName}`,
      };
      return {
        ...order,
        currentStage: 'CUTTING' as ProductionStage,
        assignedTo: workerName,
        productionStartTimestamp: new Date().toLocaleString(),
        materialStatus: 'Materials Reserved' as const,
        lastUpdated: `Today, ${now}`,
        activityHistory: [newActivity, ...order.activityHistory],
        timings: [
          ...order.timings,
          { stage: 'CUTTING' as const, startedAt: now, worker: workerName },
        ],
      };
    });
    saveOrders(updated);
  };

  // 2. Mark Cut Complete
  const markCutComplete = (
    orderId: string,
    windowId: string,
    cutId: string,
    workerName = 'Ramesh'
  ) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const updatedItems = order.items.map((item) => {
        if (item.id !== windowId) return item;
        const updatedCuts = item.cuttingList.map((cut) => {
          if (cut.id !== cutId) return cut;
          return {
            ...cut,
            status: 'Completed' as const,
            completedQuantity: cut.quantity,
            completedBy: workerName,
            completedAt: now,
          };
        });
        return {
          ...item,
          cuttingList: updatedCuts,
        };
      });
      return {
        ...order,
        items: updatedItems,
        lastUpdated: `Today, ${now}`,
      };
    });
    saveOrders(updated);
  };

  // 3. Complete Cutting Stage (Cutting -> Assembly)
  const completeCuttingStage = (orderId: string, workerName = 'Ramesh') => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const newActivity: ActivityLogEntry = {
        id: `act-${Date.now()}`,
        action: 'Cutting Completed -> Moved to Assembly',
        user: workerName,
        timestamp: now,
        notes: 'All required profile cuts completed. Reserved materials consumed.',
      };
      return {
        ...order,
        currentStage: 'ASSEMBLY' as ProductionStage,
        materialStatus: 'Materials Ready' as const,
        lastUpdated: `Today, ${now}`,
        activityHistory: [newActivity, ...order.activityHistory],
        timings: [
          ...order.timings,
          { stage: 'ASSEMBLY' as const, startedAt: now, worker: 'Suresh' },
        ],
      };
    });
    saveOrders(updated);
  };

  // 4. Mark Assembly Task Complete
  const markAssemblyTaskComplete = (
    orderId: string,
    windowId: string,
    taskId: string,
    workerName = 'Suresh'
  ) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const updatedItems = order.items.map((item) => {
        if (item.id !== windowId) return item;
        const updatedTasks = item.assemblyChecklist.map((task) => {
          if (task.id !== taskId) return task;
          return {
            ...task,
            status: 'Completed' as const,
            completedBy: workerName,
            completedAt: now,
          };
        });
        return {
          ...item,
          assemblyChecklist: updatedTasks,
        };
      });
      return {
        ...order,
        items: updatedItems,
        lastUpdated: `Today, ${now}`,
      };
    });
    saveOrders(updated);
  };

  // 5. Complete Assembly Stage (Assembly -> QC)
  const completeAssemblyStage = (orderId: string, workerName = 'Suresh') => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const newActivity: ActivityLogEntry = {
        id: `act-${Date.now()}`,
        action: 'Assembly Completed -> Moved to Quality Control',
        user: workerName,
        timestamp: now,
        notes: 'Frame, sashes, glass, and hardware assembled.',
      };
      return {
        ...order,
        currentStage: 'QC' as ProductionStage,
        lastUpdated: `Today, ${now}`,
        activityHistory: [newActivity, ...order.activityHistory],
        timings: [
          ...order.timings,
          { stage: 'QC' as const, startedAt: now, worker: 'Karthik' },
        ],
      };
    });
    saveOrders(updated);
  };

  // 6. Pass Quality Control
  const passQualityControl = (orderId: string, inspectorName = 'Karthik') => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const newActivity: ActivityLogEntry = {
        id: `act-${Date.now()}`,
        action: 'Quality Control Passed',
        user: inspectorName,
        timestamp: now,
        notes: 'All dimension, frame, sash, glass, and hardware inspection checks passed.',
      };
      return {
        ...order,
        lastUpdated: `Today, ${now}`,
        activityHistory: [newActivity, ...order.activityHistory],
      };
    });
    saveOrders(updated);
  };

  // 7. Fail QC and Create Rework Task (QC -> Rework)
  const failQualityControlAndCreateRework = (
    orderId: string,
    windowId: string,
    reworkData: {
      component: string;
      problem: string;
      description: string;
      priority: 'High' | 'Normal' | 'Low';
      assignedTo: string;
    }
  ) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const newRework: ReworkTask = {
        id: `rw-${Date.now()}`,
        component: reworkData.component,
        problem: reworkData.problem,
        description: reworkData.description,
        priority: reworkData.priority,
        assignedTo: reworkData.assignedTo,
        status: 'Open',
        createdAt: `Today, ${now}`,
      };
      const updatedItems = order.items.map((item) => {
        if (item.id !== windowId) return item;
        return {
          ...item,
          stage: 'REWORK' as const,
          status: 'In Progress' as const,
          reworkTasks: [newRework, ...item.reworkTasks],
        };
      });
      const newActivity: ActivityLogEntry = {
        id: `act-${Date.now()}`,
        action: `QC Failed -> Rework Created for ${reworkData.component}`,
        user: 'Karthik (QC)',
        timestamp: now,
        notes: `${reworkData.problem}: ${reworkData.description}. Assigned to ${reworkData.assignedTo}`,
      };
      return {
        ...order,
        currentStage: 'REWORK' as ProductionStage,
        assignedTo: reworkData.assignedTo,
        items: updatedItems,
        lastUpdated: `Today, ${now}`,
        activityHistory: [newActivity, ...order.activityHistory],
        timings: [
          ...order.timings,
          { stage: 'REWORK' as const, startedAt: now, worker: reworkData.assignedTo },
        ],
      };
    });
    saveOrders(updated);
  };

  // 8. Start Rework
  const startRework = (orderId: string, reworkId: string) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const updatedItems = order.items.map((item) => {
        const updatedTasks = item.reworkTasks.map((rw) => {
          if (rw.id !== reworkId) return rw;
          return {
            ...rw,
            status: 'In Progress' as const,
            startedAt: `Today, ${now}`,
          };
        });
        return { ...item, reworkTasks: updatedTasks };
      });
      return { ...order, items: updatedItems };
    });
    saveOrders(updated);
  };

  // 9. Complete Rework (Rework -> MUST return back to Quality Control)
  const completeRework = (
    orderId: string,
    reworkId: string,
    resolutionNotes: string,
    workerName = 'Ramesh'
  ) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const updatedItems = order.items.map((item) => {
        const updatedTasks = item.reworkTasks.map((rw) => {
          if (rw.id !== reworkId) return rw;
          return {
            ...rw,
            status: 'Resolved' as const,
            resolvedAt: `Today, ${now}`,
            resolutionNotes,
          };
        });
        return {
          ...item,
          stage: 'QC' as const,
          reworkTasks: updatedTasks,
        };
      });
      const newActivity: ActivityLogEntry = {
        id: `act-${Date.now()}`,
        action: 'Rework Completed -> Returned to Quality Control',
        user: workerName,
        timestamp: now,
        notes: `Rework resolved: ${resolutionNotes}. Sent back to QC for mandatory re-inspection.`,
      };
      return {
        ...order,
        currentStage: 'QC' as ProductionStage,
        lastUpdated: `Today, ${now}`,
        items: updatedItems,
        activityHistory: [newActivity, ...order.activityHistory],
        timings: [
          ...order.timings,
          { stage: 'QC' as const, startedAt: now, worker: 'Karthik' },
        ],
      };
    });
    saveOrders(updated);
  };

  // 10. Complete Production (QC Passed -> Completed)
  const completeProduction = (orderId: string, completedBy = 'Karthik') => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const newActivity: ActivityLogEntry = {
        id: `act-${Date.now()}`,
        action: 'Production Order Completed 🎉',
        user: completedBy,
        timestamp: now,
        notes: 'All manufacturing stages, QC, and sign-offs completed. Ready for dispatch.',
      };
      return {
        ...order,
        currentStage: 'COMPLETED' as ProductionStage,
        completionTimestamp: `${dateStr}, ${now}`,
        completedBy,
        lastUpdated: `Today, ${now}`,
        activityHistory: [newActivity, ...order.activityHistory],
        timings: [
          ...order.timings,
          { stage: 'COMPLETED' as const, completedAt: now, worker: completedBy },
        ],
      };
    });
    saveOrders(updated);
  };

  // 11. Resolve Shortage
  const resolveShortage = (orderId: string, materialName: string) => {
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const updatedMaterials = order.materials.map((m) => {
        if (m.material.includes(materialName) || materialName === 'All') {
          return {
            ...m,
            status: 'Ready' as const,
            shortageNote: undefined,
            available: m.required,
          };
        }
        return m;
      });
      const hasAnyShortage = updatedMaterials.some((m) => m.status === 'Shortage');
      return {
        ...order,
        materials: updatedMaterials,
        hasShortage: hasAnyShortage,
        shortageReason: hasAnyShortage ? order.shortageReason : undefined,
        materialStatus: hasAnyShortage ? order.materialStatus : ('Materials Ready' as const),
      };
    });
    saveOrders(updated);
  };

  // 12. Create Production Order from Approved Quotation
  const createProductionOrderFromQuotation = (data: {
    quotationId: string;
    project: string;
    customer: string;
    windowsCount: number;
    doorsCount: number;
    priority?: 'High' | 'Normal' | 'Low';
    dueDate?: string;
  }): ManufacturingOrder => {
    const nextNum = orders.length + 1030;
    const poId = `PO-${nextNum}`;
    const summary = `${data.windowsCount} Windows${data.doorsCount > 0 ? ` + ${data.doorsCount} Door${data.doorsCount > 1 ? 's' : ''}` : ''}`;
    const newOrder: ManufacturingOrder = {
      id: poId,
      project: data.project,
      customer: data.customer,
      quotationId: data.quotationId,
      windowsCount: data.windowsCount,
      doorsCount: data.doorsCount,
      windowsDoorsSummary: summary,
      priority: data.priority || 'Normal',
      currentStage: 'READY',
      materialStatus: 'Ready',
      assignedTo: 'Unassigned',
      dueDate: data.dueDate || '15 Sep',
      lastUpdated: 'Just now',
      readinessChecklist: {
        quotationApproved: true,
        designCompleted: true,
        customerInfoAvailable: true,
        windowConfigurationComplete: true,
        materialsAvailable: true,
        materialsReserved: true,
        productionItemsGenerated: true,
      },
      materials: [
        { material: 'Profile Extrusions', required: '12 m', available: '20 m', status: 'Ready' },
        { material: 'Glass Panes', required: '3.5 m²', available: '8.0 m²', status: 'Ready' },
      ],
      hasShortage: false,
      items: [
        {
          id: 'W01',
          windowId: 'W01',
          name: 'Sliding Window',
          type: 'Sliding Window',
          dimensions: '1800 × 1200 mm',
          width: 1800,
          height: 1200,
          stage: 'READY',
          status: 'Pending',
          cuttingList: createCuttingList('W01', 1800, 1200),
          assemblyChecklist: createAssemblyChecklist('W01'),
          qcChecklist: createQCChecklist('W01', 1800, 1200),
          reworkTasks: [],
        },
      ],
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          action: 'Production Order Created from Approved Quotation',
          user: 'System',
          timestamp: 'Just now',
          notes: `Generated from Quotation ${data.quotationId}`,
        },
      ],
      timings: [{ stage: 'READY', startedAt: 'Just now' }],
    };

    saveOrders([newOrder, ...orders]);
    setSelectedOrderId(poId);
    return newOrder;
  };

  return (
    <ProductionContext.Provider
      value={{
        orders,
        selectedOrderId,
        setSelectedOrderId,
        getOrder,
        startProduction,
        markCutComplete,
        completeCuttingStage,
        markAssemblyTaskComplete,
        completeAssemblyStage,
        passQualityControl,
        failQualityControlAndCreateRework,
        startRework,
        completeRework,
        completeProduction,
        resolveShortage,
        createProductionOrderFromQuotation,
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
};

export const useProduction = () => {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error('useProduction must be used within a ProductionProvider');
  }
  return context;
};
