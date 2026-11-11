/**
 * High-quality preset photographs generated via SVG-to-DataURI for immediate 1-click testing
 */

export interface SamplePhoto {
  id: string;
  title: string;
  category: string;
  dataUrl: string;
}

// 1. Romantic Couple Silhouette
const coupleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="skyGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#d0d7de"/>
      <stop offset="85%" stop-color="#484f58"/>
      <stop offset="100%" stop-color="#161b22"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#skyGrad)"/>
  <!-- Stars -->
  <circle cx="80" cy="70" r="2.5" fill="#ffffff" opacity="0.9"/>
  <circle cx="140" cy="50" r="1.8" fill="#ffffff" opacity="0.8"/>
  <circle cx="320" cy="90" r="2.2" fill="#ffffff" opacity="0.9"/>
  <circle cx="360" cy="140" r="1.5" fill="#ffffff" opacity="0.7"/>
  <circle cx="60" cy="150" r="2" fill="#ffffff" opacity="0.8"/>
  <!-- Couple Silhouette -->
  <g fill="#05070a">
    <!-- Groom / Man -->
    <circle cx="175" cy="165" r="30"/>
    <path d="M145,195 Q175,205 185,210 L188,320 L130,320 Z"/>
    <!-- Bride / Woman -->
    <circle cx="225" cy="172" r="26"/>
    <!-- Veil & Dress -->
    <path d="M210,198 Q240,195 255,220 L275,320 L180,320 Z"/>
    <path d="M225,160 Q265,180 270,250 Q260,280 280,320" stroke="#05070a" stroke-width="12" fill="none"/>
    <!-- Hill / Base -->
    <path d="M0,320 Q200,290 400,320 L400,400 L0,400 Z"/>
  </g>
</svg>`;

// 2. Beloved Pet (Dog Portrait)
const dogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="petGrad" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#petGrad)"/>
  <g fill="#0f172a">
    <!-- Dog Ears & Head -->
    <path d="M130,120 Q100,160 115,220 Q130,240 150,230 Q145,180 160,150 Z"/>
    <path d="M270,120 Q300,160 285,220 Q270,240 250,230 Q255,180 240,150 Z"/>
    <ellipse cx="200" cy="180" rx="65" ry="70"/>
    <!-- Muzzle -->
    <path d="M170,190 Q200,175 230,190 L225,245 Q200,265 175,245 Z" fill="#1e293b"/>
    <!-- Nose -->
    <path d="M185,210 Q200,200 215,210 Q200,235 185,210 Z" fill="#020617"/>
    <!-- Eyes -->
    <ellipse cx="165" cy="170" rx="9" ry="11" fill="#020617"/>
    <circle cx="167" cy="168" r="3" fill="#ffffff"/>
    <ellipse cx="235" cy="170" rx="9" ry="11" fill="#020617"/>
    <circle cx="237" cy="168" r="3" fill="#ffffff"/>
    <!-- Body -->
    <path d="M140,240 Q110,310 100,400 L300,400 Q290,310 260,240 Z"/>
  </g>
</svg>`;

// 3. Baby Portrait
const babySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="babyGrad" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#475569"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#babyGrad)"/>
  <g fill="#1e293b">
    <!-- Sleeping Baby Head -->
    <ellipse cx="200" cy="190" rx="75" ry="85"/>
    <circle cx="125" cy="195" r="18"/> <!-- ear -->
    <!-- Closed eye arcs -->
    <path d="M165,185 Q178,198 190,185" stroke="#ffffff" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M210,185 Q223,198 235,185" stroke="#ffffff" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <!-- Gentle smile -->
    <path d="M190,225 Q200,236 210,225" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <!-- Beanie Hat -->
    <path d="M125,160 Q200,90 275,160 Q200,140 125,160 Z" fill="#0f172a"/>
    <circle cx="200" cy="100" r="15" fill="#0f172a"/>
    <!-- Swaddle Wrap -->
    <path d="M135,260 Q200,230 265,260 Q285,340 250,400 L150,400 Q115,340 135,260 Z" fill="#334155"/>
  </g>
</svg>`;

// 4. Authentic Apollo Moon Map
const apolloSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="lunarMap" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="70%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#lunarMap)"/>
  <!-- Maria (Dark basaltic plains) -->
  <path d="M120,130 Q170,100 230,120 Q270,160 250,220 Q190,260 140,210 Z" fill="#475569" opacity="0.6"/>
  <path d="M230,220 Q290,200 310,260 Q280,310 220,290 Z" fill="#475569" opacity="0.65"/>
  <!-- Tycho crater rays -->
  <circle cx="200" cy="310" r="12" fill="#ffffff"/>
  <path d="M200,310 L150,180 M200,310 L280,200 M200,310 L100,260 M200,310 L320,270" stroke="#ffffff" stroke-width="3" opacity="0.45"/>
  <!-- Copernicus & Kepler -->
  <circle cx="150" cy="190" r="9" fill="#ffffff" opacity="0.85"/>
  <circle cx="110" cy="200" r="6" fill="#ffffff" opacity="0.75"/>
</svg>`;

const toDataUri = (svgStr: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: 'couple',
    title: 'Romantic Couple',
    category: 'Wedding & Love',
    dataUrl: toDataUri(coupleSvg)
  },
  {
    id: 'dog',
    title: 'Faithful Companion',
    category: 'Pets & Memorial',
    dataUrl: toDataUri(dogSvg)
  },
  {
    id: 'baby',
    title: 'Sleeping Baby',
    category: 'Newborn & Family',
    dataUrl: toDataUri(babySvg)
  },
  {
    id: 'apollo',
    title: 'Lunar Surface Topography',
    category: 'Astronomy & Real Moon',
    dataUrl: toDataUri(apolloSvg)
  }
];
