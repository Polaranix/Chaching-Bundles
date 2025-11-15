import { motion } from 'framer-motion'
import { Cpu, HardDrive, Activity } from 'lucide-react'

interface SystemStatsProps {
  stats: {
    cpu: number
    memory: number
    disk: string
  }
}

export default function SystemStats({ stats }: SystemStatsProps) {
  return (
    <div className="space-y-4">
      {/* CPU */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <Cpu className="w-5 h-5 text-jarvis-blue" />
          <h3 className="text-sm font-semibold text-jarvis-blue">CPU</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-jarvis-blue/60">Usage</span>
            <span className="text-jarvis-blue font-mono">{stats.cpu}%</span>
          </div>
          <div className="w-full h-2 bg-jarvis-dark-light rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-jarvis-blue to-jarvis-cyan shadow-glow"
              initial={{ width: 0 }}
              animate={{ width: `${stats.cpu}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Memory */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <Activity className="w-5 h-5 text-jarvis-blue" />
          <h3 className="text-sm font-semibold text-jarvis-blue">MEMORY</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-jarvis-blue/60">Usage</span>
            <span className="text-jarvis-blue font-mono">{stats.memory}%</span>
          </div>
          <div className="w-full h-2 bg-jarvis-dark-light rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-jarvis-blue to-jarvis-cyan shadow-glow"
              initial={{ width: 0 }}
              animate={{ width: `${stats.memory}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Disk */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <HardDrive className="w-5 h-5 text-jarvis-blue" />
          <h3 className="text-sm font-semibold text-jarvis-blue">STORAGE</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-jarvis-blue/60">Available</span>
            <span className="text-jarvis-blue font-mono">{stats.disk}</span>
          </div>
        </div>
      </motion.div>

      {/* Status Indicators */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-4"
      >
        <h3 className="text-sm font-semibold text-jarvis-blue mb-3">STATUS</h3>
        <div className="space-y-2">
          {[
            { label: 'AI Core', status: 'ONLINE' },
            { label: 'Voice System', status: 'READY' },
            { label: 'Automation', status: 'ACTIVE' },
            { label: 'Network', status: 'CONNECTED' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-jarvis-blue/60">{item.label}</span>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 bg-jarvis-blue rounded-full shadow-glow-sm"
                />
                <span className="text-jarvis-blue font-mono">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
