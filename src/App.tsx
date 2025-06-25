import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  PerspectiveCamera,
  OrbitControls,
  useGLTF,
  Preload,
} from '@react-three/drei';
import { Group, Mesh } from 'three';
import { gsap } from 'gsap';

// --- Configuration Constants ---
// THE FIX IS HERE: Increased from 8 to 12 for more vertical separation.
const LEVEL_Y_SPACING = 12;
const LEVEL_X_OFFSET = 3;
const TRANSITION_DURATION = 1.5;

// --- URL for the externally hosted model ---
const BLACKBOX_MODEL_URL = 'https://raw.githubusercontent.com/wildwestcrypto/credit_evolution/main/src/assets/blackbox.glb';

// --- Level Components ---

function BlackBoxModel(props: any) {
  const { scene } = useGLTF(BLACKBOX_MODEL_URL);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  return (
    <group position-y={-1.5}>
      <primitive object={clonedScene} scale={20} {...props} />
    </group>
  );
}

// --- Level Data (Unchanged) ---
const levelsData = [
  {
    name: '1. Raw Land',
    description: 'Initial state, potential for carbon capture.',
    Component: BlackBoxModel,
    position: [LEVEL_X_OFFSET, 0 * LEVEL_Y_SPACING, 0],
    props: {},
  },
  {
    name: '2. Reforestation Project',
    description: 'Trees are planted, beginning CO2 absorption.',
    Component: BlackBoxModel,
    position: [-LEVEL_X_OFFSET, 1 * LEVEL_Y_SPACING, 0],
    props: {},
  },
  {
    name: '3. Growth & Verification',
    description: 'Data is collected and independently verified.',
    Component: BlackBoxModel,
    position: [LEVEL_X_OFFSET, 2 * LEVEL_Y_SPACING, 0],
    props: {},
  },
  {
    name: '4. Carbon Credit Issued',
    description: 'A tradable credit is created and sold.',
    Component: BlackBoxModel,
    position: [-LEVEL_X_OFFSET, 3 * LEVEL_Y_SPACING, 0],
    props: {},
  },
];
const TOTAL_LEVELS = levelsData.length;

/**
 * The 3D scene component containing the world and its levels.
 */
function Scene({ currentLevel }: { currentLevel: number }) {
  const worldGroup = useRef<Group>(null!);

  useEffect(() => {
    if (worldGroup.current) {
      const targetPosition = {
        x: -levelsData[currentLevel].position[0],
        y: -levelsData[currentLevel].position[1],
      };
      gsap.to(worldGroup.current.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        duration: TRANSITION_DURATION,
        ease: 'power2.inOut',
      });
    }
  }, [currentLevel]);

  // --- Constants for camera rotation limits ---
  const initialAzimuth = Math.PI / 4;
  const rotationRange = Math.PI / 3; // 60 degrees total range

  return (
    <>
      <PerspectiveCamera makeDefault position={[50, 50, 50]} fov={40} />

      <OrbitControls
        enablePan={false}
        minDistance={25}
        maxDistance={90}
        
        enableDamping={true}
        dampingFactor={0.05}

        // Horizontal rotation limits
        minAzimuthAngle={initialAzimuth - rotationRange / 2}
        maxAzimuthAngle={initialAzimuth + rotationRange / 2}

        // Vertical rotation limits
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2}
      />

      <ambientLight intensity={0.7} />
      <directionalLight
        castShadow
        position={[10, 20, 5]}
        intensity={1.5}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <group ref={worldGroup}>
        {levelsData.map((level, index) => (
          <group key={index} position={level.position}>
            <level.Component name={level.name} {...level.props} />
          </group>
        ))}
      </group>
    </>
  );
}

/**
 * The main application component with UI controls.
 */
export default function App() {
  const [level, setLevel] = useState(0);

  const handleNext = () => setLevel((prev) => (prev + 1) % TOTAL_LEVELS);
  const handlePrevious = () => setLevel((prev) => (prev - 1 + TOTAL_LEVELS) % TOTAL_LEVELS);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene currentLevel={level} />
          <Preload all />
        </Suspense>
      </Canvas>
      {/* UI Elements (unchanged) */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', zIndex: 100, fontFamily: 'sans-serif', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px' }}>
        <h2>Carbon Credit Evolution</h2>
        <p>Current Stage: {levelsData[level].name}</p>
        <p style={{ fontSize: '0.8em', color: '#ccc' }}>{levelsData[level].description}</p>
      </div>
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', gap: '10px' }}>
        <button onClick={handlePrevious}>Previous</button>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}