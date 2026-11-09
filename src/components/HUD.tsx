import React, { useState } from 'react';
import { Volume2, VolumeX, Terminal, FileText, ArrowRight, Activity, Cpu, Layers, Radio, Send, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { PORTFOLIO_DATA, ProjectItem } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { GithubIcon, LinkedinIcon, InstagramIcon } from './Icons';
import confetti from 'canvas-confetti';
import emailjs from 'emailjs-com';

interface HUDProps {
  currentStation: number;
  onSelectStation: (idx: number) => void;
  onOpenTerminal: () => void;
  onSelectProject: (p: ProjectItem) => void;
  motionTriggered: boolean;
  onTriggerMotion: () => void;
  distanceCm: number;
  onChangeDistance: (val: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentStation,
  onSelectStation,
  onOpenTerminal,
  onSelectProject,
  motionTriggered,
  onTriggerMotion,
  distanceCm,
  onChangeDistance,
}) => {
  const [soundOn, setSoundOn] = useState(sound.enabled);
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'transmitting' | 'sent' | 'error'>('idle');

  const stations = [
    { id: 0, label: '00 // NEXUS' },
    { id: 1, label: '01 // ARCHITECTURE' },
    { id: 2, label: '02 // SHOWROOM' },
    { id: 3, label: '03 // IOT LAB' },
    { id: 4, label: '04 // SKILLS' },
    { id: 5, label: '05 // TRANSMIT' },
  ];

  const coords = [
    'X: 0.0 | Y: 0.0 | Z: 0.0',
    'X: 0.0 | Y: -25.0 | Z: 20.0',
    'X: 0.0 | Y: -50.0 | Z: 40.0',
    'X: 0.0 | Y: -75.0 | Z: 60.0',
    'X: 0.0 | Y: -100.0 | Z: 80.0',
    'X: 0.0 | Y: -125.0 | Z: 100.0',
  ];

  const handleToggleSound = () => {
    const s = sound.toggleSound();
    setSoundOn(s);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactData.name || !contactData.email || !contactData.message) return;

    sound.playClick();
    setContactStatus('transmitting');

    emailjs
      .send(
        PORTFOLIO_DATA.emailJsConfig.serviceId,
        PORTFOLIO_DATA.emailJsConfig.templateId,
        {
          name: contactData.name,
          email: contactData.email,
          title: contactData.message,
        }
      )
      .then(() => {
        sound.playSuccess();
        setContactStatus('sent');
        setContactData({ name: '', email: '', message: '' });
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#f59e0b', '#38bdf8'],
        });
      })
      .catch(() => {
        setContactStatus('error');
      });
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 select-none font-mono">
      {/* ===================================================================== */}
      {/* TOP HUD BAR */}
      {/* ===================================================================== */}
      <header className="flex items-center justify-between gap-4 pointer-events-auto">
        {/* Brand identity */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onSelectStation(0);
          }}
          className="flex items-center gap-3 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 hover:border-emerald-500/40 transition-all text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/20 flex items-center justify-center font-bold text-xs text-emerald-400">
            PG
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wider">PRASAD GAIKWAD</div>
            <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D FULL-STACK & IOT WORLD</span>
            </div>
          </div>
        </button>

        {/* Stations Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
          {stations.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                sound.playSwitch();
                onSelectStation(st.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                currentStation === st.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {st.label}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* CLI Terminal Launcher */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenTerminal();
            }}
            className="p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all"
            title="Open Interactive CLI Terminal"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
              soundOn
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-black/80 text-neutral-400 border-white/10 hover:text-white'
            }`}
            title={soundOn ? 'Mute 3D Audio' : 'Unmute 3D Audio'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Resume Download */}
          <a
            href={PORTFOLIO_DATA.profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:bg-white hover:text-black transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RESUME</span>
          </a>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* CONTEXTUAL 3D STATION HUD CARD (FLOATING OVERLAY) */}
      {/* ===================================================================== */}
      <div className="my-auto max-w-lg pointer-events-auto">
        <div className="relative rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 p-5 sm:p-6 shadow-2xl transition-all duration-300 text-neutral-200">
          {/* Station Coordinates Indicator */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-bold">{stations[currentStation].label}</span>
            </div>
            <span className="text-neutral-500">{coords[currentStation]}</span>
          </div>

          {/* Station 0: Nexus Hero Card */}
          {currentStation === 0 && (
            <div className="space-y-4">
              <div className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                FULL-STACK & HARDWARE DEVELOPER
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Architecting 3D Web Apps & Embedded IoT Systems.
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Welcome to my interactive 3D universe. Explore production web platforms, IoT sensor hardware, and procedural WebGL simulations.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSelectStation(2);
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-neutral-200 transition-colors"
                >
                  <span>Warp to 3D Showroom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSelectStation(3);
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-900 border border-white/20 text-white text-xs hover:border-emerald-500/40 transition-colors"
                >
                  <span>Enter IoT Lab</span>
                </button>
              </div>
            </div>
          )}

          {/* Station 1: Architecture & Silicon Card */}
          {currentStation === 1 && (
            <div className="space-y-3.5">
              <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                ESP32 ARCHITECTURE & BIO
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Engineering with Silicon Precision
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                I bridge physical hardware sensors with modern web applications: React, Node, WebSockets, C++, and ESP32 microcontrollers.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 pt-1">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-neutral-500 block">SoC:</span> ESP32 240MHz Dual-Core
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-neutral-500 block">SRAM:</span> 520 KB High-Speed
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-neutral-500 block">Web:</span> React, Three.js, Node
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-neutral-500 block">Comms:</span> MQTT, WebSockets, REST
                </div>
              </div>
            </div>
          )}

          {/* Station 2: 3D Project Showroom Card */}
          {currentStation === 2 && (
            <div className="space-y-3">
              <div className="inline-block px-2.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
                3D HANGAR SHOWROOM
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Interactive Project Monoliths
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Click any 3D monolith in the showroom to inspect its architecture, code, and live preview:
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {PORTFOLIO_DATA.projects.map((proj) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSelectProject(proj);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 text-xs flex items-center justify-between group transition-all"
                  >
                    <span className="font-semibold text-white group-hover:text-emerald-400 truncate">
                      {proj.title}
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase">{proj.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Station 3: IoT Hardware Lab Card */}
          {currentStation === 3 && (
            <div className="space-y-3.5">
              <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                REAL-TIME SENSOR TELEMETRY
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                ESP32 Hardware Bench
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">PIR SENSOR:</span>
                  <button
                    type="button"
                    onClick={onTriggerMotion}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      motionTriggered
                        ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    }`}
                  >
                    {motionTriggered ? 'TRIPPED [HIGH - 3.3V]' : 'SIMULATE PASS-BY'}
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>ULTRASONIC ECHO:</span>
                    <span className="text-sky-400 font-bold">{distanceCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    value={distanceCm}
                    onChange={(e) => onChangeDistance(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Station 4: Skill Constellation Card */}
          {currentStation === 4 && (
            <div className="space-y-3">
              <div className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                SKILL MATRIX GALAXY
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Technical Stack & Protocols
              </h2>
              <p className="text-xs text-neutral-300">
                Skills are orbiting as 3D geometric polyhedra. Hover or click nodes directly in 3D to inspect.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['React.js', 'Three.js', 'ESP32 MCU', 'Node.js', 'WebSockets', 'MongoDB', 'TypeScript', 'Tailwind'].map((sk) => (
                  <span key={sk} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-neutral-300">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Station 5: Quantum Beacon Contact Card */}
          {currentStation === 5 && (
            <div className="space-y-3">
              <div className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                TRANSMISSION CHANNEL
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Send Direct Dispatch
              </h2>
              <form onSubmit={handleContactSubmit} className="space-y-2 text-xs">
                <input
                  id="hud_name"
                  name="hud_name"
                  aria-label="Your Name"
                  type="text"
                  required
                  placeholder="Your Name"
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
                <input
                  id="hud_email"
                  name="hud_email"
                  aria-label="Your Email"
                  type="email"
                  required
                  placeholder="Your Email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
                <textarea
                  id="hud_message"
                  name="hud_message"
                  aria-label="Message"
                  required
                  rows={2}
                  placeholder="Project inquiry or message..."
                  value={contactData.message}
                  onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  type="submit"
                  disabled={contactStatus === 'transmitting'}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{contactStatus === 'transmitting' ? 'TRANSMITTING...' : 'DISPATCH BEACON'}</span>
                </button>
                {contactStatus === 'sent' && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Packet confirmed! Response expected shortly.</span>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BOTTOM HUD CONTROLS & STATION WARP INDICATOR */}
      {/* ===================================================================== */}
      <footer className="flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
        {/* Previous / Next Station Arrows */}
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
          <button
            type="button"
            disabled={currentStation === 0}
            onClick={() => {
              sound.playClick();
              onSelectStation(Math.max(0, currentStation - 1));
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            title="Warp Previous Station"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-neutral-300 font-bold px-2">
            STATION 0{currentStation} / 05
          </span>

          <button
            type="button"
            disabled={currentStation === 5}
            onClick={() => {
              sound.playClick();
              onSelectStation(Math.min(5, currentStation + 1));
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            title="Warp Next Station"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scroll Helper */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-500 bg-black/60 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">
          <span>[SCROLL WHEEL OR CLICK BUTTONS TO WARP IN 3D]</span>
        </div>

        {/* External Social Profiles */}
        <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-neutral-400">
          <a
            href={PORTFOLIO_DATA.profile.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
          <a
            href={PORTFOLIO_DATA.profile.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="hover:text-white transition-colors"
            aria-label="LinkedIn"
          >
            <LinkedinIcon className="w-4 h-4" />
          </a>
          <a
            href={PORTFOLIO_DATA.profile.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
        </div>
      </footer>
    </div>
  );
};
