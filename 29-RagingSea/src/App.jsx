import { useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import waterVertexShader from "./shaders/vertex.glsl";
import waterFragmentShader from "./shaders/fragment.glsl";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo } from "react";

function RagingSea() {
  // useRef attributes
  const waterMaterialRef = useRef();

  // Leva Controls
  const {
    uBigWavesElevation,
    uBigWavesFrequencyX,
    uBigWavesFrequencyY,
    uBigWavesSpeed,
    uSmallWavesElevation,
    uSmallWavesFrequency,
    uSmallWavesSpeed,
    uSmallIterations,
    uColorOffset,
    depthColor,
    uColorMultiplier,
    surfaceColor,
  } = useControls({
    // Big Waves Controls
    uBigWavesElevation: { value: 0.2, min: 0, max: 1, step: 0.001 },
    uBigWavesFrequencyX: { value: 4, min: 0, max: 10, step: 0.001 },
    uBigWavesFrequencyY: { value: 1.5, min: 0, max: 10, step: 0.001 },
    uBigWavesSpeed: { value: 0.75, min: 0, max: 4, step: 0.001 },
    // Small Waves Controls
    uSmallWavesElevation: { value: 0.15, min: 0, max: 1, step: 0.001 },
    uSmallWavesFrequency: { value: 3, min: 0, max: 30, step: 0.001 },
    uSmallWavesSpeed: { value: 0.2, min: 0, max: 4, step: 0.001 },
    uSmallIterations: { value: 0.4, min: 0, max: 5, step: 1 },
    // Color Controls
    uColorOffset: { value: 0.08, min: 0, max: 1, step: 0.001 },
    uColorMultiplier: { value: 5, min: 0, max: 10, step: 0.001 },
    depthColor: "#186691",
    surfaceColor: "#9bd8ff",
  });

  // Update the changes when leva controls change
  useEffect(() => {
    waterMaterialRef.current.uniforms.uBigWavesElevation.value =
      uBigWavesElevation;
    waterMaterialRef.current.uniforms.uBigWavesFrequency.value.set(
      uBigWavesFrequencyX,
      uBigWavesFrequencyY
    );
    waterMaterialRef.current.uniforms.uBigWavesSpeed.value = uBigWavesSpeed;
    waterMaterialRef.current.uniforms.uDepthColor.value.set(depthColor);
    waterMaterialRef.current.uniforms.uSurfaceColor.value.set(surfaceColor);
    waterMaterialRef.current.uniforms.uColorOffset.value = uColorOffset;
    waterMaterialRef.current.uniforms.uColorMultiplier.value = uColorMultiplier;
    waterMaterialRef.current.uniforms.uSmallWavesElevation.value =
      uSmallWavesElevation;
    waterMaterialRef.current.uniforms.uSmallWavesFrequency.value =
      uSmallWavesFrequency;
    waterMaterialRef.current.uniforms.uSmallWavesSpeed.value = uSmallWavesSpeed;
    waterMaterialRef.current.uniforms.uSmallIterations.value = uSmallIterations;
  }, [
    uBigWavesElevation,
    uBigWavesFrequencyX,
    uBigWavesFrequencyY,
    uBigWavesSpeed,
    depthColor,
    surfaceColor,
    uColorOffset,
    uColorMultiplier,
    uSmallWavesFrequency,
    uSmallWavesElevation,
    uSmallWavesSpeed,
    uSmallIterations,
  ]);

  // Use to memorise the uniforms once
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },

      uBigWavesElevation: { value: uBigWavesElevation },
      uBigWavesFrequency: {
        value: new THREE.Vector2(uBigWavesFrequencyX, uBigWavesFrequencyY),
      },
      uBigWavesSpeed: { uBigWavesSpeed },

      uSmallWavesElevation: { uSmallWavesElevation },
      uSmallWavesFrequency: { uSmallWavesFrequency },
      uSmallWavesSpeed: { uSmallWavesSpeed },
      uSmallIterations: { uSmallIterations },

      uDepthColor: { value: new THREE.Color(depthColor) },
      uSurfaceColor: { value: new THREE.Color(surfaceColor) },
      uColorOffset: { value: 0.08 },
      uColorMultiplier: { value: 5 },
    }),
    []
  );

  // Change the variable of the shaderMaterial every time
  useFrame((_, delta) => {
    if (waterMaterialRef.current) {
      waterMaterialRef.current.uniforms.uTime.value += delta;
    }
  });
  return (
    <mesh rotation-x={-Math.PI * 0.5}>
      <planeGeometry args={[2, 2, 512, 512]} />
      <shaderMaterial
        ref={waterMaterialRef}
        vertexShader={waterVertexShader}
        fragmentShader={waterFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function App() {
  return (
    <Canvas camera={{ position: [1, 1, 1] }}>
      <OrbitControls enableDamping />
      <RagingSea />
    </Canvas>
  );
}

export default App;
