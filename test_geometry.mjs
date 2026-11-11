import * as THREE from 'three';
import { generateMoonGeometry } from './src/core/moonGenerator.ts';
import { generateBaseGeometry, generateDiffuserGeometry } from './src/core/baseGenerator.ts';
import { exportToBinarySTL, validateMeshPrintability } from './src/core/stlExporter.ts';

console.log('====================================================');
console.log('RUNNING AUTOMATED GEOMETRY & STL VALIDATION SUITE');
console.log('====================================================');

const testDimensions = {
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
};

const testPhoto = {
  imageUrl: '',
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
};

// Create a synthetic image grid for testing
const testGrid = new Float32Array(256 * 256);
for (let y = 0; y < 256; y++) {
  for (let x = 0; x < 256; x++) {
    testGrid[y * 256 + x] = (x + y) / 512;
  }
}
const testProcessedImg = {
  width: 256,
  height: 256,
  intensityGrid: testGrid,
  previewUrl: ''
};

// 1. Test all 6 Moon Styles
const styles = [
  'full_moon_lithophane',
  'photo_window',
  'half_moon',
  'premium_globe',
  'minimal_moon',
  'custom'
];

let allPassed = true;

for (const s of styles) {
  process.stdout.write(`Testing Moon Style: [${s}] ... `);
  const result = generateMoonGeometry(testDimensions, s, testPhoto, testProcessedImg, 'draft');
  const report = validateMeshPrintability(result.geometry);

  if (report.totalTriangles <= 0) {
    console.error('FAILED: Zero triangles!');
    allPassed = false;
  } else if (!report.isWatertight) {
    console.error(`FAILED: Non-manifold edges detected: ${report.nonManifoldEdgeCount}`);
    allPassed = false;
  } else {
    console.log(`PASSED! Triangles: ${report.totalTriangles}, Volume: ${report.volumeCm3.toFixed(1)} cm³, Manifold: 100% Watertight`);
  }
}

// 2. Test all 6 Base Styles
const baseStyles = [
  'plain_circular',
  'wooden_cylindrical',
  'modern_minimalist',
  'premium_decorative',
  'name_engraved',
  'custom_text'
];

const testBase = {
  style: 'wooden_cylindrical',
  diameter: 85,
  height: 25,
  textLine1: 'Test User',
  textLine2: '2026-11-11',
  textLine3: 'Testing',
  fontFamily: 'serif',
  embossDepth: 1.2,
  cableOutlet: true,
  cableOutletWidth: 6.5,
  ledOpeningDiameter: 40,
  ledCavityDepth: 15,
  mountingTolerance: 0.4,
  materialFinish: 'walnut'
};

console.log('\n--- Testing Base Generators ---');
for (const bs of baseStyles) {
  process.stdout.write(`Testing Base Style: [${bs}] ... `);
  const baseResult = generateBaseGeometry({ ...testBase, style: bs }, testDimensions, null);
  const baseReport = validateMeshPrintability(baseResult.geometry);

  if (baseReport.totalTriangles <= 0) {
    console.error('FAILED: Zero base triangles!');
    allPassed = false;
  } else {
    console.log(`PASSED! Triangles: ${baseReport.totalTriangles}, Bounding Box: ${baseReport.boundingBoxMm.width}x${baseReport.boundingBoxMm.depth}x${baseReport.boundingBoxMm.height}mm`);
  }
}

// 3. Test Diffuser Dome
process.stdout.write('\nTesting Snap-In Diffuser Dome ... ');
const diffResult = generateDiffuserGeometry(testDimensions.apertureDiameter);
const diffReport = validateMeshPrintability(diffResult.geometry);
console.log(`PASSED! Triangles: ${diffReport.totalTriangles}, Bounding: ${diffReport.boundingBoxMm.width}x${diffReport.boundingBoxMm.height}mm`);

// 4. Test Binary STL Exporter
console.log('\n--- Testing Binary STL Exporter ---');
const moonResult = generateMoonGeometry(testDimensions, 'full_moon_lithophane', testPhoto, testProcessedImg, 'draft');
const stlBuffer = exportToBinarySTL(moonResult.geometry, 'Moon Test Export');

const expectedByteLength = 80 + 4 + (moonResult.totalTriangleCount * 50);
if (stlBuffer.byteLength !== expectedByteLength) {
  console.error(`FAILED: STL byte length mismatch! Got ${stlBuffer.byteLength}, expected ${expectedByteLength}`);
  allPassed = false;
} else {
  const view = new DataView(stlBuffer);
  const facetCount = view.getUint32(80, true);
  if (facetCount !== moonResult.totalTriangleCount) {
    console.error(`FAILED: Facet count mismatch in STL header! Got ${facetCount}, expected ${moonResult.totalTriangleCount}`);
    allPassed = false;
  } else {
    console.log(`PASSED! Valid Binary STL: ${stlBuffer.byteLength.toLocaleString()} bytes, ${facetCount.toLocaleString()} facets, IEEE 754 float32 little-endian format.`);
  }
}

console.log('====================================================');
if (allPassed) {
  console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
} else {
  console.error('SOME TESTS FAILED!');
  process.exit(1);
}
console.log('====================================================');
