'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { WindowType, ProfileBrand } from '@/lib/types';
import { X, Plus, Layers, Sliders } from 'lucide-react';

interface AddWindowModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddWindowModal: React.FC<AddWindowModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const { addWindow } = useStore();
  const router = useRouter();

  const [type, setType] = useState<WindowType>('sliding_2track');
  const [name, setName] = useState('2 Track Sliding');
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1500);
  const [profileBrand, setProfileBrand] = useState<ProfileBrand>('VEKA');

  if (!isOpen) return null;

  const handleTypeSelect = (selectedType: WindowType, label: string) => {
    setType(selectedType);
    setName(label);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addWindow(projectId, {
      name,
      type,
      width,
      height,
      profileBrand,
      profileSeries: `${profileBrand} 84BS`,
      tracks: type === 'sliding_3track' ? 3 : type === 'sliding_2track' ? 2 : 1,
      sashes: type === 'sliding_3track' ? 3 : type === 'casement_double' ? 2 : type === 'casement_single' ? 1 : 2,
    });

    onClose();
    if (created) {
      router.push(`/projects/${projectId}/design/${created.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0A2E8A] flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Add Window / Door</h2>
              <p className="text-xs text-slate-500">
                Choose window configuration archetype
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

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {/* Window Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Window Archetype
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sliding_2track', label: '2 Track Sliding' },
                { id: 'sliding_3track', label: '3 Track Sliding' },
                { id: 'casement_single', label: 'Casement Window' },
                { id: 'casement_double', label: 'French Double Casement' },
                { id: 'fixed', label: 'Fixed Window' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeSelect(t.id as WindowType, t.label)}
                  className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all ${
                    type === t.id
                      ? 'bg-blue-50 border-[#0A2E8A] text-[#0A2E8A] ring-1 ring-[#0A2E8A]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Brand */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Profile Brand System
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['VEKA', 'REHAU', 'KOMMERLING'] as ProfileBrand[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setProfileBrand(b)}
                  className={`py-2 text-center rounded-xl text-xs font-bold transition-all border ${
                    profileBrand === b
                      ? 'bg-[#0A2E8A] text-white border-[#0A2E8A]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Initial Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Width (mm)
              </label>
              <input
                type="number"
                min="400"
                max="3500"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Height (mm)
              </label>
              <input
                type="number"
                min="400"
                max="3000"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#0A2E8A] hover:bg-[#08256E] rounded-xl shadow-sm transition-all hover:shadow"
            >
              Add & Open CAD Designer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
