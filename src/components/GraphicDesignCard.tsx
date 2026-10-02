import React, { useState } from 'react';
import { Project } from '../types/portfolio';
import { InteractiveCadCanvas } from './InteractiveCadCanvas';
import { ArrowUpRight, Palette, Layers, Grid } from 'lucide-react';

interface GraphicDesignCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export const GraphicDesignCard: React.FC<GraphicDesignCardProps> = ({
  project,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getSubCategoryLabel = (sub: string) => {
    switch (sub) {
      case 'brand-identity': return 'Brand Identity';
      case 'ui-ux': return 'UI/UX & Digital';
      case 'typography-print': return 'Typography & Print';
      case 'packaging-3d': return 'Packaging & 3D';
      default: return 'Graphic Design';
    }
  };

  return (
    <article
      onClick={() => onSelect(project)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer border border-neutral-800 hover:border-amber-400/50 bg-neutral-900/60 transition-all duration-300 rounded-xl overflow-hidden flex flex-col justify-between"
    >
      {/* Visual Showcase Media */}
      <div className="relative aspect-[16/10] bg-neutral-950 overflow-hidden border-b border-neutral-800/80">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 flex items-center justify-center p-6">
            {/* Visual Swiss Mockup */}
            <div className="w-full h-full border border-neutral-800 rounded p-4 flex flex-col justify-between bg-neutral-950/80 relative">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400">
                  {getSubCategoryLabel(project.subCategory)}
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  SYS / {project.year}
                </span>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tighter text-neutral-200 uppercase font-['Syne',sans-serif]">
                  {project.title.split(' ')[0]}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono mt-1">
                  12-Col Modular Framework
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-800/60">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="text-[9px] font-mono text-neutral-500 ml-auto">
                  {project.tools[0]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Category Label */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono pointer-events-none">
          <div className="text-amber-300 bg-neutral-950/80 px-2 py-0.5 border border-amber-800/40 rounded backdrop-blur-sm">
            {getSubCategoryLabel(project.subCategory)}
          </div>
          <div className="text-neutral-500 bg-neutral-950/80 px-2 py-0.5 border border-neutral-800 rounded backdrop-blur-sm">
            {project.year}
          </div>
        </div>

        {/* Specs Highlights */}
        {project.specs.length > 0 && (
          <div className="absolute bottom-0 inset-x-0 bg-neutral-950/90 backdrop-blur-sm border-t border-neutral-800/60 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="truncate max-w-[150px]">{project.specs[0].label}: <strong className="text-neutral-200">{project.specs[0].value}</strong></span>
            {project.specs[1] && (
              <span className="truncate max-w-[150px] text-right">{project.specs[1].label}: <strong className="text-amber-300">{project.specs[1].value}</strong></span>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Zero-Pill discipline */}
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

          <h3 className="text-lg font-semibold tracking-tight text-white group-hover:text-amber-400 transition-colors flex items-start justify-between gap-2">
            <span>{project.title}</span>
            <ArrowUpRight className="w-4 h-4 shrink-0 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all mt-1" />
          </h3>

          <p className="mt-2 text-sm text-neutral-400 leading-relaxed line-clamp-2">
            {project.tagline}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-500 font-mono text-[11px]">
            <Grid className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">{project.tools.join(' · ')}</span>
          </div>

          <span className="text-[11px] font-mono text-amber-400 group-hover:underline">
            View Case Study →
          </span>
        </div>
      </div>
    </article>
  );
};
