from rest_framework import serializers
from .models import Thread, Message

class MessageSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    author_emoji = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'content', 'author_name', 'author_emoji', 'created_at']

    def get_author_emoji(self, obj):
        if hasattr(obj.author, 'profile'):
            return obj.author.profile.emoji
        return "🧑‍🚀"

class ThreadSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Thread
        fields = ['id', 'title', 'author_name', 'created_at', 'messages']