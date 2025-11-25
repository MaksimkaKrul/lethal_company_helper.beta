from django.db import models
from django.contrib.auth.models import User

class Room(models.Model):
    code = models.CharField(max_length=10, unique=True)
    game_version = models.CharField(max_length=20)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_rooms')
    participants = models.ManyToManyField(User, related_name='joined_rooms', blank=True)
    
    quota_data = models.JSONField(null=True, blank=True)
    museum_data = models.JSONField(null=True, blank=True)
    
    empty_since = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Room {self.code}"