import json
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User
from django.test import TransactionTestCase
from core.asgi import application
from rooms.models import Room

class WebSocketTests(TransactionTestCase):
    async_capable = True

    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="test123")
        self.room = Room.objects.create(
            owner=self.user,
            code="TEST123",
            game_version="v50"
        )
        self.room.participants.add(self.user)

    async def create_communicator(self, user=None):
        communicator = WebsocketCommunicator(
            application,
            f"/ws/rooms/{self.room.id}/"
        )
        if user:
            communicator.scope["user"] = user
        else:
            from django.contrib.auth.models import AnonymousUser
            communicator.scope["user"] = AnonymousUser()
        return communicator

    async def connect_and_flush(self, user):
        """
        Connects and consumes all initial broadcast messages 
        to leave the queue clean for the actual test.
        """
        communicator = await self.create_communicator(user=user)
        connected, _ = await communicator.connect()
        
        if connected:
            # The server sends UPDATE_PLAYERS automatically on connect
            # We must consume it so it doesn't interfere with our test assertions
            await communicator.receive_json_from()
            
        return communicator, connected

    async def test_unauthenticated_connection_rejected(self):
        communicator = await self.create_communicator(user=None)
        connected, code = await communicator.connect()
        self.assertFalse(connected)
        self.assertEqual(code, 4001)
        await communicator.disconnect()

    async def test_authenticated_connection_accepted(self):
        communicator, connected = await self.connect_and_flush(self.user)
        self.assertTrue(connected)
        await communicator.disconnect()

    async def test_invalid_quota_payload_rejected(self):
        communicator, _ = await self.connect_and_flush(self.user)
        
        await communicator.send_json_to({
            "type": "UPDATE_QUOTAS",
            "content": "invalid_string_not_list"
        })

        # receive_nothing returns True if no messages arrive within timeout
        self.assertTrue(await communicator.receive_nothing(timeout=0.2))
        await communicator.disconnect()

    async def test_valid_quota_payload_broadcast(self):
        communicator, _ = await self.connect_and_flush(self.user)

        payload = [{"id": 1, "quota": "130"}]
        await communicator.send_json_to({
            "type": "UPDATE_QUOTAS",
            "content": payload
        })

        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "UPDATE_QUOTAS")
        self.assertEqual(response["content"], payload)
        await communicator.disconnect()

    async def test_ping_pong(self):
        communicator, _ = await self.connect_and_flush(self.user)

        await communicator.send_json_to({"type": "PING"})
        response = await communicator.receive_json_from()
        
        self.assertEqual(response["type"], "PONG")
        await communicator.disconnect()