'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { ParametricWindowDesign, WindowComponentType } from '@/lib/design/types';
import {
  convertToParametricDesign,
  convertToStoreWindowDesign,
  createDefaultWindowDesign,
} from '@/lib/design/default-design';
import { DesignHeader } from '@/components/design/DesignHeader';
import { DesignWindowTabs } from '@/components/design/DesignWindowTabs';
import { ParametricDesignCanvas } from '@/components/design/ParametricDesignCanvas';
import { ContextualConfigPanel } from '@/components/design/ContextualConfigPanel';
import { AddComponentAction } from '@/components/design/AddComponentMenu';
import { DesignWelcomeModal } from '@/components/design/DesignWelcomeModal';
import { MultipleCopiesModal } from '@/components/design/MultipleCopiesModal';

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
  } | null>({
    type: 'glass',
    id: 'glass-02',
  });

  // Save status indicator
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modal dialog states
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isMultipleCopiesOpen, setIsMultipleCopiesOpen] = useState(false);

  // Initialize or update parametric design when project or window changes
  useEffect(() => {
    if (project && !rawWindow) {
      const created = addWindow(projectId, {
        name: 'Window 01 (Living Room)',
        type: 'sliding_3track',
        width: 1800,
        height: 1200,
      });
      if (created && created.id !== windowId) {
        router.replace(`/projects/${projectId}/design/${created.id}`);
      }
      return;
    }

    if (rawWindow) {
      const parsed = convertToParametricDesign(rawWindow, projectId);
      // Ensure window id matches route
      parsed.id = rawWindow.id;
      parsed.name = rawWindow.name?.replace(/Window \w+ \((.*)\)/, '$1') || 'Living Room';
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

  // Save & Continue to Quotation
  const handleContinueToQuotation = useCallback(() => {
    if (!design) return;
    handleSaveDesign();

    if (!project?.quotation) {
      generateQuotation(projectId);
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('orderId');
      if (orderId) {
        const saved = localStorage.getItem('fabricator_pro_in_progress_designs');
        if (saved) {
          const inProg: string[] = JSON.parse(saved);
          const filtered = inProg.filter((id) => id !== orderId);
          localStorage.setItem('fabricator_pro_in_progress_designs', JSON.stringify(filtered));
        }
      }
    } catch (e) {
      console.error(e);
    }

    router.push(`/projects/${projectId}/quotation`);
  }, [design, handleSaveDesign, project, projectId, generateQuotation, router]);

  // Handle "+ Add Component" menu actions
  const handleAddComponentAction = useCallback(
    (action: AddComponentAction) => {
      if (!design) return;
      const updated = { ...design };

      if (action === 'add_vertical_division' || action === 'add_mullion') {
        // Split panels further or add a mullion
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
        // Change fixed panels to sliding
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
        updated.defaultMesh = {
          type: 'Fiberglass',
          ratePerSqFt: 60,
        };
        handleUpdateDesign(updated);
      } else if (action === 'add_glass') {
        setSelectedComponent({ type: 'glass', id: 'glass-02' });
      }
    },
    [design, handleUpdateDesign]
  );

  // Switch to another window in the project
  const handleSelectWindow = (id: string) => {
    if (isSaved) {
      router.push(`/projects/${projectId}/design/${id}`);
    } else {
      handleSaveDesign();
      router.push(`/projects/${projectId}/design/${id}`);
    }
  };

  // Add new window to project
  const handleAddWindow = () => {
    if (!project) return;
    const nextIndex = project.windows.length + 1;
    const windowTag = `W0${nextIndex}`;
    const newWin = addWindow(projectId, {
      name: `Window 0${nextIndex} (Bedroom ${nextIndex})`,
      type: 'sliding_3track',
      width: 1800,
      height: 1200,
    });
    if (newWin) {
      router.push(`/projects/${projectId}/design/${newWin.id}`);
    }
  };

  // Delete window from project
  const handleDeleteWindow = (targetId: string) => {
    if (!project) return;
    if (project.windows.length <= 1) {
      alert('At least one window is required for this project.');
      return;
    }
    const targetWin = project.windows.find((w) => w.id === targetId);
    const winLabel = targetWin?.id || targetId;
    if (confirm(`Are you sure you want to delete window ${winLabel}?`)) {
      deleteWindow(projectId, targetId);
      const remaining = project.windows.filter((w) => w.id !== targetId);
      if (remaining.length > 0) {
        router.push(`/projects/${projectId}/design/${remaining[0].id}`);
      }
    }
  };

  // Handle batch copies replication
  const handleBatchCreateCopies = (copies: { tag: string; room: string; width: number; height: number; qty: number }[]) => {
    if (!project || !design) return;
    let lastCreatedId: string | null = null;

    copies.forEach((copy) => {
      const created = addWindow(projectId, {
        name: `Window ${copy.tag} (${copy.room})`,
        type: (rawWindow?.type || 'sliding_3track') as any,
        width: copy.width,
        height: copy.height,
      });
      if (created) lastCreatedId = created.id;
    });

    if (lastCreatedId) {
      router.push(`/projects/${projectId}/design/${lastCreatedId}`);
    }
  };

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
          Loading Parametric Design Engine...
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Initializing SVG geometry, component profiles, and real-time BOM calculations.
        </p>
      </div>
    );
  }

  const allWindowIds = project.windows.map((w) => w.id);
  const tabItems = project.windows.map((w) => ({
    id: w.id,
    name: w.name?.replace(/Window \w+ \((.*)\)/, '$1') || 'Room',
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] min-h-[680px] bg-slate-100 overflow-hidden font-sans">
      {/* 1. Header (50-60px): Project name, Window ID dropdown, Undo/Redo, Save */}
      <DesignHeader
        projectName={project.name}
        windowId={design.id}
        allWindowIds={allWindowIds}
        onSelectWindow={handleSelectWindow}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSaveDesign}
        isSaved={isSaved}
        onOpenWelcome={() => setIsWelcomeModalOpen(true)}
        onOpenMultipleCopies={() => setIsMultipleCopiesOpen(true)}
      />

      {/* 2. Window Switcher Tabs: W01 Living Room, W02 Bedroom, etc. */}
      <DesignWindowTabs
        tabs={tabItems}
        activeWindowId={design.id}
        onSelectTab={handleSelectWindow}
        onAddWindow={handleAddWindow}
        onDeleteTab={handleDeleteWindow}
      />

      {/* 3. Main Workspace: LEFT 60% SVG Technical Drawing / RIGHT 40% Contextual Config & Pricing */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: 60% Parametric SVG Canvas */}
        <div className="w-full lg:w-[60%] h-full relative overflow-hidden bg-white border-r border-slate-200 flex flex-col">
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
          />
        </div>

        {/* Right: 40% Contextual Configuration & Pricing Panel */}
        <div className="w-full lg:w-[40%] h-full overflow-hidden flex flex-col">
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
      </div>

      {/* 4. Welcome Setup Modal */}
      <DesignWelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onBrowseCatalog={() => {
          setIsWelcomeModalOpen(false);
        }}
        onStartNew={(defaults) => {
          handleUpdateDesign({
            ...design,
            profileColor: defaults.color,
          });
        }}
      />

      {/* 5. Multiple Copies / Batch Replication Modal */}
      <MultipleCopiesModal
        isOpen={isMultipleCopiesOpen}
        onClose={() => setIsMultipleCopiesOpen(false)}
        baseDesign={design}
        onBatchCreate={handleBatchCreateCopies}
      />
    </div>
  );
}
