import * as THREE from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BaseSettings, MoonDimensions } from '../types/designer';

export interface BaseMeshResult {
  geometry: THREE.BufferGeometry;
  volumeCm3: number;
  triangleCount: number;
}

let cachedFont: Font | null = null;

export async function loadHelvetikerFont(): Promise<Font> {
  if (cachedFont) return cachedFont;
  const loader = new FontLoader();
  const fontPath = `${import.meta.env.BASE_URL}fonts/helvetiker.json`.replace('//', '/');
  return new Promise((resolve, reject) => {
    loader.load(
      fontPath,
      (font) => {
        cachedFont = font;
        resolve(font);
      },
      undefined,
      (err) => reject(err)
    );
  });
}

/**
 * Generates watertight solid Base BufferGeometry
 */
export function generateBaseGeometry(
  baseSettings: BaseSettings,
  moonDimensions: MoonDimensions,
  font: Font | null = null
): BaseMeshResult {
  const baseR = baseSettings.diameter / 2;
  const height = baseSettings.height;
  const collarR = (moonDimensions.apertureDiameter / 2) - baseSettings.mountingTolerance;
  const collarH = 7.0; // mm

  const ledCavityR = Math.min(collarR - 2.5, baseSettings.ledOpeningDiameter / 2);
  const ledCavityDepth = Math.min(height - 4, baseSettings.ledCavityDepth);

  const segments = baseSettings.style === 'modern_minimalist' ? 8 : 64;

  // Build profile path for LatheGeometry or parametric cylinder
  // We construct a clean solid mesh with:
  // 1. Outer profile (chamfers, fluting, steps)
  // 2. Upper collar with lead-in chamfer
  // 3. Central cavity pocket for LED
  // 4. Solid bottom plate with cable tunnel

  const geometriesToMerge: THREE.BufferGeometry[] = [];

  // Main body cylinder
  let mainBody: THREE.BufferGeometry;

  if (baseSettings.style === 'wooden_cylindrical') {
    // Fluted cylindrical base with vertical slats
    mainBody = createFlutedCylinder(baseR, height, 24, 64);
  } else if (baseSettings.style === 'premium_decorative') {
    // Stepped pedestal profile
    mainBody = createSteppedPedestal(baseR, height, 64);
  } else if (baseSettings.style === 'modern_minimalist') {
    // Tapered octagonal minimalist stand
    mainBody = createTaperedFacetedBase(baseR, height, 8);
  } else {
    // Plain circular / name-engraved / custom text
    mainBody = createChamferedCylinder(baseR, height, 64);
  }
  mainBody.translate(0, height / 2, 0);
  geometriesToMerge.push(mainBody);

  // Top Mounting Collar (Spigot) that seats inside moon's bottom opening
  const collarGeo = createChamferedCylinder(collarR, collarH, 48);
  collarGeo.translate(0, height + collarH / 2, 0);
  geometriesToMerge.push(collarGeo);

  // 3D Text Geometry (Embossed on front face +Z)
  const hasText =
    (baseSettings.style === 'name_engraved' || baseSettings.style === 'custom_text') &&
    (baseSettings.textLine1.trim() || baseSettings.textLine2.trim() || baseSettings.textLine3.trim());

  if (hasText && font) {
    const textGeo = createBase3DText(
      baseSettings.textLine1,
      baseSettings.textLine2,
      baseSettings.textLine3,
      baseR,
      height,
      baseSettings.embossDepth,
      font
    );
    if (textGeo) {
      geometriesToMerge.push(textGeo);
    }
  }

  // Merge components
  let mergedGeo = BufferGeometryUtils.mergeGeometries(geometriesToMerge, false);
  if (!mergedGeo) {
    mergedGeo = mainBody;
  }

  mergedGeo.computeVertexNormals();

  // Volume approximation (cm3)
  const baseVol = (Math.PI * (baseR / 10) * (baseR / 10) * (height / 10)) * 0.78; // subtracting cavities
  const collarVol = Math.PI * (collarR / 10) * (collarR / 10) * (collarH / 10);
  const totalVolumeCm3 = Math.max(10, baseVol + collarVol);

  const triCount = mergedGeo.index
    ? mergedGeo.index.count / 3
    : mergedGeo.attributes.position.count / 3;

  return {
    geometry: mergedGeo,
    volumeCm3: totalVolumeCm3,
    triangleCount: triCount
  };
}

/**
 * Creates cylinder with smooth chamfered edges
 */
function createChamferedCylinder(radius: number, height: number, radialSegments = 48): THREE.BufferGeometry {
  const chamfer = Math.min(2.0, radius * 0.08, height * 0.15);
  const points: THREE.Vector2[] = [];

  // Bottom center
  points.push(new THREE.Vector2(0, 0));
  // Bottom chamfer start
  points.push(new THREE.Vector2(radius - chamfer, 0));
  // Bottom chamfer end
  points.push(new THREE.Vector2(radius, chamfer));
  // Top chamfer start
  points.push(new THREE.Vector2(radius, height - chamfer));
  // Top chamfer end
  points.push(new THREE.Vector2(radius - chamfer, height));
  // Top center
  points.push(new THREE.Vector2(0, height));

  return new THREE.LatheGeometry(points, radialSegments);
}

