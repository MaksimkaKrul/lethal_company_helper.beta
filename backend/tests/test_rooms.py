from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from rooms.models import Room

class RoomAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='runner', password='password123')
        self.client.force_authenticate(user=self.user)

    def test_create_room(self):
        data = {"gameVersion": "v45", "code": "TESTCODE"}
        response = self.client.post('/api/rooms/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Room.objects.count(), 1)
        self.assertEqual(Room.objects.get().code, "TESTCODE")

    def test_join_room_by_code(self):
        Room.objects.create(owner=self.user, game_version="v45", code="1234")
        response = self.client.get('/api/rooms/code/1234/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_join_nonexistent_room(self):
        response = self.client.get('/api/rooms/code/9999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)