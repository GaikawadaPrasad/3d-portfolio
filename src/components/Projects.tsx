import React, { useState } from 'react';
import { ExternalLink, ArrowUpRight, Cpu, Layers, Sparkles } from 'lucide-react';
import { PORTFOLIO_DATA, ProjectItem } from '../data/portfolioData';
import { ProjectModal } from './ProjectModal';
import { sound } from '../utils/sound';
import { GithubIcon } from './Icons';

export const Projects: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const categories = ['All', 'IoT & Hardware', 'Full-Stack', 'Mobile & Hybrid', 'Interactive Web'];

  const filteredProjects = activeCategory === 'All'
    ? PORTFOLIO_DATA.projects
    : PORTFOLIO_DATA.projects.filter((p) => p.category === activeCategory);

  // 3D Card Tilt Effect on Mouse Move
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <section id="projects" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10 relative">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-white/10 font-mono text-xs text-emerald-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>// 03. PRODUCTION & PROTOTYPE REPOSITORY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Featured Projects
          </h2>
          <p className="mt-3 text-neutral-400 text-base sm:text-lg max-w-2xl">
            Selected full-stack software, mobile utilities, and embedded IoT hardware platforms built with performance in mind.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-lg border transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid with 3D Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="group relative rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-white/25 overflow-hidden flex flex-col justify-between transition-transform duration-200 ease-out shadow-xl hover:shadow-2xl hover:shadow-emerald-500/5 backdrop-blur-sm"
            style={{ willChange: 'transform' }}
          >
            {/* Card Preview Image */}
            <div className="relative aspect-video overflow-hidden bg-neutral-950 border-b border-white/10">
              <img
                src={project.images[0]}
                alt={project.title}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-transparent to-transparent opacity-60" />

              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono text-neutral-300">
                  {project.category === 'IoT & Hardware' ? (
                    <Cpu className="w-3 h-3 text-amber-400" />
                  ) : (
                    <Layers className="w-3 h-3 text-emerald-400" />
                  )}
                  <span>{project.badge}</span>
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-1.5">
                  {project.title}
                </h3>
                <p className="text-xs font-mono text-emerald-400/90 mb-3">
                  {project.subtitle}
                </p>
                <p className="text-neutral-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  {project.summary}
                </p>
              </div>

              {/* Technologies */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <div className="flex flex-wrap gap-1.5">
                  {project.techs.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techs.length > 4 && (
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-400">
                      +{project.techs.length - 4}
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedProject(project);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-white hover:text-emerald-400 transition-colors"
                  >
                    <span>INSPECT ARCHITECTURE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sound.playClick()}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="GitHub Repository"
                        aria-label="GitHub Repository"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sound.playClick()}
                        className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="Live Application Demo"
                        aria-label="Live Application Demo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Inspector Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
