'use client';

import React, { useState } from 'react';
import { X, Copy, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { ParametricWindowDesign } from '@/lib/design/types';

interface MultipleCopiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseDesign: ParametricWindowDesign;
  onBatchCreate: (copies: { tag: string; room: string; width: number; height: number; qty: number }[]) => void;
}

interface CopyRow {
  id: string;
  tag: string;
  room: string;
  width: number;
  height: number;
  qty: number;
}

export const MultipleCopiesModal: React.FC<MultipleCopiesModalProps> = ({
  isOpen,
  onClose,
  baseDesign,
  onBatchCreate,
}) => {
  const [rows, setRows] = useState<CopyRow[]>([
    {
      id: 'copy-1',
      tag: 'W02',
      room: 'Master Bedroom',
      width: baseDesign.width || 1800,
      height: baseDesign.height || 1200,
      qty: 1,
    },
    {
      id: 'copy-2',
      tag: 'W03',
      room: 'Children Bedroom',
      width: baseDesign.width || 1800,
      height: baseDesign.height || 1200,
      qty: 1,
    },
    {
      id: 'copy-3',
      tag: 'W04',
      room: 'Guest Bedroom',
      width: baseDesign.width || 1800,
      height: baseDesign.height || 1200,
      qty: 1,
    },
  ]);

  if (!isOpen) return null;

  const totalQty = rows.reduce((acc, r) => acc + (Number(r.qty) || 1), 0);
  const totalAreaSqFt = rows.reduce(
    (acc, r) => acc + ((r.width * r.height) / 92903) * (Number(r.qty) || 1),
    0
  ).toFixed(1);

  const handleAddRow = () => {
    const nextNum = rows.length + 2;
    setRows([
      ...rows,
      {
        id: `copy-${Date.now()}`,
        tag: `W0${nextNum}`,
        room: `Room ${nextNum}`,
        width: baseDesign.width || 1800,
        height: baseDesign.height || 1200,
        qty: 1,
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    onBatchCreate(rows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Multiple Copies / Batch Replicate</h3>
              <p className="text-xs text-slate-300">
                Replicate window {baseDesign.id} across multiple rooms and floor openings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rows Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Opening Tag</th>
                  <th className="py-2.5 px-3">Room / Location</th>
                  <th className="py-2.5 px-3">Width (mm)</th>
                  <th className="py-2.5 px-3">Height (mm)</th>
                  <th className="py-2.5 px-3 w-16">Qty</th>
                  <th className="py-2.5 px-3 w-10 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={row.tag}
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[idx].tag = e.target.value;
                          setRows(updated);
                        }}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 text-xs"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={row.room}
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[idx].room = e.target.value;
                          setRows(updated);
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-medium text-slate-800 text-xs"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        value={row.width}
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[idx].width = Number(e.target.value) || 1200;
                          setRows(updated);
                        }}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        value={row.height}
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[idx].height = Number(e.target.value) || 1200;
                          setRows(updated);
                        }}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[idx].qty = Math.max(1, Number(e.target.value) || 1);
                          setRows(updated);
                        }}
                        className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-center text-xs"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={rows.length <= 1}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Opening Copy</span>
          </button>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <span>
              Total Units: <strong className="text-slate-900">{totalQty}</strong>
            </span>
            <span>
              Total Area: <strong className="text-slate-900">{totalAreaSqFt} sq.ft</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create {rows.length} Window Copies</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
