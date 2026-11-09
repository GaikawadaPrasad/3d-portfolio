import React, { useState, useEffect, useRef } from 'react';
import { World3D } from './components/World3D';
import { HUD } from './components/HUD';
import { ProjectModal } from './components/ProjectModal';
import { TerminalModal } from './components/TerminalModal';
import { ProjectItem } from './data/portfolioData';
import { sound } from './utils/sound';

export function App() {
  const [currentStation, setCurrentStation] = useState<number>(0);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [terminalOpen, setTerminalOpen] = useState<boolean>(false);
  const [motionTriggered, setMotionTriggered] = useState<boolean>(false);
  const [distanceCm, setDistanceCm] = useState<number>(35);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const scrollTimeout = useRef<number | null>(null);

  // Wheel-based Station Scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Don't intercept if inside modal or form
      if ((e.target as HTMLElement)?.closest('.overflow-y-auto') || terminalOpen || selectedProject) {
        return;
      }

      if (scrollTimeout.current) return;

      if (Math.abs(e.deltaY) > 30) {
        if (e.deltaY > 0) {
          // Scroll Down -> Next Station
          setCurrentStation((prev) => {
            const next = Math.min(5, prev + 1);
            if (next !== prev) sound.playSwitch();
            return next;
          });
        } else {
          // Scroll Up -> Previous Station
          setCurrentStation((prev) => {
            const next = Math.max(0, prev - 1);
            if (next !== prev) sound.playSwitch();
            return next;
          });
        }

        scrollTimeout.current = window.setTimeout(() => {
          scrollTimeout.current = null;
        }, 600);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [terminalOpen, selectedProject]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        sound.playClick();
        setTerminalOpen((prev) => !prev);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentStation((prev) => {
          const next = Math.min(5, prev + 1);
          if (next !== prev) sound.playSwitch();
          return next;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentStation((prev) => {
          const next = Math.max(0, prev - 1);
          if (next !== prev) sound.playSwitch();
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTriggerMotion = () => {
    sound.playClick();
    const nextState = !motionTriggered;
    setMotionTriggered(nextState);
    if (nextState) {
      sound.playBeep(940, 0.15, 'square');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060709] select-none">
      {/* 100% UNIFIED 3D INTERACTIVE WORLD */}
      <World3D
        currentStation={currentStation}
        freeRoam={false}
        onStationChange={setCurrentStation}
        onSelectProject={(proj) => setSelectedProject(proj)}
        motionTriggered={motionTriggered}
        distanceCm={distanceCm}
        isTransmitting={isTransmitting}
        onTriggerMotion={handleTriggerMotion}
      />

      {/* SLEEK SCI-FI DEVELOPER HUD OVERLAY */}
      <HUD
        currentStation={currentStation}
        onSelectStation={(st) => setCurrentStation(st)}
        onOpenTerminal={() => setTerminalOpen(true)}
        onSelectProject={(proj) => setSelectedProject(proj)}
        motionTriggered={motionTriggered}
        onTriggerMotion={handleTriggerMotion}
        distanceCm={distanceCm}
        onChangeDistance={setDistanceCm}
      />

      {/* INTERACTIVE 3D PROJECT ARCHITECTURE MODAL */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* INTERACTIVE BROWSER TERMINAL CLI */}
      <TerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
      />
    </div>
  );
}

export default App;
