import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ConversationPanelProps {
  messages: Message[]
  onSendMessage: (text: string) => void
}

export default function ConversationPanel({ messages, onSendMessage }: ConversationPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="glass-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-jarvis-blue/30">
        <MessageCircle className="w-5 h-5 text-jarvis-blue" />
        <h3 className="text-sm font-semibold text-jarvis-blue">CONVERSATION</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-jarvis-blue/60 text-sm mt-8"
            >
              No messages yet. Start a conversation with JARVIS.
            </motion.div>
          ) : (
            messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-jarvis-blue/20 border border-jarvis-blue/50'
                      : 'bg-jarvis-dark-light border border-jarvis-blue/30'
                  }`}
                >
                  <div className="text-xs text-jarvis-blue/60 mb-1">
                    {message.role === 'user' ? 'YOU' : 'JARVIS'}
                  </div>
                  <p className="text-sm text-jarvis-blue">{message.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-jarvis-blue/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-jarvis-dark-light border border-jarvis-blue/30 rounded px-3 py-2 text-sm text-jarvis-blue placeholder:text-jarvis-blue/40 focus:outline-none focus:border-jarvis-blue transition-colors"
          />
          <button
            type="submit"
            className="glow-button p-2"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
