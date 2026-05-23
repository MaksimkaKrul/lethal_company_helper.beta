import logging
import re
from django.utils import timezone
from django.db import models, transaction, IntegrityError
from channels.db import database_sync_to_async
from .models import Room
from .exceptions import RoomNotFound, RoomConflictError, RoomValidationError, RoomInternalError

logger = logging.getLogger(__name__)

class RoomService:
    ALLOWED_VERSIONS = {"v40", "v45", "v49", "v50", "v56", "v62", "v64", "v69", "v72", "v73", "v81"}
    CODE_REGEX = re.compile(r"^[A-Z0-9]{1,10}$")

    @staticmethod
    def create_room(owner, game_version, code):
        if game_version not in RoomService.ALLOWED_VERSIONS:
            raise RoomValidationError(f"Invalid version.")
        
        normalized_code = str(code or "").strip().upper()
        
        if not RoomService.CODE_REGEX.fullmatch(normalized_code):
            raise RoomValidationError("Code must be 1-10 characters long and contain only uppercase letters or numbers.")
        
        try:
            room = Room.objects.create(
                owner=owner, 
                game_version=game_version, 
                code=normalized_code
            )
            return room
        except IntegrityError:
            raise RoomConflictError(f"Code {normalized_code} is already active.")

    @staticmethod
    def get_room_by_code(code):
        normalized_code = str(code or "").strip().upper()
        
        if not RoomService.CODE_REGEX.fullmatch(normalized_code):
            raise RoomValidationError("Code must be 1-10 characters long and contain only uppercase letters or numbers.")
               
        try:
            return Room.objects.get(code=normalized_code)
        except Room.DoesNotExist:
            raise RoomNotFound(f"Room {normalized_code} not found.")

    @staticmethod
    @database_sync_to_async
    def get_room_state(room_id):
        try:
            room = Room.objects.get(id=room_id)
            return {'quotas': room.quota_data, 'museum': room.museum_data}
        except Room.DoesNotExist:
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
    def is_user_in_room(room_id, user_id):
        return Room.objects.filter(id=room_id, participants__id=user_id).exists()

    @staticmethod
    @database_sync_to_async
    def add_user_to_room(room_id, user_id):
        try:
            with transaction.atomic():
                room = Room.objects.select_for_update().get(id=room_id)
                from django.contrib.auth.models import User
                user = User.objects.get(id=user_id)
                room.empty_since = None
                room.save(update_fields=["empty_since"])
                room.participants.add(user)
                return True
        except Exception as e:
            logger.error(f"Join error: {e}")
            return False

    @staticmethod
    @database_sync_to_async
    def remove_user_from_room(room_id, user_id):
        try:
            room = Room.objects.get(id=room_id)
            from django.contrib.auth.models import User
            user = User.objects.get(id=user_id)
            room.participants.remove(user)

            if room.participants.count() == 0:
                room.empty_since = timezone.now()
                room.save(update_fields=["empty_since"])
            return True
        except Exception:
            return False

    @staticmethod
    @database_sync_to_async
    def get_players_list(room_id, current_user_id, is_authenticated):
        try:
            room = Room.objects.get(id=room_id)
            players = []
            for p in room.participants.all():
                emoji = "👤"
                if hasattr(p, 'profile'):
                    emoji = p.profile.emoji
                
                players.append({
                    "username": p.username,
                    "emoji": emoji,
                    "is_me": is_authenticated and p.id == current_user_id
                })
            return players
        except Room.DoesNotExist:
            return []

    @staticmethod
    @database_sync_to_async
    def update_user_emoji(user_id, emoji):
        from users.models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(user_id=user_id)
        profile.emoji = emoji
        profile.save(update_fields=['emoji'])