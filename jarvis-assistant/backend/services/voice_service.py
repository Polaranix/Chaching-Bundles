"""
Voice Service - Speech recognition and text-to-speech
"""

import asyncio
import logging
import os
from typing import Optional

import speech_recognition as sr
import pyttsx3

logger = logging.getLogger(__name__)


class VoiceService:
    """Handles voice input/output for JARVIS"""

    def __init__(self):
        # Initialize speech recognition
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()

        # Initialize text-to-speech
        self.tts_engine = pyttsx3.init()
        self._configure_voice()

        # Wake word settings
        self.wake_word = os.getenv('WAKE_WORD', 'jarvis').lower()

        # Calibrate microphone for ambient noise
        with self.microphone as source:
            logger.info("Calibrating microphone for ambient noise...")
            self.recognizer.adjust_for_ambient_noise(source, duration=1)

        logger.info("Voice service initialized")

    def _configure_voice(self):
        """Configure TTS voice settings"""
        # Get settings from environment
        rate = int(os.getenv('VOICE_RATE', '175'))
        volume = float(os.getenv('VOICE_VOLUME', '0.9'))

        # Set voice properties
        self.tts_engine.setProperty('rate', rate)
        self.tts_engine.setProperty('volume', volume)

        # Try to set a British/professional voice
        voices = self.tts_engine.getProperty('voices')
        for voice in voices:
            # Look for male British voices or professional-sounding voices
            if 'male' in voice.name.lower() or 'david' in voice.name.lower():
                self.tts_engine.setProperty('voice', voice.id)
                logger.info(f"Using voice: {voice.name}")
                break

    async def detect_wake_word(self) -> bool:
        """
        Detect wake word ("Hey JARVIS" or "JARVIS")
        Returns True if wake word detected
        """
        try:
            with self.microphone as source:
                # Listen with short timeout for wake word
                audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=2)

            # Recognize speech
            text = self.recognizer.recognize_google(audio).lower()
            logger.debug(f"Heard: {text}")

            # Check for wake word
            if self.wake_word in text or f"hey {self.wake_word}" in text:
                return True

        except sr.WaitTimeoutError:
            # No speech detected - this is normal
            pass
        except sr.UnknownValueError:
            # Speech detected but couldn't understand - ignore
            pass
        except Exception as e:
            logger.error(f"Error detecting wake word: {e}")

        return False

    async def listen(self, timeout: int = 5) -> Optional[str]:
        """
        Listen for user input after wake word
        Returns transcribed text or None
        """
        try:
            logger.info("Listening for command...")

            with self.microphone as source:
                # Adjust for current ambient noise
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)

                # Listen for command
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=10)

            # Transcribe speech
            logger.info("Processing speech...")
            text = self.recognizer.recognize_google(audio)

            logger.info(f"Transcribed: {text}")
            return text

        except sr.WaitTimeoutError:
            logger.warning("Listening timeout - no speech detected")
            return None
        except sr.UnknownValueError:
            logger.warning("Could not understand audio")
            return None
        except Exception as e:
            logger.error(f"Error listening: {e}", exc_info=True)
            return None

    async def speak(self, text: str):
        """
        Convert text to speech and speak it
        """
        try:
            # Run TTS in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._speak_sync, text)

        except Exception as e:
            logger.error(f"Error speaking: {e}", exc_info=True)

    def _speak_sync(self, text: str):
        """Synchronous speak function"""
        self.tts_engine.say(text)
        self.tts_engine.runAndWait()

    async def shutdown(self):
        """Cleanup voice service"""
        logger.info("Shutting down voice service...")
        try:
            self.tts_engine.stop()
        except:
            pass
