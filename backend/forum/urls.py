from django.urls import path
from .views import ThreadListCreateView, ThreadDetailView, MessageCreateView

urlpatterns = [
    path('', ThreadListCreateView.as_view()),
    path('<int:pk>/', ThreadDetailView.as_view()),
    path('<int:thread_id>/messages/', MessageCreateView.as_view()),
]