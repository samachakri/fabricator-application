'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { GlassType, ProfileColor, WindowType } from '@/lib/types';

export interface WindowCanvasProps {
  type: WindowType;
  width: number; // in mm
  height: number; // in mm
  leftHeight?: number;
  rightHeight?: number;
  topWidth?: number;
  bottomWidth?: number;
  slopeAngle?: number;
  cornerExtensions?: {
    corner: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
    type: 'triangle' | 'slope_45' | 'fixed_box';
    width: number;
    height: number;
    angle?: number;
  }[];
  onCornerPlus?: (corner: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right') => void;
  onDimensionsChange?: (dims: {
    leftHeight?: number;
    rightHeight?: number;
    topWidth?: number;
    bottomWidth?: number;
    width?: number;
    height?: number;
    slopeAngle?: number;
  }) => void;
  profileBrand?: string;
  profileColor?: ProfileColor;
  glassType?: GlassType;
  meshType?: string;
  openingDirection?: string;
  mode?: 'blueprint' | 'realistic';
  showDimensions?: boolean;
  className?: string;
}

export const WindowCanvas: React.FC<WindowCanvasProps> = ({
  type = 'sliding_2track',
  width = 1200,
  height = 1500,
  leftHeight,
  rightHeight,
  topWidth,
  bottomWidth,
  slopeAngle,
  cornerExtensions = [],
  onCornerPlus,
  onDimensionsChange,
  profileBrand = 'VEKA',
  profileColor = 'pure_white',
  glassType = 'clear_5mm',
  meshType = 'none',
  openingDirection = 'sliding_left',
  mode = 'blueprint',
  showDimensions = true,
  className = '',
}) => {
  const BW = Math.max(300, Math.min(4000, bottomWidth !== undefined ? bottomWidth : width));
  const TW = Math.max(300, Math.min(4000, topWidth !== undefined ? topWidth : width));
  const LH = Math.max(0, Math.min(4000, leftHeight !== undefined ? leftHeight : height));
  const RH = Math.max(0, Math.min(4000, rightHeight !== undefined ? rightHeight : height));

  const isAngledShape = LH !== RH || LH === 0 || RH === 0;

  const maxH = Math.max(LH, RH, 400);
  const maxW = Math.max(BW, TW, 400);

  // SVG coordinate system with margins for 4-side dimension callouts
  const marginX = showDimensions ? 80 : 35;
  const marginY = showDimensions ? 80 : 35;
  const totalSvgWidth = maxW + marginX * 2;
  const totalSvgHeight = maxH + marginY * 2;

  // Frame and Sash face dimensions (in mm)
  const frameFace = Math.min(65, Math.max(38, Math.round(maxH * 0.08)));
  const sashFace = 68;

  // Baseline at bottom
  const x0 = marginX;
  const y1 = marginY + maxH;
  const x1 = marginX + BW;
  const y0 = y1 - maxH;

  // Corner coordinates in SVG space
  const pBL = { x: x0, y: y1 };
  const pBR = { x: x1, y: y1 };
  const pTR = { x: x1, y: y1 - RH };
  const pTL = { x: x0, y: y1 - LH };

  // Angle and hypotenuse calculations
  const hDiff = Math.abs(RH - LH);
  const calculatedSlopeAngle = BW > 0 ? (Math.atan(hDiff / BW) * 180) / Math.PI : 0;
  const hypotenuseLength = Math.round(Math.hypot(BW, hDiff));
  const isExact45 =
    Math.abs(calculatedSlopeAngle - 45) < 1 ||
    (LH === 0 && RH === BW) ||
    (RH === 0 && LH === BW);

  // Rectangular mode inner daylight area
  const W = BW;
  const H = maxH;
  const innerX = x0 + frameFace;
  const innerY = y0 + frameFace;
  const innerW = W - 2 * frameFace;
  const innerH = H - 2 * frameFace;

  // Mouse Dragging for vertex drawing & 45° angle snapping
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingCorner, setDraggingCorner] = useState<
    'top_left' | 'top_right' | 'bottom_right' | 'bottom_left' | null
  >(null);
  const [activeSnapAngle, setActiveSnapAngle] = useState<number | null>(null);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingCorner(null);
      setActiveSnapAngle(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleMouseDown = (
    corner: 'top_left' | 'top_right' | 'bottom_right' | 'bottom_left',
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingCorner(corner);
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingCorner || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = totalSvgWidth / rect.width;
    const scaleY = totalSvgHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (draggingCorner === 'top_left') {
      let newLH = Math.max(0, Math.min(3500, Math.round(y1 - mouseY)));
      // Check 45 degree snap relative to rightHeight RH and bottomWidth BW
      const targetDelta = BW;
      const currentDelta = Math.abs(RH - newLH);
      if (Math.abs(currentDelta - targetDelta) < 32 || (newLH < 35 && RH === BW)) {
        newLH = newLH < 35 ? 0 : RH >= BW ? RH - BW : RH + BW;
        setActiveSnapAngle(45);
      } else {
        setActiveSnapAngle(null);
      }
      onDimensionsChange?.({
        leftHeight: newLH,
        height: Math.max(newLH, RH, 400),
        slopeAngle: Math.round((Math.atan2(Math.abs(RH - newLH), BW) * 180) / Math.PI),
      });
    } else if (draggingCorner === 'top_right') {
      let newRH = Math.max(0, Math.min(3500, Math.round(y1 - mouseY)));
      const targetDelta = BW;
      const currentDelta = Math.abs(newRH - LH);
      if (Math.abs(currentDelta - targetDelta) < 32 || (newRH < 35 && LH === BW)) {
        newRH = newRH < 35 ? 0 : LH >= BW ? LH - BW : LH + BW;
        setActiveSnapAngle(45);
      } else {
        setActiveSnapAngle(null);
      }
      onDimensionsChange?.({
        rightHeight: newRH,
        height: Math.max(LH, newRH, 400),
        slopeAngle: Math.round((Math.atan2(Math.abs(newRH - LH), BW) * 180) / Math.PI),
      });
    } else if (draggingCorner === 'bottom_right') {
      let newBW = Math.max(300, Math.min(3500, Math.round(mouseX - x0)));
      const diff = Math.abs(RH - LH);
      if (diff > 50 && Math.abs(newBW - diff) < 32) {
        newBW = diff;
        setActiveSnapAngle(45);
      } else {
        setActiveSnapAngle(null);
      }
      onDimensionsChange?.({
        bottomWidth: newBW,
        topWidth: newBW,
        width: newBW,
        slopeAngle: diff > 0 ? Math.round((Math.atan2(diff, newBW) * 180) / Math.PI) : 0,
      });
    } else if (draggingCorner === 'bottom_left') {
      let newBW = Math.max(300, Math.min(3500, Math.round(x1 - mouseX)));
      onDimensionsChange?.({
        bottomWidth: newBW,
        topWidth: newBW,
        width: newBW,
      });
    }
  };

  // Realistic Color mappings
  const profileFillColor = useMemo(() => {
    if (mode === 'blueprint') return '#FFFFFF';
    switch (profileColor) {
      case 'anthracite_grey':
        return '#374151';
      case 'golden_oak':
        return '#B45309';
      case 'walnut':
        return '#451A03';
      case 'jet_black':
        return '#18181B';
      default:
        return '#F8FAFC'; // Pure White
    }
  }, [profileColor, mode]);

  const profileStrokeColor = useMemo(() => {
    if (mode === 'blueprint') return '#0A2E8A';
    switch (profileColor) {
      case 'anthracite_grey':
        return '#1F2937';
      case 'golden_oak':
        return '#78350F';
      case 'walnut':
        return '#260F02';
      case 'jet_black':
        return '#09090B';
      default:
        return '#94A3B8';
    }
  }, [profileColor, mode]);

  const glassFill = useMemo(() => {
    switch (glassType) {
      case 'frosted_5mm':
        return 'url(#frostedGrad)';
      case 'tinted_reflective':
        return 'url(#tintedGrad)';
      case 'dgu_5_12_5':
        return 'url(#dguGrad)';
      case 'toughened_6mm':
        return 'url(#toughenedGrad)';
      default:
        return 'url(#clearGrad)';
    }
  }, [glassType]);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${totalSvgWidth} ${totalSvgHeight}`}
        className="w-full h-full max-h-full drop-shadow-sm transition-all duration-300"
        onMouseMove={handleSvgMouseMove}
        style={{
          backgroundColor: mode === 'blueprint' ? '#F8FAFC' : '#F1F5F9',
        }}
      >
        <defs>
          {/* Blueprint CAD Grid */}
          <pattern
            id="cadGrid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="0.75"
            />
          </pattern>

          {/* Mesh Screen Pattern */}
          <pattern
            id="meshGrid"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 6 0 L 0 0 0 6"
              fill="none"
              stroke="#64748B"
              strokeWidth="0.5"
              strokeOpacity="0.6"
            />
          </pattern>

          {/* Glass Gradients */}
          <linearGradient id="clearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#BAE6FD" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="dguGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CFFAFE" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#A5F3FC" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="toughenedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="frostedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="tintedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1E293B" stopOpacity="0.5" />
          </linearGradient>

          {/* Arrow markers for dimension lines */}
          <marker
            id="arrowStart"
            viewBox="0 0 10 10"
            refX="0"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 10 0 L 0 5 L 10 10 z" fill="#0A2E8A" />
          </marker>
          <marker
            id="arrowEnd"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0A2E8A" />
          </marker>
        </defs>

        {/* Blueprint background grid */}
        {mode === 'blueprint' && (
          <rect
            width={totalSvgWidth}
            height={totalSvgHeight}
            fill="url(#cadGrid)"
          />
        )}

        {/* ================================================================= */}
        {/* 1. OUTER FRAME & SASHES (Standard Rectangular Windows)           */}
        {/* ================================================================= */}
        {!isAngledShape ? (
          <g id="rectangular-window">
            <g id="outer-frame">
          {/* Outer perimeter */}
          <rect
            x={x0}
            y={y0}
            width={W}
            height={H}
            fill={profileFillColor}
            stroke={profileStrokeColor}
            strokeWidth={mode === 'blueprint' ? 2 : 3}
            rx={2}
          />

          {/* Frame inner daylight cut */}
          <rect
            x={innerX}
            y={innerY}
            width={innerW}
            height={innerH}
            fill={mode === 'blueprint' ? '#FFFFFF' : '#E2E8F0'}
            stroke={profileStrokeColor}
            strokeWidth={1.5}
          />

          {/* 45-Degree Miter Weld Corner Lines */}
          <line
            x1={x0}
            y1={y0}
            x2={innerX}
            y2={innerY}
            stroke={profileStrokeColor}
            strokeWidth={1.2}
            strokeDasharray={mode === 'blueprint' ? '3,2' : undefined}
          />
          <line
            x1={x1}
            y1={y0}
            x2={innerX + innerW}
            y2={innerY}
            stroke={profileStrokeColor}
            strokeWidth={1.2}
            strokeDasharray={mode === 'blueprint' ? '3,2' : undefined}
          />
          <line
            x1={x0}
            y1={y1}
            x2={innerX}
            y2={innerY + innerH}
            stroke={profileStrokeColor}
            strokeWidth={1.2}
            strokeDasharray={mode === 'blueprint' ? '3,2' : undefined}
          />
          <line
            x1={x1}
            y1={y1}
            x2={innerX + innerW}
            y2={innerY + innerH}
            stroke={profileStrokeColor}
            strokeWidth={1.2}
            strokeDasharray={mode === 'blueprint' ? '3,2' : undefined}
          />

          {/* Weep Holes for water drainage at bottom */}
          <rect
            x={innerX + innerW * 0.25 - 15}
            y={y1 - 12}
            width={30}
            height={5}
            rx={2}
            fill="#475569"
          />
          <rect
            x={innerX + innerW * 0.75 - 15}
            y={y1 - 12}
            width={30}
            height={5}
            rx={2}
            fill="#475569"
          />
        </g>

        {/* ================================================================= */}
        {/* 2. SASHES & GLASS (Based on Window Type)                         */}
        {/* ================================================================= */}
        {type === 'sliding_2track' && (
          <g id="sliding-2track-sashes">
            {/* 2 Sashes overlapping in center */}
            {(() => {
              const overlap = 30;
              const sashW = (innerW + overlap) / 2;
              const sashH = innerH - 6;

              const s1X = innerX;
              const s1Y = innerY + 3;

              const s2X = innerX + sashW - overlap;
              const s2Y = innerY + 3;

              return (
                <>
                  {/* Track 1 / Left Sash */}
                  <g id="sash-1">
                    <rect
                      x={s1X}
                      y={s1Y}
                      width={sashW}
                      height={sashH}
                      fill={profileFillColor}
                      stroke={profileStrokeColor}
                      strokeWidth={1.5}
                      rx={1}
                    />
                    {/* Glass 1 */}
                    <rect
                      x={s1X + sashFace}
                      y={s1Y + sashFace}
                      width={sashW - 2 * sashFace}
                      height={sashH - 2 * sashFace}
                      fill={glassFill}
                      stroke="#94A3B8"
                      strokeWidth={0.8}
                    />
                    {/* Glass reflective diagonal lines */}
                    <line
                      x1={s1X + sashFace + 20}
                      y1={s1Y + sashFace + 30}
                      x2={s1X + sashFace + 80}
                      y2={s1Y + sashFace + 90}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                      strokeOpacity="0.7"
                    />
                    {/* Pop-up Handle on Left Stile */}
                    <rect
                      x={s1X + 12}
                      y={s1Y + sashH / 2 - 25}
                      width={8}
                      height={50}
                      rx={3}
                      fill="#1E293B"
                    />
                    {/* Sliding Arrow for Sash 1 */}
                    <g
                      transform={`translate(${s1X + sashW / 2}, ${s1Y + sashH / 2})`}
                    >
                      <circle r="16" fill="#0A2E8A" fillOpacity="0.08" />
                      <line
                        x1="-18"
                        y1="0"
                        x2="18"
                        y2="0"
                        stroke="#0A2E8A"
                        strokeWidth="2"
                        strokeDasharray="4,2"
                      />
                      <polygon points="12,-5 22,0 12,5" fill="#0A2E8A" />
                    </g>
                    <text
                      x={s1X + sashW / 2}
                      y={s1Y + sashH / 2 + 25}
                      textAnchor="middle"
                      fill="#0A2E8A"
                      fontSize="11"
                      fontWeight="600"
                    >
                      SLIDE &rarr;
                    </text>
                  </g>

                  {/* Track 2 / Right Sash */}
                  <g id="sash-2">
                    <rect
                      x={s2X}
                      y={s2Y}
                      width={sashW}
                      height={sashH}
                      fill={profileFillColor}
                      stroke={profileStrokeColor}
                      strokeWidth={1.5}
                      rx={1}
                    />
                    {/* Glass 2 */}
                    <rect
                      x={s2X + sashFace}
                      y={s2Y + sashFace}
                      width={sashW - 2 * sashFace}
                      height={sashH - 2 * sashFace}
                      fill={glassFill}
                      stroke="#94A3B8"
                      strokeWidth={0.8}
                    />
                    {/* Pop-up Handle on Right Stile */}
                    <rect
                      x={s2X + sashW - 20}
                      y={s2Y + sashH / 2 - 25}
                      width={8}
                      height={50}
                      rx={3}
                      fill="#1E293B"
                    />
                    {/* Sliding Arrow for Sash 2 */}
                    <g
                      transform={`translate(${s2X + sashW / 2}, ${s2Y + sashH / 2})`}
                    >
                      <circle r="16" fill="#0A2E8A" fillOpacity="0.08" />
                      <line
                        x1="18"
                        y1="0"
                        x2="-18"
                        y2="0"
                        stroke="#0A2E8A"
                        strokeWidth="2"
                        strokeDasharray="4,2"
                      />
                      <polygon points="-12,-5 -22,0 -12,5" fill="#0A2E8A" />
                    </g>
                    <text
                      x={s2X + sashW / 2}
                      y={s2Y + sashH / 2 + 25}
                      textAnchor="middle"
                      fill="#0A2E8A"
                      fontSize="11"
                      fontWeight="600"
                    >
                      &larr; SLIDE
                    </text>
                  </g>

                  {/* Interlock centerline */}
                  <line
                    x1={s1X + sashW - overlap / 2}
                    y1={s1Y}
                    x2={s1X + sashW - overlap / 2}
                    y2={s1Y + sashH}
                    stroke="#0A2E8A"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                  />
                </>
              );
            })()}
          </g>
        )}

        {type === 'sliding_3track' && (
          <g id="sliding-3track-sashes">
            {(() => {
              const overlap = 25;
              const sashW = (innerW + overlap * 2) / 3;
              const sashH = innerH - 6;

              return [0, 1, 2].map((idx) => {
                const sX = innerX + idx * (sashW - overlap);
                const sY = innerY + 3;
                const isMesh = idx === 2 && meshType !== 'none';

                return (
                  <g key={idx} id={`sash-3t-${idx}`}>
                    <rect
                      x={sX}
                      y={sY}
                      width={sashW}
                      height={sashH}
                      fill={isMesh ? '#F1F5F9' : profileFillColor}
                      stroke={profileStrokeColor}
                      strokeWidth={1.5}
                      rx={1}
                    />
                    <rect
                      x={sX + sashFace}
                      y={sY + sashFace}
                      width={sashW - 2 * sashFace}
                      height={sashH - 2 * sashFace}
                      fill={isMesh ? 'url(#meshGrid)' : glassFill}
                      stroke="#94A3B8"
                      strokeWidth={0.8}
                    />
                    {isMesh ? (
                      <text
                        x={sX + sashW / 2}
                        y={sY + sashH / 2}
                        textAnchor="middle"
                        fill="#475569"
                        fontSize="11"
                        fontWeight="700"
                      >
                        [SS MESH]
                      </text>
                    ) : (
                      <g
                        transform={`translate(${sX + sashW / 2}, ${sY + sashH / 2})`}
                      >
                        <line
                          x1={idx === 0 ? '-14' : '14'}
                          y1="0"
                          x2={idx === 0 ? '14' : '-14'}
                          y2="0"
                          stroke="#0A2E8A"
                          strokeWidth="1.5"
                        />
                        <polygon
                          points={
                            idx === 0 ? '8,-4 16,0 8,4' : '-8,-4 -16,0 -8,4'
                          }
                          fill="#0A2E8A"
                        />
                      </g>
                    )}
                  </g>
                );
              });
            })()}
          </g>
        )}

        {type === 'casement_single' && (
          <g id="casement-single-sash">
            {(() => {
              const sashClearance = 8;
              const sX = innerX + sashClearance;
              const sY = innerY + sashClearance;
              const sW = innerW - 2 * sashClearance;
              const sH = innerH - 2 * sashClearance;

              const isLeftOpen = openingDirection.includes('left');

              return (
                <>
                  {/* Sash Profile */}
                  <rect
                    x={sX}
                    y={sY}
                    width={sW}
                    height={sH}
                    fill={profileFillColor}
                    stroke={profileStrokeColor}
                    strokeWidth={2}
                    rx={1}
                  />
                  {/* Glass Pane */}
                  <rect
                    x={sX + sashFace}
                    y={sY + sashFace}
                    width={sW - 2 * sashFace}
                    height={sH - 2 * sashFace}
                    fill={glassFill}
                    stroke="#94A3B8"
                    strokeWidth={0.8}
                  />

                  {/* Swing Angle Triangle (Standard Architectural CAD Symbol) */}
                  {/* Top corner to handle point to bottom corner */}
                  {isLeftOpen ? (
                    // Hinge on right, swings open towards left
                    <polyline
                      points={`${sX},${sY} ${sX + sW},${sY + sH / 2} ${sX},${sY + sH}`}
                      fill="none"
                      stroke="#0A2E8A"
                      strokeWidth="1.75"
                      strokeDasharray="6,4"
                    />
                  ) : (
                    // Hinge on left, swings open towards right
                    <polyline
                      points={`${sX + sW},${sY} ${sX},${sY + sH / 2} ${sX + sW},${sY + sH}`}
                      fill="none"
                      stroke="#0A2E8A"
                      strokeWidth="1.75"
                      strokeDasharray="6,4"
                    />
                  )}

                  {/* Friction Hinges */}
                  <rect
                    x={isLeftOpen ? sX + sW - 10 : sX + 4}
                    y={sY + 15}
                    width={6}
                    height={40}
                    rx={2}
                    fill="#334155"
                  />
                  <rect
                    x={isLeftOpen ? sX + sW - 10 : sX + 4}
                    y={sY + sH - 55}
                    width={6}
                    height={40}
                    rx={2}
                    fill="#334155"
                  />

                  {/* Casement Lever Handle */}
                  <g
                    transform={`translate(${isLeftOpen ? sX + 18 : sX + sW - 18}, ${sY + sH / 2})`}
                  >
                    <rect
                      x="-5"
                      y="-15"
                      width="10"
                      height="30"
                      rx="2"
                      fill="#1E293B"
                    />
                    <path
                      d={
                        isLeftOpen
                          ? 'M 0,0 L 22,-8 L 22,-14 L 0,-6 Z'
                          : 'M 0,0 L -22,-8 L -22,-14 L 0,-6 Z'
                      }
                      fill="#0F172A"
                    />
                  </g>

                  {/* Swing Arc Callout */}
                  <path
                    d={
                      isLeftOpen
                        ? `M ${sX + 30},${sY + sH - 40} A ${sW * 0.7} ${sW * 0.7} 0 0 1 ${sX + sW - 40},${sY + sH - 10}`
                        : `M ${sX + sW - 30},${sY + sH - 40} A ${sW * 0.7} ${sW * 0.7} 0 0 0 ${sX + 40},${sY + sH - 10}`
                    }
                    fill="none"
                    stroke="#0A2E8A"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />
                </>
              );
            })()}
          </g>
        )}

        {type === 'casement_double' && (
          <g id="casement-double-sash">
            {(() => {
              const sashClearance = 6;
              const halfW = (innerW - sashClearance * 3) / 2;
              const sH = innerH - 2 * sashClearance;

              const s1X = innerX + sashClearance;
              const s2X = innerX + sashClearance * 2 + halfW;
              const sY = innerY + sashClearance;

              return (
                <>
                  {/* Left Sash */}
                  <rect
                    x={s1X}
                    y={sY}
                    width={halfW}
                    height={sH}
                    fill={profileFillColor}
                    stroke={profileStrokeColor}
                    strokeWidth={1.5}
                  />
                  <rect
                    x={s1X + sashFace}
                    y={sY + sashFace}
                    width={halfW - 2 * sashFace}
                    height={sH - 2 * sashFace}
                    fill={glassFill}
                    stroke="#94A3B8"
                    strokeWidth={0.8}
                  />
                  <polyline
                    points={`${s1X + halfW},${sY} ${s1X},${sY + sH / 2} ${s1X + halfW},${sY + sH}`}
                    fill="none"
                    stroke="#0A2E8A"
                    strokeWidth="1.5"
                    strokeDasharray="5,4"
                  />

                  {/* Right Sash */}
                  <rect
                    x={s2X}
                    y={sY}
                    width={halfW}
                    height={sH}
                    fill={profileFillColor}
                    stroke={profileStrokeColor}
                    strokeWidth={1.5}
                  />
                  <rect
                    x={s2X + sashFace}
                    y={sY + sashFace}
                    width={halfW - 2 * sashFace}
                    height={sH - 2 * sashFace}
                    fill={glassFill}
                    stroke="#94A3B8"
                    strokeWidth={0.8}
                  />
                  <polyline
                    points={`${s2X},${sY} ${s2X + halfW},${sY + sH / 2} ${s2X},${sY + sH}`}
                    fill="none"
                    stroke="#0A2E8A"
                    strokeWidth="1.5"
                    strokeDasharray="5,4"
                  />

                  {/* Dual Handles */}
                  <rect
                    x={s1X + halfW - 12}
                    y={sY + sH / 2 - 15}
                    width="6"
                    height="30"
                    rx="2"
                    fill="#1E293B"
                  />
                  <rect
                    x={s2X + 6}
                    y={sY + sH / 2 - 15}
                    width="6"
                    height="30"
                    rx="2"
                    fill="#1E293B"
                  />
                </>
              );
            })()}
          </g>
        )}

        {type === 'fixed' && (
          <g id="fixed-window-pane">
            <rect
              x={innerX}
              y={innerY}
              width={innerW}
              height={innerH}
              fill={glassFill}
              stroke="#94A3B8"
              strokeWidth={1.2}
            />
            {/* Glazing Beads miters */}
            <line
              x1={innerX}
              y1={innerY}
              x2={innerX + 18}
              y2={innerY + 18}
              stroke="#64748B"
              strokeWidth={0.75}
            />
            <line
              x1={innerX + innerW}
              y1={innerY}
              x2={innerX + innerW - 18}
              y2={innerY + 18}
              stroke="#64748B"
              strokeWidth={0.75}
            />
            <line
              x1={innerX}
              y1={innerY + innerH}
              x2={innerX + 18}
              y2={innerY + innerH - 18}
              stroke="#64748B"
              strokeWidth={0.75}
            />
            <line
              x1={innerX + innerW}
              y1={innerY + innerH}
              x2={innerX + innerW - 18}
              y2={innerY + innerH - 18}
              stroke="#64748B"
              strokeWidth={0.75}
            />
            <text
              x={innerX + innerW / 2}
              y={innerY + innerH / 2}
              textAnchor="middle"
              fill="#0A2E8A"
              fontSize="12"
              fontWeight="700"
              letterSpacing="2"
            >
              [FIXED DIRECT GLAZING]
            </text>
          </g>
        )}
      </g>
    ) : (
          /* =============================================================== */
          /* 2. ANGLED / RIGHT-ANGLE TRIANGLE / TRAPEZOID GEOMETRY           */
          /* =============================================================== */
          <g id="angled-custom-geometry">
            {/* Outer Frame Polygon */}
            <polygon
              points={
                LH === 0
                  ? `${pBL.x},${pBL.y} ${pBR.x},${pBR.y} ${pTR.x},${pTR.y}`
                  : RH === 0
                  ? `${pBL.x},${pBL.y} ${pBR.x},${pBR.y} ${pTL.x},${pTL.y}`
                  : `${pBL.x},${pBL.y} ${pBR.x},${pBR.y} ${pTR.x},${pTR.y} ${pTL.x},${pTL.y}`
              }
              fill={profileFillColor}
              stroke={profileStrokeColor}
              strokeWidth={mode === 'blueprint' ? 2 : 3}
              strokeLinejoin="round"
            />

            {/* Inner Daylight Glass Polygon */}
            {LH === 0 && (
              <polygon
                points={`${pBL.x + frameFace * 2.414},${y1 - frameFace} ${x1 - frameFace},${y1 - frameFace} ${x1 - frameFace},${y1 - RH + frameFace * 2.414}`}
                fill={glassFill}
                stroke="#94A3B8"
                strokeWidth={1.2}
              />
            )}
            {RH === 0 && (
              <polygon
                points={`${pBL.x + frameFace},${y1 - frameFace} ${x1 - frameFace * 2.414},${y1 - frameFace} ${pBL.x + frameFace},${y1 - LH + frameFace * 2.414}`}
                fill={glassFill}
                stroke="#94A3B8"
                strokeWidth={1.2}
              />
            )}
            {LH > 0 && RH > 0 && (
              <polygon
                points={`${pBL.x + frameFace},${y1 - frameFace} ${x1 - frameFace},${y1 - frameFace} ${x1 - frameFace},${y1 - RH + frameFace} ${pBL.x + frameFace},${y1 - LH + frameFace}`}
                fill={glassFill}
                stroke="#94A3B8"
                strokeWidth={1.2}
              />
            )}

            {/* Glass diagonal highlight lines */}
            <line
              x1={pBL.x + BW * 0.4}
              y1={y1 - Math.max(LH, RH) * 0.35 - 15}
              x2={pBL.x + BW * 0.4 + 50}
              y2={y1 - Math.max(LH, RH) * 0.35 + 35}
              stroke="#FFFFFF"
              strokeWidth={1.5}
              strokeOpacity={0.7}
            />

            {/* Drainage Weep Hole */}
            <rect
              x={x0 + BW * 0.5 - 15}
              y={y1 - 10}
              width={30}
              height={4}
              rx={1.5}
              fill="#475569"
            />

            {/* Geometry Specification Label */}
            <text
              x={x0 + BW / 2}
              y={y1 - Math.max(LH, RH) / 3}
              textAnchor="middle"
              fill="#0A2E8A"
              fontSize="11"
              fontWeight="700"
              letterSpacing="1"
            >
              {LH === 0
                ? '[45° RIGHT ANGLE TRIANGLE - DIRECT GLAZING]'
                : RH === 0
                ? '[45° LEFT RAKE TRIANGLE]'
                : `[${calculatedSlopeAngle.toFixed(1)}° CUSTOM RAKE TRAPEZOID]`}
            </text>
          </g>
        )}

        {/* ================================================================= */}
        {/* 3. CORNER ATTACHMENTS / EXTENSIONS (IF ANY ACTIVE)                */}
        {/* ================================================================= */}
        {cornerExtensions && cornerExtensions.length > 0 && (
          <g id="corner-extensions">
            {cornerExtensions.map((ext, idx) => {
              const extW = ext.width || 400;
              const extH = ext.height || 400;
              const isRight = ext.corner.includes('right');
              const isTop = ext.corner.includes('top');
              const attachX = isRight ? x1 : x0 - extW;
              const attachY = isTop ? y0 - extH : y1;
              return (
                <g key={`ext-${idx}`}>
                  <rect
                    x={attachX}
                    y={attachY}
                    width={extW}
                    height={extH}
                    fill="url(#clearGrad)"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeDasharray="4,3"
                    rx="3"
                  />
                  <line
                    x1={attachX}
                    y1={attachY}
                    x2={attachX + extW}
                    y2={attachY + extH}
                    stroke="#2563EB"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={attachX + extW / 2}
                    y={attachY + extH / 2}
                    textAnchor="middle"
                    fill="#0A2E8A"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    + {ext.corner.toUpperCase()} ATTACHMENT ({extW}×{extH})
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* ================================================================= */}
        {/* 4. 45-DEGREE ANGLE SNAP GUIDE & LIVE DEGREE BADGE                 */}
        {/* ================================================================= */}
        {isAngledShape && (
          <g id="slope-guideline">
            <line
              x1={pTL.x}
              y1={pTL.y}
              x2={pTR.x}
              y2={pTR.y}
              stroke="#0284C7"
              strokeWidth="2"
              strokeDasharray="5,3"
            />
            <g transform={`translate(${(pTL.x + pTR.x) / 2}, ${(pTL.y + pTR.y) / 2 - 16})`}>
              <rect
                x="-45"
                y="-12"
                width="90"
                height="22"
                rx="11"
                fill={activeSnapAngle === 45 || isExact45 ? '#0284C7' : '#0F172A'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="drop-shadow-sm"
              />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="800"
                fontFamily="monospace"
              >
                {activeSnapAngle === 45 || isExact45 ? '45.0° SNAP' : `${calculatedSlopeAngle.toFixed(1)}° RAKE`}
              </text>
            </g>
          </g>
        )}

        {/* ================================================================= */}
        {/* 5. 4-SIDE TECHNICAL CAD BLUEPRINT MEASUREMENT CALLOUTS            */}
        {/* ================================================================= */}
        {showDimensions && (
          <g id="dimension-callouts">
            {/* 1. BOTTOM WIDTH DIMENSION */}
            <line x1={x0} y1={y1 + 5} x2={x0} y2={y1 + 42} stroke="#0A2E8A" strokeWidth="1" />
            <line x1={x1} y1={y1 + 5} x2={x1} y2={y1 + 42} stroke="#0A2E8A" strokeWidth="1" />
            <line
              x1={x0}
              y1={y1 + 30}
              x2={x1}
              y2={y1 + 30}
              stroke="#0A2E8A"
              strokeWidth="1.2"
              markerStart="url(#arrowStart)"
              markerEnd="url(#arrowEnd)"
            />
            <rect
              x={x0 + BW / 2 - 45}
              y={y1 + 18}
              width={90}
              height={24}
              rx={12}
              fill="#FFFFFF"
              stroke="#0A2E8A"
              strokeWidth="1"
            />
            <text
              x={x0 + BW / 2}
              y={y1 + 34}
              textAnchor="middle"
              fill="#0A2E8A"
              fontSize="12"
              fontWeight="700"
              fontFamily="monospace"
            >
              {BW} mm
            </text>

            {/* 2. TOP WIDTH / SLOPED HYPOTENUSE DIMENSION */}
            {!isAngledShape ? (
              <>
                <line x1={x0} y1={y0 - 5} x2={x0} y2={y0 - 45} stroke="#0A2E8A" strokeWidth="1" />
                <line x1={x1} y1={y0 - 5} x2={x1} y2={y0 - 45} stroke="#0A2E8A" strokeWidth="1" />
                <line
                  x1={x0}
                  y1={y0 - 32}
                  x2={x1}
                  y2={y0 - 32}
                  stroke="#0A2E8A"
                  strokeWidth="1.2"
                  markerStart="url(#arrowStart)"
                  markerEnd="url(#arrowEnd)"
                />
                <rect
                  x={x0 + TW / 2 - 45}
                  y={y0 - 44}
                  width={90}
                  height={24}
                  rx={12}
                  fill="#FFFFFF"
                  stroke="#0A2E8A"
                  strokeWidth="1"
                />
                <text
                  x={x0 + TW / 2}
                  y={y0 - 28}
                  textAnchor="middle"
                  fill="#0A2E8A"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {TW} mm
                </text>
              </>
            ) : (
              <g transform={`translate(${(pTL.x + pTR.x) / 2}, ${(pTL.y + pTR.y) / 2 - 32})`}>
                <rect
                  x="-55"
                  y="-12"
                  width="110"
                  height="24"
                  rx={12}
                  fill="#FFFFFF"
                  stroke="#0A2E8A"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#0A2E8A"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {hypotenuseLength} mm ({calculatedSlopeAngle.toFixed(1)}°)
                </text>
              </g>
            )}

            {/* 3. LEFT SIDE HEIGHT DIMENSION */}
            {LH > 0 ? (
              <>
                <line x1={x0 - 5} y1={y1} x2={x0 - 45} y2={y1} stroke="#0A2E8A" strokeWidth="1" />
                <line x1={x0 - 5} y1={pTL.y} x2={x0 - 45} y2={pTL.y} stroke="#0A2E8A" strokeWidth="1" />
                <line
                  x1={x0 - 32}
                  y1={y1}
                  x2={x0 - 32}
                  y2={pTL.y}
                  stroke="#0A2E8A"
                  strokeWidth="1.2"
                  markerStart="url(#arrowStart)"
                  markerEnd="url(#arrowEnd)"
                />
                <g transform={`translate(${x0 - 32}, ${(y1 + pTL.y) / 2}) rotate(-90)`}>
                  <rect
                    x="-45"
                    y="-12"
                    width="90"
                    height="24"
                    rx={12}
                    fill="#FFFFFF"
                    stroke="#0A2E8A"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#0A2E8A"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {LH} mm
                  </text>
                </g>
              </>
            ) : (
              <g transform={`translate(${x0 - 35}, ${y1})`}>
                <rect x="-35" y="-10" width="70" height="20" rx="10" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
                <text x="0" y="3" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  Left: 0 mm
                </text>
              </g>
            )}

            {/* 4. RIGHT SIDE HEIGHT DIMENSION */}
            {RH > 0 ? (
              <>
                <line x1={x1 + 5} y1={y1} x2={x1 + 45} y2={y1} stroke="#0A2E8A" strokeWidth="1" />
                <line x1={x1 + 5} y1={pTR.y} x2={x1 + 45} y2={pTR.y} stroke="#0A2E8A" strokeWidth="1" />
                <line
                  x1={x1 + 32}
                  y1={y1}
                  x2={x1 + 32}
                  y2={pTR.y}
                  stroke="#0A2E8A"
                  strokeWidth="1.2"
                  markerStart="url(#arrowStart)"
                  markerEnd="url(#arrowEnd)"
                />
                <g transform={`translate(${x1 + 32}, ${(y1 + pTR.y) / 2}) rotate(90)`}>
                  <rect
                    x="-45"
                    y="-12"
                    width="90"
                    height="24"
                    rx={12}
                    fill="#FFFFFF"
                    stroke="#0A2E8A"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#0A2E8A"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {RH} mm
                  </text>
                </g>
              </>
            ) : (
              <g transform={`translate(${x1 + 35}, ${y1})`}>
                <rect x="-35" y="-10" width="70" height="20" rx="10" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
                <text x="0" y="3" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  Right: 0 mm
                </text>
              </g>
            )}

            {/* Profile Spec Watermark */}
            <text
              x={x1 - 10}
              y={y1 + 48}
              textAnchor="end"
              fill="#64748B"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.5"
            >
              {profileBrand} • 60mm System • Weld +6mm
            </text>
          </g>
        )}

        {/* ================================================================= */}
        {/* 6. CORNER ACTION PLUS (+) BUTTONS ON EVERY CORNER                 */}
        {/* ================================================================= */}
        <g id="corner-plus-actions">
          {[
            { id: 'top_left' as const, x: pTL.x, y: pTL.y, label: 'Top-Left' },
            { id: 'top_right' as const, x: pTR.x, y: pTR.y, label: 'Top-Right' },
            { id: 'bottom_right' as const, x: pBR.x, y: pBR.y, label: 'Bottom-Right' },
            { id: 'bottom_left' as const, x: pBL.x, y: pBL.y, label: 'Bottom-Left' },
          ].map((corner) => {
            const offsetX = corner.id.includes('left') ? -14 : 14;
            const offsetY = corner.id.includes('top') ? -14 : 14;
            return (
              <g
                key={`plus-${corner.id}`}
                transform={`translate(${corner.x + offsetX}, ${corner.y + offsetY})`}
                className="cursor-pointer group transition-transform duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  onCornerPlus?.(corner.id);
                }}
              >
                <circle
                  r="14"
                  fill="#0A2E8A"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="group-hover:fill-blue-600 drop-shadow-md"
                />
                <line
                  x1="-5"
                  y1="0"
                  x2="5"
                  y2="0"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <line
                  x1="0"
                  y1="-5"
                  x2="0"
                  y2="5"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <g
                  className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  transform="translate(0, -18)"
                >
                  <rect x="-42" y="-16" width="84" height="18" rx="9" fill="#0F172A" />
                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    + Corner Rake
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* ================================================================= */}
        {/* 7. INTERACTIVE CORNER VERTEX DRAG HANDLES                         */}
        {/* ================================================================= */}
        <g id="vertex-drag-handles">
          {[
            { id: 'top_left' as const, x: pTL.x, y: pTL.y, cursor: 'ns-resize' },
            { id: 'top_right' as const, x: pTR.x, y: pTR.y, cursor: 'ns-resize' },
            { id: 'bottom_right' as const, x: pBR.x, y: pBR.y, cursor: 'ew-resize' },
          ].map((h) => (
            <circle
              key={`handle-${h.id}`}
              cx={h.x}
              cy={h.y}
              r={draggingCorner === h.id ? 8 : 6}
              fill={draggingCorner === h.id ? '#2563EB' : '#FFFFFF'}
              stroke="#0A2E8A"
              strokeWidth="2.5"
              style={{ cursor: h.cursor }}
              onMouseDown={(e) => handleMouseDown(h.id, e)}
              className="hover:scale-125 transition-transform drop-shadow-sm"
            />
          ))}
        </g>
      </svg>
    </div>
  );
};
