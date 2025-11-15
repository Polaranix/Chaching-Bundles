# JARVIS Command Reference Card

Quick reference for all JARVIS voice commands and features.

## Activation

| Command | Action |
|---------|--------|
| "Hey JARVIS" | Activate JARVIS |
| "JARVIS" | Activate JARVIS |

Wait for "Yes, sir?" before giving your command.

## System Control

### Applications
```
"Open Chrome"
"Open Firefox"
"Open Visual Studio Code"
"Open Calculator"
"Open File Explorer"
"Open Terminal"
"Open Notepad"
```

### System Commands
```
"What time is it?"
"What's the date?"
"What day is it?"
"Show system stats"
"System status"
"Lock the computer"
"Sleep mode"
"Shutdown"
"Restart"
```

## Information & Search

### Web Search
```
"Search for [topic]"
"Google [query]"
"Find [something]"
"Look up [information]"
```

### Weather
```
"What's the weather?"
"Weather forecast"
"Will it rain today?"
"What's the temperature?"
```

### Time & Date
```
"What time is it?"
"What's today's date?"
"What day is it?"
"What's the current time?"
```

## Media Control

```
"Play music"
"Pause"
"Next track"
"Previous track"
"Volume up"
"Volume down"
"Mute"
```

## File Management

```
"Search for PDF files"
"Find files named [name]"
"Show recent documents"
```

## Conversational AI

### Questions
```
"What is [topic]?"
"Explain [concept]"
"How do I [task]?"
"Tell me about [subject]"
```

### Assistance
```
"Help me with [task]"
"I need advice on [topic]"
"Analyze [situation]"
"What do you think about [topic]?"
```

### Planning
```
"Help me plan my day"
"Create a schedule for [task]"
"Remind me to [action]"
```

## Briefings & Updates

```
"Give me a briefing"
"Morning update"
"Status report"
"Quick update"
"System report"
```

## Example Conversations

### Simple Tasks

**Open Application**
```
You: "Hey JARVIS"
JARVIS: "Yes, sir?"
You: "Open Chrome"
JARVIS: "Opening Chrome, sir."
```

**Check Time**
```
You: "JARVIS"
JARVIS: "Yes, sir?"
You: "What time is it?"
JARVIS: "It's currently 2:30 PM, sir."
```

**Weather**
```
You: "Hey JARVIS"
JARVIS: "Yes, sir?"
You: "What's the weather?"
JARVIS: "Current weather: 72°F, partly cloudy."
```

### Complex Tasks

**Research Request**
```
You: "JARVIS"
JARVIS: "Yes, sir?"
You: "Search for Python machine learning tutorials"
JARVIS: "Opening browser with search results for Python machine learning tutorials."
```

**System Check**
```
You: "Hey JARVIS"
JARVIS: "Yes, sir?"
You: "System status"
JARVIS: "System status: CPU at 45%, Memory at 67%, 256 GB disk space remaining."
```

**Planning Session**
```
You: "JARVIS"
JARVIS: "Yes, sir?"
You: "I need to prepare for a presentation tomorrow"
JARVIS: "Certainly. I can help you with that. What topic is the presentation on?"
You: "Artificial intelligence"
JARVIS: "Very good. Would you like me to search for recent developments in AI, or help organize your materials?"
You: "Search for recent developments"
JARVIS: "Right away, sir. Opening browser."
```

## UI Controls

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+J` | Toggle dashboard |
| `Ctrl+Shift+J` (minimized) | Restore dashboard |
| Type in chat | Send text command |
| `Enter` | Send message |

### Mouse Controls

| Action | Result |
|--------|--------|
| Click minimized orb | Restore interface |
| Type in conversation panel | Text-based commands |
| Click Send button | Submit message |
| Click action buttons | Execute quick actions |

## Tips for Best Results

### Voice Commands

1. **Speak clearly** at normal pace
2. **Wait for response** after wake word
3. **Be specific** with commands
4. **Use natural language** - no need for exact phrases
5. **Pause briefly** between wake word and command

### Examples

✅ Good: "Open Chrome"
✅ Good: "What's the weather like today?"
✅ Good: "Search for Python tutorials"

❌ Avoid: "chrome" (too short)
❌ Avoid: Speaking too fast
❌ Avoid: Multiple commands at once

## Customization

### Change Voice Settings
Edit `.env`:
```env
VOICE_RATE=175        # Speed (100-300)
VOICE_VOLUME=0.9      # Volume (0.0-1.0)
```

### Change Wake Word
Edit `.env`:
```env
WAKE_WORD=jarvis      # Your preferred word
```

### Customize Personality
Edit `backend/config/personality.json`

## Troubleshooting Commands

### Test Voice
```
"Hello JARVIS"
"Can you hear me?"
"Testing"
```

### Check System
```
"System status"
"Are you working?"
"Run diagnostics"
```

## Advanced Features

### Chain Commands (via conversation)
```
You: "I need to work on my project"
JARVIS: "Of course. What would you like me to do?"
You: "Open Visual Studio Code and search for React documentation"
JARVIS: "Opening Visual Studio Code and searching for React documentation."
```

### Context Awareness
JARVIS remembers your conversation:
```
You: "What's the weather?"
JARVIS: "72°F, partly cloudy."
You: "Will it rain?"
JARVIS: "Based on the forecast, there's a 20% chance of rain later today."
```

## Quick Action Buttons (Dashboard)

| Button | Action |
|--------|--------|
| DIAGNOSTICS | System health check |
| SETTINGS | Open settings |
| BRIEFING | Request briefing |
| HELP | Show help |

## Status Indicators

### Voice Status
- "READY" - Waiting for wake word
- "LISTENING..." - Recording your command
- "PROCESSING..." - Understanding/executing

### Connection Status
- "ONLINE" - All systems operational
- "CONNECTING..." - Establishing connection

### System Status
- Green pulse - Normal operation
- Yellow - Warning/high usage
- Red - Error/critical

## Command Categories Summary

1. **System Control** - 15+ commands
2. **Information** - 10+ queries
3. **Media** - 7 controls
4. **Files** - 5+ operations
5. **AI Conversation** - Unlimited natural language

## Getting More Help

- Full usage guide: `USAGE_GUIDE.md`
- Feature list: `FEATURES.md`
- Setup help: `SETUP.md`
- Logs: `backend/jarvis.log`

---

**Pro Tip**: JARVIS learns from conversation context. The more you interact, the better it understands your preferences!

"I'm JARVIS. You will be my top priority." 🤖
