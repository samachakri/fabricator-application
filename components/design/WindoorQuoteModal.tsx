'use client';

import React, { useState } from 'react';
import { X, Printer, Download, Copy, Check, Scissors, Layers } from 'lucide-react';
import { ParametricWindowDesign } from '@/lib/design/types';
import { generateWindoorQuoteData } from '@/lib/design/calculations';

interface WindoorQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: ParametricWindowDesign;
  onProceedToQuotation?: () => void;
}

export const WindoorQuoteModal: React.FC<WindoorQuoteModalProps> = ({
  isOpen,
  onClose,
  design,
  onProceedToQuotation,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'quote' | 'cutting' | 'glass'>('quote');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const quoteData = generateWindoorQuoteData(design);
  const W = design.width || 1800;
  const H = design.height || 1200;
  const archH = design.hasArch ? (design.archHeight || 500) : 0;
  const totalH = design.hasArch ? H + archH : H;

  const handleCopyBOM = () => {
    const text = quoteData.items
      .map((item) => `${item.name}\t₹${item.price}\t${item.count} ${item.unit}\t₹${item.amount}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh]">
        {/* Top Header - Exact WindoorCraft layout with '| quote' and 'close' */}
        <div className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-rose-600 font-black text-lg">|</span>
            <h2 className="text-base font-bold text-slate-900 lowercase tracking-tight">quote</h2>
            <div className="flex items-center gap-1.5 ml-4 bg-slate-100 p-1 rounded-md text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveSubTab('quote')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeSubTab === 'quote' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cost Table
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('cutting')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                  activeSubTab === 'cutting' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scissors className="w-3 h-3" />
                <span>Profile Cut List ({quoteData.profiles.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('glass')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                  activeSubTab === 'glass' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Glass ({quoteData.glassPanes.length})</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyBOM}
              className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
              title="Copy table to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors lowercase cursor-pointer"
            >
              close
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeSubTab === 'quote' && (
            <div>
              {/* Exact WindoorCraft Itemized Table */}
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <th className="py-2.5 px-4 font-medium">name</th>
                      <th className="py-2.5 px-4 font-medium text-right">price</th>
                      <th className="py-2.5 px-4 font-medium text-right">count</th>
                      <th className="py-2.5 px-4 font-medium text-right">amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
                    {quoteData.items.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-slate-800">{row.name}</td>
                        <td className="py-2.5 px-4 text-right font-mono">{row.price.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          {row.count} {row.unit !== 'pcs' ? row.unit : ''}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                          {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                      <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider text-[11px] text-slate-500">
                        Total Amount
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-blue-600">
                        ₹ {quoteData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'cutting' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>
                  Profile cutting list for Window <strong>{design.id || 'W01'}</strong> ({W} × {totalH} mm)
                </span>
                <span className="font-mono">{quoteData.profiles.length} total cutting bars</span>
              </div>
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <th className="py-2.5 px-4">Code</th>
                      <th className="py-2.5 px-4">Component</th>
                      <th className="py-2.5 px-4">Profile Type</th>
                      <th className="py-2.5 px-4 text-right">Cut Length (mm)</th>
                      <th className="py-2.5 px-4 text-center">Cut Angle</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {quoteData.profiles.map((cut, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-semibold text-blue-600">{cut.code}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">{cut.tag}</td>
                        <td className="py-2.5 px-4 text-slate-600 text-[11px]">{cut.name}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{cut.lengthMm}</td>
                        <td className="py-2.5 px-4 text-center font-mono text-xs font-semibold text-amber-600">
                          {cut.cutAngle}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono">{cut.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'glass' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>
                  Glass pane cutting schedule for Window <strong>{design.id || 'W01'}</strong>
                </span>
                <span className="font-mono">{quoteData.glassPanes.length} Glazing Panes</span>
              </div>
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <th className="py-2.5 px-4">Pane Tag</th>
                      <th className="py-2.5 px-4">Glass Spec</th>
                      <th className="py-2.5 px-4 text-right">Width (mm)</th>
                      <th className="py-2.5 px-4 text-right">Height (mm)</th>
                      <th className="py-2.5 px-4 text-right">Area (m²)</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {quoteData.glassPanes.map((g, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">{g.tag}</td>
                        <td className="py-2.5 px-4 text-slate-800 font-medium">{g.spec}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">{g.widthMm}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">{g.heightMm}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-600">{g.areaSqM}</td>
                        <td className="py-2.5 px-4 text-center font-mono">{g.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Window No: <strong>{design.id || 'W01'}</strong> • Series: <strong>{design.seriesName || 'S_CRAFT_PREMIUM_SLIDING_SERIES'}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            {onProceedToQuotation && (
              <button
                type="button"
                onClick={onProceedToQuotation}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-xs transition-colors cursor-pointer"
              >
                Proceed to Project Quotation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
