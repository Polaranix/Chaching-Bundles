# JARVIS Quick Start Guide

Get your JARVIS AI assistant up and running in 10 minutes!

## Prerequisites Check

Quick checklist before starting:
- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] Microphone connected
- [ ] Speakers/headphones connected
- [ ] API key ready (Anthropic or OpenAI)

## 5-Minute Setup

### 1. Get Your API Key (2 minutes)

**Option A - Anthropic Claude (Recommended)**
1. Visit: https://console.anthropic.com/
2. Sign up (free trial available)
3. Create API key
4. Copy the key

**Option B - OpenAI GPT-4**
1. Visit: https://platform.openai.com/
2. Sign up
3. Create API key
4. Copy the key

### 2. Backend Setup (2 minutes)

```bash
cd jarvis-assistant/backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration (1 minute)

```bash
cd ..
cp .env.example .env
```

Edit `.env` file:
```env
AI_SERVICE=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
USER_NAME=Tony
USER_LOCATION=Your City
```

### 4. Frontend Setup (2 minutes)

```bash
cd frontend
npm install
```

### 5. Launch JARVIS (30 seconds)

**Option A - Quick Launch (Recommended)**

On Linux/Mac:
```bash
./run.sh
```

On Windows:
```bash
run.bat
```

**Option B - Manual Launch**

Terminal 1:
```bash
cd backend
source venv/bin/activate
python main.py
```

Terminal 2:
```bash
cd frontend
npm run dev
```

## First Interaction

1. **Wait for startup** - You'll see "JARVIS at your service"

2. **Test voice**:
   - Say: "Hey JARVIS"
   - Wait for: "Yes, sir?"
   - Say: "What time is it?"

3. **Open dashboard**:
   - Navigate to: http://localhost:5173
   - Or press: `Ctrl+Shift+J`

4. **Try commands**:
   ```
   "Open Chrome"
   "What's the weather?"
   "System status"
   "Search for Python tutorials"
   ```

## Common Issues & Quick Fixes

### Microphone not working
```bash
# Test microphone
python -c "import speech_recognition as sr; print(sr.Microphone.list_microphone_names())"
```

### PyAudio installation error

**Ubuntu/Debian**:
```bash
sudo apt-get install python3-pyaudio portaudio19-dev
pip install pyaudio
```

**macOS**:
```bash
brew install portaudio
pip install pyaudio
```

**Windows**:
Download wheel from: https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### WebSocket connection failed
1. Ensure backend is running first
2. Check port 8765 is not in use
3. Look for errors in backend terminal

## Next Steps

Once JARVIS is running:

1. **Customize personality**:
   ```bash
   nano backend/config/personality.json
   ```

2. **Add weather** (optional):
   - Get free API key: https://openweathermap.org/api
   - Add to `.env`: `WEATHER_API_KEY=your_key`

3. **Explore features**:
   - Read: `USAGE_GUIDE.md`
   - See all features: `FEATURES.md`

4. **Auto-start on boot** (optional):
   - See: `SETUP.md` - "Auto-start on Boot" section

## Quick Command Reference

### Voice Commands
| Command | What it does |
|---------|-------------|
| "Hey JARVIS" | Activate JARVIS |
| "What time is it?" | Get current time |
| "Open [app name]" | Launch application |
| "Search for [query]" | Web search |
| "System status" | Show system stats |
| "What's the weather?" | Weather info |

### Keyboard Shortcuts
| Shortcut | What it does |
|----------|-------------|
| `Ctrl+Shift+J` | Toggle dashboard |
| Type in chat | Text commands |

### UI Elements
- **Blue orb**: JARVIS status (pulses when active)
- **Left panel**: System statistics
- **Right panel**: Conversation history
- **Bottom bar**: Quick info and actions

## Testing Checklist

Verify everything works:

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:5173
- [ ] Dashboard displays correctly
- [ ] Wake word detection works
- [ ] Voice commands are recognized
- [ ] JARVIS responds with voice
- [ ] System stats update
- [ ] Text chat works
- [ ] Minimize/restore works

## Getting Help

**Check logs**:
```bash
tail -f backend/jarvis.log
```

**Test individual components**:
```bash
# Test TTS
python -c "import pyttsx3; e = pyttsx3.init(); e.say('Test'); e.runAndWait()"

# Test speech recognition
python -c "import speech_recognition as sr; r = sr.Recognizer(); print('OK')"
```

**Documentation**:
- Full setup: `SETUP.md`
- Usage guide: `USAGE_GUIDE.md`
- All features: `FEATURES.md`
- Main readme: `README.md`

## Pro Tips

1. **Adjust voice speed**: Edit `VOICE_RATE` in `.env` (default: 175)
2. **Change wake word**: Edit `WAKE_WORD` in `.env`
3. **Morning briefings**: Automatic between 6-9 AM
4. **Minimize to tray**: Press `Ctrl+Shift+J`
5. **Text mode**: Type commands if voice isn't working

## What's Next?

Now that JARVIS is running, you can:

1. **Personalize** - Edit personality.json
2. **Extend** - Add custom commands
3. **Integrate** - Connect calendar, email, etc.
4. **Automate** - Create task automation rules
5. **Customize UI** - Adjust colors and layout

---

**"Jarvis, sometimes you gotta run before you can walk."**

Welcome to your Iron Man experience! 🚀🤖
