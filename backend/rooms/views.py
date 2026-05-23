from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import RoomService
from .exceptions import RoomError, RoomNotFound, RoomConflictError, RoomValidationError, RoomInternalError
from core.auth import CsrfExemptSessionAuthentication

class RoomCreateView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        try:
            room = RoomService.create_room(
                owner=request.user,
                game_version=request.data.get("gameVersion"),
                code=request.data.get("code"),
            )
            return Response({
                "id": room.id,
                "code": room.code,
                "gameVersion": room.game_version,
            }, status=status.HTTP_201_CREATED)
        except RoomValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except RoomConflictError as e:
            return Response({"error": str(e)}, status=status.HTTP_409_CONFLICT)
        except RoomInternalError as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except RoomError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RoomDetailByCodeView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication] 

    def get(self, request, code):
        try:
            room = RoomService.get_room_by_code(code)
            return Response({
                "id": room.id,
                "code": room.code,
                "gameVersion": room.game_version
            }, status=status.HTTP_200_OK)
        except RoomValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except RoomNotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

class RoomDetailView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def get(self, request, pk):
        try:
            room = RoomService.get_room_by_id(pk)
            return Response({
                "id": room.id,
                "code": room.code,
                "gameVersion": room.game_version
            }, status=status.HTTP_200_OK)
        except RoomNotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)