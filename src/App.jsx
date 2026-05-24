import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { OrbitControls, Stars } from "@react-three/drei"

function Box() {
  const meshRef = useRef()

  useFrame(({ clock }) => {
  meshRef.current.rotation.x += 0.003
  meshRef.current.rotation.y += 0.005

  meshRef.current.position.y =
    Math.sin(clock.elapsedTime) * 0.3
})

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial
        color="cyan"
        emissive="cyan"
        emissiveIntensity={1}
      />
    </mesh>
  )
}

function App() {
  return (
    <div className="h-screen bg-black text-white flex">

      {/* Left Panel */}
      <div className="w-1/4 border-r border-gray-800 p-4">
        <h1 className="text-xl font-bold text-cyan-400 mb-4">
          Live Events
        </h1>

        <div className="space-y-4">
          <div className="bg-gray-900 p-3 rounded-lg">
            Fuel prices increased
          </div>

          <div className="bg-gray-900 p-3 rounded-lg">
            Political tensions rising
          </div>

          <div className="bg-gray-900 p-3 rounded-lg">
            Misinformation spike detected
          </div>
        </div>
      </div>

      {/* Center Panel */}
      <div className="flex-1">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={2}
            color="cyan"
          />
          <Stars
              radius={50}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />
          <Box />

          <OrbitControls />
          
        </Canvas>
      </div>

      {/* Right Panel */}
      <div className="w-1/4 border-l border-gray-800 p-4">
        <h1 className="text-xl font-bold text-cyan-400 mb-4">
          Analytics
        </h1>

        <div className="space-y-4">
          <div className="bg-gray-900 p-3 rounded-lg">
            Trust Index: 42%
          </div>

          <div className="bg-gray-900 p-3 rounded-lg">
            Fear Level: HIGH
          </div>

          <div className="bg-gray-900 p-3 rounded-lg">
            Polarization: MEDIUM
          </div>
        </div>
      </div>

    </div>
  )
}

export default App