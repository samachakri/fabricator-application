'use client';

import React, { useState } from 'react';
import { Project, QuotationData } from '@/lib/types';
import { useStore } from '@/lib/store';
import { useBranding } from '@/lib/branding-store';
import { WindowCanvas } from '../designer/WindowCanvas';
import { AddWindowModal } from '../modals/AddWindowModal';
import {
  Printer,
  CheckCircle2,
  GitBranch,
  FileCheck,
  ShieldCheck,
  Calendar,
  Share2,
  Mail,
  MessageCircle,
  Plus,
  Edit2,
  Check,
  Percent,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuotationSheetProps {
  project: Project;
  quotation: QuotationData;
}

export const QuotationSheet: React.FC<QuotationSheetProps> = ({
  project,
  quotation,
}) => {
  const { approveQuotation, createQuotationRevision, updateWindow } = useStore();
  const { branding } = useBranding();

  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [revisedDiscount, setRevisedDiscount] = useState(quotation.discountPercent);
  const [isAddWindowOpen, setIsAddWindowOpen] = useState(false);

  // In-line price editing state
  const [editingPriceWindowId, setEditingPriceWindowId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const handlePrint = () => {
    window.print();
  };

  const handleApprove = () => {
    approveQuotation(project.id);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const handleSaveRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNotes.trim()) {
      alert('Please describe what changed in this revision');
      return;
    }

    const newDiscountAmt = Math.round(
      (quotation.subtotal * revisedDiscount) / 100
    );
    const newTaxable = quotation.subtotal - newDiscountAmt;
    const newGst = Math.round((newTaxable * quotation.gstPercent) / 100);
    const newTotal = newTaxable + newGst;

    createQuotationRevision(project.id, revisionNotes, newTotal);
    setShowRevisionModal(false);
    setRevisionNotes('');
  };

  const handleSavePriceEdit = (winId: string) => {
    updateWindow(project.id, winId, { unitPrice: tempPrice });
    setEditingPriceWindowId(null);
  };

  // WhatsApp Share Message Link
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${project.customer.name},\n\nPlease find the commercial quotation for *${project.name}* from *${branding.companyName}*.\n\n` +
      `• Quotation No: ${quotation.id} (v${quotation.version})\n` +
      `• Total Windows: ${project.windows.length} Units\n` +
      `• Grand Total: ₹${quotation.grandTotal.toLocaleString()}\n` +
      `• Advance Required (50%): ₹${quotation.advanceRequired.toLocaleString()}\n\n` +
      `Valid until: ${quotation.validUntil}.\n\nThank you,\n${branding.companyName}\n${branding.phone}`
    );
    const phone = project.customer.phone.replace(/[^0-9]/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, '_blank');
  };

  // Email Share Link
  const handleShareEmail = () => {
    if (!project.customer.email) {
      alert(
        'No email address on file for this client. You can share quotation details directly via WhatsApp or copy the summary.'
      );
      return;
    }
    const subject = encodeURIComponent(
      `Commercial Quotation ${quotation.id} — ${project.name} | ${branding.companyName}`
    );
    const body = encodeURIComponent(
      `Dear ${project.customer.name},\n\nWe are pleased to submit our formal quotation for your project "${project.name}".\n\n` +
      `Quotation Reference: ${quotation.id} (Version ${quotation.version})\n` +
      `Site Address: ${project.siteAddress}\n` +
      `Total Windows / Doors: ${project.windows.length} Units\n` +
      `Grand Total (incl. GST): ₹${quotation.grandTotal.toLocaleString()}\n` +
      `Advance Milestone (50%): ₹${quotation.advanceRequired.toLocaleString()}\n\n` +
      `Please review the attached details and let us know if you have any questions.\n\nWarm regards,\n` +
      `${branding.companyName}\n${branding.phone} | ${branding.email}`
    );
    window.location.href = `mailto:${project.customer.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Action Ribbon (Hidden when printing) */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
        {/* Document details */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0A2E8A] flex items-center justify-center font-bold shrink-0 shadow-sm">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-slate-900 text-sm whitespace-nowrap tracking-tight">
                Quotation {quotation.id}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0A2E8A] whitespace-nowrap">
                Version {quotation.version}.0
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap flex items-center gap-1 ${
                  quotation.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : quotation.status === 'Revised'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-50 text-[#0A2E8A] border border-blue-200'
                }`}
              >
                {quotation.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                {quotation.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">
              {branding.companyName} • Client: <strong className="text-slate-700 font-semibold">{project.customer.name}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Window, Download PDF, WhatsApp, Email, Revise, Approve */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 shrink-0">
          {/* Add Window directly */}
          <button
            onClick={() => setIsAddWindowOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Window</span>
          </button>

          {/* Download PDF / Print */}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Download PDF</span>
          </button>

          {/* Share on WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          {/* Share via Email */}
          <button
            onClick={handleShareEmail}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Email</span>
          </button>

          {/* Create Revision */}
          <button
            onClick={() => setShowRevisionModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
          >
            <GitBranch className="w-3.5 h-3.5 text-slate-500" />
            <span>Revise</span>
          </button>

          {/* Approve */}
          {quotation.status !== 'Approved' && (
            <button
              onClick={handleApprove}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          )}
        </div>
      </div>

      {/* Revision History Log */}
      {quotation.revisions && quotation.revisions.length > 1 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 print:hidden">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Revision History</span>
          </h4>
          <div className="space-y-1.5">
            {quotation.revisions.map((rev) => (
              <div
                key={rev.version}
                className="flex items-center justify-between text-xs bg-white/80 px-3 py-1.5 rounded-lg border border-amber-100"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0A2E8A]">
                    Version {rev.version}
                  </span>
                  <span className="text-slate-500">• {rev.date}</span>
                  <span className="text-slate-700">{rev.notes}</span>
                </div>
                <span className="font-bold text-slate-900 font-mono font-bold">
                  ₹{rev.grandTotal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Branded Document Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-md print:shadow-none print:border-none print:p-0">
        {/* Document Header using Company Branding */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-6 gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#0A2E8A] text-white flex items-center justify-center font-black text-lg shadow-sm">
                {branding.companyName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {branding.companyName}
                </h1>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {branding.tagline}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Factory: {branding.address}
              <br />
              GSTIN: <span className="font-mono font-semibold text-slate-700">{branding.gstin}</span> • Phone: {branding.phone} • Email: {branding.email}
            </p>
          </div>

          <div className="sm:text-right">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
              COMMERCIAL ESTIMATE
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quotation No:{' '}
              <strong className="text-slate-900 font-mono">{quotation.id}</strong> (v
              {quotation.version})
            </p>
            <p className="text-xs text-slate-500">
              Date:{' '}
              <strong className="text-slate-900">
                {quotation.createdAt.split('T')[0]}
              </strong>
            </p>
            <p className="text-xs text-slate-500">
              Valid Until:{' '}
              <strong className="text-slate-900">{quotation.validUntil}</strong>
            </p>
          </div>
        </div>

        {/* Customer & Project Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-secondary">
              Client Details
            </p>
            <h3 className="text-base font-extrabold text-slate-900">
              {project.customer.name}
            </h3>
            <p className="text-slate-600 font-secondary">{project.customer.address}</p>
            <p className="text-slate-600 font-secondary">
              Phone: <strong className="text-slate-800">{project.customer.phone}</strong>
              {project.customer.email ? ` • Email: ${project.customer.email}` : ''}
            </p>
          </div>
          <div className="sm:text-right space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-secondary">
              Project & Site Destination
            </p>
            <h3 className="text-base font-extrabold text-slate-900">{project.name}</h3>
            <p className="text-slate-600 font-secondary">{project.siteAddress}</p>
            <p className="text-slate-600 font-secondary">
              Type: <strong className="text-slate-800">{project.projectType}</strong> • Scope:{' '}
              <strong className="text-slate-800">{project.windows.length} Fabricated Units</strong>
            </p>
          </div>
        </div>

        {/* Schedule of Windows & Technical Drawings Table */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-secondary">
              Schedule of Fabricated Windows & Glazing
            </h3>
            <button
              onClick={() => setIsAddWindowOpen(true)}
              className="text-xs font-bold text-[#0A2E8A] hover:underline flex items-center gap-1 print:hidden"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Window to Quote</span>
            </button>
          </div>

          <div className="space-y-4">
            {project.windows.map((win) => (
              <div
                key={win.id}
                className="border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-6 bg-slate-50/40 hover:bg-slate-50/70 transition-colors"
              >
                {/* Visual CAD Blueprint Thumbnail */}
                <div className="w-36 h-36 bg-white rounded-xl border border-slate-200 p-1 shrink-0 flex items-center justify-center shadow-xs">
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
                    className="w-full h-full"
                  />
                </div>

                {/* Window Specifications */}
                <div className="flex-1 space-y-2.5 text-xs min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-[#0A2E8A] text-white tracking-wider">
                      {win.id}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">
                      {win.name}
                    </h4>
                  </div>

                  {/* Clean 4-Column Specifications Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] text-slate-600 bg-white/80 p-3 rounded-xl border border-slate-200/80 font-secondary">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        Dimensions
                      </span>
                      <strong className="text-slate-900 font-mono text-xs">
                        {win.width} × {win.height} mm
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        Profile System
                      </span>
                      <strong className="text-slate-900">
                        {win.profileBrand} (60mm)
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        Glass Spec
                      </span>
                      <strong className="text-slate-900 capitalize">
                        {win.glassType.replace('_', ' ')}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        Profile Finish
                      </span>
                      <strong className="text-slate-900 capitalize">
                        {win.profileColor.replace('_', ' ')}
                      </strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-secondary">
                    Hardware: Multi-point locking system with EPDM weather gaskets and galvanized steel reinforcement.
                  </p>
                </div>

                {/* Price Column with In-Place Editing */}
                <div className="text-right shrink-0 min-w-[130px] self-center md:self-auto">
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-secondary">
                    Qty: {win.quantity} Unit
                  </p>

                  {editingPriceWindowId === win.id ? (
                    <div className="flex items-center gap-1.5 mt-1 print:hidden">
                      <span className="text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(Number(e.target.value))}
                        className="w-24 px-2 py-0.5 text-xs font-mono font-bold border border-[#0A2E8A] rounded focus:outline-none"
                      />
                      <button
                        onClick={() => handleSavePriceEdit(win.id)}
                        className="p-1 bg-[#0A2E8A] text-white rounded hover:bg-[#08256E]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditingPriceWindowId(win.id);
                        setTempPrice(win.unitPrice);
                      }}
                      title="Click to adjust price"
                      className="cursor-pointer group flex items-center justify-end gap-1 mt-1"
                    >
                      <p className="text-base font-extrabold text-slate-900 font-mono group-hover:text-[#0A2E8A]">
                        ₹{(win.unitPrice * win.quantity).toLocaleString()}
                      </p>
                      <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-[#0A2E8A] print:hidden" />
                    </div>
                  )}
                  <p className="text-[9px] text-slate-400 print:hidden mt-0.5 font-secondary">
                    Click to adjust
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary & Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs">
          {/* Terms & Warranty */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-secondary">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Commercial Terms & Warranty</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-[11px] font-secondary leading-relaxed">
              {quotation.terms.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>

          {/* Pricing Calculation Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Profiles, Glass & Fabrication)</span>
              <span className="font-mono font-medium">
                ₹{quotation.subtotal.toLocaleString()}
              </span>
            </div>

            {/* Discount with Quick Adjust */}
            <div className="flex justify-between items-center text-emerald-600">
              <div className="flex items-center gap-1.5">
                <span>Special Discount ({quotation.discountPercent}%)</span>
                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="text-[10px] text-emerald-700 underline print:hidden"
                >
                  adjust
                </button>
              </div>
              <span className="font-mono font-medium">
                - ₹{quotation.discountAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>GST @ {quotation.gstPercent}%</span>
              <span className="font-mono font-medium">
                ₹{quotation.gstAmount.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-sm text-slate-900">Grand Total</span>
              <span className="text-xl font-black text-[#0A2E8A] font-mono">
                ₹{quotation.grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Advance Required Callout */}
            <div className="mt-3 p-3 rounded-lg bg-blue-50/80 border border-blue-100 flex items-center justify-between text-xs">
              <span className="font-bold text-blue-900">
                50% Advance Required to Release for Cutting:
              </span>
              <span className="font-bold text-sm text-[#0A2E8A] font-mono">
                ₹{quotation.advanceRequired.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Authorized Signature Stamp */}
        <div className="pt-12 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">Customer Acceptance</p>
            <div className="w-44 border-b border-slate-400 mt-8" />
            <p className="text-[10px] mt-1">Signature & Date</p>
          </div>

          <div className="text-right">
            <div className="inline-block p-2 border-2 border-dashed border-[#0A2E8A]/40 rounded-lg mb-2 text-[10px] font-bold text-[#0A2E8A] uppercase">
              {branding.companyName} Certified
            </div>
            <p className="font-semibold text-slate-700">For {branding.companyName}</p>
            <div className="w-44 border-b border-slate-400 mt-6 ml-auto" />
            <p className="text-[10px] mt-1">Authorized Signatory</p>
          </div>
        </div>

        {/* Clean Footer Requirement 2: Powered by XYZ Company */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 font-mono">
          <p>{branding.poweredByText}</p>
        </div>
      </div>

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#0A2E8A]" />
              <span>Create Revision {quotation.version + 1}.0</span>
            </h3>
            <p className="text-xs text-slate-500">
              Create a new quotation version without overwriting previous history.
            </p>

            <form onSubmit={handleSaveRevision} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Revision Reason / Change Log *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Adjusted discount to 8% and updated dimensions per site measurement."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Adjust Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="35"
                  value={revisedDiscount}
                  onChange={(e) => setRevisedDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0A2E8A] hover:bg-[#08256E] rounded-xl shadow-sm"
                >
                  Save Revision v{quotation.version + 1}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Window Modal */}
      <AddWindowModal
        projectId={project.id}
        isOpen={isAddWindowOpen}
        onClose={() => setIsAddWindowOpen(false)}
      />
    </div>
  );
};
