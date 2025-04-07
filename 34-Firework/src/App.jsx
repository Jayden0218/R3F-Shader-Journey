import { OrbitControls, Sky } from "@react-three/drei";
import { useLoader, useThree, Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef, useEffect, useState } from "react";
import { useControls } from "leva";
import fireworkVertexShader from "./shaders/vertex.glsl";
import fireworkFragmentShader from "./shaders/fragment.glsl";
import gsap from "gsap";

// This function create a firework when user clicked
function CreateFirework({ textures }) {
  const { sizeGL, viewport, scene } = useThree((state) => ({
    // Need to know the width and height of the website to change the size of particles
    sizeGL: state.size,
    // Viewport depend on user device
    viewport: state.viewport,
    // Use to remove firework when end
    scene: state.scene,
  }));

  const texture = useMemo(() => {
    return textures[Math.floor(Math.random() * textures.length)];
  }, [textures]);

  // Create random firework
  const { count, position, size, radius, color } = useMemo(() => {
    const count = Math.round(400 + Math.random() * 1000);
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random(),
      (Math.random() - 0.5) * 2
    );
    const size = 0.1 + Math.random() * 0.1;

    // The image is upside down
    texture.flipY = false;
    const radius = 0.5 + Math.random();
    const color = new THREE.Color();
    color.setHSL(Math.random(), 1, 0.7);

    return { count, position, size, texture, radius, color };
  }, [texture]);

  // Reference attributes
  const pointsRef = useRef();
  const shaderMaterialRef = useRef();

  // Remove the point after end
  const destroy = useMemo(() => {
    const destroy = () => {
      scene.remove(pointsRef.current);
    };
    return destroy;
  }, [scene]);

  useEffect(() => {
    // Use to copy the intial position for the firework
    pointsRef.current.position.copy(position);
    // Do animation with gsap
    gsap.to(shaderMaterialRef.current.uniforms.uProgress, {
      value: 1,
      duration: 3,
      ease: "linear",
      onComplete: destroy,
    });
  }, [destroy, position]);

  // Create a Firework properties
  const { positionArray, sizesArray, timeMultipliersArray } = useMemo(() => {
    // Set Up Attributes
    const positionArray = new Float32Array(count * 3);
    const sizesArray = new Float32Array(count);
    const timeMultipliersArray = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const spherical = new THREE.Spherical(
        // first value is radius, second value is phi angle(vertical angle) and
        // third value is theta angle(horizontal angle)
        radius *
          // Use to randomise the radius
          (0.75 + Math.random() * 0.25),
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2
      );
      const position = new THREE.Vector3();
      position.setFromSpherical(spherical);

      positionArray[i3] = position.x;
      positionArray[i3 + 1] = position.y;
      positionArray[i3 + 2] = position.z;

      sizesArray[i] = Math.random();

      timeMultipliersArray[i] = 1 + Math.random();
    }
    return {
      positionArray,
      sizesArray,
      timeMultipliersArray,
    };
  }, [count, radius]);

  // Set the resolution of the website
  useEffect(() => {
    shaderMaterialRef.current.uniforms.uResolution.value.set(
      sizeGL.width * viewport.dpr,
      sizeGL.height * viewport.dpr
    );
  }, [sizeGL, viewport.dpr]);

  // Set the uniform of the shader material
  const uniforms = useMemo(
    () => ({
      uSize: new THREE.Uniform(size),
      // Add resolution becuase when resize, the particle in the shader didnt resize
      uResolution: new THREE.Uniform(
        new THREE.Vector2(sizeGL.width, sizeGL.height)
      ),
      uTexture: new THREE.Uniform(texture),
      uColor: new THREE.Uniform(color),
      uProgress: new THREE.Uniform(0),
    }),
    [color, size, sizeGL.height, sizeGL.width, texture]
  );
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positionArray}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={sizesArray}
          count={count}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aTimeMultiplier"
          array={timeMultipliersArray}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderMaterialRef}
        vertexShader={fireworkVertexShader}
        fragmentShader={fireworkFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function SkyComponent() {
  // Reference
  const skyRef = useRef();

  // Use this to get the toneMapping
  const gl = useThree((state) => state.gl);

  // Leva controls
  const {
    turbidity,
    rayleigh,
    mieCoefficient,
    mieDirectionalG,
    elevation,
    azimuth,
  } = useControls({
    turbidity: { value: 10, min: 0.0, max: 20, step: 0.1 },
    rayleigh: { value: 3, min: 0.0, max: 4, step: 0.001 },
    mieCoefficient: { value: 0.005, min: 0.0, max: 0.1, step: 0.001 },
    mieDirectionalG: { value: 0.95, min: 0.0, max: 1, step: 0.001 },
    elevation: { value: -2.2, min: -3, max: 10, step: 0.01 },
    azimuth: { value: 180, min: -180, max: 180, step: 0.1 },
    exposure: { value: gl.toneMappingExposure, min: 0, max: 1, step: 0.001 },
  });

  // Sun properties
  const sun = useMemo(() => {
    const v = new THREE.Vector3();
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    v.setFromSphericalCoords(1, phi, theta);
    return v;
  }, [azimuth, elevation]);

  useEffect(() => {
    // Set the scale of x, y, z to the value
    skyRef.current.scale.setScalar(450000);
  }, []);

  // Change the uniform value when leva change
  useEffect(() => {
    skyRef.current.turbidity = turbidity;
    skyRef.current.rayleigh = rayleigh;
    skyRef.current.mieCoefficient = mieCoefficient;
    skyRef.current.mieDirectionalG = mieDirectionalG;
  }, [mieCoefficient, mieDirectionalG, rayleigh, turbidity]);
  return (
    <Sky
      ref={skyRef}
      turbidity={turbidity}
      rayleigh={rayleigh}
      mieCoefficient={mieCoefficient}
      mieDirectionalG={mieDirectionalG}
      sunPosition={sun}
    />
  );
}

function App() {
  // Use to take care of the firework
  const [fireworks, setFireworks] = useState([]);

  // Run firework
  const handleFireworkClick = () => {
    setFireworks((prevFireworks) => [...prevFireworks, { id: Date.now() }]);
  };

  // Load the firework point image
  const textures = useLoader(THREE.TextureLoader, [
    "/1.png",
    "/2.png",
    "/3.png",
    "/4.png",
    "/5.png",
    "/6.png",
    "/7.png",
    "/8.png",
  ]);

  // console.log(textures.indexOf(texture));

  return (
    <Canvas
      camera={{ fov: 25, position: [1.5, 0, 6] }}
      onClick={handleFireworkClick}
    >
      <OrbitControls enableDamping />
      <group>
        {fireworks.map((fw) => (
          <CreateFirework key={fw.id} textures={textures} />
        ))}
      </group>

      <SkyComponent />
    </Canvas>
  );
}

export default App;
