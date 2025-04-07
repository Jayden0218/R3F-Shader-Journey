import { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import holographicVertexShader from "./shaders/vertex.glsl";
import holographicFragmentShader from "./shaders/fragment.glsl";

function Hologram() {
  // useRef properties
  const shaderMaterialRef = useRef();
  const groupRef = useRef();

  // Load model
  const suzanne = useGLTF("/suzanne.glb");

  // Leva controls
  const { rendererClearColor, materialColor } = useControls({
    rendererClearColor: "#1d1f2a",
    materialColor: "#70c1ff",
  });

  // Get gl properties from three
  // It rerenders only if gl changes
  const gl = useThree((state) => state.gl);

  // Set background color
  // Only set at the first render
  useEffect(() => {
    gl.setClearColor(new THREE.Color(rendererClearColor));
  }, [gl, rendererClearColor]);

  // Shader material for few mesh purpose
  // useMemo to memorise it and updated when materialColor change
  const material = useMemo(() => {
    return (
      <shaderMaterial
        ref={shaderMaterialRef}
        args={[
          {
            vertexShader: holographicVertexShader,
            fragmentShader: holographicFragmentShader,
            uniforms: {
              uTime: new THREE.Uniform(0),
              uColor: new THREE.Uniform(new THREE.Color(materialColor)),
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          },
        ]}
      />
    );
  }, [materialColor]);

  // Render every FPS
  useFrame((_, delta) => {
    // Change the shader value every time
    shaderMaterialRef.current.uniforms.uTime.value += delta;

    // Rotate the groupRef mesh
    if (suzanne) {
      groupRef.current.rotation.x += -delta * 0.1;
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  // Change the suzzane material after suzanne model rendered
  // it will update when materialColor changes
  useEffect(() => {
    suzanne.scene.children[0].material = shaderMaterialRef.current;
  }, [materialColor, suzanne.scene.children]);

  return (
    <group ref={groupRef}>
      <mesh position-x={3}>
        <torusKnotGeometry args={[0.6, 0.25, 128, 32]} />
        {material}
      </mesh>
      <mesh position-x={-3}>
        {material}
        <sphereGeometry />
      </mesh>
      <primitive object={suzanne.scene} material={material} />;
    </group>
  );
}

function App() {
  return (
    // Canvas = (scene + camera + renderer) of size & pixelRatio
    // flat is using THREE.NoToneMapping
    <Canvas flat camera={{ fov: 25, position: [7, 7, 7], far: 100 }}>
      <OrbitControls enableDamping />
      <Hologram />
    </Canvas>
  );
}

export default App;
