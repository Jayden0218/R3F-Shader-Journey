import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Canvas } from "@react-three/fiber";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Canvas camera={{ fov: 35, near: 0.1, position: [0, 0, 18] }}>
      <App />
    </Canvas>
  </StrictMode>
);
