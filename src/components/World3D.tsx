import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sound } from '../utils/sound';
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

  // Station camera waypoints
  const stationWaypoints = [
    { pos: new THREE.Vector3(0, 3.5, 8.5), look: new THREE.Vector3(0, 0, 0) },              // 0: Nexus Hero
    { pos: new THREE.Vector3(0, -21.5, 27.5), look: new THREE.Vector3(0, -25, 20) },         // 1: Silicon Foundry / About
    { pos: new THREE.Vector3(0, -45.0, 48.0), look: new THREE.Vector3(0, -50, 40) },         // 2: Project Showroom Hangar
    { pos: new THREE.Vector3(0, -70.5, 68.5), look: new THREE.Vector3(0, -75, 60) },         // 3: IoT Hardware Bench
    { pos: new THREE.Vector3(0, -94.0, 89.0), look: new THREE.Vector3(0, -100, 80) },        // 4: Skill Galaxy
    { pos: new THREE.Vector3(0, -120.0, 108.0), look: new THREE.Vector3(0, -125, 100) },     // 5: Transmission Beacon
  ];

  const currentCamPos = useRef(new THREE.Vector3(0, 3.5, 8.5));
  const currentCamLook = useRef(new THREE.Vector3(0, 0, 0));
  const targetCamPos = useRef(new THREE.Vector3(0, 3.5, 8.5));
  const targetCamLook = useRef(new THREE.Vector3(0, 0, 0));

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
  const rfShieldRef = useRef<THREE.Mesh | null>(null);
  const siliconRings = useRef<{ ring1: THREE.Mesh; ring2: THREE.Mesh } | null>(null);
  const projectMonoliths = useRef<THREE.Group[]>([]);
  const skillNodesRef = useRef<Array<{ mesh: THREE.Mesh; speed: number; angle: number; r: number; y: number }>>([]);

  // Terminal screen procedural texture
  const updateTerminalCanvas = useCallback((time: number) => {
    if (!terminalCanvasRef.current || !terminalTextureRef.current) return;
    const ctx = terminalCanvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#050807';
    ctx.fillRect(0, 0, 512, 320);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#10b981';
    ctx.font = '14px "Fira Code", monospace';

    ctx.fillText('PRASAD GAIKWAD // 3D WORLD ENGINE v5.0', 16, 28);
    ctx.fillStyle = '#a3a3a3';
    ctx.fillText(`STATUS: ONLINE | DUAL-CORE 240MHz | T: ${time.toFixed(1)}s`, 16, 52);

    // Dynamic waveform
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < 480; x += 4) {
      const y = 140 + Math.sin(x * 0.05 + time * 4) * 25 + Math.cos(x * 0.1 - time * 2) * 10;
      if (x === 0) ctx.moveTo(16 + x, y);
      else ctx.lineTo(16 + x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.fillText('> ESP32 SENSORS: RADAR[ACTIVE] PIR[READY]', 16, 210);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('> 3D COORDINATES: 6 SPATIAL STATIONS SYNCD', 16, 235);
    ctx.fillStyle = '#10b981';
    ctx.fillText('> SCROLL OR CLICK NAV TO WARP STATION_', 16, 260);

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
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
    scene.fog = new THREE.FogExp2(0x060709, 0.012);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 300);
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

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xe2e8f0, 1.8);
    mainSun.position.set(15, 30, 25);
    mainSun.castShadow = true;
    scene.add(mainSun);

    // =========================================================================
    // STATION 0: NEXUS DEVELOPER RIG (y: 0, z: 0)
    // =========================================================================
    const station0 = new THREE.Group();
    station0.position.set(0, 0, 0);

    // Cyber platform
    const plat0Geo = new THREE.CylinderGeometry(5.4, 5.8, 0.35, 48);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.3, metalness: 0.8 });
    const plat0 = new THREE.Mesh(plat0Geo, metalMat);
    plat0.position.y = -0.18;
    station0.add(plat0);

    const grid0 = new THREE.GridHelper(10, 24, 0x10b981, 0x1f2937);
    grid0.position.y = 0.01;
    station0.add(grid0);

    // Holographic Terminal
    const termStandGeo = new THREE.CylinderGeometry(0.15, 0.3, 1.2, 16);
    const termStand = new THREE.Mesh(termStandGeo, metalMat);
    termStand.position.set(-1.0, 0.6, -0.6);
    station0.add(termStand);

    const termFrameGeo = new THREE.BoxGeometry(2.5, 1.6, 0.12);
    const termFrame = new THREE.Mesh(termFrameGeo, metalMat);
    termFrame.position.set(-1.0, 1.6, -0.6);
    termFrame.rotation.y = 0.18;
    station0.add(termFrame);

    const termCanvas = document.createElement('canvas');
    termCanvas.width = 512;
    termCanvas.height = 320;
    terminalCanvasRef.current = termCanvas;
    const termTexture = new THREE.CanvasTexture(termCanvas);
    terminalTextureRef.current = termTexture;

    const termScreenGeo = new THREE.PlaneGeometry(2.36, 1.46);
    const termScreenMat = new THREE.MeshBasicMaterial({ map: termTexture });
    const termScreen = new THREE.Mesh(termScreenGeo, termScreenMat);
    termScreen.position.set(-1.0, 1.6, -0.53);
    termScreen.rotation.y = 0.18;
    station0.add(termScreen);

    // 3D Avatar Portrait Frame
    const portraitTex = textureLoader.load(PORTFOLIO_DATA.profile.avatar);
    const portraitGeo = new THREE.PlaneGeometry(1.6, 2.0);
    const portraitMat = new THREE.MeshStandardMaterial({ map: portraitTex, roughness: 0.2 });
    const portraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
    portraitMesh.position.set(1.4, 1.6, -0.4);
    portraitMesh.rotation.y = -0.22;
    station0.add(portraitMesh);

    const portraitFrameGeo = new THREE.BoxGeometry(1.7, 2.1, 0.08);
    const portraitFrame = new THREE.Mesh(portraitFrameGeo, metalMat);
    portraitFrame.position.set(1.4, 1.6, -0.45);
    portraitFrame.rotation.y = -0.22;
    station0.add(portraitFrame);

    scene.add(station0);

    // =========================================================================
    // STATION 1: SILICON FOUNDRY / ABOUT (y: -25, z: 20)
    // =========================================================================
    const station1 = new THREE.Group();
    station1.position.set(0, -25, 20);

    const plat1Geo = new THREE.CylinderGeometry(6.0, 6.4, 0.4, 48);
    const plat1 = new THREE.Mesh(plat1Geo, metalMat);
    plat1.position.y = -0.2;
    station1.add(plat1);

    const grid1 = new THREE.GridHelper(11, 24, 0xf59e0b, 0x2b2416);
    grid1.position.y = 0.01;
    station1.add(grid1);

    // Giant 3D ESP32 SoC
    const pcb1Geo = new THREE.BoxGeometry(3.2, 0.15, 4.4);
    const pcb1Mat = new THREE.MeshStandardMaterial({ color: 0x092614, roughness: 0.4 });
    const pcb1 = new THREE.Mesh(pcb1Geo, pcb1Mat);
    pcb1.position.set(0, 0.2, 0);
    station1.add(pcb1);

    // Copper Antenna
    const ant1Geo = new THREE.BoxGeometry(1.8, 0.04, 0.5);
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const ant1 = new THREE.Mesh(ant1Geo, copperMat);
    ant1.position.set(0, 0.28, -1.8);
    station1.add(ant1);

    // Lifted / Exploded RF Shield
    const rf1Geo = new THREE.BoxGeometry(2.0, 0.2, 2.2);
    const rf1Mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.15 });
    const rf1 = new THREE.Mesh(rf1Geo, rf1Mat);
    rf1.position.set(0, 1.1, -0.3); // Lifted
    rf1.name = 'ESP32 Dual-Core Architecture';
    station1.add(rf1);
    rfShieldRef.current = rf1;

    // Dual Silicon Cores underneath
    const core0Geo = new THREE.BoxGeometry(0.7, 0.08, 0.8);
    const core0Mat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.1, metalness: 0.9 });
    const core0 = new THREE.Mesh(core0Geo, core0Mat);
    core0.position.set(-0.45, 0.3, -0.3);
    station1.add(core0);

    const core1Geo = new THREE.BoxGeometry(0.7, 0.08, 0.8);
    const core1Mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9 });
    const core1 = new THREE.Mesh(core1Geo, core1Mat);
    core1.position.set(0.45, 0.3, -0.3);
    station1.add(core1);

    // Concentric Data Rings
    const r1Geo = new THREE.TorusGeometry(3.6, 0.03, 16, 64);
    const r1Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const r1 = new THREE.Mesh(r1Geo, r1Mat);
    r1.rotation.x = Math.PI / 2;
    r1.position.y = 0.5;
    station1.add(r1);

    const r2Geo = new THREE.TorusGeometry(4.2, 0.03, 16, 64);
    const r2Mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const r2 = new THREE.Mesh(r2Geo, r2Mat);
    r2.rotation.x = Math.PI / 2;
    r2.position.y = 0.6;
    station1.add(r2);
    siliconRings.current = { ring1: r1, ring2: r2 };

    scene.add(station1);

    // =========================================================================
    // STATION 2: 3D PROJECT SHOWROOM ARC (y: -50, z: 40)
    // =========================================================================
    const station2 = new THREE.Group();
    station2.position.set(0, -50, 40);

    const plat2Geo = new THREE.CylinderGeometry(8.5, 9.0, 0.4, 48);
    const plat2 = new THREE.Mesh(plat2Geo, metalMat);
    plat2.position.y = -0.2;
    station2.add(plat2);

    const grid2 = new THREE.GridHelper(16, 32, 0x38bdf8, 0x162432);
    grid2.position.y = 0.01;
    station2.add(grid2);

    // 6 Project Monoliths arranged in a 3D semi-circle arc
    const projects = PORTFOLIO_DATA.projects;
    const arcRadius = 5.6;
    const totalProj = projects.length;

    projects.forEach((proj, i) => {
      const angle = (i / (totalProj - 1) - 0.5) * Math.PI * 0.75;
      const x = Math.sin(angle) * arcRadius;
      const z = Math.cos(angle) * arcRadius - 2.5;

      const monoGroup = new THREE.Group();
      monoGroup.position.set(x, 1.4, z);
      monoGroup.rotation.y = angle + Math.PI;

      // Glass Pedestal Column
      const colGeo = new THREE.CylinderGeometry(0.7, 0.8, 1.4, 24);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x141a24, roughness: 0.2, metalness: 0.8 });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.y = -0.7;
      monoGroup.add(col);

      // Project Screen Monolith
      const screenTex = textureLoader.load(proj.images[0]);
      const screenGeo = new THREE.BoxGeometry(2.0, 1.25, 0.1);
      const monoMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: screenTex,
        roughness: 0.3,
      });
      const monolith = new THREE.Mesh(screenGeo, monoMat);
      monolith.castShadow = true;
      monolith.name = `PROJECT: ${proj.title}`;
      monoGroup.add(monolith);

      // Floating Category Badge
      const badgeGeo = new THREE.BoxGeometry(1.2, 0.18, 0.04);
      const badgeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const badge = new THREE.Mesh(badgeGeo, badgeMat);
      badge.position.set(0, 0.8, 0);
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

    const plat3Geo = new THREE.CylinderGeometry(6.2, 6.6, 0.4, 48);
    const plat3 = new THREE.Mesh(plat3Geo, metalMat);
    plat3.position.y = -0.2;
    station3.add(plat3);

    const grid3 = new THREE.GridHelper(12, 24, 0xf59e0b, 0x2b2416);
    grid3.position.y = 0.01;
    station3.add(grid3);

    // 3D Breadboard
    const bbGeo = new THREE.BoxGeometry(6.2, 0.25, 3.6);
    const bbMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.6 });
    const bb = new THREE.Mesh(bbGeo, bbMat);
    bb.position.y = 0.15;
    station3.add(bb);

    // ESP32 Center
    const bbEspGeo = new THREE.BoxGeometry(1.4, 0.1, 2.0);
    const bbEspMat = new THREE.MeshStandardMaterial({ color: 0x0a2416 });
    const bbEsp = new THREE.Mesh(bbEspGeo, bbEspMat);
    bbEsp.position.set(0, 0.32, 0);
    station3.add(bbEsp);

    // Ultrasonic Radar with Cylindrical Transducers (Right)
    const usPcbGeo = new THREE.BoxGeometry(1.8, 0.7, 0.08);
    const usPcbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const usPcb = new THREE.Mesh(usPcbGeo, usPcbMat);
    usPcb.position.set(1.9, 0.6, 0.3);
    station3.add(usPcb);

    const eyeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 24);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.2 });

    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.rotation.x = Math.PI / 2;
    eyeL.position.set(1.45, 0.6, 0.5);
    station3.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.rotation.x = Math.PI / 2;
    eyeR.position.set(2.35, 0.6, 0.5);
    station3.add(eyeR);

    // 3D Sonic wave pulse rings
    const ringWaveGeo = new THREE.TorusGeometry(0.35, 0.02, 12, 32);
    const ringWaveMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    for (let rIdx = 0; rIdx < 4; rIdx++) {
      const wRing = new THREE.Mesh(ringWaveGeo, ringWaveMat.clone());
      wRing.position.set(1.9, 0.6, 0.9 + rIdx * 0.7);
      station3.add(wRing);
      ultrasonicRings.current.push(wRing);
    }

    // PIR Motion Sensor Dome (Left)
    const pirDomeGeo = new THREE.SphereGeometry(0.45, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const pirDomeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
    const pirDome = new THREE.Mesh(pirDomeGeo, pirDomeMat);
    pirDome.position.set(-1.9, 0.35, 0.3);
    station3.add(pirDome);
    pirDomeRef.current = pirDome;

    // Laser Detection Cone
    const coneGeo = new THREE.ConeGeometry(1.6, 2.6, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0 });
    const pirCone = new THREE.Mesh(coneGeo, coneMat);
    pirCone.position.set(-1.9, 1.6, 0.3);
    station3.add(pirCone);
    pirConeMatRef.current = coneMat;

    // Alarm Light
    const alarmL = new THREE.PointLight(0xef4444, 0, 8);
    alarmL.position.set(-1.9, 1.2, 0.3);
    station3.add(alarmL);
    alarmLightRef.current = alarmL;

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

    const plat4Geo = new THREE.CylinderGeometry(6.5, 7.0, 0.4, 48);
    const plat4 = new THREE.Mesh(plat4Geo, metalMat);
    plat4.position.y = -0.2;
    station4.add(plat4);

    const grid4 = new THREE.GridHelper(13, 26, 0x10b981, 0x1f2937);
    grid4.position.y = 0.01;
    station4.add(grid4);

    // 20+ Skill Orbiting Polyhedra
    const skillsList = [
      { name: 'React.js', color: 0x10b981, r: 2.2, y: 1.8, s: 0.7 },
      { name: 'Three.js', color: 0x10b981, r: 3.0, y: 2.4, s: -0.6 },
      { name: 'Node.js', color: 0x38bdf8, r: 2.6, y: 1.2, s: 0.9 },
      { name: 'ESP32 MCU', color: 0xf59e0b, r: 3.4, y: 2.0, s: -0.8 },
      { name: 'TypeScript', color: 0x10b981, r: 3.8, y: 2.8, s: 0.5 },
      { name: 'Socket.io', color: 0x38bdf8, r: 2.8, y: 3.2, s: -0.7 },
      { name: 'MongoDB', color: 0x34d399, r: 4.2, y: 1.5, s: 0.6 },
      { name: 'C++ Firmware', color: 0xf59e0b, r: 3.6, y: 3.0, s: -0.5 },
    ];

    skillsList.forEach((sk, sIdx) => {
      const skGeo = new THREE.DodecahedronGeometry(0.32, 0);
      const skMat = new THREE.MeshStandardMaterial({ color: sk.color, roughness: 0.2, metalness: 0.8 });
      const skMesh = new THREE.Mesh(skGeo, skMat);
      station4.add(skMesh);

      skillNodesRef.current.push({
        mesh: skMesh,
        speed: sk.s,
        angle: (sIdx / skillsList.length) * Math.PI * 2,
        r: sk.r,
        y: sk.y,
      });

      interactables.current.push({
        mesh: skMesh,
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

    const plat5Geo = new THREE.CylinderGeometry(6.0, 6.5, 0.4, 48);
    const plat5 = new THREE.Mesh(plat5Geo, metalMat);
    plat5.position.y = -0.2;
    station5.add(plat5);

    const grid5 = new THREE.GridHelper(12, 24, 0x10b981, 0x1f2937);
    grid5.position.y = 0.01;
    station5.add(grid5);

    // Radar Base & Dish
    const dishBaseGeo = new THREE.CylinderGeometry(0.4, 0.8, 1.4, 16);
    const dishBase = new THREE.Mesh(dishBaseGeo, metalMat);
    dishBase.position.y = 0.7;
    station5.add(dishBase);

    const dishDishGeo = new THREE.SphereGeometry(1.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.4);
    const dishDishMat = new THREE.MeshStandardMaterial({ color: 0x131922, metalness: 0.9, roughness: 0.2, side: THREE.DoubleSide });
    const dishDish = new THREE.Mesh(dishDishGeo, dishDishMat);
    dishDish.position.set(0, 2.0, 0);
    dishDish.rotation.x = -Math.PI / 4;
    station5.add(dishDish);

    // Energy Beam
    const bGeo = new THREE.ConeGeometry(1.2, 6.0, 24, 1, true);
    const bMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.35 });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.set(0, 4.6, 2.6);
    bMesh.rotation.x = -Math.PI / 4;
    station5.add(bMesh);
    beaconBeamRef.current = bMesh;

    const bLight = new THREE.PointLight(0x10b981, 2.0, 15);
    bLight.position.set(0, 4.0, 2.0);
    station5.add(bLight);
    beaconLightRef.current = bLight;

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
      pPositions[pIdx * 3] = (Math.random() - 0.5) * 50;
      pPositions[pIdx * 3 + 1] = Math.random() * -140 + 10;
      pPositions[pIdx * 3 + 2] = Math.random() * 120 - 10;

      const rnd = Math.random();
      const c = rnd < 0.45 ? colEmerald : rnd < 0.75 ? colAmber : colSlate;
      pColors[pIdx * 3] = c.r;
      pColors[pIdx * 3 + 1] = c.g;
      pColors[pIdx * 3 + 2] = c.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pPointsMat = new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.7 });
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
    // ANIMATION LOOP
    // =========================================================================
    let lastTime = performance.now();

    const animate = (timeMs: number) => {
      frameIdRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const time = timeMs / 1000;

      // Update procedural terminal texture
      updateTerminalCanvas(time);

      // Station Camera Lerping
      const stIdx = Math.max(0, Math.min(5, currentStationRef.current));
      const targetWp = stationWaypoints[stIdx];

      targetCamPos.current.copy(targetWp.pos);
      targetCamLook.current.copy(targetWp.look);

      // Add gentle mouse parallax when not free roaming
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

      // Rotate silicon rings in Station 1
      if (siliconRings.current) {
        siliconRings.current.ring1.rotation.z = time * 0.4;
        siliconRings.current.ring2.rotation.z = -time * 0.6;
      }

      // Tilt project monoliths gently in Station 2
      projectMonoliths.current.forEach((m, idx) => {
        m.position.y = 1.4 + Math.sin(time * 2 + idx * 0.8) * 0.12;
      });

      // Animate Ultrasonic Pulse Rings in Station 3
      const dist = distanceCmRef.current;
      ultrasonicRings.current.forEach((ring, rIdx) => {
        const prog = ((time * 2.2 + rIdx * 0.6) % 3) / 3;
        ring.position.z = 0.9 + prog * (dist / 50);
        ring.scale.setScalar(1 + prog * 2.4);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - prog);
      });

      // Animate PIR Motion Alarm in Station 3
      if (alarmLightRef.current && pirConeMatRef.current && pirDomeRef.current) {
        if (motionTriggeredRef.current) {
          alarmLightRef.current.intensity = Math.sin(time * 10) > 0 ? 3.5 : 0.4;
          pirConeMatRef.current.opacity = Math.sin(time * 8) * 0.3 + 0.4;
          (pirDomeRef.current.material as THREE.MeshStandardMaterial).color.setHex(0xff3333);
        } else {
          alarmLightRef.current.intensity = 0;
          pirConeMatRef.current.opacity = 0;
          (pirDomeRef.current.material as THREE.MeshStandardMaterial).color.setHex(0xf1f5f9);
        }
      }

      // Animate Orbiting Skill Nodes in Station 4
      skillNodesRef.current.forEach((sk) => {
        sk.angle += sk.speed * delta * 0.8;
        sk.mesh.position.x = Math.cos(sk.angle) * sk.r;
        sk.mesh.position.z = Math.sin(sk.angle) * sk.r;
        sk.mesh.position.y = sk.y + Math.sin(time * 2 + sk.angle) * 0.25;
        sk.mesh.rotation.x += delta * 1.2;
        sk.mesh.rotation.y += delta * 1.5;
      });

      // Animate Beacon Beam in Station 5
      if (beaconBeamRef.current && beaconLightRef.current) {
        if (isTransmittingRef.current) {
          (beaconBeamRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(time * 16) * 0.4 + 0.6;
          beaconLightRef.current.intensity = 4.0;
        } else {
          (beaconBeamRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(time * 3) * 0.15 + 0.3;
          beaconLightRef.current.intensity = 2.0;
        }
      }

      // Slowly rotate cosmic particle field
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
