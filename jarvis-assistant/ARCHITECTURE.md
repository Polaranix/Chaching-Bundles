# JARVIS System Architecture

Technical documentation of the JARVIS AI assistant architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    (Voice/Text Input)                        │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Electron + React)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  JARVIS Orb  │  │ Conversation │      │
│  │    Panel     │  │    (3D)      │  │    Panel     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ System Stats │  │    Voice     │  │    Quick     │      │
│  │    Panel     │  │  Visualizer  │  │   Actions    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────┬────────────────────────────────────────────────┘
             │ WebSocket (ws://localhost:8765)
             ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Python)                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              JARVIS CORE                              │  │
│  │  • Conversation Management                            │  │
│  │  • Context Tracking                                   │  │
│  │  • Service Orchestration                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│      ┌───────────────────┼───────────────────┐             │
│      ▼                   ▼                   ▼             │
│  ┌─────────┐      ┌──────────┐      ┌──────────┐          │
│  │  Voice  │      │    AI    │      │Automation│          │
│  │ Service │      │ Service  │      │ Service  │          │
│  └─────────┘      └──────────┘      └──────────┘          │
│      │                   │                   │             │
│      ▼                   ▼                   ▼             │
│  ┌─────────┐      ┌──────────┐      ┌──────────┐          │
│  │Briefing │      │WebSocket │      │  Config  │          │
│  │ Service │      │  Server  │      │ Manager  │          │
│  └─────────┘      └──────────┘      └──────────┘          │
└────────┬─────────────────┬──────────────────┬──────────────┘
         │                 │                  │
         ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Speech API  │  │ Claude/GPT-4 │  │System Control│
│   (Google)   │  │   (Anthropic/│  │   (OS APIs)  │
│              │  │    OpenAI)   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Component Details

### 1. Frontend Layer

#### Technology Stack
- **Framework**: React 18 + TypeScript
- **Desktop**: Electron 28
- **3D Graphics**: Three.js + React Three Fiber
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Build**: Vite

#### Components

**JarvisOrb** (`src/components/JarvisOrb.tsx`)
- 3D animated sphere using Three.js
- Particle system for holographic effect
- Reactive to voice activity
- WebGL rendering

**VoiceVisualizer** (`src/components/VoiceVisualizer.tsx`)
- 40-bar audio spectrum
- Real-time animation
- Frequency-based visualization

**SystemStats** (`src/components/SystemStats.tsx`)
- CPU, memory, disk monitoring
- Animated progress bars
- Status indicators
- Real-time updates

**ConversationPanel** (`src/components/ConversationPanel.tsx`)
- Chat interface
- Message history
- Text input
- WebSocket communication

**Dashboard** (`src/components/Dashboard.tsx`)
- Time/date display
- Quick actions
- System information

#### State Management
- React Hooks (useState, useEffect)
- Custom hook: `useWebSocket`
- Real-time WebSocket connection

### 2. Backend Layer

#### Technology Stack
- **Language**: Python 3.8+
- **AI**: Anthropic Claude / OpenAI GPT-4
- **Speech**: SpeechRecognition + pyttsx3
- **System**: psutil, pyautogui
- **Communication**: WebSockets (websockets lib)
- **Web**: FastAPI (future REST API)

#### Core Services

**JarvisCore** (`core/jarvis_core.py`)
```python
Responsibilities:
- Main event loop
- Conversation management
- Service coordination
- Context tracking
- User interaction handling
```

**VoiceService** (`services/voice_service.py`)
```python
Responsibilities:
- Wake word detection
- Speech-to-text conversion
- Text-to-speech synthesis
- Microphone management
- Audio processing
```

**AIService** (`services/ai_service.py`)
```python
Responsibilities:
- AI model integration
- Personality management
- Context-aware responses
- Action extraction
- Conversation memory
```

**AutomationService** (`services/automation_service.py`)
```python
Responsibilities:
- Application control
- File operations
- System commands
- Media control
- Web automation
```

**BriefingService** (`services/briefing_service.py`)
```python
Responsibilities:
- Morning briefings
- Weather information
- Calendar integration
- News aggregation
- System status reports
```

**WebSocketServer** (`api/websocket_server.py`)
```python
Responsibilities:
- Frontend communication
- Real-time updates
- Message broadcasting
- Client management
```

### 3. Data Flow

#### Voice Interaction Flow

```
1. User speaks → "Hey JARVIS"
2. VoiceService detects wake word
3. JarvisCore activates
4. VoiceService listens for command
5. Speech → Text transcription
6. JarvisCore processes command
   ├─ Direct command? → Execute
   └─ AI needed? → AIService
7. AIService generates response
   ├─ Text response
   └─ Optional: Action to execute
8. AutomationService executes action (if any)
9. VoiceService speaks response
10. WebSocket broadcasts to frontend
11. Frontend updates UI
```

