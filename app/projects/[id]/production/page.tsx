'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { BarCutOptimizer } from '@/components/production/BarCutOptimizer';
import { CuttingListTable } from '@/components/production/CuttingListTable';
import { QCChecklistModal } from '@/components/production/QCChecklistModal';
import {
  ArrowLeft,
  Factory,
  Scissors,
  Layers,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProductionPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { getProject, updateProductionProgress, completeProject } = useStore();
  const project = getProject(projectId);

  const [activeSubTab, setActiveSubTab] = useState<
    'cutting' | 'assembly' | 'glass' | 'hardware'
  >('cutting');
  const [isQCModalOpen, setIsQCModalOpen] = useState(false);

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <Link
          href="/dashboard"
          className="mt-4 inline-block px-4 py-2 bg-[#0A2E8A] text-white rounded-lg text-sm font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const prodOrder = project.productionOrder;

  const handleStageChange = (stage: 'Cutting' | 'Assembly' | 'QC' | 'Completed') => {
    updateProductionProgress(project.id, stage, stage === 'Assembly' ? 50 : 100);
  };

  const handleMarkComplete = () => {
    completeProject(project.id);
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}
  };

  // Glass schedule
  const allGlassPanels = project.windows.flatMap((w) => {
    return (w.calculatedBOM?.glassPanels || []).map((g) => ({
      ...g,
      windowId: w.id,
      windowName: w.name,
    }));
  });

  // Hardware pick-list
  const allHardwareItems = project.windows.flatMap((w) => {
    return (w.calculatedBOM?.hardware || []).map((h) => ({
      ...h,
      windowId: w.id,
      windowName: w.name,
    }));
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Shop Floor Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${projectId}`}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-blue-600 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded">
                {prodOrder?.id || 'PO-PROD'}
              </span>
              <h1 className="text-xl font-bold tracking-tight">
                Shop Floor Production Console
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {prodOrder?.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Project: {project.name} • {project.windows.length} Windows • Assigned
              Operator: <strong>{prodOrder?.allocatedWorker || 'Mahesh (Senior Fabricator)'}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQCModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open QC Inspection</span>
          </button>

          {project.status !== 'Completed' ? (
            <button
              onClick={handleMarkComplete}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Project Completed</span>
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Project Completed & Certified</span>
            </div>
          )}
        </div>
      </div>

      {/* Production Stages Workflow Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        {(['Cutting', 'Assembly', 'QC', 'Completed'] as const).map(
          (stage, idx) => {
            const isCurrent = (prodOrder?.status || 'Cutting') === stage;
            return (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                className={`flex-1 py-2 px-3 text-center rounded-xl text-xs font-bold transition-all mx-1 ${
                  isCurrent
                    ? 'bg-[#0A2E8A] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>
                  {idx + 1}. {stage} Stage
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Sub-Navigation: Cutting Optimizer | Cutting List | Glass Schedule | Hardware */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 w-fit">
        <button
          onClick={() => setActiveSubTab('cutting')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'cutting'
              ? 'bg-white text-[#0A2E8A] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Cutting Schedule & 1D Optimizer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('glass')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'glass'
              ? 'bg-white text-[#0A2E8A] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Glass Cut Schedule ({allGlassPanels.length} Panes)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hardware')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'hardware'
              ? 'bg-white text-[#0A2E8A] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Hardware Pick-List</span>
        </button>
      </div>

      {/* Content based on sub-tab */}
      {activeSubTab === 'cutting' && (
        <div className="space-y-6">
          {/* 1D Visual Cut Optimizer */}
          <BarCutOptimizer windows={project.windows} />

          {/* Precision Cutting Schedule Table */}
          <CuttingListTable
            projectId={project.id}
            windows={project.windows}
          />
        </div>
      )}

      {activeSubTab === 'glass' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Glass Cutting & Glazing Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Aperture sizes with -8mm glazing bridge clearances
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-[#0A2E8A] rounded-full">
              {allGlassPanels.length} Total Panes
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Pane ID</th>
                <th className="px-5 py-3">Window</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3 text-right">Width (mm)</th>
                <th className="px-5 py-3 text-right">Height (mm)</th>
                <th className="px-5 py-3 text-right">Area (sq.ft)</th>
                <th className="px-5 py-3">Specification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {allGlassPanels.map((g, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                    {g.id}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[#0A2E8A]">
                    {g.windowId}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{g.label}</td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold">
                    {g.width} mm
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold">
                    {g.height} mm
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-slate-600">
                    {g.areaSqFt} sq.ft
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0A2E8A] font-semibold text-[11px]">
                      {g.thickness} • {g.glassType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'hardware' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Hardware & Accessories Warehouse Pick-List
            </h3>
            <p className="text-xs text-slate-500">
              Gather all fasteners, rollers, handles and hinges before assembly
            </p>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Item Code</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Allocated Window</th>
                <th className="px-5 py-3 text-center">Required Qty</th>
                <th className="px-5 py-3">Warehouse Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {allHardwareItems.map((h, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-700">
                    {h.code}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {h.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0A2E8A] font-bold text-[10px]">
                      {h.windowId}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono font-bold text-[#0A2E8A]">
                    {h.qty} {h.unit}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    <span className="px-2.5 py-1 rounded bg-slate-100 font-mono text-[11px] text-slate-700 font-semibold">
                      {h.binLocation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QC Modal */}
      <QCChecklistModal
        project={project}
        isOpen={isQCModalOpen}
        onClose={() => setIsQCModalOpen(false)}
      />
    </div>
  );
}
