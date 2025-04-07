import { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useControls } from "leva";
import { useLoader } from "@react-three/fiber";
import earthVertexShader from "./shaders/earth/vertex.glsl";
import earthFragmentShader from "./shaders/earth/fragment.glsl";
import atmosphereVertexShader from "./shaders/atmosphere/vertex.glsl";
import atmosphereFragmentShader from "./shaders/atmosphere/fragment.glsl";
import { OrbitControls } from "@react-three/drei";

function Earth() {
  const [day, night, clouds] = useLoader(THREE.TextureLoader, [
    "/earth/day.jpg",
    "/earth/night.jpg",
    "/earth/specularClouds.jpg",
  ]);

  // References
  const sunRef = useRef();
  const atmosphereMaterialRef = useRef();
  const earthMaterialRef = useRef();
  const earthRef = useRef();

  useEffect(() => {
    day.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = 8;
    night.colorSpace = THREE.SRGBColorSpace;
    night.anisotropy = 8;
    clouds.anisotropy = 8;
  }, [clouds, day, night]);

  const { atmosphereDayColor, atmosphereTwilightColor, phi, theta } =
    useControls({
      atmosphereDayColor: "#00aaff",
      atmosphereTwilightColor: "#ff6600",
      phi: { value: Math.PI * 0.5, min: 0, max: Math.PI },
      theta: { value: -Math.PI, min: -Math.PI, max: Math.PI },
    });

  const sunDirection = useRef(new THREE.Vector3());

  useEffect(() => {
    const sunSpherical = new THREE.Spherical(1, phi, theta);
    sunDirection.current.setFromSpherical(sunSpherical);

    if (sunRef.current) {
      sunRef.current.position.copy(sunDirection.current).multiplyScalar(5);
    }
    if (earthMaterialRef.current) {
      earthMaterialRef.current.uniforms.uSunDirection.value.copy(
        sunDirection.current
      );
    }
    if (atmosphereMaterialRef.current) {
      atmosphereMaterialRef.current.uniforms.uSunDirection.value.copy(
        sunDirection.current
      );
    }
  }, [phi, theta]);

  const sphereGeometry = useMemo(() => {
    return <sphereGeometry args={[2, 64, 64]} />;
  }, []);

  const earthUniforms = useMemo(
    () => ({
      uDayTexture: new THREE.Uniform(day),
      uNightTexture: new THREE.Uniform(night),
      uSpecularCloudsTexture: new THREE.Uniform(clouds),
      uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
      uAtmosphereDayColor: new THREE.Uniform(
        new THREE.Color(atmosphereDayColor)
      ),
      uAtmosphereTwilightColor: new THREE.Uniform(
        new THREE.Color(atmosphereTwilightColor)
      ),
    }),
    [atmosphereDayColor, atmosphereTwilightColor, clouds, day, night]
  );

  const atmosphereUniforms = useMemo(
    () => ({
      uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
      uAtmosphereDayColor: new THREE.Uniform(
        new THREE.Color(atmosphereDayColor)
      ),
      uAtmosphereTwilightColor: new THREE.Uniform(
        new THREE.Color(atmosphereTwilightColor)
      ),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    atmosphereMaterialRef.current.uniforms.uAtmosphereDayColor.value =
      new THREE.Color(atmosphereDayColor);
    earthMaterialRef.current.uniforms.uAtmosphereDayColor.value =
      new THREE.Color(atmosphereDayColor);

    atmosphereMaterialRef.current.uniforms.uAtmosphereTwilightColor.value =
      new THREE.Color(atmosphereTwilightColor);
    earthMaterialRef.current.uniforms.uAtmosphereTwilightColor.value =
      new THREE.Color(atmosphereTwilightColor);
  }, [atmosphereDayColor, atmosphereTwilightColor]);

  return (
    <>
      <mesh ref={earthRef}>
        {sphereGeometry}
        <shaderMaterial
          ref={earthMaterialRef}
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={earthUniforms}
        />
      </mesh>
      <mesh scale={[1.04, 1.04, 1.04]}>
        {sphereGeometry}
        <shaderMaterial
          ref={atmosphereMaterialRef}
          side={THREE.BackSide}
          transparent
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={atmosphereUniforms}
        />
      </mesh>
      <mesh ref={sunRef}>
        <icosahedronGeometry args={[0.1, 2]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
}

function App() {
  return (
    <Canvas
      camera={{ fov: 25, position: [12, 5, 4] }}
      style={{ background: "#000011" }}
    >
      <OrbitControls enableDamping />
      <Earth />
    </Canvas>
  );
}

export default App;
