import React, { useState } from 'react';
import { Project, UserProfile } from '../types/portfolio';
import { X, Github, Download, Upload, Copy, Check, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  userProfile: UserProfile;
  onImportProjects: (importedProjects: Project[]) => void;
  onResetProjects: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({
  isOpen,
  onClose,
  projects,
  userProfile,
  onImportProjects,
  onResetProjects,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Download projects as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'portfolio-projects.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 2. Import JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportProjects(json);
          setImportStatus(`Successfully imported ${json.length} projects!`);
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          alert('Invalid format: File should contain an array of projects.');
        }
      } catch (err) {
        alert('Could not parse JSON file. Please check formatting.');
      }
    };
    reader.readAsText(file);
  };

  const gitBashSnippet = `# 1. Initialize local Git repository
git init
git add .
git commit -m "feat: complete graphic design & mechanical engineering portfolio"

# 2. Add your GitHub remote repository
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main

# 3. For instant deployment with GitHub Pages:
npm run build`;

  const handleCopySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode('git');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-800 text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                GitHub Deployment & Data Sync
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Put your portfolio on GitHub & sync past project uploads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Quick Action Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Export JSON */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Export Projects JSON</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 font-mono leading-relaxed">
                  Download all {projects.length} uploaded & default projects as <code>portfolio-projects.json</code> to commit directly to your GitHub repo.
                </p>
              </div>
              <button
                onClick={handleExportJSON}
                className="mt-4 w-full py-2 px-3 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors border border-neutral-700 flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON ({projects.length} Projects)</span>
              </button>
            </div>

            {/* Import JSON */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/50 flex flex-col justify-between relative">
              <div>
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Import Projects JSON</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 font-mono leading-relaxed">
                  Load a previously exported <code>portfolio-projects.json</code> to restore your uploaded works on any device.
                </p>
              </div>
              <label className="mt-4 w-full py-2 px-3 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors border border-neutral-700 flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose JSON File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
              {importStatus && (
                <div className="absolute inset-0 bg-neutral-950/90 rounded-xl flex items-center justify-center p-3 text-emerald-400 text-xs font-mono text-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> {importStatus}
                </div>
              )}
            </div>
          </div>

          {/* GitHub Terminal Commands */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                <span>Pushing to GitHub in 3 Steps</span>
              </span>
              <button
                onClick={() => handleCopySnippet(gitBashSnippet)}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                {copiedCode === 'git' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Commands</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto leading-relaxed">
              {gitBashSnippet}
            </pre>
          </div>

          {/* Reset button */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-mono">
              Want to restore factory demo data?
            </span>
            <button
              onClick={() => {
                if (confirm('Reset portfolio to initial seed projects? Any custom uploaded projects will be replaced.')) {
                  onResetProjects();
                  onClose();
                }
              }}
              className="text-xs text-neutral-400 hover:text-red-400 font-mono"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
