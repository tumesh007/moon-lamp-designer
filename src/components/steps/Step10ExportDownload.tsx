import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  MoonDimensions,
  BaseSettings,
  LightingSettings,
  MoonStyle,
  PhotoSettings,
  SlicingEstimates
} from '../../types/designer';
import { MeshValidationReport } from '../../core/stlExporter';
import {
  Download,
  FileCode,
  Package,
  Layers,
  Box,
  FileText,
  Printer,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

interface Step10Props {
  style: MoonStyle;
  photoSettings: PhotoSettings;
  moonDimensions: MoonDimensions;
  baseSettings: BaseSettings;
  lightingSettings: LightingSettings;
  slicingEstimates: SlicingEstimates;
  stlData: {
    moonStlBuffer: ArrayBuffer | null;
    baseStlBuffer: ArrayBuffer | null;
    diffuserStlBuffer: ArrayBuffer | null;
    moonReport: MeshValidationReport | null;
    baseReport: MeshValidationReport | null;
  };
  onOpenSlicingModal: () => void;
  onOpenBomModal: () => void;
}

export const Step10ExportDownload: React.FC<Step10Props> = ({
  style,
  photoSettings,
  moonDimensions,
  baseSettings,
  lightingSettings,
  slicingEstimates,
  stlData,
  onOpenSlicingModal,
  onOpenBomModal
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);

  const getBOMText = () => {
    return `======================================================================
CUSTOM MOON LAMP DESIGNER – 3D MANUFACTURING & ASSEMBLY GUIDE
======================================================================
Generated Date: ${new Date().toISOString()}
Moon Style: ${style}
Diameter: ${moonDimensions.diameter} mm
Base Model: ${baseSettings.style} (${baseSettings.diameter}mm x ${baseSettings.height}mm)
Engraving: "${baseSettings.textLine1}" | "${baseSettings.textLine2}" | "${baseSettings.textLine3}"

----------------------------------------------------------------------
1. 3D PRINTED MECHANICAL COMPONENTS (INCLUDED STLS)
----------------------------------------------------------------------
1. Moon Lithophane Shell (1x)
   - Dimensions: ${moonDimensions.diameter}mm diameter
   - Wall Thickness: ${moonDimensions.lithoMinThickness}mm (bright) to ${moonDimensions.lithoMaxThickness}mm (shadow)
   - Estimated Filament: ~${Math.round(slicingEstimates.moonVolumeCm3 * 1.24)}g White PLA
   - Recommended Orientation: Vertical, bottom aperture flat on print bed with 5mm outer brim.

2. Lamp Base Stand (1x)
   - Dimensions: ${baseSettings.diameter}mm dia x ${baseSettings.height + 7}mm total height
   - Cavity: Fits standard 35-45mm LED discs with underside cable routing channel
   - Estimated Filament: ~${Math.round(slicingEstimates.baseVolumeCm3 * 1.24)}g (Wood PLA, Marble, or Black PLA)

3. Snap-In LED Diffuser Dome (1x - Optional)
   - Sits over LED inside collar to eliminate direct diode hotspots.

----------------------------------------------------------------------
2. HARDWARE BILL OF MATERIALS (BOM)
----------------------------------------------------------------------
Item                               Qty   Specs
----------------------------------------------------------------------
5V USB LED Puck Disc               1x    Diameter 35-42mm, 5V 1A USB-A/C
Inline Push Switch / Dimmer Cable  1x    Standard USB 1.5m cable
Silicone Adhesive Bumper Feet      4x    Diameter 8-10mm (for underside base)
CA / Superglue or Slip-fit         1x    Optional fixing for loose tolerances

----------------------------------------------------------------------
3. BAMBU STUDIO / ORCASLICER RECOMMENDATIONS
----------------------------------------------------------------------
- Printer: Bambu Lab A1 Mini (0.4mm nozzle)
- Filament: Bambu Jade White PLA or White Lithophane PLA
- Layer Height: 0.12mm (Extra Fine)
- Wall Loops: 99 (or 100% Infill) - CRITICAL: prevents internal infill shadow grid!
- Outer Wall Speed: 40 - 50 mm/s (for crisp facial highlights)
- Seam Position: Aligned / Back
- Supports: NONE required! The spherical dome and base bridge overhangs naturally.
======================================================================`;
  };

  const downloadMoonSTL = () => {
    if (!stlData.moonStlBuffer) return;
    const blob = new Blob([stlData.moonStlBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Moon_${style}_${moonDimensions.diameter}mm.stl`);
    setDownloadedItem('moon');
  };

  const downloadBaseSTL = () => {
    if (!stlData.baseStlBuffer) return;
    const blob = new Blob([stlData.baseStlBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Base_${baseSettings.style}_${baseSettings.diameter}mm.stl`);
    setDownloadedItem('base');
  };

  const downloadDiffuserSTL = () => {
    if (!stlData.diffuserStlBuffer) return;
    const blob = new Blob([stlData.diffuserStlBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `LED_Diffuser_Dome_${moonDimensions.apertureDiameter}mm.stl`);
    setDownloadedItem('diffuser');
  };

  const downloadConfigJSON = () => {
    const config = {
      project: 'Custom Moon Lamp Designer',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      style,
      photo: photoSettings,
      moon: moonDimensions,
      base: baseSettings,
      lighting: lightingSettings
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    saveAs(blob, `Moon_Lamp_Config_${moonDimensions.diameter}mm.json`);
    setDownloadedItem('json');
  };

  const downloadCompleteZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      if (stlData.moonStlBuffer) {
        zip.file(`Moon_${style}_${moonDimensions.diameter}mm.stl`, stlData.moonStlBuffer);
      }

      if (stlData.baseStlBuffer) {
        zip.file(`Base_${baseSettings.style}_${baseSettings.diameter}mm.stl`, stlData.baseStlBuffer);
      }

      if (stlData.diffuserStlBuffer) {
        zip.file(`LED_Diffuser_Cap_${moonDimensions.apertureDiameter}mm.stl`, stlData.diffuserStlBuffer);
      }

      zip.file('BOM_and_Printing_Guide.txt', getBOMText());

      const config = {
        project: 'Custom Moon Lamp Designer',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        style,
        photo: photoSettings,
        moon: moonDimensions,
        base: baseSettings,
        lighting: lightingSettings
      };
      zip.file('project_config.json', JSON.stringify(config, null, 2));

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `Moon_Lamp_Package_${moonDimensions.diameter}mm.zip`);
      setDownloadedItem('zip');
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Step 10: Download STL Files & Manufacturing Specs
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Export verified binary STL files and comprehensive slicing guides for your 3D printer.
        </p>
      </div>

      {/* Primary ZIP Package Button */}
      <button
        onClick={downloadCompleteZip}
        disabled={isZipping || !stlData.moonStlBuffer}
        className="w-full p-4 bg-gradient-to-r from-lunar-gold via-amber-400 to-lunar-gold text-space-950 font-bold rounded-2xl shadow-[0_0_25px_rgba(245,192,101,0.35)] hover:shadow-[0_0_35px_rgba(245,192,101,0.5)] transition-all flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-space-950/15 flex items-center justify-center">
            <Package className="w-6 h-6 text-space-950 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-base font-bold text-space-950">
              Download Complete 3D Print Package (.zip)
            </div>
            <div className="text-xs text-space-900/80 font-medium">
              Includes Moon STL + Base STL + Diffuser STL + BOM & Slicing Guide
            </div>
          </div>
        </div>
        <div className="px-3.5 py-1.5 bg-space-950 text-lunar-gold rounded-xl font-mono text-xs flex items-center gap-1.5 shadow">
          <Download className="w-4 h-4" />
          {isZipping ? 'Packaging...' : 'Download ZIP'}
        </div>
      </button>

      {/* Individual File Download Cards */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Individual 3D Files:
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* Moon STL */}
          <div className="p-3 bg-space-900/80 border border-space-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Box className="w-4 h-4 text-lunar-gold" />
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Moon_{style}_{moonDimensions.diameter}mm.stl
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {stlData.moonReport?.totalTriangles.toLocaleString()} triangles | Binary mm
                </div>
              </div>
            </div>
            <button
              onClick={downloadMoonSTL}
              disabled={!stlData.moonStlBuffer}
              className="p-2 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Base STL */}
          <div className="p-3 bg-space-900/80 border border-space-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Base_{baseSettings.style}_{baseSettings.diameter}mm.stl
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {stlData.baseReport?.totalTriangles.toLocaleString()} triangles | Cable Tunnel
                </div>
              </div>
            </div>
            <button
              onClick={downloadBaseSTL}
              disabled={!stlData.baseStlBuffer}
              className="p-2 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Diffuser STL */}
          {lightingSettings.diffuserCap && (
            <div className="p-3 bg-space-900/80 border border-space-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">LED_Diffuser_Dome.stl</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Snap-in frosted dome (~3g)
                  </div>
                </div>
              </div>
              <button
                onClick={downloadDiffuserSTL}
                disabled={!stlData.diffuserStlBuffer}
                className="p-2 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Config JSON */}
          <div className="p-3 bg-space-900/80 border border-space-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCode className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Project_Configuration.json</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  All coordinates, sliders & styles
                </div>
              </div>
            </div>
            <button
              onClick={downloadConfigJSON}
              className="p-2 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slicing & BOM Modal Triggers */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={onOpenSlicingModal}
          className="p-3 bg-space-900 hover:bg-space-850 border border-space-700/80 rounded-xl flex items-center gap-2.5 text-left transition-colors"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-xs font-semibold text-slate-200">Bambu Studio Slicing Profile</div>
            <div className="text-[10px] text-slate-400">View exact perimeter & infill settings</div>
          </div>
        </button>

        <button
          onClick={onOpenBomModal}
          className="p-3 bg-space-900 hover:bg-space-850 border border-space-700/80 rounded-xl flex items-center gap-2.5 text-left transition-colors"
        >
          <FileText className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-xs font-semibold text-slate-200">Bill of Materials (BOM)</div>
            <div className="text-[10px] text-slate-400">LED discs, switches & fasteners</div>
          </div>
        </button>
      </div>
    </div>
  );
};
