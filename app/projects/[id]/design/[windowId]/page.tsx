'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { ParametricWindowDesign, WindowComponentType } from '@/lib/design/types';
import {
  convertToParametricDesign,
  convertToStoreWindowDesign,
  createBlankWindowDesign,
} from '@/lib/design/default-design';
import { ParametricDesignCanvas } from '@/components/design/ParametricDesignCanvas';
import { ContextualConfigPanel } from '@/components/design/ContextualConfigPanel';
import { AddComponentAction } from '@/components/design/AddComponentMenu';
import {
  Undo2,
  Redo2,
  Trash2,
  Sparkles,
  Save,
  Check,
  Box,
  X,
  Layers,
} from 'lucide-react';

export default function WindowDesignerPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const windowId = params.windowId as string;

  const {
    getProject,
    getWindow,
    addWindow,
    updateWindow,
    deleteWindow,
    generateQuotation,
  } = useStore();

  const project = getProject(projectId);
  const rawWindow = getWindow(projectId, windowId);

  // Active parametric design state
  const [design, setDesign] = useState<ParametricWindowDesign | null>(null);

  // Undo / Redo history stack
  const [history, setHistory] = useState<ParametricWindowDesign[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Selected component in canvas / inspector
  const [selectedComponent, setSelectedComponent] = useState<{
    type: WindowComponentType;
    id: string;
    subId?: string;
  } | null>(null);

  // Save status indicator
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Configuration panel state (always visible like WindoorCraft)
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(true);

  // Initialize or update parametric design when project or window changes
  useEffect(() => {
    if (project && !rawWindow) {
      const created = addWindow(projectId, {
        name: 'W01',
        type: 'sliding_3track',
        width: 0,
        height: 0,
      });
      if (created && created.id !== windowId) {
        router.replace(`/projects/${projectId}/design/${created.id}`);
      }
      return;
    }

    if (rawWindow) {
      const parsed = convertToParametricDesign(rawWindow, projectId);
      parsed.id = rawWindow.id;
      parsed.name = rawWindow.name || rawWindow.id;
      setDesign(parsed);
      setHistory([parsed]);
      setHistoryIndex(0);
      setIsSaved(true);
    }
  }, [projectId, windowId, rawWindow?.id]);

  // Update design with undo/redo history tracking
  const handleUpdateDesign = useCallback(
    (newDesign: ParametricWindowDesign, addToHistory = true) => {
      setDesign(newDesign);
      setIsSaved(false);

      if (addToHistory) {
        setHistory((prev) => {
          const upToCurrent = prev.slice(0, historyIndex + 1);
          return [...upToCurrent, newDesign];
        });
        setHistoryIndex((prev) => prev + 1);
      }
    },
    [historyIndex]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setDesign(history[nextIndex]);
      setIsSaved(false);
    }
  }, [historyIndex, history]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setDesign(history[nextIndex]);
      setIsSaved(false);
    }
  }, [historyIndex, history]);

  // Save design to persistent store
  const handleSaveDesign = useCallback(() => {
    if (!design) return;
    setIsSaving(true);
    const storePayload = convertToStoreWindowDesign(design);
    updateWindow(projectId, windowId, storePayload);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
    }, 400);
  }, [design, projectId, windowId, updateWindow]);

  // Delete / Clear Canvas
  const handleDeleteCanvas = useCallback(() => {
    if (!design) return;
    handleUpdateDesign({
      ...design,
      panels: [],
      mullions: [],
      transoms: [],
      hasArch: false,
      archHeight: 0,
      width: 0,
      height: 0,
    });
    setSelectedComponent(null);
  }, [design, handleUpdateDesign]);

  // Clean: Reset to defaults but keep dimensions
  const handleCleanCanvas = useCallback(() => {
    if (!design) return;
    handleUpdateDesign({
      ...design,
      panels: [],
      mullions: [],
      transoms: [],
      hasArch: false,
      archHeight: 0,
    });
    setSelectedComponent(null);
  }, [design, handleUpdateDesign]);

  // Save & Continue to Quotation
  const handleContinueToQuotation = useCallback(() => {
    if (!design) return;
    handleSaveDesign();

    if (!project?.quotation) {
      generateQuotation(projectId);
    }

    router.push(`/projects/${projectId}/quotation`);
  }, [design, handleSaveDesign, project, projectId, generateQuotation, router]);

  // Handle "+ Add Component" menu actions
  const handleAddComponentAction = useCallback(
    (action: AddComponentAction) => {
      if (!design) return;
      const updated = { ...design };

      if (action === 'add_vertical_division' || action === 'add_mullion') {
        const count = updated.panels.length + 1;
        const newPanels = [];
        const newMullions = [];
        for (let i = 0; i < count; i++) {
          newPanels.push({
            id: `panel-0${i + 1}`,
            name: `Panel 0${i + 1}`,
            panelType: i === 0 ? ('fixed' as const) : ('sliding' as const),
            openingDirection:
              i === 0
                ? ('fixed' as const)
                : i % 2 === 1
                ? ('sliding_right' as const)
                : ('sliding_left' as const),
            xRatio: i / count,
            widthRatio: 1 / count,
            sashId: i === 0 ? undefined : `sash-0${i + 1}`,
            glassId: `glass-0${i + 1}`,
          });
          if (i > 0) {
            newMullions.push({
              id: `mullion-0${i}`,
              positionRatio: i / count,
              width: 60,
            });
          }
        }
        updated.panels = newPanels;
        updated.mullions = newMullions;
        handleUpdateDesign(updated);
      } else if (action === 'add_horizontal_division' || action === 'add_transom') {
        if (updated.transoms.length === 0) {
          updated.transoms = [{ id: 'transom-01', positionRatio: 0.35, height: 60 }];
          handleUpdateDesign(updated);
        }
      } else if (action === 'add_sash' || action === 'add_sliding_panel') {
        const modifiedPanels = updated.panels.map((p) => {
          if (p.panelType === 'fixed') {
            return {
              ...p,
              panelType: 'sliding' as const,
              openingDirection: 'sliding_right' as const,
              sashId: `sash-${p.id}`,
            };
          }
          return p;
        });
        updated.panels = modifiedPanels;
        handleUpdateDesign(updated);
      } else if (action === 'add_fixed_panel') {
        const modifiedPanels = updated.panels.map((p, idx) => {
          if (idx === 0) {
            return {
              ...p,
              panelType: 'fixed' as const,
              openingDirection: 'fixed' as const,
              sashId: undefined,
            };
          }
          return p;
        });
        updated.panels = modifiedPanels;
        handleUpdateDesign(updated);
      } else if (action === 'add_mesh') {
        updated.defaultMesh = { type: 'Fiberglass', ratePerSqFt: 60 };
        handleUpdateDesign(updated);
      } else if (action === 'add_glass') {
        setSelectedComponent({ type: 'glass', id: 'glass-02' });
      }
    },
    [design, handleUpdateDesign]
  );

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">
          The requested project could not be found or has been removed.
        </p>
        <Link
          href="/sales"
          className="mt-4 px-4 py-2 bg-[#1B64F2] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Return to Sales & Leads
        </Link>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <div className="w-12 h-12 border-4 border-[#1B64F2] border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800">
          Loading Design Engine...
        </h3>
      </div>
    );
  }

  const hasElements = (design.panels || []).length > 0 || Boolean(design.hasArch);
  const areaSqM = design.width > 0 && design.height > 0
    ? ((design.width * design.height) / 1_000_000).toFixed(4)
    : '0.0000';
  const openingsCount = (design.panels || []).length;
  const seriesName = design.seriesName || 'S_CRAFT_PREMIUM_SLIDING_SERIES';

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] min-h-[680px] bg-white overflow-hidden font-sans">
      {/* ================================================================= */}
      {/* 1. WINDOORCRAFT TOP TOOLBAR                                       */}
      {/* ================================================================= */}
      <header className="h-auto bg-white border-b border-slate-200 select-none z-30 shrink-0">
        {/* Row 1: Logo + Toolbar Actions */}
        <div className="h-11 px-3 flex items-center justify-between border-b border-slate-100">
          {/* Left: Logo */}
          <Link
            href="/design"
            className="flex items-center gap-2 group shrink-0"
            title="Back to Design Queue"
          >
            <div className="w-7 h-7 rounded bg-[#1B64F2] text-white flex items-center justify-center shadow-xs group-hover:bg-[#1652C7] transition-colors">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight hidden sm:inline">
              Design Studio
            </span>
          </Link>

          {/* Center: WindoorCraft Action Buttons */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">undo</span>
            </button>

            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">redo</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteCanvas}
              disabled={!hasElements}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30 transition-colors cursor-pointer"
              title="Delete all elements from canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">delete</span>
            </button>

            <button
              type="button"
              onClick={handleCleanCanvas}
              disabled={!hasElements}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded disabled:opacity-30 transition-colors cursor-pointer"
              title="Clean canvas (reset panels, keep frame)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">clean</span>
            </button>

            <button
              type="button"
              onClick={handleSaveDesign}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
              title="Save design (Ctrl+S)"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline text-emerald-600">save</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">save</span>
                </>
              )}
            </button>
          </div>

          {/* Right: 3D toggle + Close */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                showConfigPanel
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle inspector panel"
            >
              <Box className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D</span>
            </button>

            <Link
              href={`/projects/${projectId}`}
              className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Close design and return to project"
            >
              <X className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Row 2: Series Breadcrumb (red text, centered) */}
        <div className="h-7 flex items-center justify-center bg-white">
          <span className="text-xs font-medium text-red-500 font-mono tracking-wide">
            {seriesName}/{areaSqM}m²/{openingsCount} openings
          </span>
        </div>
      </header>

      {/* ================================================================= */}
      {/* 2. MAIN WORKSPACE: Canvas (left) + Config Panel (right)           */}
      {/* ================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Parametric CAD Canvas (includes DraggableShapePalette inside) */}
        <div
          className={`flex-1 h-full relative overflow-hidden bg-white flex flex-col transition-all duration-200`}
        >
          <ParametricDesignCanvas
            design={design}
            selectedComponentId={selectedComponent?.id || null}
            onSelectComponent={(id, type) => {
              if (id) {
                setSelectedComponent({
                  type: type || 'glass',
                  id,
                });
              } else {
                setSelectedComponent(null);
              }
            }}
            onAddComponentAction={handleAddComponentAction}
            onDimensionChange={(width, height) => {
              handleUpdateDesign({
                ...design,
                width,
                height,
              });
            }}
            onUpdateDesign={(updated) => handleUpdateDesign(updated)}
            isConfigPanelOpen={showConfigPanel}
            onToggleConfigPanel={() => setShowConfigPanel(!showConfigPanel)}
          />
        </div>

        {/* Right: WindoorCraft Config Panel (always visible, order/color tabs) */}
        {showConfigPanel && (
          <div className="w-[320px] lg:w-[340px] h-full overflow-hidden flex flex-col border-l border-slate-200 bg-white transition-all duration-200 shrink-0 z-20">
            <ContextualConfigPanel
              design={design}
              selectedComponent={selectedComponent}
              onSelectComponent={(comp) => setSelectedComponent(comp)}
              onUpdateDesign={(updated) => handleUpdateDesign(updated)}
              onSaveDesign={handleSaveDesign}
              onContinueToQuotation={handleContinueToQuotation}
              isSaving={isSaving}
            />
          </div>
        )}
      </div>
    </div>
  );
}
