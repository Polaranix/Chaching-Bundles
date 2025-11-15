# JARVIS Setup Guide

Complete step-by-step guide to set up your JARVIS AI assistant.

## Prerequisites

Before starting, ensure you have:

1. **Python 3.8 or higher**
   ```bash
   python --version
   ```

2. **Node.js 18 or higher**
   ```bash
   node --version
   ```

3. **Git** (for cloning the repository)

4. **Microphone and speakers/headphones**

5. **API Keys**:
   - Anthropic API key (recommended) OR OpenAI API key
   - OpenWeatherMap API key (free tier available)

## Step 1: Get API Keys

### Anthropic API Key (Recommended)
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and save it securely

### OpenAI API Key (Alternative)
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy and save it securely

### Weather API Key (Optional but recommended)
1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Navigate to API Keys
4. Copy your API key

## Step 2: Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd jarvis-assistant/backend
   ```

2. **Create Python virtual environment**:
   ```bash
   # On Linux/Mac
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

   **Note**: If you encounter issues with PyAudio:

   - **On Ubuntu/Debian**:
     ```bash
     sudo apt-get install python3-pyaudio portaudio19-dev
     pip install pyaudio
     ```

   - **On macOS**:
     ```bash
     brew install portaudio
     pip install pyaudio
     ```

   - **On Windows**: Download the appropriate .whl file from https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio

4. **Configure environment variables**:
   ```bash
   cd ..
   cp .env.example .env
   ```

5. **Edit .env file** with your information:
   ```bash
   # Use your preferred editor
   nano .env
   # or
   vim .env
   # or
   code .env
   ```

   Update these values:
   ```env
   AI_SERVICE=anthropic
   ANTHROPIC_API_KEY=your_actual_api_key_here
   USER_NAME=Your Name
   USER_LOCATION=Your City, State
   WEATHER_API_KEY=your_weather_api_key_here
   ```

## Step 3: Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

   This will install React, Electron, Three.js, and all required packages.

## Step 4: Personalization

Edit the personality configuration to customize JARVIS:

```bash
nano backend/config/personality.json
```

Customize:
- Your name and location
- JARVIS's speaking style
- Morning briefing preferences
- Automation rules
- Work hours

## Step 5: Run JARVIS

### Option 1: Development Mode (Recommended for first run)

Open two terminal windows:

**Terminal 1 - Backend**:
```bash
cd jarvis-assistant/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

You should see:
```
Initializing JARVIS systems...
Starting voice recognition system...
Connecting to AI service...
All systems online. JARVIS is ready.
```

**Terminal 2 - Frontend**:
```bash
cd jarvis-assistant/frontend
npm run dev
```

Then open your browser to http://localhost:5173

### Option 2: Electron Desktop App

```bash
cd jarvis-assistant/frontend
npm run electron:dev
```

This will start both the web server and Electron app.

## Step 6: Test JARVIS

1. **Test Voice Recognition**:
   - Make sure your microphone is connected
   - Say "Hey JARVIS" or "JARVIS"
   - Wait for the activation sound
   - Say a command like "What time is it?"

2. **Test Commands**:
   - "What's the weather like?"
   - "Open Chrome"
   - "What's the system status?"
   - "Search for Python tutorials"

3. **Test UI**:
   - Press `Ctrl+Shift+J` to toggle dashboard
   - Type messages in the conversation panel
   - Watch the voice visualizer animate

## Troubleshooting

### Microphone not working
```bash
# Test microphone
python -c "import speech_recognition as sr; print(sr.Microphone.list_microphone_names())"
```

### Audio output issues
Check that `pyttsx3` is properly installed and system audio is working:
```bash
python -c "import pyttsx3; engine = pyttsx3.init(); engine.say('Testing'); engine.runAndWait()"
```

### WebSocket connection failed
- Ensure backend is running on port 8765
- Check firewall settings
- Verify no other application is using port 8765

### API Key errors
- Verify API keys are correctly copied to .env
- Check for extra spaces or quotes
- Ensure no line breaks in the keys

### Import errors
```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

## Optional: Auto-start on Boot

### Linux (systemd)

Create a service file:
```bash
sudo nano /etc/systemd/system/jarvis.service
```

Add:
```ini
[Unit]
Description=JARVIS AI Assistant
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/jarvis-assistant/backend
ExecStart=/path/to/jarvis-assistant/backend/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable jarvis
sudo systemctl start jarvis
```

### macOS (launchd)

Create a plist file at `~/Library/LaunchAgents/com.jarvis.assistant.plist`

### Windows (Task Scheduler)

Create a scheduled task that runs on login.

## Next Steps

1. **Customize personality** - Edit `backend/config/personality.json`
2. **Add calendar integration** - Set up Google Calendar API
3. **Train wake word** - Use Porcupine for custom wake words
4. **Create shortcuts** - Add custom voice commands
5. **Extend automation** - Add more PC control features

## Getting Help

- Check the logs in `backend/jarvis.log`
- Review error messages carefully
- Ensure all prerequisites are installed
- Test components individually

## Security Notes

- **Never commit .env file** to version control
- Keep API keys secure
- Be cautious with system automation commands
- Review all automation rules before enabling
- Use voice authentication for sensitive commands

---

Enjoy your JARVIS assistant! 🤖
