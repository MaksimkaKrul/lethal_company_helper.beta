import logging
from channels.db import database_sync_to_async
from django.utils import timezone
from django.db import models, transaction
from .models import Room
from users.models import UserProfile
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

class RoomService:
    @staticmethod
    def create_room(owner, game_version, code):
        return Room.objects.create(owner=owner, game_version=game_version, code=code)

    @staticmethod
    @database_sync_to_async
    def get_room_state(room_id):
        try:
            room = Room.objects.get(id=room_id)
            return {'quotas': room.quota_data, 'museum': room.museum_data}
        except Room.DoesNotExist:
            logger.error(f"Failed to fetch state: Room {room_id} not found.")
            return {'quotas': None, 'museum': None}

    @staticmethod
    @database_sync_to_async
    def save_room_data(room_id, quotas=None, museum=None):
        update_fields = {}
        if quotas is not None: update_fields['quota_data'] = quotas
        if museum is not None: update_fields['museum_data'] = museum
        
        if update_fields:
            updated = Room.objects.filter(id=room_id).update(**update_fields)
            return updated > 0
        return False

    @staticmethod
    @database_sync_to_async
    def add_user_to_room(room_id, user_id):
        try:
            with transaction.atomic():
                room = Room.objects.select_for_update().get(id=room_id)
                user = User.objects.get(id=user_id)
                room.empty_since = None
                room.save(update_fields=["empty_since"])
                if not room.participants.filter(id=user_id).exists():
                    room.participants.add(user)
            logger.info(f"Employee {user.username} linked to Room {room.code}")
            return True
        except (Room.DoesNotExist, User.DoesNotExist) as e:
            logger.error(f"Critical link failure: {e}")
            return False

    @staticmethod
    @database_sync_to_async
    def remove_user_from_room(room_id, user_id):
        try:
            with transaction.atomic():
                room = Room.objects.select_for_update().get(id=room_id)
                user = User.objects.get(id=user_id)
                room.participants.remove(user)
                if not room.participants.exists():
                    room.empty_since = timezone.now()
                    room.save(update_fields=["empty_since"])
            return True
        except (Room.DoesNotExist, User.DoesNotExist) as e:
            logger.error(f"Disconnect error for user {user_id}: {e}")
            return False

    @staticmethod
    @database_sync_to_async
    def get_players_list(room_id, current_user_id, is_authenticated):
        try:
            room = Room.objects.prefetch_related('participants__profile').get(id=room_id)
            return [{
                "username": p.username,
                "emoji": p.profile.emoji if hasattr(p, 'profile') else '👩‍🚀',
                "is_me": is_authenticated and p.id == current_user_id
            } for p in room.participants.all()]
        except Room.DoesNotExist:
            return []

    @staticmethod
    @database_sync_to_async
    def update_user_emoji(user_id, emoji):
        try:
            user = User.objects.get(id=user_id)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.emoji = emoji
            profile.save(update_fields=["emoji"])
        except User.DoesNotExist:
            logger.error(f"Identity Error: Cannot update emoji for non-existent user {user_id}")