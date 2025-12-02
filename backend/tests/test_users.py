from django.test import TestCase
from django.contrib.auth.models import User
from users.models import UserProfile 

class UserProfileUnitTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')

    def test_profile_creation(self):
        profile, created = UserProfile.objects.get_or_create(user=self.user)
        self.assertEqual(profile.user.username, 'testuser')
        self.assertEqual(profile.emoji, '🧑‍🚀')

    def test_emoji_update(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.user)
        profile.emoji = '👹'
        profile.save()
        updated_profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(updated_profile.emoji, '👹')