import { OrbitControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import coffeeSmokeVertexShader from "./shaders/vertex.glsl";
import coffeeSmokeFragmentShader from "./shaders/fragment.glsl";
import { useFrame } from "@react-three/fiber";

// In this Projector, the y and z cordinate didnt need to change to obtain the result
// It can 100% follow the Three.js Journey code

function CoffeeSmoke() {
  const perlinTexture = useLoader(THREE.TextureLoader, "/perlin.png");
  const bakedModel = useLoader(GLTFLoader, "/bakedModel.glb");

  useEffect(() => {
    if (bakedModel) {
      bakedModel.scene.getObjectByName("baked").material.map.anisotropy = 8;
    }
  }, [bakedModel]);

  useEffect(() => {
    perlinTexture.wrapS = THREE.RepeatWrapping;
    perlinTexture.wrapT = THREE.RepeatWrapping;
  }, [perlinTexture]);

  const smokeMaterialRef = useRef();

  useFrame((_, delta) => {
    if (smokeMaterialRef.current) {
      smokeMaterialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <>
      <primitive object={bakedModel.scene} />
      <mesh position-y={3 + 1.83} scale={[1.5, 6, 1.5]}>
        <planeGeometry args={[1, 1, 16, 64]} />
        <shaderMaterial
          vertexShader={coffeeSmokeVertexShader}
          fragmentShader={coffeeSmokeFragmentShader}
          uniforms={{
            uPerlinTexture: new THREE.Uniform(perlinTexture),
            uTime: new THREE.Uniform(0),
          }}
          side={2}
          transparent
          ref={smokeMaterialRef}
          // it will occlude anything behind it if depthWrite is true (depthbuffer)
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function App() {
  return (
    <Canvas
      camera={{ fov: 25, position: [8, 10, 12] }}
      style={{ background: "black" }}
    >
      <OrbitControls enableDamping target-y={3} />
      <CoffeeSmoke />
    </Canvas>
  );
}

export default App;
