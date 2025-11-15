"""
WebSocket Server - Communication bridge between backend and frontend UI
"""

import asyncio
import logging
import json
from typing import Set
import websockets
from websockets.server import WebSocketServerProtocol

logger = logging.getLogger(__name__)


class WebSocketServer:
    """WebSocket server for real-time communication with frontend"""

    def __init__(self, jarvis_core, host: str = '0.0.0.0', port: int = 8765):
        self.jarvis_core = jarvis_core
        self.host = host
        self.port = port
        self.clients: Set[WebSocketServerProtocol] = set()
        self.server = None

    async def start(self):
        """Start the WebSocket server"""
        try:
            self.server = await websockets.serve(
                self.handle_client,
                self.host,
                self.port
            )
            logger.info(f"WebSocket server started on ws://{self.host}:{self.port}")

            # Keep server running
            await asyncio.Future()  # Run forever

        except Exception as e:
            logger.error(f"Error starting WebSocket server: {e}", exc_info=True)

    async def stop(self):
        """Stop the WebSocket server"""
        if self.server:
            self.server.close()
            await self.server.wait_closed()
            logger.info("WebSocket server stopped")

    async def handle_client(self, websocket: WebSocketServerProtocol, path: str):
        """Handle a client connection"""
        self.clients.add(websocket)
        logger.info(f"Client connected from {websocket.remote_address}")

        try:
            # Send welcome message
            await self.send_to_client(websocket, {
                'type': 'connected',
                'message': 'Connected to JARVIS'
            })

            # Handle messages from client
            async for message in websocket:
                await self.handle_message(websocket, message)

        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Client disconnected: {websocket.remote_address}")
        except Exception as e:
            logger.error(f"Error handling client: {e}", exc_info=True)
        finally:
            self.clients.remove(websocket)

    async def handle_message(self, websocket: WebSocketServerProtocol, message: str):
        """Handle incoming message from client"""
        try:
            data = json.loads(message)
            msg_type = data.get('type')

            if msg_type == 'user_input':
                # User typed a message
                user_text = data.get('text')
                logger.info(f"User input from UI: {user_text}")

                # Process through JARVIS (simulate voice input)
                # This would integrate with jarvis_core
                response = await self._process_user_input(user_text)

                await self.send_to_client(websocket, {
                    'type': 'ai_response',
                    'text': response
                })

            elif msg_type == 'request_stats':
                # Client requesting system stats
                stats = await self.jarvis_core.automation.get_system_stats()
                await self.send_to_client(websocket, {
                    'type': 'system_stats',
                    'data': stats
                })

            elif msg_type == 'voice_activity':
                # Voice activity indicator from frontend
                is_speaking = data.get('speaking', False)
                # Broadcast to all clients
                await self.broadcast({
                    'type': 'voice_activity',
                    'speaking': is_speaking
                })

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON from client: {message}")
        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)

    async def _process_user_input(self, text: str) -> str:
        """Process user input through JARVIS AI"""
        try:
            response = await self.jarvis_core.ai.get_response(
                text,
                self.jarvis_core.conversation_history,
                self.jarvis_core.user_context
            )

            return response.get('message', 'I apologize, but I encountered an error.')

        except Exception as e:
            logger.error(f"Error processing input: {e}")
            return "I'm having difficulty processing that request."

    async def send_to_client(self, websocket: WebSocketServerProtocol, data: dict):
        """Send data to a specific client"""
        try:
            message = json.dumps(data)
            await websocket.send(message)
        except Exception as e:
            logger.error(f"Error sending to client: {e}")

    async def broadcast(self, data: dict):
        """Broadcast data to all connected clients"""
        if not self.clients:
            return

        message = json.dumps(data)

        # Send to all clients
        await asyncio.gather(
            *[client.send(message) for client in self.clients],
            return_exceptions=True
        )

    async def send_jarvis_message(self, text: str):
        """Send JARVIS message to all clients"""
        await self.broadcast({
            'type': 'jarvis_message',
            'text': text,
            'timestamp': asyncio.get_event_loop().time()
        })

    async def send_system_status(self, status: dict):
        """Send system status update to all clients"""
        await self.broadcast({
            'type': 'system_status',
            'data': status
        })
