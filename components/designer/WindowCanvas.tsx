'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { GlassType, ProfileColor, WindowType, WindowDesign } from '@/lib/types';
import { Move, Plus, MousePointer, ZoomIn, ZoomOut, RotateCcw, PenTool } from 'lucide-react';

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
  boardX?: number;
  boardY?: number;
  allWindows?: WindowDesign[];
  activeWindowId?: string;
  onSelectWindow?: (id: string) => void;
  onAddNewWindow?: (pos?: { x: number; y: number }) => void;
  onPositionChange?: (pos: { boardX: number; boardY: number }) => void;
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
  boardX,
  boardY,
  allWindows = [],
  activeWindowId = 'W01',
  onSelectWindow,
  onAddNewWindow,
  onPositionChange,
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

  // Large CAD drafting board size allowing multiple windows and spacious dragging
  const BOARD_W = Math.max(3400, maxW * 2.8);
  const BOARD_H = Math.max(2200, maxH * 2.2);

  // Active window position on drafting board (draggable)
  const [windowPos, setWindowPos] = useState({
    x: boardX !== undefined ? boardX : 380,
    y: boardY !== undefined ? boardY : 300,
  });

  useEffect(() => {
    if (boardX !== undefined || boardY !== undefined) {
      setWindowPos({
        x: boardX !== undefined ? boardX : 380,
        y: boardY !== undefined ? boardY : 300,
      });
    }
  }, [boardX, boardY]);

  // Board toolbar mode: 'modify' (corner resize & snap) | 'draw' (hand/touch draw window edge) | 'move' (drag window) | 'add_window' (click to place new window)
  const [boardTool, setBoardTool] = useState<'modify' | 'draw' | 'move' | 'add_window'>('modify');
  const [zoom, setZoom] = useState<number>(1.0);

  // Hand / Touch direct window edge drawing state (renders window edge directly, no rough lines!)
  const [isDrawingWindowEdge, setIsDrawingWindowEdge] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  // Pinch-to-zoom distance tracking on mobile/tablets
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  // Window frame bounds inside local window space
  const marginX = showDimensions ? 80 : 35;
  const marginY = showDimensions ? 80 : 35;
  const frameFace = Math.min(65, Math.max(38, Math.round(maxH * 0.08)));
  const sashFace = 68;

  const x0 = marginX;
  const y1 = marginY + maxH;
  const x1 = marginX + BW;
  const y0 = y1 - maxH;

  // Corner coordinates in local window space
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

  // Mouse / Pointer Dragging for vertex drawing & 45° angle snapping
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingCorner, setDraggingCorner] = useState<
    'top_left' | 'top_right' | 'bottom_right' | 'bottom_left' | null
  >(null);
  const [activeSnapAngle, setActiveSnapAngle] = useState<number | null>(null);

  // Window body dragging state (repositioning window across drafting board)
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const [dragStart, setDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    startX: number;
    startY: number;
  } | null>(null);

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      setDraggingCorner(null);
      setActiveSnapAngle(null);
      if (isDraggingWindow) {
        setIsDraggingWindow(false);
        setDragStart(null);
      }
      if (isDrawingWindowEdge) {
        commitDrawnWindowEdge();
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('mouseup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
    };
  }, [isDraggingWindow, isDrawingWindowEdge, drawStart, drawCurrent]);

  const getSvgCoords = (e: React.PointerEvent | React.MouseEvent | PointerEvent | MouseEvent | Touch) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const viewBoxWidth = BOARD_W / zoom;
    const viewBoxHeight = BOARD_H / zoom;
    const scaleX = viewBoxWidth / rect.width;
    const scaleY = viewBoxHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const commitDrawnWindowEdge = () => {
    if (drawStart && drawCurrent) {
      const minX = Math.min(drawStart.x, drawCurrent.x);
      const minY = Math.min(drawStart.y, drawCurrent.y);
      let dw = Math.max(300, Math.round(Math.abs(drawCurrent.x - drawStart.x)));
      let dh = Math.max(300, Math.round(Math.abs(drawCurrent.y - drawStart.y)));

      // 45-degree angle snap
      const is45 = Math.abs(dw - dh) < 45;
      if (is45) {
        const avg = Math.round((dw + dh) / 2);
        dw = avg;
        dh = avg;
      }

      onDimensionsChange?.({
        width: dw,
        height: dh,
        bottomWidth: dw,
        topWidth: dw,
        leftHeight: dh,
        rightHeight: dh,
        slopeAngle: is45 ? 45 : 0,
      });

      setWindowPos({ x: Math.round(minX), y: Math.round(minY) });
      onPositionChange?.({ boardX: Math.round(minX), boardY: Math.round(minY) });
    }

    setIsDrawingWindowEdge(false);
    setDrawStart(null);
    setDrawCurrent(null);
    setBoardTool('modify');
  };

  const handleCornerPointerDown = (
    corner: 'top_left' | 'top_right' | 'bottom_right' | 'bottom_left',
    e: React.PointerEvent<any> | React.MouseEvent<any>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingCorner(corner);
  };

  const handleWindowPointerDown = (e: React.PointerEvent<any> | React.MouseEvent<any>) => {
    e.stopPropagation();
    const coords = getSvgCoords(e);
    setIsDraggingWindow(true);
    setDragStart({
      mouseX: coords.x,
      mouseY: coords.y,
      startX: windowPos.x,
      startY: windowPos.y,
    });
  };

  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (boardTool === 'draw') {
      e.preventDefault();
      const coords = getSvgCoords(e);
      setIsDrawingWindowEdge(true);
      setDrawStart(coords);
      setDrawCurrent(coords);
      return;
    }
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const coords = getSvgCoords(e);
    const mouseX = coords.x;
    const mouseY = coords.y;

    // Direct Window Edge Drawing (Displays architectural window edge live as user draws with hand/stylus)
    if (isDrawingWindowEdge && drawStart) {
      setDrawCurrent(coords);
      return;
    }

    // Moving window across drafting board
    if (isDraggingWindow && dragStart) {
      const dx = mouseX - dragStart.mouseX;
      const dy = mouseY - dragStart.mouseY;
      const newX = Math.max(40, Math.min(BOARD_W - maxW - 40, Math.round(dragStart.startX + dx)));
      const newY = Math.max(40, Math.min(BOARD_H - maxH - 40, Math.round(dragStart.startY + dy)));
      setWindowPos({ x: newX, y: newY });
      onPositionChange?.({ boardX: newX, boardY: newY });
      return;
    }

    // Dragging corner vertices for sizing and 45° angle snapping
    if (!draggingCorner) return;

    // Coordinates relative to the window origin
    const relX = mouseX - windowPos.x;
    const relY = mouseY - windowPos.y;

    if (draggingCorner === 'top_left') {
      let newLH = Math.max(0, Math.min(3500, Math.round(y1 - relY)));
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
      let newRH = Math.max(0, Math.min(3500, Math.round(y1 - relY)));
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
      let newBW = Math.max(300, Math.min(3500, Math.round(relX - x0)));
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
      let newBW = Math.max(300, Math.min(3500, Math.round(x1 - relX)));
      onDimensionsChange?.({
        bottomWidth: newBW,
        topWidth: newBW,
        width: newBW,
      });
    }
  };

  const handleSvgPointerUp = () => {
    if (isDrawingWindowEdge) {
      commitDrawnWindowEdge();
    }
  };

  // 2-Finger Touch Pinch-to-Zoom for tablets & mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistance !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDistance;
      setZoom((z) => Math.max(0.45, Math.min(2.5, Number((z * factor).toFixed(2)))));
      setTouchDistance(dist);
    }
  };

  const handleTouchEnd = () => {
    setTouchDistance(null);
  };

  // Trackpad / Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom((z) => Math.max(0.45, Math.min(2.5, Number((z + delta).toFixed(2)))));
    }
  };

  const handleBoardClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingCorner || isDraggingWindow || isDrawingWindowEdge) return;
    if (boardTool === 'add_window') {
      const coords = getSvgCoords(e);
      onAddNewWindow?.({
        x: Math.max(80, Math.round(coords.x - 300)),
        y: Math.max(80, Math.round(coords.y - 200)),
      });
      setBoardTool('modify');
    }
  };

  const handleBoardDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getSvgCoords(e);
    onAddNewWindow?.({
      x: Math.max(80, Math.round(coords.x - 300)),
      y: Math.max(80, Math.round(coords.y - 200)),
    });
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
      {/* Top Floating CAD Drafting Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs">
        {/* Tool: Draw Window Edge (Hand / Touch on tablet/mobile) */}
        <button
          type="button"
          onClick={() => setBoardTool('draw')}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            boardTool === 'draw'
              ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Draw window edge with Hand / Touch on tablet, laptop or mobile (Renders edge directly)"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Draw Edge (Hand/Touch)</span>
        </button>

        {/* Tool: Corner Snap */}
        <button
          type="button"
          onClick={() => setBoardTool('modify')}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            boardTool === 'modify'
              ? 'bg-[#0A2E8A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Drag corner nodes to resize & snap 45°"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Corner Snap</span>
        </button>

        {/* Tool: Drag Move Window */}
        <button
          type="button"
          onClick={() => setBoardTool('move')}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            boardTool === 'move'
              ? 'bg-[#0A2E8A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Drag the window to move anywhere on the board"
        >
          <Move className="w-3.5 h-3.5" />
          <span>Move Window</span>
        </button>

        {/* Tool: Click to Place Window */}
        <button
          type="button"
          onClick={() => {
            if (boardTool === 'add_window') {
              setBoardTool('modify');
            } else {
              setBoardTool('add_window');
            }
          }}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            boardTool === 'add_window'
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-xs'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
          }`}
          title="Click anywhere on the board to place a new window"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{boardTool === 'add_window' ? 'Click Board to Place' : 'Click to Add Window'}</span>
        </button>

        <div className="h-4 w-px bg-slate-200" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 text-slate-500">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.45, Number((z - 0.15).toFixed(2))))}
            className="p-1 hover:bg-slate-100 rounded text-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] font-bold px-1 text-slate-600">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
            className="p-1 hover:bg-slate-100 rounded text-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Touch / Hand Drawing Banner Hint when in Draw mode */}
      {boardTool === 'draw' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-blue-900/90 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg pointer-events-none flex items-center gap-2">
          <PenTool className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
          <span>Hand / Touch Mode: Drag your finger or pen to draw window edges</span>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${BOARD_W / zoom} ${BOARD_H / zoom}`}
        className={`w-full h-full drop-shadow-sm transition-all duration-150 touch-none select-none ${
          boardTool === 'draw'
            ? 'cursor-crosshair'
            : boardTool === 'add_window'
            ? 'cursor-crosshair'
            : isDraggingWindow
            ? 'cursor-grabbing'
            : boardTool === 'move'
            ? 'cursor-grab'
            : 'cursor-default'
        }`}
        style={{
          touchAction: 'none',
          backgroundColor: mode === 'blueprint' ? '#F8FAFC' : '#F1F5F9',
        }}
        onPointerDown={handleSvgPointerDown}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onClick={handleBoardClick}
        onDoubleClick={handleBoardDoubleClick}
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
            width={BOARD_W * 2}
            height={BOARD_H * 2}
            fill="url(#cadGrid)"
          />
        )}

        {/* Render other windows in the project on the drafting board */}
        {allWindows &&
          allWindows
            .filter((w) => w.id !== activeWindowId)
            .map((w, index) => {
              const otherX = w.boardX !== undefined ? w.boardX : (index + 1) * (maxW + 450);
              const otherY = w.boardY !== undefined ? w.boardY : windowPos.y;
              const otherW = w.bottomWidth || w.width || 1200;
              const otherH = w.leftHeight || w.height || 1200;
              return (
                <g
                  key={`other-win-${w.id}`}
                  transform={`translate(${otherX}, ${otherY})`}
                  className="cursor-pointer group opacity-75 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWindow?.(w.id);
                  }}
                >
                  <rect
                    x="0"
                    y="0"
                    width={otherW}
                    height={otherH}
                    fill="#FFFFFF"
                    stroke="#64748B"
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                    rx="4"
                  />
                  <rect
                    x="20"
                    y="20"
                    width={Math.max(20, otherW - 40)}
                    height={Math.max(20, otherH - 40)}
                    fill="url(#clearGrad)"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                  <g transform={`translate(${otherW / 2}, ${otherH / 2})`}>
                    <rect
                      x="-75"
                      y="-18"
                      width="150"
                      height="36"
                      rx="8"
                      fill="#0A2E8A"
                      className="group-hover:fill-blue-600 drop-shadow-md"
                    />
                    <text
                      x="0"
                      y="-3"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {w.id} • {w.name.replace(/Window \d+ \((.*)\)/, '$1')}
                    </text>
                    <text
                      x="0"
                      y="11"
                      textAnchor="middle"
                      fill="#93C5FD"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {otherW} × {otherH} mm (Click to Edit)
                    </text>
                  </g>
                </g>
              );
            })}

        {/* ================================================================= */}
        {/* REAL-TIME ARCHITECTURAL WINDOW EDGE DRAWING (Hand / Touch / Pen)  */}
        {/* Whatever user draws appears directly as clean window edge!        */}
        {/* ================================================================= */}
        {isDrawingWindowEdge && drawStart && drawCurrent && (() => {
          const minX = Math.min(drawStart.x, drawCurrent.x);
          const minY = Math.min(drawStart.y, drawCurrent.y);
          let dw = Math.max(60, Math.round(Math.abs(drawCurrent.x - drawStart.x)));
          let dh = Math.max(60, Math.round(Math.abs(drawCurrent.y - drawStart.y)));
          const is45 = Math.abs(dw - dh) < 45;
          if (is45) {
            const avg = Math.round((dw + dh) / 2);
            dw = avg;
            dh = avg;
          }
          const frameF = Math.min(65, Math.max(28, Math.round(dh * 0.08)));

          return (
            <g id="live-drawn-window-edge" className="pointer-events-none">
              {/* Outer Architectural Window Profile Edge */}
              <rect
                x={minX}
                y={minY}
                width={dw}
                height={dh}
                fill={profileFillColor}
                stroke="#0A2E8A"
                strokeWidth="3.5"
                rx="3"
                className="drop-shadow-xl"
              />

              {/* Inner Daylight Glass Edge */}
              {dw > frameF * 2 && dh > frameF * 2 && (
                <rect
                  x={minX + frameF}
                  y={minY + frameF}
                  width={dw - frameF * 2}
                  height={dh - frameF * 2}
                  fill={glassFill}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                />
              )}

              {/* Miter Joint Corners */}
              <line x1={minX} y1={minY} x2={minX + frameF} y2={minY + frameF} stroke="#0A2E8A" strokeWidth="1.5" />
              <line x1={minX + dw} y1={minY} x2={minX + dw - frameF} y2={minY + frameF} stroke="#0A2E8A" strokeWidth="1.5" />
              <line x1={minX} y1={minY + dh} x2={minX + frameF} y2={minY + dh - frameF} stroke="#0A2E8A" strokeWidth="1.5" />
              <line x1={minX + dw} y1={minY + dh} x2={minX + dw - frameF} y2={minY + dh - frameF} stroke="#0A2E8A" strokeWidth="1.5" />

              {/* Top Width Edge Callout Pill */}
              <g transform={`translate(${minX + dw / 2}, ${minY - 18})`}>
                <rect x="-50" y="-12" width="100" height="24" rx="12" fill="#0A2E8A" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {dw} mm
                </text>
              </g>

              {/* Left Height Edge Callout Pill */}
              <g transform={`translate(${minX - 24}, ${minY + dh / 2}) rotate(-90)`}>
                <rect x="-50" y="-12" width="100" height="24" rx="12" fill="#0A2E8A" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {dh} mm
                </text>
              </g>

              {/* 45° Snap Badge */}
              {is45 && (
                <g transform={`translate(${minX + dw / 2}, ${minY + dh / 2})`}>
                  <rect x="-55" y="-14" width="110" height="28" rx="14" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" className="drop-shadow-md" />
                  <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="monospace">
                    45.0° SNAP
                  </text>
                </g>
              )}
            </g>
          );
        })()}

        {/* ================================================================= */}
        {/* ACTIVE WINDOW UNIT (Positioned on Drafting Board & Draggable)     */}
        {/* ================================================================= */}
        <g id="active-window-unit" transform={`translate(${windowPos.x}, ${windowPos.y})`}>
          {/* Active Window Move Grip Handle */}
          <g
            className="cursor-grab active:cursor-grabbing select-none group"
            onPointerDown={handleWindowPointerDown}
            onMouseDown={handleWindowPointerDown}
            transform={`translate(${x0 + BW / 2}, ${y0 - 58})`}
          >
            <rect
              x="-95"
              y="-15"
              width="190"
              height="28"
              rx="14"
              fill="#0A2E8A"
              className="group-hover:fill-blue-700 transition-colors drop-shadow-md"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="bold"
            >
              ⠿ {activeWindowId} • Drag to Move
            </text>
          </g>

          {/* =============================================================== */}
          {/* 1. OUTER FRAME & SASHES (Standard Rectangular Windows)         */}
          {/* =============================================================== */}
          {!isAngledShape ? (
            <g id="rectangular-window">
              <g
                id="outer-frame"
                className={boardTool === 'move' ? 'cursor-grab active:cursor-grabbing' : undefined}
                onPointerDown={boardTool === 'move' ? handleWindowPointerDown : undefined}
                onMouseDown={boardTool === 'move' ? handleWindowPointerDown : undefined}
              >
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
              onPointerDown={(e) => handleCornerPointerDown(h.id, e)}
              onMouseDown={(e) => handleCornerPointerDown(h.id, e)}
              className="hover:scale-125 transition-transform drop-shadow-sm touch-none"
            />
          ))}
        </g>
        </g>
      </svg>
    </div>
  );
};
