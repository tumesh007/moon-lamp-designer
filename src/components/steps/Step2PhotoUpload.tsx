import React, { useRef, useState } from 'react';
import { PhotoSettings } from '../../types/designer';
import { SAMPLE_PHOTOS } from '../../assets/samplePhotos';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface Step2Props {
  photoSettings: PhotoSettings;
  onUpdatePhoto: (settings: Partial<PhotoSettings>) => void;
}

export const Step2PhotoUpload: React.FC<Step2Props> = ({ photoSettings, onUpdatePhoto }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Please upload a valid JPG, JPEG, PNG or WebP image.');
      return;
    }

    // Validate size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File exceeds 25MB. Please choose an image smaller than 25MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onUpdatePhoto({ imageUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">Step 2: Upload Customer Photograph</h2>
        <p className="text-sm text-slate-400 mt-1">
          Upload any personal portrait, couple photo, wedding picture, or pet memory.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 text-center select-none ${
          dragActive
            ? 'border-lunar-gold bg-lunar-gold/10'
            : photoSettings.imageUrl
            ? 'border-space-600 bg-space-900/60 hover:border-lunar-gold/70'
            : 'border-space-700 bg-space-900/40 hover:border-space-500 hover:bg-space-850/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-space-800 border border-space-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6 text-lunar-gold" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">
              Click to browse or drag & drop photo here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports high-resolution JPG, PNG, and WebP (Up to 25MB)
            </p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Preset Gallery */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-lunar-gold" />
            Or select a sample template:
          </span>
          <span className="text-[11px] text-slate-500">Instant 1-click test</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {SAMPLE_PHOTOS.map((sample) => {
            const isSelected = photoSettings.imageUrl === sample.dataUrl;
            return (
              <div
                key={sample.id}
                onClick={() => onUpdatePhoto({ imageUrl: sample.dataUrl })}
                className={`group relative p-2.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-lunar-gold bg-lunar-gold/15 shadow-[0_0_12px_rgba(245,192,101,0.2)]'
                    : 'border-space-700 bg-space-900/60 hover:border-space-600 hover:bg-space-850'
                }`}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-space-950 border border-space-800 relative">
                  <img
                    src={sample.dataUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-lunar-gold text-space-950 p-1 rounded-full shadow">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="mt-2 text-left">
                  <p className="text-xs font-medium text-slate-200 truncate">{sample.title}</p>
                  <p className="text-[10px] text-slate-400 truncate">{sample.category}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro Printing Tips Card */}
      <div className="p-3.5 bg-space-900/70 border border-space-800 rounded-xl space-y-1.5">
        <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          Tips for Maximum Lithophane Vibrancy
        </h4>
        <ul className="text-[11px] text-slate-400 space-y-1 pl-4 list-disc">
          <li>High contrast photos with clear separation between subject and background print best.</li>
          <li>Evenly lit faces avoid harsh shadows and ensure soft glowing skin tones.</li>
          <li>The engine automatically converts images to grayscale and applies an anti-clipping tone curve.</li>
        </ul>
      </div>
    </div>
  );
};
