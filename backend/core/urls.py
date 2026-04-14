from django.contrib import admin
from django.urls import path, include, re_path
from .views import index_view

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/rooms/", include("rooms.urls")),
    path("api/users/", include("users.urls")),
    path("api/forum/", include("forum.urls")),
    re_path(r"^.*$", index_view),
]