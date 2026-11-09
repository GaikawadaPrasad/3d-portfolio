import React from 'react';
import { ArrowUp, FileText, Cpu, Terminal } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { GithubIcon, LinkedinIcon, InstagramIcon } from './Icons';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/10 bg-[#060709] py-12 px-4 sm:px-6 lg:px-8 font-mono text-xs text-neutral-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Branding & Tagline */}
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold tracking-wider">
            <span>PRASAD GAIKWAD</span>
            <span className="text-emerald-400">//</span>
            <span className="text-neutral-400 font-normal">3D PORTFOLIO SYSTEM</span>
          </div>
          <p className="text-[11px] text-neutral-500">
            Engineered with Three.js, React, Tailwind CSS, and WebGL hardware physics.
          </p>
        </div>

        {/* Center: System Telemetry */}
        <div className="flex items-center gap-4 text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NODE_ENV: PRODUCTION</span>
          </div>
          <span>|</span>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>ESP32 READY</span>
          </div>
        </div>

        {/* Right: Socials & Back to Top */}
        <div className="flex items-center gap-4">
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

          <button
            type="button"
            onClick={scrollToTop}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5 text-[11px]"
            title="Scroll to Top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>TOP</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
