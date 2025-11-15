# JARVIS Usage Guide

Complete guide to using your JARVIS AI assistant like Tony Stark!

## Voice Commands

JARVIS responds to voice commands. First, activate JARVIS by saying the wake word, then give your command.

### Activation
- "Hey JARVIS"
- "JARVIS"

Wait for JARVIS to respond with "Yes, sir?" then give your command.

## Command Categories

### 1. System Control

**Open Applications**:
- "Open Chrome"
- "Open Firefox"
- "Open Visual Studio Code"
- "Open Calculator"
- "Open File Explorer"
- "Open Terminal"

**System Commands**:
- "What time is it?"
- "What's the date?"
- "Show system stats"
- "System status"
- "Lock the computer"
- "Sleep mode"
- "Shutdown" (with 60-second countdown)
- "Restart"

### 2. Information & Search

**Web Search**:
- "Search for Python tutorials"
- "Google artificial intelligence"
- "Find restaurants near me"

**Weather**:
- "What's the weather?"
- "Weather forecast"
- "Will it rain today?"

**Time & Date**:
- "What time is it?"
- "What's today's date?"
- "What day is it?"

### 3. Conversational AI

JARVIS can have natural conversations and help with:

- **General Questions**: "What is quantum computing?"
- **Explanations**: "Explain how neural networks work"
- **Advice**: "What's the best way to learn programming?"
- **Analysis**: "Analyze this situation..."
- **Planning**: "Help me plan my day"

### 4. Morning Briefing

JARVIS automatically provides a morning briefing between 6-9 AM including:
- Current time and date
- Weather forecast
- System status
- Calendar events (when configured)
- News highlights (when configured)
- Reminders

You can also request it manually:
- "Give me a briefing"
- "Morning update"
- "Status report"

### 5. Media Control

- "Play music" / "Pause"
- "Next track" / "Previous track"
- "Volume up" / "Volume down"
- "Mute"

### 6. File Management

- "Search for PDF files"
- "Find files named project"
- "Show recent documents"

## UI Controls

### Dashboard

The main dashboard displays:
- **JARVIS Orb**: Central animated orb that pulses when active
- **Voice Visualizer**: Shows voice activity
- **System Stats**: CPU, Memory, Storage usage
- **Conversation Panel**: Text-based chat interface
- **Status Indicators**: Network, power, system status

### Keyboard Shortcuts

- `Ctrl + Shift + J` - Toggle dashboard visibility
- Type in conversation panel for text-based interaction

### Dashboard Sections

**Left Panel - System Stats**:
- Real-time CPU usage
- Memory usage
- Storage availability
- System status indicators

**Center - Main Display**:
- 3D JARVIS orb
- Voice visualizer
- Status messages

**Right Panel - Conversation**:
- Message history
- Text input for manual commands
- Timestamps

**Bottom - Quick Dashboard**:
- Time and date
- Network status
- Power status
- Quick action buttons

## Interaction Modes

### 1. Voice Mode (Primary)
- Say wake word
- Wait for acknowledgment
- Speak your command
- Listen to response

### 2. Text Mode
- Type in conversation panel
- Press Enter or click Send
- Read response

### 3. Minimized Mode
- Press `Ctrl + Shift + J` to minimize
- JARVIS becomes a floating orb in corner
- Still listens for wake word
- Click orb to restore full interface

## Personality & Communication

### JARVIS's Style

JARVIS communicates with:
- **British butler demeanor**: Professional and polite
- **Formal address**: Calls you "sir" or "ma'am"
- **Calm composure**: Never flustered
- **Subtle wit**: Occasionally dry humor
- **Efficiency**: Concise but informative

### Common Phrases

You'll hear JARVIS say:
- "Right away, sir"
- "Certainly"
- "I'm afraid that..."
- "I should point out..."
- "If I may suggest..."
- "At your service"
- "Very good, sir"

## Tips for Best Experience

### Voice Commands

1. **Speak clearly** and at normal pace
2. **Wait for activation** sound before speaking
3. **Pause briefly** after wake word
4. **Be specific** with commands
5. **Natural language** works - no need for exact phrases

### Customization

Edit `backend/config/personality.json` to customize:
- Your name and how JARVIS addresses you
- Location for weather
- Morning briefing preferences
- Wake word (requires additional setup)
- Automation rules

### Background Operation

JARVIS can run in the background:
1. Minimize to system tray
2. Still listens for wake word
3. Press hotkey to restore
4. Auto-starts on login (when configured)

## Example Conversations

### Simple Task
```
You: "Hey JARVIS"
JARVIS: "Yes, sir?"
You: "What time is it?"
JARVIS: "It's currently 2:30 PM, sir."
```

### Complex Task
```
You: "JARVIS"
JARVIS: "Yes, sir?"
You: "I need to prepare for a presentation tomorrow"
JARVIS: "Certainly. I can help you with that. What topic is the presentation on?"
You: "Machine learning applications"
JARVIS: "Very good. Would you like me to search for recent developments in machine learning applications, or help you organize your existing materials?"
You: "Search for recent developments"
JARVIS: "Opening browser with search results for recent machine learning applications."
```

### Morning Routine
```
JARVIS: "Good morning, sir. It is 7:00 AM on Monday, January 15, 2024.
         Current weather: 72°F, partly cloudy. High of 78° expected.
         System status: All systems operating normally.
         How may I be of service today?"
```

## Troubleshooting

### JARVIS Not Responding to Voice

1. Check microphone is connected
2. Verify microphone permissions
3. Try speaking louder or closer to mic
4. Check backend logs: `backend/jarvis.log`

### UI Not Updating

1. Refresh the page
2. Check WebSocket connection status
3. Restart backend server
4. Clear browser cache

### Commands Not Working

1. Be more specific with commands
2. Try text mode instead
3. Check logs for errors
4. Verify services are running

### Voice Sounds Wrong

1. Edit voice settings in `.env`:
   ```
   VOICE_RATE=175
   VOICE_VOLUME=0.9
   ```
2. Install additional TTS voices
3. Restart JARVIS

## Advanced Features

### Custom Commands

Add custom commands by modifying:
`backend/core/jarvis_core.py` - `_try_execute_command()` method

### API Integrations

Integrate additional services:
- Google Calendar (calendar events)
- Gmail (email management)
- Spotify (music control)
- Smart home devices
- Custom APIs

See `backend/services/` to add new service modules.

### Automation Rules

Configure in `backend/config/personality.json`:
```json
{
  "automation_rules": {
    "auto_organize_files": true,
    "smart_notifications": true,
    "power_management": true
  }
}
```

## Security & Privacy

### API Keys
- Never share your API keys
- Store securely in `.env` file
- Rotate keys periodically

### Voice Data
- Voice recognition happens locally
- Only transcribed text sent to AI
- No recordings stored by default

### System Access
- JARVIS has system-level permissions
- Review automation commands
- Use whitelist for system commands

## Getting More Help

- Check logs: `backend/jarvis.log`
- Review README.md for architecture
- See SETUP.md for installation issues
- Report bugs on GitHub

---

"I am JARVIS. You will be my top priority, sir." 🤖
