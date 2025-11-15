"""
Automation Service - System control and task automation
"""

import asyncio
import logging
import os
import subprocess
import platform
from typing import Dict, Optional

import psutil
import pyautogui

logger = logging.getLogger(__name__)


class AutomationService:
    """Handles system automation and PC control"""

    def __init__(self):
        self.platform = platform.system()
        logger.info(f"Automation service initialized on {self.platform}")

    async def execute_action(self, action: Dict) -> str:
        """
        Execute an automation action
        Returns status message
        """
        action_type = action.get('type')

        try:
            if action_type == 'open_app':
                return await self.open_application(action.get('name'))
            elif action_type == 'web_search':
                return await self.web_search(action.get('query'))
            elif action_type == 'system_command':
                return await self.execute_system_command(action.get('command'))
            elif action_type == 'file_operation':
                return await self.file_operation(action.get('operation'), action.get('query'))
            else:
                return f"Unknown action type: {action_type}"

        except Exception as e:
            logger.error(f"Error executing action: {e}", exc_info=True)
            return f"I encountered an error: {str(e)}"

    async def open_application(self, app_name: str) -> str:
        """Open an application"""
        try:
            app_name = app_name.lower().strip()

            # Map common app names to executables
            app_map = {
                'chrome': 'google-chrome' if self.platform == 'Linux' else 'chrome',
                'firefox': 'firefox',
                'vscode': 'code',
                'visual studio code': 'code',
                'terminal': 'gnome-terminal' if self.platform == 'Linux' else 'cmd',
                'file explorer': 'nautilus' if self.platform == 'Linux' else 'explorer',
                'calculator': 'gnome-calculator' if self.platform == 'Linux' else 'calc',
                'notepad': 'gedit' if self.platform == 'Linux' else 'notepad',
            }

            executable = app_map.get(app_name, app_name)

            # Execute in background
            if self.platform == 'Windows':
                subprocess.Popen(['start', executable], shell=True)
            elif self.platform == 'Darwin':  # macOS
                subprocess.Popen(['open', '-a', executable])
            else:  # Linux
                subprocess.Popen([executable])

            return f"Opening {app_name}."

        except Exception as e:
            logger.error(f"Error opening application: {e}")
            return f"I couldn't open {app_name}, sir."

    async def web_search(self, query: str) -> str:
        """Perform web search"""
        try:
            import webbrowser
            import urllib.parse

            encoded_query = urllib.parse.quote(query)
            url = f"https://www.google.com/search?q={encoded_query}"

            webbrowser.open(url)

            return f"Searching for {query}."

        except Exception as e:
            logger.error(f"Error performing web search: {e}")
            return "I encountered an error with that search."

    async def get_system_stats(self) -> Dict:
        """Get current system statistics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')

            return {
                'cpu': round(cpu_percent, 1),
                'memory': round(memory.percent, 1),
                'disk': f"{round(disk.free / (1024**3), 1)} GB"
            }

        except Exception as e:
            logger.error(f"Error getting system stats: {e}")
            return {'cpu': 0, 'memory': 0, 'disk': 'Unknown'}

    async def execute_system_command(self, command: str) -> str:
        """Execute system command (with safety checks)"""
        # Whitelist of safe commands
        safe_commands = ['shutdown', 'restart', 'sleep', 'lock']

        command = command.lower().strip()

        if command not in safe_commands:
            return f"I'm not authorized to execute that command for safety reasons."

        try:
            if command == 'shutdown':
                if self.platform == 'Windows':
                    subprocess.Popen(['shutdown', '/s', '/t', '60'])
                    return "Initiating shutdown in 60 seconds. Use 'shutdown -a' to cancel."
                else:
                    subprocess.Popen(['shutdown', '-h', '+1'])
                    return "Initiating shutdown in 1 minute."

            elif command == 'restart':
                if self.platform == 'Windows':
                    subprocess.Popen(['shutdown', '/r', '/t', '60'])
                else:
                    subprocess.Popen(['shutdown', '-r', '+1'])
                return "System restart scheduled."

            elif command == 'sleep':
                if self.platform == 'Windows':
                    subprocess.Popen(['rundll32.exe', 'powrprof.dll,SetSuspendState', '0,1,0'])
                elif self.platform == 'Darwin':
                    subprocess.Popen(['pmset', 'sleepnow'])
                else:
                    subprocess.Popen(['systemctl', 'suspend'])
                return "Entering sleep mode."

            elif command == 'lock':
                if self.platform == 'Windows':
                    subprocess.Popen(['rundll32.exe', 'user32.dll,LockWorkStation'])
                elif self.platform == 'Darwin':
                    subprocess.Popen(['/System/Library/CoreServices/Menu Extras/User.menu/Contents/Resources/CGSession', '-suspend'])
                else:
                    subprocess.Popen(['gnome-screensaver-command', '--lock'])
                return "Locking workstation."

        except Exception as e:
            logger.error(f"Error executing system command: {e}")
            return "I encountered an error executing that command."

    async def file_operation(self, operation: str, query: str) -> str:
        """Perform file operations"""
        try:
            if operation == 'search':
                # Search for files
                import glob
                home = os.path.expanduser('~')
                pattern = os.path.join(home, '**', query)
                files = glob.glob(pattern, recursive=True)[:10]  # Limit to 10

                if files:
                    file_list = '\n'.join(files)
                    return f"I found these files:\n{file_list}"
                else:
                    return f"I couldn't find any files matching {query}."

        except Exception as e:
            logger.error(f"Error with file operation: {e}")
            return "I encountered an error with that file operation."

    async def get_weather(self, location: Optional[str] = None) -> str:
        """Get weather information"""
        # This would integrate with a weather API
        # For now, return placeholder
        return "Weather integration coming soon."

    async def control_media(self, action: str) -> str:
        """Control media playback"""
        try:
            # Use pyautogui to send media keys
            if action == 'play' or action == 'pause':
                pyautogui.press('playpause')
                return "Done."
            elif action == 'next':
                pyautogui.press('nexttrack')
                return "Skipping to next track."
            elif action == 'previous':
                pyautogui.press('prevtrack')
                return "Going to previous track."
            elif action == 'volume up':
                pyautogui.press('volumeup')
                return "Volume increased."
            elif action == 'volume down':
                pyautogui.press('volumedown')
                return "Volume decreased."
            elif action == 'mute':
                pyautogui.press('volumemute')
                return "Audio muted."

        except Exception as e:
            logger.error(f"Error controlling media: {e}")
            return "I couldn't control the media."
