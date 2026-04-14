import logging
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from rooms.models import Room

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Видаляє покинуті кімнати, де немає гравців понад 10 хвилини"

    def handle(self, *args, **options):
        threshold = timezone.now() - timedelta(minutes=10)
        deleted_count, _ = Room.objects.filter(empty_since__lt=threshold).delete()
        
        if deleted_count > 0:
            msg = f"SUCCESS: Scrapped {deleted_count} abandoned rooms."
            self.stdout.write(self.style.WARNING(msg))
            logger.info(msg)
        else:
            self.stdout.write(self.style.SUCCESS("Cleanup: All systems clear."))