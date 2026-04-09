import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rooms.models import Room
from users.models import UserProfile
from django.contrib.auth.models import User
from django.utils import timezone

class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group = f"room_{self.room_id}"
        self.user = self.scope["user"]

        print(f"Connection attempt by user: {self.user} (Authenticated: {self.user.is_authenticated})")

        # На некоторых бесплатных хостингах Channels может терять юзера. 
        # Для курсовой допустим вход всех, если сокет открыт из браузера с credentials
        if not self.user.is_authenticated:
             # Попробуем принять, если деплой капризничает, но в идеале куки должны работать
             pass 

        await self.channel_layer.group_add(self.room_group, self.channel_name)
        await self.accept()

        if self.user.is_authenticated:
            await self.add_user_to_room()
        
        await self.broadcast_player_list()
        
        current_state = await self.get_room_state()
        
        if current_state['quotas']:
            await self.send(text_data=json.dumps({
                "type": "UPDATE_QUOTAS",
                "content": current_state['quotas']
            }))
            
        if current_state['museum']:
            await self.send(text_data=json.dumps({
                "type": "UPDATE_MUSEUM",
                "content": current_state['museum']
            }))

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.remove_user_from_room()
        await self.channel_layer.group_discard(self.room_group, self.channel_name)
        await self.broadcast_player_list()

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "UPDATE_QUOTAS":
            await self.save_room_data(quotas=data.get("content"))
        
        elif msg_type == "UPDATE_MUSEUM":
            await self.save_room_data(museum=data.get("content"))

        elif msg_type == "SET_EMOJI":
            if self.user.is_authenticated:
                await self.update_user_emoji(data.get("emoji"))
                await self.broadcast_player_list()
            return

        await self.channel_layer.group_send(
            self.room_group,
            {
                "type": "room_message",
                "payload": data
            }
        )

    async def room_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def broadcast_player_list(self):
        players = await self.get_players_list()
        await self.channel_layer.group_send(
            self.room_group,
            {
                "type": "room_message",
                "payload": {
                    "type": "UPDATE_PLAYERS",
                    "players": players
                }
            }
        )

    @database_sync_to_async
    def get_room_state(self):
        try:
            room = Room.objects.get(id=self.room_id)
            return {'quotas': room.quota_data, 'museum': room.museum_data}
        except Room.DoesNotExist:
            return {'quotas': None, 'museum': None}

    @database_sync_to_async
    def save_room_data(self, quotas=None, museum=None):
        try:
            room = Room.objects.get(id=self.room_id)
            if quotas is not None: room.quota_data = quotas
            if museum is not None: room.museum_data = museum
            room.save()
        except Room.DoesNotExist: pass

    @database_sync_to_async
    def add_user_to_room(self):
        try:
            room = Room.objects.get(id=self.room_id)
            user = User.objects.get(id=self.user.id)
            room.empty_since = None
            room.save()
            room.participants.add(user)
        except Exception as e: print(f"Error adding user: {e}")

    @database_sync_to_async
    def remove_user_from_room(self):
        try:
            room = Room.objects.get(id=self.room_id)
            user = User.objects.get(id=self.user.id)
            room.participants.remove(user)
            if room.participants.count() == 0:
                room.empty_since = timezone.now()
                room.save()
        except Exception: pass

    @database_sync_to_async
    def get_players_list(self):
        try:
            room = Room.objects.get(id=self.room_id)
            players_data = []
            for user in room.participants.all():
                emoji = user.profile.emoji if hasattr(user, 'profile') else '🧑‍🚀'
                players_data.append({
                    "username": user.username,
                    "emoji": emoji,
                    "is_me": (self.user.is_authenticated and user.id == self.user.id)
                })
            return players_data
        except Room.DoesNotExist: return []
    
    @database_sync_to_async
    def update_user_emoji(self, emoji):
        profile, _ = UserProfile.objects.get_or_create(user=self.user)
        profile.emoji = emoji
        profile.save()