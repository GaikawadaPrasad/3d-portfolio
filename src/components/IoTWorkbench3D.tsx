import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { sound } from '../utils/sound';
import { Eye, RotateCcw, Activity } from 'lucide-react';

interface IoTWorkbench3DProps {
  motionTriggered: boolean;
  distanceCm: number;
  luxValue: number;
  onTriggerMotion: () => void;
}

export const IoTWorkbench3D: React.FC<IoTWorkbench3DProps> = ({
  motionTriggered,
  distanceCm,
  luxValue,
  onTriggerMotion,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const motionTriggeredRef = useRef(motionTriggered);
  const distanceCmRef = useRef(distanceCm);
  const luxValueRef = useRef(luxValue);

  useEffect(() => {
    motionTriggeredRef.current = motionTriggered;
  }, [motionTriggered]);

  useEffect(() => {
    distanceCmRef.current = distanceCm;
  }, [distanceCm]);

  useEffect(() => {
    luxValueRef.current = luxValue;
  }, [luxValue]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090c);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 4.5, 7.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe2e8f0, 1.8);
    dirLight.position.set(4, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Alarm / Sensor Point Light
    const alarmLight = new THREE.PointLight(0xef4444, 0, 6);
    alarmLight.position.set(-1.8, 1.2, 0.5);
    scene.add(alarmLight);

    // ----------------------------------------------------
    // BREADBOARD & ELECTRONICS 3D MODEL
    // ----------------------------------------------------
    const boardGroup = new THREE.Group();

    // White standard breadboard body
    const breadboardGeo = new THREE.BoxGeometry(6.5, 0.25, 3.8);
    const breadboardMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.6,
      metalness: 0.2,
    });
    const breadboard = new THREE.Mesh(breadboardGeo, breadboardMat);
    breadboard.receiveShadow = true;
    boardGroup.add(breadboard);

    // Pin tie rows texture / tie holes
    const gridRows = new THREE.GridHelper(6.0, 30, 0x10b981, 0x272b35);
    gridRows.position.y = 0.13;
    boardGroup.add(gridRows);

    // 1. ESP32 Module (Center)
    const espPcbGeo = new THREE.BoxGeometry(1.4, 0.08, 2.0);
    const espPcbMat = new THREE.MeshStandardMaterial({ color: 0x0a2416, roughness: 0.4 });
    const espPcb = new THREE.Mesh(espPcbGeo, espPcbMat);
    espPcb.position.set(0, 0.2, 0);
    espPcb.castShadow = true;
    boardGroup.add(espPcb);

    const rfShieldGeo = new THREE.BoxGeometry(0.9, 0.1, 1.0);
    const rfShieldMat = new THREE.MeshStandardMaterial({ color: 0xc4c7cc, metalness: 0.9, roughness: 0.2 });
    const rfShield = new THREE.Mesh(rfShieldGeo, rfShieldMat);
    rfShield.position.set(0, 0.26, -0.2);
    boardGroup.add(rfShield);

    // 2. HC-SR04 Ultrasonic Sensor (Right side)
    const usGroup = new THREE.Group();
    usGroup.position.set(2.0, 0.45, 0);

    const usPcbGeo = new THREE.BoxGeometry(1.8, 0.7, 0.08);
    const usPcbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const usPcb = new THREE.Mesh(usPcbGeo, usPcbMat);
    usGroup.add(usPcb);

    // Cylindrical Transducer Eyes
    const eyeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 24);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.2 });

    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    eyeLeft.rotation.x = Math.PI / 2;
    eyeLeft.position.set(-0.45, 0, 0.2);
    usGroup.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    eyeRight.rotation.x = Math.PI / 2;
    eyeRight.position.set(0.45, 0, 0.2);
    usGroup.add(eyeRight);

    boardGroup.add(usGroup);

    // Ultrasonic Sonic Wave Rings (Dynamic)
    const waveRingGeo = new THREE.TorusGeometry(0.3, 0.015, 12, 32);
    const waveRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    const waveRings: THREE.Mesh[] = [];

    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(waveRingGeo, waveRingMat.clone());
      ring.position.set(2.0, 0.45, 0.6 + i * 0.7);
      ring.visible = true;
      boardGroup.add(ring);
      waveRings.push(ring);
    }

    // 3. PIR Motion Sensor (Left side)
    const pirGroup = new THREE.Group();
    pirGroup.position.set(-2.0, 0.4, 0);

    const pirPcbGeo = new THREE.BoxGeometry(1.2, 0.08, 1.2);
    const pirPcbMat = new THREE.MeshStandardMaterial({ color: 0x047857 });
    const pirPcb = new THREE.Mesh(pirPcbGeo, pirPcbMat);
    pirGroup.add(pirPcb);

    // White Fresnel Dome
    const domeGeo = new THREE.SphereGeometry(0.45, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.4,
      metalness: 0.1,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.04;
    dome.name = 'PIR Dome Sensor';
    pirGroup.add(dome);

    // Laser Detection Cone
    const coneGeo = new THREE.ConeGeometry(1.4, 2.5, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(0, 1.4, 0);
    pirGroup.add(cone);

    boardGroup.add(pirGroup);

    // 4. Jumper Wires (Curved Bezier tubes)
    const wireColors = [0x10b981, 0xf59e0b, 0xef4444, 0x38bdf8];
    const wirePoints = [
      [new THREE.Vector3(-0.6, 0.25, 0.6), new THREE.Vector3(-1.2, 0.9, 0.4), new THREE.Vector3(-1.8, 0.3, 0.4)],
      [new THREE.Vector3(0.6, 0.25, 0.4), new THREE.Vector3(1.3, 0.8, 0.2), new THREE.Vector3(1.8, 0.3, 0.2)],
      [new THREE.Vector3(-0.6, 0.25, -0.6), new THREE.Vector3(-1.4, 0.7, -0.5), new THREE.Vector3(-2.2, 0.3, -0.4)],
    ];

    wirePoints.forEach((pts, idx) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.035, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: wireColors[idx % wireColors.length], roughness: 0.3 });
      const wire = new THREE.Mesh(tubeGeo, tubeMat);
      boardGroup.add(wire);
    });

    scene.add(boardGroup);

    // Mouse Interaction
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        boardGroup.rotation.y += deltaX * 0.008;
        boardGroup.rotation.x += deltaY * 0.008;
        boardGroup.rotation.x = Math.max(-0.6, Math.min(0.6, boardGroup.rotation.x));
        prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects([dome, usPcb, espPcb]);

      if (hits.length > 0) {
        sound.playClick();
        onTriggerMotion();
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
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
      t += 0.03;

      // Animate Ultrasonic Pulse Rings based on distanceCm
      const currentDist = distanceCmRef.current;
      waveRings.forEach((ring, i) => {
        const progress = ((t * 2 + i * 0.5) % 3) / 3;
        ring.position.z = 0.3 + progress * (currentDist / 60);
        ring.scale.setScalar(1 + progress * 2.2);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - progress);
      });

      // Animate PIR Motion Alarm
      if (motionTriggeredRef.current) {
        alarmLight.intensity = Math.sin(t * 8) > 0 ? 3.0 : 0.2;
        coneMat.opacity = Math.sin(t * 6) * 0.3 + 0.35;
        domeMat.color.setHex(0xff3333);
      } else {
        alarmLight.intensity = 0;
        coneMat.opacity = 0;
        domeMat.color.setHex(0xf1f5f9);
      }

      if (!isDragging) {
        boardGroup.rotation.y += 0.002;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      renderer.forceContextLoss();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onTriggerMotion]);

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden border border-white/10 bg-[#07090c] shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2 font-mono text-[11px] text-neutral-300 bg-black/70 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <span>3D CIRCUIT BENCH //</span>
        <span className="text-amber-400">ESP32 + HC-SR04 + PIR</span>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-neutral-400 pointer-events-none bg-black/70 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
        <span>[DRAG TO ROTATE 360° | CLICK SENSOR DOME TO TRIGGER]</span>
        <span className={motionTriggered ? 'text-red-400 font-bold animate-pulse' : 'text-emerald-400'}>
          {motionTriggered ? 'PIR INTR: ALARM ACTIVATED' : 'RADAR: SCANNING ECHO'}
        </span>
      </div>
    </div>
  );
};
