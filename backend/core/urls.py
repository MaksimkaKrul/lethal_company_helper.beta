from django.contrib import admin
from django.urls import path, include

from django.shortcuts import render
def home(request):
    return render(request, "home.html")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/rooms/", include("rooms.urls")),
    path("api/users/", include("users.urls")),
    path("api/forum/", include("forum.urls")),
]
