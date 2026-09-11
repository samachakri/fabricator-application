'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useBranding } from '@/lib/branding-store';
import { WindowCanvas } from '@/components/designer/WindowCanvas';
import { WindowControls } from '@/components/designer/WindowControls';
import { RoomVisualizer } from '@/components/designer/RoomVisualizer';
import {
  ArrowLeft,
  Save,
  Eye,
  Layers,
  Copy,
  Trash2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FileText,
  Plus,
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
    duplicateWindow,
    deleteWindow,
    generateQuotation,
  } = useStore();
  const { branding } = useBranding();

  const project = getProject(projectId);
  const windowDesign = getWindow(projectId, windowId);

  const [activeTab, setActiveTab] = useState<'blueprint' | 'realistic' | 'room'>(
    'blueprint'
  );

  React.useEffect(() => {
    if (project && !windowDesign) {
      const created = addWindow(projectId, {
        name: 'Window 01 (2 Track Sliding)',
        type: 'sliding_2track',
        width: 1500,
        height: 1200,
      });
      if (created && created.id !== windowId) {
        router.replace(`/projects/${projectId}/design/${created.id}`);
      }
    }
  }, [project, windowDesign, projectId, windowId, addWindow, router]);

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <Link
          href="/sales"
          className="mt-4 inline-block px-4 py-2 bg-[#0A2E8A] text-white rounded-lg text-sm font-semibold"
        >
          Return to Sales & Leads
        </Link>
      </div>
    );
  }

  if (!windowDesign) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-[#0A2E8A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Initializing 2D CAD Canvas & Dimensions...</p>
      </div>
    );
  }

  const handleUpdate = (updates: any) => {
    updateWindow(projectId, windowId, updates);
  };

  const handleNextQuotation = () => {
    if (!project.quotation) {
      generateQuotation(projectId);
    }
    router.push(`/projects/${projectId}/quotation`);
  };

  const handleDuplicate = () => {
    const dup = duplicateWindow(projectId, windowId);
    if (dup) {
      router.push(`/projects/${projectId}/design/${dup.id}`);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete window ${windowDesign.id}?`)) {
      deleteWindow(projectId, windowId);
      const remaining = project.windows.filter((w) => w.id !== windowId);
      if (remaining.length > 0) {
        router.push(`/projects/${projectId}/design/${remaining[0].id}`);
      } else {
        router.push('/design');
      }
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Sleek, Compact Top Navigation Ribbon (No screen clutter) */}
      <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Back button directly to Design Studio */}
          <Link
            href="/design"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#0A2E8A] transition-colors text-xs font-bold"
            title="Back to Design Studio"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Design Studio</span>
          </Link>

          {/* Window Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {project.windows.map((w) => (
              <button
                key={w.id}
                onClick={() => router.push(`/projects/${projectId}/design/${w.id}`)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  w.id === windowId
                    ? 'bg-white text-[#0A2E8A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="font-mono">{w.id}</span>
                <span className="hidden md:inline text-[11px] font-normal opacity-80">
                  {w.name.replace(/Window \d+ \((.*)\)/, '$1')}
                </span>
              </button>
            ))}
            <button
              onClick={() => {
                const nextNum = project.windows.length + 1;
                const newWin = addWindow(projectId, {
                  name: `Window 0${nextNum} (2 Track Sliding)`,
                  type: 'sliding_2track',
                  width: 1500,
                  height: 1200,
                });
                if (newWin) {
                  router.push(`/projects/${projectId}/design/${newWin.id}`);
                }
              }}
              className="p-1 px-2 text-slate-600 hover:text-[#0A2E8A] hover:bg-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              title="Add another window"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Window</span>
            </button>
          </div>

          <span className="text-slate-300 text-xs hidden lg:inline">•</span>
          <span className="text-xs text-slate-500 truncate max-w-xs hidden lg:inline font-medium">
            {project.name}
          </span>
        </div>

        {/* Small, Non-intrusive View Mode Pills & Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Pills */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('blueprint')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'blueprint'
                  ? 'bg-white text-[#0A2E8A] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              CAD Blueprint
            </button>
            <button
              onClick={() => setActiveTab('realistic')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'realistic'
                  ? 'bg-white text-[#0A2E8A] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Realistic 2D
            </button>
            <button
              onClick={() => setActiveTab('room')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeTab === 'room'
                  ? 'bg-[#0A2E8A] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Room Mockup</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* Duplicate & Delete */}
          <button
            onClick={handleDuplicate}
            title="Duplicate"
            className="p-1.5 text-slate-500 hover:text-[#0A2E8A] hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Delete"
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Direct Next Button: Proceed to Quotation */}
          <button
            onClick={handleNextQuotation}
            className="px-4 py-1.5 bg-[#0A2E8A] hover:bg-[#08256E] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <span>Next: Quotation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Designer Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm min-h-[560px] flex flex-col justify-between">
            {activeTab === 'room' ? (
              <RoomVisualizer windowDesign={windowDesign} />
            ) : (
              <div className="w-full h-[500px] flex items-center justify-center">
                <WindowCanvas
                  type={windowDesign.type}
                  width={windowDesign.width}
                  height={windowDesign.height}
                  profileBrand={windowDesign.profileBrand}
                  profileColor={windowDesign.profileColor}
                  glassType={windowDesign.glassType}
                  meshType={windowDesign.meshType}
                  openingDirection={windowDesign.openingDirection}
                  mode={activeTab}
                  showDimensions={true}
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Bottom Specs Strip */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3 text-[11px]">
                <span>
                  Profile: <strong className="text-slate-800">{windowDesign.profileBrand} 60mm</strong>
                </span>
                <span>•</span>
                <span>
                  Tolerance: <strong className="text-slate-800">±1.0 mm</strong>
                </span>
                <span>•</span>
                <span>
                  Welding: <strong className="text-slate-800">+6 mm</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Parametric Real-time BOM Synced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Step-by-Step Configurator Controls (4 Cols) */}
        <div className="lg:col-span-4">
          <WindowControls
            design={windowDesign}
            onChange={handleUpdate}
            onNext={handleNextQuotation}
          />
        </div>
      </div>
    </div>
  );
}
