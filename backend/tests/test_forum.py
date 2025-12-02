from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from forum.models import Thread

class ForumAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='poster', password='password123')
        self.client.force_authenticate(user=self.user)

    def test_create_thread(self):
        data = {"title": "New Speedrun Strat"}
        response = self.client.post('/api/forum/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Thread.objects.count(), 1)

    def test_post_message(self):
        thread = Thread.objects.create(title="Discussion", author=self.user)
        data = {"content": "Hello world"}
        url = f'/api/forum/{thread.id}/messages/'
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)