import { useEffect, useMemo, useRef } from "react";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import shadingVertexShader from "./shaders/vertex.glsl";
import shadingFragmentShader from "./shaders/fragment.glsl";

function LightShading() {
  const suzanne = useLoader(GLTFLoader, "./suzanne.glb");
  useEffect(() => {
    suzanne.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = shaderMaterialRef.current;
      }
    });
  }, [suzanne]);

  const gl = useThree((state) => state.gl);
  useEffect(() => {
    (gl.toneMapping = THREE.ACESFilmicToneMapping),
      (gl.toneMappingExposure = 3);
  }, [gl]);

  const shaderMaterialRef = useRef();
  const groupRef = useRef();

  const { color } = useControls({ color: "#ffffff" });

  useFrame((_, delta) => {
    groupRef.current.rotation.x += -delta * 0.1;
    groupRef.current.rotation.y += delta * 0.2;
  });

  useEffect(() => {
    shaderMaterialRef.current.uniforms.uColor.value.set(color);
  }, [color]);

  // Use memo cannot add color as dependency, it will make the
  // uColor always at the same color regardless the color is change
  // Should use effect to do the changeing color
  const shaderMaterial = useMemo(() => {
    return (
      <shaderMaterial
        ref={shaderMaterialRef}
        vertexShader={shadingVertexShader}
        fragmentShader={shadingFragmentShader}
        uniforms={{ uColor: { value: new THREE.Color(color) } }}
      />
    );
  }, []);
  return (
    <>
      <group ref={groupRef}>
        <mesh position-x={3}>
          <torusKnotGeometry args={[0.6, 0.25, 128, 32]} />
          {shaderMaterial}
        </mesh>
        <mesh position-x={-3}>
          <sphereGeometry />
          {shaderMaterial}
        </mesh>
        <mesh>
          <primitive object={suzanne.scene} />
        </mesh>
      </group>

      <mesh position-z={3}>
        <planeGeometry />
        <meshBasicMaterial color={[0.1, 0.1, 1]} side={2} />
      </mesh>
      <mesh position-y={2.5}>
        <icosahedronGeometry args={[0.1, 2]} />
        <meshBasicMaterial color={[1, 0.1, 0.1]} />
      </mesh>
      <mesh position={[2, 0, 2]}>
        <icosahedronGeometry args={[0.1, 2]} />
        <meshBasicMaterial color={[0.1, 1.0, 0.5]} />
      </mesh>
    </>
  );
}

function App() {
  return (
    <Canvas camera={{ fov: 25, position: [7, 7, 7] }}>
      <OrbitControls enableDamping />
      <LightShading />
    </Canvas>
  );
}

export default App;
