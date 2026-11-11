import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  MoonDimensions,
  BaseSettings,
  LightingSettings,
  ViewportSettings,
  SlicingEstimates
} from '../../types/designer';
import { createTranslucentMoonMaterial } from './TranslucentMaterial';
import { PrinterBedGuide } from './PrinterBedGuide';
import {
  Sun,
  Moon,
  Layers,
  Box,
  Eye,
  RotateCw,
  Maximize2,
  Minimize2,
  Compass,
  AlertTriangle,
  Sparkles,
  Zap
} from 'lucide-react';

interface Viewer3DProps {
  moonGeometry: THREE.BufferGeometry | null;
  baseGeometry: THREE.BufferGeometry | null;
  diffuserGeometry: THREE.BufferGeometry | null;
  moonDimensions: MoonDimensions;
  baseSettings: BaseSettings;
  lightingSettings: LightingSettings;
  viewportSettings: ViewportSettings;
  onUpdateViewport: (settings: Partial<ViewportSettings>) => void;
  slicingEstimates: SlicingEstimates;
  photoTexture: THREE.Texture | null;
  previewQuality: 'hd' | 'ultra';
  onUpdateQuality: (quality: 'hd' | 'ultra') => void;
}

const SceneContent: React.FC<{
  moonGeometry: THREE.BufferGeometry | null;
  baseGeometry: THREE.BufferGeometry | null;
  diffuserGeometry: THREE.BufferGeometry | null;
  moonDimensions: MoonDimensions;
  baseSettings: BaseSettings;
  lightingSettings: LightingSettings;
  viewportSettings: ViewportSettings;
  photoTexture: THREE.Texture | null;
  controlsRef: React.RefObject<OrbitControlsImpl>;
}> = ({
  moonGeometry,
  baseGeometry,
  diffuserGeometry,
  moonDimensions,
  baseSettings,
  lightingSettings,
  viewportSettings,
  photoTexture,
  controlsRef
}) => {
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const baseMeshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Ultra High-Definition Translucent Lithophane Material
  const moonMaterial = useMemo(() => {
    return createTranslucentMoonMaterial(
      viewportSettings.lightingMode,
      lightingSettings.color,
      lightingSettings.brightness,
      viewportSettings.wireframe,
      photoTexture,
      moonDimensions.lithoMinThickness,
      moonDimensions.lithoMaxThickness,
      moonDimensions.baseWallThickness
    );
  }, [
    viewportSettings.lightingMode,
    lightingSettings.color,
    lightingSettings.brightness,
    viewportSettings.wireframe,
    photoTexture,
    moonDimensions.lithoMinThickness,
    moonDimensions.lithoMaxThickness,
    moonDimensions.baseWallThickness
  ]);

  // Base material
  const baseMaterial = useMemo(() => {
    let color = '#2b1d14'; // walnut
    let roughness = 0.65;
    let metalness = 0.05;

    switch (baseSettings.materialFinish) {
      case 'oak':
        color = '#c29b68';
        roughness = 0.55;
        break;
      case 'slate_dark':
        color = '#1e293b';
        roughness = 0.85;
        break;
      case 'white_marble':
        color = '#f8fafc';
        roughness = 0.35;
        break;
      case 'matte_black':
        color = '#0f172a';
        roughness = 0.7;
        break;
    }

    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      wireframe: viewportSettings.wireframe
    });
  }, [baseSettings.materialFinish, viewportSettings.wireframe]);

  // Diffuser material
  const diffuserMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.9,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85
    });
  }, []);

  // Vertical assembly positions
  const baseH = baseSettings.height;
  const moonR = moonDimensions.diameter / 2;
  const sinAp = (moonDimensions.apertureDiameter / 2) / moonR;
  const cosAp = Math.sqrt(Math.max(0, 1 - sinAp * sinAp));
  const moonRimOffset = moonR * cosAp;

  const normalMoonCenterY = baseH + moonRimOffset;
  const explodedOffset = viewportSettings.explodedView ? 45 : 0;
  const moonCenterY = normalMoonCenterY + explodedOffset;

  // Turntable animation
  useFrame((_, delta) => {
    if (viewportSettings.autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Print Bed Guide (180x180x180 mm) */}
      {viewportSettings.showBed && (
        <PrinterBedGuide
          bedWidth={180}
          bedDepth={180}
          bedHeight={180}
          isExceeded={moonDimensions.diameter > 175 || baseSettings.diameter > 175}
        />
      )}

      {/* Assembly Group */}
      <group position={[0, 0, 0]}>
        {/* Base Mesh */}
        {viewportSettings.showBase && baseGeometry && (
          <mesh
            ref={baseMeshRef}
            geometry={baseGeometry}
            material={baseMaterial}
            position={[0, 0, 0]}
            castShadow
            receiveShadow
          />
        )}

        {/* LED Diffuser Cap */}
        {viewportSettings.showBase && lightingSettings.diffuserCap && diffuserGeometry && (
          <mesh
            geometry={diffuserGeometry}
            material={diffuserMaterial}
            position={[0, baseH + (viewportSettings.explodedView ? 15 : 0), 0]}
          />
        )}

        {/* Moon Lithophane Mesh */}
        {moonGeometry && (
          <mesh
            ref={moonMeshRef}
            geometry={moonGeometry}
            material={moonMaterial}
            position={[0, moonCenterY, 0]}
            castShadow
          />
        )}

        {/* Interior LED Light in Night Mode */}
        {viewportSettings.lightingMode === 'night' && (
          <pointLight
            position={[0, moonCenterY - 8, 0]}
            color={lightingSettings.color}
            intensity={(lightingSettings.brightness / 100) * 3.2}
            distance={moonDimensions.diameter * 2.8}
            decay={2}
          />
        )}
      </group>

      {/* Ambient & Directional Scene Lights */}
      {viewportSettings.lightingMode === 'day' ? (
        <>
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[120, 160, 140]}
            intensity={1.15}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight
            position={[-100, 60, -100]}
            intensity={0.4}
            color="#94a3b8"
          />
        </>
      ) : (
        <ambientLight intensity={0.06} color="#1e293b" />
      )}
    </group>
  );
};

