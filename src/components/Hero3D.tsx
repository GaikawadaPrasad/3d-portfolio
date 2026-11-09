import React, { useState, useEffect } from 'react';
import { ArrowRight, Cpu, Terminal, ExternalLink, Activity } from 'lucide-react';
import { ThreeScene } from './ThreeScene';
import { sound } from '../utils/sound';
import { PORTFOLIO_DATA } from '../data/portfolioData';

interface Hero3DProps {
  onOpenTerminal: () => void;
}

export const Hero3D: React.FC<Hero3DProps> = ({ onOpenTerminal }) => {
  const fullTitle = 'Full-Stack & Hardware / IoT Developer';
  const [typedTitle, setTypedTitle] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullTitle.length) {
        setTypedTitle(fullTitle.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background ambient radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Info Pill */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-white/10 text-neutral-300 font-mono text-xs mb-6 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-neutral-400">ROLE //</span>
          <span className="text-emerald-400 font-semibold">{typedTitle}</span>
          <span className="terminal-cursor" />
        </div>

        {/* Main Hero Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.1] mb-6">
          Building fast web apps &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
            real-world hardware
          </span>{' '}
          systems.
        </h1>

        {/* Bio Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg text-neutral-400 leading-relaxed mb-8">
          Hi, I'm <strong className="text-white font-medium">Prasad Gaikwad</strong>. I specialize in bridging software and physical electronics: crafting scalable React applications, robust Node backends, and microcontrollers running real-time IoT sensors.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-10">
          <a
            href="#projects"
            onClick={() => sound.playClick()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all shadow-lg shadow-white/5 group"
          >
            <span>Explore Projects</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="#iot-lab"
            onClick={() => sound.playClick()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 border border-white/15 text-neutral-200 font-semibold text-sm hover:bg-neutral-800 hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
          >
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Launch IoT Lab</span>
          </a>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenTerminal();
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900/60 border border-white/10 text-neutral-400 font-mono text-xs hover:text-white hover:border-white/25 transition-all"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Open CLI Terminal</span>
          </button>
        </div>
      </div>

      {/* 3D INTERACTIVE WORKSPACE CANVAS CONTAINER */}
      <div className="relative mb-12">
        <ThreeScene onSelectNode={(node) => console.log('Selected 3D node:', node)} />
      </div>

      {/* Fast Hardware & Engineering Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {PORTFOLIO_DATA.profile.metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-4 sm:p-5 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-neutral-500 text-xs font-mono mb-2">
              <span className="uppercase tracking-wider">{metric.label}</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
