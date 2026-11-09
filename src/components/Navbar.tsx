import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, FileText, Terminal } from 'lucide-react';
import { sound } from '../utils/sound';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { GithubIcon, LinkedinIcon } from './Icons';

interface NavbarProps {
  onOpenTerminal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTerminal }) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const state = sound.toggleSound();
    setSoundEnabled(state);
  };

  const navLinks = [
    { name: '// 01. HOME', href: '#home' },
    { name: '// 02. ABOUT', href: '#about' },
    { name: '// 03. PROJECTS', href: '#projects' },
    { name: '// 04. IOT LAB', href: '#iot-lab' },
    { name: '// 05. SKILLS', href: '#skills' },
    { name: '// 06. CONTACT', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#08090b]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-xl shadow-black/40'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#home"
          onClick={() => sound.playClick()}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-white/15 flex items-center justify-center font-mono font-bold text-sm text-emerald-400 group-hover:border-emerald-500/50 transition-colors shadow-sm">
            PG
          </div>
          <div>
            <div className="font-mono text-sm font-bold tracking-wider text-white group-hover:text-emerald-400 transition-colors">
              PRASAD GAIKWAD
            </div>
            <div className="font-mono text-[10px] text-neutral-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D // FULL-STACK & IOT</span>
            </div>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="font-mono text-xs text-neutral-400 hover:text-emerald-400 transition-colors tracking-wider"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Utility Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Quick Terminal Launcher */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenTerminal();
            }}
            className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
            title="Open Interactive Terminal"
            aria-label="Open Interactive Terminal"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Sound Mute/Unmute */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                : 'bg-neutral-900 text-neutral-400 border-white/10 hover:text-white'
            }`}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            aria-label={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* GitHub Icon */}
          <a
            href={PORTFOLIO_DATA.profile.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:border-white/25 transition-all"
            aria-label="GitHub Profile"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          {/* LinkedIn Icon */}
          <a
            href={PORTFOLIO_DATA.profile.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:border-white/25 transition-all"
            aria-label="LinkedIn Profile"
          >
            <LinkedinIcon className="w-4 h-4" />
          </a>

          {/* Resume CTA */}
          <a
            href={PORTFOLIO_DATA.profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white font-mono text-xs font-semibold hover:bg-white hover:text-black transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RESUME</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-3 pb-6 bg-[#0c0d11] border-b border-white/10 mt-2 space-y-3 font-mono text-sm">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(false);
              }}
              className="block py-2 text-neutral-300 hover:text-emerald-400 border-b border-white/5"
            >
              {link.name}
            </a>
          ))}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(false);
                onOpenTerminal();
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-neutral-900 border border-white/15 text-xs text-neutral-300 flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>TERMINAL</span>
            </button>

            <a
              href={PORTFOLIO_DATA.profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-semibold text-center"
            >
              VIEW RESUME
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
