from django.contrib import admin
from django.urls import path, include
from .views import home

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home),
    path("api/rooms/", include("rooms.urls")),
    path("api/users/", include("users.urls")),
    path("api/forum/", include("forum.urls")),
]