import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  MoonStyle,
  PhotoSettings,
  MoonDimensions,
  BaseSettings,
  LightingSettings,
  ViewportSettings,
  ProjectConfig,
  SlicingEstimates
} from './types/designer';
import { SAMPLE_PHOTOS } from './assets/samplePhotos';
import { processLithophaneImage, ProcessedImageData } from './core/imageProcessor';
import { generateMoonGeometry } from './core/moonGenerator';
import { generateBaseGeometry, generateDiffuserGeometry, loadHelvetikerFont } from './core/baseGenerator';
import { calculateSlicingEstimates } from './core/printValidator';
import { MeshValidationReport } from './core/stlExporter';

import { Header } from './components/Header';
import { StepNavigation } from './components/StepNavigation';
import { Viewer3D } from './components/viewport/Viewer3D';

import { Step1MoonStyle } from './components/steps/Step1MoonStyle';
import { Step2PhotoUpload } from './components/steps/Step2PhotoUpload';
import { Step3PhotoEditor } from './components/steps/Step3PhotoEditor';
import { Step4MoonDimensions } from './components/steps/Step4MoonDimensions';
import { Step5BaseDesign } from './components/steps/Step5BaseDesign';
import { Step6EngravingText } from './components/steps/Step6EngravingText';
import { Step7LightingHardware } from './components/steps/Step7LightingHardware';
import { Step8FinalPreview } from './components/steps/Step8FinalPreview';
import { Step9GenerateSTL } from './components/steps/Step9GenerateSTL';
import { Step10ExportDownload } from './components/steps/Step10ExportDownload';

import { BambuSlicingModal } from './components/modals/BambuSlicingModal';
import { BillOfMaterialsModal } from './components/modals/BillOfMaterialsModal';
import { ProjectSaveLoadModal } from './components/modals/ProjectSaveLoadModal';

