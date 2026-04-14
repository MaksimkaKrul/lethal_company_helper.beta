from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import IntegrityError

from .services import RoomService
from .models import Room
from core.auth import CsrfExemptSessionAuthentication

class RoomCreateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        service = RoomService()
        data = request.data
        try:
            dto = service.create_room(
                owner=request.user,
                game_version=data.get("gameVersion"),
                code=data.get("code"),
            )
            return Response({
                "id": dto.id,
                "code": dto.code,
                "gameVersion": dto.game_version,
            }, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response({"error": "This Room Code is already taken by another captain."}, status=400)
    
class RoomDetailByCodeView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication] 

    def get(self, request, code):
        try:
            room = Room.objects.get(code=code.upper())
            return Response({
                "id": room.id,
                "code": room.code,
                "gameVersion": room.game_version
            })
        except Room.DoesNotExist:
            return Response({"detail": "Room not found"}, status=status.HTTP_404_NOT_FOUND)