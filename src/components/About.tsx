import React from 'react';
import { Cpu, Code, Layers, Wifi, Shield, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/sound';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10 relative">
      {/* Section Header */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-white/10 font-mono text-xs text-emerald-400 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>// 02. SYSTEM SPECIFICATIONS & BIO</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          About the Developer
        </h2>
        <p className="mt-3 text-neutral-400 text-base sm:text-lg max-w-3xl">
          Crafting end-to-end digital experiences from the physical microcontroller sensor pins to high-frequency WebSocket streams and responsive React interfaces.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Portrait & Hardware Badges (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-neutral-900 group shadow-xl">
            {/* Portrait Image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-950">
              <img
                src={PORTFOLIO_DATA.profile.avatar}
                alt={PORTFOLIO_DATA.profile.name}
                className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
                onError={(e) => {
                  // Fallback if local image not found
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090b] via-transparent to-transparent opacity-80" />

              {/* Status overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 font-mono text-xs">
                <div className="text-white font-semibold flex items-center justify-between mb-1">
                  <span>{PORTFOLIO_DATA.profile.name}</span>
                  <span className="text-emerald-400">PUNE, IN</span>
                </div>
                <div className="text-neutral-400 text-[11px] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>FULL-STACK & HARDWARE IOT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hardware Spec Card */}
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 font-mono text-xs space-y-3">
            <div className="text-neutral-300 font-semibold flex items-center gap-2 pb-2 border-b border-white/10">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>HARDWARE PLATFORM MATRIX</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-neutral-400 text-[11px]">
              <div><span className="text-neutral-500">SoC:</span> ESP32-WROOM</div>
              <div><span className="text-neutral-500">Clock:</span> 240 MHz Dual-Core</div>
              <div><span className="text-neutral-500">Wireless:</span> Wi-Fi & BLE 4.2</div>
              <div><span className="text-neutral-500">SRAM:</span> 520 KB High-Speed</div>
              <div><span className="text-neutral-500">Telemetry:</span> WebSockets / MQTT</div>
              <div><span className="text-neutral-500">ADC:</span> 12-Bit Multi-Channel</div>
            </div>
          </div>
        </div>

        {/* Right Column: Narrative, Pillars & Real Experience (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Engineering with purpose, precision, and clean architecture.
            </h3>

            <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
              I am a software and hardware developer driven by the ambition to build real systems that work reliably in the wild. Rather than staying confined to virtual web interfaces alone, I bridge physical hardware sensors with modern web technologies to create comprehensive solutions.
            </p>

            <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
              Whether architecting a responsive React and Three.js frontend, creating mobile-first applications with Capacitor, handling high-concurrency event pipes in Socket.io, or coding C++ firmware on ESP32 microcontrollers, I focus on performance, maintainability, and clean code.
            </p>

            {/* Engineering Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                  <Code className="w-4 h-4" />
                  <span>FULL-STACK WEB & APPS</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Fast single-page apps, state management, REST APIs, and native mobile compilation via Capacitor.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold">
                  <Wifi className="w-4 h-4" />
                  <span>EMBEDDED IOT SYSTEMS</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Microcontroller programming, radar and motion sensor fusion, cloud MQTT telemetry, and edge logic.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold">
                  <Layers className="w-4 h-4" />
                  <span>3D WEBGL GRAPHICS</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Interactive procedural 3D environments, custom shader canvas textures, and buttery 60 FPS rendering.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-neutral-300 font-mono text-xs font-semibold">
                  <Shield className="w-4 h-4" />
                  <span>PRACTICAL & RELIABLE</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Built to be used by real people and commercial businesses, tested with defensive fault handling.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={PORTFOLIO_DATA.profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold hover:bg-emerald-500/20 transition-all"
              >
                <span>DOWNLOAD RESUME (PDF)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="#contact"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-mono text-xs hover:bg-white/10 hover:text-white transition-all"
              >
                <span>TRANSMIT MESSAGE</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
