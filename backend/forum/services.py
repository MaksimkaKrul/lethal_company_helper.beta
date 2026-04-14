from .models import Thread, Message

class ForumService:
    @staticmethod
    def get_all_threads():
        return Thread.objects.select_related('author').all().order_by('-created_at')

    @staticmethod
    def get_thread_detail(thread_id):
        return Thread.objects.select_related('author').prefetch_related('messages__author').get(id=thread_id)

    @staticmethod
    def create_thread(title, author):
        return Thread.objects.create(title=title, author=author)

    @staticmethod
    def create_message(thread_id, author, content):
        try:
            thread = Thread.objects.get(id=thread_id)
            return Message.objects.create(thread=thread, author=author, content=content), None
        except Thread.DoesNotExist:
            return None, "Transmission lost: Thread not found."