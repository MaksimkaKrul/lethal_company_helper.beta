from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    emoji = models.CharField(max_length=10, default='🧑‍🚀')
    description = models.TextField(blank=True, default="")

    def __str__(self):
        return f"{self.user.username}'s profile"