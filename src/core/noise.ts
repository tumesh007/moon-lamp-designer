// Fast 3D Simplex Noise & Procedural Crater Synthesizer
// Pure TypeScript, self-contained for web workers and main thread

export class SimplexNoise {
  private perm: Uint8Array;
  private permMod12: Uint8Array;

  constructor(seed = 1337) {
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;

    // LCG PRNG for reproducible seed
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const r = s % (i + 1);
      const tmp = p[i];
      p[i] = p[r];
      p[r] = tmp;
    }

    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  private static grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ];

  public noise3D(xin: number, yin: number, zin: number): number {
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;

    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;

    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;

    let i1: number, j1: number, k1: number;
    let i2: number, j2: number, k2: number;

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
      } else {
        i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
      } else if (x0 < z0) {
        i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
      } else {
        i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    let n0 = 0.0, n1 = 0.0, n2 = 0.0, n3 = 0.0;

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 > 0) {
      t0 *= t0;
      const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
      const g0 = SimplexNoise.grad3[gi0];
      n0 = t0 * t0 * (g0[0] * x0 + g0[1] * y0 + g0[2] * z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 > 0) {
      t1 *= t1;
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
      const g1 = SimplexNoise.grad3[gi1];
      n1 = t1 * t1 * (g1[0] * x1 + g1[1] * y1 + g1[2] * z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 > 0) {
      t2 *= t2;
      const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
      const g2 = SimplexNoise.grad3[gi2];
      n2 = t2 * t2 * (g2[0] * x2 + g2[1] * y2 + g2[2] * z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 > 0) {
      t3 *= t3;
      const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];
      const g3 = SimplexNoise.grad3[gi3];
      n3 = t3 * t3 * (g3[0] * x3 + g3[1] * y3 + g3[2] * z3);
    }

    return 32.0 * (n0 + n1 + n2 + n3);
  }

  // Fractal Brownian Motion (multi-octave noise)
  public fbm(x: number, y: number, z: number, octaves = 4, lacunarity = 2.0, gain = 0.5): number {
    let sum = 0;
    let amplitude = 1.0;
    let frequency = 1.0;
    let max = 0;

    for (let i = 0; i < octaves; i++) {
      sum += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
      max += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }
    return sum / max;
  }
}

// Lunar crater feature definition
export interface LunarCrater {
  x: number; // unit sphere normal x
  y: number; // unit sphere normal y
  z: number; // unit sphere normal z
  radiusRad: number; // angular radius in radians (e.g. 0.08 to 0.35 rad)
  depth: number; // relative depth (mm)
  rimHeight: number; // relative rim height (mm)
  hasCentralPeak: boolean;
}

// Precomputed prominent lunar crater distribution across the globe
export function generateLunarCraters(count = 32, seed = 42): LunarCrater[] {
  const craters: LunarCrater[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  // Golden spiral distribution on sphere with jitter
  const phi = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * i / phi;
    const y = 1 - (i / (count - 1)) * 2; // -1 to 1
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    // Crater size variation (power law: many small, few large)
    const sizeFactor = Math.pow(rnd(), 2.2);
    const radiusRad = 0.06 + sizeFactor * 0.22; // 3.4° to 16°
    const depth = 0.4 + sizeFactor * 1.4; // 0.4 mm to 1.8 mm
    const rimHeight = 0.2 + sizeFactor * 0.7; // 0.2 mm to 0.9 mm
    const hasCentralPeak = sizeFactor > 0.65;

    craters.push({
      x, y, z,
      radiusRad,
      depth,
      rimHeight,
      hasCentralPeak
    });
  }

  return craters;
}

const defaultSimplex = new SimplexNoise(2025);
const defaultCraters = generateLunarCraters(48, 777);

/**
 * Calculates lunar elevation offset in mm at unit sphere vector (nx, ny, nz)
 */
export function getLunarElevation(
  nx: number,
  ny: number,
  nz: number,
  radiusMm: number,
  density = 0.8,
  sizeScale = 1.0,
  roughness = 0.5,
  intensity = 0.8
): number {
  if (intensity <= 0.001) return 0;

  // 1. Crater impact depression & rim profiles
  let craterDisplacement = 0;
  const activeCount = Math.floor(defaultCraters.length * Math.min(1.0, Math.max(0.1, density)));

  for (let i = 0; i < activeCount; i++) {
    const c = defaultCraters[i];
    // Angular distance on unit sphere
    const dot = Math.min(1, Math.max(-1, nx * c.x + ny * c.y + nz * c.z));
    const angle = Math.acos(dot);
    const r = c.radiusRad * sizeScale;

    if (angle < r * 1.5) {
      const normDist = angle / r;
      if (normDist <= 1.0) {
        // Inside crater bowl
        const bowl = Math.cos(normDist * Math.PI * 0.5);
        let profile = -c.depth * bowl;

        // Central peak for large impacts
        if (c.hasCentralPeak && normDist < 0.25) {
          const peak = Math.cos((normDist / 0.25) * Math.PI * 0.5);
          profile += c.rimHeight * 1.2 * peak;
        }

        // Add rim ridge near edge
        if (normDist > 0.7) {
          const rimT = (normDist - 0.7) / 0.3;
          profile += c.rimHeight * Math.sin(rimT * Math.PI);
        }
        craterDisplacement += profile;
      } else {
        // Outside ejecta blanket falloff
        const ejectaT = (normDist - 1.0) / 0.5;
        const falloff = (1.0 - ejectaT) * (1.0 - ejectaT);
        craterDisplacement += c.rimHeight * 0.6 * falloff;
      }
    }
  }

  // 2. Multi-scale procedural roughness (lunar maria vs cratered highlands)
  const freq = 3.5 / Math.max(40, radiusMm);
  const microFreq = 16.0 / Math.max(40, radiusMm);

  const mariaNoise = defaultSimplex.fbm(nx * 1.8, ny * 1.8, nz * 1.8, 3, 2.0, 0.5);
  const microNoise = defaultSimplex.fbm(nx * microFreq * 40, ny * microFreq * 40, nz * microFreq * 40, 2, 2.0, 0.4);

  const highlandRoughness = roughness * 0.6 * microNoise;
  const mariaModulation = mariaNoise > 0 ? 0.3 : 1.0;

  const totalElevation = (craterDisplacement * mariaModulation + highlandRoughness) * intensity;

  // Clamp total displacement between -1.8mm and +1.5mm to protect shell wall integrity
  return Math.max(-1.8, Math.min(1.5, totalElevation));
}
