from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Thread
from .serializers import ThreadSerializer, MessageSerializer
from .services import ForumService

class ThreadListCreateView(generics.ListCreateAPIView):
    queryset = Thread.objects.all().order_by('-created_at')
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ForumService.get_all_threads()

    def perform_create(self, serializer):
        serializer.instance = ForumService.create_thread(
            title=serializer.validated_data.get('title'),
            author=self.request.user
        )

class ThreadDetailView(generics.RetrieveAPIView):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        thread_id = self.kwargs.get('thread_id')
        content = request.data.get('content')
        
        if not content:
            return Response({"error": "Empty transmission"}, status=400)
            
        message, error = ForumService.create_message(thread_id, request.user, content)
        if error:
            return Response({"error": error}, status=404)
            
        return Response(self.get_serializer(message).data, status=201)