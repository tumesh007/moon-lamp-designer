import { MoonDimensions, BaseSettings, SlicingEstimates, PrinterSpecs } from '../types/designer';

export const BAMBU_A1_MINI: PrinterSpecs = {
  name: 'Bambu Lab A1 Mini',
  bedWidth: 180,
  bedDepth: 180,
  bedHeight: 180
};

export const BAMBU_P1S: PrinterSpecs = {
  name: 'Bambu Lab P1S / X1C',
  bedWidth: 256,
  bedDepth: 256,
  bedHeight: 256
};

export function calculateSlicingEstimates(
  moonDimensions: MoonDimensions,
  baseSettings: BaseSettings,
  includeDiffuser: boolean,
  moonVolumeCm3: number,
  baseVolumeCm3: number,
  diffuserVolumeCm3: number,
  printer: PrinterSpecs = BAMBU_A1_MINI
): SlicingEstimates {
  const layerHeight = 0.12; // 0.12mm high detail for lithophanes
  const plaDensity = 1.24; // g/cm3

  // Warnings
  const warnings: string[] = [];

  // Dimensions check
  const moonHeight = moonDimensions.diameter;
  const moonWidth = moonDimensions.diameter;
  const baseWidth = baseSettings.diameter;
  const baseHeight = baseSettings.height + 7.0; // including collar

  const maxMoonDim = Math.max(moonWidth, moonHeight);
  const maxBaseDim = Math.max(baseWidth, baseHeight);

  let isExceedingBuildVolume = false;

  if (maxMoonDim > printer.bedWidth - 5) {
    isExceedingBuildVolume = true;
    warnings.push(
      `Moon diameter (${moonDimensions.diameter}mm) exceeds the safe printable area of ${printer.name} (${printer.bedWidth - 5}mm max with brim). Consider reducing diameter to 150mm or smaller.`
    );
  }

  if (maxBaseDim > printer.bedWidth - 5) {
    isExceedingBuildVolume = true;
    warnings.push(
      `Base diameter (${baseSettings.diameter}mm) exceeds ${printer.name} build plate.`
    );
  }

  if (moonDimensions.lithoMinThickness < 0.6) {
    warnings.push(
      `Lithophane minimum thickness (${moonDimensions.lithoMinThickness}mm) is very thin. Recommended minimum is 0.8mm to prevent pinholes.`
    );
  }

  // Weight
  const moonWeight = moonVolumeCm3 * plaDensity;
  const baseWeight = baseVolumeCm3 * plaDensity;
  const diffuserWeight = includeDiffuser ? diffuserVolumeCm3 * plaDensity : 0;
  const totalFilamentGrams = Math.round((moonWeight + baseWeight + diffuserWeight) * 10) / 10;

  // Print Time Calculation
  // Layer counts
  const layerCountMoon = Math.ceil(moonHeight / layerHeight);
  const layerCountBase = Math.ceil(baseHeight / 0.20); // Base prints at 0.20mm layer height

  // Moon print time:
  // For lithophanes, outer perimeter speed is typically 45 mm/s to ensure clean surface.
  // Solid wall perimeter = circumference * perimeters.
  // Average radius = diameter / 2
  const avgCircumferenceMm = Math.PI * (moonDimensions.diameter * 0.85);
  const perimeters = 4;
  const timePerMoonLayerSec = (avgCircumferenceMm * perimeters) / 45 + 3.5; // + travel & layer change
  const moonPrintTimeMinutes = Math.round((layerCountMoon * timePerMoonLayerSec) / 60);

  // Base print time (0.20mm standard speed ~ 80 mm/s)
  const baseCircumferenceMm = Math.PI * baseSettings.diameter;
  const timePerBaseLayerSec = (baseCircumferenceMm * 3) / 75 + 4.0;
  const basePrintTimeMinutes = Math.round((layerCountBase * timePerBaseLayerSec) / 60);

  const totalPrintTimeMinutes = moonPrintTimeMinutes + basePrintTimeMinutes + (includeDiffuser ? 12 : 0);

  return {
    moonVolumeCm3: Math.round(moonVolumeCm3 * 10) / 10,
    baseVolumeCm3: Math.round(baseVolumeCm3 * 10) / 10,
    diffuserVolumeCm3: Math.round(diffuserVolumeCm3 * 10) / 10,
    totalFilamentGrams,
    moonPrintTimeMinutes,
    basePrintTimeMinutes,
    totalPrintTimeMinutes,
    layerCountMoon,
    layerCountBase,
    layerHeight,
    isExceedingBuildVolume,
    warnings
  };
}
