from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from .management.commands.cleanup_rooms import Command

def start():
    scheduler = BackgroundScheduler()
    cleanup = Command()
    scheduler.add_job(cleanup.handle, 'interval', minutes=2) 
    scheduler.start()