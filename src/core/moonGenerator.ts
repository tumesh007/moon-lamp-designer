import * as THREE from 'three';
import { MoonDimensions, MoonStyle, PhotoSettings } from '../types/designer';
import { ProcessedImageData, sampleGridIntensity } from './imageProcessor';
import { getLunarElevation } from './noise';

export type MeshResolution = 'draft' | 'preview' | 'hd' | 'ultra' | 'export';

export interface MoonMeshResult {
  geometry: THREE.BufferGeometry;
  outerVertexCount: number;
  totalTriangleCount: number;
  volumeCm3: number;
  minThicknessMm: number;
  maxThicknessMm: number;
}

/**
 * Procedural Moon Generator
 * Produces a print-ready, 100% watertight, double-shell 2-manifold BufferGeometry.
 */
export function generateMoonGeometry(
  dimensions: MoonDimensions,
  style: MoonStyle,
  photoSettings: PhotoSettings,
  processedImage: ProcessedImageData | null,
  resolution: MeshResolution = 'preview'
): MoonMeshResult {
  const radius = dimensions.diameter / 2;
  const apertureRadius = Math.min(radius * 0.75, Math.max(15, dimensions.apertureDiameter / 2));

  // Determine grid resolution
  let latSegments: number;
  let lonSegments: number;

  switch (resolution) {
    case 'draft':
      latSegments = 40;
      lonSegments = 60;
      break;
    case 'preview':
      latSegments = 100;
      lonSegments = 150;
      break;
    case 'hd':
      latSegments = 130;
      lonSegments = 190;
      break;
    case 'ultra':
      latSegments = 160;
      lonSegments = 240;
      break;
    case 'export':
      latSegments = 180;
      lonSegments = 260;
      break;
    default:
      latSegments = 100;
      lonSegments = 150;
  }

  // Calculate bottom opening cut angle (south pole aperture)
  const sinAperture = Math.min(0.9, apertureRadius / radius);
  const thetaAperture = Math.asin(sinAperture);
  const maxTheta = Math.PI - thetaAperture;

  // Style parameters
  const coverageRad = (dimensions.photoCoverageSpan * Math.PI) / 180;
  const yawOffsetRad = (dimensions.moonOrientation * Math.PI) / 180;

  // Preset adjustments
  let craterDensity = dimensions.craterDensity;
  let surfaceRoughness = dimensions.surfaceRoughness;
  let textureIntensity = dimensions.textureIntensity;

  if (dimensions.preset === 'smooth') {
    craterDensity *= 0.2;
    surfaceRoughness *= 0.1;
    textureIntensity *= 0.2;
  } else if (dimensions.preset === 'detailed' || dimensions.preset === 'premium') {
    craterDensity = Math.min(1.0, craterDensity * 1.3);
    textureIntensity = Math.min(1.0, textureIntensity * 1.2);
  } else if (dimensions.preset === 'minimal') {
    craterDensity *= 0.1;
    textureIntensity *= 0.15;
  }

  const outerRingVerts = latSegments * lonSegments;
  const outerTotal = 1 + outerRingVerts;
  const innerApexIdx = outerTotal;
  const totalVertices = outerTotal * 2;

  const positions = new Float32Array(totalVertices * 3);
  const uvs = new Float32Array(totalVertices * 2);
  const photoUvs = new Float32Array(totalVertices * 2);
  const photoWeights = new Float32Array(totalVertices);
  const thicknesses = new Float32Array(totalVertices);

  let minObservedThickness = 999;
  let maxObservedThickness = 0;

  const getOuterIdx = (i: number, j: number) => {
    if (i === 0) return 0;
    return 1 + (i - 1) * lonSegments + (j % lonSegments);
  };

  const getInnerIdx = (i: number, j: number) => {
    if (i === 0) return innerApexIdx;
    return outerTotal + 1 + (i - 1) * lonSegments + (j % lonSegments);
  };

  // Helper to compute vertex at (theta, phi)
  const evaluateVertex = (
    theta: number,
    phi: number,
    uT: number,
    vT: number,
    outerIdx: number,
    innerIdx: number
  ) => {
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    // Unit sphere normal
    const nx = sinTheta * sinPhi;
    const ny = cosTheta;
    const nz = sinTheta * cosPhi;

    // Photo lithophane mapping
    const photoResult = evaluatePhotoMapping(
      nx, ny, nz,
      style,
      coverageRad,
      photoSettings,
      processedImage
    );

    // Lunar crater procedural elevation (mm)
    const craterElevation = getLunarElevation(
      nx, ny, nz,
      radius,
      craterDensity,
      dimensions.craterSize,
      surfaceRoughness,
      textureIntensity
    );

    // Dampen craters under photo so facial details remain crisp
    const effectiveCrater = craterElevation * (1.0 - photoResult.weight * 0.88);

    // Raised crater rim frame for photo_window style
    let frameRidge = 0;
    if (style === 'photo_window' && photoResult.frameDistance > 0 && photoResult.frameDistance < 0.18) {
      const rimT = photoResult.frameDistance / 0.18;
      frameRidge = Math.sin(rimT * Math.PI) * 1.2;
    }

    // Lithophane thickness calculation:
    // Bright highlights = thinnest (lithoMinThickness, e.g. 0.8mm)
    // Dark shadows = thickest (lithoMaxThickness, e.g. 3.0mm)
    const targetLithoThickness =
      dimensions.lithoMinThickness +
      (1.0 - photoResult.intensity) * (dimensions.lithoMaxThickness - dimensions.lithoMinThickness);

    const effectiveThickness =
      dimensions.baseWallThickness * (1.0 - photoResult.weight) +
      targetLithoThickness * photoResult.weight;

    minObservedThickness = Math.min(minObservedThickness, effectiveThickness);
    maxObservedThickness = Math.max(maxObservedThickness, effectiveThickness);

    // Tactile exterior photo relief on outer surface:
    // User configurable (default 1.6 mm). Gives the STL a distinct, sculpted 3D profile
    // matching the preview in slicers (Bambu Studio / OrcaSlicer) and in real prints.
    const reliefDepth = dimensions.exteriorReliefDepth ?? 1.6;
    const exteriorRelief = photoResult.weight * (photoResult.intensity - 0.5) * reliefDepth;

    const outerR = radius + effectiveCrater + frameRidge + exteriorRelief;
    const innerR = outerR - effectiveThickness;

    // Outer vertex
    const op = outerIdx * 3;
    positions[op] = nx * outerR;
    positions[op + 1] = ny * outerR;
    positions[op + 2] = nz * outerR;

    uvs[outerIdx * 2] = uT;
    uvs[outerIdx * 2 + 1] = vT;
    photoUvs[outerIdx * 2] = photoResult.u;
    photoUvs[outerIdx * 2 + 1] = photoResult.v;
    photoWeights[outerIdx] = photoResult.weight;
    thicknesses[outerIdx] = effectiveThickness;

    // Inner vertex
    const ip = innerIdx * 3;
    positions[ip] = nx * innerR;
    positions[ip + 1] = ny * innerR;
    positions[ip + 2] = nz * innerR;

    uvs[innerIdx * 2] = uT;
    uvs[innerIdx * 2 + 1] = vT;
    photoUvs[innerIdx * 2] = photoResult.u;
    photoUvs[innerIdx * 2 + 1] = photoResult.v;
    photoWeights[innerIdx] = photoResult.weight;
    thicknesses[innerIdx] = effectiveThickness;
  };

  // 1. Apex Vertices (i = 0, north pole theta = 0)
  evaluateVertex(0, 0, 0.5, 0, 0, innerApexIdx);

  // 2. Intermediate and Rim Rings (i = 1 to latSegments)
  for (let i = 1; i <= latSegments; i++) {
    const vT = i / latSegments;
    const theta = vT * maxTheta;

    for (let j = 0; j < lonSegments; j++) {
      const uT = j / lonSegments;
      const rawPhi = uT * Math.PI * 2;
      const phi = rawPhi + yawOffsetRad;

      const oIdx = getOuterIdx(i, j);
      const iIdx = getInnerIdx(i, j);

      evaluateVertex(theta, phi, uT, vT, oIdx, iIdx);
    }
  }

  // 3. Construct Closed 2-Manifold Triangles
  const outerTris = lonSegments + (latSegments - 1) * lonSegments * 2;
  const innerTris = lonSegments + (latSegments - 1) * lonSegments * 2;
  const rimTris = lonSegments * 2;
  const totalTris = outerTris + innerTris + rimTris;

  const indices = new Uint32Array(totalTris * 3);
  let triOffset = 0;

  // Outer Shell:
  for (let j = 0; j < lonSegments; j++) {
    const nextJ = (j + 1) % lonSegments;
    indices[triOffset++] = 0;
    indices[triOffset++] = getOuterIdx(1, j);
    indices[triOffset++] = getOuterIdx(1, nextJ);
  }

  for (let i = 1; i < latSegments; i++) {
    for (let j = 0; j < lonSegments; j++) {
      const a = getOuterIdx(i, j);
      const b = getOuterIdx(i + 1, j);
      const c = getOuterIdx(i + 1, j + 1);
      const d = getOuterIdx(i, j + 1);

      indices[triOffset++] = a;
      indices[triOffset++] = b;
      indices[triOffset++] = d;

      indices[triOffset++] = b;
      indices[triOffset++] = c;
      indices[triOffset++] = d;
    }
  }

  // Inner Shell (Reversed winding for inward normals):
  for (let j = 0; j < lonSegments; j++) {
    const nextJ = (j + 1) % lonSegments;
    indices[triOffset++] = innerApexIdx;
    indices[triOffset++] = getInnerIdx(1, nextJ);
    indices[triOffset++] = getInnerIdx(1, j);
  }

  for (let i = 1; i < latSegments; i++) {
    for (let j = 0; j < lonSegments; j++) {
      const a = getInnerIdx(i, j);
      const b = getInnerIdx(i + 1, j);
      const c = getInnerIdx(i + 1, j + 1);
      const d = getInnerIdx(i, j + 1);

      indices[triOffset++] = a;
      indices[triOffset++] = d;
      indices[triOffset++] = b;

      indices[triOffset++] = b;
      indices[triOffset++] = d;
      indices[triOffset++] = c;
    }
  }

  // Bottom Rim Quad Ring:
  for (let j = 0; j < lonSegments; j++) {
    const o1 = getOuterIdx(latSegments, j);
    const o2 = getOuterIdx(latSegments, j + 1);
    const i1 = getInnerIdx(latSegments, j);
    const i2 = getInnerIdx(latSegments, j + 1);

    indices[triOffset++] = o1;
    indices[triOffset++] = i2;
    indices[triOffset++] = o2;

    indices[triOffset++] = o1;
    indices[triOffset++] = i1;
    indices[triOffset++] = i2;
  }

  // 4. Construct BufferGeometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('aPhotoUv', new THREE.BufferAttribute(photoUvs, 2));
  geometry.setAttribute('aPhotoWeight', new THREE.BufferAttribute(photoWeights, 1));
  geometry.setAttribute('aThickness', new THREE.BufferAttribute(thicknesses, 1));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  geometry.computeVertexNormals();

  const outerRadiusCm = radius / 10;
  const avgThicknessCm = (minObservedThickness + maxObservedThickness) / 20;
  const shellSurfaceArea = 4 * Math.PI * outerRadiusCm * outerRadiusCm * 0.92;
  const volumeCm3 = shellSurfaceArea * avgThicknessCm;

  return {
    geometry,
    outerVertexCount: outerTotal,
    totalTriangleCount: totalTris,
    volumeCm3,
    minThicknessMm: minObservedThickness,
    maxThicknessMm: maxObservedThickness
  };
}

