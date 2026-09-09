'use client';

import React, { useState } from 'react';
import { ProfileColor, WindowDesign } from '@/lib/types';
import { WindowCanvas } from './WindowCanvas';
import { Home, Eye, Sparkles, SunMedium } from 'lucide-react';

interface RoomVisualizerProps {
  windowDesign: WindowDesign;
}

const ROOM_BACKGROUNDS = [
  {
    id: 'living_room',
    name: 'Modern Living Room',
    wallColor: '#F4EFEA', // warm plaster
    floorColor: '#C4A482', // warm oak
    scenery: 'garden',
  },
  {
    id: 'luxury_villa',
    name: 'Luxury Villa Suite',
    wallColor: '#E2E8F0', // cool slate
    floorColor: '#475569', // grey marble
    scenery: 'skyline',
  },
  {
    id: 'warm_brick',
    name: 'Contemporary Facade',
    wallColor: '#DDD6FE', // twilight interior
    floorColor: '#3B82F6', // pool deck
    scenery: 'patio',
  },
];

export const RoomVisualizer: React.FC<RoomVisualizerProps> = ({ windowDesign }) => {
  const [selectedBg, setSelectedBg] = useState(ROOM_BACKGROUNDS[0]);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'golden_hour' | 'night'>('day');

  const sceneryBackgrounds = {
    garden:
      'linear-gradient(to bottom, #7dd3fc, #bae6fd 60%, #86efac 60%, #4ade80 100%)',
    skyline:
      'linear-gradient(to bottom, #60a5fa, #93c5fd 65%, #94a3b8 65%, #cbd5e1 100%)',
    patio:
      'linear-gradient(to bottom, #fde047, #fed7aa 50%, #86efac 70%, #22c55e 100%)',
  };

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col h-full">
      {/* Top Controls Bar */}
      <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2 font-semibold">
          <Eye className="w-4 h-4 text-amber-400" />
          <span>Architectural Visualizer — Customer 3D Context Mockup</span>
        </div>

        {/* Room Theme Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {ROOM_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setSelectedBg(bg)}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                selectedBg.id === bg.id
                  ? 'bg-[#0A2E8A] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {bg.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visualizer Stage */}
      <div
        className="relative flex-1 p-8 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: selectedBg.wallColor }}
      >
        {/* Wall Molding / Interior Lighting Glow */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.25)]" />

        {/* Wall Art on Left */}
        <div className="absolute left-8 top-16 w-24 h-36 bg-slate-800/20 border-4 border-white/60 rounded shadow-md hidden lg:block" />

        {/* Indoor Plant Silhouette on Right */}
        <div className="absolute right-10 bottom-12 w-28 h-52 bg-emerald-900/25 rounded-t-full blur-[1px] hidden lg:block" />

        {/* Baseboard & Floor line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 border-t-4 border-white/40 shadow-inner"
          style={{ backgroundColor: selectedBg.floorColor }}
        >
          {/* Wood plank lines */}
          <div className="w-full h-full opacity-15 flex">
            <div className="flex-1 border-r border-black" />
            <div className="flex-1 border-r border-black" />
            <div className="flex-1 border-r border-black" />
            <div className="flex-1 border-r border-black" />
          </div>
        </div>

        {/* Aperture Reveal & Window Frame Assembly */}
        <div className="relative z-10 max-w-2xl w-full max-h-[480px] p-5 bg-white/70 backdrop-blur-sm rounded-xl border-4 border-white/90 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center">
          {/* Outdoor Scenery Background Behind Glass */}
          <div
            className="absolute inset-4 rounded-lg overflow-hidden -z-10 shadow-inner"
            style={{
              background:
                sceneryBackgrounds[
                  selectedBg.scenery as keyof typeof sceneryBackgrounds
                ],
            }}
          >
            {/* Distant Trees or Clouds */}
            <div className="absolute bottom-0 w-full h-1/3 bg-emerald-700/20 rounded-t-full blur-md" />
            <div className="absolute top-4 right-10 w-16 h-8 bg-white/30 rounded-full blur-sm" />
          </div>

          {/* Rendered Window Canvas inside Aperture */}
          <div className="w-full h-full max-h-[420px]">
            <WindowCanvas
              type={windowDesign.type}
              width={windowDesign.width}
              height={windowDesign.height}
              profileBrand={windowDesign.profileBrand}
              profileColor={windowDesign.profileColor}
              glassType={windowDesign.glassType}
              meshType={windowDesign.meshType}
              openingDirection={windowDesign.openingDirection}
              mode="realistic"
              showDimensions={false}
              className="w-full h-full"
            />
          </div>

          {/* Stone Window Cill / Sill */}
          <div className="w-[106%] h-4 -mt-2 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-sm shadow-md border-b-2 border-slate-300" />
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            Window: <strong className="text-white">{windowDesign.id}</strong> (
            {windowDesign.name})
          </span>
          <span>•</span>
          <span>
            Size:{' '}
            <strong className="text-white">
              {windowDesign.width} × {windowDesign.height} mm
            </strong>
          </span>
          <span>•</span>
          <span>
            Color:{' '}
            <strong className="text-white capitalize">
              {windowDesign.profileColor?.replace('_', ' ')}
            </strong>
          </span>
          <span>•</span>
          <span>
            Glass:{' '}
            <strong className="text-white capitalize">
              {windowDesign.glassType?.replace('_', ' ')}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Client Presentation Ready</span>
        </div>
      </div>
    </div>
  );
};
