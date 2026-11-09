import React, { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import confetti from 'canvas-confetti';
import { Send, CheckCircle2, AlertCircle, Mail, MapPin, FileText, Sparkles } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { GithubIcon, LinkedinIcon, InstagramIcon } from './Icons';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'transmitting' | 'delivered' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      emailjs.init(PORTFOLIO_DATA.emailJsConfig.publicKey);
    } catch {
      // Init catch
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_name || !formData.email || !formData.message) return;

    sound.playClick();
    setStatus('transmitting');
    setErrorMsg('');

    emailjs
      .send(
        PORTFOLIO_DATA.emailJsConfig.serviceId,
        PORTFOLIO_DATA.emailJsConfig.templateId,
        {
          name: formData.user_name,
          email: formData.email,
          title: formData.message,
        }
      )
      .then(() => {
        sound.playSuccess();
        setStatus('delivered');
        setFormData({ user_name: '', email: '', message: '' });

        // Trigger celebratory confetti
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#10b981', '#f59e0b', '#38bdf8', '#ffffff'],
        });
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err?.text || 'Network transmission error. Please reach out via email directly.');
      });
  };

  const setPresetMessage = (text: string) => {
    sound.playClick();
    setFormData((prev) => ({ ...prev, message: text }));
  };

  return (
    <section id="contact" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10 relative">
      {/* Section Header */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-white/10 font-mono text-xs text-emerald-400 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>// 06. TRANSMISSION CHANNEL & INQUIRIES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Initiate Transmission
        </h2>
        <p className="mt-3 text-neutral-400 text-base sm:text-lg max-w-2xl">
          Interested in full-stack architecture, embedded IoT engineering, or commercial collaboration? Send a direct dispatch below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Coordinates & Social Signals (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 sm:p-7 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-6">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Direct Coordinates
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <a
                href={`mailto:${PORTFOLIO_DATA.profile.socials.email}`}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/30 text-neutral-300 hover:text-white transition-all group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase">DIRECT DISPATCH</div>
                  <div className="font-semibold">{PORTFOLIO_DATA.profile.socials.email}</div>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5 text-neutral-300">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase">PHYSICAL LOCATION</div>
                  <div className="font-semibold">{PORTFOLIO_DATA.profile.location}</div>
                </div>
              </div>
            </div>

            {/* Social Signal Icons */}
            <div className="pt-4 border-t border-white/10">
              <div className="text-neutral-400 font-mono text-xs uppercase tracking-wider mb-3">
                // EXTERNAL PROFILES
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={PORTFOLIO_DATA.profile.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="p-3 rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:border-emerald-500/40 transition-all"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="w-5 h-5" />
                </a>

                <a
                  href={PORTFOLIO_DATA.profile.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="p-3 rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:border-emerald-500/40 transition-all"
                  aria-label="GitHub"
                >
                  <GithubIcon className="w-5 h-5" />
                </a>

                <a
                  href={PORTFOLIO_DATA.profile.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="p-3 rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:border-emerald-500/40 transition-all"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>

                <a
                  href={PORTFOLIO_DATA.profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="p-3 rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:border-emerald-500/40 transition-all"
                  aria-label="Resume Document"
                >
                  <FileText className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transmission Form & Quick Command Presets (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-6">
            {/* Quick Command Pills */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block">
                QUICK TOPIC PRESETS:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Interested in Full-Stack Web Development',
                  'ESP32 IoT & Hardware Prototype Collaboration',
                  'Consulting / Freelance Inquiry',
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setPresetMessage(txt)}
                    className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 font-mono text-[11px] text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                  >
                    + {txt}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 font-mono text-xs">
                  <label htmlFor="user_name" className="text-neutral-400">IDENTIFIER / NAME *</label>
                  <input
                    id="user_name"
                    name="user_name"
                    type="text"
                    required
                    value={formData.user_name}
                    onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                    placeholder="Ada Lovelace"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <label htmlFor="user_email" className="text-neutral-400">CONTACT EMAIL *</label>
                  <input
                    id="user_email"
                    name="user_email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ada@domain.io"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <label htmlFor="user_message" className="text-neutral-400">TRANSMISSION PAYLOAD / MESSAGE *</label>
                <textarea
                  id="user_message"
                  name="user_message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Outline your project requirements, hardware architecture, or questions..."
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 resize-y"
                />
              </div>

              {/* Status alerts */}
              {status === 'delivered' && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>TRANSMISSION CONFIRMED: Message received by Prasad. Response expected within 24 hours.</span>
                </div>
              )}

              {status === 'error' && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'transmitting'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
                <span>{status === 'transmitting' ? 'TRANSMITTING PACKETS...' : 'DISPATCH MESSAGE'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
