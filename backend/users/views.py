from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer 
from core.auth import CsrfExemptSessionAuthentication

class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response({"username": user.username, "id": user.id}, status=200)
        return Response({"error": "Invalid credentials"}, status=400)

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    # Используем наш класс для обхода CSRF на GET запросе
    authentication_classes = [CsrfExemptSessionAuthentication]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        data = serializer.data
        data['username'] = request.user.username
        return Response(data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        response = Response({"message": "Logged out"}, status=200)
        # Очищаем куки сессии
        response.delete_cookie('sessionid')
        response.delete_cookie('csrftoken')
        return response

class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)