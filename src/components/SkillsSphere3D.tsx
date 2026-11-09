import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '../utils/sound';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { Globe, Zap, Compass } from 'lucide-react';

interface SkillsSphere3DProps {
  onSelectSkill?: (skillName: string) => void;
}

export const SkillsSphere3D: React.FC<SkillsSphere3DProps> = ({ onSelectSkill }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const greenLight = new THREE.PointLight(0x10b981, 2.0, 15);
    greenLight.position.set(0, 4, 3);
    scene.add(greenLight);

    const sphereGroup = new THREE.Group();

    // Inner wireframe sphere
    const wireGeo = new THREE.IcosahedronGeometry(2.4, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1f2937,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireSphere = new THREE.Mesh(wireGeo, wireMat);
    sphereGroup.add(wireSphere);

    // Skill Items
    const skillList = [
      { name: 'React.js', color: 0x10b981, domain: 'Frontend' },
      { name: 'Three.js / WebGL', color: 0x10b981, domain: 'Frontend' },
      { name: 'Tailwind CSS', color: 0x10b981, domain: 'Frontend' },
      { name: 'JavaScript', color: 0x10b981, domain: 'Frontend' },
      { name: 'TypeScript', color: 0x10b981, domain: 'Frontend' },
      { name: 'Node.js', color: 0x38bdf8, domain: 'Backend' },
      { name: 'Express.js', color: 0x38bdf8, domain: 'Backend' },
      { name: 'Socket.io', color: 0x38bdf8, domain: 'Backend' },
      { name: 'Python', color: 0x38bdf8, domain: 'Backend' },
      { name: 'ESP32 MCU', color: 0xf59e0b, domain: 'Hardware' },
      { name: 'C++ Firmware', color: 0xf59e0b, domain: 'Hardware' },
      { name: 'MicroPython', color: 0xf59e0b, domain: 'Hardware' },
      { name: 'IoT Sensors', color: 0xf59e0b, domain: 'Hardware' },
      { name: 'MQTT / WS', color: 0xf59e0b, domain: 'Hardware' },
      { name: 'MongoDB', color: 0x34d399, domain: 'Database' },
      { name: 'Firebase', color: 0x34d399, domain: 'Database' },
      { name: 'IndexedDB', color: 0x34d399, domain: 'Database' },
      { name: 'Capacitor', color: 0xa3a3a3, domain: 'Tools' },
      { name: 'Git & CI', color: 0xa3a3a3, domain: 'Tools' },
      { name: 'Vite', color: 0xa3a3a3, domain: 'Tools' },
    ];

    const nodeMeshes: THREE.Mesh[] = [];
    const nodeRadius = 2.4;
    const total = skillList.length;

    // Fibonacci sphere distribution
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    skillList.forEach((skill, i) => {
      const y = 1 - (i / (total - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: skill.color,
        roughness: 0.2,
        metalness: 0.8,
      });

      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(x * nodeRadius, y * nodeRadius, z * nodeRadius);
      node.name = skill.name;
      sphereGroup.add(node);
      nodeMeshes.push(node);
    });

    // Connecting Laser Vectors between nearby nodes
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.2,
    });

    for (let i = 0; i < nodeMeshes.length; i++) {
      for (let j = i + 1; j < nodeMeshes.length; j++) {
        const dist = nodeMeshes[i].position.distanceTo(nodeMeshes[j].position);
        if (dist < 1.6) {
          const points = [nodeMeshes[i].position, nodeMeshes[j].position];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, lineMat);
          sphereGroup.add(line);
        }
      }
    }

    scene.add(sphereGroup);

    // Mouse Interaction
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let velocity = { x: 0.003, y: 0.002 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        velocity.x = deltaX * 0.005;
        velocity.y = deltaY * 0.005;
        sphereGroup.rotation.y += velocity.x;
        sphereGroup.rotation.x += velocity.y;
        prevMousePos = { x: e.clientX, y: e.clientY };
      }

      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);

      if (hits.length > 0) {
        container.style.cursor = 'pointer';
        setHoveredSkill(hits[0].object.name);
      } else {
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
        setHoveredSkill(null);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = () => {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);

      if (hits.length > 0) {
        sound.playClick();
        const clickedName = hits[0].object.name;
        if (onSelectSkill) {
          onSelectSkill(clickedName);
        }
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

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        velocity.x *= 0.96;
        velocity.y *= 0.96;
        sphereGroup.rotation.y += velocity.x + 0.003;
        sphereGroup.rotation.x += velocity.y;
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
  }, [onSelectSkill]);

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden border border-white/10 bg-[#07080a] shadow-2xl mb-8">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left HUD */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2 font-mono text-[11px] text-neutral-300 bg-black/70 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
        <Globe className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '12s' }} />
        <span>3D SKILL CONSTELLATION GLOBE</span>
      </div>

      {/* Hovered Skill HUD */}
      {hoveredSkill && (
        <div className="absolute top-3 right-3 pointer-events-none font-mono text-xs animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-lg bg-black/85 border border-emerald-500/40 text-emerald-300 backdrop-blur-md flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>FOCUS: {hoveredSkill}</span>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-neutral-400 pointer-events-none bg-black/70 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
        <span>[DRAG GLOBE TO ROTATE IN 3D | CLICK NODE TO SELECT]</span>
        <span className="text-emerald-400">20+ INTERCONNECTED NODES</span>
      </div>
    </div>
  );
};
