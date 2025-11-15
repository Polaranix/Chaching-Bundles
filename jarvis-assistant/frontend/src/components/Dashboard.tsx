import { motion } from 'framer-motion'
import { Clock, Calendar, Wifi, Battery } from 'lucide-react'

export default function Dashboard() {
  const time = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="glass-panel p-4">
      <div className="grid grid-cols-4 gap-6">
        {/* Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Clock className="w-5 h-5 text-jarvis-blue" />
          <div>
            <div className="text-xs text-jarvis-blue/60">TIME</div>
            <div className="text-lg font-mono text-jarvis-blue">{time}</div>
          </div>
        </motion.div>

        {/* Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <Calendar className="w-5 h-5 text-jarvis-blue" />
          <div>
            <div className="text-xs text-jarvis-blue/60">DATE</div>
            <div className="text-sm text-jarvis-blue">{date}</div>
          </div>
        </motion.div>

        {/* Network */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <Wifi className="w-5 h-5 text-jarvis-blue" />
          <div>
            <div className="text-xs text-jarvis-blue/60">NETWORK</div>
            <div className="text-sm text-jarvis-blue">CONNECTED</div>
          </div>
        </motion.div>

        {/* Power */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <Battery className="w-5 h-5 text-jarvis-blue" />
          <div>
            <div className="text-xs text-jarvis-blue/60">POWER</div>
            <div className="text-sm text-jarvis-blue">OPTIMAL</div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-jarvis-blue/30">
        <div className="flex gap-2">
          {['DIAGNOSTICS', 'SETTINGS', 'BRIEFING', 'HELP'].map((action, i) => (
            <motion.button
              key={action}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-3 py-2 bg-transparent border border-jarvis-blue/30 text-jarvis-blue text-xs rounded hover:bg-jarvis-blue/10 hover:border-jarvis-blue transition-all"
            >
              {action}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
