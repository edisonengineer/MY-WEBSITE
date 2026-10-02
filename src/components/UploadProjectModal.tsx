import React, { useState } from 'react';
import { Discipline, SubCategory, Project, ProjectSpec } from '../types/portfolio';
import { X, Upload, Plus, Trash2, Image, Check, Sparkles, Box, FileText } from 'lucide-react';

interface UploadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: Project) => void;
  defaultDiscipline?: Discipline;
  defaultSubCategory?: SubCategory;
}

export const UploadProjectModal: React.FC<UploadProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
  defaultDiscipline = 'engineering',
  defaultSubCategory = 'all',
}) => {
  const [discipline, setDiscipline] = useState<Discipline>(defaultDiscipline);
  const [subCategory, setSubCategory] = useState<SubCategory>(
    defaultSubCategory === 'all'
      ? defaultDiscipline === 'engineering' ? 'cad-modeling' : 'brand-identity'
      : defaultSubCategory
  );
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [clientOrContext, setClientOrContext] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cadModelType, setCadModelType] = useState<'gear' | 'robotic-arm' | 'drone' | 'heat-sink' | 'swiss-poster' | 'brand-guideline' | 'custom'>('gear');
  
  // Tools & Tags
  const [toolInput, setToolInput] = useState('');
  const [tools, setTools] = useState<string[]>(
    discipline === 'engineering' ? ['SolidWorks', 'ANSYS'] : ['Figma', 'Illustrator']
  );
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');

  // Specifications builder
  const [specs, setSpecs] = useState<ProjectSpec[]>([
    { label: discipline === 'engineering' ? 'Material' : 'Grid System', value: discipline === 'engineering' ? 'AL 6061-T6' : '12-Column Modular' },
    { label: discipline === 'engineering' ? 'Tolerance' : 'Typeface', value: discipline === 'engineering' ? '±0.02 mm' : 'Neo-Grotesk Display' },
  ]);

  if (!isOpen) return null;

  // File Upload Reader (Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDisciplineChange = (newDiscipline: Discipline) => {
    setDiscipline(newDiscipline);
    if (newDiscipline === 'engineering') {
      setSubCategory('cad-modeling');
      setCadModelType('gear');
      setTools(['SolidWorks', 'ANSYS']);
      setSpecs([
        { label: 'Material', value: 'AL 7075-T6' },
        { label: 'Tolerances', value: 'ISO 2768-mK' },
      ]);
    } else {
      setSubCategory('brand-identity');
      setCadModelType('brand-guideline');
      setTools(['Figma', 'Illustrator']);
      setSpecs([
        { label: 'Grid System', value: '12-Column Swiss Modular' },
        { label: 'Typography', value: 'Custom Display + Mono' },
      ]);
    }
  };

  const handleAddTool = () => {
    if (toolInput.trim() && !tools.includes(toolInput.trim())) {
      setTools([...tools, toolInput.trim()]);
      setToolInput('');
    }
  };

  const handleRemoveTool = (toolToRemove: string) => {
    setTools(tools.filter((t) => t !== toolToRemove));
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { label: '', value: '' }]);
  };

  const handleSpecChange = (index: number, field: 'label' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      discipline,
      subCategory,
      tagline: tagline.trim() || 'Custom showcase project entry.',
      description: description.trim() || 'Comprehensive engineering and design study documentation.',
      year: year.trim() || '2025',
      clientOrContext: clientOrContext.trim() || (discipline === 'engineering' ? 'Independent CAD Project' : 'Studio Commission'),
      imageUrl: imagePreview || imageUrl || undefined,
      cadModelType,
      tools: tools.length > 0 ? tools : [discipline === 'engineering' ? 'SolidWorks' : 'Figma'],
      tags: tools,
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      githubRepoUrl: githubRepoUrl.trim() || undefined,
      liveUrl: liveUrl.trim() || undefined,
      isCustomUpload: true,
      createdAt: Date.now(),
    };

    onAddProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-400" />
              <span>Upload Past Project</span>
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Add your engineering CAD or graphic design case study to your portfolio
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* 1. Main Discipline Selector */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-2">
              1. Select Primary Discipline *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDisciplineChange('engineering')}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                  discipline === 'engineering'
                    ? 'border-cyan-500 bg-cyan-950/30 text-white'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${discipline === 'engineering' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-neutral-800'}`}>
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Mechanical Engineering</div>
                  <div className="text-xs text-neutral-400 mt-0.5 font-mono">CAD, Robotics, FEA, DFM</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDisciplineChange('graphic-design')}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                  discipline === 'graphic-design'
                    ? 'border-amber-400 bg-amber-950/30 text-white'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${discipline === 'graphic-design' ? 'bg-amber-400/20 text-amber-400' : 'bg-neutral-800'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Graphic Design</div>
                  <div className="text-xs text-neutral-400 mt-0.5 font-mono">Branding, UI/UX, Print, 3D</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Sub-Category Selector */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-2">
              2. Sub-Category Tab *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {discipline === 'engineering' ? (
                <>
                  {[
                    { id: 'cad-modeling', label: 'CAD & Parametric' },
                    { id: 'mechanisms-robotics', label: 'Mechanisms & Robotics' },
                    { id: 'fea-thermal', label: 'FEA & Analysis' },
                    { id: 'prototyping-dfm', label: 'Prototyping & DFM' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSubCategory(sub.id as SubCategory)}
                      className={`px-3 py-2 text-xs font-mono rounded-lg border text-center transition-colors truncate ${
                        subCategory === sub.id
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { id: 'brand-identity', label: 'Brand Identity' },
                    { id: 'ui-ux', label: 'UI/UX & Digital' },
                    { id: 'typography-print', label: 'Typography & Print' },
                    { id: 'packaging-3d', label: 'Packaging & 3D' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSubCategory(sub.id as SubCategory)}
                      className={`px-3 py-2 text-xs font-mono rounded-lg border text-center transition-colors truncate ${
                        subCategory === sub.id
                          ? 'border-amber-400 bg-amber-950/40 text-amber-300 font-semibold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* 3. Title & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={discipline === 'engineering' ? 'e.g. 5-Axis CNC Milling Spindle' : 'e.g. Helvetia Mono Brand System'}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                Year Completed
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Tagline & Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                One-Line Summary / Tagline *
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder={discipline === 'engineering' ? 'High-torque density planetary drive with <1.5 arcmin backlash' : 'Dynamic responsive typography system and publication'}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                Client / Lab / Context
              </label>
              <input
                type="text"
                value={clientOrContext}
                onChange={(e) => setClientOrContext(e.target.value)}
                placeholder="e.g. University Robotics Team / Studio Commission"
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* 4. Project Media / Image Upload & 3D Interactive Model */}
          <div className="space-y-3">
            <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider">
              Project Media / Visual Asset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File upload box */}
              <div className="border border-dashed border-neutral-700 rounded-xl p-4 bg-neutral-950/60 flex flex-col items-center justify-center text-center hover:border-neutral-500 transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {imagePreview ? (
                  <div className="relative w-full aspect-video rounded overflow-hidden">
                    <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                        setImageUrl('');
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/80 rounded-full text-white hover:bg-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Image className="w-8 h-8 text-neutral-500 mb-2" />
                    <span className="text-xs font-medium text-neutral-200">Click or Drag & Drop Image</span>
                    <span className="text-[11px] text-neutral-500 mt-1 font-mono">PNG, JPG, SVG, WebP</span>
                  </>
                )}
              </div>

              {/* Or Model Presets / Web URL */}
              <div className="flex flex-col justify-between space-y-2">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Or Enter Public Image URL:
                  </label>
                  <input
                    type="url"
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://.../project-render.jpg"
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-neutral-950 border border-neutral-800 text-white font-mono placeholder-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Interactive 3D Simulation Preset:
                  </label>
                  <select
                    value={cadModelType}
                    onChange={(e) => setCadModelType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-neutral-950 border border-neutral-800 text-white font-mono"
                  >
                    <option value="gear">Planetary Gear Mechanism (3D CAD)</option>
                    <option value="robotic-arm">6-DOF Robotic Actuator (3D CAD)</option>
                    <option value="drone">Carbon Drone Monocoque (3D CAD)</option>
                    <option value="heat-sink">Topology Fin Heat Sink (3D FEA)</option>
                    <option value="swiss-poster">Swiss 12-Col Typography System (3D Graphic)</option>
                    <option value="brand-guideline">Brand Identity Specification Manual</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Case Study Full Description */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
              Case Study Description / Engineering Report *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the design constraints, kinematic calculations, FEA results, typographic decisions, or manufacturing processes..."
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 6. Tools & Software Used */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
              Tools & Software Used
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTool();
                  }
                }}
                placeholder="e.g. SolidWorks, ANSYS, Figma, InDesign, Blender..."
                className="flex-1 px-3 py-1.5 text-xs rounded bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600"
              />
              <button
                type="button"
                onClick={handleAddTool}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-white rounded"
              >
                Add Tool
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded text-neutral-200"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(t)}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 7. Technical Specifications Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-neutral-300 uppercase tracking-wider">
                Technical Specifications & Tolerances
              </label>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-xs text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Spec Line
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Spec Label (e.g. Reduction Ratio, Material)"
                    value={spec.label}
                    onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 45:1, AL 7075-T6)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-1.5 text-neutral-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 8. External Links (GitHub Repo / Live Demo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                GitHub Repository URL (Optional)
              </label>
              <input
                type="url"
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                placeholder="https://github.com/username/project-repo"
                className="w-full px-3 py-1.5 text-xs rounded bg-neutral-950 border border-neutral-800 text-white font-mono placeholder-neutral-600"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                Live Prototype / Behance / Paper URL
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://figma.com/... or https://behance.net/..."
                className="w-full px-3 py-1.5 text-xs rounded bg-neutral-950 border border-neutral-800 text-white font-mono placeholder-neutral-600"
              />
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-neutral-500">
              * Saved directly into your browser storage and exportable to GitHub.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-2 ${
                  discipline === 'engineering'
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                }`}
              >
                <Check className="w-4 h-4" />
                Upload Project
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
