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
            raise RoomValidationError(f"Invalid version. Authorized versions: {', '.join(sorted(RoomService.ALLOWED_VERSIONS))}")
        
        normalized_code = str(code or "").strip().upper()
        if not normalized_code:
            raise RoomValidationError("Room code is mandatory for terminal link.")
            
        if not RoomService.CODE_REGEX.match(normalized_code):
            raise RoomValidationError("Code must be 1-10 alphanumeric characters (English only).")

        try:
            room = Room.objects.create(
                owner=owner, 
                game_version=game_version, 
                code=normalized_code
            )
            logger.info("Room created successfully", extra={
                "owner_id": owner.id, 
                "code": normalized_code,
                "version": game_version
            })
            return room
        except IntegrityError:
            raise RoomConflictError(f"Transmission overlap: Code {normalized_code} is already active.")
        except Exception as e:
            logger.error("Unexpected failure during room creation", extra={"error": str(e)})
            raise RoomInternalError("Critical system failure during room initialization.")

    @staticmethod
    def get_room_by_code(code):
        normalized_code = str(code or "").strip().upper()
        try:
            return Room.objects.get(code=normalized_code)
        except Room.DoesNotExist:
            logger.warning("Link rejected: Room not found", extra={"code": normalized_code})
            raise RoomNotFound(f"Room {normalized_code} is not responding.")

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
    def add_user_to_room(room_id, user_id):
        try:
            with transaction.atomic():
                room = Room.objects.select_for_update().get(id=room_id)
                from django.contrib.auth.models import User
                user = User.objects.get(id=user_id)
                room.empty_since = None
                room.save(update_fields=["empty_since"])
                
                if not room.participants.filter(id=user_id).exists():
                    room.participants.add(user)
                
                logger.info("Player joined room", extra={"room_id": room_id, "user_id": user_id})
                return True
        except Exception as e:
            logger.error("Async join failure", extra={"room_id": room_id, "user_id": user_id, "error": str(e)})
            return False