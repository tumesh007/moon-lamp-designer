import * as THREE from 'three';

/**
 * Creates custom Translucent Lithophane Shader Material
 * Simulates high-definition subsurface backlighting transmission based on
 * per-pixel photo texture intensity and double-shell thickness.
 */
export function createTranslucentMoonMaterial(
  mode: 'night' | 'day',
  lightColorHex: string = '#ffd79a',
  lightBrightness: number = 100,
  wireframe: boolean = false,
  photoTexture: THREE.Texture | null = null,
  lithoMinMm: number = 0.8,
  lithoMaxMm: number = 3.0,
  baseThicknessMm: number = 1.8
): THREE.ShaderMaterial {
  const lightColor = new THREE.Color(lightColorHex);
  const surfaceBaseColor = new THREE.Color('#f8fafc'); // Matte porcelain moonlight plaster
  const craterShadowColor = new THREE.Color('#cbd5e1');

  // Dummy 1x1 white texture if photoTexture is not yet available
  const dummyTexture = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  dummyTexture.needsUpdate = true;

  const textureToUse = photoTexture || dummyTexture;

  return new THREE.ShaderMaterial({
    wireframe,
    side: THREE.DoubleSide,
    uniforms: {
      uMode: { value: mode === 'night' ? 1.0 : 0.0 },
      uLightColor: { value: lightColor },
      uSurfaceColor: { value: surfaceBaseColor },
      uShadowColor: { value: craterShadowColor },
      uLightIntensity: { value: (lightBrightness / 100) * 1.85 },
      uInteriorLightPos: { value: new THREE.Vector3(0, 0, 0) },
      uPhotoTexture: { value: textureToUse },
      uHasPhotoTexture: { value: photoTexture ? 1.0 : 0.0 },
      uLithoMin: { value: lithoMinMm },
      uLithoMax: { value: lithoMaxMm },
      uBaseThickness: { value: baseThicknessMm }
    },
    vertexShader: `
      attribute float aThickness;
      attribute vec2 aPhotoUv;
      attribute float aPhotoWeight;

      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec2 vPhotoUv;
      varying float vPhotoWeight;
      varying float vThickness;

      void main() {
        vThickness = aThickness;
        vPhotoUv = aPhotoUv;
        vPhotoWeight = aPhotoWeight;
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;

        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uMode;
      uniform vec3 uLightColor;
      uniform vec3 uSurfaceColor;
      uniform vec3 uShadowColor;
      uniform float uLightIntensity;
      uniform vec3 uInteriorLightPos;
      uniform sampler2D uPhotoTexture;
      uniform float uHasPhotoTexture;
      uniform float uLithoMin;
      uniform float uLithoMax;
      uniform float uBaseThickness;

      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec2 vPhotoUv;
      varying float vPhotoWeight;
      varying float vThickness;

      void main() {
        vec3 norm = normalize(vNormal);

        // Per-pixel high-definition lithophane thickness evaluation!
        float effectiveThickness = vThickness;
        float photoIntensity = 0.5;

        if (uHasPhotoTexture > 0.5 && vPhotoWeight > 0.005) {
          if (vPhotoUv.x >= 0.0 && vPhotoUv.x <= 1.0 && vPhotoUv.y >= 0.0 && vPhotoUv.y <= 1.0) {
            vec4 texColor = texture2D(uPhotoTexture, vPhotoUv);
            photoIntensity = texColor.r; // grayscale brightness

            float highResThickness = mix(uLithoMin, uLithoMax, 1.0 - photoIntensity);
            effectiveThickness = mix(vThickness, highResThickness, vPhotoWeight);
          }
        }

        if (uMode > 0.5) {
          // NIGHT MODE: Ultra High-Definition Backlit Lithophane Glow
          vec3 lightDir = normalize(vWorldPosition - uInteriorLightPos);

          // Beer-Lambert physical absorption law in White PLA (mu ~ 0.82 mm^-1)
          float mu = 0.82;
          float safeThickness = max(0.4, effectiveThickness);
          float transmission = exp(-mu * safeThickness);

          // Forward scattering towards viewer
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float forwardScatter = max(0.0, dot(-viewDir, lightDir));
          float scatterBoost = 1.0 + pow(forwardScatter, 3.0) * 0.55;

          // Warm core illumination
          vec3 bulbGlow = uLightColor * transmission * uLightIntensity * scatterBoost;

          // Ambient translucent leakage
          vec3 ambient = uLightColor * 0.08;

          gl_FragColor = vec4(bulbGlow + ambient, 1.0);
        } else {
          // DAY MODE: Studio Lighting with fine photographic surface relief & crater topography
          vec3 sunDir1 = normalize(vec3(0.8, 1.2, 1.0));
          vec3 sunDir2 = normalize(vec3(-1.0, 0.4, -0.6));

          // Perturb normal for tactile photo engraving visibility
          vec3 perturbedNorm = norm;
          if (uHasPhotoTexture > 0.5 && vPhotoWeight > 0.05) {
            float reliefDelta = (photoIntensity - 0.5) * 0.35 * vPhotoWeight;
            perturbedNorm = normalize(norm + vec3(reliefDelta));
          }

          float diff1 = max(0.0, dot(perturbedNorm, sunDir1));
          float diff2 = max(0.0, dot(perturbedNorm, sunDir2)) * 0.35;
          float ambient = 0.45;

          float lightFactor = ambient + diff1 * 0.55 + diff2;
          vec3 surface = mix(uShadowColor, uSurfaceColor, lightFactor);

          // Very subtle photo tint in day mode so features are visibly distinguishable
          if (uHasPhotoTexture > 0.5 && vPhotoWeight > 0.05) {
            surface = mix(surface, surface * (0.85 + photoIntensity * 0.25), vPhotoWeight * 0.45);
          }

          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 halfVec = normalize(sunDir1 + viewDir);
          float spec = pow(max(0.0, dot(perturbedNorm, halfVec)), 28.0) * 0.12;

          gl_FragColor = vec4(surface + vec3(spec), 1.0);
        }
      }
    `
  });
}
