'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ParametricWindowDesign } from '@/lib/design/types';
import {
  RotateCcw,
  Eye,
  Layers,
  Box,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Building2,
  Compass,
} from 'lucide-react';

interface Precision3DViewProps {
  design: ParametricWindowDesign;
  onClose?: () => void;
}

export const Precision3DView: React.FC<Precision3DViewProps> = ({ design, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'model' | 'wall' | 'section'>('model');
  const [cameraAngle, setCameraAngle] = useState<'iso' | 'front' | 'top' | 'side'>('iso');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const windowGroupRef = useRef<THREE.Group | null>(null);

  // Profile dimensions scaled for 3D visualization (1 unit = 100mm)
  const W = (design.width || 1800) / 100;
  const H = (design.height || 1200) / 100;
  const frameFace = 0.6; // 60mm
  const frameDepth = 0.8; // 80mm outer frame depth
  const sashFace = 0.64; // 64mm
  const sashDepth = 0.45; // 45mm sash depth

  // Texture creation for 3D Dimension Text Sprites
  const createTextSprite = (text: string, color = '#1B64F2') => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(10, 10, 492, 108, 16);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = color;
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = 'bold 54px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3, 0.75, 1);
    return sprite;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#F1F5F9');

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(W * 1.4, H * 1.2, Math.max(W, H) * 2.2);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(W / 2, H / 2, 0);
    controls.update();

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(20, 40, 30);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x90b0e0, 0.6);
    dirLight2.position.set(-20, -10, -20);
    scene.add(dirLight2);

    // 6. Ground Grid
    const grid = new THREE.GridHelper(40, 40, 0xc0c8d8, 0xe2e8f0);
    grid.position.set(W / 2, -0.05, 0);
    scene.add(grid);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Re-build 3D Window Mesh when design or viewMode changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (windowGroupRef.current) {
      scene.remove(windowGroupRef.current);
    }

    const windowGroup = new THREE.Group();
    windowGroupRef.current = windowGroup;

    // Materials
    // Frame Material based on color
    const color = design.profileColor || (design as any).color || 'pure_white';
    const frameColorHex =
      color === 'anthracite'
        ? 0x2b2e35
        : color === 'golden_oak'
        ? 0x6e4324
        : color === 'bronze'
        ? 0x4a3c31
        : 0xf4f6f9; // Pure White

    const frameMat = new THREE.MeshStandardMaterial({
      color: frameColorHex,
      roughness: 0.35,
      metalness: 0.15,
    });

    const sashMat = new THREE.MeshStandardMaterial({
      color: frameColorHex,
      roughness: 0.3,
      metalness: 0.2,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xcde8fa,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.52,
    });

    const dimLineMat = new THREE.LineBasicMaterial({ color: 0x1b64f2, linewidth: 2 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });

    // ==========================================
    // 1. OUTER FRAME (Top, Bottom, Left, Right)
    // ==========================================
    // Bottom Jamb
    const botFrame = new THREE.Mesh(new THREE.BoxGeometry(W, frameFace, frameDepth), frameMat);
    botFrame.position.set(W / 2, frameFace / 2, 0);
    botFrame.castShadow = true;
    botFrame.receiveShadow = true;
    windowGroup.add(botFrame);

    // Top Head
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(W, frameFace, frameDepth), frameMat);
    topFrame.position.set(W / 2, H - frameFace / 2, 0);
    topFrame.castShadow = true;
    topFrame.receiveShadow = true;
    windowGroup.add(topFrame);

    // Left Jamb
    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameFace, H - frameFace * 2, frameDepth), frameMat);
    leftFrame.position.set(frameFace / 2, H / 2, 0);
    leftFrame.castShadow = true;
    leftFrame.receiveShadow = true;
    windowGroup.add(leftFrame);

    // Right Jamb
    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameFace, H - frameFace * 2, frameDepth), frameMat);
    rightFrame.position.set(W - frameFace / 2, H / 2, 0);
    rightFrame.castShadow = true;
    rightFrame.receiveShadow = true;
    windowGroup.add(rightFrame);

    // ==========================================
    // 2. PANELS & SASHES
    // ==========================================
    const innerW = W - frameFace * 2;
    const innerH = H - frameFace * 2;
    const panelCount = Math.max(1, design.panels.length || 2);

    design.panels.forEach((p, idx) => {
      const pW = innerW * (p.widthRatio || 1 / panelCount);
      const pX = frameFace + innerW * (p.xRatio || idx / panelCount) + pW / 2;
      const pY = frameFace + innerH / 2;

      // Track offset along Z (Front track = +0.18, Back track = -0.18)
      const isFrontTrack = idx % 2 === 0;
      const zOffset = isFrontTrack ? 0.16 : -0.16;

      const panelGroup = new THREE.Group();
      panelGroup.position.set(pX, pY, zOffset);

      if (p.panelType === 'sliding' || p.panelType === 'casement') {
        // Sash Frame Box Extrusions
        // Sash Top & Bottom
        const sTop = new THREE.Mesh(new THREE.BoxGeometry(pW, sashFace, sashDepth), sashMat);
        sTop.position.set(0, innerH / 2 - sashFace / 2, 0);
        const sBot = new THREE.Mesh(new THREE.BoxGeometry(pW, sashFace, sashDepth), sashMat);
        sBot.position.set(0, -innerH / 2 + sashFace / 2, 0);

        // Sash Left & Right
        const sLeft = new THREE.Mesh(new THREE.BoxGeometry(sashFace, innerH - sashFace * 2, sashDepth), sashMat);
        sLeft.position.set(-pW / 2 + sashFace / 2, 0, 0);
        const sRight = new THREE.Mesh(new THREE.BoxGeometry(sashFace, innerH - sashFace * 2, sashDepth), sashMat);
        sRight.position.set(pW / 2 - sashFace / 2, 0, 0);

        panelGroup.add(sTop, sBot, sLeft, sRight);

        // Glass Pane inside Sash
        const gW = pW - sashFace * 2;
        const gH = innerH - sashFace * 2;
        const glass = new THREE.Mesh(new THREE.BoxGeometry(gW, gH, 0.08), glassMat);
        panelGroup.add(glass);

        // Handle
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16), handleMat);
        handle.position.set(isFrontTrack ? pW / 2 - sashFace / 2 : -pW / 2 + sashFace / 2, 0, sashDepth / 2 + 0.06);
        panelGroup.add(handle);
      } else {
        // Direct Glaze / Fixed Panel
        const glass = new THREE.Mesh(new THREE.BoxGeometry(pW, innerH, 0.08), glassMat);
        panelGroup.add(glass);
      }

      windowGroup.add(panelGroup);
    });

    // ==========================================
    // 3. BLUEPRINT BLUE 3D DIMENSION ARROWS
    // ==========================================
    // Overall Width Dimension Line (Bottom)
    const wDimY = -0.6;
    const wLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, wDimY, 0),
      new THREE.Vector3(W, wDimY, 0),
    ]);
    const wLine = new THREE.Line(wLineGeo, dimLineMat);
    windowGroup.add(wLine);

    // Width Extension Ticks
    const wTick1 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, wDimY - 0.2, 0)]),
      dimLineMat
    );
    const wTick2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(W, 0, 0), new THREE.Vector3(W, wDimY - 0.2, 0)]),
      dimLineMat
    );
    windowGroup.add(wTick1, wTick2);

    // Width Text Sprite
    const wSprite = createTextSprite(`${design.width} mm`);
    wSprite.position.set(W / 2, wDimY - 0.4, 0);
    windowGroup.add(wSprite);

    // Overall Height Dimension Line (Left)
    const hDimX = -0.8;
    const hLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(hDimX, 0, 0),
      new THREE.Vector3(hDimX, H, 0),
    ]);
    const hLine = new THREE.Line(hLineGeo, dimLineMat);
    windowGroup.add(hLine);

    // Height Extension Ticks
    const hTick1 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(hDimX - 0.2, 0, 0)]),
      dimLineMat
    );
    const hTick2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, H, 0), new THREE.Vector3(hDimX - 0.2, H, 0)]),
      dimLineMat
    );
    windowGroup.add(hTick1, hTick2);

    // Height Text Sprite
    const hSprite = createTextSprite(`${design.height} mm`);
    hSprite.position.set(hDimX - 0.6, H / 2, 0);
    windowGroup.add(hSprite);

    // ==========================================
    // 4. WALL APERTURE MODE (MASONRY CUTOUT)
    // ==========================================
    if (viewMode === 'wall') {
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0xdfd9ce,
        roughness: 0.9,
      });
      const lintelMat = new THREE.MeshStandardMaterial({
        color: 0x9ca3af,
        roughness: 0.7,
      });

      const wallThick = 2.5; // 250mm masonry wall
      const wallPad = 3.0;

      // Concrete Lintel above
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(W + wallPad * 2, 1.5, wallThick), lintelMat);
      lintel.position.set(W / 2, H + 0.75, -wallThick / 2 + frameDepth / 2);
      windowGroup.add(lintel);

      // Brick wall Left
      const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(wallPad, H + 1.5, wallThick), wallMat);
      wallLeft.position.set(-wallPad / 2, (H + 1.5) / 2, -wallThick / 2 + frameDepth / 2);
      windowGroup.add(wallLeft);

      // Brick wall Right
      const wallRight = new THREE.Mesh(new THREE.BoxGeometry(wallPad, H + 1.5, wallThick), wallMat);
      wallRight.position.set(W + wallPad / 2, (H + 1.5) / 2, -wallThick / 2 + frameDepth / 2);
      windowGroup.add(wallRight);

      // Stone Sill below
      const sillMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
      const sill = new THREE.Mesh(new THREE.BoxGeometry(W + 0.8, 0.4, wallThick + 0.4), sillMat);
      sill.position.set(W / 2, -0.2, -wallThick / 2 + frameDepth / 2 + 0.2);
      windowGroup.add(sill);
    }

    // ==========================================
    // 5. PROFILE CROSS SECTION MODE
    // ==========================================
    if (viewMode === 'section') {
      // Create detailed profile cross section slice
      const secGroup = new THREE.Group();
      secGroup.position.set(W + 2, H / 2, 0);

      // Multi-chamber extrusion body
      const secMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
      const steelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 }); // Yellow GI steel
      const gasketMat = new THREE.MeshStandardMaterial({ color: 0xe11d48 }); // Red/orange EPDM gasket

      const chamberOuter = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.3), secMat);
      const steelCore = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.32), steelMat);
      const gasket1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.35), gasketMat);
      gasket1.position.set(0.5, 0.7, 0);
      const gasket2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.35), gasketMat);
      gasket2.position.set(-0.5, 0.7, 0);

      const secSprite = createTextSprite('SEC A-A Extrusion Chamber');
      secSprite.position.set(0, 1.3, 0);
      secSprite.scale.set(2.4, 0.6, 1);

      secGroup.add(chamberOuter, steelCore, gasket1, gasket2, secSprite);
      windowGroup.add(secGroup);
    }

    scene.add(windowGroup);
  }, [design, viewMode]);

  // Handle Camera Presets
  const setPresetCamera = (type: 'iso' | 'front' | 'top' | 'side') => {
    setCameraAngle(type);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (type === 'front') {
      camera.position.set(W / 2, H / 2, Math.max(W, H) * 2.4);
    } else if (type === 'top') {
      camera.position.set(W / 2, Math.max(W, H) * 2.8, 0.01);
    } else if (type === 'side') {
      camera.position.set(-Math.max(W, H) * 2.2, H / 2, 0);
    } else {
      // iso
      camera.position.set(W * 1.4, H * 1.2, Math.max(W, H) * 2.2);
    }
    controls.target.set(W / 2, H / 2, 0);
    controls.update();
  };

  const handleZoom = (factor: number) => {
    const camera = cameraRef.current;
    if (camera) {
      camera.position.multiplyScalar(factor);
      camera.updateProjectionMatrix();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[580px] bg-slate-900 overflow-hidden flex flex-col select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Mode Switchers (3D Model, Wall Aperture, Cross Section) */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setViewMode('model')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'model'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Model</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('wall')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'wall'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="View window installed in architectural masonry wall opening"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Wall Aperture</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('section')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'section'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Profile cross-section chambers & reinforcement"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cross-Section</span>
          </button>
        </div>

        {/* Right: Camera Angle Presets & Close */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setPresetCamera('iso')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
              cameraAngle === 'iso' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Isometric 3D Perspective"
          >
            3D Iso
          </button>
          <button
            type="button"
            onClick={() => setPresetCamera('front')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
              cameraAngle === 'front' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Front Elevation View"
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setPresetCamera('top')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
              cameraAngle === 'top' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Top Plan View"
          >
            Top
          </button>
          <button
            type="button"
            onClick={() => setPresetCamera('side')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
              cameraAngle === 'side' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Side Section View"
          >
            Side
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <button
            type="button"
            onClick={() => handleZoom(0.85)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1.15)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPresetCamera('iso')}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Orbit Camera"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Bottom Floating Legend / Specs */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center gap-4 shadow-lg pointer-events-none">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Aperture Size</span>
          <span className="font-mono font-bold text-white">
            {design.width} × {design.height} mm
          </span>
        </div>
        <div className="w-px h-6 bg-slate-700" />
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Panels</span>
          <span className="font-bold text-white">{design.panels?.length || 2} Panels</span>
        </div>
        <div className="w-px h-6 bg-slate-700" />
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Orbit Instructions</span>
          <span className="text-indigo-400 font-medium">Left-click: Rotate • Right-click: Pan • Scroll: Zoom</span>
        </div>
      </div>
    </div>
  );
};
