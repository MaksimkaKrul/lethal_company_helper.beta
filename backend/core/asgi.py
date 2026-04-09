import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# 1. Сначала создаем HTTP ASGI приложение
django_asgi_app = get_asgi_application()

# 2. Только ПОСЛЕ этого импортируем Channels и роутинг
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from realtime.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack( 
        URLRouter(websocket_urlpatterns)
    ),
})