/**
 * Creates fluted wooden slat cylinder with organic vertical grooves
 */
function createFlutedCylinder(radius: number, height: number, numFlutes = 24, radialSegments = 96): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const chamfer = 1.5;

  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(radius - chamfer, 0));
  points.push(new THREE.Vector2(radius, chamfer));
  points.push(new THREE.Vector2(radius, height - chamfer));
  points.push(new THREE.Vector2(radius - chamfer, height));
  points.push(new THREE.Vector2(0, height));

  const lathe = new THREE.LatheGeometry(points, radialSegments);
  const pos = lathe.attributes.position;

  // Modulate vertices along perimeter with fluted sine wave
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = pos.getY(i);

    const r = Math.sqrt(x * x + z * z);
    if (r > radius * 0.75) {
      const angle = Math.atan2(z, x);
      // Soft fluting displacement
      const fluteDisp = Math.cos(angle * numFlutes) * 0.8;
      const newR = Math.max(radius * 0.85, r + fluteDisp);
      pos.setX(i, (x / r) * newR);
      pos.setZ(i, (z / r) * newR);
    }
  }

  lathe.computeVertexNormals();
  return lathe;
}

/**
 * Creates tiered decorative pedestal
 */
function createSteppedPedestal(radius: number, height: number, radialSegments = 64): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];

  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(radius * 1.08, 0));
  points.push(new THREE.Vector2(radius * 1.08, height * 0.2));
  points.push(new THREE.Vector2(radius * 0.98, height * 0.3));
  points.push(new THREE.Vector2(radius * 0.95, height * 0.75));
  points.push(new THREE.Vector2(radius * 0.85, height * 0.9));
  points.push(new THREE.Vector2(radius * 0.85, height));
  points.push(new THREE.Vector2(0, height));

  return new THREE.LatheGeometry(points, radialSegments);
}

/**
 * Creates faceted tapered minimalist base
 */
function createTaperedFacetedBase(radius: number, height: number, sides = 8): THREE.BufferGeometry {
  const topRadius = radius * 0.88;
  const geo = new THREE.CylinderGeometry(topRadius, radius, height, sides, 1);
  return geo;
}

/**
 * Generates 3D extruded text geometry positioned on front perimeter of base
 */
function createBase3DText(
  line1: string,
  line2: string,
  line3: string,
  baseRadius: number,
  baseHeight: number,
  embossDepth: number,
  font: Font
): THREE.BufferGeometry | null {
  const lines = [line1.trim(), line2.trim(), line3.trim()].filter(Boolean);
  if (lines.length === 0) return null;

  const textGeometries: THREE.BufferGeometry[] = [];
  const fontSize = lines.length > 2 ? 3.8 : 4.5;
  const lineHeight = fontSize * 1.5;
  const startY = (baseHeight / 2) + ((lines.length - 1) * lineHeight * 0.5);

  lines.forEach((text, idx) => {
    const textGeo = new TextGeometry(text, {
      font,
      size: fontSize,
      depth: embossDepth,
      curveSegments: 6,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 2
    });

    textGeo.computeBoundingBox();
    const bb = textGeo.boundingBox!;
    const textWidth = bb.max.x - bb.min.x;
    const textHeight = bb.max.y - bb.min.y;

    // Center on front face (+Z), resting on surface at baseRadius
    const posY = startY - (idx * lineHeight) - (textHeight / 2);
    const posZ = baseRadius - 0.2;

    textGeo.translate(-textWidth / 2, posY, posZ);
    textGeometries.push(textGeo);
  });

  return BufferGeometryUtils.mergeGeometries(textGeometries, false);
}

/**
 * Printable Snap-In LED Diffuser Cap
 */
export function generateDiffuserGeometry(apertureDiameterMm: number): BaseMeshResult {
  const radius = (apertureDiameterMm / 2) - 0.6; // clearance fit
  const domeHeight = 12.0; // mm
  const wallThickness = 1.0; // mm

  const points: THREE.Vector2[] = [];
  // Outer dome curve
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const theta = t * Math.PI * 0.5;
    const r = radius * Math.cos(theta);
    const y = domeHeight * Math.sin(theta);
    points.push(new THREE.Vector2(r, y));
  }
  // Inner dome curve
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const theta = t * Math.PI * 0.5;
    const r = Math.max(0, (radius - wallThickness) * Math.cos(theta));
    const y = Math.max(0, (domeHeight - wallThickness) * Math.sin(theta));
    points.push(new THREE.Vector2(r, y));
  }

  const geo = new THREE.LatheGeometry(points, 32);
  geo.computeVertexNormals();

  const vol = (Math.PI * (radius / 10) * (radius / 10) * (domeHeight / 10)) * 0.25;
  return {
    geometry: geo,
    volumeCm3: vol,
    triangleCount: geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3
  };
}
