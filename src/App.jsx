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
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-cyan-400">
          AI Society Simulation
        </h1>
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