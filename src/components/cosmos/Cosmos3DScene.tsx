import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import type { SkillProgressionState } from '../../utils/progression';
import { calculateLevelAura } from '../../utils/progression';
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
  globalLevel?: number;
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
  globalLevel = 1,
  className,
}: Cosmos3DSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelElsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Store active selection in ref to avoid re-initializing WebGL on selection change
  const selectedNodeIdRef = useRef<string | undefined>(selectedNodeId);
  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
  }, [selectedNodeId]);

  const onSelectNodeRef = useRef(onSelectNode);
  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);

  // Mouse & render loop references
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoveredNodeIdRef = useRef<string | null>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    targetMouseRef.current = { x, y };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // ── 1. Scene, Camera & Renderer Setup ───────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060813, 0.016);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // ── 2. Cinematic Post-Processing Bloom ───────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
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

    // ── 5. Centerpiece — Mastery Core ────────────────────────────
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Foundation starting scale is ~60% of original, evolving smoothly as journey level grows
    const safeGlobalLevel = Math.max(1, globalLevel);
    const coreScale = Math.min(1.0, 0.60 + Math.log2(safeGlobalLevel) * 0.08);
    coreGroup.scale.set(coreScale, coreScale, coreScale);

    // Inner Core
    const innerGeo = new THREE.SphereGeometry(0.92, 48, 48);
    const innerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x818cf8),
      emissive: new THREE.Color(0x6366f1),
      emissiveIntensity: 2.8,
      roughness: 0.15,
      metalness: 0.7,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    // Outer Crystal Shell
    const crystalGeo = new THREE.SphereGeometry(1.62, 64, 64);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xc7d2fe),
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
      attenuationColor: new THREE.Color(0x818cf8),
      attenuationDistance: 2.0,
    });
    const crystalShell = new THREE.Mesh(crystalGeo, crystalMat);
    coreGroup.add(crystalShell);

    // Geodesic Accent Lattice
    const latticeGeo = new THREE.IcosahedronGeometry(1.68, 1);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x22d3ee),
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const latticeShell = new THREE.Mesh(latticeGeo, latticeMat);
    coreGroup.add(latticeShell);

    // Core Point Lights (Scaled to Core Size)
    const coreLight1 = new THREE.PointLight(0x818cf8, 4.5 * coreScale, 22 * coreScale, 1.2);
    coreGroup.add(coreLight1);
    const coreLight2 = new THREE.PointLight(0x22d3ee, 3.0 * coreScale, 15 * coreScale, 1.4);
    coreGroup.add(coreLight2);

    // 3D Concentric Metallic Orbital Rings
    const ring1Geo = new THREE.TorusGeometry(2.5, 0.022, 24, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x818cf8,
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
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.1,
      metalness: 0.95,
      roughness: 0.08,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(4.2, 0.014, 24, 120);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xf472b6,
      emissiveIntensity: 0.8,
      metalness: 0.95,
      roughness: 0.08,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI / 6;
    ring3.rotation.z = -Math.PI / 3;
    coreGroup.add(ring3);

    // ── 6. REAL SKILL NODES & PROGRESSION-INFORMED GEOMETRIES ────
    const nodeMeshes = new Map<string, THREE.Group>();
    const nodePointLights = new Map<string, THREE.PointLight>();
    const curveStreams: Array<{
      curve: THREE.CatmullRomCurve3;
      glowTubeMesh: THREE.Mesh;
      basePos: THREE.Vector3;
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
      targetNodeId: string;
    }> = [];

    nodes.forEach((node, idx) => {
      const posArray = getSpatialPosition(idx, nodes.length);
      const basePos = new THREE.Vector3(...posArray);

      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(basePos);
      nodeGroup.userData = { id: node.id, nodeData: node };
      scene.add(nodeGroup);
      nodeMeshes.set(node.id, nodeGroup);

      const colorVal = new THREE.Color(node.color);

      // Extract progression metrics
      const progression = node.progression;
      const visualScale = progression ? progression.boundedVisualScale : 1.0;
      const tier = progression ? progression.structureTier : 1;
      const { emissiveIntensity, haloOpacity } = calculateLevelAura(node.level);

      // ── A. Base Inner Glowing Energy Core (Scaled by Bounded Hours) ──
      const innerCoreRadius = 0.48 * visualScale;
      const nodeInnerGeo = new THREE.SphereGeometry(innerCoreRadius, 32, 32);
      const nodeInnerMat = new THREE.MeshStandardMaterial({
        color: colorVal,
        emissive: colorVal,
        emissiveIntensity: emissiveIntensity,
        metalness: 0.8,
        roughness: 0.12,
      });
      const nodeInnerMesh = new THREE.Mesh(nodeInnerGeo, nodeInnerMat);
      nodeGroup.add(nodeInnerMesh);

      // ── B. Outer Halo Sphere (Richness controlled by Level) ───────
      const haloRadius = 0.68 * visualScale;
      const haloGeo = new THREE.SphereGeometry(haloRadius, 24, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: colorVal,
        transparent: true,
        opacity: haloOpacity,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      nodeGroup.add(haloMesh);

      // ── C. Structural Evolution Tiers (Milestones -> Structure) ───
      if (tier >= 2) {
        // Tier 2+: Physical Crystal Shell (Translucent Refraction)
        const shellRadius = 0.72 * visualScale;
        const nodeShellGeo = new THREE.SphereGeometry(shellRadius, 48, 48);
        const nodeShellMat = new THREE.MeshPhysicalMaterial({
          color: colorVal,
          transparent: true,
          opacity: 0.55,
          transmission: 0.82,
          roughness: 0.08,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
          specularIntensity: 1.0,
        });
        const nodeShellMesh = new THREE.Mesh(nodeShellGeo, nodeShellMat);
        nodeGroup.add(nodeShellMesh);
      }

      if (tier >= 3) {
        // Tier 3+: Primary Metallic Orbital Ring
        const ring1Radius = 0.96 * visualScale;
        const nodeRingGeo = new THREE.TorusGeometry(ring1Radius, 0.015, 16, 60);
        const nodeRingMat = new THREE.MeshStandardMaterial({
          color: colorVal,
          emissive: colorVal,
          emissiveIntensity: 1.2,
          metalness: 0.92,
          roughness: 0.1,
        });
        const nodeRing = new THREE.Mesh(nodeRingGeo, nodeRingMat);
        nodeRing.rotation.x = Math.PI / 2.5;
        nodeGroup.add(nodeRing);
      }

      if (tier >= 4) {
        // Tier 4+: Dual Counter-Rotating Metallic Orbital Rings
        const ring2Radius = 1.20 * visualScale;
        const nodeRing2Geo = new THREE.TorusGeometry(ring2Radius, 0.012, 16, 60);
        const nodeRing2Mat = new THREE.MeshStandardMaterial({
          color: colorVal,
          emissive: colorVal,
          emissiveIntensity: 1.0,
          metalness: 0.95,
          roughness: 0.08,
        });
        const nodeRing2 = new THREE.Mesh(nodeRing2Geo, nodeRing2Mat);
        nodeRing2.rotation.x = -Math.PI / 3;
        nodeRing2.rotation.y = Math.PI / 4;
        nodeGroup.add(nodeRing2);
      }

      if (tier >= 5) {
        // Tier 5+: Outer Geodesic Accent Lattice Shell
        const latticeRadius = 0.88 * visualScale;
        const nodeLatticeGeo = new THREE.IcosahedronGeometry(latticeRadius, 1);
        const nodeLatticeMat = new THREE.MeshBasicMaterial({
          color: colorVal,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        });
        const nodeLattice = new THREE.Mesh(nodeLatticeGeo, nodeLatticeMat);
        nodeGroup.add(nodeLattice);
      }

      if (tier >= 6) {
        // Tier 6: Triple Gyroscopic Orbital Rings (Deep Mastery)
        const ring3Radius = 1.42 * visualScale;
        const nodeRing3Geo = new THREE.TorusGeometry(ring3Radius, 0.010, 16, 60);
        const nodeRing3Mat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: colorVal,
          emissiveIntensity: 1.4,
          metalness: 0.95,
          roughness: 0.05,
        });
        const nodeRing3 = new THREE.Mesh(nodeRing3Geo, nodeRing3Mat);
        nodeRing3.rotation.y = Math.PI / 2;
        nodeGroup.add(nodeRing3);
      }

      // Point Light (Radiance scaled with level)
      const ptLightIntensity = (progression?.levelAuraIntensity ?? 1.5) * 1.6;
      const nodeLight = new THREE.PointLight(colorVal, ptLightIntensity, 8 * visualScale, 1.5);
      nodeGroup.add(nodeLight);
      nodePointLights.set(node.id, nodeLight);

      // ── 3D Connection Spline with 3 Continuous Energy Beads ─────
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

      // A. Hairline Optical Core
      const coreTubeGeo = new THREE.TubeGeometry(curve, 48, 0.012, 8, false);
      const coreTubeMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
      });
      const coreTubeMesh = new THREE.Mesh(coreTubeGeo, coreTubeMat);
      scene.add(coreTubeMesh);

      // B. Outer Glowing Energy Stream Tube
      const glowTubeGeo = new THREE.TubeGeometry(curve, 48, 0.032, 8, false);
      const glowTubeMat = new THREE.MeshStandardMaterial({
        color: colorVal,
        emissive: colorVal,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.38,
      });
      const glowTubeMesh = new THREE.Mesh(glowTubeGeo, glowTubeMat);
      scene.add(glowTubeMesh);

      // C. 3 Staggered Continuous Traveling Energy Beads per Curve
      const beads: Array<{ mesh: THREE.Mesh; speed: number; offset: number }> = [];

      const bead1Geo = new THREE.SphereGeometry(0.085, 12, 12);
      const beadMat1 = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const beadMesh1 = new THREE.Mesh(bead1Geo, beadMat1);
      scene.add(beadMesh1);
      beads.push({ mesh: beadMesh1, speed: 0.28 + (idx % 3) * 0.04, offset: 0.0 });

      const bead2Geo = new THREE.SphereGeometry(0.075, 10, 10);
      const beadMat2 = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const beadMesh2 = new THREE.Mesh(bead2Geo, beadMat2);
      scene.add(beadMesh2);
      beads.push({ mesh: beadMesh2, speed: 0.32 + (idx % 2) * 0.03, offset: 0.36 });

      const bead3Geo = new THREE.SphereGeometry(0.068, 10, 10);
      const beadMat3 = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const beadMesh3 = new THREE.Mesh(bead3Geo, beadMat3);
      scene.add(beadMesh3);
      beads.push({ mesh: beadMesh3, speed: 0.26 + (idx % 4) * 0.03, offset: 0.72 });

      // D. Network Pulse Surge Bead
      const pulseGeo = new THREE.SphereGeometry(0.15, 14, 14);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      scene.add(pulseMesh);

      curveStreams.push({
        curve,
        glowTubeMesh,
        basePos,
        ampX: 0.20,
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
        targetNodeId: node.id,
      });
    });

    // ── 7. Raycaster for Click Detection ─────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
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
          onSelectNodeRef.current(hitGroup.userData.nodeData);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // ── 8. Resize Observer ───────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // ── 9. Living Cosmos Render Animation Loop ───────────────────
    const clock = new THREE.Clock();
    let animFrameId: number;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Damped Camera Parallax with Gentle Idle Orbit
      mousePosRef.current.x += (targetMouseRef.current.x - mousePosRef.current.x) * 0.04;
      mousePosRef.current.y += (targetMouseRef.current.y - mousePosRef.current.y) * 0.04;

      const idleCamX = Math.sin(elapsedTime * 0.5) * 0.3;
      const idleCamY = Math.cos(elapsedTime * 0.4) * 0.2;

      camera.position.x = mousePosRef.current.x * 1.6 + idleCamX;
      camera.position.y = mousePosRef.current.y * 1.0 + idleCamY;
      camera.lookAt(0, 0, 0);

      // ── Mastery Core Evident Multi-Speed Dynamics ───────────────
      // A. Vertical floating hover (4.2s cycle, visible amplitude)
      coreGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.22;

      // B. Differential Rotations
      crystalShell.rotation.y = elapsedTime * 0.45;
      crystalShell.rotation.x = Math.sin(elapsedTime * 0.3) * 0.25;
      latticeShell.rotation.y = -elapsedTime * 0.32;
      latticeShell.rotation.z = elapsedTime * 0.2;
      innerCore.rotation.y = -elapsedTime * 0.75;
      innerCore.rotation.z = elapsedTime * 0.4;

      // C. Emissive Breathing (Radiant Pulse)
      const pulseScale = 1.0 + Math.sin(elapsedTime * 2.5) * 0.08;
      innerCore.scale.set(pulseScale, pulseScale, pulseScale);
      innerMat.emissiveIntensity = 2.4 + Math.sin(elapsedTime * 2.0) * 0.9;

      // D. Metallic Orbital Rings Continuous Multi-Axis Revolutions
      ring1.rotation.z = elapsedTime * 0.55;
      ring1.rotation.y = Math.PI / 6 + Math.sin(elapsedTime * 0.6) * 0.15;

      ring2.rotation.z = -elapsedTime * 0.42;
      ring2.rotation.x = -Math.PI / 4 + Math.cos(elapsedTime * 0.5) * 0.15;

      ring3.rotation.y = elapsedTime * 0.32;
      ring3.rotation.z = -Math.PI / 3 + Math.sin(elapsedTime * 0.4) * 0.15;

      // E. Deep Space Background Starfield & Planet Drift
      starField.rotation.y = elapsedTime * 0.035;
      deepStarField.rotation.y = -elapsedTime * 0.02;
      distantPlanetGroup.position.y = -9.5 + Math.sin(elapsedTime * 0.5) * 0.35;

      // ── Asynchronous Node Drift & Continuous Energy Stream Updates
      const activePulseCycle = 7.0; // 7s pulse period
      const pulseIndex = Math.floor(elapsedTime / activePulseCycle) % Math.max(1, curveStreams.length);
      const pulseProgress = (elapsedTime % activePulseCycle) / 1.8; // 1.8s travel duration

      curveStreams.forEach((stream, idx) => {
        const group = nodeMeshes.get(stream.targetNodeId);
        if (!group) return;

        // A. Asynchronous Multi-Frequency 3D Node Drift
        const dx = Math.sin(elapsedTime * stream.freqX + stream.phaseX) * stream.ampX;
        const dy = Math.sin(elapsedTime * stream.freqY + stream.phaseY) * stream.ampY;
        const dz = Math.cos(elapsedTime * stream.freqZ + stream.phaseZ) * stream.ampZ;
        group.position.set(
          stream.basePos.x + dx,
          stream.basePos.y + dy,
          stream.basePos.z + dz,
        );

        // B. Update 3D Spline Curve Endpoint to match moving node
        stream.curve.points[2].copy(group.position);

        // C. Continuous Flowing Energy Beads along Curve
        stream.beads.forEach((bead) => {
          const t = (elapsedTime * bead.speed + bead.offset) % 1.0;
          const pt = stream.curve.getPointAt(t);
          bead.mesh.position.copy(pt);

          const scalePulse = 0.95 + Math.sin(elapsedTime * 8.0 + bead.offset * 12) * 0.3;
          bead.mesh.scale.set(scalePulse, scalePulse, scalePulse);
        });

        // D. Calm Core -> Node Network Pulse
        const isCurrentPulseStream = idx === pulseIndex;
        const pulseMat = stream.pulseMesh.material as THREE.MeshBasicMaterial;
        const tubeMat = stream.glowTubeMesh.material as THREE.MeshStandardMaterial;

        if (isCurrentPulseStream && pulseProgress <= 1.0) {
          const pulsePt = stream.curve.getPointAt(pulseProgress);
          stream.pulseMesh.position.copy(pulsePt);

          const opacity = Math.sin(pulseProgress * Math.PI) * 0.95;
          pulseMat.opacity = opacity;
          tubeMat.emissiveIntensity = 1.5 + Math.sin(pulseProgress * Math.PI) * 1.8;

          if (pulseProgress > 0.8) {
            const light = nodePointLights.get(stream.targetNodeId);
            if (light) light.intensity = 2.8 + (1.0 - pulseProgress) * 4.0;
          }
        } else {
          pulseMat.opacity = 0;
          tubeMat.emissiveIntensity = 1.5;
        }

        // Node Selection / Hover Scaling
        const isSelected = selectedNodeIdRef.current === stream.targetNodeId;
        const isHovered = hoveredNodeIdRef.current === stream.targetNodeId;
        const targetScale = isSelected ? 1.28 : isHovered ? 1.16 : 1.0;
        group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        // Rotate child rings
        group.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
            child.rotation.z += 0.015;
          }
        });

        // ── E. Direct DOM Transform Update (0 React Re-Renders!) ────
        const labelEl = labelElsRef.current.get(stream.targetNodeId);
        if (labelEl) {
          const worldPos = new THREE.Vector3();
          group.getWorldPosition(worldPos);
          const proj = worldPos.clone().project(camera);

          const screenX = ((proj.x + 1) * container.clientWidth) / 2;
          const screenY = ((-proj.y + 1) * container.clientHeight) / 2;
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
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      composer.dispose();
      renderer.dispose();
    };
  }, [nodes, globalLevel]);

  return (
    <div
      ref={mountRef}
      onPointerMove={handlePointerMove}
      className={cn(
        'relative w-full h-[520px] sm:h-[620px] lg:h-[680px] overflow-hidden select-none',
        className,
      )}
    >
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
            }}
            onMouseLeave={() => {
              hoveredNodeIdRef.current = null;
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
                    ? 'border-accent/90 text-zinc-50 shadow-[0_0_16px_rgba(129,140,248,0.5)] ring-1 ring-accent/60 scale-105'
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
