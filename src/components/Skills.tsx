import React, { useState } from 'react';
import { Cpu, Code, Database, Wrench, Search, Zap } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';

export const Skills: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'frontend' | 'backend' | 'hardware' | 'databases' | 'tools'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all', label: 'All Domains' },
    { id: 'frontend', label: 'Frontend & 3D' },
    { id: 'backend', label: 'Backend & APIs' },
    { id: 'hardware', label: 'Hardware & IoT' },
    { id: 'databases', label: 'Databases' },
    { id: 'tools', label: 'Tooling & CI' },
  ];

  const allSkills = [
    ...PORTFOLIO_DATA.skills.frontend.map((s) => ({ ...s, domain: 'Frontend' })),
    ...PORTFOLIO_DATA.skills.backend.map((s) => ({ ...s, domain: 'Backend' })),
    ...PORTFOLIO_DATA.skills.hardware.map((s) => ({ ...s, domain: 'Hardware' })),
    ...PORTFOLIO_DATA.skills.databases.map((s) => ({ ...s, domain: 'Databases' })),
    ...PORTFOLIO_DATA.skills.tools.map((s) => ({ ...s, domain: 'Tools' })),
  ];

  const filteredSkills = allSkills.filter((s) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'frontend' && s.domain === 'Frontend') ||
      (activeTab === 'backend' && s.domain === 'Backend') ||
      (activeTab === 'hardware' && s.domain === 'Hardware') ||
      (activeTab === 'databases' && s.domain === 'Databases') ||
      (activeTab === 'tools' && s.domain === 'Tools');

    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.domain.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <section id="skills" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10 relative">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-white/10 font-mono text-xs text-sky-400 mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>// 05. TECHNICAL CAPABILITIES & TOOLING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Skill Architecture
          </h2>
          <p className="mt-3 text-neutral-400 text-base sm:text-lg max-w-2xl">
            A comprehensive matrix of technical competencies spanning software engineering, physical computing, and real-time streaming protocols.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64 font-mono text-xs">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="skill_search"
            name="skill_search"
            aria-label="Search skills and stack"
            type="text"
            placeholder="Search skill, tag, stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Domain Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8 font-mono text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab(tab.id as typeof activeTab);
            }}
            className={`px-3.5 py-1.5 rounded-lg border transition-all ${
              activeTab === tab.id
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                : 'bg-neutral-900 text-neutral-400 border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => (
          <div
            key={skill.name}
            className="p-4 sm:p-5 rounded-xl bg-neutral-900/60 border border-white/10 hover:border-white/25 transition-all group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                  [{skill.domain}]
                </span>
                <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {skill.name}
                </h4>
              </div>

              <span className="font-mono text-xs text-emerald-400 font-semibold">
                {skill.level}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-700"
                  style={{ width: `${skill.level}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>{skill.tag}</span>
                <span className="text-neutral-500">PRODUCTION</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
