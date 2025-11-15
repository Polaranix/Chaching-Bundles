"""
JARVIS Core - Central orchestration and conversation management
"""

import asyncio
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


class JarvisCore:
    """
    Core JARVIS system that orchestrates all services and handles
    the main conversation loop
    """

    def __init__(self, voice_service, ai_service, automation_service, briefing_service):
        self.voice = voice_service
        self.ai = ai_service
        self.automation = automation_service
        self.briefing = briefing_service

        self.conversation_history = []
        self.user_context = {}
        self.is_listening = False
        self.last_interaction = None

        # Load user preferences and context
        self._load_user_context()

    def _load_user_context(self):
        """Load user preferences and context"""
        import os

        self.user_context = {
            'name': os.getenv('USER_NAME', 'Sir'),
            'location': os.getenv('USER_LOCATION', 'Unknown'),
            'timezone': os.getenv('USER_TIMEZONE', 'UTC'),
            'preferences': {
                'morning_briefing': True,
                'auto_organize_files': False,
                'system_monitoring': True
            }
        }

    async def run(self):
        """Main JARVIS loop"""
        logger.info("JARVIS core running...")

        # Check if it's morning and give briefing
        await self._check_morning_briefing()

        # Start listening loop
        while True:
            try:
                # Listen for wake word
                if await self.voice.detect_wake_word():
                    logger.info("Wake word detected!")
                    await self.handle_interaction()

                await asyncio.sleep(0.1)

            except Exception as e:
                logger.error(f"Error in main loop: {e}", exc_info=True)
                await asyncio.sleep(1)

    async def handle_interaction(self):
        """Handle a single user interaction"""
        try:
            # Play activation sound
            await self.speak("Yes, sir?")

            # Listen for command
            user_input = await self.voice.listen()

            if not user_input:
                await self.speak("I didn't catch that, sir.")
                return

            logger.info(f"User: {user_input}")

            # Add to conversation history
            self.conversation_history.append({
                'role': 'user',
                'content': user_input,
                'timestamp': datetime.now()
            })

            # Check if it's a direct command or needs AI processing
            command_result = await self._try_execute_command(user_input)

            if command_result:
                # Direct command executed
                response = command_result
            else:
                # Use AI for conversation and complex tasks
                response = await self.ai.get_response(
                    user_input,
                    self.conversation_history,
                    self.user_context
                )

                # Check if AI wants to execute a task
                if response.get('action'):
                    action_result = await self.automation.execute_action(response['action'])
                    response['message'] = f"{response['message']} {action_result}"

            # Add to conversation history
            self.conversation_history.append({
                'role': 'assistant',
                'content': response.get('message', response),
                'timestamp': datetime.now()
            })

            # Speak response
            await self.speak(response.get('message', response))

            self.last_interaction = datetime.now()

        except Exception as e:
            logger.error(f"Error handling interaction: {e}", exc_info=True)
            await self.speak("I apologize, but I encountered an error processing that request.")

    async def _try_execute_command(self, text: str) -> Optional[str]:
        """Try to execute direct commands without AI"""
        text_lower = text.lower()

        # System commands
        if "what time is it" in text_lower or "current time" in text_lower:
            current_time = datetime.now().strftime("%I:%M %p")
            return f"It's currently {current_time}, sir."

        if "system stats" in text_lower or "system status" in text_lower:
            stats = await self.automation.get_system_stats()
            return f"System status: CPU at {stats['cpu']}%, Memory at {stats['memory']}%, {stats['disk']} disk space remaining."

        if "open" in text_lower:
            # Extract app name
            app_name = text_lower.replace("open", "").strip()
            result = await self.automation.open_application(app_name)
            return result

        if "search for" in text_lower or "google" in text_lower:
            query = text_lower.replace("search for", "").replace("google", "").strip()
            result = await self.automation.web_search(query)
            return result

        return None

    async def _check_morning_briefing(self):
        """Check if it's morning and give briefing"""
        if not self.user_context.get('preferences', {}).get('morning_briefing'):
            return

        now = datetime.now()
        if 6 <= now.hour <= 9:  # Morning hours
            # Check if we already gave briefing today
            if self.last_interaction and self.last_interaction.date() == now.date():
                return

            logger.info("Giving morning briefing...")
            briefing = await self.briefing.get_morning_briefing(self.user_context)
            await self.speak(briefing)

    async def speak(self, text: str):
        """Speak text through voice service"""
        logger.info(f"JARVIS: {text}")
        await self.voice.speak(text)

    async def shutdown(self):
        """Shutdown JARVIS systems"""
        logger.info("Shutting down JARVIS core...")
        await self.voice.shutdown()
