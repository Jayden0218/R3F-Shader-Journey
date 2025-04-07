import { useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import halftoneVertexShader from "./shaders/vertex.glsl";
import halftoneFragmentShader from "./shaders/fragment.glsl";
import * as THREE from "three";

function HalftoneShading() {
  // Leva controls
  const {
    clearColor,
    color,
    uShadowRepititions,
    uShadowColor,
    uLightRepititions,
    uLightColor,
  } = useControls({
    clearColor: "#26132f",
    color: "#ff794d",
    uShadowRepititions: { value: 100, min: 1, max: 300, step: 1 },
    uShadowColor: "#8e19b8",
    uLightRepititions: { value: 130, min: 1, max: 300, step: 1 },
    uLightColor: "#e5ffe0",
  });
  // Load Suzanne model
  const suzanne = useLoader(GLTFLoader, "/suzanne.glb");

  // Get the properties from useThree
  const { size, viewport, gl } = useThree((state) => ({
    size: state.size,
    viewport: state.viewport,
    gl: state.gl,
  }));

  // useRef attributes
  const shaderMaterialRef = useRef();
  const groupRef = useRef();

  // Update the background color when changed
  useEffect(() => {
    gl.setClearColor(new THREE.Color(clearColor));
  }, [clearColor]);

  const shaderMaterial = useMemo(() => {
    return (
      <shaderMaterial
        ref={shaderMaterialRef}
        vertexShader={halftoneVertexShader}
        fragmentShader={halftoneFragmentShader}
        uniforms={{
          uColor: new THREE.Uniform(new THREE.Color(color)),
          // Extra color!
          uShadeColor: new THREE.Uniform(new THREE.Color("#ffffff")),
          uResolution: new THREE.Uniform(
            new THREE.Vector2(
              size.width * viewport.dpr,
              size.height * viewport.dpr
            )
          ),
          uShadowRepititions: new THREE.Uniform(uShadowRepititions),
          uShadowColor: new THREE.Uniform(new THREE.Color(uShadowColor)),
          uLightRepititions: new THREE.Uniform(uLightRepititions),
          uLightColor: new THREE.Uniform(new THREE.Color(uLightColor)),
        }}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    suzanne.scene.children[0].material = shaderMaterialRef.current;
  }, [suzanne.scene.children]);

  // Update the material uResolution
  useEffect(() => {
    shaderMaterialRef.current.uniforms.uResolution.value.set(
      size.width * viewport.dpr,
      size.height * viewport.dpr
    );
  }, [size, viewport.dpr]);

  // Change the shader material properties when leva control changes
  useEffect(() => {
    shaderMaterialRef.current.uniforms.uColor.value.set(color);
    shaderMaterialRef.current.uniforms.uShadowRepititions.value =
      uShadowRepititions;
    shaderMaterialRef.current.uniforms.uShadowColor.value.set(uShadowColor);
    shaderMaterialRef.current.uniforms.uLightRepititions.value =
      uLightRepititions;
    shaderMaterialRef.current.uniforms.uLightColor.value.set(uLightColor);
  }, [color, uLightColor, uLightRepititions, uShadowColor, uShadowRepititions]);

  useFrame((_, delta) => {
    if (suzanne) {
      groupRef.current.rotation.x += -delta * 0.1;
      groupRef.current.rotation.y += delta * 0.2;
    }
  }, []);

  return (
    <group ref={groupRef}>
      <mesh position-x={3}>
        <torusKnotGeometry args={[0.6, 0.25, 128, 32]} />
        {shaderMaterial}
      </mesh>
      <primitive object={suzanne.scene} />
      <mesh position-x={-3}>
        <sphereGeometry />
        {shaderMaterial}
      </mesh>
    </group>
  );
}

function App() {
  return (
    <Canvas
      camera={{ fov: 25, position: [7, 7, 7] }}
      gl={{ toneMapping: THREE.NoToneMapping }}
    >
      <OrbitControls enableDamping />
      <HalftoneShading />
    </Canvas>
  );
}

export default App;
