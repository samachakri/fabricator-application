'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { WindowCanvas } from '@/components/designer/WindowCanvas';
import { AddWindowModal } from '@/components/modals/AddWindowModal';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import {
  Check,
  Plus,
  FileText,
  Banknote,
  Factory,
  Eye,
  Edit3,
  Copy,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ProjectStage } from '@/lib/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const {
    getProject,
    duplicateWindow,
    deleteWindow,
    generateQuotation,
    startProduction,
  } = useStore();

  const project = getProject(projectId);

  const [isAddWindowModalOpen, setIsAddWindowModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">Project ID: {projectId}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block px-4 py-2 bg-[#0A2E8A] text-white rounded-lg text-sm font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Pipeline stages matching Screenshot 2 & 3
  const stages: { id: ProjectStage; label: string; stepNumber: number }[] = [
    { id: 'sales', label: 'Sales', stepNumber: 1 },
    { id: 'design', label: 'Design', stepNumber: 2 },
    { id: 'quotation', label: 'Quotation', stepNumber: 3 },
    { id: 'payment', label: 'Payment', stepNumber: 4 },
    { id: 'production', label: 'Production', stepNumber: 5 },
    { id: 'completed', label: 'Completed', stepNumber: 6 },
  ];

  const currentStageIndex = stages.findIndex(
    (s) => s.id === project.currentStage
  );

  const handleCreateQuotation = () => {
    if (project.windows.length === 0) {
      alert('Please add at least one window before creating a quotation.');
      return;
    }
    generateQuotation(project.id);
    router.push(`/projects/${project.id}/quotation`);
  };

  const handleStartProduction = () => {
    const success = startProduction(project.id);
    if (success) {
      router.push(`/projects/${project.id}/production`);
    }
  };

  const totalPaid = project.payments.reduce((sum, p) => sum + p.amount, 0);
  const advanceRequired =
    project.quotation?.advanceRequired || project.estimatedValue * 0.5;
  const isProductionReady =
    project.quotation?.status === 'Approved' && totalPaid >= advanceRequired;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Project Summary Header Card matching Screenshot 2 & 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {project.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 flex items-center gap-2">
            <span>👤 {project.customer.name}</span>
            <span>•</span>
            <span>🏠 {project.projectType}</span>
            <span>•</span>
            <span>
              🪟{' '}
              {project.windows.length > 0
                ? `${project.windows.length} Windows`
                : '8 Windows'}
            </span>
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            ESTIMATED VALUE
          </p>
          <p className="text-3xl font-black text-[#0A2E8A] mt-0.5 tracking-tight font-mono">
            ₹{project.estimatedValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 2. Horizontal 6-Stage Pipeline Stepper matching Screenshot 2 & 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="relative flex items-center justify-between max-w-4xl mx-auto">
          {/* Background Connecting Line */}
          <div className="absolute left-6 right-6 top-5 h-0.5 bg-slate-200 -z-0" />

          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={stage.id}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
                onClick={() => {
                  if (stage.id === 'quotation' && project.quotation) {
                    router.push(`/projects/${project.id}/quotation`);
                  } else if (stage.id === 'production' && project.productionOrder) {
                    router.push(`/projects/${project.id}/production`);
                  }
                }}
              >
                {/* Circle Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isCompleted
                      ? 'bg-[#0A2E8A] text-white shadow-md'
                      : isCurrent
                      ? 'bg-white border-2 border-[#0A2E8A] text-[#0A2E8A] ring-4 ring-blue-50 shadow-sm'
                      : 'bg-white border border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    stage.stepNumber
                  )}
                </div>

                {/* Stage Label */}
                <span
                  className={`text-xs mt-3 font-medium transition-colors ${
                    isCurrent
                      ? 'text-[#0A2E8A] font-bold'
                      : isCompleted
                      ? 'text-slate-800 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Action Cards Row matching Screenshot 2 & 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* + Add Window (Filled Royal Blue) */}
        <button
          onClick={() => setIsAddWindowModalOpen(true)}
          className="bg-[#0A2E8A] hover:bg-[#08256E] text-white p-5 rounded-2xl shadow-sm transition-all hover:shadow hover:scale-[1.01] flex flex-col items-center justify-center gap-2 group text-center"
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold tracking-wide">+ Add Window</span>
        </button>

        {/* Create Quotation (White Card Outline) */}
        <button
          onClick={handleCreateQuotation}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 p-5 rounded-2xl shadow-sm transition-all hover:shadow flex flex-col items-center justify-center gap-2 group text-center"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0A2E8A]">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">
            {project.quotation ? 'View / Edit Quotation' : 'Create Quotation'}
          </span>
        </button>

        {/* Record Payment (White Card Outline) */}
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 p-5 rounded-2xl shadow-sm transition-all hover:shadow flex flex-col items-center justify-center gap-2 group text-center"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
            <Banknote className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">Record Payment</span>
        </button>

        {/* Start Production (White Card Outline / Enabled when advance received) */}
        <button
          onClick={handleStartProduction}
          disabled={!isProductionReady}
          title={
            !isProductionReady
              ? 'Requires Approved Quotation and 50% Advance Payment'
              : 'Dispatches cutting orders to shop floor'
          }
          className={`p-5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 text-center ${
            isProductionReady
              ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-[#0A2E8A] text-[#0A2E8A] shadow-sm hover:shadow cursor-pointer'
              : 'bg-slate-50/70 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isProductionReady
                ? 'bg-purple-50 text-purple-700'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <Factory className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">
            {project.productionOrder ? 'Open Shop Floor' : 'Start Production'}
          </span>
        </button>
      </div>

      {/* 4. Windows List Section matching Screenshot 2 & 3 */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Windows ({project.windows.length})
          </h2>
          <button
            onClick={() => setIsAddWindowModalOpen(true)}
            className="text-xs font-bold text-[#0A2E8A] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Window</span>
          </button>
        </div>

        {project.windows.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
            <p className="text-slate-500 text-sm">
              No windows configured in this project yet.
            </p>
            <button
              onClick={() => setIsAddWindowModalOpen(true)}
              className="px-5 py-2.5 bg-[#0A2E8A] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#08256E] transition-all"
            >
              + Design First Window
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.windows.map((win) => (
              <div
                key={win.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Blueprint Drawing Header Thumbnail */}
                <div className="h-56 bg-slate-50/80 p-4 border-b border-slate-100 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-50 transition-colors">
                  <WindowCanvas
                    type={win.type}
                    width={win.width}
                    height={win.height}
                    profileBrand={win.profileBrand}
                    profileColor={win.profileColor}
                    glassType={win.glassType}
                    meshType={win.meshType}
                    mode="blueprint"
                    showDimensions={false}
                    className="w-full h-full max-h-48"
                  />
                  <div className="absolute top-3 left-3 bg-[#0A2E8A] text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                    {win.id}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base">
                      {win.name}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0A2E8A]">
                      {win.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Size:</span>
                      <strong className="text-slate-800 font-mono">
                        {win.width} × {win.height} mm
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Profile:</span>
                      <strong className="text-slate-800">{win.profileBrand}</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="capitalize">
                      Glass: {win.glassType.replace('_', ' ')}
                    </span>
                    <strong className="text-slate-900 font-mono">
                      ₹{win.unitPrice?.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Footer Actions matching Screenshot: View | Edit | Duplicate */}
                <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/50 text-xs">
                  <Link
                    href={`/projects/${project.id}/design/${win.id}?mode=view`}
                    className="py-2.5 text-center text-slate-600 hover:text-[#0A2E8A] hover:bg-slate-100 font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>

                  <Link
                    href={`/projects/${project.id}/design/${win.id}`}
                    className="py-2.5 text-center text-slate-600 hover:text-[#0A2E8A] hover:bg-slate-100 font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => duplicateWindow(project.id, win.id)}
                    className="py-2.5 text-center text-slate-600 hover:text-[#0A2E8A] hover:bg-slate-100 font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Window Modal */}
      <AddWindowModal
        projectId={project.id}
        isOpen={isAddWindowModalOpen}
        onClose={() => setIsAddWindowModalOpen(false)}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        project={project}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}
