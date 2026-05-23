import json
from json import JSONDecodeError

from channels.generic.websocket import AsyncWebsocketConsumer

from rooms.services import RoomService
from .handlers import message_registry


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group = f"room_{self.room_id}"
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close(code=4001)
            return

        await self.channel_layer.group_add(self.room_group, self.channel_name)
        await self.accept()

        await RoomService.add_user_to_room(self.room_id, self.user.id)
        await self.broadcast_player_list()

        current_state = await RoomService.get_room_state(self.room_id)

        if current_state["quotas"]:
            await self.send(text_data=json.dumps({
                "type": "UPDATE_QUOTAS",
                "content": current_state["quotas"],
            }))

        if current_state["museum"]:
            await self.send(text_data=json.dumps({
                "type": "UPDATE_MUSEUM",
                "content": current_state["museum"],
            }))

    async def disconnect(self, close_code):
        if hasattr(self, "user") and self.user.is_authenticated:
            await RoomService.remove_user_from_room(self.room_id, self.user.id)
            await self.channel_layer.group_discard(self.room_group, self.channel_name)
            await self.broadcast_player_list()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except JSONDecodeError:
            await self.close(code=4002)
            return

        await message_registry.dispatch(self, data)

    async def room_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def broadcast_player_list(self):
        players = await RoomService.get_players_list(
            self.room_id,
            self.user.id,
            self.user.is_authenticated,
        )

        await self.channel_layer.group_send(
            self.room_group,
            {
                "type": "room_message",
                "payload": {
                    "type": "UPDATE_PLAYERS",
                    "players": players,
                },
            },
        )