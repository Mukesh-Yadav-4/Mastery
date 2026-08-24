import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import type { SkillProgressionState } from '../../utils/progression';
import { type CorePalette, getCorePalette } from '../../utils/palettes';
import type { CosmicFeedbackEvent } from '../../types';
import { soundEngine } from '../../utils/audio';
import { RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SceneNodeData {
  id: string;
  name: string;
  icon: string;
  color: string;
  level: number;
  xp?: number;
  totalHours?: number;
  formattedDuration: string;
  targetHours?: number;
  percentage: number;
  progression?: SkillProgressionState;
}

interface Cosmos3DSceneProps {
  nodes: SceneNodeData[];
  selectedNodeId?: string;
  onSelectNode: (node: SceneNodeData) => void;
  onHoverNode?: (node: SceneNodeData | null) => void;
  globalLevel?: number;
  palette?: CorePalette;
  feedbackEvent?: CosmicFeedbackEvent | null;
  onFeedbackPhaseChange?: (
    phase: 'idle' | 'focus' | 'core_charge' | 'transfer' | 'absorption' | 'reveal' | 'settled',
  ) => void;
  className?: string;
}

// 3D Spatial base coordinate templates
const SPATIAL_COORDINATES: Array<[number, number, number]> = [
  [-4.4, 1.4, 1.8],   // 0. Foreground Left (Primary)
  [0.0, 3.8, -1.8],   // 1. Background Top Crown
  [4.5, 1.3, 1.7],    // 2. Foreground Right
  [3.8, -2.4, -1.6],  // 3. Background Lower Right
  [-3.8, -2.2, -0.6], // 4. Midground Lower Left
  [-1.9, 3.0, 0.4],   // 5. Midground Upper Left
  [2.2, 3.2, 0.2],    // 6. Midground Upper Right (fallback)
  [-4.0, 0.0, -1.5],  // 7. Background Far Left (fallback)
];

function getSpatialPosition(index: number, totalCount: number): [number, number, number] {
  if (totalCount === 1) {
    return [-4.0, 1.2, 1.6]; // Single skill: clear foreground visual focus
  }
  if (totalCount === 2) {
    const coords: Array<[number, number, number]> = [
      [-4.2, 1.4, 1.6],
      [4.2, -1.2, 1.2],
    ];
    return coords[index % coords.length];
  }
  if (totalCount === 3) {
    const coords: Array<[number, number, number]> = [
      [-4.4, 1.4, 1.6],
      [0.0, 3.6, -1.6],
      [4.4, -1.4, 1.4],
    ];
    return coords[index % coords.length];
  }
  if (totalCount === 4) {
    const coords: Array<[number, number, number]> = [
      [-4.4, 1.4, 1.6],
      [0.0, 3.6, -1.6],
      [4.4, 1.2, 1.4],
      [3.6, -2.4, -1.4],
    ];
    return coords[index % coords.length];
  }
  return SPATIAL_COORDINATES[index % SPATIAL_COORDINATES.length];
}

export function Cosmos3DScene({
  nodes,
  selectedNodeId,
  onSelectNode,
  onHoverNode,
  globalLevel = 1,
  palette,
  feedbackEvent,
  onFeedbackPhaseChange,
  className,
}: Cosmos3DSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelElsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  const nodesRef = useRef<SceneNodeData[]>(nodes);
  const rebuildSkillNodesRef = useRef<((currentNodes: SceneNodeData[]) => void) | null>(null);

  useEffect(() => {
    nodesRef.current = nodes;
    rebuildSkillNodesRef.current?.(nodes);
  }, [nodes]);

  // Store active selection in ref to avoid re-initializing WebGL on selection change
  const selectedNodeIdRef = useRef<string | undefined>(selectedNodeId);
  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
  }, [selectedNodeId]);

  const onSelectNodeRef = useRef(onSelectNode);
  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);

  const onHoverNodeRef = useRef(onHoverNode);
  useEffect(() => {
    onHoverNodeRef.current = onHoverNode;
  }, [onHoverNode]);

  const onFeedbackPhaseChangeRef = useRef(onFeedbackPhaseChange);
  useEffect(() => {
    onFeedbackPhaseChangeRef.current = onFeedbackPhaseChange;
  }, [onFeedbackPhaseChange]);

  const feedbackEventRef = useRef<CosmicFeedbackEvent | null | undefined>(feedbackEvent);

  // Cinematic State Tracker for WebGL Render Loop
  const cinematicStateRef = useRef<{
    eventId: string | null;
    startTime: number;
    phase:
      | 'idle'
      | 'focus'
      | 'core_charge'
      | 'transfer'
      | 'absorption'
      | 'settle'
      | 'reveal'
      | 'settled';
    targetSkillId: string | null;
    significance: 'short' | 'normal' | 'long' | 'horizon';
    tFocus: number;
    tCoreCharge: number;
    tTransfer: number;
    tAbsorption: number;
    tSettle: number;
    coreChargeSoundPlayed: boolean;
    surgeSoundPlayed: boolean;
    absorptionSoundPlayed: boolean;
    revealTriggered: boolean;
  }>({
    eventId: null,
    startTime: 0,
    phase: 'idle',
    targetSkillId: null,
    significance: 'normal',
    tFocus: 350,
    tCoreCharge: 750,
    tTransfer: 1200,
    tAbsorption: 600,
    tSettle: 350,
    coreChargeSoundPlayed: false,
    surgeSoundPlayed: false,
    absorptionSoundPlayed: false,
    revealTriggered: false,
  });

  useEffect(() => {
    feedbackEventRef.current = feedbackEvent;
    if (feedbackEvent && feedbackEvent.id !== cinematicStateRef.current.eventId) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        cinematicStateRef.current = {
          eventId: feedbackEvent.id,
          startTime: performance.now(),
          phase: 'settled',
          targetSkillId: feedbackEvent.skillId,
          significance: feedbackEvent.significance,
          tFocus: 0,
          tCoreCharge: 0,
          tTransfer: 0,
          tAbsorption: 0,
          tSettle: 0,
          coreChargeSoundPlayed: true,
          surgeSoundPlayed: true,
          absorptionSoundPlayed: true,
          revealTriggered: true,
        };
        onFeedbackPhaseChangeRef.current?.('reveal');
        return;
      }

      const sig = feedbackEvent.significance;
      let tFocus = 350;
      let tCoreCharge = 750;
      let tTransfer = 1200;
      let tAbsorption = 600;
      let tSettle = 350;

      if (sig === 'short') {
        tFocus = 300;
        tCoreCharge = 600;
        tTransfer = 1000;
        tAbsorption = 500;
        tSettle = 300;
      } else if (sig === 'long') {
        tFocus = 400;
        tCoreCharge = 900;
        tTransfer = 1400;
        tAbsorption = 700;
        tSettle = 400;
      } else if (sig === 'horizon') {
        tFocus = 400;
        tCoreCharge = 900;
        tTransfer = 1500;
        tAbsorption = 800;
        tSettle = 400;
      }

      cinematicStateRef.current = {
        eventId: feedbackEvent.id,
        startTime: performance.now(),
        phase: 'focus',
        targetSkillId: feedbackEvent.skillId,
        significance: sig,
        tFocus,
        tCoreCharge,
        tTransfer,
        tAbsorption,
        tSettle,
        coreChargeSoundPlayed: false,
        surgeSoundPlayed: false,
        absorptionSoundPlayed: false,
        revealTriggered: false,
      };
      onFeedbackPhaseChangeRef.current?.('focus');
    } else if (!feedbackEvent) {
      cinematicStateRef.current.eventId = null;
      cinematicStateRef.current.phase = 'idle';
      cinematicStateRef.current.coreChargeSoundPlayed = false;
      cinematicStateRef.current.surgeSoundPlayed = false;
      cinematicStateRef.current.absorptionSoundPlayed = false;
      cinematicStateRef.current.revealTriggered = false;
    }
  }, [feedbackEvent]);

  // Active Core Palette Ref for smooth in-loop color lerping (300-500ms)
  const activePalette = palette ?? getCorePalette();
  const paletteRef = useRef<CorePalette>(activePalette);
  useEffect(() => {
    paletteRef.current = activePalette;
  }, [activePalette]);

  // Mouse, 3D Orbit & render loop references
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoveredNodeIdRef = useRef<string | null>(null);
  const baseCameraZRef = useRef<number>(14.5);

  const orbitStateRef = useRef({
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    orbitAngleX: 0,
    orbitAngleY: 0,
    targetOrbitAngleX: 0,
    targetOrbitAngleY: 0,
    zoomDistance: 14.5,
    targetZoomDistance: 14.5,
    currentLookAt: new THREE.Vector3(0, 0, 0),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    lastInteractionTime: 0,
    hasMoved: false,
  });

  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [hasCustomOrbit, setHasCustomOrbit] = useState(false);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only main left click
    const state = orbitStateRef.current;
    state.isDragging = true;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;
    state.hasMoved = false;
    state.lastInteractionTime = performance.now();
    setIsDraggingCanvas(true);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    targetMouseRef.current = { x, y };

    const state = orbitStateRef.current;
    if (state.isDragging) {
      const deltaX = e.clientX - state.dragStartX;
      const deltaY = e.clientY - state.dragStartY;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        state.hasMoved = true;
        setHasCustomOrbit(true);
      }
      state.targetOrbitAngleX += deltaX * 0.0055;
      state.targetOrbitAngleY = Math.max(
        -Math.PI * 0.38,
        Math.min(Math.PI * 0.38, state.targetOrbitAngleY - deltaY * 0.0055),
      );
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      state.lastInteractionTime = performance.now();
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    orbitStateRef.current.isDragging = false;
    setIsDraggingCanvas(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const state = orbitStateRef.current;
    const zoomDelta = e.deltaY * 0.01;
    state.targetZoomDistance = Math.max(
      7.0,
      Math.min(22.0, state.targetZoomDistance + zoomDelta),
    );
    state.lastInteractionTime = performance.now();
    setHasCustomOrbit(true);
  }, []);

  const handleResetCamera = useCallback(() => {
    const state = orbitStateRef.current;
    state.targetOrbitAngleX = 0;
    state.targetOrbitAngleY = 0;
    state.targetZoomDistance = baseCameraZRef.current;
    state.targetLookAt.set(0, 0, 0);
    state.lastInteractionTime = performance.now();
    setHasCustomOrbit(false);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Initial container measurements
    const initialWidth = container.clientWidth || 800;
    const initialHeight = container.clientHeight || 600;

    const initialPal = paletteRef.current;

    // ── 1. Scene, Camera & Renderer Setup ───────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060813, 0.016);

    const initialAspect = initialWidth / initialHeight;
    const camera = new THREE.PerspectiveCamera(45, initialAspect, 0.1, 100);

    // Initial camera distance based on aspect ratio
    const initialBaseZ = initialAspect < 1.35 ? 14.5 * (1.35 / Math.max(0.65, initialAspect)) : 14.5;
    baseCameraZRef.current = initialBaseZ;
    camera.position.set(0, 0, initialBaseZ);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(initialWidth, initialHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.appendChild(renderer.domElement);

    // ── 2. Cinematic Post-Processing Bloom ───────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(initialWidth, initialHeight),
      0.85,  // strength
      0.65,  // radius
      0.75,  // threshold
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // ── 3. Lighting System ───────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.0);
    scene.add(ambientLight);

    const dirKeyLight = new THREE.DirectionalLight(0x818cf8, 2.2);
    dirKeyLight.position.set(6, 10, 8);
    scene.add(dirKeyLight);

    const dirFillLight = new THREE.DirectionalLight(0x22d3ee, 1.4);
    dirFillLight.position.set(-8, -4, -4);
    scene.add(dirFillLight);

    const dirRimLight = new THREE.DirectionalLight(0xf472b6, 1.1);
    dirRimLight.position.set(0, -8, -6);
    scene.add(dirRimLight);

    // ── 4. Deep Multi-Layer Starfield & Atmosphere ───────────────
    const starCount = 650;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xa5b4fc),
      new THREE.Color(0x818cf8),
      new THREE.Color(0x22d3ee),
      new THREE.Color(0xf472b6),
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 12 + Math.random() * 24;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const col = starPalette[Math.floor(Math.random() * starPalette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Deep Space Star Layer
    const deepStarCount = 500;
    const deepStarGeo = new THREE.BufferGeometry();
    const deepStarPos = new Float32Array(deepStarCount * 3);
    const deepStarColors = new Float32Array(deepStarCount * 3);

    for (let i = 0; i < deepStarCount; i++) {
      const radius = 35 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      deepStarPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      deepStarPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      deepStarPos[i * 3 + 2] = radius * Math.cos(phi);

      const col = starPalette[i % starPalette.length];
      deepStarColors[i * 3] = col.r * 0.7;
      deepStarColors[i * 3 + 1] = col.g * 0.7;
      deepStarColors[i * 3 + 2] = col.b * 0.7;
    }

    deepStarGeo.setAttribute('position', new THREE.BufferAttribute(deepStarPos, 3));
    deepStarGeo.setAttribute('color', new THREE.BufferAttribute(deepStarColors, 3));

    const deepStarMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
    });
    const deepStarField = new THREE.Points(deepStarGeo, deepStarMat);
    scene.add(deepStarField);

    // Distant Celestial Silhouette (Faint Ringed Planet)
    const distantPlanetGroup = new THREE.Group();
    distantPlanetGroup.position.set(17.5, -9.5, -30);
    scene.add(distantPlanetGroup);

    const planetGeo = new THREE.SphereGeometry(2.4, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.85,
      metalness: 0.15,
      transparent: true,
      opacity: 0.6,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    distantPlanetGroup.add(planetMesh);

    const planetRingGeo = new THREE.RingGeometry(3.2, 4.8, 64);
    const planetRingMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
    });
    const planetRing = new THREE.Mesh(planetRingGeo, planetRingMat);
    planetRing.rotation.x = Math.PI / 2.7;
    planetRing.rotation.y = Math.PI / 8;
    distantPlanetGroup.add(planetRing);

    // ── 5. Centerpiece — Mastery Core with Personal Palette ──────
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Foundation starting scale is ~60% of original, evolving smoothly as journey level grows
    const safeGlobalLevel = Math.max(1, globalLevel);
    const coreScale = Math.min(1.0, 0.60 + Math.log2(safeGlobalLevel) * 0.08);
    coreGroup.scale.set(coreScale, coreScale, coreScale);

    // Inner Core (Personalized)
    const innerGeo = new THREE.SphereGeometry(0.92, 48, 48);
    const innerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialPal.coreInner),
      emissive: new THREE.Color(initialPal.corePrimary),
      emissiveIntensity: 2.8,
      roughness: 0.15,
      metalness: 0.7,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    // Outer Crystal Shell (Personalized Refraction)
    const crystalGeo = new THREE.SphereGeometry(1.62, 64, 64);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(initialPal.coreSecondary),
      transparent: true,
      opacity: 0.6,
      transmission: 0.82,
      ior: 1.45,
      roughness: 0.06,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      attenuationColor: new THREE.Color(initialPal.corePrimary),
      attenuationDistance: 2.0,
    });
    const crystalShell = new THREE.Mesh(crystalGeo, crystalMat);
    coreGroup.add(crystalShell);

    // Geodesic Accent Lattice
    const latticeGeo = new THREE.IcosahedronGeometry(1.68, 1);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(initialPal.accent),
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const latticeShell = new THREE.Mesh(latticeGeo, latticeMat);
    coreGroup.add(latticeShell);

    // Core Point Lights (Scaled to Core Size & Palette)
    const coreLight1 = new THREE.PointLight(new THREE.Color(initialPal.aura), 4.5 * coreScale, 22 * coreScale, 1.2);
    coreGroup.add(coreLight1);
    const coreLight2 = new THREE.PointLight(new THREE.Color(initialPal.accent), 3.0 * coreScale, 15 * coreScale, 1.4);
    coreGroup.add(coreLight2);

    // 3D Concentric Metallic Orbital Rings
    const ring1Geo = new THREE.TorusGeometry(2.5, 0.022, 24, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialPal.ring1),
      emissive: new THREE.Color(initialPal.ring1),
      emissiveIntensity: 1.3,
      metalness: 0.95,
      roughness: 0.08,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(3.3, 0.018, 24, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialPal.ring2),
      emissive: new THREE.Color(initialPal.ring2),
      emissiveIntensity: 1.1,
      metalness: 0.95,
      roughness: 0.08,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(3.65, 0.013, 24, 120);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialPal.ring3),
      emissive: new THREE.Color(initialPal.ring3),
      emissiveIntensity: 0.8,
      metalness: 0.95,
      roughness: 0.08,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI / 6;
    ring3.rotation.z = -Math.PI / 3;
    coreGroup.add(ring3);

    // ── 6. REAL SKILL NODES & PROGRESSION-INFORMED GEOMETRIES ────
    const nodesContainer = new THREE.Group();
    scene.add(nodesContainer);

    const curvesContainer = new THREE.Group();
    scene.add(curvesContainer);

    const nodeMeshes = new Map<string, THREE.Group>();
    const nodePointLights = new Map<string, THREE.PointLight>();
    let curveStreams: Array<{
      curve: THREE.CatmullRomCurve3;
      glowTubeMesh: THREE.Mesh;
      basePos: THREE.Vector3;
      baseLightIntensity: number;
      ampX: number;
      ampY: number;
      ampZ: number;
      phaseX: number;
      phaseY: number;
      phaseZ: number;
      freqX: number;
      freqY: number;
      freqZ: number;
      beads: Array<{ mesh: THREE.Mesh; speed: number; offset: number }>;
      pulseMesh: THREE.Mesh;
      surgeGroup: THREE.Group;
      leadSurgeMesh: THREE.Mesh;
      trailMeshes: THREE.Mesh[];
      trailOffsets: number[];
      surgePointLight: THREE.PointLight;
      targetNodeId: string;
    }> = [];

    const rebuildSkillNodes = (currentNodes: SceneNodeData[]) => {
      // 1. Dispose previous node & curve geometries and materials
      nodesContainer.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      curvesContainer.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });

      nodesContainer.clear();
      curvesContainer.clear();
      nodeMeshes.clear();
      nodePointLights.clear();
      curveStreams = [];

      currentNodes.forEach((node, idx) => {
        const posArray = getSpatialPosition(idx, currentNodes.length);
        const basePos = new THREE.Vector3(...posArray);

        const nodeGroup = new THREE.Group();
        nodeGroup.position.copy(basePos);
        nodeGroup.userData = { id: node.id, nodeData: node };
        nodesContainer.add(nodeGroup);
        nodeMeshes.set(node.id, nodeGroup);

        const progression = node.progression;
        const palette = progression?.evolvedPalette;
        const coreColor = new THREE.Color(
          palette?.coreColor || node.color || '#818cf8',
        );
        const emissiveColor = new THREE.Color(
          palette?.emissiveColor || node.color || '#818cf8',
        );
        const secondaryAccent = new THREE.Color(
          palette?.secondaryAccent || node.color || '#818cf8',
        );
        const rimHighlight = new THREE.Color(
          palette?.rimHighlight || '#ffffff',
        );
        const haloColor = new THREE.Color(
          palette?.haloColor || node.color || '#818cf8',
        );
        const haloOpacity = palette?.haloOpacity ?? 0.22;

        const tier = progression?.structureTier ?? 1;
        const visualScale = progression?.boundedVisualScale ?? 1.0;

        // Core Sphere Mesh (Bounded Emissive Ceiling)
        const nodeGeo = new THREE.SphereGeometry(0.55 * visualScale, 32, 32);
        const nodeMat = new THREE.MeshStandardMaterial({
          color: coreColor,
          emissive: emissiveColor,
          emissiveIntensity: Math.min(
            1.25,
            0.85 + (progression?.levelAuraIntensity ?? 1.0) * 0.25,
          ),
          roughness: 0.28,
          metalness: 0.75,
        });
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        nodeGroup.add(nodeMesh);

        // Concentric Halo Disc (Bounded Opacity)
        const haloGeo = new THREE.RingGeometry(
          0.7 * visualScale,
          0.95 * visualScale,
          32,
        );
        const haloMat = new THREE.MeshBasicMaterial({
          color: haloColor,
          transparent: true,
          opacity: Math.min(0.38, haloOpacity),
          side: THREE.DoubleSide,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        haloMesh.rotation.x = Math.PI / 2;
        nodeGroup.add(haloMesh);

        // Progression Structural Archetypes (Tiers 2–6)
        if (tier >= 2) {
          const nodeRingGeo = new THREE.TorusGeometry(
            1.02 * visualScale,
            0.015,
            16,
            60,
          );
          const nodeRingMat = new THREE.MeshStandardMaterial({
            color: secondaryAccent,
            emissive: secondaryAccent,
            emissiveIntensity: 0.85,
            metalness: 0.92,
            roughness: 0.12,
          });
          const nodeRing = new THREE.Mesh(nodeRingGeo, nodeRingMat);
          nodeRing.rotation.x = Math.PI / 2.5;
          nodeGroup.add(nodeRing);
        }

        if (tier >= 4) {
          const ring2Radius = 1.2 * visualScale;
          const nodeRing2Geo = new THREE.TorusGeometry(
            ring2Radius,
            0.012,
            16,
            60,
          );
          const nodeRing2Mat = new THREE.MeshStandardMaterial({
            color: rimHighlight,
            emissive: secondaryAccent,
            emissiveIntensity: 0.8,
            metalness: 0.95,
            roughness: 0.08,
          });
          const nodeRing2 = new THREE.Mesh(nodeRing2Geo, nodeRing2Mat);
          nodeRing2.rotation.x = -Math.PI / 3;
          nodeRing2.rotation.y = Math.PI / 4;
          nodeGroup.add(nodeRing2);
        }

        if (tier >= 5) {
          const latticeRadius = 0.88 * visualScale;
          const nodeLatticeGeo = new THREE.IcosahedronGeometry(latticeRadius, 1);
          const nodeLatticeMat = new THREE.MeshBasicMaterial({
            color: rimHighlight,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
          });
          const nodeLattice = new THREE.Mesh(nodeLatticeGeo, nodeLatticeMat);
          nodeGroup.add(nodeLattice);
        }

        if (tier >= 6) {
          const ring3Radius = 1.42 * visualScale;
          const nodeRing3Geo = new THREE.TorusGeometry(
            ring3Radius,
            0.01,
            16,
            60,
          );
          const nodeRing3Mat = new THREE.MeshStandardMaterial({
            color: rimHighlight,
            emissive: secondaryAccent,
            emissiveIntensity: 0.95,
            metalness: 0.95,
            roughness: 0.05,
          });
          const nodeRing3 = new THREE.Mesh(nodeRing3Geo, nodeRing3Mat);
          nodeRing3.rotation.y = Math.PI / 2;
          nodeGroup.add(nodeRing3);
        }

        // Point Light
        const baseLightIntensity = Math.min(
          1.6,
          0.85 + (progression?.levelAuraIntensity ?? 1.0) * 0.35,
        );
        const nodeLight = new THREE.PointLight(
          coreColor,
          baseLightIntensity,
          5.5 * visualScale,
          1.6,
        );
        nodeGroup.add(nodeLight);
        nodePointLights.set(node.id, nodeLight);

        // 3D Connection Spline with beads
        const midPoint = new THREE.Vector3(
          basePos.x * 0.5 + (basePos.y > 0 ? 0.35 : -0.35),
          basePos.y * 0.5 + (basePos.x > 0 ? -0.35 : 0.35),
          basePos.z * 0.5 + 0.45,
        );

        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          midPoint,
          basePos.clone(),
        ]);

        const coreTubeGeo = new THREE.TubeGeometry(curve, 48, 0.012, 8, false);
        const coreTubeMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.85,
        });
        const coreTubeMesh = new THREE.Mesh(coreTubeGeo, coreTubeMat);
        curvesContainer.add(coreTubeMesh);

        const glowTubeGeo = new THREE.TubeGeometry(curve, 48, 0.032, 8, false);
        const glowTubeMat = new THREE.MeshStandardMaterial({
          color: coreColor,
          emissive: coreColor,
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.38,
        });
        const glowTubeMesh = new THREE.Mesh(glowTubeGeo, glowTubeMat);
        curvesContainer.add(glowTubeMesh);

        const beads: Array<{ mesh: THREE.Mesh; speed: number; offset: number }> = [];

        const bead1Geo = new THREE.SphereGeometry(0.085, 12, 12);
        const beadMat1 = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const beadMesh1 = new THREE.Mesh(bead1Geo, beadMat1);
        curvesContainer.add(beadMesh1);
        beads.push({ mesh: beadMesh1, speed: 0.28 + (idx % 3) * 0.04, offset: 0.0 });

        const bead2Geo = new THREE.SphereGeometry(0.075, 10, 10);
        const beadMat2 = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const beadMesh2 = new THREE.Mesh(bead2Geo, beadMat2);
        curvesContainer.add(beadMesh2);
        beads.push({ mesh: beadMesh2, speed: 0.32 + (idx % 2) * 0.03, offset: 0.36 });

        const bead3Geo = new THREE.SphereGeometry(0.068, 10, 10);
        const beadMat3 = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const beadMesh3 = new THREE.Mesh(bead3Geo, beadMat3);
        curvesContainer.add(beadMesh3);
        beads.push({ mesh: beadMesh3, speed: 0.26 + (idx % 4) * 0.03, offset: 0.72 });

        const pulseGeo = new THREE.SphereGeometry(0.15, 14, 14);
        const pulseMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(paletteRef.current.pulse),
          transparent: true,
          opacity: 0,
        });
        const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
        curvesContainer.add(pulseMesh);

        const surgeGroup = new THREE.Group();
        surgeGroup.visible = false;
        curvesContainer.add(surgeGroup);

        const leadSurgeGeo = new THREE.SphereGeometry(0.28, 16, 16);
        const leadSurgeMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: coreColor,
          emissiveIntensity: 5.5,
          roughness: 0.08,
          metalness: 0.9,
        });
        const leadSurgeMesh = new THREE.Mesh(leadSurgeGeo, leadSurgeMat);
        surgeGroup.add(leadSurgeMesh);

        const trailMeshes: THREE.Mesh[] = [];
        const trailSizes = [0.22, 0.17, 0.13, 0.09];
        const trailOffsets = [0.035, 0.07, 0.105, 0.14];
        trailSizes.forEach((size, tIdx) => {
          const tGeo = new THREE.SphereGeometry(size, 12, 12);
          const tMat = new THREE.MeshBasicMaterial({
            color: coreColor,
            transparent: true,
            opacity: 0.88 - tIdx * 0.18,
          });
          const tMesh = new THREE.Mesh(tGeo, tMat);
          surgeGroup.add(tMesh);
          trailMeshes.push(tMesh);
        });

        const surgePointLight = new THREE.PointLight(
          coreColor,
          0,
          9 * visualScale,
          1.8,
        );
        surgeGroup.add(surgePointLight);

        curveStreams.push({
          curve,
          glowTubeMesh,
          basePos,
          baseLightIntensity,
          ampX: 0.2,
          ampY: 0.28,
          ampZ: 0.16,
          phaseX: idx * 1.73 + 0.5,
          phaseY: idx * 2.41 + 1.2,
          phaseZ: idx * 1.19 + 2.1,
          freqX: 0.65 + (idx % 3) * 0.12,
          freqY: 0.85 + (idx % 4) * 0.10,
          freqZ: 0.55 + (idx % 2) * 0.15,
          beads,
          pulseMesh,
          surgeGroup,
          leadSurgeMesh,
          trailMeshes,
          trailOffsets,
          surgePointLight,
          targetNodeId: node.id,
        });
      });
    };

    rebuildSkillNodesRef.current = rebuildSkillNodes;
    rebuildSkillNodes(nodesRef.current);

    // ── 7. Raycaster for Click Detection ─────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const state = orbitStateRef.current;
      if (state.hasMoved) return; // User was orbiting/dragging, ignore click

      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouseVector, camera);

      const interactiveMeshes: THREE.Object3D[] = [];
      nodeMeshes.forEach((group) => {
        interactiveMeshes.push(...group.children);
      });

      const intersects = raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        const hitGroup = intersects[0].object.parent;
        if (hitGroup && hitGroup.userData?.nodeData) {
          const nodeData = hitGroup.userData.nodeData as SceneNodeData;
          const nodeIndex = nodesRef.current.findIndex((n) => n.id === nodeData.id);
          soundEngine.playOrbSelect(nodeIndex >= 0 ? nodeIndex : 0);
          onSelectNodeRef.current(nodeData);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // ── 8. Robust Container-Based ResizeObserver ─────────────────
    const handleContainerResize = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;

      const aspect = w / h;
      camera.aspect = aspect;

      // Responsive Camera Framing: Adapt camera Z distance on narrow aspect ratios
      const adaptedBaseZ = aspect < 1.35 ? 14.5 * (1.35 / Math.max(0.65, aspect)) : 14.5;
      baseCameraZRef.current = adaptedBaseZ;

      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          handleContainerResize(width, height);
        }
      }
    });

    resizeObserver.observe(container);

    // Initial pass to ensure exact sizing even if container layout was pending
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      handleContainerResize(container.clientWidth, container.clientHeight);
    }

    // ── 9. Living Cosmos Render Animation Loop ───────────────────
    const clock = new THREE.Clock();
    let animFrameId: number;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // ── Core Palette Smooth Crossfade (300-500ms Lerp) ─────────
      const currentPal = paletteRef.current;
      const targetInner = new THREE.Color(currentPal.coreInner);
      const targetPrimary = new THREE.Color(currentPal.corePrimary);
      const targetSecondary = new THREE.Color(currentPal.coreSecondary);
      const targetAura = new THREE.Color(currentPal.aura);
      const targetAccent = new THREE.Color(currentPal.accent);
      const targetRing1 = new THREE.Color(currentPal.ring1);
      const targetRing2 = new THREE.Color(currentPal.ring2);
      const targetRing3 = new THREE.Color(currentPal.ring3);

      innerMat.color.lerp(targetInner, 0.08);
      innerMat.emissive.lerp(targetPrimary, 0.08);
      crystalMat.color.lerp(targetSecondary, 0.08);
      crystalMat.attenuationColor.lerp(targetPrimary, 0.08);
      latticeMat.color.lerp(targetAccent, 0.08);
      ring1Mat.color.lerp(targetRing1, 0.08);
      ring1Mat.emissive.lerp(targetRing1, 0.08);
      ring2Mat.color.lerp(targetRing2, 0.08);
      ring2Mat.emissive.lerp(targetRing2, 0.08);
      ring3Mat.color.lerp(targetRing3, 0.08);
      ring3Mat.emissive.lerp(targetRing3, 0.08);
      coreLight1.color.lerp(targetAura, 0.08);
      coreLight2.color.lerp(targetAccent, 0.08);

      // ── Cinematic Feedback Animation State Machine ───────────
      const cState = cinematicStateRef.current;
      const isCinematicActive = Boolean(
        cState.eventId && cState.phase !== 'idle' && cState.phase !== 'settled',
      );
      let cinematicPhase = cState.phase;
      let chargeRatio = 0;
      let transferRatio = 0;
      let absorptionRatio = 0;
      let settleRatio = 0;

      if (isCinematicActive) {
        const nowMs = performance.now();
        const elapsed = nowMs - cState.startTime;

        if (elapsed < cState.tFocus) {
          cinematicPhase = 'focus';
        } else if (elapsed < cState.tFocus + cState.tCoreCharge) {
          cinematicPhase = 'core_charge';
          chargeRatio = (elapsed - cState.tFocus) / cState.tCoreCharge;

          if (!cState.coreChargeSoundPlayed) {
            cState.coreChargeSoundPlayed = true;
            soundEngine.playCoreCharge();
          }
        } else if (elapsed < cState.tFocus + cState.tCoreCharge + cState.tTransfer) {
          cinematicPhase = 'transfer';
          transferRatio =
            (elapsed - (cState.tFocus + cState.tCoreCharge)) / cState.tTransfer;

          if (!cState.surgeSoundPlayed) {
            cState.surgeSoundPlayed = true;
            soundEngine.playEnergySurge();
          }
        } else if (
          elapsed <
          cState.tFocus + cState.tCoreCharge + cState.tTransfer + cState.tAbsorption
        ) {
          cinematicPhase = 'absorption';
          absorptionRatio =
            (elapsed -
              (cState.tFocus + cState.tCoreCharge + cState.tTransfer)) /
            cState.tAbsorption;

          if (!cState.absorptionSoundPlayed) {
            cState.absorptionSoundPlayed = true;
            if (
              cState.significance === 'horizon' ||
              feedbackEventRef.current?.crossedHorizon
            ) {
              soundEngine.playHorizonCross();
            } else {
              soundEngine.playSkillAbsorption();
            }
          }
        } else if (
          elapsed <
          cState.tFocus +
            cState.tCoreCharge +
            cState.tTransfer +
            cState.tAbsorption +
            cState.tSettle
        ) {
          cinematicPhase = 'settle';
          settleRatio =
            (elapsed -
              (cState.tFocus +
                cState.tCoreCharge +
                cState.tTransfer +
                cState.tAbsorption)) /
            cState.tSettle;
        } else {
          cinematicPhase = 'reveal';
          if (!cState.revealTriggered) {
            cState.revealTriggered = true;
            onFeedbackPhaseChangeRef.current?.('reveal');
          }
        }
        cState.phase = cinematicPhase;
      }

      // ── Interactive 3D Orbit, Smooth Camera Dynamics & Cinematic Target Glide ──
      mousePosRef.current.x +=
        (targetMouseRef.current.x - mousePosRef.current.x) * 0.05;
      mousePosRef.current.y +=
        (targetMouseRef.current.y - mousePosRef.current.y) * 0.05;

      const oState = orbitStateRef.current;
      const selectedId = selectedNodeIdRef.current;
      const hasActiveSelection = Boolean(selectedId);

      const isIdleDrifting =
        !oState.isDragging &&
        !hasActiveSelection &&
        !isCinematicActive &&
        performance.now() - oState.lastInteractionTime > 2500;

      if (isIdleDrifting) {
        oState.targetOrbitAngleX += 0.0006;
      }

      // Smooth lerping of orbit rotation & zoom
      oState.orbitAngleX = THREE.MathUtils.lerp(
        oState.orbitAngleX,
        oState.targetOrbitAngleX,
        0.08,
      );
      oState.orbitAngleY = THREE.MathUtils.lerp(
        oState.orbitAngleY,
        oState.targetOrbitAngleY,
        0.08,
      );
      oState.zoomDistance = THREE.MathUtils.lerp(
        oState.zoomDistance,
        oState.targetZoomDistance,
        0.08,
      );

      // Target lookAt framing: when a skill is selected, smoothly glide camera target to that node
      if (hasActiveSelection) {
        const selectedGroup = nodeMeshes.get(selectedId!);
        if (selectedGroup) {
          const targetWorld = new THREE.Vector3();
          selectedGroup.getWorldPosition(targetWorld);
          oState.targetLookAt.set(
            targetWorld.x * 0.55,
            targetWorld.y * 0.55,
            targetWorld.z * 0.55,
          );
        }
      } else if (isCinematicActive && cState.targetSkillId) {
        const targetGroup = nodeMeshes.get(cState.targetSkillId);
        if (targetGroup) {
          const targetWorld = new THREE.Vector3();
          targetGroup.getWorldPosition(targetWorld);
          oState.targetLookAt.set(
            targetWorld.x * 0.45,
            targetWorld.y * 0.45,
            targetWorld.z * 0.45,
          );
        }
      } else {
        oState.targetLookAt.set(0, 0, 0);
      }

      oState.currentLookAt.lerp(oState.targetLookAt, 0.06);

      // Spherical coordinate system around currentLookAt
      const cosY = Math.cos(oState.orbitAngleY);
      const sinY = Math.sin(oState.orbitAngleY);
      const cosX = Math.cos(oState.orbitAngleX);
      const sinX = Math.sin(oState.orbitAngleX);

      // Parallax offset
      const parallaxX = mousePosRef.current.x * 0.5;
      const parallaxY = mousePosRef.current.y * 0.35;

      camera.position.x =
        oState.currentLookAt.x +
        oState.zoomDistance * cosY * sinX +
        parallaxX;
      camera.position.y =
        oState.currentLookAt.y +
        oState.zoomDistance * sinY +
        parallaxY;
      camera.position.z =
        oState.currentLookAt.z + oState.zoomDistance * cosY * cosX;
      camera.lookAt(oState.currentLookAt);

      // ── Hover Raycasting & Resonant Crystal Audio ───────────────
      mouseVector.x = targetMouseRef.current.x;
      mouseVector.y = targetMouseRef.current.y;
      raycaster.setFromCamera(mouseVector, camera);

      const interactiveHoverMeshes: THREE.Object3D[] = [];
      nodeMeshes.forEach((group) => {
        interactiveHoverMeshes.push(...group.children);
      });

      const hoverIntersects = raycaster.intersectObjects(
        interactiveHoverMeshes,
        false,
      );
      if (hoverIntersects.length > 0) {
        const hitGroup = hoverIntersects[0].object.parent;
        if (hitGroup && hitGroup.userData?.nodeData) {
          const hitNodeId = hitGroup.userData.nodeData.id;
          if (hitNodeId && hitNodeId !== hoveredNodeIdRef.current) {
            hoveredNodeIdRef.current = hitNodeId;
            const nodeIndex = nodesRef.current.findIndex(
              (n) => n.id === hitNodeId,
            );
            soundEngine.playOrbHover(nodeIndex >= 0 ? nodeIndex : 0);
            onHoverNodeRef.current?.(hitGroup.userData.nodeData);
          }
        }
      } else if (hoveredNodeIdRef.current !== null) {
        hoveredNodeIdRef.current = null;
        onHoverNodeRef.current?.(null);
      }

      // ── Mastery Core Dynamics ────────────────────────────────────
      coreGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.22;

      const extraCoreRot =
        isCinematicActive && cinematicPhase === 'core_charge'
          ? chargeRatio * 0.12
          : isCinematicActive && cinematicPhase === 'transfer'
          ? (1.0 - transferRatio) * 0.08
          : 0;

      crystalShell.rotation.y = elapsedTime * 0.45;
      crystalShell.rotation.x = Math.sin(elapsedTime * 0.3) * 0.25;
      latticeShell.rotation.y = -elapsedTime * 0.32;
      latticeShell.rotation.z = elapsedTime * 0.2;
      innerCore.rotation.y = -elapsedTime * 0.75 - extraCoreRot;
      innerCore.rotation.z = elapsedTime * 0.4;

      const basePulseScale = 1.0 + Math.sin(elapsedTime * 2.5) * 0.08;
      let finalCoreScale = basePulseScale;

      if (cinematicPhase === 'core_charge') {
        const contraction = Math.sin(chargeRatio * Math.PI) * 0.14;
        const gatherBurst = chargeRatio > 0.6 ? (chargeRatio - 0.6) * 0.45 : 0;
        finalCoreScale = basePulseScale * (1.0 - contraction + gatherBurst);
      }
      innerCore.scale.set(finalCoreScale, finalCoreScale, finalCoreScale);

      const basePulse = 2.4 + Math.sin(elapsedTime * 2.0) * 0.9;
      let feedbackCoreEmissive = 0;
      if (cinematicPhase === 'core_charge') {
        feedbackCoreEmissive =
          chargeRatio * (cState.significance === 'horizon' ? 3.8 : 2.6);
      } else if (cinematicPhase === 'transfer') {
        feedbackCoreEmissive = (1.0 - transferRatio) * 2.0;
      }
      innerMat.emissiveIntensity = basePulse + feedbackCoreEmissive;

      ring1.rotation.z = elapsedTime * 0.55 + extraCoreRot * 1.5;
      ring1.rotation.y = Math.PI / 6 + Math.sin(elapsedTime * 0.6) * 0.15;

      ring2.rotation.z = -elapsedTime * 0.42 - extraCoreRot * 1.5;
      ring2.rotation.x = -Math.PI / 4 + Math.cos(elapsedTime * 0.5) * 0.15;

      ring3.rotation.y = elapsedTime * 0.32;
      ring3.rotation.z = -Math.PI / 3 + Math.sin(elapsedTime * 0.4) * 0.15;

      starField.rotation.y = elapsedTime * 0.035;
      deepStarField.rotation.y = -elapsedTime * 0.02;
      distantPlanetGroup.position.y = -9.5 + Math.sin(elapsedTime * 0.5) * 0.35;

      // ── Asynchronous Node Drift & Selection Visual Feedback ───────
      const liveWidth = container.clientWidth || 800;
      const liveHeight = container.clientHeight || 600;

      curveStreams.forEach((stream, idx) => {
        const group = nodeMeshes.get(stream.targetNodeId);
        if (!group) return;

        // A. Asynchronous Multi-Frequency 3D Node Drift
        const dx =
          Math.sin(elapsedTime * stream.freqX + stream.phaseX) * stream.ampX;
        const dy =
          Math.sin(elapsedTime * stream.freqY + stream.phaseY) * stream.ampY;
        const dz =
          Math.cos(elapsedTime * stream.freqZ + stream.phaseZ) * stream.ampZ;
        group.position.set(
          stream.basePos.x + dx,
          stream.basePos.y + dy,
          stream.basePos.z + dz,
        );

        // B. Update 3D Spline Curve Endpoint to match moving node
        stream.curve.points[2].copy(group.position);

        // C. Continuous Flowing Energy Beads along Curve (Slows down for dramatic anticipation during Focus/Gather)
        const beadSpeedMultiplier = isCinematicActive
          ? cinematicPhase === 'focus' || cinematicPhase === 'core_charge'
            ? 0.35
            : 0.65
          : 1.0;

        stream.beads.forEach((bead) => {
          const t =
            (elapsedTime * (bead.speed * beadSpeedMultiplier) + bead.offset) %
            1.0;
          const pt = stream.curve.getPointAt(t);
          bead.mesh.position.copy(pt);

          const scalePulse =
            0.95 + Math.sin(elapsedTime * 8.0 + bead.offset * 12) * 0.3;
          bead.mesh.scale.set(scalePulse, scalePulse, scalePulse);
        });

        // D. Network Pulse Surge / Distinct Completion Surge
        const isTargetSkill = cState.targetSkillId === stream.targetNodeId;
        const pulseMat = stream.pulseMesh.material as THREE.MeshBasicMaterial;
        const tubeMat = stream.glowTubeMesh.material as THREE.MeshStandardMaterial;

        if (isCinematicActive && isTargetSkill && cinematicPhase === 'transfer') {
          // Smooth acceleration and deceleration curve
          const easedT =
            transferRatio < 0.5
              ? 2 * transferRatio * transferRatio
              : -1 + (4 - 2 * transferRatio) * transferRatio;

          stream.surgeGroup.visible = true;
          const leadPt = stream.curve.getPointAt(easedT);
          stream.leadSurgeMesh.position.copy(leadPt);

          stream.trailMeshes.forEach((tMesh, tIdx) => {
            const trailT = Math.max(0, easedT - stream.trailOffsets[tIdx]);
            const trailPt = stream.curve.getPointAt(trailT);
            tMesh.position.copy(trailPt);
          });

          stream.surgePointLight.position.copy(leadPt);
          stream.surgePointLight.intensity =
            7.0 + Math.sin(transferRatio * Math.PI) * 6.0;

          pulseMat.opacity = 0;
          tubeMat.opacity = 0.95;
          tubeMat.emissiveIntensity =
            4.0 + Math.sin(transferRatio * Math.PI) * 4.0;
        } else {
          stream.surgeGroup.visible = false;
          stream.surgePointLight.intensity = 0;
          pulseMat.opacity = 0;
        }

        // ── Selection & Cinematic Lighting & Aura Amplification ────
        const isSelected = selectedId === stream.targetNodeId;
        const isHovered = hoveredNodeIdRef.current === stream.targetNodeId;
        const idleBreathing =
          1.0 + Math.sin(elapsedTime * 0.6 + idx * 1.5) * 0.015;
        let targetScale = isSelected
          ? 1.25
          : isHovered
            ? 1.12
            : idleBreathing;

        if (isCinematicActive && isTargetSkill) {
          if (cinematicPhase === 'focus' || cinematicPhase === 'core_charge') {
            targetScale = 1.22;
          } else if (cinematicPhase === 'transfer') {
            targetScale = 1.22 + Math.sin(transferRatio * Math.PI) * 0.1;
          } else if (cinematicPhase === 'absorption') {
            const isHorizon =
              cState.significance === 'horizon' ||
              Boolean(feedbackEventRef.current?.crossedHorizon);
            const contract = Math.sin(absorptionRatio * Math.PI * 0.5) * 0.08;
            const expand =
              Math.sin(absorptionRatio * Math.PI) * (isHorizon ? 0.5 : 0.35);
            targetScale = 1.22 * (1.0 - contract + expand);
          } else if (cinematicPhase === 'settle') {
            targetScale = 1.22 + (1.0 - settleRatio) * 0.06;
          }
        }
        group.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.14,
        );

        const light = nodePointLights.get(stream.targetNodeId);
        if (light) {
          if (
            isCinematicActive &&
            isTargetSkill &&
            cinematicPhase === 'absorption'
          ) {
            const isHorizon =
              cState.significance === 'horizon' ||
              Boolean(feedbackEventRef.current?.crossedHorizon);
            light.intensity =
              2.5 +
              Math.sin(absorptionRatio * Math.PI) * (isHorizon ? 12.0 : 7.0);
          } else if (isSelected) {
            light.intensity = THREE.MathUtils.lerp(light.intensity, 2.2, 0.08);
          } else if (isHovered) {
            light.intensity = THREE.MathUtils.lerp(light.intensity, 1.7, 0.08);
          } else {
            light.intensity = THREE.MathUtils.lerp(
              light.intensity,
              stream.baseLightIntensity,
              0.08,
            );
          }
        }

        if (
          isCinematicActive &&
          isTargetSkill &&
          cinematicPhase === 'absorption'
        ) {
          tubeMat.opacity = 0.7;
          tubeMat.emissiveIntensity = 2.5;
        } else if (isSelected) {
          tubeMat.opacity = 0.55;
          tubeMat.emissiveIntensity = 2.0;
        } else if (hasActiveSelection || isCinematicActive) {
          tubeMat.opacity = 0.18;
          tubeMat.emissiveIntensity = 0.75;
        } else {
          tubeMat.opacity = 0.32;
          tubeMat.emissiveIntensity = 1.2;
        }

        // Rotate child rings
        group.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
            child.rotation.z += 0.015;
          }
        });

        // ── E. Direct DOM Transform Update ────────────────────────
        const labelEl = labelElsRef.current.get(stream.targetNodeId);
        if (labelEl) {
          const worldPos = new THREE.Vector3();
          group.getWorldPosition(worldPos);
          const proj = worldPos.clone().project(camera);

          const screenX = ((proj.x + 1) * liveWidth) / 2;
          const screenY = ((-proj.y + 1) * liveHeight) / 2;
          const depthFactor = THREE.MathUtils.clamp((worldPos.z + 4) / 8, 0.78, 1.22);
          const opacity = proj.z < 1 ? THREE.MathUtils.clamp(depthFactor, 0.72, 1) : 0;

          labelEl.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%) scale(${depthFactor})`;
          labelEl.style.opacity = `${opacity}`;
        }
      });

      composer.render();
      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    // ── 10. Complete Cleanup on Unmount ──────────────────────────
    return () => {
      rebuildSkillNodesRef.current = null;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      composer.dispose();
      renderer.dispose();
    };
  }, [globalLevel]);

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      className={cn(
        'relative w-full h-[520px] sm:h-[620px] lg:h-[680px] overflow-hidden select-none',
        isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
    >
      {/* Floating Re-Center Orbit Button (Appears when camera has been manually rotated/zoomed) */}
      {hasCustomOrbit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleResetCamera();
          }}
          className="absolute bottom-20 right-4 z-40 px-2.5 py-1.5 rounded-full bg-surface/85 border border-edge/80 hover:border-accent/60 text-zinc-400 hover:text-zinc-100 text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-xl shadow-lg transition-all cursor-pointer animate-fade-in pointer-events-auto"
          title="Re-Center Cosmos View"
        >
          <RotateCcw size={12} className="text-accent" />
          <span>Re-Center</span>
        </button>
      )}

      {/* ── 2D-in-3D Projected Holographic Node Badges ────────── */}
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        const stageName = node.progression?.currentStage.name;

        return (
          <div
            key={node.id}
            ref={(el) => {
              if (el) labelElsRef.current.set(node.id, el);
              else labelElsRef.current.delete(node.id);
            }}
            onClick={() => onSelectNode(node)}
            onMouseEnter={() => {
              hoveredNodeIdRef.current = node.id;
              onHoverNodeRef.current?.(node);
            }}
            onMouseLeave={() => {
              hoveredNodeIdRef.current = null;
              onHoverNodeRef.current?.(null);
            }}
            style={{
              left: '0px',
              top: '0px',
              transform: 'translate3d(-9999px, -9999px, 0)',
              willChange: 'transform, opacity',
            }}
            className={cn(
              'absolute z-30 cursor-pointer pointer-events-auto transition-shadow duration-300 ease-out group',
            )}
            tabIndex={0}
            role="button"
            aria-label={`View Skill Journey for ${node.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectNode(node);
              }
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* Hitbox Area */}
              <div className="w-16 h-16 rounded-full -mb-2" />

              {/* Holographic Label Capsule */}
              <div
                className={cn(
                  'px-2.5 py-1 rounded-xl flex items-center gap-1.5',
                  'bg-surface/90 border backdrop-blur-md shadow-xl transition-all duration-300',
                  isSelected
                    ? 'border-accent/90 text-zinc-50 shadow-[0_0_18px_rgba(129,140,248,0.6)] ring-1 ring-accent/60 scale-105'
                    : 'border-edge/70 text-zinc-200 hover:border-zinc-300 hover:text-white',
                )}
              >
                <span className="text-sm">{node.icon}</span>
                <span className="text-xs font-bold tracking-tight truncate max-w-[100px] sm:max-w-[130px]">
                  {node.name}
                </span>
                {stageName && (
                  <span
                    className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-canvas/80 border border-edge/60 text-zinc-300"
                    style={{ color: node.color }}
                  >
                    {stageName}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
