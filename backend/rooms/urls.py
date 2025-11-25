from django.urls import path
from .views import RoomCreateView, RoomDetailByCodeView 

urlpatterns = [
    path("", RoomCreateView.as_view(), name="room-create"),
    path("code/<code>/", RoomDetailByCodeView.as_view(), name="room-by-code"),
]
