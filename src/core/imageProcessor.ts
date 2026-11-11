import * as THREE from 'three';
import { PhotoSettings, CropShape } from '../types/designer';

export interface ProcessedImageData {
  width: number;
  height: number;
  // Normalized brightness values (0.0 = dark/thick, 1.0 = bright/thin)
  intensityGrid: Float32Array;
  // Canvas data URL for UI preview
  previewUrl: string;
  // Three.js CanvasTexture for ultra high-res per-pixel fragment shader
  texture: THREE.CanvasTexture | null;
}

/**
 * Loads an image from URL or data URI and returns an HTMLImageElement
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = url;
  });
}

/**
 * Processes an input image according to PhotoSettings and returns
 * a normalized intensity grid and high-res Three.js texture.
 */
export async function processLithophaneImage(
  settings: PhotoSettings,
  targetResolution = 512 // 512x512 high-resolution default (4x sharper than 256)
): Promise<ProcessedImageData> {
  if (!settings.imageUrl) {
    const w = targetResolution;
    const h = targetResolution;
    const grid = new Float32Array(w * h).fill(0.5);
    return {
      width: w,
      height: h,
      intensityGrid: grid,
      previewUrl: '',
      texture: null
    };
  }

  const img = await loadImage(settings.imageUrl);
  const canvas = document.createElement('canvas');
  canvas.width = targetResolution;
  canvas.height = targetResolution;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Clear background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((settings.rotation * Math.PI) / 180);

  // Pan offsets in pixels
  const panPxX = (settings.panX / 100) * canvas.width;
  const panPxY = (settings.panY / 100) * canvas.height;
  ctx.translate(panPxX, panPxY);

  // Zoom scale
  const zoom = Math.max(0.2, settings.zoom);
  const aspect = img.width / img.height;

  let drawW = canvas.width * zoom;
  let drawH = canvas.height * zoom;

  if (aspect > 1) {
    drawW = canvas.width * zoom * aspect;
  } else {
    drawH = (canvas.height * zoom) / aspect;
  }

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // Apply crop shape mask
  applyCropMask(ctx, canvas.width, canvas.height, settings.cropShape, settings.feather);

  // Extract pixel buffer
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const totalPixels = canvas.width * canvas.height;
  const intensityGrid = new Float32Array(totalPixels);

  // Contrast & exposure multipliers
  const contrastFactor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));
  const brightnessOffset = settings.brightness * 1.28;
  const exposureFactor = Math.pow(2, settings.exposure / 50);
  const gamma = Math.max(0.3, Math.min(3.0, settings.gamma));

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    let r = data[idx];
    let g = data[idx + 1];
    let b = data[idx + 2];
    const a = data[idx + 3] / 255.0;

    // Perceptual grayscale luminance (Rec. 709)
    let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    lum = lum * exposureFactor;
    lum = lum + brightnessOffset;
    lum = contrastFactor * (lum - 128) + 128;
    lum = Math.max(0, Math.min(255, lum));

    let normLum = Math.pow(lum / 255.0, 1.0 / gamma);
    normLum = normLum * a;

    if (settings.invert) {
      normLum = 1.0 - normLum;
    }

    intensityGrid[i] = Math.max(0.0, Math.min(1.0, normLum));

    // Update canvas preview data for visual feedback & Three.js texture
    const grayVal = Math.round(intensityGrid[i] * 255);
    data[idx] = grayVal;
    data[idx + 1] = grayVal;
    data[idx + 2] = grayVal;
    data[idx + 3] = Math.round(a * 255);
  }

  ctx.putImageData(imageData, 0, 0);

  // Create high-resolution Three.js CanvasTexture for shader
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  return {
    width: canvas.width,
    height: canvas.height,
    intensityGrid,
    previewUrl: canvas.toDataURL('image/png'),
    texture
  };
}

function applyCropMask(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shape: CropShape,
  feather: number
) {
  if (shape === 'square') return;

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const mctx = maskCanvas.getContext('2d')!;

  mctx.fillStyle = '#ffffff';

  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.46;

  if (shape === 'circle') {
    mctx.beginPath();
    mctx.arc(cx, cy, radius, 0, Math.PI * 2);
    mctx.fill();
  } else if (shape === 'portrait') {
    const pw = w * 0.7;
    const ph = h * 0.92;
    const r = Math.round(w * 0.06);
    mctx.beginPath();
    mctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, r);
    mctx.fill();
  } else if (shape === 'landscape') {
    const pw = w * 0.92;
    const ph = h * 0.65;
    const r = Math.round(w * 0.06);
    mctx.beginPath();
    mctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, r);
    mctx.fill();
  }

  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  if (feather > 0.05) {
    ctx.filter = `blur(${Math.round(feather * (w / 32))}px)`;
  }
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.restore();
}

/**
 * Bilinear sampling of the intensity grid with UV coordinates in [0, 1]
 */
export function sampleGridIntensity(
  grid: Float32Array,
  w: number,
  h: number,
  u: number,
  v: number
): number {
  if (u < 0 || u > 1 || v < 0 || v > 1) return 0;

  const x = u * (w - 1);
  const y = v * (h - 1);

  const x0 = Math.floor(x);
  const x1 = Math.min(w - 1, x0 + 1);
  const y0 = Math.floor(y);
  const y1 = Math.min(h - 1, y0 + 1);

  const fx = x - x0;
  const fy = y - y0;

  const v00 = grid[y0 * w + x0];
  const v10 = grid[y0 * w + x1];
  const v01 = grid[y1 * w + x0];
  const v11 = grid[y1 * w + x1];

  const top = v00 * (1 - fx) + v10 * fx;
  const btm = v01 * (1 - fx) + v11 * fx;

  return top * (1 - fy) + btm * fy;
}
