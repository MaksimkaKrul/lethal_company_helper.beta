from django.contrib.auth import login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .serializers import UserSerializer, UserProfileSerializer 
from .services import UserService
from core.auth import CsrfExemptSessionAuthentication

class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user, error = UserService.register_user(
            serializer.validated_data['username'], 
            serializer.validated_data['password']
        )
        if error:
            return Response({"error": error}, status=400)
            
        return Response({"message": "User record created"}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        
        user, error = UserService.authenticate_user(username, password)
        if error:
            return Response({"error": error}, status=400)
            
        login(request, user)
        return Response({"username": user.username, "id": user.id}, status=200)

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def get(self, request):
        profile = UserService.get_profile(request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile = UserService.update_user_profile(request.user, request.data)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        response = Response({"message": "Logged out"}, status=200)
        response.delete_cookie('sessionid')
        response.delete_cookie('csrftoken')
        return response