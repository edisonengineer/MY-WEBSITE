import React, { useState } from 'react';
import { Project } from '../types/portfolio';
import { InteractiveCadCanvas } from './InteractiveCadCanvas';
import { X, ExternalLink, Github, Trash2, Copy, Check, Compass, Layers, CheckCircle2, Box } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onDeleteProject?: (id: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onDeleteProject,
}) => {
  const [copiedSpec, setCopiedSpec] = useState<string | null>(null);

  if (!project) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSpec(id);
    setTimeout(() => setCopiedSpec(null), 2000);
  };

  const isEngineering = project.discipline === 'engineering';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Bar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 text-xs font-mono rounded border ${
                isEngineering
                  ? 'border-cyan-800/60 bg-cyan-950/40 text-cyan-400'
                  : 'border-amber-800/60 bg-amber-950/40 text-amber-400'
              }`}
            >
              {isEngineering ? 'MECHANICAL CAD & ENGINEERING' : 'GRAPHIC DESIGN & IDENTITY'}
            </span>
            <span className="text-xs font-mono text-neutral-500">
              {project.year} · {project.clientOrContext}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {project.isCustomUpload && onDeleteProject && (
              <button
                onClick={() => {
                  if (confirm('Delete this project from your portfolio?')) {
                    onDeleteProject(project.id);
                    onClose();
                  }
                }}
                title="Delete uploaded project"
                className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Visual: 3D Interactive Canvas or Image */}
          <div className="relative aspect-[16/9] w-full bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800">
            {project.imageUrl ? (
              <img
                src={project.imageUrl}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-neutral-950"
              />
            ) : (
              <InteractiveCadCanvas
                modelType={project.cadModelType || (isEngineering ? 'gear' : 'swiss-poster')}
                interactive={true}
                showBlueprintControls={true}
                className="w-full h-full"
              />
            )}
          </div>

          {/* Title & Tagline */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {project.title}
            </h1>
            <p className="mt-2 text-base text-neutral-300 leading-relaxed">
              {project.tagline}
            </p>
          </div>

          {/* Links Bar (GitHub, Live Preview) */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {project.githubRepoUrl && (
              <a
                href={project.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-100 transition-colors border border-neutral-700"
              >
                <Github className="w-3.5 h-3.5" />
                <span>View CAD / Repo on GitHub</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-100 transition-colors border border-neutral-700"
              >
                <span>Live Case Study / Prototype</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            )}
          </div>

          {/* Deep Case Study Prose */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              {isEngineering ? 'Engineering & Kinematic Overview' : 'Design Strategy & System Overview'}
            </h3>
            <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
              {project.description}
            </div>
          </div>

          {/* Technical Specifications Grid */}
          {project.specs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  {isEngineering ? 'Tolerances, Material & Performance Metrics' : 'System Metrics & Production Specifications'}
                </h3>
                <span className="text-[11px] font-mono text-neutral-500">
                  Click spec to copy
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.specs.map((spec, idx) => {
                  const key = `spec-${idx}`;
                  const isCopied = copiedSpec === key;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleCopy(`${spec.label}: ${spec.value}`, key)}
                      className="cursor-pointer group/spec flex items-center justify-between p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="text-xs text-neutral-500 font-mono truncate">
                          {spec.label}
                        </div>
                        <div className={`text-sm font-mono font-medium truncate ${isEngineering ? 'text-cyan-300' : 'text-amber-300'}`}>
                          {spec.value}
                        </div>
                      </div>
                      <div className="p-1 text-neutral-600 group-hover/spec:text-neutral-300">
                        {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Software & Tools Ecosystem */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Software Pipeline & Methodologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-1 text-xs font-mono bg-neutral-800/80 border border-neutral-700/60 rounded text-neutral-200"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between text-xs font-mono text-neutral-500">
          <span>ID: {project.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
