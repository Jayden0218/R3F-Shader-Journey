import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import particlesVertexShader from "./shaders/vertex.glsl";
import particlesFragmentShader from "./shaders/fragment.glsl";

function App() {
  const { raycaster, camera, gl, viewport, pointer } = useThree((state) => ({
    raycaster: state.raycaster,
    camera: state.camera,
    gl: state.gl,
    viewport: state.viewport,
    pointer: state.pointer,
  }));

  // Ref attributes
  const particlesGeometryRef = useRef();
  const particlesMaterialRef = useRef();
  const interactivePlaneRef = useRef();

  // TextureLoader
  const picture1 = useTexture("/picture-1.png");

  useEffect(() => {
    particlesMaterialRef.current.uniforms.uResolution.value.set(
      viewport.width * viewport.dpr,
      viewport.height * viewport.dpr
    );
  }, [viewport]);

  useEffect(() => {
    gl.setClearColor("#181818");
  }, [gl]);

  const screenCursor = useRef(new THREE.Vector2(9999, 9999));
  const canvasCursor = useRef(new THREE.Vector2(9999, 9999));
  const cursorPrevious = useRef(new THREE.Vector2(9999, 9999));

  // Set Displacment Canvas
  const displacement = useMemo(() => {
    // 2D Canvas
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    canvas.style.position = "fixed";
    canvas.style.width = "256px";
    canvas.style.height = "256px";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = 10;
    document.body.append(canvas);

    // Glow Image
    const glowImage = new Image();
    glowImage.src = "/glow.png";

    // Texture
    const texture = new THREE.CanvasTexture(canvas);

    return {
      canvas,
      glowImage,
      texture,
    };
  }, []);

  useEffect(() => {
    // Set up random attribute for more vision
    const intensitiesArray = new Float32Array(
      particlesGeometryRef.current.attributes.position.count
    );
    const anglesArray = new Float32Array(
      particlesGeometryRef.current.attributes.position.count
    );

    // Loop for inserting the value inside
    for (
      let i = 0;
      i < particlesGeometryRef.current.attributes.position.count;
      i++
    ) {
      intensitiesArray[i] = Math.random();
      anglesArray[i] = Math.random() * Math.PI * 2;
    }

    // Set the attributes to particlesGeometry
    particlesGeometryRef.current.setAttribute(
      "aIntensity",
      new THREE.BufferAttribute(intensitiesArray, 1)
    );
    particlesGeometryRef.current.setAttribute(
      "aAngle",
      new THREE.BufferAttribute(anglesArray, 1)
    );
  }, []);

  useFrame(() => {
    if (!interactivePlaneRef.current) return;

    screenCursor.current.set(pointer.x, pointer.y);
    raycaster.setFromCamera(screenCursor.current, camera);
    const intersections = raycaster.intersectObject(
      interactivePlaneRef.current
    );

    if (intersections.length) {
      const uv = intersections[0].uv;

      canvasCursor.current.set(
        uv.x * displacement.canvas.width,
        (1 - uv.y) * displacement.canvas.height
      );
    }

    const context = displacement.canvas.getContext("2d");

    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 0.02;
    context.fillRect(
      0,
      0,
      displacement.canvas.width,
      displacement.canvas.height
    );

    const cursorDistance = cursorPrevious.current.distanceTo(
      canvasCursor.current
    );
    cursorPrevious.current.copy(canvasCursor.current);
    const alpha = Math.min(cursorDistance * 0.05, 1);

    const glowSize = displacement.canvas.width * 0.25;
    context.globalCompositeOperation = "lighten";
    context.globalAlpha = alpha;
    context.drawImage(
      displacement.glowImage,
      canvasCursor.current.x - glowSize * 0.5,
      canvasCursor.current.y - glowSize * 0.5,
      glowSize,
      glowSize
    );

    displacement.texture.needsUpdate = true;
  });

  const uniforms = useMemo(
    () => ({
      uResolution: new THREE.Uniform(
        new THREE.Vector2(
          viewport.width * viewport.dpr,
          viewport.height * viewport.dpr
        )
      ),
      uPictureTexture: new THREE.Uniform(picture1),
      uDisplacementTexture: new THREE.Uniform(displacement.texture),
    }),
    [
      displacement.texture,
      picture1,
      viewport.dpr,
      viewport.height,
      viewport.width,
    ]
  );

  return (
    <>
      <OrbitControls enableDamping />
      <points>
        <planeGeometry
          args={[10, 10, 128, 128]}
          setIndex={null}
          deleteAttribute={"normal"}
          ref={particlesGeometryRef}
        />
        <shaderMaterial
          ref={particlesMaterialRef}
          vertexShader={particlesVertexShader}
          fragmentShader={particlesFragmentShader}
          uniforms={uniforms}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={interactivePlaneRef} visible={false}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="red" side={2} />
      </mesh>
    </>
  );
}

export default App;
