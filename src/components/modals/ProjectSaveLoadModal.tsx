import React, { useState, useEffect } from 'react';
import { ProjectConfig } from '../../types/designer';
import { SAMPLE_PHOTOS } from '../../assets/samplePhotos';
import {
  X,
  Save,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Check,
  FileCode
} from 'lucide-react';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: ProjectConfig;
  onLoadConfig: (config: ProjectConfig) => void;
}

export const ProjectSaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onLoadConfig
}) => {
  const [savedProjects, setSavedProjects] = useState<{ id: string; name: string; date: string; data: ProjectConfig }[]>([]);
  const [projectName, setProjectName] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSavedList();
      setProjectName(currentConfig.name || `Moon Design ${new Date().toLocaleDateString()}`);
    }
  }, [isOpen]);

  const loadSavedList = () => {
    try {
      const stored = localStorage.getItem('moon_lamp_saved_projects');
      if (stored) {
        setSavedProjects(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCurrent = () => {
    const newEntry = {
      id: Date.now().toString(),
      name: projectName.trim() || 'Untitled Moon Lamp',
      date: new Date().toLocaleDateString(),
      data: {
        ...currentConfig,
        name: projectName.trim() || 'Untitled Moon Lamp',
        dateCreated: new Date().toISOString()
      }
    };

    const updated = [newEntry, ...savedProjects];
    setSavedProjects(updated);
    localStorage.setItem('moon_lamp_saved_projects', JSON.stringify(updated));
    setFeedbackMsg('Project saved to browser storage!');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleDelete = (id: string) => {
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem('moon_lamp_saved_projects', JSON.stringify(updated));
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onLoadConfig(parsed);
        onClose();
      } catch (err) {
        alert('Invalid JSON configuration file.');
      }
    };
    reader.readAsText(file);
  };

  const loadSamplePreset = (presetName: string) => {
    let preset: Partial<ProjectConfig> = {};

    if (presetName === 'wedding') {
      preset = {
        name: 'Wedding Anniversary Moon',
        style: 'full_moon_lithophane',
        photo: {
          imageUrl: SAMPLE_PHOTOS[0].dataUrl,
          cropShape: 'circle',
          zoom: 1.0,
          panX: 0,
          panY: 0,
          rotation: 0,
          brightness: 0,
          contrast: 20,
          exposure: 0,
          gamma: 1.0,
          invert: false,
          feather: 0.35
        },
        moon: {
          diameter: 120,
          baseWallThickness: 1.8,
          lithoMinThickness: 0.8,
          lithoMaxThickness: 3.0,
          exteriorReliefDepth: 1.6,
          craterDensity: 0.8,
          craterSize: 1.0,
          surfaceRoughness: 0.5,
          textureIntensity: 0.8,
          photoCoverageSpan: 140,
          moonOrientation: 0,
          preset: 'realistic',
          apertureDiameter: 45
        },
        base: {
          style: 'wooden_cylindrical',
          diameter: 85,
          height: 25,
          textLine1: 'Emma & Alexander',
          textLine2: 'October 14, 2024',
          textLine3: 'To the Moon & Back',
          fontFamily: 'serif',
          embossDepth: 1.2,
          cableOutlet: true,
          cableOutletWidth: 6.5,
          ledOpeningDiameter: 40,
          ledCavityDepth: 15,
          mountingTolerance: 0.4,
          materialFinish: 'walnut'
        },
        lighting: {
          type: 'warm_white',
          color: '#ffd79a',
          brightness: 100,
          diffuserCap: true
        }
      };
    } else if (presetName === 'baby') {
      preset = {
        name: 'Newborn Baby Keepsake',
        style: 'photo_window',
        photo: {
          imageUrl: SAMPLE_PHOTOS[2].dataUrl,
          cropShape: 'circle',
          zoom: 1.0,
          panX: 0,
          panY: 0,
          rotation: 0,
          brightness: 5,
          contrast: 15,
          exposure: 0,
          gamma: 1.05,
          invert: false,
          feather: 0.2
        },
        moon: {
          diameter: 100,
          baseWallThickness: 1.8,
          lithoMinThickness: 0.8,
          lithoMaxThickness: 2.8,
          exteriorReliefDepth: 1.5,
          craterDensity: 0.5,
          craterSize: 0.9,
          surfaceRoughness: 0.3,
          textureIntensity: 0.6,
          photoCoverageSpan: 110,
          moonOrientation: 0,
          preset: 'smooth',
          apertureDiameter: 42
        },
        base: {
          style: 'name_engraved',
          diameter: 75,
          height: 22,
          textLine1: 'Noah James Miller',
          textLine2: 'Born Nov 11, 2026',
          textLine3: 'Our Little Star',
          fontFamily: 'cinzel',
          embossDepth: 1.0,
          cableOutlet: true,
          cableOutletWidth: 6.5,
          ledOpeningDiameter: 38,
          ledCavityDepth: 14,
          mountingTolerance: 0.4,
          materialFinish: 'white_marble'
        },
        lighting: {
          type: 'warm_white',
          color: '#ffedd5',
          brightness: 90,
          diffuserCap: true
        }
      };
    } else if (presetName === 'pet') {
      preset = {
        name: 'Beloved Pet Memorial',
        style: 'half_moon',
        photo: {
          imageUrl: SAMPLE_PHOTOS[1].dataUrl,
          cropShape: 'circle',
          zoom: 1.05,
          panX: 0,
          panY: 0,
          rotation: 0,
          brightness: 0,
          contrast: 25,
          exposure: 0,
          gamma: 1.0,
          invert: false,
          feather: 0.3
        },
        moon: {
          diameter: 110,
          baseWallThickness: 2.0,
          lithoMinThickness: 0.8,
          lithoMaxThickness: 3.2,
          exteriorReliefDepth: 1.8,
          craterDensity: 0.7,
          craterSize: 1.0,
          surfaceRoughness: 0.5,
          textureIntensity: 0.75,
          photoCoverageSpan: 130,
          moonOrientation: 0,
          preset: 'detailed',
          apertureDiameter: 44
        },
        base: {
          style: 'custom_text',
          diameter: 80,
          height: 24,
          textLine1: 'Cooper',
          textLine2: '2014 – 2026',
          textLine3: 'Forever by Our Side',
          fontFamily: 'sans',
          embossDepth: 1.2,
          cableOutlet: true,
          cableOutletWidth: 6.5,
          ledOpeningDiameter: 40,
          ledCavityDepth: 15,
          mountingTolerance: 0.4,
          materialFinish: 'slate_dark'
        },
        lighting: {
          type: 'warm_white',
          color: '#ffd79a',
          brightness: 100,
          diffuserCap: true
        }
      };
    }

    onLoadConfig(preset as ProjectConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-space-900 border border-space-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-space-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Save & Load Moon Lamp Projects</h3>
              <p className="text-xs text-slate-400">
                Store designs in local browser storage, import/export JSON, or load ready presets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Section */}
        <div className="my-4 p-4 bg-space-850 rounded-xl border border-space-800 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Save className="w-4 h-4 text-lunar-gold" /> Save Current Project
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project Name..."
              className="flex-1 px-3 py-2 bg-space-900 border border-space-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lunar-gold"
            />
            <button
              onClick={handleSaveCurrent}
              className="px-4 py-2 bg-lunar-gold text-space-950 font-semibold rounded-lg text-xs hover:bg-amber-300 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
          {feedbackMsg && (
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {feedbackMsg}
            </div>
          )}
        </div>

        {/* Sample Templates (1-Click Presets) */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-lunar-gold" />
            1-Click Sample Designer Projects:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => loadSamplePreset('wedding')}
              className="p-2.5 bg-space-850 hover:bg-space-800 border border-space-800 rounded-xl text-left transition-all"
            >
              <div className="text-xs font-semibold text-white">Wedding Anniversary</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Walnut base & couple silhouette</div>
            </button>
            <button
              onClick={() => loadSamplePreset('baby')}
              className="p-2.5 bg-space-850 hover:bg-space-800 border border-space-800 rounded-xl text-left transition-all"
            >
              <div className="text-xs font-semibold text-white">Newborn Keepsake</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Marble stand & baby portrait</div>
            </button>
            <button
              onClick={() => loadSamplePreset('pet')}
              className="p-2.5 bg-space-850 hover:bg-space-800 border border-space-800 rounded-xl text-left transition-all"
            >
              <div className="text-xs font-semibold text-white">Pet Memorial</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Slate base & dog photo</div>
            </button>
          </div>
        </div>

        {/* Saved Projects in LocalStorage */}
        <div className="mt-4 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Browser Saved Projects ({savedProjects.length})
          </span>
          <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
            {savedProjects.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-space-850/50 rounded-lg text-center">
                No saved projects in this browser yet. Click 'Save' above to store your design.
              </p>
            ) : (
              savedProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 bg-space-850 rounded-lg border border-space-800 text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{p.name}</span>
                    <span className="text-[10px] text-slate-500 ml-2">{p.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onLoadConfig(p.data);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-space-800 hover:bg-space-700 text-lunar-warm rounded text-[11px] font-mono transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Import / Close */}
        <div className="mt-5 pt-4 border-t border-space-800 flex items-center justify-between">
          <label className="cursor-pointer px-3.5 py-2 bg-space-850 hover:bg-space-800 border border-space-700 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Import JSON Config
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-space-800 hover:bg-space-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
