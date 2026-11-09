import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { sound } from '../utils/sound';
import { Radio, Send } from 'lucide-react';

interface ContactBeacon3DProps {
  isTransmitting?: boolean;
}

export const ContactBeacon3D: React.FC<ContactBeacon3DProps> = ({ isTransmitting }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const isTransmittingRef = useRef(isTransmitting);

  useEffect(() => {
    isTransmittingRef.current = isTransmitting;
  }, [isTransmitting]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080a);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 3.2, 5.8);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const laserLight = new THREE.PointLight(0x10b981, 1.5, 12);
    laserLight.position.set(0, 3.5, 0);
    scene.add(laserLight);

    // Dish Group (Rotates)
    const antennaGroup = new THREE.Group();

    // Base Pylon
    const baseGeo = new THREE.CylinderGeometry(0.3, 0.6, 1.2, 16);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x181e26, metalness: 0.8, roughness: 0.3 });
    const baseMesh = new THREE.Mesh(baseGeo, metalMat);
    baseMesh.position.y = 0.6;
    antennaGroup.add(baseMesh);

    // Radar Dish (Parabolic Hollow Half-Sphere)
    const dishGeo = new THREE.SphereGeometry(1.4, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.5);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0x11161f,
      metalness: 0.9,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 1.6, 0);
    dish.rotation.x = -Math.PI / 4;
    antennaGroup.add(dish);

    // Feed Horn & Support Struts
    const hornGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.8, 12);
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    const horn = new THREE.Mesh(hornGeo, copperMat);
    horn.position.set(0, 2.1, 0.5);
    horn.rotation.x = -Math.PI / 4;
    antennaGroup.add(horn);

    // Holographic Energy Beam / Cone
    const beamGeo = new THREE.ConeGeometry(0.8, 4.0, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 3.4, 1.8);
    beam.rotation.x = -Math.PI / 4;
    antennaGroup.add(beam);

    scene.add(antennaGroup);

    // Cosmic Particles
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) {
      pPos[i] = (Math.random() - 0.5) * 12;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.04, color: 0x38bdf8, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(pGeo, pMat);
    scene.add(stars);

    // Click to fire laser pulse
    const onClick = () => {
      sound.playBeep(1400, 0.1, 'square');
      beamMat.opacity = 0.9;
      laserLight.intensity = 4.0;
      setTimeout(() => {
        beamMat.opacity = 0.3;
        laserLight.intensity = 1.5;
      }, 250);
    };

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
      t += 0.02;

      // Rotate antenna radar sweep
      antennaGroup.rotation.y = Math.sin(t * 0.4) * 0.6;
      stars.rotation.y = t * 0.02;

      if (isTransmittingRef.current) {
        beamMat.opacity = Math.sin(t * 12) * 0.4 + 0.5;
        laserLight.intensity = 3.5;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      container.removeEventListener('click', onClick);
      renderer.forceContextLoss();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[240px] sm:h-[280px] rounded-2xl overflow-hidden border border-white/10 bg-[#07080a] shadow-xl mb-6">
      <div ref={mountRef} className="w-full h-full cursor-pointer" />

      {/* Top HUD */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2 font-mono text-[11px] text-neutral-300 bg-black/70 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>3D QUANTUM BEACON //</span>
        <span className="text-emerald-400">PUNE TRANSMISSION DISH</span>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-neutral-400 pointer-events-none bg-black/70 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
        <span>[CLICK DISH TO PING QUANTUM BEAM]</span>
        <span className="text-emerald-400">BEACON: READY FOR DISPATCH</span>
      </div>
    </div>
  );
};
