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
  ArrowLeft,
} from 'lucide-react';

interface Precision3DViewProps {
  design: ParametricWindowDesign;
  onClose?: () => void;
}

export const Precision3DView: React.FC<Precision3DViewProps> = ({ design, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'model' | 'wall' | 'section'>('model');
  const [cameraAngle, setCameraAngle] = useState<'iso' | 'front' | 'top' | 'side'>('iso');
  const [showFloor, setShowFloor] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const windowGroupRef = useRef<THREE.Group | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const animatedSashesRef = useRef<Array<{
    group: THREE.Group;
    type: 'sliding' | 'casement';
    initialX: number;
    initialRotY: number;
    maxTravel: number;
    direction: number;
  }>>([]);
  const isAnimatingRef = useRef(false);
  isAnimatingRef.current = isAnimating;


  // Scaled dimensions for 3D visualization (1 unit = 100mm)
  const W = Math.max(4, (design.width || 1800) / 100);
  const panels = design.panels || [];
  const isStandaloneArch = Boolean(design.hasArch && (panels.length === 0 || (design.height || 0) === 0));
  const archH = design.hasArch ? Math.max(2, (design.archHeight || 350) / 100) : 0;
  const H = isStandaloneArch ? 0 : Math.max(3, (design.height || 1500) / 100);
  const totalH = isStandaloneArch ? archH : H + archH;

  const frameFace = 0.6; // 60mm frame profile
  const frameDepth = 0.8; // 80mm outer frame depth
  const sashFace = 0.64; // 64mm sash profile
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
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3.2, 0.8, 1);
    return sprite;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(showFloor ? '#ffffff' : '#0F172A'); // Studio white or dark blueprint

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    const midY = totalH / 2;
    camera.position.set(W * 1.3, midY + totalH * 0.7, Math.max(W, totalH) * 2.2);

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
    controls.target.set(W / 2, midY, 0);
    controls.update();

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(25, 45, 35);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xb0c4de, 0.7);
    dirLight2.position.set(-25, -15, -25);
    scene.add(dirLight2);

    // 6. Architectural Ceramic Tile Floor (Matching WindoorCraft Studio)
    const createTileCanvas = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#bfae99';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#cbbba7';
        ctx.fillRect(4, 4, 504, 504);
        ctx.fillStyle = '#d4c5b1';
        ctx.fillRect(8, 8, 244, 244);
        ctx.fillRect(260, 8, 244, 244);
        ctx.fillRect(8, 260, 244, 244);
        ctx.fillRect(260, 260, 244, 244);
        ctx.strokeStyle = '#9c8b78';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 508, 508);
        ctx.beginPath();
        ctx.moveTo(256, 0); ctx.lineTo(256, 512);
        ctx.moveTo(0, 256); ctx.lineTo(512, 256);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(16, 16);
      return tex;
    };

    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createTileCanvas(),
      roughness: 0.45,
      metalness: 0.08,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(W / 2, -0.01, 0);
    floorMesh.receiveShadow = true;
    floorMesh.visible = showFloor;
    scene.add(floorMesh);
    floorMeshRef.current = floorMesh;

    // 7. Ground Grid (for CAD blueprint mode)
    const grid = new THREE.GridHelper(40, 40, 0x334155, 0x1e293b);
    grid.position.set(W / 2, -0.02, 0);
    grid.visible = !showFloor;
    scene.add(grid);
    gridHelperRef.current = grid;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isAnimatingRef.current) {
        const progress = (Math.sin(Date.now() * 0.0025) + 1) / 2;
        animatedSashesRef.current.forEach((item) => {
          if (item.type === 'sliding') {
            item.group.position.x = item.initialX + item.maxTravel * item.direction * progress;
          } else if (item.type === 'casement') {
            item.group.rotation.y = item.initialRotY + THREE.MathUtils.degToRad(35) * item.direction * progress;
          }
        });
      }
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

  // Floor visibility toggle effect
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (floorMeshRef.current) {
      floorMeshRef.current.visible = showFloor;
    }
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = !showFloor;
    }
    scene.background = new THREE.Color(showFloor ? '#ffffff' : '#0F172A');
  }, [showFloor]);

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
    const color = design.profileColor || (design as any).color || 'pure_white';
    const frameColorHex =
      color === 'anthracite'
        ? 0x242831
        : color === 'golden_oak'
        ? 0x6e4324
        : color === 'bronze'
        ? 0x3e3229
        : 0xf1f5f9; // Pure White Architectural UPVC/Aluminium

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
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.52,
    });

    const louverMat = new THREE.MeshStandardMaterial({
      color: frameColorHex,
      roughness: 0.4,
      metalness: 0.3,
    });

    const dimLineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const archDimLineMat = new THREE.LineBasicMaterial({ color: 0xc084fc, linewidth: 2 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85, roughness: 0.15 });

    // =========================================================================
    // HELPER: BUILD 3D ARCH PROFILE EXTRUSION
    // =========================================================================
    const buildArchMesh = (baseY: number, archWidth: number, archRise: number) => {
      const archGroup = new THREE.Group();
      archGroup.position.set(0, baseY, 0);

      const a = archWidth / 2;
      const b = archRise;
      const innerA = Math.max(0.2, a - frameFace);
      const innerB = Math.max(0.2, b - frameFace);
      const isGothic = design.archType === 'gothic';

      const outerShape = new THREE.Shape();
      const innerHole = new THREE.Path();
      const glassShape = new THREE.Shape();

      if (isGothic) {
        // GOTHIC POINTED ARCH (Apex at (a, b))
        // Outer boundary (CCW: (0,0) -> (archWidth,0) -> apex (a,b) -> (0,0))
        outerShape.moveTo(0, 0);
        outerShape.lineTo(archWidth, 0);
        outerShape.quadraticCurveTo(archWidth, b * 0.88, a, b);
        outerShape.quadraticCurveTo(0, b * 0.88, 0, 0);
        outerShape.closePath();

        // Inner hollow opening (CW: (a - innerA, 0) -> apex (a, innerB) -> (a + innerA, 0) -> (a - innerA, 0))
        innerHole.moveTo(a - innerA, 0);
        innerHole.quadraticCurveTo(a - innerA, innerB * 0.88, a, innerB);
        innerHole.quadraticCurveTo(a + innerA, innerB * 0.88, a + innerA, 0);
        innerHole.lineTo(a - innerA, 0);
        innerHole.closePath();
        outerShape.holes.push(innerHole);

        // Glass pane (CCW)
        glassShape.moveTo(a - innerA, 0);
        glassShape.lineTo(a + innerA, 0);
        glassShape.quadraticCurveTo(a + innerA, innerB * 0.88, a, innerB);
        glassShape.quadraticCurveTo(a - innerA, innerB * 0.88, a - innerA, 0);
        glassShape.closePath();

        // Gothic decorative mullions: Center mullion + 2 lancet vertical mullions
        const centerMullionGeo = new THREE.BoxGeometry(0.12, innerB, frameDepth * 0.7);
        const centerMullionMesh = new THREE.Mesh(centerMullionGeo, frameMat);
        centerMullionMesh.position.set(a, innerB / 2, 0);
        archGroup.add(centerMullionMesh);

        const sideH = innerB * 0.68;
        const leftMullionGeo = new THREE.BoxGeometry(0.1, sideH, frameDepth * 0.7);
        const leftMullionMesh = new THREE.Mesh(leftMullionGeo, frameMat);
        leftMullionMesh.position.set(a - innerA * 0.5, sideH / 2, 0);
        archGroup.add(leftMullionMesh);

        const rightMullionMesh = new THREE.Mesh(leftMullionGeo, frameMat);
        rightMullionMesh.position.set(a + innerA * 0.5, sideH / 2, 0);
        archGroup.add(rightMullionMesh);
      } else {
        // SEMI-CIRCULAR / ROUND ARCH
        // Outer boundary (CCW: start (0,0) -> line to (archWidth,0) -> arc up through (a,b) to (0,0))
        outerShape.moveTo(0, 0);
        outerShape.lineTo(archWidth, 0);
        const steps = 32;
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI; // 0 to PI
          const x = a + a * Math.cos(theta);
          const y = b * Math.sin(theta);
          outerShape.lineTo(x, y);
        }
        outerShape.closePath();

        // Inner hollow opening (CW: start (a - innerA, 0) -> arc up through (a, innerB) to (a + innerA, 0) -> line to start)
        innerHole.moveTo(a - innerA, 0);
        for (let i = steps; i >= 0; i--) {
          const theta = (i / steps) * Math.PI; // PI down to 0
          const x = a + innerA * Math.cos(theta);
          const y = innerB * Math.sin(theta);
          innerHole.lineTo(x, y);
        }
        innerHole.lineTo(a - innerA, 0);
        innerHole.closePath();
        outerShape.holes.push(innerHole);

        // Glass pane (CCW: start (a - innerA, 0) -> line to (a + innerA, 0) -> arc back to start)
        glassShape.moveTo(a - innerA, 0);
        glassShape.lineTo(a + innerA, 0);
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI; // 0 to PI
          const x = a + innerA * Math.cos(theta);
          const y = innerB * Math.sin(theta);
          glassShape.lineTo(x, y);
        }
        glassShape.closePath();

        // Sunburst Radial Mullions
        for (let i = 1; i <= 3; i++) {
          const theta = (i * Math.PI) / 4;
          const xEnd = a + innerA * Math.cos(theta);
          const yEnd = innerB * Math.sin(theta);

          const spokeLength = Math.sqrt((xEnd - a) * (xEnd - a) + yEnd * yEnd);
          const spokeGeo = new THREE.BoxGeometry(0.12, spokeLength, frameDepth * 0.7);
          const spokeMesh = new THREE.Mesh(spokeGeo, frameMat);
          spokeMesh.position.set((a + xEnd) / 2, yEnd / 2, 0);
          spokeMesh.rotation.z = Math.atan2(yEnd, xEnd - a) - Math.PI / 2;
          archGroup.add(spokeMesh);
        }
      }

      // Extrude outer frame profile
      const archFrameGeo = new THREE.ExtrudeGeometry(outerShape, { depth: frameDepth, bevelEnabled: false });
      const archFrameMesh = new THREE.Mesh(archFrameGeo, frameMat);
      archFrameMesh.position.set(0, 0, -frameDepth / 2);
      archFrameMesh.castShadow = true;
      archFrameMesh.receiveShadow = true;
      archGroup.add(archFrameMesh);

      // Extrude arch glass
      const glassGeo = new THREE.ExtrudeGeometry(glassShape, { depth: 0.08, bevelEnabled: false });
      const archGlassMesh = new THREE.Mesh(glassGeo, glassMat);
      archGlassMesh.position.set(0, 0, -0.04);
      archGroup.add(archGlassMesh);

      return archGroup;
    };

    // =========================================================================
    // SCENARIO 1: STANDALONE ARCH WINDOW (ONLY ARCH DRAGGED ONTO BLANK CANVAS)
    // =========================================================================
    if (isStandaloneArch) {
      // Bottom Sill Frame Extrusion
      const sill = new THREE.Mesh(new THREE.BoxGeometry(W, frameFace, frameDepth), frameMat);
      sill.position.set(W / 2, frameFace / 2, 0);
      sill.castShadow = true;
      sill.receiveShadow = true;
      windowGroup.add(sill);

      // Arch sits directly on the sill
      const archMesh = buildArchMesh(frameFace, W, archH);
      windowGroup.add(archMesh);

      // Dimensions: Width
      const wDimY = -0.6;
      const wLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, wDimY, 0), new THREE.Vector3(W, wDimY, 0)]),
        dimLineMat
      );
      const wTick1 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, wDimY - 0.2, 0)]),
        dimLineMat
      );
      const wTick2 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(W, 0, 0), new THREE.Vector3(W, wDimY - 0.2, 0)]),
        dimLineMat
      );
      const wSprite = createTextSprite(`${design.width || 1800} mm (Width)`, '#38bdf8');
      wSprite.position.set(W / 2, wDimY - 0.5, 0);
      windowGroup.add(wLine, wTick1, wTick2, wSprite);

      // Dimensions: Arch Rise
      const hDimX = -0.8;
      const hLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(hDimX, 0, 0), new THREE.Vector3(hDimX, frameFace + archH, 0)]),
        archDimLineMat
      );
      const hTick1 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(hDimX - 0.2, 0, 0)]),
        archDimLineMat
      );
      const hTick2 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(W / 2, frameFace + archH, 0), new THREE.Vector3(hDimX - 0.2, frameFace + archH, 0)]),
        archDimLineMat
      );
      const hSprite = createTextSprite(`${design.archHeight || 600} mm (Rise)`, '#c084fc');
      hSprite.position.set(hDimX - 0.7, (frameFace + archH) / 2, 0);
      windowGroup.add(hLine, hTick1, hTick2, hSprite);
    } else {
      // =========================================================================
      // SCENARIO 2: RECTANGULAR WINDOW OR ARCH + WINDOW COMBINATION
      // =========================================================================

      // 1. RECTANGULAR OUTER FRAME
      // Bottom Jamb
      const botFrame = new THREE.Mesh(new THREE.BoxGeometry(W, frameFace, frameDepth), frameMat);
      botFrame.position.set(W / 2, frameFace / 2, 0);
      botFrame.castShadow = true;
      botFrame.receiveShadow = true;
      windowGroup.add(botFrame);

      // Top Head / Coupling Transom
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

      // Arch on Top (Combination Mode)
      if (design.hasArch) {
        const archMesh = buildArchMesh(H, W, archH);
        windowGroup.add(archMesh);
      }

      // 2. INTERNAL PANELS, SASHES, LOUVERS & CASEMENTS
      const innerW = W - frameFace * 2;
      const innerH = H - frameFace * 2;
      const panelCount = Math.max(1, panels.length);
      animatedSashesRef.current = [];

      panels.forEach((p, idx) => {
        const pW = innerW * (p.widthRatio || 1 / panelCount);
        const pH = innerH * (p.heightRatio || 1);
        const pX = frameFace + innerW * (p.xRatio || idx / panelCount) + pW / 2;
        const pY = frameFace + innerH * (p.yRatio || 0) + pH / 2;

        const panelGroup = new THREE.Group();
        const isFrontTrack = idx % 2 === 0;
        const zOffset = p.panelType === 'sliding'
          ? (panelCount === 3 ? (idx - 1) * 0.22 : (isFrontTrack ? 0.16 : -0.16))
          : 0;
        panelGroup.position.set(pX, pY, zOffset);

        if (p.panelType === 'louver') {
          // ==========================================
          // 3D LOUVER VENTILATION SLATS
          // ==========================================
          // Louver Perimeter Frame
          const lTop = new THREE.Mesh(new THREE.BoxGeometry(pW, sashFace * 0.7, sashDepth), sashMat);
          lTop.position.set(0, pH / 2 - (sashFace * 0.7) / 2, 0);
          const lBot = new THREE.Mesh(new THREE.BoxGeometry(pW, sashFace * 0.7, sashDepth), sashMat);
          lBot.position.set(0, -pH / 2 + (sashFace * 0.7) / 2, 0);
          const lLeft = new THREE.Mesh(new THREE.BoxGeometry(sashFace * 0.7, pH, sashDepth), sashMat);
          lLeft.position.set(-pW / 2 + (sashFace * 0.7) / 2, 0, 0);
          const lRight = new THREE.Mesh(new THREE.BoxGeometry(sashFace * 0.7, pH, sashDepth), sashMat);
          lRight.position.set(pW / 2 - (sashFace * 0.7) / 2, 0, 0);
          panelGroup.add(lTop, lBot, lLeft, lRight);

          // Horizontal angled slats (10-14 slats)
          const slatCount = Math.max(6, Math.round(pH / 0.8));
          const slatW = pW - sashFace * 1.4;
          const slatH = 0.08;
          const slatD = 0.55;
          const slatStep = (pH - sashFace * 1.6) / slatCount;

          for (let s = 0; s < slatCount; s++) {
            const slatY = -pH / 2 + sashFace * 0.9 + s * slatStep + slatStep / 2;
            const slat = new THREE.Mesh(new THREE.BoxGeometry(slatW, slatH, slatD), louverMat);
            slat.position.set(0, slatY, 0);
            slat.rotation.x = THREE.MathUtils.degToRad(35); // 35-degree airflow angle
            slat.castShadow = true;
            panelGroup.add(slat);
          }
        } else if (p.panelType === 'casement') {
          // ==========================================
          // 3D OPENING CASEMENT SASH (HINGED PERSPECTIVE)
          // ==========================================
          const casementGroup = new THREE.Group();
          const isHingedLeft = p.openingDirection === 'casement_left';
          const hingeX = isHingedLeft ? -pW / 2 : pW / 2;
          casementGroup.position.set(hingeX, 0, 0);

          // Pivot rotation for realistic 3D open view (20 degrees open)
          const openAngle = isHingedLeft ? THREE.MathUtils.degToRad(-22) : THREE.MathUtils.degToRad(22);
          casementGroup.rotation.y = openAngle;

          const innerSashGroup = new THREE.Group();
          innerSashGroup.position.set(-hingeX, 0, 0);

          // Sash frame profile
          const sTop = new THREE.Mesh(new THREE.BoxGeometry(pW, sashFace, sashDepth), sashMat);
          sTop.position.set(0, pH / 2 - sashFace / 2, 0);
          const sBot = new THREE.Mesh(new THREE.BoxGeometry(pW, sashFace, sashDepth), sashMat);
          sBot.position.set(0, -pH / 2 + sashFace / 2, 0);
          const sLeft = new THREE.Mesh(new THREE.BoxGeometry(sashFace, pH - sashFace * 2, sashDepth), sashMat);
          sLeft.position.set(-pW / 2 + sashFace / 2, 0, 0);
          const sRight = new THREE.Mesh(new THREE.BoxGeometry(sashFace, pH - sashFace * 2, sashDepth), sashMat);
          sRight.position.set(pW / 2 - sashFace / 2, 0, 0);
          innerSashGroup.add(sTop, sBot, sLeft, sRight);

          // Glass pane
          const gW = pW - sashFace * 2;
          const gH = pH - sashFace * 2;
          const glass = new THREE.Mesh(new THREE.BoxGeometry(gW, gH, 0.08), glassMat);
          innerSashGroup.add(glass);

          // Handle on opposite side of hinge
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 16), handleMat);
          handle.position.set(isHingedLeft ? pW / 2 - sashFace / 2 : -pW / 2 + sashFace / 2, 0, sashDepth / 2 + 0.06);
          innerSashGroup.add(handle);

          casementGroup.add(innerSashGroup);
          panelGroup.add(casementGroup);

          animatedSashesRef.current.push({
            group: casementGroup,
            type: 'casement',
            initialX: hingeX,
            initialRotY: openAngle,
            maxTravel: 0,
            direction: isHingedLeft ? -1 : 1,
          });
        } else if (p.panelType === 'sliding') {
          // ==========================================
          // 3D SLIDING SASH
          // ==========================================
          const sashGroup = new THREE.Group();
          const sTop = new THREE.Mesh(new THREE.BoxGeometry(pW, sashFace, sashDepth), sashMat);
          sTop.position.set(0, pH / 2 - sashFace / 2, 0);
          const sBot = new THREE.Mesh(new THREE.BoxGeometry(pW, sashFace, sashDepth), sashMat);
          sBot.position.set(0, -pH / 2 + sashFace / 2, 0);
          const sLeft = new THREE.Mesh(new THREE.BoxGeometry(sashFace, pH - sashFace * 2, sashDepth), sashMat);
          sLeft.position.set(-pW / 2 + sashFace / 2, 0, 0);
          const sRight = new THREE.Mesh(new THREE.BoxGeometry(sashFace, pH - sashFace * 2, sashDepth), sashMat);
          sRight.position.set(pW / 2 - sashFace / 2, 0, 0);
          sashGroup.add(sTop, sBot, sLeft, sRight);

          const gW = pW - sashFace * 2;
          const gH = pH - sashFace * 2;
          const glass = new THREE.Mesh(new THREE.BoxGeometry(gW, gH, 0.08), glassMat);
          sashGroup.add(glass);

          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 16), handleMat);
          handle.position.set(isFrontTrack ? pW / 2 - sashFace / 2 : -pW / 2 + sashFace / 2, 0, sashDepth / 2 + 0.06);
          sashGroup.add(handle);

          panelGroup.add(sashGroup);

          animatedSashesRef.current.push({
            group: sashGroup,
            type: 'sliding',
            initialX: 0,
            initialRotY: 0,
            maxTravel: pW * 0.75,
            direction: p.openingDirection === 'sliding_left' ? -1 : 1,
          });
        } else {
          // Direct Glaze / Fixed Panel
          const glass = new THREE.Mesh(new THREE.BoxGeometry(pW, pH, 0.08), glassMat);
          panelGroup.add(glass);
        }

        windowGroup.add(panelGroup);
      });

      // 3. INTERNAL MULLIONS (Extruded vertical bars)
      if (design.mullions && design.mullions.length > 0) {
        design.mullions.forEach((m) => {
          const mX = frameFace + innerW * (m.positionRatio || 0.5);
          const mullionMesh = new THREE.Mesh(new THREE.BoxGeometry(frameFace * 0.8, innerH, frameDepth * 0.95), frameMat);
          mullionMesh.position.set(mX, H / 2, 0);
          mullionMesh.castShadow = true;
          windowGroup.add(mullionMesh);
        });
      }

      // 4. INTERNAL TRANSOMS (Extruded horizontal bars)
      if (design.transoms && design.transoms.length > 0) {
        design.transoms.forEach((t) => {
          const tY = frameFace + innerH * (1 - (t.positionRatio || 0.5));
          const transomMesh = new THREE.Mesh(new THREE.BoxGeometry(innerW, frameFace * 0.8, frameDepth * 0.95), frameMat);
          transomMesh.position.set(W / 2, tY, 0);
          transomMesh.castShadow = true;
          windowGroup.add(transomMesh);
        });
      }

      // =========================================================================
      // 5. BLUEPRINT BLUE 3D DIMENSION ARROWS & SPRITES
      // =========================================================================
      // Width Dimension Line
      const wDimY = -0.6;
      const wLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, wDimY, 0), new THREE.Vector3(W, wDimY, 0)]),
        dimLineMat
      );
      const wTick1 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, wDimY - 0.2, 0)]),
        dimLineMat
      );
      const wTick2 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(W, 0, 0), new THREE.Vector3(W, wDimY - 0.2, 0)]),
        dimLineMat
      );
      const wSprite = createTextSprite(`${design.width || 1800} mm (Width)`, '#38bdf8');
      wSprite.position.set(W / 2, wDimY - 0.5, 0);
      windowGroup.add(wLine, wTick1, wTick2, wSprite);

      // Height Dimension Line (Lower Window)
      const hDimX = -0.8;
      const hLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(hDimX, 0, 0), new THREE.Vector3(hDimX, H, 0)]),
        dimLineMat
      );
      const hTick1 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(hDimX - 0.2, 0, 0)]),
        dimLineMat
      );
      const hTick2 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, H, 0), new THREE.Vector3(hDimX - 0.2, H, 0)]),
        dimLineMat
      );
      const hSprite = createTextSprite(`${design.height || 1200} mm (Height)`, '#38bdf8');
      hSprite.position.set(hDimX - 0.7, H / 2, 0);
      windowGroup.add(hLine, hTick1, hTick2, hSprite);

      // Arch Dimensions if Combination
      if (design.hasArch) {
        const archDimX = -0.8;
        const aLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(archDimX, H, 0), new THREE.Vector3(archDimX, H + archH, 0)]),
          archDimLineMat
        );
        const aTick = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(W / 2, H + archH, 0), new THREE.Vector3(archDimX - 0.2, H + archH, 0)]),
          archDimLineMat
        );
        const aSprite = createTextSprite(`${design.archHeight || 600} mm (Rise)`, '#c084fc');
        aSprite.position.set(archDimX - 0.7, H + archH / 2, 0);
        windowGroup.add(aLine, aTick, aSprite);

        // Combined Total Height Line on outer left
        const totDimX = -2.2;
        const totLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(totDimX, 0, 0), new THREE.Vector3(totDimX, H + archH, 0)]),
          dimLineMat
        );
        const totTick1 = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(hDimX, 0, 0), new THREE.Vector3(totDimX - 0.2, 0, 0)]),
          dimLineMat
        );
        const totTick2 = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(hDimX, H + archH, 0), new THREE.Vector3(totDimX - 0.2, H + archH, 0)]),
          dimLineMat
        );
        const totSprite = createTextSprite(`${(design.height || 1200) + (design.archHeight || 600)} mm (Total)`, '#38bdf8');
        totSprite.position.set(totDimX - 0.8, (H + archH) / 2, 0);
        windowGroup.add(totLine, totTick1, totTick2, totSprite);
      }
    }

    // ==========================================
    // 6. ARCHITECTURAL WALL APERTURE MODE
    // ==========================================
    if (viewMode === 'wall') {
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xdfd9ce, roughness: 0.9 });
      const lintelMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.7 });
      const wallThick = 2.5;
      const wallPad = 3.0;

      const lintel = new THREE.Mesh(new THREE.BoxGeometry(W + wallPad * 2, 1.5, wallThick), lintelMat);
      lintel.position.set(W / 2, totalH + 0.75, -wallThick / 2 + frameDepth / 2);
      windowGroup.add(lintel);

      const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(wallPad, totalH + 1.5, wallThick), wallMat);
      wallLeft.position.set(-wallPad / 2, (totalH + 1.5) / 2, -wallThick / 2 + frameDepth / 2);
      windowGroup.add(wallLeft);

      const wallRight = new THREE.Mesh(new THREE.BoxGeometry(wallPad, totalH + 1.5, wallThick), wallMat);
      wallRight.position.set(W + wallPad / 2, (totalH + 1.5) / 2, -wallThick / 2 + frameDepth / 2);
      windowGroup.add(wallRight);

      const sillMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
      const sill = new THREE.Mesh(new THREE.BoxGeometry(W + 0.8, 0.4, wallThick + 0.4), sillMat);
      sill.position.set(W / 2, -0.2, -wallThick / 2 + frameDepth / 2 + 0.2);
      windowGroup.add(sill);
    }

    // ==========================================
    // 7. CROSS SECTION MODE
    // ==========================================
    if (viewMode === 'section') {
      const secGroup = new THREE.Group();
      secGroup.position.set(W + 2, totalH / 2, 0);

      const secMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
      const steelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
      const gasketMat = new THREE.MeshStandardMaterial({ color: 0xe11d48 });

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

    // Update orbit controls target
    if (controlsRef.current) {
      controlsRef.current.target.set(W / 2, totalH / 2, 0);
      controlsRef.current.update();
    }
  }, [design, viewMode, W, H, totalH, archH, isStandaloneArch]);

  // Handle Camera Presets
  const setPresetCamera = (type: 'iso' | 'front' | 'top' | 'side') => {
    setCameraAngle(type);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const midY = totalH / 2;
    if (type === 'front') {
      camera.position.set(W / 2, midY, Math.max(W, totalH) * 2.4);
    } else if (type === 'top') {
      camera.position.set(W / 2, Math.max(W, totalH) * 2.8, 0.01);
    } else if (type === 'side') {
      camera.position.set(-Math.max(W, totalH) * 2.2, midY, 0);
    } else {
      camera.position.set(W * 1.3, midY + totalH * 0.7, Math.max(W, totalH) * 2.2);
    }
    controls.target.set(W / 2, midY, 0);
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
        {/* Left: Clean '← back' button matching WindoorCraft sc2_3d_newpage.png */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-800 hover:bg-slate-100 shadow-md border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Return to 2D Technical CAD Elevation"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>back</span>
            </button>
          )}

          {/* WindoorCraft Floor toggle & Animation trigger */}
          <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md">
            {/* Floor toggle */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowFloor(!showFloor)}
                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  showFloor ? 'bg-blue-600' : 'bg-slate-300'
                }`}
                title="Toggle architectural floor ground plane"
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    showFloor ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-slate-700">floor</span>
            </div>

            <div className="w-px h-3.5 bg-slate-200" />

            {/* Animation button */}
            <button
              type="button"
              onClick={() => setIsAnimating(!isAnimating)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isAnimating ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Animate sliding & casement sash movements"
            >
              <span className={`w-2 h-2 rounded-full ${isAnimating ? 'bg-white animate-ping' : 'bg-rose-500'}`} />
              <span>animation</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md">
            <button
              type="button"
              onClick={() => setViewMode('model')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'model'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Model</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('wall')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'wall'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="View window installed in architectural masonry wall opening"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Wall</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('section')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'section'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Profile cross-section chambers & reinforcement"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Section</span>
            </button>
          </div>
        </div>

        {/* Right: Camera Angle Presets & Controls */}
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

      {/* Bottom Floating Specs */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center gap-4 shadow-lg pointer-events-none">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Design Type</span>
          <span className="font-bold text-indigo-400">
            {isStandaloneArch ? 'Standalone Arch Window' : design.hasArch ? 'Arch Combination Window' : 'Precision CAD Window'}
          </span>
        </div>
        <div className="w-px h-6 bg-slate-700" />
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Dimensions</span>
          <span className="font-mono font-bold text-white">
            {isStandaloneArch
              ? `${design.width || 1800} mm (W) × ${design.archHeight || 600} mm (Rise)`
              : design.hasArch
              ? `${design.width || 1800} × ${(design.height || 1200) + (design.archHeight || 600)} mm`
              : `${design.width || 1800} × ${design.height || 1200} mm`}
          </span>
        </div>
        <div className="w-px h-6 bg-slate-700" />
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Panels</span>
          <span className="font-bold text-white">{isStandaloneArch ? '1 Arch Glass Pane' : `${panels.length || 2} Panels`}</span>
        </div>
        <div className="w-px h-6 bg-slate-700" />
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Orbit Instructions</span>
          <span className="text-slate-400 font-medium">Left-drag: Rotate • Right-drag: Pan • Scroll: Zoom</span>
        </div>
      </div>
    </div>
  );
};
