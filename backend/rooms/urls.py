from django.urls import path
from .views import RoomCreateView, RoomDetailByCodeView, RoomDetailView

urlpatterns = [
    path("", RoomCreateView.as_view(), name="room-create"),
    path("<int:pk>/", RoomDetailView.as_view(), name="room-detail"),
    path("code/<code>/", RoomDetailByCodeView.as_view(), name="room-by-code"),
]