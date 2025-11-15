import { useState, useEffect, useCallback, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface SystemStats {
  cpu: number
  memory: number
  disk: string
}

export function useWebSocket(url: string) {
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [systemStats, setSystemStats] = useState<SystemStats>({
    cpu: 0,
    memory: 0,
    disk: '0 GB',
  })

  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)

        // Request initial stats
        if (ws.current) {
          ws.current.send(JSON.stringify({ type: 'request_stats' }))
        }
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'jarvis_message' || data.type === 'ai_response') {
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: data.text,
                timestamp: Date.now(),
              },
            ])
          } else if (data.type === 'system_stats') {
            setSystemStats(data.data)
          }
        } catch (error) {
          console.error('Error parsing message:', error)
        }
      }

      ws.current.onclose = () => {
        console.log('WebSocket disconnected')
        setConnected(false)

        // Attempt to reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          connect()
        }, 3000)
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
    }
  }, [url])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [connect])

  const sendMessage = useCallback((text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'user_input',
          text,
        })
      )

      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: text,
          timestamp: Date.now(),
        },
      ])
    }
  }, [])

  return {
    connected,
    messages,
    systemStats,
    sendMessage,
  }
}