export const Viewer3D: React.FC<Viewer3DProps> = ({
  moonGeometry,
  baseGeometry,
  diffuserGeometry,
  moonDimensions,
  baseSettings,
  lightingSettings,
  viewportSettings,
  onUpdateViewport,
  slicingEstimates,
  photoTexture,
  previewQuality,
  onUpdateQuality
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const setCameraView = (preset: 'front' | 'rear' | 'side' | 'top' | 'iso') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const targetY = baseSettings.height + moonDimensions.diameter / 2;
    const dist = moonDimensions.diameter * 2.0;

    controls.target.set(0, targetY, 0);

    const cam = controls.object;
    if (preset === 'front') {
      cam.position.set(0, targetY, dist);
    } else if (preset === 'rear') {
      cam.position.set(0, targetY, -dist);
    } else if (preset === 'side') {
      cam.position.set(dist, targetY, 0);
    } else if (preset === 'top') {
      cam.position.set(0, targetY + dist, 0.1);
    } else if (preset === 'iso') {
      cam.position.set(dist * 0.75, targetY + dist * 0.6, dist * 0.75);
    }

    controls.update();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-b from-space-950 via-space-900 to-space-950 select-none overflow-hidden"
    >
      {/* High-DPI 3D Canvas with native Retina resolution */}
      <Canvas
        shadows
        dpr={[1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2)]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, baseSettings.height + 40, moonDimensions.diameter * 2.1]}
          fov={42}
          near={1}
          far={1500}
        />
        <OrbitControls
          ref={controlsRef}
          target={[0, baseSettings.height + moonDimensions.diameter * 0.45, 0]}
          minDistance={moonDimensions.diameter * 0.6}
          maxDistance={600}
          enableDamping
          dampingFactor={0.06}
        />
        <SceneContent
          moonGeometry={moonGeometry}
          baseGeometry={baseGeometry}
          diffuserGeometry={diffuserGeometry}
          moonDimensions={moonDimensions}
          baseSettings={baseSettings}
          lightingSettings={lightingSettings}
          viewportSettings={viewportSettings}
          photoTexture={photoTexture}
          controlsRef={controlsRef}
        />
      </Canvas>

      {/* Floating Viewport Controls Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Left: Mode Badge & Resolution Selector */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-space-900/90 backdrop-blur border border-space-700/60 rounded-full shadow-lg text-xs font-medium text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                viewportSettings.lightingMode === 'night'
                  ? 'bg-amber-400 shadow-[0_0_8px_#f5c065]'
                  : 'bg-emerald-400'
              }`}
            />
            {viewportSettings.lightingMode === 'night' ? 'Night Lit Simulation' : 'Day Studio Topography'}
          </div>

          {/* High-Res Quality Switcher */}
          <button
            onClick={() => onUpdateQuality(previewQuality === 'hd' ? 'ultra' : 'hd')}
            title="Toggle HD / Ultra high-resolution preview"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 backdrop-blur border rounded-full text-xs font-mono transition-all ${
              previewQuality === 'ultra'
                ? 'bg-purple-950/90 border-purple-500/60 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-space-900/90 border-space-700/60 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-lunar-gold" />
            <span>{previewQuality === 'ultra' ? 'Ultra HD (1024px)' : 'HD (512px)'}</span>
          </button>

          {slicingEstimates.isExceedingBuildVolume && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/90 backdrop-blur border border-red-500/50 rounded-full shadow-lg text-xs font-medium text-red-200 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Exceeds A1 Mini 180mm Bed
            </div>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 bg-space-900/90 backdrop-blur border border-space-700/60 p-1 rounded-xl shadow-xl pointer-events-auto">
          {/* Day / Night Toggle */}
          <button
            onClick={() =>
              onUpdateViewport({
                lightingMode: viewportSettings.lightingMode === 'night' ? 'day' : 'night'
              })
            }
            title={viewportSettings.lightingMode === 'night' ? 'Switch to Day Light' : 'Switch to Lamp Illumination'}
            className={`p-2 rounded-lg transition-all ${
              viewportSettings.lightingMode === 'night'
                ? 'bg-amber-500/20 text-amber-300 shadow-[inset_0_0_8px_rgba(245,192,101,0.25)]'
                : 'hover:bg-space-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {viewportSettings.lightingMode === 'night' ? (
              <Moon className="w-4 h-4 text-amber-300" />
            ) : (
              <Sun className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Show / Hide Base */}
          <button
            onClick={() => onUpdateViewport({ showBase: !viewportSettings.showBase })}
            title={viewportSettings.showBase ? 'Hide Base' : 'Show Base'}
            className={`p-2 rounded-lg transition-all ${
              viewportSettings.showBase
                ? 'bg-space-700 text-slate-200'
                : 'hover:bg-space-800 text-slate-500'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Exploded Assembly View */}
          <button
            onClick={() => onUpdateViewport({ explodedView: !viewportSettings.explodedView })}
            title={viewportSettings.explodedView ? 'Assemble Parts' : 'Explode Parts View'}
            className={`p-2 rounded-lg transition-all ${
              viewportSettings.explodedView
                ? 'bg-lunar-gold/25 text-lunar-warm shadow-[inset_0_0_8px_rgba(245,192,101,0.3)]'
                : 'hover:bg-space-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-4 h-4" />
          </button>

          {/* Bambu Bed Bounds Toggle */}
          <button
            onClick={() => onUpdateViewport({ showBed: !viewportSettings.showBed })}
            title={viewportSettings.showBed ? 'Hide Print Bed Cage' : 'Show A1 Mini Bed Bounds'}
            className={`p-2 rounded-lg transition-all ${
              viewportSettings.showBed
                ? 'bg-space-700 text-slate-200'
                : 'hover:bg-space-800 text-slate-500'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Turntable Auto-Rotate */}
          <button
            onClick={() => onUpdateViewport({ autoRotate: !viewportSettings.autoRotate })}
            title={viewportSettings.autoRotate ? 'Pause Rotation' : 'Auto Turntable Spin'}
            className={`p-2 rounded-lg transition-all ${
              viewportSettings.autoRotate
                ? 'bg-lunar-gold/20 text-lunar-gold'
                : 'hover:bg-space-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${viewportSettings.autoRotate ? 'animate-spin' : ''}`} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Viewer'}
            className="p-2 rounded-lg hover:bg-space-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Camera Angles Bar at Bottom Left */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-space-900/90 backdrop-blur border border-space-700/60 p-1 rounded-xl shadow-xl pointer-events-auto">
        <span className="flex items-center gap-1 pl-2 pr-1.5 text-[11px] font-mono text-slate-400">
          <Compass className="w-3.5 h-3.5 text-lunar-gold" />
          Camera:
        </span>
        {(['front', 'side', 'rear', 'top', 'iso'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setCameraView(view)}
            className="px-2.5 py-1 text-xs uppercase tracking-wider font-mono rounded-lg hover:bg-space-800 text-slate-300 hover:text-white transition-colors"
          >
            {view}
          </button>
        ))}
      </div>

      {/* Real-time Dimensions & Print Badge Bottom Right */}
      <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-space-900/90 backdrop-blur border border-space-700/60 px-3.5 py-2 rounded-xl shadow-xl font-mono text-xs text-slate-300 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Ø Moon:</span>
          <span className="text-lunar-warm font-semibold">{moonDimensions.diameter} mm</span>
        </div>
        <div className="w-px h-3.5 bg-space-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Filament:</span>
          <span className="text-emerald-400 font-semibold">{slicingEstimates.totalFilamentGrams} g</span>
        </div>
        <div className="w-px h-3.5 bg-space-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Est. Time:</span>
          <span className="text-slate-200">
            {Math.floor(slicingEstimates.totalPrintTimeMinutes / 60)}h{' '}
            {slicingEstimates.totalPrintTimeMinutes % 60}m
          </span>
        </div>
      </div>
    </div>
  );
};
