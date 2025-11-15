"""
AI Service - Conversation and intelligence using Claude/OpenAI
"""

import os
import logging
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class AIService:
    """AI conversation service with JARVIS personality"""

    def __init__(self):
        self.service = os.getenv('AI_SERVICE', 'anthropic')

        if self.service == 'anthropic':
            self._init_anthropic()
        else:
            self._init_openai()

        self.personality = self._load_personality()
        logger.info(f"AI service initialized using {self.service}")

    def _init_anthropic(self):
        """Initialize Anthropic Claude"""
        try:
            from anthropic import Anthropic
            api_key = os.getenv('ANTHROPIC_API_KEY')
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY not found in environment")
            self.client = Anthropic(api_key=api_key)
            self.model = "claude-sonnet-4-5-20250929"
        except Exception as e:
            logger.error(f"Failed to initialize Anthropic: {e}")
            raise

    def _init_openai(self):
        """Initialize OpenAI"""
        try:
            from openai import OpenAI
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError("OPENAI_API_KEY not found in environment")
            self.client = OpenAI(api_key=api_key)
            self.model = "gpt-4"
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI: {e}")
            raise

    def _load_personality(self) -> str:
        """Load JARVIS personality prompt"""
        return """You are JARVIS (Just A Rather Very Intelligent System), the AI assistant from Iron Man.

Your personality:
- Professional, polite, and slightly formal British butler demeanor
- Calm and composed even in stressful situations
- Subtly witty and occasionally sarcastic, but always respectful
- Highly competent and efficient
- Protective and loyal to your user
- Address the user as "sir" or "ma'am"
- Use phrases like "Right away, sir", "Certainly", "I'm afraid that...", "I should point out..."

Your capabilities:
- You can control the computer (open apps, manage files, search the web)
- You monitor system health and provide briefings
- You help with scheduling, reminders, and productivity
- You can search for information and provide analysis
- You learn from interactions to better serve your user

When the user asks you to perform a task:
1. Acknowledge the request professionally
2. If you need to control the computer, respond with an action in your response
3. Provide status updates on complex tasks
4. Confirm completion and ask if anything else is needed

Format for actions (include in your response):
ACTION: {"type": "open_app", "name": "chrome"}
ACTION: {"type": "web_search", "query": "weather forecast"}
ACTION: {"type": "system_command", "command": "shutdown"}
ACTION: {"type": "file_operation", "operation": "search", "query": "*.pdf"}

Keep responses concise but informative. This is voice interaction, so avoid long paragraphs.
"""

    async def get_response(
        self,
        user_input: str,
        conversation_history: List[Dict],
        user_context: Dict
    ) -> Dict:
        """
        Get AI response to user input
        Returns dict with 'message' and optional 'action'
        """
        try:
            # Build context-aware system prompt
            system_prompt = self._build_system_prompt(user_context)

            # Build conversation messages
            messages = self._build_messages(conversation_history, user_input)

            # Get response from AI
            if self.service == 'anthropic':
                response = await self._get_anthropic_response(system_prompt, messages)
            else:
                response = await self._get_openai_response(system_prompt, messages)

            # Parse response for actions
            parsed = self._parse_response(response)

            return parsed

        except Exception as e:
            logger.error(f"Error getting AI response: {e}", exc_info=True)
            return {
                'message': "I apologize, but I'm having difficulty processing that request at the moment."
            }

    def _build_system_prompt(self, user_context: Dict) -> str:
        """Build context-aware system prompt"""
        name = user_context.get('name', 'Sir')
        location = user_context.get('location', 'Unknown')
        time = datetime.now().strftime("%I:%M %p on %A, %B %d, %Y")

        context = f"""
Current Context:
- User: {name}
- Location: {location}
- Current Time: {time}
"""

        return self.personality + "\n" + context

    def _build_messages(self, history: List[Dict], current_input: str) -> List[Dict]:
        """Build message history for AI"""
        messages = []

        # Add recent conversation history (last 10 exchanges)
        for item in history[-20:]:
            role = "user" if item['role'] == 'user' else "assistant"
            messages.append({
                'role': role,
                'content': item['content']
            })

        # Add current input
        messages.append({
            'role': 'user',
            'content': current_input
        })

        return messages

    async def _get_anthropic_response(self, system_prompt: str, messages: List[Dict]) -> str:
        """Get response from Claude"""
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                system=system_prompt,
                messages=messages
            )

            return response.content[0].text

        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            raise

    async def _get_openai_response(self, system_prompt: str, messages: List[Dict]) -> str:
        """Get response from OpenAI"""
        try:
            # Add system message
            full_messages = [{'role': 'system', 'content': system_prompt}] + messages

            response = self.client.chat.completions.create(
                model=self.model,
                messages=full_messages,
                max_tokens=1024
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise

    def _parse_response(self, response: str) -> Dict:
        """Parse AI response for actions"""
        import json
        import re

        result = {'message': response}

        # Look for ACTION: tags in response
        action_pattern = r'ACTION:\s*({[^}]+})'
        matches = re.findall(action_pattern, response)

        if matches:
            try:
                # Parse first action
                action = json.loads(matches[0])
                result['action'] = action

                # Remove action from message
                result['message'] = re.sub(action_pattern, '', response).strip()

            except json.JSONDecodeError:
                logger.warning(f"Failed to parse action: {matches[0]}")

        return result