#### WebSocket Message Flow

```
Frontend → Backend:
{
  "type": "user_input",
  "text": "What time is it?"
}

Backend → Frontend:
{
  "type": "ai_response",
  "text": "It's currently 2:30 PM, sir."
}

{
  "type": "system_stats",
  "data": {
    "cpu": 45.2,
    "memory": 67.8,
    "disk": "256 GB"
  }
}
```

### 4. Configuration System

#### Environment Variables (`.env`)
```env
AI_SERVICE=anthropic
ANTHROPIC_API_KEY=sk-ant-...
USER_NAME=Tony
USER_LOCATION=Malibu, CA
WAKE_WORD=jarvis
VOICE_RATE=175
```

#### Personality Config (`config/personality.json`)
```json
{
  "name": "JARVIS",
  "voice": { "accent": "British", "tone": "Professional" },
  "personality_traits": [...],
  "communication_style": {...},
  "user_preferences": {...}
}
```

### 5. External Integrations

#### AI Models
- **Anthropic Claude Sonnet 4.5**: Primary AI brain
- **OpenAI GPT-4**: Alternative AI brain
- Uses streaming for real-time responses

#### Speech APIs
- **Google Speech Recognition**: Voice-to-text
- **pyttsx3**: Text-to-speech (local)
- **Porcupine** (optional): Wake word detection

#### Weather API
- **OpenWeatherMap**: Weather data
- Free tier: 1000 calls/day

#### System APIs
- **psutil**: System monitoring
- **pyautogui**: GUI automation
- **subprocess**: Process control
- **webbrowser**: Browser control

### 6. Security Architecture

#### API Key Management
- Stored in `.env` (not committed)
- Loaded via python-dotenv
- Never exposed to frontend

#### Command Whitelisting
```python
safe_commands = [
    'shutdown', 'restart',
    'sleep', 'lock'
]
```

#### WebSocket Security
- localhost only by default
- Message validation
- Type checking

#### File Access
- Restricted to user home directory
- No system file modification
- Read-only by default

### 7. Performance Considerations

#### Voice Processing
- **Latency**: ~500ms (wake word to response)
- **CPU Usage**: 5-10% idle, 20-30% active
- **Memory**: ~200MB backend, ~150MB frontend

#### AI Response Time
- **Claude/GPT-4**: 1-3 seconds
- **Caching**: None (real-time only)
- **Streaming**: Not yet implemented

#### UI Rendering
- **60 FPS**: Smooth animations
- **WebGL**: Hardware accelerated
- **React**: Virtual DOM optimization

### 8. Scalability

#### Current Limitations
- Single user only
- Single conversation thread
- Local processing only
- No cloud sync

#### Future Enhancements
- Multi-user support
- Cloud conversation history
- Distributed processing
- Mobile apps

### 9. Error Handling

#### Backend
```python
try:
    # Process command
except Exception as e:
    logger.error(f"Error: {e}")
    await jarvis.speak(
        "I apologize, but I encountered an error."
    )
```

#### Frontend
```typescript
useEffect(() => {
  try {
    // WebSocket connection
  } catch (error) {
    console.error('Connection failed:', error)
    // Retry logic
  }
}, [])
```

### 10. Deployment Architecture

#### Development
```
Backend: python main.py (port 8765)
Frontend: npm run dev (port 5173)
```

#### Production
```
Backend: systemd service / Windows service
Frontend: Electron app (bundled)
```

#### Distribution
```
Platform          Package Format
Windows           .exe (electron-builder)
macOS            .dmg / .app
Linux            .AppImage / .deb
```

## Technology Decisions

### Why Python for Backend?
- Excellent AI/ML libraries
- Easy system integration
- Strong speech processing tools
- Rapid development

### Why React/Electron for Frontend?
- Cross-platform desktop apps
- Rich UI capabilities
- Large ecosystem
- Web technologies

### Why WebSockets?
- Real-time bidirectional communication
- Low latency
- Event-driven
- Simple protocol

### Why Three.js?
- Powerful 3D graphics
- WebGL support
- Good React integration
- Holographic effects

## Development Workflow

```bash
# Start backend
cd backend
source venv/bin/activate
python main.py

# Start frontend (separate terminal)
cd frontend
npm run dev

# Access UI
http://localhost:5173
```

## Testing Strategy

### Unit Tests
- Service modules
- Core functionality
- Utility functions

### Integration Tests
- Service communication
- WebSocket flow
- Voice pipeline

### Manual Tests
- Voice commands
- UI interactions
- System commands

---

This architecture provides a solid foundation for a production-grade AI assistant while maintaining flexibility for future enhancements.
