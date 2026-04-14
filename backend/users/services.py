import logging
from django.db import IntegrityError, transaction
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import UserProfile

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    def get_profile(user):
        profile, created = UserProfile.objects.get_or_create(user=user)
        return profile

    @staticmethod
    def register_user(username, password):
        try:
            with transaction.atomic():
                user = User.objects.create_user(username=username, password=password)
                UserProfile.objects.create(user=user)
                logger.info(f"New employee registered: {username}")
                return user, None
        except IntegrityError:
            return None, "Employee ID already taken."

    @staticmethod
    def authenticate_user(username, password):
        # request=None для сумісності з кастомними бекендами
        user = authenticate(request=None, username=username, password=password)
        if user:
            return user, None
        return None, "Invalid credentials. Terminal access denied."

    @staticmethod
    def update_user_profile(user, data):
        profile = UserService.get_profile(user)
        if 'emoji' in data:
            profile.emoji = data['emoji']
        if 'description' in data:
            profile.description = data['description']
        profile.save()
        return profile