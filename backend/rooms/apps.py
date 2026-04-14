from django.apps import AppConfig

class RoomsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rooms'

    def ready(self):
        import os
        if os.environ.get('RUN_MAIN'):
            from . import updater
            updater.start()