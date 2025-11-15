# JARVIS - Personal AI Assistant

A fully-featured AI assistant inspired by JARVIS from Iron Man, complete with voice interaction, task automation, and an Iron Man-style holographic interface.

## Features

### Voice & AI
- 🎤 Voice recognition with wake word detection ("Hey JARVIS")
- 🗣️ Natural text-to-speech responses with British accent (JARVIS voice)
- 🧠 Advanced AI conversation with personality and context awareness
- 💬 Personalized interactions based on your preferences

### Task Automation
- 🖥️ PC control (open apps, manage files, system commands)
- 📁 File operations (search, organize, backup)
- 🌐 Web automation (search, browse, get information)
- 📧 Email and calendar integration
- 🎵 Media control (music, videos)

### Personal Assistant
- ☀️ Morning briefings (weather, calendar, news, tasks)
- ⏰ Reminders and scheduling
- 📊 System monitoring (CPU, memory, network)
- 📝 Note-taking and task management
- 🔔 Smart notifications

### Iron Man Interface
- 💙 Holographic blue HUD interface
- 📈 Real-time system dashboard
- 🎙️ Voice visualizer with animations
- ⚡ Animated transitions and effects
- 🎯 Always-on-screen overlay mode

## Tech Stack

- **Backend**: Python 3.x
  - Speech Recognition (SpeechRecognition, PyAudio)
  - Text-to-Speech (pyttsx3)
  - AI Integration (OpenAI API / Anthropic Claude)
  - System Automation (pyautogui, psutil, subprocess)

- **Frontend**: Electron + React + TypeScript
  - React for UI components
  - Three.js for 3D effects
  - Framer Motion for animations
  - Tailwind CSS for styling

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Microphone and speakers
- API key for AI service (OpenAI or Anthropic)

### Installation

1. Install Python dependencies:
```bash
cd jarvis-assistant/backend
pip install -r requirements.txt
```

2. Install Node dependencies:
```bash
cd jarvis-assistant/frontend
npm install
```

3. Configure your settings:
```bash
cp .env.example .env
# Edit .env with your API keys and preferences
```

4. Run JARVIS:
```bash
# Terminal 1 - Start backend
cd backend
python main.py

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

## Usage

1. **Voice Activation**: Say "Hey JARVIS" to activate
2. **Give Commands**:
   - "What's on my schedule today?"
   - "Open Visual Studio Code"
   - "Search for Python tutorials"
   - "What's the weather like?"
   - "Set a reminder for 3 PM"
   - "Show me system stats"

3. **Dashboard**: Press `Ctrl+Shift+J` to toggle the dashboard overlay

## Personalization

Edit `backend/config/personality.json` to customize:
- JARVIS's personality and speaking style
- Your preferences and routines
- Wake words and voice settings
- Dashboard appearance

## License

MIT License - Build your own JARVIS!
