from .models import Room
from .dto import RoomDTO
from django.contrib.auth.models import User

class RoomService:

    def create_room(self, owner: User, game_version: str, code: str) -> RoomDTO:
        room = Room.objects.create(
            owner=owner,
            game_version=game_version,
            code=code
        )
        return RoomDTO(room.id, room.code, room.game_version)

    def get_room(self, room_id: int) -> RoomDTO:
        room = Room.objects.get(id=room_id)
        return RoomDTO(room.id, room.code, room.game_version)
