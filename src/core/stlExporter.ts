import * as THREE from 'three';

export interface MeshValidationReport {
  isWatertight: boolean;
  totalTriangles: number;
  totalVertices: number;
  boundingBoxMm: {
    width: number;
    depth: number;
    height: number;
  };
  volumeCm3: number;
  surfaceAreaCm2: number;
  nonManifoldEdgeCount: number;
}

/**
 * Validates BufferGeometry for 3D print readiness
 */
export function validateMeshPrintability(geometry: THREE.BufferGeometry): MeshValidationReport {
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox!;
  const width = bb.max.x - bb.min.x;
  const depth = bb.max.z - bb.min.z;
  const height = bb.max.y - bb.min.y;

  const pos = geometry.attributes.position;
  const idx = geometry.index;
  const totalTriangles = idx ? idx.count / 3 : pos.count / 3;

  // Edge count map for manifold check: each edge must be shared by exactly 2 triangles
  const edgeMap = new Map<string, number>();
  const makeEdgeKey = (a: number, b: number) => (a < b ? `${a}_${b}` : `${b}_${a}`);

  let volumeSum = 0;
  let areaSum = 0;

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();

  for (let i = 0; i < totalTriangles; i++) {
    const i0 = idx ? idx.getX(i * 3) : i * 3;
    const i1 = idx ? idx.getX(i * 3 + 1) : i * 3 + 1;
    const i2 = idx ? idx.getX(i * 3 + 2) : i * 3 + 2;

    // Register edges
    const e1 = makeEdgeKey(i0, i1);
    const e2 = makeEdgeKey(i1, i2);
    const e3 = makeEdgeKey(i2, i0);

    edgeMap.set(e1, (edgeMap.get(e1) || 0) + 1);
    edgeMap.set(e2, (edgeMap.get(e2) || 0) + 1);
    edgeMap.set(e3, (edgeMap.get(e3) || 0) + 1);

    // Calculate signed tetrahedron volume for closed mesh volume
    vA.fromBufferAttribute(pos, i0);
    vB.fromBufferAttribute(pos, i1);
    vC.fromBufferAttribute(pos, i2);

    volumeSum += vA.dot(cb.crossVectors(vB, vC)) / 6.0;

    // Calculate triangle surface area
    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);
    cb.cross(ab);
    areaSum += cb.length() * 0.5;
  }

  // Count non-manifold or boundary edges (edges not equal to 2)
  let nonManifoldEdgeCount = 0;
  edgeMap.forEach((count) => {
    if (count !== 2) nonManifoldEdgeCount++;
  });

  const isWatertight = nonManifoldEdgeCount === 0;

  return {
    isWatertight,
    totalTriangles,
    totalVertices: pos.count,
    boundingBoxMm: {
      width: Math.round(width * 10) / 10,
      depth: Math.round(depth * 10) / 10,
      height: Math.round(height * 10) / 10
    },
    volumeCm3: Math.abs(volumeSum) / 1000.0,
    surfaceAreaCm2: areaSum / 100.0,
    nonManifoldEdgeCount
  };
}

/**
 * High-performance Binary STL Exporter
 * Generates valid IEEE 754 little-endian binary STL in millimeters.
 */
export function exportToBinarySTL(
  geometry: THREE.BufferGeometry,
  headerTitle = 'Custom Moon Lamp Designer STL'
): ArrayBuffer {
  // Ensure bounding box and normals
  geometry.computeBoundingBox();

  const pos = geometry.attributes.position;
  const idx = geometry.index;
  const numTriangles = idx ? idx.count / 3 : pos.count / 3;

  // Binary STL layout:
  // 80 bytes: Header
  // 4 bytes: uint32 triangle count
  // 50 bytes per triangle: 12 normal + 36 vertices + 2 attribute
  const totalByteLength = 80 + 4 + numTriangles * 50;
  const buffer = new ArrayBuffer(totalByteLength);
  const view = new DataView(buffer);

  // 1. Write Header (80 bytes ascii)
  const safeHeader = headerTitle.slice(0, 79).padEnd(80, ' ');
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, safeHeader.charCodeAt(i));
  }

  // 2. Write triangle count (little endian uint32)
  view.setUint32(80, numTriangles, true);

  // Vectors for normal calculation
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const norm = new THREE.Vector3();
  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();

  let offset = 84;

  for (let i = 0; i < numTriangles; i++) {
    const i0 = idx ? idx.getX(i * 3) : i * 3;
    const i1 = idx ? idx.getX(i * 3 + 1) : i * 3 + 1;
    const i2 = idx ? idx.getX(i * 3 + 2) : i * 3 + 2;

    vA.fromBufferAttribute(pos, i0);
    vB.fromBufferAttribute(pos, i1);
    vC.fromBufferAttribute(pos, i2);

    // Compute face normal: (vB - vA) x (vC - vA)
    edge1.subVectors(vB, vA);
    edge2.subVectors(vC, vA);
    norm.crossVectors(edge1, edge2).normalize();

    // Normal Vector (12 bytes)
    view.setFloat32(offset, norm.x, true);
    view.setFloat32(offset + 4, norm.y, true);
    view.setFloat32(offset + 8, norm.z, true);
    offset += 12;

    // Vertex 1 (12 bytes)
    view.setFloat32(offset, vA.x, true);
    view.setFloat32(offset + 4, vA.y, true);
    view.setFloat32(offset + 8, vA.z, true);
    offset += 12;

    // Vertex 2 (12 bytes)
    view.setFloat32(offset, vB.x, true);
    view.setFloat32(offset + 4, vB.y, true);
    view.setFloat32(offset + 8, vB.z, true);
    offset += 12;

    // Vertex 3 (12 bytes)
    view.setFloat32(offset, vC.x, true);
    view.setFloat32(offset + 4, vC.y, true);
    view.setFloat32(offset + 8, vC.z, true);
    offset += 12;

    // Attribute byte count (2 bytes uint16, always 0)
    view.setUint16(offset, 0, true);
    offset += 2;
  }

  return buffer;
}
