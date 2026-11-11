export type MoonStyle =
  | 'full_moon_lithophane'
  | 'photo_window'
  | 'half_moon'
  | 'premium_globe'
  | 'minimal_moon'
  | 'custom';

export type BaseStyle =
  | 'plain_circular'
  | 'wooden_cylindrical'
  | 'modern_minimalist'
  | 'premium_decorative'
  | 'name_engraved'
  | 'custom_text';

export type LightingType =
  | 'warm_white'
  | 'cool_white'
  | 'rgb'
  | 'rgb_remote'
  | 'usb_puck'
  | 'replaceable_module';

export type SurfacePreset =
  | 'realistic'
  | 'detailed'
  | 'smooth'
  | 'premium'
  | 'minimal'
  | 'custom';

export type CropShape = 'circle' | 'square' | 'portrait' | 'landscape';

export interface PhotoSettings {
  imageUrl: string;
  cropShape: CropShape;
  zoom: number;
  panX: number; // percentage offset -50 to 50
  panY: number; // percentage offset -50 to 50
  rotation: number; // degrees -180 to 180
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  exposure: number; // -100 to 100
  gamma: number; // 0.5 to 2.2
  invert: boolean; // false: dark image = thick wall = dark in lamp
  feather: number; // edge blend 0.0 to 1.0
}

export interface MoonDimensions {
  diameter: number; // 80 - 150 mm
  baseWallThickness: number; // 1.2 - 3.5 mm (default ~2.0 mm)
  lithoMinThickness: number; // 0.8 mm (brightest transmission)
  lithoMaxThickness: number; // 3.0 mm (darkest shadow)
  craterDensity: number; // 0 to 1.0
  craterSize: number; // 0.5 to 2.0
  surfaceRoughness: number; // 0 to 1.0
  textureIntensity: number; // 0 to 1.0
  photoCoverageSpan: number; // coverage angle degrees 60 - 180
  moonOrientation: number; // 0 to 360 degrees
  preset: SurfacePreset;
  apertureDiameter: number; // 35 - 55 mm bottom opening for base collar
}

export interface BaseSettings {
  style: BaseStyle;
  diameter: number; // 60 - 110 mm
  height: number; // 15 - 45 mm
  textLine1: string; // e.g. "Emma & David"
  textLine2: string; // e.g. "October 14, 2024"
  textLine3: string; // e.g. "To the Moon & Back"
  fontFamily: 'sans' | 'serif' | 'script' | 'cinzel';
  embossDepth: number; // 0.6 - 2.0 mm
  cableOutlet: boolean;
  cableOutletWidth: number; // 6.5 mm for standard USB cable
  ledOpeningDiameter: number; // 35 - 45 mm
  ledCavityDepth: number; // 12 - 20 mm
  mountingTolerance: number; // 0.4 mm slip-fit
  materialFinish: 'walnut' | 'oak' | 'slate_dark' | 'white_marble' | 'matte_black';
}

export interface LightingSettings {
  type: LightingType;
  color: string;
  brightness: number; // 0 - 100%
  diffuserCap: boolean; // include printable snap-fit diffuser dome
}

export interface ViewportSettings {
  lightingMode: 'night' | 'day';
  showBase: boolean;
  explodedView: boolean;
  showBed: boolean;
  wireframe: boolean;
  cutaway: boolean;
  autoRotate: boolean;
  cameraPreset: 'front' | 'rear' | 'side' | 'top' | 'iso';
}

export interface PrinterSpecs {
  name: string;
  bedWidth: number; // mm
  bedDepth: number; // mm
  bedHeight: number; // mm
}

export interface SlicingEstimates {
  moonVolumeCm3: number;
  baseVolumeCm3: number;
  diffuserVolumeCm3: number;
  totalFilamentGrams: number;
  moonPrintTimeMinutes: number;
  basePrintTimeMinutes: number;
  totalPrintTimeMinutes: number;
  layerCountMoon: number;
  layerCountBase: number;
  layerHeight: number; // 0.12 mm recommended
  isExceedingBuildVolume: boolean;
  warnings: string[];
}

export interface ProjectConfig {
  version: string;
  name: string;
  dateCreated: string;
  style: MoonStyle;
  photo: PhotoSettings;
  moon: MoonDimensions;
  base: BaseSettings;
  lighting: LightingSettings;
}
