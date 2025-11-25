from rest_framework import generics, permissions
from .models import Thread, Message
from .serializers import ThreadSerializer, MessageSerializer

class ThreadListCreateView(generics.ListCreateAPIView):
    queryset = Thread.objects.all().order_by('-created_at')
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ThreadDetailView(generics.RetrieveAPIView):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        thread_id = self.kwargs.get('thread_id')
        thread = Thread.objects.get(id=thread_id)
        serializer.save(author=self.request.user, thread=thread)