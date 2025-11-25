import threading
import time
from django.apps import AppConfig
from django.utils import timezone
from datetime import timedelta

class RoomsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rooms'

    def ready(self):
        start_cleanup_thread()

def start_cleanup_thread():
    t = threading.Thread(target=cleanup_loop, daemon=True)
    t.start()

def cleanup_loop():
    time.sleep(5)
    
    while True:
        try:
            from .models import Room
            
            threshold = timezone.now() - timedelta(minutes=2)
            
            old_rooms = Room.objects.filter(empty_since__lt=threshold)
            
            count = old_rooms.count()
            if count > 0:
                print(f"🧹 Cleanup: Deleting {count} abandoned rooms...")
                old_rooms.delete()
                
        except Exception as e:
            print(f"Cleanup error: {e}")
        
        time.sleep(60)