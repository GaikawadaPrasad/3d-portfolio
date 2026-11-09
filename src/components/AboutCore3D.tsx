import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '../utils/sound';
import { Cpu, RotateCcw } from 'lucide-react';

export const AboutCore3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeCore, setActiveCore] = useState<number | null>(null);
  const [clockSpeed, setClockSpeed] = useState<number>(240);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 3.2, 5.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const greenSpot = new THREE.PointLight(0x10b981, 2.5, 10);
    greenSpot.position.set(-2, 3, 2);
    scene.add(greenSpot);

    const amberSpot = new THREE.PointLight(0xf59e0b, 2.5, 10);
    amberSpot.position.set(2, 2, -2);
    scene.add(amberSpot);

    // Silicon Substrate Base
    const baseGeo = new THREE.BoxGeometry(3.2, 0.15, 3.2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x11161d,
      metalness: 0.85,
      roughness: 0.25,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    scene.add(baseMesh);

    // Outer Circuit Ring (Rotating)
    const ringGeo = new THREE.TorusGeometry(2.1, 0.025, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.12;
    scene.add(ring);

    // Inner Amber Data Bus Ring
    const innerRingGeo = new THREE.TorusGeometry(1.5, 0.02, 16, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.13;
    scene.add(innerRing);

    // Dual Cores
    const coreGroup = new THREE.Group();

    // Core 0 (Protocol / Wireless)
    const core0Geo = new THREE.BoxGeometry(0.9, 0.18, 1.2);
    const core0Mat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: false,
    });
    const core0 = new THREE.Mesh(core0Geo, core0Mat);
    core0.position.set(-0.65, 0.18, 0);
    core0.name = 'Core 0: Protocol & Network Engine';
    coreGroup.add(core0);

    // Core 1 (Application / UI Logic)
    const core1Geo = new THREE.BoxGeometry(0.9, 0.18, 1.2);
    const core1Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: false,
    });
    const core1 = new THREE.Mesh(core1Geo, core1Mat);
    core1.position.set(0.65, 0.18, 0);
    core1.name = 'Core 1: Compute & Application Engine';
    coreGroup.add(core1);

    // Floating Data Packets (Pulsing Orbiting Cubes)
    const packetCount = 24;
    const packets: THREE.Mesh[] = [];
    const packetGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);

    for (let i = 0; i < packetCount; i++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x10b981 : 0xf59e0b,
      });
      const p = new THREE.Mesh(packetGeo, pMat);
      scene.add(p);
      packets.push(p);
    }

    scene.add(coreGroup);

    // Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects([core0, core1]);
      if (hits.length > 0) {
        sound.playClick();
        const hit = hits[0].object;
        if (hit === core0) {
          setActiveCore(0);
          setClockSpeed((prev) => (prev === 240 ? 160 : 240));
        } else {
          setActiveCore(1);
          setClockSpeed((prev) => (prev === 240 ? 320 : 240));
        }
      }
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    // Resize Observer
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nw, height: nh } = entry.contentRect;
        if (nw > 0 && nh > 0) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
      }
    });
    ro.observe(container);

    let animId = 0;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.015 * (clockSpeed / 240);

      // Rotate data rings
      ring.rotation.z = t * 0.4;
      innerRing.rotation.z = -t * 0.6;

      // Rotate entire silicon substrate gently
      scene.rotation.y = Math.sin(t * 0.25) * 0.35 + mouse.x * 0.4;
      scene.rotation.x = mouse.y * 0.2;

      // Pulse data packets along track
      packets.forEach((p, idx) => {
        const angle = (idx / packetCount) * Math.PI * 2 + t * 0.8;
        const rad = idx % 2 === 0 ? 2.1 : 1.5;
        p.position.x = Math.cos(angle) * rad;
        p.position.z = Math.sin(angle) * rad;
        p.position.y = 0.16 + Math.sin(t * 3 + idx) * 0.04;
      });

      // Core hover effects
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([core0, core1]);
      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        const hovered = intersects[0].object;
        hovered.scale.set(1.05, 1.2, 1.05);
      } else {
        container.style.cursor = 'default';
        core0.scale.set(1, 1, 1);
        core1.scale.set(1, 1, 1);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);
      renderer.forceContextLoss();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [clockSpeed]);

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden border border-white/10 bg-[#07080a] shadow-xl">
      <div ref={mountRef} className="w-full h-full" />

      {/* Top HUD */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2 font-mono text-[11px] text-neutral-400 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
        <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>XTENSA LX6 ARCHITECTURE:</span>
        <span className="text-emerald-400 font-bold">{clockSpeed} MHz</span>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-neutral-400 pointer-events-none bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
        <span>CLICK CORES TO SWITCH FREQUENCY</span>
        <span className="text-emerald-400">
          {activeCore === 0 ? 'CORE 0: PROTOCOL/WIFI [ACTIVE]' : activeCore === 1 ? 'CORE 1: COMPUTE [OVERCLOCKED]' : 'DUAL-CORE PARALLEL'}
        </span>
      </div>
    </div>
  );
};
