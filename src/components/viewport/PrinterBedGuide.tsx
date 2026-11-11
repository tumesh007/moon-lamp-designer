import React from 'react';
import * as THREE from 'three';

interface PrinterBedGuideProps {
  bedWidth?: number; // 180mm
  bedDepth?: number; // 180mm
  bedHeight?: number; // 180mm
  isExceeded?: boolean;
}

export const PrinterBedGuide: React.FC<PrinterBedGuideProps> = ({
  bedWidth = 180,
  bedDepth = 180,
  bedHeight = 180,
  isExceeded = false
}) => {
  const boxColor = isExceeded ? '#ef4444' : '#64748b';
  const gridColor = isExceeded ? '#7f1d1d' : '#334155';

  return (
    <group position={[0, 0, 0]}>
      {/* Bed Base Plate */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[bedWidth, 1, bedDepth]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grid on bed plate */}
      <gridHelper
        args={[bedWidth, 18, gridColor, '#1e293b']}
        position={[0, 0.05, 0]}
      />

      {/* Printable Volume Bounding Cage */}
      <lineSegments position={[0, bedHeight / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(bedWidth, bedHeight, bedDepth)]} />
        <lineBasicMaterial color={boxColor} transparent opacity={0.35} />
      </lineSegments>

      {/* Corner Bracket Accents */}
      {[-1, 1].map((cx) =>
        [-1, 1].map((cz) => (
          <mesh
            key={`corner-${cx}-${cz}`}
            position={[(cx * bedWidth) / 2, 0.5, (cz * bedDepth) / 2]}
          >
            <cylinderGeometry args={[2, 2, 1, 8]} />
            <meshBasicMaterial color={isExceeded ? '#ef4444' : '#f5c065'} />
          </mesh>
        ))
      )}
    </group>
  );
};
