import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sound } from '../utils/sound';
import { Eye, RotateCcw, Cpu, Terminal, Compass, Zap, ShieldCheck } from 'lucide-react';

interface ThreeSceneProps {
  onSelectNode?: (nodeName: string) => void;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ onSelectNode }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeView, setActiveView] = useState<'orbit' | 'esp32' | 'console' | 'skills'>('orbit');
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);

  // References for mutable animation state
  const activeViewRef = useRef<'orbit' | 'esp32' | 'console' | 'skills'>('orbit');
  const autoRotateRef = useRef<boolean>(true);
  const isInteractingRef = useRef<boolean>(false);
  const onSelectNodeRef = useRef(onSelectNode);

  useEffect(() => {
    activeViewRef.current = activeView;
  }, [activeView]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetCameraPos = useRef(new THREE.Vector3(0, 4, 9));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const interactableObjects = useRef<THREE.Object3D[]>([]);
  const screenTextureCanvas = useRef<HTMLCanvasElement | null>(null);
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const frameIdRef = useRef<number>(0);
  const rxLedRef = useRef<THREE.PointLight | null>(null);

  // Setup Procedural Screen Canvas Texture
  const updateScreenTexture = useCallback((time: number) => {
    if (!screenTextureCanvas.current || !screenTextureRef.current) return;
    const ctx = screenTextureCanvas.current.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#060a08';
    ctx.fillRect(0, 0, 512, 320);

    // Matrix / Terminal lines
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#10b981';
    ctx.font = '14px "Fira Code", monospace';

    ctx.fillText('PRASAD GAIKWAD // CORE OS v4.2.0', 16, 28);
    ctx.fillStyle = '#a3a3a3';
    ctx.fillText(`STATUS: ONLINE  |  FREQ: 240MHz  |  T: ${time.toFixed(1)}s`, 16, 52);

    // Draw Oscilloscope waveform
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < 480; x += 4) {
      const y = 140 + Math.sin(x * 0.05 + time * 4) * 25 + Math.cos(x * 0.1 - time * 2) * 10;
      if (x === 0) ctx.moveTo(16 + x, y);
      else ctx.lineTo(16 + x, y);
    }
    ctx.stroke();

    // Data logs
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('> ESP32 TELEMETRY: PIR[OK] RADAR[READY]', 16, 210);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('> WEBSOCKET: CONNECTED  PORT: 8080', 16, 235);
    ctx.fillStyle = '#10b981';
    ctx.fillText('> ALL CORES FUNCTIONAL. AWAITING COMMAND_', 16, 260);

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let y = 0; y < 320; y += 4) {
      ctx.fillRect(0, y, 512, 1);
    }

    screenTextureRef.current.needsUpdate = true;
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x08090b);
    scene.fog = new THREE.FogExp2(0x08090b, 0.035);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 9);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xe2e8f0, 1.8);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    // Terminal Emerald backlight
    const greenGlow = new THREE.PointLight(0x10b981, 2.5, 15);
    greenGlow.position.set(-2, 2.5, -1);
    scene.add(greenGlow);

    // Hardware Amber backlight
    const amberGlow = new THREE.PointLight(0xf59e0b, 2.0, 12);
    amberGlow.position.set(3, 1.5, -2);
    scene.add(amberGlow);

    // RX/TX Blinking light for ESP32
    const rxLed = new THREE.PointLight(0x10b981, 1.2, 3);
    rxLed.position.set(0.6, 0.7, 0.8);
    scene.add(rxLed);
    rxLedRef.current = rxLed;

    // ----------------------------------------------------
    // PROCEDURAL 3D ASSETS
    // ----------------------------------------------------

    // 1. BASE CYBER PLATFORM
    const platformGeo = new THREE.CylinderGeometry(5.2, 5.6, 0.35, 48);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.3,
      metalness: 0.8,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.18;
    platform.receiveShadow = true;
    scene.add(platform);

    // Platform ring border (Matrix emerald line)
    const ringGeo = new THREE.TorusGeometry(5.22, 0.03, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    // Hexagonal circuit grid on platform
    const gridHelper = new THREE.GridHelper(10, 24, 0x10b981, 0x1f2937);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // 2. CENTRAL TERMINAL / HOLOGRAPHIC CONSOLE
    const consoleGroup = new THREE.Group();
    consoleGroup.name = 'Console Terminal';

    // Stand
    const standGeo = new THREE.CylinderGeometry(0.15, 0.3, 1.2, 16);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, metalness: 0.9, roughness: 0.2 });
    const stand = new THREE.Mesh(standGeo, metalMat);
    stand.position.set(-0.8, 0.6, -0.6);
    stand.castShadow = true;
    consoleGroup.add(stand);

    // Monitor frame
    const frameGeo = new THREE.BoxGeometry(2.4, 1.5, 0.12);
    const frame = new THREE.Mesh(frameGeo, metalMat);
    frame.position.set(-0.8, 1.6, -0.6);
    frame.rotation.y = 0.18;
    frame.castShadow = true;
    consoleGroup.add(frame);

    // Monitor display screen with canvas texture
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 320;
    screenTextureCanvas.current = screenCanvas;

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTextureRef.current = screenTexture;
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
    const screenGeo = new THREE.PlaneGeometry(2.26, 1.36);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-0.8, 1.6, -0.53);
    screen.rotation.y = 0.18;
    screen.name = 'Interactive Terminal Display';
    consoleGroup.add(screen);

    scene.add(consoleGroup);
    interactableObjects.current.push(screen);

    // 3. DETAILED 3D ESP32 MICROCONTROLLER UNIT
    const esp32Group = new THREE.Group();
    esp32Group.name = 'ESP32 Microcontroller Node';
    esp32Group.position.set(1.4, 0.25, 0.5);
    esp32Group.rotation.y = -0.3;

    // PCB Board (Dark matte green / obsidian)
    const pcbGeo = new THREE.BoxGeometry(1.6, 0.08, 2.2);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x092614,
      roughness: 0.4,
      metalness: 0.3,
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    esp32Group.add(pcb);

    // Metal RF Shield (ESP-WROOM-32)
    const shieldGeo = new THREE.BoxGeometry(1.0, 0.12, 1.1);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.95,
      roughness: 0.15,
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 0.08, -0.25);
    shield.castShadow = true;
    esp32Group.add(shield);

    // Wi-Fi Copper Antenna trace
    const antennaGeo = new THREE.BoxGeometry(0.9, 0.02, 0.25);
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2,
    });
    const antenna = new THREE.Mesh(antennaGeo, copperMat);
    antenna.position.set(0, 0.05, -0.92);
    esp32Group.add(antenna);

    // GPIO Gold Pin Headers (left and right)
    for (let side = -1; side <= 1; side += 2) {
      for (let i = -8; i <= 8; i++) {
        const pinGeo = new THREE.BoxGeometry(0.06, 0.22, 0.06);
        const pin = new THREE.Mesh(pinGeo, copperMat);
        pin.position.set(side * 0.72, 0.06, i * 0.11);
        esp32Group.add(pin);
      }
    }

    // Micro USB / Type-C port
    const usbGeo = new THREE.BoxGeometry(0.42, 0.14, 0.35);
    const usb = new THREE.Mesh(usbGeo, metalMat);
    usb.position.set(0, 0.08, 1.05);
    esp32Group.add(usb);

    // LEDs (Power Amber, TX/RX Emerald)
    const pwrLedGeo = new THREE.BoxGeometry(0.08, 0.04, 0.08);
    const pwrLedMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const pwrLed = new THREE.Mesh(pwrLedGeo, pwrLedMat);
    pwrLed.position.set(-0.35, 0.06, 0.8);
    esp32Group.add(pwrLed);

    const rxLedMeshGeo = new THREE.BoxGeometry(0.08, 0.04, 0.08);
    const rxLedMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const rxLedMesh = new THREE.Mesh(rxLedMeshGeo, rxLedMat);
    rxLedMesh.position.set(0.35, 0.06, 0.8);
    esp32Group.add(rxLedMesh);

    scene.add(esp32Group);
    interactableObjects.current.push(pcb, shield);

    // 4. FLOATING 3D SKILL POLYHEDRA
    const skillNodes: { mesh: THREE.Mesh; name: string; speed: number; orbitR: number; angle: number; y: number }[] = [];

    const skillConfigs = [
      { name: 'Frontend Architecture (React/Three)', color: 0x10b981, geo: new THREE.IcosahedronGeometry(0.3, 0), r: 2.8, y: 1.8, s: 0.8 },
      { name: 'Backend Engineering (Node/Python)', color: 0x38bdf8, geo: new THREE.OctahedronGeometry(0.28, 0), r: 3.3, y: 2.4, s: -0.6 },
      { name: 'Hardware & IoT (ESP32/Sensors)', color: 0xf59e0b, geo: new THREE.DodecahedronGeometry(0.28, 0), r: 2.4, y: 1.2, s: 1.1 },
      { name: 'Data Architecture (Mongo/Firebase)', color: 0xe2e8f0, geo: new THREE.BoxGeometry(0.35, 0.35, 0.35), r: 3.7, y: 1.6, s: -0.9 },
    ];

    skillConfigs.forEach((cfg) => {
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: false,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      mesh.name = cfg.name;
      mesh.castShadow = true;
      scene.add(mesh);
      interactableObjects.current.push(mesh);
      skillNodes.push({
        mesh,
        name: cfg.name,
        speed: cfg.s,
        orbitR: cfg.r,
        angle: Math.random() * Math.PI * 2,
        y: cfg.y,
      });
    });

    // 5. 3D PARTICLE FIELD (Cosmic Telemetry Data)
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const emerald = new THREE.Color(0x10b981);
    const amber = new THREE.Color(0xf59e0b);
    const slate = new THREE.Color(0x94a3b8);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = Math.random() * 20 - 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;

      const pick = Math.random();
      const col = pick < 0.4 ? emerald : pick < 0.6 ? amber : slate;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    // ----------------------------------------------------
    // MOUSE PARALLAX & RAYCASTING
    // ----------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    const mouseParallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.x = x;
      mouse.y = y;
      mouseParallax.targetX = x * 0.8;
      mouseParallax.targetY = y * 0.4;
    };

    const handleClick = () => {
      if (!cameraRef.current) return;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(interactableObjects.current, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        sound.playClick();
        const objName = hit.name || hit.parent?.name || 'Interactive Node';
        setHoveredObject(objName);
        if (onSelectNodeRef.current) {
          onSelectNodeRef.current(objName);
        }

        // Camera focus logic
        if (objName.includes('ESP32')) {
          setActiveView('esp32');
          targetCameraPos.current.set(1.4, 1.6, 2.3);
          targetLookAt.current.set(1.4, 0.3, 0.5);
        } else if (objName.includes('Terminal') || objName.includes('Console')) {
          setActiveView('console');
          targetCameraPos.current.set(-0.8, 1.8, 1.4);
          targetLookAt.current.set(-0.8, 1.6, -0.6);
        } else {
          sound.playSuccess();
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // ----------------------------------------------------
    // RESIZE OBSERVER
    // ----------------------------------------------------
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // ----------------------------------------------------
    // ANIMATION LOOP
    // ----------------------------------------------------
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const animate = (timeMs: number) => {
      frameIdRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // FPS Calculation
      frameCount++;
      if (now - lastFpsUpdate >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      const time = timeMs / 1000;

      // Update interactive terminal texture
      updateScreenTexture(time);

      // Blinking RX/TX status LEDs
      if (rxLedRef.current) {
        rxLedRef.current.intensity = Math.sin(time * 12) > 0.3 ? 1.6 : 0.2;
      }

      // Parallax easing
      mouseParallax.x += (mouseParallax.targetX - mouseParallax.x) * 0.05;
      mouseParallax.y += (mouseParallax.targetY - mouseParallax.y) * 0.05;

      // Orbit Skill nodes
      skillNodes.forEach((node) => {
        node.angle += node.speed * delta * 0.8;
        node.mesh.position.x = Math.cos(node.angle) * node.orbitR;
        node.mesh.position.z = Math.sin(node.angle) * node.orbitR;
        node.mesh.position.y = node.y + Math.sin(time * 2 + node.angle) * 0.25;
        node.mesh.rotation.x += delta * 1.2;
        node.mesh.rotation.y += delta * 1.5;
      });

      // Gently rotate particle cosmos
      particleField.rotation.y = time * 0.02;

      // Camera transitions
      if (cameraRef.current) {
        // Auto-rotation around current target when in orbit mode
        if (activeViewRef.current === 'orbit' && autoRotateRef.current && !isInteractingRef.current) {
          const orbitAngle = time * 0.25;
          targetCameraPos.current.x = Math.sin(orbitAngle) * 8.5 + mouseParallax.x * 2;
          targetCameraPos.current.z = Math.cos(orbitAngle) * 8.5;
          targetCameraPos.current.y = 3.8 + mouseParallax.y * 1.5;
        }

        cameraRef.current.position.lerp(targetCameraPos.current, 0.05);
        currentLookAt.current.lerp(targetLookAt.current, 0.05);
        cameraRef.current.lookAt(currentLookAt.current);

        // Raycasting for Hover detection
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(interactableObjects.current, true);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const name = hit.name || hit.parent?.name || 'Hardware Component';
          setHoveredObject(name);
          container.style.cursor = 'pointer';
        } else {
          setHoveredObject(null);
          container.style.cursor = 'default';
        }
      }

      renderer.render(scene, camera);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    // CLEANUP
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);

      // Dispose Three.js objects
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
      screenTextureRef.current?.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [updateScreenTexture]);

  // View Preset Handler
  const handleViewChange = (view: 'orbit' | 'esp32' | 'console' | 'skills') => {
    sound.playSwitch();
    setActiveView(view);
    isInteractingRef.current = false;

    if (view === 'orbit') {
      targetCameraPos.current.set(0, 4, 9);
      targetLookAt.current.set(0, 0, 0);
    } else if (view === 'esp32') {
      targetCameraPos.current.set(1.4, 1.6, 2.3);
      targetLookAt.current.set(1.4, 0.25, 0.5);
    } else if (view === 'console') {
      targetCameraPos.current.set(-0.8, 1.8, 1.4);
      targetLookAt.current.set(-0.8, 1.6, -0.6);
    } else if (view === 'skills') {
      targetCameraPos.current.set(0, 6.5, 3.5);
      targetLookAt.current.set(0, 1.5, 0);
    }
  };

  return (
    <div className="relative w-full h-[520px] md:h-[620px] lg:h-[700px] overflow-hidden rounded-2xl border border-white/10 bg-[#08090b] shadow-2xl">
      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-full"
        onMouseDown={() => { isInteractingRef.current = true; }}
        onMouseUp={() => { isInteractingRef.current = false; }}
      />

      {/* Top Left: System Metrics HUD */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1.5 font-mono text-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-semibold tracking-wider">3D WORKSPACE ENGINE</span>
          <span className="text-neutral-500">|</span>
          <span className="text-emerald-400">{fps} FPS</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-black/40 backdrop-blur-md border border-white/5 text-neutral-400 text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>ESP32-WROOM-32: 240MHz DUAL-CORE</span>
        </div>
      </div>

      {/* Top Right: Hover Object Reticle */}
      {hoveredObject && (
        <div className="absolute top-4 right-4 z-10 font-mono text-xs animate-fade-in pointer-events-none">
          <div className="px-3.5 py-2 rounded-lg bg-black/80 backdrop-blur-md border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>INSPECTING: {hoveredObject}</span>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        {/* Camera Views Selector */}
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => handleViewChange('orbit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeView === 'orbit'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Orbit</span>
          </button>

          <button
            type="button"
            onClick={() => handleViewChange('esp32')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeView === 'esp32'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ESP32 MCU</span>
          </button>

          <button
            type="button"
            onClick={() => handleViewChange('console')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeView === 'console'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            type="button"
            onClick={() => handleViewChange('skills')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeView === 'skills'
                ? 'bg-white/20 text-white border border-white/30 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Skills 3D</span>
          </button>
        </div>

        {/* Rotation & Reset Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setAutoRotate(!autoRotate);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
              autoRotate
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-black/60 text-neutral-400 border-white/10 hover:text-white'
            }`}
            title="Toggle Auto-Rotate"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline">Auto-Rotate</span>
          </button>

          <button
            type="button"
            onClick={() => handleViewChange('orbit')}
            className="p-2 rounded-xl bg-black/60 text-neutral-400 border border-white/10 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Helper Hint */}
      <div className="absolute bottom-16 right-4 hidden lg:flex items-center gap-2 font-mono text-[11px] text-neutral-500 bg-black/40 px-3 py-1 rounded-md border border-white/5 pointer-events-none">
        <span>[DRAG TO ROTATE  |  CLICK OBJECTS TO FOCUS]</span>
      </div>
    </div>
  );
};
