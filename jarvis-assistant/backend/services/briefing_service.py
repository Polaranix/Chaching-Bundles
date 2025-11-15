"""
Briefing Service - Morning briefings and personalized updates
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List
import os

logger = logging.getLogger(__name__)


class BriefingService:
    """Provides personalized briefings and updates"""

    def __init__(self):
        self.weather_api_key = os.getenv('WEATHER_API_KEY')
        logger.info("Briefing service initialized")

    async def get_morning_briefing(self, user_context: Dict) -> str:
        """
        Generate comprehensive morning briefing
        """
        try:
            name = user_context.get('name', 'Sir')
            location = user_context.get('location', 'your location')

            # Get all briefing components
            greeting = self._get_time_appropriate_greeting(name)
            date_time = self._get_date_time_info()
            weather = await self._get_weather_info(location)
            system_status = await self._get_system_status()
            # calendar = await self._get_calendar_events()
            # tasks = await self._get_tasks()

            # Compile briefing
            briefing = f"""{greeting}

{date_time}

{weather}

{system_status}

How may I be of service today?"""

            return briefing

        except Exception as e:
            logger.error(f"Error generating briefing: {e}", exc_info=True)
            return "Good morning, sir. All systems operational."

    def _get_time_appropriate_greeting(self, name: str) -> str:
        """Get greeting based on time of day"""
        hour = datetime.now().hour

        if hour < 12:
            return f"Good morning, {name}."
        elif hour < 17:
            return f"Good afternoon, {name}."
        else:
            return f"Good evening, {name}."

    def _get_date_time_info(self) -> str:
        """Get current date and time"""
        now = datetime.now()
        date_str = now.strftime("%A, %B %d, %Y")
        time_str = now.strftime("%I:%M %p")

        return f"It is {time_str} on {date_str}."

    async def _get_weather_info(self, location: str) -> str:
        """Get weather information"""
        try:
            if not self.weather_api_key:
                return "Weather information unavailable. Please configure WEATHER_API_KEY."

            import aiohttp

            # OpenWeatherMap API
            url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={self.weather_api_key}&units=imperial"

            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()

                        temp = round(data['main']['temp'])
                        feels_like = round(data['main']['feels_like'])
                        description = data['weather'][0]['description']
                        humidity = data['main']['humidity']

                        return f"Current weather in {location}: {temp}°F, feels like {feels_like}°F. {description.capitalize()}. Humidity at {humidity}%."
                    else:
                        return "Unable to retrieve weather information at this time."

        except Exception as e:
            logger.error(f"Error getting weather: {e}")
            return "Weather information temporarily unavailable."

    async def _get_system_status(self) -> str:
        """Get system health status"""
        try:
            import psutil

            cpu = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')

            status_parts = []

            # CPU status
            if cpu > 80:
                status_parts.append(f"CPU usage high at {cpu}%")
            else:
                status_parts.append(f"CPU nominal at {cpu}%")

            # Memory status
            if memory.percent > 80:
                status_parts.append(f"Memory usage high at {memory.percent}%")
            else:
                status_parts.append(f"Memory at {memory.percent}%")

            # Disk status
            disk_free_gb = disk.free / (1024**3)
            if disk_free_gb < 10:
                status_parts.append(f"Low disk space: {disk_free_gb:.1f} GB remaining")

            if len(status_parts) == 2 and cpu < 50 and memory.percent < 50:
                return "All systems operating normally."
            else:
                return "System status: " + ", ".join(status_parts) + "."

        except Exception as e:
            logger.error(f"Error getting system status: {e}")
            return "System status: Operational."

    async def _get_calendar_events(self) -> str:
        """Get today's calendar events"""
        # Placeholder for calendar integration
        # Would integrate with Google Calendar, Outlook, etc.
        return "Calendar integration coming soon."

    async def _get_tasks(self) -> str:
        """Get today's tasks"""
        # Placeholder for task management integration
        return "Task management integration coming soon."

    async def get_quick_update(self) -> str:
        """Get a quick status update"""
        try:
            time_str = datetime.now().strftime("%I:%M %p")
            system_status = await self._get_system_status()

            return f"It's {time_str}. {system_status}"

        except Exception as e:
            logger.error(f"Error getting quick update: {e}")
            return "All systems operational."
