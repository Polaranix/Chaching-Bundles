import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Dashboard from './components/Dashboard'
import VoiceVisualizer from './components/VoiceVisualizer'
import SystemStats from './components/SystemStats'
import ConversationPanel from './components/ConversationPanel'
import JarvisOrb from './components/JarvisOrb'
import { useWebSocket } from './hooks/useWebSocket'

function App() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const { messages, systemStats, connected, sendMessage } = useWebSocket('ws://localhost:8765')

  useEffect(() => {
    // Listen for global hotkey
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        setMinimized(!minimized)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [minimized])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-jarvis-dark">
      {/* Animated grid background */}
      <div className="absolute inset-0 grid-background opacity-30" />

      {/* Scan line effect */}
      <div className="scan-line" />

      {/* Main HUD Container */}
      <AnimatePresence mode="wait">
        {!minimized ? (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full h-full p-8 flex flex-col"
          >
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-3 h-3 bg-jarvis-blue rounded-full shadow-glow"
                />
                <h1 className="text-3xl font-bold hologram-text tracking-wider">
                  J.A.R.V.I.S.
                </h1>
                <span className="text-jarvis-blue/60 text-sm">
                  {connected ? 'ONLINE' : 'CONNECTING...'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMinimized(true)}
                  className="glow-button text-sm"
                >
                  MINIMIZE
                </button>
              </div>
            </header>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-12 gap-6">
              {/* Left Panel - System Stats */}
              <div className="col-span-3 space-y-6">
                <SystemStats stats={systemStats} />
              </div>

              {/* Center - Main Display */}
              <div className="col-span-6 flex flex-col items-center justify-center space-y-8">
                {/* JARVIS Orb */}
                <JarvisOrb
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  size={300}
                />

                {/* Voice Visualizer */}
                {(isListening || isSpeaking) && (
                  <VoiceVisualizer
                    isActive={isListening || isSpeaking}
                    isSpeaking={isSpeaking}
                  />
                )}

                {/* Status Text */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <p className="text-2xl hologram-text">
                    {isListening
                      ? 'LISTENING...'
                      : isSpeaking
                      ? 'PROCESSING...'
                      : 'READY'}
                  </p>
                  <p className="text-jarvis-blue/60 mt-2">
                    Say "Hey JARVIS" to activate
                  </p>
                </motion.div>
              </div>

              {/* Right Panel - Conversation */}
              <div className="col-span-3">
                <ConversationPanel
                  messages={messages}
                  onSendMessage={sendMessage}
                />
              </div>
            </div>

            {/* Footer - Dashboard */}
            <footer className="mt-8">
              <Dashboard />
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="minimized"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => setMinimized(false)}
            className="absolute bottom-8 right-8 cursor-pointer"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-20 h-20 rounded-full bg-jarvis-blue/20 border-2 border-jarvis-blue flex items-center justify-center shadow-glow-lg"
              >
                <span className="text-2xl hologram-text font-bold">J</span>
              </motion.div>

              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full border-2 border-jarvis-blue pulse-ring" />
              <div
                className="absolute inset-0 rounded-full border-2 border-jarvis-blue pulse-ring"
                style={{ animationDelay: '0.5s' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner HUD Elements */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="w-20 h-20 border-t-2 border-l-2 border-jarvis-blue/50" />
        <div className="text-xs text-jarvis-blue/60 ml-2">SYSTEM_ID: J4RV1S</div>
      </div>

      <div className="absolute top-4 right-4">
        <div className="w-20 h-20 border-t-2 border-r-2 border-jarvis-blue/50" />
      </div>

      <div className="absolute bottom-4 left-4">
        <div className="w-20 h-20 border-b-2 border-l-2 border-jarvis-blue/50" />
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
        <div className="w-20 h-20 border-b-2 border-r-2 border-jarvis-blue/50" />
        <div className="text-xs text-jarvis-blue/60 mr-2">v1.0.0</div>
      </div>
    </div>
  )
}

export default App
