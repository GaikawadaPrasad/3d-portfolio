import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Terminal as TerminalIcon, CornerDownLeft } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<Array<{ cmd: string; output: string[] }>>([
    {
      cmd: 'welcome',
      output: [
        'PRASAD GAIKWAD // CLI OS v4.2.0 [XTENSA-64]',
        'Type "help" to inspect available commands or "exit" to close.',
      ],
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    sound.playClick();
    let res: string[] = [];

    switch (cmd) {
      case 'help':
        res = [
          'AVAILABLE COMMANDS:',
          '  about       - Overview of Prasad Gaikwad and background',
          '  projects    - List production and prototype projects',
          '  hardware    - Inspect ESP32 IoT edge specifications',
          '  skills      - Dump technical proficiency architecture',
          '  contact     - Display transmission coordinates & email',
          '  clear       - Clear terminal output buffer',
          '  matrix      - Stream phosphor telemetry stream',
          '  sudo        - Request elevated kernel privileges',
          '  exit        - Close terminal workspace',
        ];
        break;

      case 'about':
      case 'bio':
        res = [
          `NAME: ${PORTFOLIO_DATA.profile.name}`,
          `ROLE: ${PORTFOLIO_DATA.profile.role}`,
          `LOCATION: ${PORTFOLIO_DATA.profile.location}`,
          `BIO: ${PORTFOLIO_DATA.profile.bio}`,
        ];
        break;

      case 'projects':
        res = [
          'FEATURED PROJECTS:',
          ...PORTFOLIO_DATA.projects.map((p) => `  [${p.badge}] ${p.title} -> ${p.summary}`),
        ];
        break;

      case 'hardware':
      case 'iot':
        res = [
          'ESP32 HARDWARE LAB MATRIX:',
          '  MCU: ESP32-WROOM-32 (240MHz Dual-Core Xtensa LX6)',
          '  Sensors: HC-SR04 Ultrasonic Radar, HC-SR501 PIR Motion, DHT22 Temp',
          '  Protocols: MQTT, WebSockets, SPI, I2C, UART Serial',
        ];
        break;

      case 'skills':
        res = [
          'CORE CAPABILITIES:',
          '  Frontend: React.js, Three.js/WebGL, Tailwind CSS, TypeScript, Framer Motion',
          '  Backend: Node.js, Express.js, Socket.io, Python, Java, REST APIs',
          '  Hardware: ESP32, C++, MicroPython, Circuit Design, Sensor Fusion',
          '  Databases: MongoDB, Firebase Firestore, IndexedDB',
        ];
        break;

      case 'contact':
        res = [
          `EMAIL: ${PORTFOLIO_DATA.profile.socials.email}`,
          `GITHUB: ${PORTFOLIO_DATA.profile.socials.github}`,
          `LINKEDIN: ${PORTFOLIO_DATA.profile.socials.linkedin}`,
        ];
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      case 'matrix':
        res = [
          '01010000 01010010 01000001 01010011 01000001 01000100',
          'STREAMING HIGH-FREQUENCY SENSOR RADAR PACKETS...',
          'SYS_CLK: 240,000,000 Hz | MEMORY_OK | ALL CIRCUITS ONLINE',
        ];
        break;

      case 'sudo':
        res = ['User "prasad" is already in the sudoers file. Elevated access granted.'];
        break;

      case 'exit':
      case 'quit':
        onClose();
        return;

      default:
        res = [`Command not found: "${cmd}". Type "help" for a list of valid commands.`];
        break;
    }

    setHistory((prev) => [...prev, { cmd: inputVal, output: res }]);
    setInputVal('');
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl h-[560px] bg-[#07090b] border border-white/20 rounded-2xl shadow-2xl flex flex-col font-mono text-xs overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0d1015] border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-neutral-400 font-semibold flex items-center gap-2">
              <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>prasad@workstation:~</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-md text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Terminal Screen Body */}
        <div
          className="flex-1 p-5 overflow-y-auto space-y-4 select-text bg-grid-pattern"
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span>prasad@core:~$</span>
                <span className="text-white">{item.cmd}</span>
              </div>
              <div className="pl-4 space-y-1 text-neutral-300">
                {item.output.map((line, lIdx) => (
                  <div key={lIdx} className="leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Active Input Line */}
          <form onSubmit={handleCommand} className="flex items-center gap-2 pt-1">
            <span className="text-emerald-400 font-semibold">prasad@core:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-transparent text-white focus:outline-none caret-emerald-400 font-mono text-xs"
              placeholder="Type command (e.g. projects, hardware, help)..."
            />
            <button type="submit" className="text-neutral-500 hover:text-emerald-400">
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
          <div ref={endRef} />
        </div>
      </div>
    </div>,
    document.body
  );
};
