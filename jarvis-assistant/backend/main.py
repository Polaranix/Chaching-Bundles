#!/usr/bin/env python3
"""
JARVIS - Personal AI Assistant
Main entry point for the JARVIS backend system
"""

import asyncio
import logging
import signal
import sys
from pathlib import Path

from dotenv import load_dotenv
from colorama import init as colorama_init, Fore, Style

from core.jarvis_core import JarvisCore
from services.voice_service import VoiceService
from services.ai_service import AIService
from services.automation_service import AutomationService
from services.briefing_service import BriefingService
from api.websocket_server import WebSocketServer

# Initialize colorama for colored terminal output
colorama_init()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format=f'{Fore.CYAN}%(asctime)s{Style.RESET_ALL} - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('jarvis.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


class JarvisApplication:
    """Main JARVIS application orchestrator"""

    def __init__(self):
        self.running = False
        self.jarvis_core = None
        self.websocket_server = None

    async def initialize(self):
        """Initialize all JARVIS systems"""
        logger.info(f"{Fore.BLUE}{'='*60}{Style.RESET_ALL}")
        logger.info(f"{Fore.CYAN}Initializing JARVIS systems...{Style.RESET_ALL}")
        logger.info(f"{Fore.BLUE}{'='*60}{Style.RESET_ALL}")

        # Load environment variables
        load_dotenv()

        # Initialize core systems
        logger.info("Starting voice recognition system...")
        voice_service = VoiceService()

        logger.info("Connecting to AI service...")
        ai_service = AIService()

        logger.info("Initializing automation systems...")
        automation_service = AutomationService()

        logger.info("Setting up briefing service...")
        briefing_service = BriefingService()

        # Initialize JARVIS core
        self.jarvis_core = JarvisCore(
            voice_service=voice_service,
            ai_service=ai_service,
            automation_service=automation_service,
            briefing_service=briefing_service
        )

        # Initialize WebSocket server for frontend communication
        logger.info("Starting WebSocket server...")
        self.websocket_server = WebSocketServer(self.jarvis_core)

        logger.info(f"{Fore.GREEN}All systems online. JARVIS is ready.{Style.RESET_ALL}")

        # Play startup sound/message
        await self.jarvis_core.speak("Good evening. JARVIS at your service. All systems operational.")

    async def run(self):
        """Run the main JARVIS loop"""
        self.running = True

        try:
            # Start WebSocket server
            websocket_task = asyncio.create_task(
                self.websocket_server.start()
            )

            # Start JARVIS core
            jarvis_task = asyncio.create_task(
                self.jarvis_core.run()
            )

            # Wait for both tasks
            await asyncio.gather(websocket_task, jarvis_task)

        except KeyboardInterrupt:
            logger.info("Received shutdown signal...")
        except Exception as e:
            logger.error(f"Error in main loop: {e}", exc_info=True)
        finally:
            await self.shutdown()

    async def shutdown(self):
        """Gracefully shutdown JARVIS"""
        logger.info(f"{Fore.YELLOW}Shutting down JARVIS systems...{Style.RESET_ALL}")

        self.running = False

        if self.jarvis_core:
            await self.jarvis_core.speak("Shutting down all systems. Goodbye sir.")
            await self.jarvis_core.shutdown()

        if self.websocket_server:
            await self.websocket_server.stop()

        logger.info(f"{Fore.RED}JARVIS offline.{Style.RESET_ALL}")


def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info("Received signal to shutdown...")
    sys.exit(0)


async def main():
    """Main entry point"""
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Create and run application
    app = JarvisApplication()

    try:
        await app.initialize()
        await app.run()
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    # ASCII Art Banner
    banner = f"""{Fore.CYAN}
    ╦╔═╗╦═╗╦  ╦╦╔═╗
    ║╠═╣╠╦╝╚╗╔╝║╚═╗
   ╚╝╩ ╩╩╚═ ╚╝ ╩╚═╝
   Personal AI Assistant
   {Fore.BLUE}Powered by Anthropic Claude{Style.RESET_ALL}
    """

    print(banner)

    # Run the async main function
    asyncio.run(main())
