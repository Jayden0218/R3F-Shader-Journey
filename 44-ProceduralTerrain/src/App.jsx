import { useFrame, Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useControls } from "leva";
import CustomShaderMaterial from "three-custom-shader-material";
import terrainVertexShader from "./shaders/vertex.glsl";
import terrainFragmentShader from "./shaders/fragment.glsl";
import { useEffect, useRef, useMemo } from "react";
import { SUBTRACTION, Evaluator, Brush } from "three-bvh-csg";

function ProceduralTerrain() {
  const {
    colorWaterDeep,
    colorWaterSurface,
    colorSand,
    colorGrass,
    colorSnow,
    colorRock,
    uPositionFrequency,
    uStrength,
    uWarpFrequency,
    uWarpStrength,
  } = useControls({
    colorWaterDeep: "#002b3d",
    colorWaterSurface: "#66a8ff",
    colorSand: "#ffe894",
    colorGrass: "#85d534",
    colorSnow: "#ffffff",
    colorRock: "#bfbd8d",
    uPositionFrequency: { value: 0.2, min: 0, max: 1, step: 0.001 },
    uStrength: { value: 2.0, min: 0, max: 10, step: 0.001 },
    uWarpFrequency: { value: 5, min: 0, max: 10, step: 0.001 },
    uWarpStrength: { value: 0.5, min: 0, max: 1, step: 0.001 },
  });

  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(10, 10, 500, 500);
    geometry.deleteAttribute("uv");
    geometry.deleteAttribute("normal");
    geometry.rotateX(-Math.PI * 0.5);
    return geometry;
  }, []);

  const customShaderMaterialRef = useRef();
  const scene = useThree((state) => state.scene);

  // Rather than this solution, there is another solution
  // which is LatheGeometry, ExtrudeGeometry, 4*BoxGeometry
  // csg - Constructive Solid Geometry
  // bvh - Bounding Volume Hierarchy
  useEffect(() => {
    // Base Shape
    const boardFill = new Brush(new THREE.BoxGeometry(11, 2, 11));
    // Use to poke a hole
    const boardHole = new Brush(new THREE.BoxGeometry(10, 2.1, 10));
    const evaluator = new Evaluator();
    // Subtract the two meshes with evaluator
    const board = evaluator.evaluate(boardFill, boardHole, SUBTRACTION);
    // Before clear group, the board preserved two properties (material) of each mesh
    // We need to make it to one same properties(material)
    board.geometry.clearGroups();
    board.material = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      metalness: 0,
      roughness: 0.3,
    });
    board.castShadow = true;
    board.receiveShadow = true;
    scene.add(board);
  }, [scene]);

  const uniforms = useMemo(
    () => ({
      uTime: new THREE.Uniform(0),
      uPositionFrequency: new THREE.Uniform(uPositionFrequency),
      uStrength: new THREE.Uniform(uStrength),
      uWarpFrequency: new THREE.Uniform(uWarpFrequency),
      uWarpStrength: new THREE.Uniform(uWarpStrength),
      uColorWaterDeep: new THREE.Uniform(new THREE.Color(colorWaterDeep)),
      uColorWaterSurface: new THREE.Uniform(new THREE.Color(colorWaterSurface)),
      uColorSand: new THREE.Uniform(new THREE.Color(colorSand)),
      uColorGrass: new THREE.Uniform(new THREE.Color(colorGrass)),
      uColorSnow: new THREE.Uniform(new THREE.Color(colorSnow)),
      uColorRock: new THREE.Uniform(new THREE.Color(colorRock)),
    }),
    [
      colorGrass,
      colorRock,
      colorSand,
      colorSnow,
      colorWaterDeep,
      colorWaterSurface,
      uPositionFrequency,
      uStrength,
      uWarpFrequency,
      uWarpStrength,
    ]
  );

  useEffect(() => {
    customShaderMaterialRef.current.uniforms.uPositionFrequency.value =
      uPositionFrequency;
    customShaderMaterialRef.current.uniforms.uStrength.value = uStrength;
    customShaderMaterialRef.current.uniforms.uWarpFrequency.value =
      uWarpFrequency;
    customShaderMaterialRef.current.uniforms.uWarpStrength.value =
      uWarpStrength;
    customShaderMaterialRef.current.uniforms.uColorWaterDeep.value =
      new THREE.Color(colorWaterDeep);

    customShaderMaterialRef.current.uniforms.uColorWaterSurface.value =
      new THREE.Color(colorWaterSurface);

    customShaderMaterialRef.current.uniforms.uColorSand.value = new THREE.Color(
      colorSand
    );
    customShaderMaterialRef.current.uniforms.uColorGrass.value =
      new THREE.Color(colorGrass);
    customShaderMaterialRef.current.uniforms.uColorSnow.value = new THREE.Color(
      colorSnow
    );
    customShaderMaterialRef.current.uniforms.uColorRock.value = new THREE.Color(
      colorRock
    );
  }, [
    colorGrass,
    colorRock,
    colorSand,
    colorSnow,
    colorWaterDeep,
    colorWaterSurface,
    uPositionFrequency,
    uStrength,
    uWarpFrequency,
    uWarpStrength,
  ]);

  useFrame((_, delta) => {
    if (customShaderMaterialRef.current) {
      customShaderMaterialRef.current.uniforms.uTime.value += delta;
      customShaderMaterialRef.current.needsUpdate = true;
    }
  });

  return (
    <>
      <Environment
        files="/spruit_sunrise.hdr"
        toneMapping={THREE.EquirectangularReflectionMapping}
        backgroundBlurriness={0.5}
        background
      />
      <mesh receiveShadow={false} castShadow={false} geometry={geometry}>
        <CustomShaderMaterial
          ref={customShaderMaterialRef}
          baseMaterial={THREE.MeshStandardMaterial}
          vertexShader={terrainVertexShader}
          fragmentShader={terrainFragmentShader}
          uniforms={uniforms}
          metalness={0}
          roughness={0.5}
          color={"#85d534"}
        />
      </mesh>

      <mesh rotation-x={-Math.PI * 0.5} position-y={-0.1}>
        <planeGeometry args={[10, 10, 1, 1]} />
        <meshPhysicalMaterial transmission={1} roughness={0.3} />
      </mesh>
    </>
  );
}

function App() {
  return (
    <Canvas
      camera={{ fov: 35, far: 100, position: [-10, 6, -2] }}
      gl={{
        shadowMap: THREE.PCFSoftShadowMap,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1,
      }}
    >
      <OrbitControls enableDamping />
      <ProceduralTerrain />
      <directionalLight
        color={"#ffffff"}
        intensity={2}
        position={[6.25, 3, 4]}
        castShadow
        shadow-mapSize={[1024, 1024]}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-8, 8, 8, -8, 0.1, 30]}
        />
      </directionalLight>
    </Canvas>
  );
}

export default App;
