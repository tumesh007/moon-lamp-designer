# Custom Moon Lamp Designer – 3D Printing Studio

A professional, browser-based 3D Moon Lamp Designer and Lithophane Studio built for 3D-printing businesses and individual makers. Generate personalized photo lithophane moon lamps, preview them in realistic day/night lighting with simulated translucency, and export 100% watertight, print-ready binary STL files optimized for FDM slicing (specifically the **Bambu Lab A1 Mini**).

---

## Key Features

### 1. 6 Selectable Moon Styles
1. **Full Moon Lithophane**: Panoramic photo wrap across the spherical lunar surface.
2. **Moon with Photo Window**: Authentic cratered globe with a framed circular photo window and raised crater frame.
3. **Half Moon Lithophane**: Crescent celestial moon with high-contrast portrait lithophane.
4. **Premium Moon Globe**: Spherical moon with detailed Tycho/Copernicus procedural crater topography.
5. **Minimal Moon**: Smooth satin moon surface with subtle micro-textures.
6. **Custom Configuration**: Full manual slider control over crater depth, roughness, aperture diameter, and photo arc.

### 2. Client-Side Lithophane Image Processing
- Supports **JPG, JPEG, PNG, and WebP** (up to 25MB).
- Interactive crop framing: **Circle Mask, Square, Portrait (3:4), Landscape (4:3)**.
- Zoom (0.5x – 2.5x), horizontal & vertical panning, and rotation (-180° to 180°).
- Tone & exposure adjustments: **Brightness, Contrast, Facial Highlight Protection, Gamma (Midtone Depth), and Border Feather Blending**.
- Invert positive/negative toggle.
- Dual visual preview: Grayscale Lithophane Height Map vs Simulated Backlit Glow.

### 3. Interchangeable Lamp Bases & 3D Text Engraving
1. **Plain Circular Base**: Sleek chamfered minimalist cylinder.
2. **Wooden Fluted Slat Base**: Nordic vertical fluted slats.
3. **Modern Minimalist Base**: Octagonal tapered architectural stand.
4. **Premium Stepped Pedestal Base**: Multi-tiered classical pedestal.
5. **Name-Engraved Base**: Front face with 3D embossed typography.
6. **Custom Multi-Line Text Base**: Multi-line personalized quotes, dates, or GPS coordinates.
- **Underside U-Channel**: 6.5mm × 4.0mm cable exit channel allows standard USB cables to exit flat without tilting the base.
- **LED Cavity**: Precision 35mm–45mm pocket accommodating standard 5V USB LED puck lights.
- **Mounting Collar (Spigot)**: 7mm tall boss with lead-in chamfer and ±0.4mm slip-fit clearance.
- **Snap-In Diffuser Dome**: Optional printable dome cap that eliminates LED diode hotspots.

### 4. Watertight Solid STL Generation Engine
- Produces actual double-shell 2-manifold geometry (outer textured shell + inner concentric shell + bottom rim weld).
- **100% Manifold**: Zero boundary holes or non-manifold edges. Every edge is shared by exactly 2 triangles.
- Export in IEEE 754 float32 little-endian binary STL in standard millimeters.
- Individual downloads or **Complete ZIP Package** (`Moon.stl`, `Base.stl`, `Diffuser.stl`, `project_config.json`, `BOM_and_Printing_Guide.txt`).

### 5. Bambu Lab A1 Mini Slicing Optimization
- Real-time build-plate cage visualization ($180 \times 180 \times 180\text{ mm}$).
- Build volume bounds warnings if diameter exceeds 175mm.
- Accurate filament usage calculation ($\text{cm}^3 \times \rho_{PLA} = \text{grams}$).
- Print time estimation based on 0.12mm layer height and perimeter path lengths.
- Slicing guide: 99 Wall Loops (100% infill), 45 mm/s outer wall speed, 5mm outer brim.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

### 4. Run Automated Geometry & STL Suite
```bash
npx vite-node test_geometry.mjs
```

---

## Project Structure
```
moon-lamp-designer/
├── public/
│   └── fonts/
│       ├── helvetiker.json
│       └── helvetiker_bold.json
├── src/
│   ├── assets/
│   │   └── samplePhotos.ts         # 1-Click sample presets (Wedding, Baby, Pet, Moon)
│   ├── core/
│   │   ├── baseGenerator.ts        # Parametric base stand & 3D text engine
│   │   ├── imageProcessor.ts       # Canvas lithophane height-map processor
│   │   ├── moonGenerator.ts        # Double-shell watertight 2-manifold synthesizer
│   │   ├── noise.ts                # Fast 3D Simplex noise & lunar crater formulas
│   │   ├── printValidator.ts       # Bambu A1 Mini validation & slicing calculators
│   │   └── stlExporter.ts          # Binary STL exporter & mesh validator
│   ├── components/
│   │   ├── modals/
│   │   │   ├── BambuSlicingModal.tsx
│   │   │   ├── BillOfMaterialsModal.tsx
│   │   │   └── ProjectSaveLoadModal.tsx
│   │   ├── steps/
│   │   │   ├── Step1MoonStyle.tsx
│   │   │   ├── Step2PhotoUpload.tsx
│   │   │   ├── Step3PhotoEditor.tsx
│   │   │   ├── Step4MoonDimensions.tsx
│   │   │   ├── Step5BaseDesign.tsx
│   │   │   ├── Step6EngravingText.tsx
│   │   │   ├── Step7LightingHardware.tsx
│   │   │   ├── Step8FinalPreview.tsx
│   │   │   ├── Step9GenerateSTL.tsx
│   │   │   └── Step10ExportDownload.tsx
│   │   ├── viewport/
│   │   │   ├── PrinterBedGuide.tsx
│   │   │   ├── TranslucentMaterial.ts
│   │   │   └── Viewer3D.tsx
│   │   ├── Header.tsx
│   │   └── StepNavigation.tsx
│   ├── types/
│   │   └── designer.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── sample_exports/                 # Pre-generated verified test STLs
├── package.json
└── vite.config.ts
```