export const App: React.FC = () => {
  // Step state (1 to 10)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);

  // Configuration States
  const [projectName, setProjectName] = useState<string>('Custom Moon Lamp');
  const [style, setStyle] = useState<MoonStyle>('full_moon_lithophane');

  const [photoSettings, setPhotoSettings] = useState<PhotoSettings>({
    imageUrl: SAMPLE_PHOTOS[0].dataUrl,
    cropShape: 'circle',
    zoom: 1.0,
    panX: 0,
    panY: 0,
    rotation: 0,
    brightness: 0,
    contrast: 15,
    exposure: 0,
    gamma: 1.0,
    invert: false,
    feather: 0.35
  });

  const [moonDimensions, setMoonDimensions] = useState<MoonDimensions>({
    diameter: 120,
    baseWallThickness: 1.8,
    lithoMinThickness: 0.8,
    lithoMaxThickness: 3.0,
    craterDensity: 0.8,
    craterSize: 1.0,
    surfaceRoughness: 0.5,
    textureIntensity: 0.8,
    photoCoverageSpan: 140,
    moonOrientation: 0,
    preset: 'realistic',
    apertureDiameter: 45
  });

  const [baseSettings, setBaseSettings] = useState<BaseSettings>({
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
  });

  const [lightingSettings, setLightingSettings] = useState<LightingSettings>({
    type: 'warm_white',
    color: '#ffd79a',
    brightness: 100,
    diffuserCap: true
  });

  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    lightingMode: 'night',
    showBase: true,
    explodedView: false,
    showBed: false,
    wireframe: false,
    cutaway: false,
    autoRotate: true,
    cameraPreset: 'front'
  });

  // Quality state for 3D preview
  const [previewQuality, setPreviewQuality] = useState<'hd' | 'ultra'>('hd');

  // Processed Image Data
  const [processedImage, setProcessedImage] = useState<ProcessedImageData | null>(null);

  // BufferGeometries
  const [moonGeometry, setMoonGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [baseGeometry, setBaseGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [diffuserGeometry, setDiffuserGeometry] = useState<THREE.BufferGeometry | null>(null);

  // Volumes for Slicing calculations
  const [moonVolume, setMoonVolume] = useState<number>(45);
  const [baseVolume, setBaseVolume] = useState<number>(38);
  const [diffuserVolume, setDiffuserVolume] = useState<number>(3);

  // Generated STL byte buffers
  const [stlData, setStlData] = useState<{
    moonStlBuffer: ArrayBuffer | null;
    baseStlBuffer: ArrayBuffer | null;
    diffuserStlBuffer: ArrayBuffer | null;
    moonReport: MeshValidationReport | null;
    baseReport: MeshValidationReport | null;
  }>({
    moonStlBuffer: null,
    baseStlBuffer: null,
    diffuserStlBuffer: null,
    moonReport: null,
    baseReport: null
  });

  // Modals state
  const [isSlicingModalOpen, setIsSlicingModalOpen] = useState(false);
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [isSaveLoadModalOpen, setIsSaveLoadModalOpen] = useState(false);

  // 1. Process Image at High Resolution (512px HD / 1024px Ultra)
  useEffect(() => {
    let active = true;
    const targetRes = previewQuality === 'ultra' ? 1024 : 512;
    const timer = setTimeout(() => {
      processLithophaneImage(photoSettings, targetRes)
        .then((res) => {
          if (active) setProcessedImage(res);
        })
        .catch(console.error);
    }, 120);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [photoSettings, previewQuality]);

  // 2. Generate Moon Geometry (High-Definition mesh)
  useEffect(() => {
    try {
      const res = generateMoonGeometry(
        moonDimensions,
        style,
        photoSettings,
        processedImage,
        previewQuality
      );
      setMoonGeometry(res.geometry);
      setMoonVolume(res.volumeCm3);
    } catch (e) {
      console.error('Error generating moon geometry:', e);
    }
  }, [moonDimensions, style, photoSettings, processedImage, previewQuality]);

  // 3. Generate Base Geometry
  useEffect(() => {
    let active = true;
    loadHelvetikerFont()
      .catch(() => null)
      .then((font) => {
        if (!active) return;
        try {
          const res = generateBaseGeometry(baseSettings, moonDimensions, font);
          setBaseGeometry(res.geometry);
          setBaseVolume(res.volumeCm3);
        } catch (e) {
          console.error('Error generating base geometry:', e);
        }
      });

    return () => {
      active = false;
    };
  }, [baseSettings, moonDimensions.apertureDiameter]);

  // 4. Generate Diffuser Geometry
  useEffect(() => {
    if (lightingSettings.diffuserCap) {
      try {
        const res = generateDiffuserGeometry(moonDimensions.apertureDiameter);
        setDiffuserGeometry(res.geometry);
        setDiffuserVolume(res.volumeCm3);
      } catch (e) {
        console.error('Error generating diffuser geometry:', e);
      }
    } else {
      setDiffuserGeometry(null);
      setDiffuserVolume(0);
    }
  }, [lightingSettings.diffuserCap, moonDimensions.apertureDiameter]);

  // Slicing estimates
  const slicingEstimates: SlicingEstimates = useMemo(() => {
    return calculateSlicingEstimates(
      moonDimensions,
      baseSettings,
      lightingSettings.diffuserCap,
      moonVolume,
      baseVolume,
      diffuserVolume
    );
  }, [moonDimensions, baseSettings, lightingSettings.diffuserCap, moonVolume, baseVolume, diffuserVolume]);

  const handleSetStep = (step: number) => {
    setCurrentStep(step);
    if (step > maxReachedStep) {
      setMaxReachedStep(step);
    }
  };

  const currentProjectConfig: ProjectConfig = useMemo(() => {
    return {
      version: '1.0.0',
      name: projectName,
      dateCreated: new Date().toISOString(),
      style,
      photo: photoSettings,
      moon: moonDimensions,
      base: baseSettings,
      lighting: lightingSettings
    };
  }, [projectName, style, photoSettings, moonDimensions, baseSettings, lightingSettings]);

  const handleLoadConfig = (config: ProjectConfig) => {
    if (config.name) setProjectName(config.name);
    if (config.style) setStyle(config.style);
    if (config.photo) setPhotoSettings(config.photo);
    if (config.moon) setMoonDimensions(config.moon);
    if (config.base) setBaseSettings(config.base);
    if (config.lighting) setLightingSettings(config.lighting);
  };

  const handleReset = () => {
    if (confirm('Reset lamp configuration to default?')) {
      setStyle('full_moon_lithophane');
      setPhotoSettings({
        imageUrl: SAMPLE_PHOTOS[0].dataUrl,
        cropShape: 'circle',
        zoom: 1.0,
        panX: 0,
        panY: 0,
        rotation: 0,
        brightness: 0,
        contrast: 15,
        exposure: 0,
        gamma: 1.0,
        invert: false,
        feather: 0.35
      });
      setMoonDimensions({
        diameter: 120,
        baseWallThickness: 1.8,
        lithoMinThickness: 0.8,
        lithoMaxThickness: 3.0,
        craterDensity: 0.8,
        craterSize: 1.0,
        surfaceRoughness: 0.5,
        textureIntensity: 0.8,
        photoCoverageSpan: 140,
        moonOrientation: 0,
        preset: 'realistic',
        apertureDiameter: 45
      });
      setBaseSettings({
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
      });
      setCurrentStep(1);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-space-950 text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        projectName={projectName}
        onOpenSaveLoad={() => setIsSaveLoadModalOpen(true)}
        onOpenSlicing={() => setIsSlicingModalOpen(true)}
        onOpenBom={() => setIsBomModalOpen(true)}
        onReset={handleReset}
      />

      {/* Main Workspace (Split View: 3D Viewport + Configurator Panel) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* 3D Viewport View (Left / Main) */}
        <div className="flex-1 h-[45vh] lg:h-full relative overflow-hidden">
          <Viewer3D
            moonGeometry={moonGeometry}
            baseGeometry={baseGeometry}
            diffuserGeometry={diffuserGeometry}
            moonDimensions={moonDimensions}
            baseSettings={baseSettings}
            lightingSettings={lightingSettings}
            viewportSettings={viewportSettings}
            onUpdateViewport={(patch) =>
              setViewportSettings((prev) => ({ ...prev, ...patch }))
            }
            slicingEstimates={slicingEstimates}
            photoTexture={processedImage?.texture || null}
            previewQuality={previewQuality}
            onUpdateQuality={(q) => setPreviewQuality(q)}
          />
        </div>

        {/* Guided Step Configurator Drawer (Right / Sidebar) */}
        <div className="w-full lg:w-[480px] xl:w-[520px] h-[55vh] lg:h-full bg-space-900 border-t lg:border-t-0 lg:border-l border-space-800 flex flex-col overflow-hidden shadow-2xl z-20">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {currentStep === 1 && (
              <Step1MoonStyle
                currentStyle={style}
                onSelectStyle={(newStyle) => setStyle(newStyle)}
              />
            )}

            {currentStep === 2 && (
              <Step2PhotoUpload
                photoSettings={photoSettings}
                onUpdatePhoto={(patch) =>
                  setPhotoSettings((prev) => ({ ...prev, ...patch }))
                }
              />
            )}

            {currentStep === 3 && (
              <Step3PhotoEditor
                photoSettings={photoSettings}
                onUpdatePhoto={(patch) =>
                  setPhotoSettings((prev) => ({ ...prev, ...patch }))
                }
                processedPreviewUrl={processedImage?.previewUrl || ''}
              />
            )}

            {currentStep === 4 && (
              <Step4MoonDimensions
                moonDimensions={moonDimensions}
                onUpdateDimensions={(patch) =>
                  setMoonDimensions((prev) => ({ ...prev, ...patch }))
                }
              />
            )}

            {currentStep === 5 && (
              <Step5BaseDesign
                baseSettings={baseSettings}
                onUpdateBase={(patch) =>
                  setBaseSettings((prev) => ({ ...prev, ...patch }))
                }
              />
            )}

            {currentStep === 6 && (
              <Step6EngravingText
                baseSettings={baseSettings}
                onUpdateBase={(patch) =>
                  setBaseSettings((prev) => ({ ...prev, ...patch }))
                }
              />
            )}

            {currentStep === 7 && (
              <Step7LightingHardware
                lightingSettings={lightingSettings}
                onUpdateLighting={(patch) =>
                  setLightingSettings((prev) => ({ ...prev, ...patch }))
                }
              />
            )}

            {currentStep === 8 && (
              <Step8FinalPreview
                style={style}
                moonDimensions={moonDimensions}
                baseSettings={baseSettings}
                lightingSettings={lightingSettings}
                slicingEstimates={slicingEstimates}
                viewportSettings={viewportSettings}
                onUpdateViewport={(patch) =>
                  setViewportSettings((prev) => ({ ...prev, ...patch }))
                }
                onProceedToGenerate={() => setCurrentStep(9)}
              />
            )}

            {currentStep === 9 && (
              <Step9GenerateSTL
                style={style}
                photoSettings={photoSettings}
                processedImage={processedImage}
                moonDimensions={moonDimensions}
                baseSettings={baseSettings}
                lightingSettings={lightingSettings}
                onGenerationComplete={(data) => setStlData(data)}
                onProceedToStep10={() => setCurrentStep(10)}
              />
            )}

            {currentStep === 10 && (
              <Step10ExportDownload
                style={style}
                photoSettings={photoSettings}
                moonDimensions={moonDimensions}
                baseSettings={baseSettings}
                lightingSettings={lightingSettings}
                slicingEstimates={slicingEstimates}
                stlData={stlData}
                onOpenSlicingModal={() => setIsSlicingModalOpen(true)}
                onOpenBomModal={() => setIsBomModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Step Navigation Bar */}
      <StepNavigation
        currentStep={currentStep}
        onSetStep={handleSetStep}
        maxReachedStep={maxReachedStep}
      />

      {/* Modals */}
      <BambuSlicingModal
        isOpen={isSlicingModalOpen}
        onClose={() => setIsSlicingModalOpen(false)}
      />

      <BillOfMaterialsModal
        isOpen={isBomModalOpen}
        onClose={() => setIsBomModalOpen(false)}
      />

      <ProjectSaveLoadModal
        isOpen={isSaveLoadModalOpen}
        onClose={() => setIsSaveLoadModalOpen(false)}
        currentConfig={currentProjectConfig}
        onLoadConfig={handleLoadConfig}
      />
    </div>
  );
};

export default App;
