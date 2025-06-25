import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrthographicCamera,
  Box,
  Text,
  useGLTF,
  Preload,
} from '@react-three/drei';
import { Group, Mesh } from 'three';
import { gsap } from 'gsap';

// --- Configuration Constants ---
const LEVEL_Y_SPACING = 4.5;
const LEVEL_X_OFFSET = 1.5;
const TRANSITION_DURATION = 1.5;

// --- URL for the externally hosted model ---
const BLACKBOX_MODEL_URL =
  'https://www.dropbox.com/scl/fi/ctq6wazasll8xuacvkoci/blackbox.glb?rlkey=syus6kmcbolpfy00qgfhh4dpp&st=byhv4x0n&dl=1';

// --- Level Components ---

/**
 * The component for the custom Black Box GLB model, loaded from an external URL.
 */
function BlackBoxModel(props: any) {
  // useGLTF works perfectly with full URLs.
  // It will fetch the model from the Dropbox server.
  const { scene } = useGLTF(BLACKBOX_MODEL_URL);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} scale={0.8} {...props} />;
}

/**
 * The component for the default, procedural levels.
 */
function DefaultLevel({ color, name }: { color: string; name: string }) {
  return (
    <group>
      <Box args={[3, 0.5, 3]} castShadow receiveShadow>
        <meshStandardMaterial color={color} />
      </Box>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 4, Math.PI / 4, 0]}
      >
        {name}
      </Text>
    </group>
  );
}

// --- Level Data (No changes here) ---
const levelsData = [
  {
    name: '1. The Black Box',
    description: 'An unknown entity, ready for processing.',
    Component: BlackBoxModel,
    position: [LEVEL_X_OFFSET, 0 * LEVEL_Y_SPACING, 0],
    props: {},
  },
  {
    name: '2. Reforestation Project',
    description: 'Trees are planted, beginning CO2 absorption.',
    Component: DefaultLevel,
    position: [-LEVEL_X_OFFSET, 1 * LEVEL_Y_SPACING, 0],
    props: { color: '#5a8b43' },
  },
  {
    name: '3. Growth & Verification',
    description: 'Data is collected and independently verified.',
    Component: DefaultLevel,
    position: [LEVEL_X_OFFSET, 2 * LEVEL_Y_SPACING, 0],
    props: { color: '#4f7a9e' },
  },
  {
    name: '4. Carbon Credit Issued',
    description: 'A tradable credit is created and sold.',
    Component: DefaultLevel,
    position: [-LEVEL_X_OFFSET, 3 * LEVEL_Y_SPACING, 0],
    props: { color: '#d4af37' },
  },
];
const TOTAL_LEVELS = levelsData.length;

// --- Scene and App components (No changes from previous version) ---

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

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[10, 10, 10]}
        zoom={60}
        rotation={[-Math.PI / 6, Math.PI / 4, 0]}
      />
      <ambientLight intensity={0.8} />
      <directionalLight
        castShadow
        position={[10, 15, 5]}
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

export default function App() {
  const [level, setLevel] = useState(0);

  const handleNext = () => setLevel((prev) => (prev + 1) % TOTAL_LEVELS);
  const handlePrevious = () =>
    setLevel((prev) => (prev - 1 + TOTAL_LEVELS) % TOTAL_LEVELS);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene currentLevel={level} />
          <Preload all />
        </Suspense>
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'white',
          zIndex: 100,
          fontFamily: 'sans-serif',
          background: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '8px',
        }}
      >
        <h2>Carbon Credit Evolution</h2>
        <p>Current Stage: {levelsData[level].name}</p>
        <p style={{ fontSize: '0.8em', color: '#ccc' }}>
          {levelsData[level].description}
        </p>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          gap: '10px',
        }}
      >
        <button onClick={handlePrevious}>Previous</button>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}
