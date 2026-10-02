import React, { useState } from 'react';
import { Project } from '../types/portfolio';
import { InteractiveCadCanvas } from './InteractiveCadCanvas';
import { Compass, Box, ExternalLink, ArrowUpRight, Cpu } from 'lucide-react';

interface EngineeringBlueprintCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export const EngineeringBlueprintCard: React.FC<EngineeringBlueprintCardProps> = ({
  project,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Derive subcategory display label
  const getSubCategoryLabel = (sub: string) => {
    switch (sub) {
      case 'cad-modeling': return 'CAD & Parametric';
      case 'mechanisms-robotics': return 'Robotics & Mechanisms';
      case 'fea-thermal': return 'FEA & Structural';
      case 'prototyping-dfm': return 'Prototyping & DFM';
      default: return 'Mechanical Design';
    }
  };

  return (
    <article
      onClick={() => onSelect(project)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer border border-neutral-800 hover:border-cyan-500/50 bg-neutral-900/60 transition-all duration-300 rounded-xl overflow-hidden flex flex-col justify-between"
    >
      {/* Visual Canvas / Media Header */}
      <div className="relative aspect-[16/10] bg-neutral-950 overflow-hidden border-b border-neutral-800/80">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <InteractiveCadCanvas
            modelType={project.cadModelType || 'gear'}
            interactive={false}
            showBlueprintControls={false}
            className="w-full h-full"
          />
        )}

        {/* Top Overlay Badge / Corner Coordinate */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono pointer-events-none">
          <div className="text-cyan-400 bg-neutral-950/80 px-2 py-0.5 border border-cyan-800/40 rounded backdrop-blur-sm">
            {getSubCategoryLabel(project.subCategory)}
          </div>
          <div className="text-neutral-500 bg-neutral-950/80 px-2 py-0.5 border border-neutral-800 rounded backdrop-blur-sm">
            {project.year}
          </div>
        </div>

        {/* CAD Specs Quick Glance Bar (Bottom of Media) */}
        {project.specs.length > 0 && (
          <div className="absolute bottom-0 inset-x-0 bg-neutral-950/90 backdrop-blur-sm border-t border-neutral-800/60 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="truncate max-w-[150px]">{project.specs[0].label}: <strong className="text-neutral-200">{project.specs[0].value}</strong></span>
            {project.specs[1] && (
              <span className="truncate max-w-[150px] text-right">{project.specs[1].label}: <strong className="text-cyan-300">{project.specs[1].value}</strong></span>
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Zero-Pill discipline */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mb-2">
            <span>{project.clientOrContext}</span>
            <span aria-hidden="true">·</span>
            <span>{project.tools.slice(0, 2).join(', ')}</span>
            {project.isCustomUpload && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400">User Upload</span>
              </>
            )}
          </div>

          {/* Project Title */}
          <h3 className="text-lg font-semibold tracking-tight text-white group-hover:text-cyan-400 transition-colors flex items-start justify-between gap-2">
            <span>{project.title}</span>
            <ArrowUpRight className="w-4 h-4 shrink-0 text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all mt-1" />
          </h3>

          {/* Tagline */}
          <p className="mt-2 text-sm text-neutral-400 leading-relaxed line-clamp-2">
            {project.tagline}
          </p>
        </div>

        {/* Footer Technical Tools */}
        <div className="mt-5 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-500 font-mono text-[11px]">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">{project.tools.join(' · ')}</span>
          </div>

          <span className="text-[11px] font-mono text-cyan-400 group-hover:underline">
            Inspect Blueprint →
          </span>
        </div>
      </div>
    </article>
  );
};
