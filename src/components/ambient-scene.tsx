'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';


function Field() {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      // Distribución en cáscara esférica: deja el centro despejado para que
      // el texto del hero no compita con los puntos.
      const r = 3.2 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.04;
    ref.current.rotation.x += delta * 0.012;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.022}
        color="#FFC14D"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function AmbientScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      // dpr limitado a 1.5: por encima, el coste sube sin diferencia visible
      // en un campo de puntos.
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      frameloop="always"
    >
      <Field />
    </Canvas>
  );
}
