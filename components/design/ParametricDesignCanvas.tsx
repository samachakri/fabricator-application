'use client';

import React, { useState, useMemo } from 'react';
import {
  ParametricWindowDesign,
  WindowComponentType,
} from '@/lib/design/types';
import { AddComponentMenu, AddComponentAction } from './AddComponentMenu';
import {
  MousePointer,
  Circle,
  Pin,
  Ruler,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Box,
  MoreHorizontal,
} from 'lucide-react';

interface ParametricDesignCanvasProps {
  design: ParametricWindowDesign;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null, type?: WindowComponentType) => void;
  onAddComponentAction: (action: AddComponentAction) => void;
  onDimensionChange?: (width: number, height: number) => void;
}

export const ParametricDesignCanvas: React.FC<ParametricDesignCanvasProps> = ({
  design,
  selectedComponentId,
  onSelectComponent,
  onAddComponentAction,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTool, setActiveTool] = useState<'select' | 'point' | 'pin' | 'dimension' | 'cut'>('select');

  const width = Math.max(400, design.width || 1800);
  const height = Math.max(300, design.height || 1200);

  // Canvas ViewBox padding for dimension lines & arrows
  const padX = 180;
  const padY = 160;
  const vbWidth = width + padX * 2;
  const vbHeight = height + padY * 2;

  // Window frame position within SVG viewBox
  const winX = padX;
  const winY = padY;

  // Profile face dimensions in mm
  const frameFace = 60; // 60mm outer frame face
  const sashFace = 64; // 64mm sash face
  const mullionFace = 60; // 60mm mullion

  const innerX = winX + frameFace;
  const innerY = winY + frameFace;
  const innerW = width - frameFace * 2;
  const innerH = height - frameFace * 2;

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(180, z + 10));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(50, z - 10));
  const handleZoomReset = () => setZoomLevel(100);

  return (
    <div
      className="relative w-full h-full min-h-[640px] flex-1 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl overflow-hidden flex items-center justify-center p-4 select-none cursor-default"
      onClick={(e) => {
        // Clicking canvas background deselects individual component
        if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
          onSelectComponent(null);
        }
      }}
    >
      {/* Top-Left Floating Drawing Tool Palette matching Stitch screenshot */}
      <div className="absolute top-4 left-4 flex items-center bg-white rounded-xl shadow-xs border border-slate-200/90 p-1 gap-0.5 z-20">
        <button
          type="button"
          onClick={() => setActiveTool('select')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'select'
              ? 'bg-[#1B64F2]/10 text-[#1B64F2]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Select tool"
        >
          <MousePointer className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setActiveTool('point')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'point'
              ? 'bg-[#1B64F2]/10 text-[#1B64F2]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Point indicator"
        >
          <Circle className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setActiveTool('pin')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'pin'
              ? 'bg-[#1B64F2]/10 text-[#1B64F2]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Pin anchor"
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setActiveTool('dimension')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'dimension'
              ? 'bg-[#1B64F2]/10 text-[#1B64F2]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Dimension tool"
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="More tools"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Reactive SVG Technical Drawing */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
        style={{ transform: `scale(${zoomLevel / 100})` }}
      >
        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="max-w-full max-h-[580px] drop-shadow-xs"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glass reflection gradient */}
            <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EAF3FD" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#E0EDFB" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#D5E6F8" stopOpacity="0.8" />
            </linearGradient>

            {/* Selection shadow/filter */}
            <filter id="selectionGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#1B64F2" floodOpacity="0.3" />
            </filter>

            {/* Mesh pattern */}
            <pattern id="meshGrid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#94A3B8" strokeWidth="0.5" opacity="0.4" />
            </pattern>

            {/* Dimension Arrow Markers */}
            <marker
              id="dimArrowStart"
              viewBox="0 0 10 10"
              refX="1"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 9 1 L 1 5 L 9 9 z" fill="#334155" />
            </marker>
            <marker
              id="dimArrowEnd"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 1 1 L 9 5 L 1 9 z" fill="#334155" />
            </marker>
          </defs>

          {/* ======================================================== */}
          {/* 1. TOP HORIZONTAL DIMENSION LINE (Overall Width)        */}
          {/* ======================================================== */}
          <g className="dimension-top select-none font-mono">
            {/* Extension lines */}
            <line
              x1={winX}
              y1={winY}
              x2={winX}
              y2={winY - 60}
              stroke="#64748B"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <line
              x1={winX + width}
              y1={winY}
              x2={winX + width}
              y2={winY - 60}
              stroke="#64748B"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            {/* Main Arrow Dimension Line */}
            <line
              x1={winX + 4}
              y1={winY - 45}
              x2={winX + width - 4}
              y2={winY - 45}
              stroke="#334155"
              strokeWidth="1.5"
              markerStart="url(#dimArrowStart)"
              markerEnd="url(#dimArrowEnd)"
            />
            {/* Dimension Text Pill */}
            <rect
              x={winX + width / 2 - 50}
              y={winY - 58}
              width="100"
              height="24"
              rx="6"
              fill="#F8FAFC"
            />
            <text
              x={winX + width / 2}
              y={winY - 42}
              textAnchor="middle"
              className="text-[13px] font-bold fill-slate-800 tracking-wide font-sans"
            >
              {width} mm
            </text>
          </g>

          {/* ======================================================== */}
          {/* 2. LEFT VERTICAL DIMENSION LINE (Overall Height)        */}
          {/* ======================================================== */}
          <g className="dimension-left select-none font-mono">
            {/* Extension lines */}
            <line
              x1={winX}
              y1={winY}
              x2={winX - 60}
              y2={winY}
              stroke="#64748B"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <line
              x1={winX}
              y1={winY + height}
              x2={winX - 60}
              y2={winY + height}
              stroke="#64748B"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            {/* Main Arrow Dimension Line */}
            <line
              x1={winX - 45}
              y1={winY + 4}
              x2={winX - 45}
              y2={winY + height - 4}
              stroke="#334155"
              strokeWidth="1.5"
              markerStart="url(#dimArrowStart)"
              markerEnd="url(#dimArrowEnd)"
            />
            {/* Dimension Text Pill */}
            <rect
              x={winX - 58}
              y={winY + height / 2 - 40}
              width="26"
              height="80"
              rx="6"
              fill="#F8FAFC"
            />
            <text
              x={winX - 45}
              y={winY + height / 2}
              textAnchor="middle"
              transform={`rotate(-90 ${winX - 45} ${winY + height / 2})`}
              className="text-[13px] font-bold fill-slate-800 tracking-wide font-sans"
            >
              {height} mm
            </text>
          </g>

          {/* ======================================================== */}
          {/* 3. OUTER WINDOW FRAME                                   */}
          {/* ======================================================== */}
          <g
            id="frame-outer"
            className="cursor-pointer group/frame"
            onClick={(e) => {
              e.stopPropagation();
              onSelectComponent('frame-overall', 'frame');
            }}
          >
            {/* Outer Frame Bevel / Face */}
            <rect
              x={winX}
              y={winY}
              width={width}
              height={height}
              fill="#F1F5F9"
              stroke={selectedComponentId === 'frame-overall' ? '#1B64F2' : '#334155'}
              strokeWidth={selectedComponentId === 'frame-overall' ? '3' : '2'}
              rx="1"
              filter={selectedComponentId === 'frame-overall' ? 'url(#selectionGlow)' : undefined}
            />

            {/* Frame Mitre Joint Diagonal Lines on 4 Corners */}
            <line x1={winX} y1={winY} x2={winX + frameFace} y2={winY + frameFace} stroke="#94A3B8" strokeWidth="1" />
            <line
              x1={winX + width}
              y1={winY}
              x2={winX + width - frameFace}
              y2={winY + frameFace}
              stroke="#94A3B8"
              strokeWidth="1"
            />
            <line
              x1={winX}
              y1={winY + height}
              x2={winX + frameFace}
              y2={winY + height - frameFace}
              stroke="#94A3B8"
              strokeWidth="1"
            />
            <line
              x1={winX + width}
              y1={winY + height}
              x2={winX + width - frameFace}
              y2={winY + height - frameFace}
              stroke="#94A3B8"
              strokeWidth="1"
            />

            {/* Inner Frame Cutout (opening) */}
            <rect
              x={innerX}
              y={innerY}
              width={innerW}
              height={innerH}
              fill="#FFFFFF"
              stroke="#64748B"
              strokeWidth="1.5"
            />
          </g>

          {/* ======================================================== */}
          {/* 4. STRUCTURAL PANELS (Fixed / Sashes / Glass / Mesh)     */}
          {/* ======================================================== */}
          {design.panels.map((panel, idx) => {
            const pX = innerX + innerW * panel.xRatio;
            const pY = innerY + innerH * (panel.yRatio || 0);
            const pW = innerW * panel.widthRatio;
            const pH = innerH * (panel.heightRatio || 1);

            const isPanelSelected = selectedComponentId === panel.id;
            const isSashSelected = selectedComponentId === panel.sashId || (selectedComponentId === 'sash-overall' && panel.panelType !== 'fixed');
            const isGlassSelected = selectedComponentId === panel.glassId || selectedComponentId === 'glass-overall';
            const isMeshSelected = selectedComponentId === panel.meshId || selectedComponentId === 'mesh-overall';

            const sashConfig = design.sashConfigs[panel.sashId || ''];
            const isFixed = panel.panelType === 'fixed';
            const direction = panel.openingDirection || (sashConfig ? sashConfig.openingDirection : 'fixed');

            return (
              <g key={panel.id} id={panel.id} className="panel-group">
                {/* Panel Outer Sash / Subframe if Movable or Fixed */}
                {isFixed ? (
                  // Fixed Panel Outer Bead
                  <rect
                    x={pX + 2}
                    y={pY + 2}
                    width={pW - 4}
                    height={pH - 4}
                    fill="#F8FAFC"
                    stroke={isPanelSelected ? '#1B64F2' : '#CBD5E1'}
                    strokeWidth="1.5"
                  />
                ) : (
                  // Movable Sash Box (with selection outline)
                  <g
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComponent(panel.sashId || panel.id, 'sash');
                    }}
                  >
                    <rect
                      x={pX + 4}
                      y={pY + 4}
                      width={pW - 8}
                      height={pH - 8}
                      fill="#FFFFFF"
                      stroke={isSashSelected ? '#1B64F2' : '#475569'}
                      strokeWidth={isSashSelected ? '2.5' : '1.5'}
                      rx="1"
                      filter={isSashSelected ? 'url(#selectionGlow)' : undefined}
                    />
                    {/* Inner Sash Bevel */}
                    <rect
                      x={pX + 4 + sashFace}
                      y={pY + 4 + sashFace}
                      width={pW - 8 - sashFace * 2}
                      height={pH - 8 - sashFace * 2}
                      fill="transparent"
                      stroke="#94A3B8"
                      strokeWidth="1"
                    />
                  </g>
                )}

                {/* Glass Panel (Clickable & Highlightable) */}
                {(() => {
                  const gX = isFixed ? pX + 16 : pX + 4 + sashFace;
                  const gY = isFixed ? pY + 16 : pY + 4 + sashFace;
                  const gW = Math.max(10, isFixed ? pW - 32 : pW - 8 - sashFace * 2);
                  const gH = Math.max(10, isFixed ? pH - 32 : pH - 8 - sashFace * 2);

                  return (
                    <g
                      className="cursor-pointer group/glass"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComponent(panel.glassId, 'glass');
                      }}
                    >
                      {/* Glass Fill with Reflection */}
                      <rect
                        x={gX}
                        y={gY}
                        width={gW}
                        height={gH}
                        fill="url(#glassReflection)"
                        stroke={isGlassSelected ? '#1B64F2' : '#94A3B8'}
                        strokeWidth={isGlassSelected ? '2.5' : '1'}
                        filter={isGlassSelected ? 'url(#selectionGlow)' : undefined}
                        className="transition-all hover:opacity-95"
                      />

                      {/* Optional Mesh Overlay Pattern if sash has mesh */}
                      {sashConfig?.hasMesh && (
                        <rect
                          x={gX}
                          y={gY}
                          width={gW}
                          height={gH}
                          fill="url(#meshGrid)"
                          pointerEvents="none"
                          className={isMeshSelected ? 'opacity-90' : 'opacity-40'}
                        />
                      )}

                      {/* Panel Type Labels & Visual Direction Arrows matching Stitch Reference */}
                      {isFixed ? (
                        <g className="pointer-events-none select-none">
                          <text
                            x={pX + pW / 2}
                            y={pY + pH / 2 - 6}
                            textAnchor="middle"
                            className="text-xs font-semibold fill-slate-700 tracking-tight"
                          >
                            Fixed
                          </text>
                          {/* Point indicator as in screenshot */}
                          <circle cx={pX + pW / 2} cy={pY + pH / 2 + 10} r="3" fill="#1B64F2" />
                        </g>
                      ) : (
                        <g className="pointer-events-none select-none">
                          <text
                            x={pX + pW / 2}
                            y={pY + pH / 2 - 8}
                            textAnchor="middle"
                            className="text-xs font-semibold fill-slate-700 tracking-tight"
                          >
                            Sliding
                          </text>
                          {/* Direction Arrow */}
                          <text
                            x={pX + pW / 2}
                            y={pY + pH / 2 + 12}
                            textAnchor="middle"
                            className="text-sm font-black fill-slate-700"
                          >
                            {direction === 'sliding_right' ? '→' : '←'}
                          </text>

                          {/* Slim Vertical Handle on Sash edge as shown in reference */}
                          {direction === 'sliding_right' ? (
                            // Handle on right stile
                            <g>
                              <rect
                                x={pX + pW - 20}
                                y={pY + pH / 2 - 28}
                                width="5"
                                height="56"
                                rx="2"
                                fill="#475569"
                                stroke="#1E293B"
                                strokeWidth="1"
                              />
                            </g>
                          ) : (
                            // Handle on left stile
                            <g>
                              <rect
                                x={pX + 15}
                                y={pY + pH / 2 - 28}
                                width="5"
                                height="56"
                                rx="2"
                                fill="#475569"
                                stroke="#1E293B"
                                strokeWidth="1"
                              />
                            </g>
                          )}
                        </g>
                      )}
                    </g>
                  );
                })()}

                {/* Vertical Mullion dividers between panels */}
                {idx < design.panels.length - 1 && (
                  <g
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComponent(`mullion-${idx + 1}`, 'mullion');
                    }}
                  >
                    <rect
                      x={pX + pW - mullionFace / 2}
                      y={innerY}
                      width={mullionFace}
                      height={innerH}
                      fill="#F1F5F9"
                      stroke={selectedComponentId === `mullion-${idx + 1}` ? '#1B64F2' : '#64748B'}
                      strokeWidth={selectedComponentId === `mullion-${idx + 1}` ? '2' : '1'}
                      filter={selectedComponentId === `mullion-${idx + 1}` ? 'url(#selectionGlow)' : undefined}
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Bottom Center: Add Component Contextual Menu */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
        <AddComponentMenu onAction={onAddComponentAction} />
      </div>

      {/* Floating Bottom Left: Zoom & Fit Controls */}
      <div className="absolute bottom-5 left-5 flex items-center bg-white rounded-xl shadow-xs border border-slate-200/90 p-1 text-xs text-slate-600 gap-1 z-20">
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span
          onClick={handleZoomReset}
          className="px-1.5 font-mono font-bold text-[11px] hover:text-[#1B64F2] cursor-pointer"
          title="Reset zoom"
        >
          {zoomLevel}%
        </span>
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
        <button
          type="button"
          onClick={handleZoomReset}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Fit view"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Bottom Right: 3D View Thumbnail matching Stitch screenshot */}
      <div className="absolute bottom-5 right-5 z-20">
        <button
          type="button"
          onClick={() => alert('3D Perspective View preview available in Pro Plan.')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          title="Toggle 3D View Mode"
        >
          <Box className="w-3.5 h-3.5 text-slate-500" />
          <span>3D View</span>
        </button>
      </div>
    </div>
  );
};
