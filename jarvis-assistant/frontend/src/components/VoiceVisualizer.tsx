import { motion } from 'framer-motion'

interface VoiceVisualizerProps {
  isActive: boolean
  isSpeaking: boolean
}

export default function VoiceVisualizer({ isActive, isSpeaking }: VoiceVisualizerProps) {
  const barCount = 40

  return (
    <div className="flex items-center justify-center gap-1 h-32">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-jarvis-blue rounded-full"
          animate={
            isActive
              ? {
                  height: [
                    Math.random() * 20 + 10,
                    Math.random() * 80 + 40,
                    Math.random() * 20 + 10,
                  ],
                  opacity: [0.3, 1, 0.3],
                }
              : { height: 4, opacity: 0.3 }
          }
          transition={{
            duration: isSpeaking ? 0.3 : 0.8,
            repeat: Infinity,
            delay: i * 0.03,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: isActive ? '0 0 10px rgba(0, 212, 255, 0.6)' : 'none',
          }}
        />
      ))}
    </div>
  )
}
