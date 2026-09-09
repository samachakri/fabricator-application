'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Project } from '@/lib/types';
import { X, CheckCircle2, AlertOctagon, Wrench, ShieldCheck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QCChecklistModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const QCChecklistModal: React.FC<QCChecklistModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { updateQCStatus } = useStore();

  const [checklist, setChecklist] = useState({
    dimensionsVerified: true,
    weldsCleaned: true,
    reinforcementChecked: true,
    glassGasketsTight: true,
    hardwareSmoothAction: true,
    protectiveFilmIntact: true,
  });

  const [notes, setNotes] = useState(
    'All tolerances verified within ±1.5mm. Smooth friction hinge action and clean miter corners.'
  );

  if (!isOpen) return null;

  const toggleItem = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const handlePass = () => {
    updateQCStatus(project.id, true, checklist, notes);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
    onClose();
  };

  const handleRework = () => {
    updateQCStatus(
      project.id,
      false,
      checklist,
      notes || 'QC Failed: Window sent back for adjustment/rework.'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">
                Quality Control (QC) Inspector
              </h2>
              <p className="text-xs text-slate-500">
                Verify fabrication standards before packing & dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Checklist */}
        <div className="p-6 space-y-4">
          <div className="space-y-2.5">
            {[
              {
                key: 'dimensionsVerified',
                title: 'Diagonal & Outer Dimensions Check',
                desc: 'Outer width, height and diagonal variance within ±1.5 mm tolerance',
              },
              {
                key: 'weldsCleaned',
                title: 'Corner Weld Groove & Seam Cleaning',
                desc: 'Clean 90°/45° welded beads, flush CNC or manual groover finish',
              },
              {
                key: 'reinforcementChecked',
                title: 'Internal Steel Reinforcement',
                desc: 'Galvanized steel inserted & fastened with counter-sunk screws',
              },
              {
                key: 'glassGasketsTight',
                title: 'EPDM Rubber Gaskets & Glazing Beads',
                desc: 'Beads tightly snapped into rebate with continuous weather seal',
              },
              {
                key: 'hardwareSmoothAction',
                title: 'Hardware, Rollers & Locking Action',
                desc: 'Multi-point espagnolette locking pins fully engage into keepers',
              },
              {
                key: 'protectiveFilmIntact',
                title: 'Protective Film & Surface Finish',
                desc: 'No scratches, chips, or dents; manufacturer film intact',
              },
            ].map((item) => {
              const checked = checklist[item.key as keyof typeof checklist];
              return (
                <div
                  key={item.key}
                  onClick={() => toggleItem(item.key as any)}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    checked
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      checked
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300'
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        checked ? 'text-emerald-950' : 'text-slate-800'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspector Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Inspector Sign-off Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRework}
              className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Flag for Rework</span>
            </button>

            <button
              type="button"
              disabled={!allChecked}
              onClick={handlePass}
              className={`px-6 py-2 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all ${
                allChecked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:shadow'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Pass QC & Stamp Complete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