interface PhotoMappingResult {
  weight: number;
  intensity: number;
  frameDistance: number;
  u: number;
  v: number;
}

/**
 * Spherical UV Projection & Lithophane Evaluation
 * Upright V mapping: v=0 (bottom/south) to v=1 (top/north)
 * Horizontal U mapping: u=0 (left/west) to u=1 (right/east)
 */
function evaluatePhotoMapping(
  nx: number,
  ny: number,
  nz: number,
  style: MoonStyle,
  coverageRad: number,
  settings: PhotoSettings,
  processedImage: ProcessedImageData | null
): PhotoMappingResult {
  if (!processedImage || processedImage.intensityGrid.length === 0) {
    return { weight: 0, intensity: 0.5, frameDistance: 0, u: 0.5, v: 0.5 };
  }

  // Spherical angular coordinates relative to front center (+Z)
  const deltaPhi = Math.atan2(nx, nz); // horizontal angle: -PI to PI
  const deltaTheta = Math.asin(Math.max(-1.0, Math.min(1.0, ny))); // vertical latitude: -PI/2 to PI/2
  const cosAngle = Math.max(-1.0, Math.min(1.0, nz));
  const angularDist = Math.acos(cosAngle);

  let weight = 0;
  let intensity = 0.5;
  let frameDist = 0;
  let u = 0.5;
  let v = 0.5;

  switch (style) {
    case 'photo_window': {
      // Circular framed window on front face
      const windowRadius = coverageRad * 0.45;
      u = 0.5 + deltaPhi / (windowRadius * 2.0);
      v = 0.5 + deltaTheta / (windowRadius * 2.0);

      if (angularDist < windowRadius) {
        const normDist = angularDist / windowRadius;
        const edgeFeather = 0.15;
        if (normDist > 1.0 - edgeFeather) {
          const t = (1.0 - normDist) / edgeFeather;
          weight = t * t * (3 - 2 * t);
        } else {
          weight = 1.0;
        }

        intensity = sampleGridIntensity(
          processedImage.intensityGrid,
          processedImage.width,
          processedImage.height,
          u, v
        );
      }
      frameDist = Math.abs(angularDist - windowRadius);
      break;
    }

    case 'half_moon': {
      // Crescent half moon: photo displayed across the illuminated front lobe
      const spanLon = coverageRad * 0.75;
      const spanLat = coverageRad * 0.70;
      u = 0.5 + deltaPhi / spanLon;
      v = 0.5 + deltaTheta / spanLat;

      const normX = (2 * deltaPhi) / spanLon;
      const normY = (2 * deltaTheta) / spanLat;
      const dist = Math.sqrt(normX * normX + normY * normY);

      if (dist < 1.0 && nz > -0.05) {
        weight = Math.cos(dist * Math.PI * 0.5) * Math.max(0.0, Math.min(1.0, (nz + 0.1) * 2.0));
        intensity = sampleGridIntensity(
          processedImage.intensityGrid,
          processedImage.width,
          processedImage.height,
          u, v
        );
      }
      break;
    }

    case 'full_moon_lithophane':
    case 'premium_globe':
    case 'minimal_moon':
    case 'custom':
    default: {
      // Natural spherical panoramic wrap across the front hemisphere
      const spanLon = coverageRad * 0.88;
      const spanLat = coverageRad * 0.75;
      u = 0.5 + deltaPhi / spanLon;
      v = 0.5 + deltaTheta / spanLat;

      const normX = (2 * deltaPhi) / spanLon;
      const normY = (2 * deltaTheta) / spanLat;
      const dist = Math.sqrt(normX * normX + normY * normY);

      if (dist < 1.0) {
        weight = Math.pow(Math.cos(dist * Math.PI * 0.5), 1.2);
        intensity = sampleGridIntensity(
          processedImage.intensityGrid,
          processedImage.width,
          processedImage.height,
          u, v
        );
      }
      break;
    }
  }

  return { weight, intensity, frameDistance: frameDist, u, v };
}
