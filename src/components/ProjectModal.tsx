import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Cpu, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProjectItem } from '../data/portfolioData';
import { sound } from '../utils/sound';
import { GithubIcon } from './Icons';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    setActiveImgIndex(0);
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project || typeof document === 'undefined') return null;

  const images = project.images && project.images.length > 0 ? project.images : [];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0d0f14] border border-white/15 rounded-2xl shadow-2xl flex flex-col text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-5 bg-[#0d0f14]/95 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-neutral-400 uppercase tracking-wider">{project.category}</span>
            <span className="text-neutral-600">//</span>
            <span className="text-white font-semibold">{project.title}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Main Gallery Image */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-neutral-950 flex items-center justify-center">
                <img
                  src={images[activeImgIndex]}
                  alt={`${project.title} preview`}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop';
                  }}
                />

                {/* Left/Right Carousel Controls */}
                {images.length > 1 && (
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playHover();
                        setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                      }}
                      className="p-2 rounded-lg bg-black/70 border border-white/20 text-white pointer-events-auto hover:bg-black transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playHover();
                        setActiveImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                      }}
                      className="p-2 rounded-lg bg-black/70 border border-white/20 text-white pointer-events-auto hover:bg-black transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveImgIndex(idx);
                      }}
                      className={`relative w-24 aspect-video rounded-lg overflow-hidden border transition-all shrink-0 ${
                        activeImgIndex === idx
                          ? 'border-emerald-400 ring-1 ring-emerald-400/50 opacity-100'
                          : 'border-white/10 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title & Subtitle */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {project.title}
            </h3>
            <p className="text-emerald-400 font-mono text-sm">
              {project.subtitle}
            </p>
          </div>

          {/* Full Narrative Description */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400 border-b border-white/10 pb-2">
              // ARCHITECTURAL OVERVIEW
            </h4>
            <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
              {project.description}
            </p>
          </div>

          {/* Hardware Specs Section if present */}
          {project.hardwareSpecs && project.hardwareSpecs.length > 0 && (
            <div className="p-5 rounded-xl bg-neutral-950/80 border border-amber-500/20 space-y-3 font-mono text-xs">
              <div className="text-amber-400 font-semibold flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>EMBEDDED HARDWARE ARCHITECTURE</span>
              </div>
              <ul className="space-y-1.5 text-neutral-300">
                {project.hardwareSpecs.map((spec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Features */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400 border-b border-white/10 pb-2">
              // KEY TECHNICAL HIGHLIGHTS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.keyFeatures.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400 border-b border-white/10 pb-2">
              // TECHNOLOGIES & PROTOCOLS
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.techs.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-xs text-neutral-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
              >
                <span>Launch Live Application</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-neutral-200 font-mono text-xs hover:text-white hover:border-emerald-500/40 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                <span>View Source Code</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
