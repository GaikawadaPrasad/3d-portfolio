import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { sound } from '../utils/sound';
import { TextureFactory } from '../utils/textureFactory';
import { PORTFOLIO_DATA, ProjectItem } from '../data/portfolioData';

interface World3DProps {
  currentStation: number;
  freeRoam: boolean;
  onStationChange: (station: number) => void;
  onSelectProject: (project: ProjectItem) => void;
  motionTriggered: boolean;
  distanceCm: number;
  isTransmitting: boolean;
  onTriggerMotion: () => void;
}

export const World3D: React.FC<World3DProps> = ({
  currentStation,
  freeRoam,
  onStationChange,
  onSelectProject,
  motionTriggered,
  distanceCm,
  isTransmitting,
  onTriggerMotion,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Mutable refs for animation loop
  const currentStationRef = useRef(currentStation);
  const freeRoamRef = useRef(freeRoam);
  const motionTriggeredRef = useRef(motionTriggered);
  const distanceCmRef = useRef(distanceCm);
  const isTransmittingRef = useRef(isTransmitting);

  useEffect(() => { currentStationRef.current = currentStation; }, [currentStation]);
  useEffect(() => { freeRoamRef.current = freeRoam; }, [freeRoam]);
  useEffect(() => { motionTriggeredRef.current = motionTriggered; }, [motionTriggered]);
  useEffect(() => { distanceCmRef.current = distanceCm; }, [distanceCm]);
  useEffect(() => { isTransmittingRef.current = isTransmitting; }, [isTransmitting]);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  // Station camera waypoints along 3D coordinate spine
  const stationWaypoints = [
    { pos: new THREE.Vector3(0, 3.8, 9.2), look: new THREE.Vector3(0, 0.4, 0) },             // 0: Nexus Hero Dev Rig
    { pos: new THREE.Vector3(0, -21.2, 28.2), look: new THREE.Vector3(0, -24.8, 20) },        // 1: Silicon Foundry ESP32
    { pos: new THREE.Vector3(0, -44.5, 49.0), look: new THREE.Vector3(0, -49.6, 40) },        // 2: Project Showroom Hangar
    { pos: new THREE.Vector3(0, -70.2, 69.2), look: new THREE.Vector3(0, -74.7, 60) },        // 3: IoT Electronics Bench
    { pos: new THREE.Vector3(0, -93.8, 89.8), look: new THREE.Vector3(0, -99.6, 80) },        // 4: Skill Constellation Galaxy
    { pos: new THREE.Vector3(0, -119.5, 109.5), look: new THREE.Vector3(0, -124.6, 100) },    // 5: Quantum Radar Beacon
  ];

  const currentCamPos = useRef(new THREE.Vector3(0, 3.8, 9.2));
  const currentCamLook = useRef(new THREE.Vector3(0, 0.4, 0));
  const targetCamPos = useRef(new THREE.Vector3(0, 3.8, 9.2));
  const targetCamLook = useRef(new THREE.Vector3(0, 0.4, 0));

  // Raycasting & Interaction
  const interactables = useRef<Array<{ mesh: THREE.Object3D; action: () => void; name: string }>>([]);
  const hoveredName = useRef<string | null>(null);

  // Animated elements refs
  const terminalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const terminalTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const ultrasonicRings = useRef<THREE.Mesh[]>([]);
  const pirDomeRef = useRef<THREE.Mesh | null>(null);
  const pirConeMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const alarmLightRef = useRef<THREE.PointLight | null>(null);
  const beaconBeamRef = useRef<THREE.Mesh | null>(null);
  const beaconLightRef = useRef<THREE.PointLight | null>(null);
  const beaconStrobe1Ref = useRef<THREE.PointLight | null>(null);
  const beaconStrobe2Ref = useRef<THREE.PointLight | null>(null);
  const rfShieldRef = useRef<THREE.Mesh | null>(null);
  const siliconRings = useRef<{ ring1: THREE.Mesh; ring2: THREE.Mesh; ring3: THREE.Mesh } | null>(null);
  const projectMonoliths = useRef<THREE.Group[]>([]);
  const skillNodesRef = useRef<Array<{ group: THREE.Group; core: THREE.Mesh; cage: THREE.Mesh; speed: number; angle: number; r: number; y: number }>>([]);
  const solarWingsRef = useRef<THREE.Group | null>(null);

  // Terminal screen procedural texture (Live Telemetry Matrix)
  const updateTerminalCanvas = useCallback((time: number) => {
    if (!terminalCanvasRef.current || !terminalTextureRef.current) return;
    const ctx = terminalCanvasRef.current.getContext('2d');
    if (!ctx) return;

    // Dark terminal background
    ctx.fillStyle = '#050807';
    ctx.fillRect(0, 0, 512, 320);

    // Terminal header
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px "Fira Code", monospace';
    ctx.fillText('PRASAD GAIKWAD // 3D WORKSTATION v6.2', 16, 26);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Fira Code", monospace';
    ctx.fillText(`ARCH: XTENSA 32-BIT 240MHz | UPTIME: ${time.toFixed(1)}s`, 16, 48);

    // Live Oscilloscope Waveform
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < 480; x += 4) {
      const y = 125 + Math.sin(x * 0.05 + time * 4) * 22 + Math.cos(x * 0.1 - time * 2) * 8;
      if (x === 0) ctx.moveTo(16 + x, y);
      else ctx.lineTo(16 + x, y);
    }
    ctx.stroke();

    // Secondary Telemetry Signal (Hardware Amber)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < 480; x += 6) {
      const y = 145 + Math.sin(x * 0.03 - time * 3) * 16;
      if (x === 0) ctx.moveTo(16 + x, y);
      else ctx.lineTo(16 + x, y);
    }
    ctx.stroke();

    // Sensor status logs
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('> ESP32 NODE: CONNECTED [WiFi 802.11 b/g/n]', 16, 195);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('> RADAR HC-SR04: PING ACTIVE | PIR: ARMED', 16, 218);
    ctx.fillStyle = '#10b981';
    ctx.fillText('> FULL-STACK RUNTIME: REACT 19 + THREE.JS + NODE', 16, 241);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('> NAV: SCROLL WHEEL / ARROW KEYS / TOP HUD TABS_', 16, 265);

    // Grid scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    for (let y = 0; y < 320; y += 4) {
      ctx.fillRect(0, y, 512, 1);
    }

    terminalTextureRef.current.needsUpdate = true;
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const textureLoader = new THREE.TextureLoader();

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060709);
    scene.fog = new THREE.FogExp2(0x060709, 0.010);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 350);
    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentCamLook.current);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // LIGHTING SETUP (Atmospheric Studio / Foundry)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xf8fafc, 2.0);
    mainSun.position.set(20, 35, 25);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    scene.add(mainSun);

    const rimLight = new THREE.DirectionalLight(0x10b981, 1.2);
    rimLight.position.set(-20, 15, -15);
    scene.add(rimLight);

    const warmAccentLight = new THREE.DirectionalLight(0xf59e0b, 0.8);
    warmAccentLight.position.set(10, -50, -10);
    scene.add(warmAccentLight);

    // Common Materials
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x111419, roughness: 0.35, metalness: 0.85 });
    const brushedSilverMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.25, metalness: 0.95 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2, metalness: 0.95 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.9 });
    const blackGlossMat = new THREE.MeshStandardMaterial({ color: 0x080a0c, roughness: 0.1, metalness: 0.9 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.08, metalness: 0.1, transmission: 0.9, transparent: true, opacity: 0.35 });

    // =========================================================================
    // STATION 0: NEXUS DEVELOPER WORKSTATION (y: 0, z: 0)
    // =========================================================================
    const station0 = new THREE.Group();
    station0.position.set(0, 0, 0);

    // Octagonal Heavy Foundry Platform
    const plat0Geo = new THREE.CylinderGeometry(5.8, 6.2, 0.4, 8);
    const plat0 = new THREE.Mesh(plat0Geo, darkMetalMat);
    plat0.position.y = -0.2;
    plat0.receiveShadow = true;
    station0.add(plat0);

    // Perimeter Emerald Ring Light
    const ring0Geo = new THREE.TorusGeometry(5.95, 0.05, 16, 64);
    const ring0Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ring0 = new THREE.Mesh(ring0Geo, ring0Mat);
    ring0.rotation.x = Math.PI / 2;
    ring0.position.y = -0.05;
    station0.add(ring0);

    const grid0 = new THREE.GridHelper(10, 20, 0x10b981, 0x1e293b);
    grid0.position.y = 0.01;
    station0.add(grid0);

    // High-Tech Carbon Fiber Desk
    const deskTopGeo = new THREE.BoxGeometry(4.4, 0.1, 2.2);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x0d1117, roughness: 0.3, metalness: 0.8 });
    const deskTop = new THREE.Mesh(deskTopGeo, deskMat);
    deskTop.position.set(0, 0.9, -0.4);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    station0.add(deskTop);

    // Desk Angular Support Legs
    const legGeo = new THREE.BoxGeometry(0.12, 0.9, 1.8);
    const legL = new THREE.Mesh(legGeo, darkMetalMat);
    legL.position.set(-1.9, 0.45, -0.4);
    legL.castShadow = true;
    station0.add(legL);

    const legR = new THREE.Mesh(legGeo, darkMetalMat);
    legR.position.set(1.9, 0.45, -0.4);
    legR.castShadow = true;
    station0.add(legR);

    // Under-desk cable spine & green LED ambient glow
    const deskLight = new THREE.PointLight(0x10b981, 1.2, 3);
    deskLight.position.set(0, 0.8, -0.4);
    station0.add(deskLight);

    // 1. Ultrawide Curved Monitor Rig (Left-Center)
    const monitorArmBase = new THREE.CylinderGeometry(0.18, 0.22, 0.15, 24);
    const mBase = new THREE.Mesh(monitorArmBase, darkMetalMat);
    mBase.position.set(-0.8, 0.98, -1.0);
    station0.add(mBase);

    const mArmGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 16);
    const mArm = new THREE.Mesh(mArmGeo, brushedSilverMat);
    mArm.position.set(-0.8, 1.35, -1.0);
    station0.add(mArm);

    // Monitor Outer Bezel Housing
    const mFrameGeo = new THREE.BoxGeometry(2.7, 1.5, 0.12);
    const mFrame = new THREE.Mesh(mFrameGeo, darkMetalMat);
    mFrame.position.set(-0.8, 1.85, -0.85);
    mFrame.rotation.y = 0.14;
    mFrame.castShadow = true;
    station0.add(mFrame);

    // Curved terminal display canvas
    const termCanvas = document.createElement('canvas');
    termCanvas.width = 512;
    termCanvas.height = 320;
    terminalCanvasRef.current = termCanvas;
    const termTexture = new THREE.CanvasTexture(termCanvas);
    terminalTextureRef.current = termTexture;

    const termScreenGeo = new THREE.PlaneGeometry(2.58, 1.38);
    const termScreenMat = new THREE.MeshBasicMaterial({ map: termTexture });
    const termScreen = new THREE.Mesh(termScreenGeo, termScreenMat);
    termScreen.position.set(-0.8, 1.85, -0.78);
    termScreen.rotation.y = 0.14;
    station0.add(termScreen);

    // 2. High-End Developer Laptop (Right-Center)
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0.95, 0.96, -0.3);
    laptopGroup.rotation.y = -0.26;

    // Laptop Base Chassis (Unibody dark aluminum)
    const kbTexture = TextureFactory.createKeyboardTexture();
    const lapSideMat = darkMetalMat;
    const lapTopMat = new THREE.MeshStandardMaterial({ map: kbTexture, roughness: 0.4 });
    const lapBaseMaterials = [lapSideMat, lapSideMat, lapTopMat, lapSideMat, lapSideMat, lapSideMat];
    const lapBaseGeo = new THREE.BoxGeometry(1.3, 0.04, 0.9);
    const lapBase = new THREE.Mesh(lapBaseGeo, lapBaseMaterials);
    lapBase.castShadow = true;
    laptopGroup.add(lapBase);

    // Laptop Hinge
    const hingeGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.25, 16);
    const hinge = new THREE.Mesh(hingeGeo, brushedSilverMat);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, 0.03, -0.44);
    laptopGroup.add(hinge);

    // Laptop Screen Lid (Angled 115 degrees)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.03, -0.44);
    lidGroup.rotation.x = -Math.PI * 0.38;

    const lidGeo = new THREE.BoxGeometry(1.3, 0.88, 0.025);
    const lid = new THREE.Mesh(lidGeo, darkMetalMat);
    lid.position.set(0, 0.44, 0);
    lidGroup.add(lid);

    // Laptop Screen (Code Editor visual)
    const lapScreenGeo = new THREE.PlaneGeometry(1.24, 0.82);
    const lapScreenMat = new THREE.MeshBasicMaterial({ color: 0x091410 });
    const lapScreen = new THREE.Mesh(lapScreenGeo, lapScreenMat);
    lapScreen.position.set(0, 0.44, 0.015);
    lidGroup.add(lapScreen);

    // Glowing Logo on back of lid
    const logoBadge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.005), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    logoBadge.position.set(0, 0.44, -0.015);
    lidGroup.add(logoBadge);

    laptopGroup.add(lidGroup);
    station0.add(laptopGroup);

    // 3. Ergonomic Accessories (Mechanical Keyboard, Mouse, Coffee Mug)
    // Custom 75% Mechanical Keyboard
    const kbGeo = new THREE.BoxGeometry(1.2, 0.05, 0.45);
    const kbMesh = new THREE.Mesh(kbGeo, blackGlossMat);
    kbMesh.position.set(-0.8, 0.98, -0.2);
    kbMesh.rotation.y = 0.08;
    station0.add(kbMesh);

    // Wireless Precision Mouse
    const mouseGeo = new THREE.BoxGeometry(0.18, 0.06, 0.28);
    const mouseMesh = new THREE.Mesh(mouseGeo, darkMetalMat);
    mouseMesh.position.set(0.05, 0.98, -0.2);
    station0.add(mouseMesh);

    // Matte Ceramic Developer Mug
    const mugGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.24, 24);
    const mugMat = new THREE.MeshStandardMaterial({ color: 0x181e26, roughness: 0.2 });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.set(1.7, 1.07, -0.6);
    station0.add(mug);

    // 4. Floating Holographic Avatar Display (Right Side)
    const portraitTex = textureLoader.load(PORTFOLIO_DATA.profile.avatar);
    const portraitGeo = new THREE.PlaneGeometry(1.5, 1.9);
    const portraitMat = new THREE.MeshStandardMaterial({ map: portraitTex, roughness: 0.2 });
    const portraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
    portraitMesh.position.set(1.9, 2.1, -0.4);
    portraitMesh.rotation.y = -0.32;
    station0.add(portraitMesh);

    // Cybernetic Holographic Brackets & Glass Frame
    const portraitFrameGeo = new THREE.BoxGeometry(1.64, 2.04, 0.06);
    const portraitFrame = new THREE.Mesh(portraitFrameGeo, darkMetalMat);
    portraitFrame.position.set(1.9, 2.1, -0.44);
    portraitFrame.rotation.y = -0.32;
    station0.add(portraitFrame);

    // Corner targeting reticles
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const reticleMesh1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), reticleMat);
    reticleMesh1.position.set(1.15, 3.1, -0.2);
    station0.add(reticleMesh1);

    interactables.current.push({
      mesh: termScreen,
      name: 'Nexus Developer Terminal',
      action: () => sound.playClick(),
    });

    scene.add(station0);

    // =========================================================================
    // STATION 1: SILICON FOUNDRY / ESP32 SOC ARCHITECTURE (y: -25, z: 20)
    // =========================================================================
    const station1 = new THREE.Group();
    station1.position.set(0, -25, 20);

    // Heavy Industrial Silicon Foundry Platform
    const plat1Geo = new THREE.CylinderGeometry(6.6, 7.2, 0.5, 48);
    const plat1 = new THREE.Mesh(plat1Geo, darkMetalMat);
    plat1.position.y = -0.25;
    plat1.receiveShadow = true;
    station1.add(plat1);

    const grid1 = new THREE.GridHelper(12, 24, 0xf59e0b, 0x2b2416);
    grid1.position.y = 0.01;
    station1.add(grid1);

    // Gold Conduit Floor Ring
    const floorRingGeo = new THREE.TorusGeometry(5.2, 0.04, 16, 64);
    const floorRingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const floorRing = new THREE.Mesh(floorRingGeo, floorRingMat);
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.y = 0.02;
    station1.add(floorRing);

    // -------------------------------------------------------------------------
    // GIANT HIGH-FIDELITY ESP32 DEVKIT V1 BOARD
    // -------------------------------------------------------------------------
    const espGroup = new THREE.Group();
    espGroup.position.set(0, 0.6, 0);

    // PCB Substrate with Authentic Procedural Silkscreen & Traces
    const pcbTexture = TextureFactory.createPcbTexture();
    const pcbSideMat = new THREE.MeshStandardMaterial({ color: 0x071e11, roughness: 0.6 });
    const pcbTopMat = new THREE.MeshStandardMaterial({ map: pcbTexture, roughness: 0.35, metalness: 0.2 });
    const pcbMaterials = [pcbSideMat, pcbSideMat, pcbTopMat, pcbSideMat, pcbSideMat, pcbSideMat];

    const pcbGeo = new THREE.BoxGeometry(4.0, 0.16, 5.6);
    const pcb = new THREE.Mesh(pcbGeo, pcbMaterials);
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    espGroup.add(pcb);

    // Serpentine Inverted-F PCB Antenna (Top gold traces)
    const antGroup = new THREE.Group();
    antGroup.position.set(0, 0.09, -2.25);
    const antBar1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.02, 0.12), goldMat);
    antGroup.add(antBar1);
    const antBar2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.4), goldMat);
    antBar2.position.set(-1.14, 0, 0.2);
    antGroup.add(antBar2);
    const antBar3 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.4), goldMat);
    antBar3.position.set(0.2, 0, 0.2);
    antGroup.add(antBar3);
    espGroup.add(antGroup);

    // Dual 15-Pin Gold Header Strips along Left & Right Edges
    const pinGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08);
    const headerBlockGeo = new THREE.BoxGeometry(0.28, 0.35, 4.4);
    const headerBlockMat = new THREE.MeshStandardMaterial({ color: 0x14181f, roughness: 0.7 });

    // Left header block
    const leftHeader = new THREE.Mesh(headerBlockGeo, headerBlockMat);
    leftHeader.position.set(-1.8, 0.22, 0.2);
    leftHeader.castShadow = true;
    espGroup.add(leftHeader);

    // Right header block
    const rightHeader = new THREE.Mesh(headerBlockGeo, headerBlockMat);
    rightHeader.position.set(1.8, 0.22, 0.2);
    rightHeader.castShadow = true;
    espGroup.add(rightHeader);

    // 15 individual gold pins on each side
    for (let pIdx = 0; pIdx < 15; pIdx++) {
      const zPos = -1.8 + pIdx * 0.28;
      const pL = new THREE.Mesh(pinGeo, goldMat);
      pL.position.set(-1.8, 0.45, zPos);
      espGroup.add(pL);

      const pR = new THREE.Mesh(pinGeo, goldMat);
      pR.position.set(1.8, 0.45, zPos);
      espGroup.add(pR);
    }

    // USB-C Metal Port at bottom of board
    const usbShellGeo = new THREE.BoxGeometry(0.9, 0.35, 0.75);
    const usbShell = new THREE.Mesh(usbShellGeo, brushedSilverMat);
    usbShell.position.set(0, 0.22, 2.5);
    usbShell.castShadow = true;
    espGroup.add(usbShell);

    const usbCavity = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.1), blackGlossMat);
    usbCavity.position.set(0, 0.22, 2.88);
    espGroup.add(usbCavity);

    // CP2102 USB-to-UART Bridge IC
    const cpGeo = new THREE.BoxGeometry(0.75, 0.12, 0.75);
    const cpMesh = new THREE.Mesh(cpGeo, blackGlossMat);
    cpMesh.position.set(0, 0.14, 1.4);
    cpMesh.castShadow = true;
    espGroup.add(cpMesh);

    // AMS1117 3.3V LDO Voltage Regulator with Metal Cooling Tab
    const ldoBody = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.45), blackGlossMat);
    ldoBody.position.set(-0.9, 0.14, 1.8);
    espGroup.add(ldoBody);

    const ldoTab = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.2), copperMat);
    ldoTab.position.set(-0.9, 0.12, 1.55);
    espGroup.add(ldoTab);

    // Dual Tactile Microswitches (EN and BOOT)
    const btnBaseGeo = new THREE.BoxGeometry(0.4, 0.16, 0.35);
    const btnCapGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16);

    const btnEnBase = new THREE.Mesh(btnBaseGeo, brushedSilverMat);
    btnEnBase.position.set(-1.1, 0.15, 2.3);
    const btnEnCap = new THREE.Mesh(btnCapGeo, blackGlossMat);
    btnEnCap.position.set(-1.1, 0.26, 2.3);
    espGroup.add(btnEnBase);
    espGroup.add(btnEnCap);

    const btnBootBase = new THREE.Mesh(btnBaseGeo, brushedSilverMat);
    btnBootBase.position.set(1.1, 0.15, 2.3);
    const btnBootCap = new THREE.Mesh(btnCapGeo, blackGlossMat);
    btnBootCap.position.set(1.1, 0.26, 2.3);
    espGroup.add(btnBootBase);
    espGroup.add(btnBootCap);

    // Onboard LEDs (Red Power LED & Blue IO2 LED)
    const ledRed = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    ledRed.position.set(0.65, 0.12, 1.8);
    espGroup.add(ledRed);

    const ledBlue = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.16), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
    ledBlue.position.set(0.65, 0.12, 1.5);
    espGroup.add(ledBlue);

    // -------------------------------------------------------------------------
    // LIFTED / EXPLODED ESP-WROOM-32 RF SHIELD & DUAL-CORE DIE
    // -------------------------------------------------------------------------
    // Laser-Etched Metal RF Shield Can
    const rfTexture = TextureFactory.createRfShieldTexture();
    const rfSideMat = brushedSilverMat;
    const rfTopMat = new THREE.MeshStandardMaterial({ map: rfTexture, metalness: 0.95, roughness: 0.18 });
    const rfMaterials = [rfSideMat, rfSideMat, rfTopMat, rfSideMat, rfSideMat, rfSideMat];

    const rfGeo = new THREE.BoxGeometry(2.5, 0.25, 2.7);
    const rfShield = new THREE.Mesh(rfGeo, rfMaterials);
    rfShield.position.set(0, 1.6, -0.4); // Exploded levitation height
    rfShield.castShadow = true;
    rfShield.name = 'ESP-WROOM-32 240MHz Dual-Core SoC';
    espGroup.add(rfShield);
    rfShieldRef.current = rfShield;

    // Dual Silicon Xtensa LX6 CPU Dies underneath the shield
    const coreMat = new THREE.MeshPhysicalMaterial({ color: 0x052e16, metalness: 0.9, roughness: 0.1, clearcoat: 1.0 });
    const core0 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.1, 0.85), coreMat);
    core0.position.set(-0.5, 0.14, -0.4);
    core0.castShadow = true;
    espGroup.add(core0);

    const core1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.1, 0.85), coreMat);
    core1.position.set(0.5, 0.14, -0.4);
    core1.castShadow = true;
    espGroup.add(core1);

    // 40MHz Quartz Crystal Oscillator Can
    const crystalGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.14, 24);
    const crystal = new THREE.Mesh(crystalGeo, brushedSilverMat);
    crystal.position.set(0, 0.15, -1.2);
    espGroup.add(crystal);

    // SPI Flash Memory Chip
    const flashChip = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.5), blackGlossMat);
    flashChip.position.set(0, 0.14, 0.4);
    espGroup.add(flashChip);

    station1.add(espGroup);

    // Concentric Holographic Silicon Data Orbit Rings
    const r1Geo = new THREE.TorusGeometry(3.8, 0.035, 16, 64);
    const r1Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const r1 = new THREE.Mesh(r1Geo, r1Mat);
    r1.rotation.x = Math.PI / 2;
    r1.position.y = 0.8;
    station1.add(r1);

    const r2Geo = new THREE.TorusGeometry(4.4, 0.035, 16, 64);
    const r2Mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const r2 = new THREE.Mesh(r2Geo, r2Mat);
    r2.rotation.x = Math.PI / 2;
    r2.position.y = 0.9;
    station1.add(r2);

    const r3Geo = new THREE.TorusGeometry(5.0, 0.025, 16, 64);
    const r3Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const r3 = new THREE.Mesh(r3Geo, r3Mat);
    r3.rotation.x = Math.PI / 2;
    r3.position.y = 1.0;
    station1.add(r3);
    siliconRings.current = { ring1: r1, ring2: r2, ring3: r3 };

    interactables.current.push({
      mesh: rfShield,
      name: 'ESP32 Dual-Core Architecture',
      action: () => sound.playClick(),
    });

    scene.add(station1);

    // =========================================================================
    // STATION 2: 3D PROJECT SHOWROOM HANGAR (y: -50, z: 40)
    // =========================================================================
    const station2 = new THREE.Group();
    station2.position.set(0, -50, 40);

    const plat2Geo = new THREE.CylinderGeometry(9.2, 9.8, 0.5, 48);
    const plat2 = new THREE.Mesh(plat2Geo, darkMetalMat);
    plat2.position.y = -0.25;
    plat2.receiveShadow = true;
    station2.add(plat2);

    const grid2 = new THREE.GridHelper(18, 36, 0x38bdf8, 0x162432);
    grid2.position.y = 0.01;
    station2.add(grid2);

    // Project Monoliths arranged in panoramic arc
    const projects = PORTFOLIO_DATA.projects;
    const arcRadius = 6.2;
    const totalProj = projects.length;

    projects.forEach((proj, i) => {
      const angle = (i / (totalProj - 1) - 0.5) * Math.PI * 0.78;
      const x = Math.sin(angle) * arcRadius;
      const z = Math.cos(angle) * arcRadius - 2.8;

      const monoGroup = new THREE.Group();
      monoGroup.position.set(x, 1.5, z);
      monoGroup.rotation.y = angle + Math.PI;

      // Heavy Chamfered Pedestal Column
      const pedBaseGeo = new THREE.CylinderGeometry(0.75, 0.9, 1.5, 8);
      const pedBase = new THREE.Mesh(pedBaseGeo, darkMetalMat);
      pedBase.position.y = -0.75;
      pedBase.castShadow = true;
      monoGroup.add(pedBase);

      // Glowing Cyan Conduit Ring around Pedestal
      const pedRingGeo = new THREE.TorusGeometry(0.78, 0.03, 16, 32);
      const pedRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const pedRing = new THREE.Mesh(pedRingGeo, pedRingMat);
      pedRing.rotation.x = Math.PI / 2;
      pedRing.position.y = -0.1;
      monoGroup.add(pedRing);

      // Project Screen Monolith Frame (Double-beveled display case)
      const screenTex = textureLoader.load(proj.images[0]);
      const screenGeo = new THREE.BoxGeometry(2.2, 1.35, 0.14);
      const monoSideMat = darkMetalMat;
      const monoFrontMat = new THREE.MeshStandardMaterial({ map: screenTex, roughness: 0.25 });
      const monoMaterials = [monoSideMat, monoSideMat, monoSideMat, monoSideMat, monoFrontMat, monoSideMat];

      const monolith = new THREE.Mesh(screenGeo, monoMaterials);
      monolith.castShadow = true;
      monolith.name = `PROJECT: ${proj.title}`;
      monoGroup.add(monolith);

      // Front Glass Panel overlay for subtle reflections
      const glassOverlay = new THREE.Mesh(new THREE.PlaneGeometry(2.16, 1.31), glassMat);
      glassOverlay.position.set(0, 0, 0.075);
      monoGroup.add(glassOverlay);

      // 4 Precision Metallic Corner Brackets
      const bracketGeo = new THREE.BoxGeometry(0.14, 0.14, 0.04);
      const bTL = new THREE.Mesh(bracketGeo, brushedSilverMat);
      bTL.position.set(-1.05, 0.62, 0.08);
      monoGroup.add(bTL);

      const bTR = new THREE.Mesh(bracketGeo, brushedSilverMat);
      bTR.position.set(1.05, 0.62, 0.08);
      monoGroup.add(bTR);

      const bBL = new THREE.Mesh(bracketGeo, brushedSilverMat);
      bBL.position.set(-1.05, -0.62, 0.08);
      monoGroup.add(bBL);

      const bBR = new THREE.Mesh(bracketGeo, brushedSilverMat);
      bBR.position.set(1.05, -0.62, 0.08);
      monoGroup.add(bBR);

      // Floating Category Badge
      const isHardware = proj.category.toLowerCase().includes('hardware') || proj.category.toLowerCase().includes('iot');
      const badgeColor = isHardware ? 0xf59e0b : 0x10b981;
      const badgeGeo = new THREE.BoxGeometry(1.4, 0.22, 0.05);
      const badgeMat = new THREE.MeshBasicMaterial({ color: badgeColor });
      const badge = new THREE.Mesh(badgeGeo, badgeMat);
      badge.position.set(0, 0.88, 0);
      monoGroup.add(badge);

      station2.add(monoGroup);
      projectMonoliths.current.push(monoGroup);

      // Add to interactables list for click-to-open modal
      interactables.current.push({
        mesh: monolith,
        name: proj.title,
        action: () => {
          sound.playClick();
          onSelectProject(proj);
        },
      });
    });

    scene.add(station2);

    // =========================================================================
    // STATION 3: IOT ELECTRONICS WORKBENCH (y: -75, z: 60)
    // =========================================================================
    const station3 = new THREE.Group();
    station3.position.set(0, -75, 60);

    const plat3Geo = new THREE.CylinderGeometry(6.6, 7.2, 0.5, 48);
    const plat3 = new THREE.Mesh(plat3Geo, darkMetalMat);
    plat3.position.y = -0.25;
    plat3.receiveShadow = true;
    station3.add(plat3);

    const grid3 = new THREE.GridHelper(13, 26, 0xf59e0b, 0x2b2416);
    grid3.position.y = 0.01;
    station3.add(grid3);

    // -------------------------------------------------------------------------
    // 1. SOLDERLESS 830-POINT BREADBOARD
    // -------------------------------------------------------------------------
    const bbTexture = TextureFactory.createBreadboardTexture();
    const bbSideMat = new THREE.MeshStandardMaterial({ color: 0x13161c, roughness: 0.5 });
    const bbTopMat = new THREE.MeshStandardMaterial({ map: bbTexture, roughness: 0.45 });
    const bbMaterials = [bbSideMat, bbSideMat, bbTopMat, bbSideMat, bbSideMat, bbSideMat];

    const bbGeo = new THREE.BoxGeometry(6.4, 0.3, 3.8);
    const breadboard = new THREE.Mesh(bbGeo, bbMaterials);
    breadboard.position.set(0, 0.15, 0);
    breadboard.castShadow = true;
    breadboard.receiveShadow = true;
    station3.add(breadboard);

    // Mini ESP32 seated across breadboard divider
    const miniEspGeo = new THREE.BoxGeometry(1.6, 0.12, 2.4);
    const miniEspMat = new THREE.MeshStandardMaterial({ color: 0x092614, roughness: 0.4 });
    const miniEsp = new THREE.Mesh(miniEspGeo, miniEspMat);
    miniEsp.position.set(0, 0.36, 0);
    miniEsp.castShadow = true;
    station3.add(miniEsp);

    const miniShield = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 1.2), brushedSilverMat);
    miniShield.position.set(0, 0.46, -0.2);
    station3.add(miniShield);

    // -------------------------------------------------------------------------
    // 2. HC-SR04 ULTRASONIC DISTANCE SENSOR (Right Side)
    // -------------------------------------------------------------------------
    const usGroup = new THREE.Group();
    usGroup.position.set(2.0, 0.4, 0.5);

    // Ultrasonic Breakout PCB
    const usPcbGeo = new THREE.BoxGeometry(1.9, 0.85, 0.1);
    const usPcbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const usPcb = new THREE.Mesh(usPcbGeo, usPcbMat);
    usPcb.position.set(0, 0.42, 0);
    usPcb.castShadow = true;
    usGroup.add(usPcb);

    // Dual Cylindrical Acoustic Horns with Procedural Mesh Grill
    const meshTexture = TextureFactory.createUltrasonicMeshTexture();
    const hornCanMat = brushedSilverMat;
    const hornMeshMat = new THREE.MeshStandardMaterial({ map: meshTexture, roughness: 0.2 });
    const hornMaterials = [hornCanMat, hornMeshMat, hornCanMat];

    const hornGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 32);

    const hornLeft = new THREE.Mesh(hornGeo, hornMaterials);
    hornLeft.rotation.x = Math.PI / 2;
    hornLeft.position.set(-0.52, 0.42, 0.25);
    hornLeft.castShadow = true;
    usGroup.add(hornLeft);

    const hornRight = new THREE.Mesh(hornGeo, hornMaterials);
    hornRight.rotation.x = Math.PI / 2;
    hornRight.position.set(0.52, 0.42, 0.25);
    hornRight.castShadow = true;
    usGroup.add(hornRight);

    station3.add(usGroup);

    // 3D Sonic Wave Pulse Rings
    const ringWaveGeo = new THREE.TorusGeometry(0.42, 0.025, 12, 32);
    const ringWaveMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    for (let rIdx = 0; rIdx < 4; rIdx++) {
      const wRing = new THREE.Mesh(ringWaveGeo, ringWaveMat.clone());
      wRing.position.set(2.0, 0.82, 1.2 + rIdx * 0.8);
      station3.add(wRing);
      ultrasonicRings.current.push(wRing);
    }

    // -------------------------------------------------------------------------
    // 3. HC-SR501 PIR MOTION SENSOR (Left Side)
    // -------------------------------------------------------------------------
    const pirGroup = new THREE.Group();
    pirGroup.position.set(-2.0, 0.3, 0.5);

    // Green Breakout Board
    const pirPcbGeo = new THREE.BoxGeometry(1.6, 0.08, 1.4);
    const pirPcbMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
    const pirPcb = new THREE.Mesh(pirPcbGeo, pirPcbMat);
    pirPcb.position.set(0, 0.04, 0);
    pirGroup.add(pirPcb);

    // Multi-faceted Fresnel Lens Dome
    const pirDomeGeo = new THREE.SphereGeometry(0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const pirDomeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 });
    const pirDome = new THREE.Mesh(pirDomeGeo, pirDomeMat);
    pirDome.position.set(0, 0.08, 0);
    pirDome.castShadow = true;
    pirGroup.add(pirDome);
    pirDomeRef.current = pirDome;

    // Dual orange trimmer potentiometers
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.4 });
    const trim1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.2), trimMat);
    trim1.position.set(-0.4, 0.12, -0.4);
    pirGroup.add(trim1);

    const trim2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.2), trimMat);
    trim2.position.set(0.4, 0.12, -0.4);
    pirGroup.add(trim2);

    // Laser Detection Cone
    const coneGeo = new THREE.ConeGeometry(1.8, 2.8, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0 });
    const pirCone = new THREE.Mesh(coneGeo, coneMat);
    pirCone.position.set(0, 1.45, 0);
    pirGroup.add(pirCone);
    pirConeMatRef.current = coneMat;

    // Red Alarm Light
    const alarmL = new THREE.PointLight(0xef4444, 0, 8);
    alarmL.position.set(0, 1.2, 0);
    pirGroup.add(alarmL);
    alarmLightRef.current = alarmL;

    station3.add(pirGroup);

    // -------------------------------------------------------------------------
    // 4. 0.96" OLED I2C DISPLAY MODULE
    // -------------------------------------------------------------------------
    const oledGroup = new THREE.Group();
    oledGroup.position.set(0, 0.3, -1.2);

    const oledPcbGeo = new THREE.BoxGeometry(1.4, 0.08, 1.2);
    const oledPcbMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 });
    const oledPcb = new THREE.Mesh(oledPcbGeo, oledPcbMat);
    oledGroup.add(oledPcb);

    const oledTex = TextureFactory.createOledScreenTexture();
    const oledScreenGeo = new THREE.PlaneGeometry(1.1, 0.55);
    const oledScreenMat = new THREE.MeshBasicMaterial({ map: oledTex });
    const oledScreen = new THREE.Mesh(oledScreenGeo, oledScreenMat);
    oledScreen.rotation.x = -Math.PI / 2;
    oledScreen.position.set(0, 0.05, 0.05);
    oledGroup.add(oledScreen);

    station3.add(oledGroup);

    // -------------------------------------------------------------------------
    // 5. 3D CURVED DUPONT JUMPER WIRES & DISCRETE COMPONENTS
    // -------------------------------------------------------------------------
    // Wire generator helper
    const createCurvedWire = (p1: THREE.Vector3, p2: THREE.Vector3, height: number, colorHex: number) => {
      const mid = new THREE.Vector3((p1.x + p2.x) / 2, Math.max(p1.y, p2.y) + height, (p1.z + p2.z) / 2);
      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.028, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
      return new THREE.Mesh(tubeGeo, tubeMat);
    };

    // Red VCC Wire from ESP32 to HC-SR04
    station3.add(createCurvedWire(new THREE.Vector3(0.8, 0.4, 0.2), new THREE.Vector3(1.2, 0.4, 0.5), 0.45, 0xef4444));
    // Black GND Wire from ESP32 to HC-SR04
    station3.add(createCurvedWire(new THREE.Vector3(0.8, 0.4, 0.5), new THREE.Vector3(1.2, 0.4, 0.7), 0.35, 0x1e293b));
    // Yellow Signal Wire from ESP32 to PIR
    station3.add(createCurvedWire(new THREE.Vector3(-0.8, 0.4, 0.3), new THREE.Vector3(-1.2, 0.4, 0.5), 0.5, 0xeab308));
    // Blue I2C Wire from ESP32 to OLED
    station3.add(createCurvedWire(new THREE.Vector3(0.4, 0.4, -0.6), new THREE.Vector3(0.2, 0.4, -1.0), 0.4, 0x3b82f6));

    // Color-Banded Carbon Film Resistors spanning tie-points
    const rBodyGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.35, 16);
    const rBodyMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.3 });
    const rMesh1 = new THREE.Mesh(rBodyGeo, rBodyMat);
    rMesh1.rotation.z = Math.PI / 2;
    rMesh1.position.set(-1.0, 0.35, -0.8);
    station3.add(rMesh1);

    const rMesh2 = new THREE.Mesh(rBodyGeo, rBodyMat);
    rMesh2.rotation.z = Math.PI / 2;
    rMesh2.position.set(-1.0, 0.35, -0.5);
    station3.add(rMesh2);

    interactables.current.push({
      mesh: pirDome,
      name: 'PIR Motion Sensor (Click to Trigger)',
      action: () => {
        sound.playClick();
        onTriggerMotion();
      },
    });

    scene.add(station3);

    // =========================================================================
    // STATION 4: SKILL CONSTELLATION GALAXY (y: -100, z: 80)
    // =========================================================================
    const station4 = new THREE.Group();
    station4.position.set(0, -100, 80);

    const plat4Geo = new THREE.CylinderGeometry(7.0, 7.6, 0.5, 48);
    const plat4 = new THREE.Mesh(plat4Geo, darkMetalMat);
    plat4.position.y = -0.25;
    plat4.receiveShadow = true;
    station4.add(plat4);

    const grid4 = new THREE.GridHelper(14, 28, 0x10b981, 0x1f2937);
    grid4.position.y = 0.01;
    station4.add(grid4);

    // Central High-Energy Quantum Node Core
    const coreReactorGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const coreReactorMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.1, metalness: 0.9 });
    const coreReactor = new THREE.Mesh(coreReactorGeo, coreReactorMat);
    coreReactor.position.set(0, 2.2, 0);
    station4.add(coreReactor);

    const coreLight = new THREE.PointLight(0x10b981, 2.5, 8);
    coreLight.position.set(0, 2.2, 0);
    station4.add(coreLight);

    // 8 Dual-Layer Polyhedral Skill Modules
    const skillsList = [
      { name: 'React.js', color: 0x10b981, r: 2.4, y: 2.0, s: 0.7 },
      { name: 'Three.js / WebGL', color: 0x34d399, r: 3.2, y: 2.7, s: -0.6 },
      { name: 'Node.js Engine', color: 0x38bdf8, r: 2.8, y: 1.4, s: 0.9 },
      { name: 'ESP32 Firmware', color: 0xf59e0b, r: 3.6, y: 2.2, s: -0.8 },
      { name: 'TypeScript', color: 0x10b981, r: 4.1, y: 3.1, s: 0.5 },
      { name: 'WebSocket Realtime', color: 0x38bdf8, r: 3.0, y: 3.6, s: -0.7 },
      { name: 'MongoDB / PostgreSQL', color: 0x34d399, r: 4.5, y: 1.7, s: 0.6 },
      { name: 'Embedded C / C++', color: 0xf59e0b, r: 3.9, y: 3.3, s: -0.5 },
    ];

    skillsList.forEach((sk, sIdx) => {
      const skGroup = new THREE.Group();

      // Inner glowing core
      const innerGeo = new THREE.OctahedronGeometry(0.3, 0);
      const innerMat = new THREE.MeshStandardMaterial({ color: sk.color, roughness: 0.15, metalness: 0.85 });
      const innerCore = new THREE.Mesh(innerGeo, innerMat);
      skGroup.add(innerCore);

      // Outer rotating gyroscopic wireframe cage
      const cageGeo = new THREE.IcosahedronGeometry(0.44, 0);
      const cageMat = new THREE.MeshBasicMaterial({ color: sk.color, wireframe: true, transparent: true, opacity: 0.65 });
      const outerCage = new THREE.Mesh(cageGeo, cageMat);
      skGroup.add(outerCage);

      station4.add(skGroup);

      skillNodesRef.current.push({
        group: skGroup,
        core: innerCore,
        cage: outerCage,
        speed: sk.s,
        angle: (sIdx / skillsList.length) * Math.PI * 2,
        r: sk.r,
        y: sk.y,
      });

      interactables.current.push({
        mesh: innerCore,
        name: `SKILL: ${sk.name}`,
        action: () => sound.playSuccess(),
      });
    });

    scene.add(station4);

    // =========================================================================
    // STATION 5: QUANTUM TRANSMISSION RADAR BEACON (y: -125, z: 100)
    // =========================================================================
    const station5 = new THREE.Group();
    station5.position.set(0, -125, 100);

    const plat5Geo = new THREE.CylinderGeometry(6.6, 7.2, 0.5, 48);
    const plat5 = new THREE.Mesh(plat5Geo, darkMetalMat);
    plat5.position.y = -0.25;
    plat5.receiveShadow = true;
    station5.add(plat5);

    const grid5 = new THREE.GridHelper(13, 26, 0x10b981, 0x1f2937);
    grid5.position.y = 0.01;
    station5.add(grid5);

    // Reinforced Industrial Transmitter Bunker
    const bunkerGeo = new THREE.CylinderGeometry(0.65, 0.95, 1.6, 16);
    const bunker = new THREE.Mesh(bunkerGeo, darkMetalMat);
    bunker.position.y = 0.8;
    bunker.castShadow = true;
    station5.add(bunker);

    // High-Precision Parabolic Reflector Dish
    const dishDishGeo = new THREE.SphereGeometry(2.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.3);
    const dishDishMat = new THREE.MeshStandardMaterial({ color: 0x151b24, metalness: 0.92, roughness: 0.18, side: THREE.DoubleSide });
    const dishDish = new THREE.Mesh(dishDishGeo, dishDishMat);
    dishDish.position.set(0, 2.4, 0);
    dishDish.rotation.x = -Math.PI / 4;
    station5.add(dishDish);

    // Rear Lattice Truss Structure behind dish
    const trussRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.04, 8, 32), brushedSilverMat);
    trussRing1.position.set(0, 2.4, -0.2);
    trussRing1.rotation.x = -Math.PI / 4;
    station5.add(trussRing1);

    // Tripod Sub-Reflector Feedhorn Assembly
    const hornAssembly = new THREE.Group();
    hornAssembly.position.set(0, 3.6, 1.2);
    const feedhornGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.45, 16);
    const feedhorn = new THREE.Mesh(feedhornGeo, goldMat);
    feedhorn.rotation.x = Math.PI / 4;
    hornAssembly.add(feedhorn);
    station5.add(hornAssembly);

    // Photovoltaic Solar Array Wings using Procedural Solar Cell Texture
    const solarTex = TextureFactory.createSolarPanelTexture();
    const solarWingMat = new THREE.MeshStandardMaterial({ map: solarTex, roughness: 0.2, metalness: 0.85 });

    const solarGroup = new THREE.Group();
    solarGroup.position.set(0, 2.4, 0);

    const wingGeo = new THREE.BoxGeometry(2.0, 0.06, 0.9);
    const wingLeft = new THREE.Mesh(wingGeo, solarWingMat);
    wingLeft.position.set(-2.8, 0, 0);
    solarGroup.add(wingLeft);

    const wingRight = new THREE.Mesh(wingGeo, solarWingMat);
    wingRight.position.set(2.8, 0, 0);
    solarGroup.add(wingRight);

    station5.add(solarGroup);
    solarWingsRef.current = solarGroup;

    // Dual Aviation Obstruction Strobes
    const strobe1 = new THREE.PointLight(0xef4444, 1.5, 6);
    strobe1.position.set(-2.2, 3.8, 0.5);
    station5.add(strobe1);
    beaconStrobe1Ref.current = strobe1;

    const strobe2 = new THREE.PointLight(0xef4444, 1.5, 6);
    strobe2.position.set(2.2, 3.8, 0.5);
    station5.add(strobe2);
    beaconStrobe2Ref.current = strobe2;

    // Focused Quantum Transmission Particle Energy Beam
    const bGeo = new THREE.ConeGeometry(1.4, 8.0, 24, 1, true);
    const bMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.35 });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.set(0, 5.8, 3.4);
    bMesh.rotation.x = -Math.PI / 4;
    station5.add(bMesh);
    beaconBeamRef.current = bMesh;

    const bLight = new THREE.PointLight(0x10b981, 2.5, 20);
    bLight.position.set(0, 5.0, 2.6);
    station5.add(bLight);
    beaconLightRef.current = bLight;

    interactables.current.push({
      mesh: dishDish,
      name: 'Deep Space Quantum Transmission Dish',
      action: () => sound.playSuccess(),
    });

    scene.add(station5);

    // =========================================================================
    // 3D COSMIC PARTICLE CLOUD (1,500 points along entire spatial spine)
    // =========================================================================
    const pCount = 1500;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);

    const colEmerald = new THREE.Color(0x10b981);
    const colAmber = new THREE.Color(0xf59e0b);
    const colSlate = new THREE.Color(0x38bdf8);

    for (let pIdx = 0; pIdx < pCount; pIdx++) {
      pPositions[pIdx * 3] = (Math.random() - 0.5) * 55;
      pPositions[pIdx * 3 + 1] = Math.random() * -145 + 10;
      pPositions[pIdx * 3 + 2] = Math.random() * 125 - 10;

      const rnd = Math.random();
      const c = rnd < 0.45 ? colEmerald : rnd < 0.75 ? colAmber : colSlate;
      pColors[pIdx * 3] = c.r;
      pColors[pIdx * 3 + 1] = c.g;
      pColors[pIdx * 3 + 2] = c.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pPointsMat = new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.75 });
    const cosmicStars = new THREE.Points(pGeo, pPointsMat);
    scene.add(cosmicStars);

    // =========================================================================
    // MOUSE PARALLAX & RAYCASTING
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    const mouseParallax = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.x = x;
      mouse.y = y;
      mouseParallax.x = x * 1.2;
      mouseParallax.y = y * 0.8;
    };

    const handleClick = () => {
      if (!cameraRef.current) return;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const meshes = interactables.current.map((i) => i.mesh);
      const hits = raycaster.intersectObjects(meshes, true);

      if (hits.length > 0) {
        const topHit = hits[0].object;
        const entry = interactables.current.find(
          (item) => item.mesh === topHit || item.mesh.children.includes(topHit)
        );
        if (entry) {
          entry.action();
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // Resize Observer
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nw, height: nh } = entry.contentRect;
        if (nw > 0 && nh > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = nw / nh;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(nw, nh);
        }
      }
    });
    ro.observe(container);

    // =========================================================================
    // ANIMATION LOOP (60+ FPS ZERO-LATENCY PIPELINE)
    // =========================================================================
    let lastTime = performance.now();

    const animate = (timeMs: number) => {
      frameIdRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const time = timeMs / 1000;

      // Update procedural live terminal texture
      updateTerminalCanvas(time);

      // Station Camera Lerping
      const stIdx = Math.max(0, Math.min(5, currentStationRef.current));
      const targetWp = stationWaypoints[stIdx];

      targetCamPos.current.copy(targetWp.pos);
      targetCamLook.current.copy(targetWp.look);

      // Mouse Parallax (subtle ergonomic depth)
      if (!freeRoamRef.current) {
        targetCamPos.current.x += mouseParallax.x;
        targetCamPos.current.y += mouseParallax.y;
      }

      currentCamPos.current.lerp(targetCamPos.current, 0.05);
      currentCamLook.current.lerp(targetCamLook.current, 0.05);

      if (cameraRef.current) {
        cameraRef.current.position.copy(currentCamPos.current);
        cameraRef.current.lookAt(currentCamLook.current);
      }

      // Station 1: Rotate silicon rings & gently levitate RF shield
      if (siliconRings.current) {
        siliconRings.current.ring1.rotation.z = time * 0.4;
        siliconRings.current.ring2.rotation.z = -time * 0.6;
        siliconRings.current.ring3.rotation.z = time * 0.25;
      }
      if (rfShieldRef.current) {
        rfShieldRef.current.position.y = 1.6 + Math.sin(time * 2.5) * 0.08;
      }

      // Station 2: Gently bob project monoliths
      projectMonoliths.current.forEach((m, idx) => {
        m.position.y = 1.5 + Math.sin(time * 2 + idx * 0.8) * 0.1;
      });

      // Station 3: Animate Ultrasonic Pulse Rings
      const dist = distanceCmRef.current;
      ultrasonicRings.current.forEach((ring, rIdx) => {
        const prog = ((time * 2.2 + rIdx * 0.6) % 3) / 3;
        ring.position.z = 1.2 + prog * (dist / 40);
        ring.scale.setScalar(1 + prog * 2.5);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - prog);
      });

      // Station 3: Animate PIR Motion Alarm
      if (alarmLightRef.current && pirConeMatRef.current && pirDomeRef.current) {
        if (motionTriggeredRef.current) {
          alarmLightRef.current.intensity = Math.sin(time * 12) > 0 ? 3.5 : 0.4;
          pirConeMatRef.current.opacity = Math.sin(time * 8) * 0.3 + 0.45;
          (pirDomeRef.current.material as THREE.MeshStandardMaterial).color.setHex(0xff3333);
        } else {
          alarmLightRef.current.intensity = 0;
          pirConeMatRef.current.opacity = 0;
          (pirDomeRef.current.material as THREE.MeshStandardMaterial).color.setHex(0xf1f5f9);
        }
      }

      // Station 4: Orbiting Skill Nodes (Dual-layer counter-rotation)
      skillNodesRef.current.forEach((sk) => {
        sk.angle += sk.speed * delta * 0.8;
        sk.group.position.x = Math.cos(sk.angle) * sk.r;
        sk.group.position.z = Math.sin(sk.angle) * sk.r;
        sk.group.position.y = sk.y + Math.sin(time * 2 + sk.angle) * 0.25;

        sk.core.rotation.x += delta * 1.5;
        sk.core.rotation.y += delta * 1.8;
        sk.cage.rotation.x -= delta * 1.2;
        sk.cage.rotation.y -= delta * 1.4;
      });

      // Station 5: Animate Quantum Transmission Beam & Strobes
      if (beaconBeamRef.current && beaconLightRef.current) {
        if (isTransmittingRef.current) {
          (beaconBeamRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(time * 18) * 0.4 + 0.6;
          beaconLightRef.current.intensity = 4.5;
        } else {
          (beaconBeamRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(time * 3) * 0.15 + 0.3;
          beaconLightRef.current.intensity = 2.0;
        }
      }

      // Red aviation strobes flashing alternately
      if (beaconStrobe1Ref.current && beaconStrobe2Ref.current) {
        beaconStrobe1Ref.current.intensity = Math.sin(time * 4) > 0.8 ? 3.0 : 0.2;
        beaconStrobe2Ref.current.intensity = Math.sin(time * 4 + Math.PI) > 0.8 ? 3.0 : 0.2;
      }

      // Rotate cosmic star cloud
      cosmicStars.rotation.y = time * 0.015;

      // Raycasting Hover Detection
      if (cameraRef.current) {
        raycaster.setFromCamera(mouse, cameraRef.current);
        const meshes = interactables.current.map((i) => i.mesh);
        const hits = raycaster.intersectObjects(meshes, true);

        if (hits.length > 0) {
          container.style.cursor = 'pointer';
          const top = hits[0].object;
          const entry = interactables.current.find((item) => item.mesh === top || item.mesh.children.includes(top));
          hoveredName.current = entry?.name || '3D Module';
        } else {
          container.style.cursor = 'default';
          hoveredName.current = null;
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    frameIdRef.current = requestAnimationFrame(animate);

    // CLEANUP
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      ro.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      terminalTextureRef.current?.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectProject, onTriggerMotion, updateTerminalCanvas]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-auto -z-0">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};