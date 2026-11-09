import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero3D } from './components/Hero3D';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { IoTLab } from './components/IoTLab';
import { Skills } from './components/Skills';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { TerminalModal } from './components/TerminalModal';
import { sound } from './utils/sound';

export function App() {
  const [terminalOpen, setTerminalOpen] = useState(false);

  // Global Keyboard Shortcut: ~ (Tilde) or Backquote toggles Terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        sound.playClick();
        setTerminalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#08090b] text-neutral-100 relative selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Background Subtle Cyber Grids */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-40 z-0" />
      <div className="fixed inset-0 bg-dots-pattern pointer-events-none opacity-20 z-0" />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col">
        <Navbar onOpenTerminal={() => setTerminalOpen(true)} />

        <main className="flex-1">
          <Hero3D onOpenTerminal={() => setTerminalOpen(true)} />
          <About />
          <Projects />
          <IoTLab />
          <Skills />
          <Contact />
        </main>

        <Footer />
      </div>

      {/* Floating Interactive Terminal Modal */}
      <TerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
      />
    </div>
  );
}

export default App;
