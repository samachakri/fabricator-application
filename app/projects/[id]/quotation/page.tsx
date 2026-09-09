'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { QuotationSheet } from '@/components/quotation/QuotationSheet';
import { ArrowLeft, FilePlus, AlertCircle } from 'lucide-react';

export default function QuotationPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { getProject, generateQuotation } = useStore();
  const project = getProject(projectId);

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

  const handleGenerateNow = () => {
    generateQuotation(project.id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-3 print:hidden">
        <Link
          href={`/projects/${projectId}`}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Quotation & Commercial Proposal
          </h1>
          <p className="text-xs text-slate-500">
            Project: {project.name} ({project.id}) • Client: {project.customer.name}
          </p>
        </div>
      </div>

      {/* If quotation exists, render QuotationSheet */}
      {project.quotation ? (
        <QuotationSheet project={project} quotation={project.quotation} />
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0A2E8A] flex items-center justify-center mx-auto">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Generate Auto-Quotation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              FabricatorPro will calculate profiles, glass, steel, hardware,
              labor, and taxes across all {project.windows.length} windows.
            </p>
          </div>
          <button
            onClick={handleGenerateNow}
            className="px-6 py-2.5 bg-[#0A2E8A] hover:bg-[#08256E] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
          >
            Generate Auto-Quotation Now
          </button>
        </div>
      )}
    </div>
  );
}
