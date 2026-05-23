import time
from rooms.services import RoomService
from .validators import validate_quotas_payload, validate_museum_payload
from .rate_limit import room_update_limiter, emoji_update_limiter

class MessageHandlerRegistry:
    def __init__(self):
        self._handlers = {}

    def register(self, msg_type, handler):
        self._handlers[msg_type] = handler

    async def dispatch(self, consumer, data):
        msg_type = data.get("type")
        handler = self._handlers.get(msg_type)
        
        if handler:
            await handler(consumer, data)
        else:
            await consumer.channel_layer.group_send(
                consumer.room_group,
                {"type": "room_message", "payload": data}
            )

async def handle_ping(consumer, data):
    now = time.time()
    last_ping = getattr(consumer, "_last_ping_time", 0)
    if now - last_ping < 5:
        return
    consumer._last_ping_time = now
    await consumer.send(text_data='{"type": "PONG"}')

async def handle_update_quotas(consumer, data):
    content = data.get("content")
    if not validate_quotas_payload(content):
        return
    
    is_allowed = await RoomService.is_user_in_room(consumer.room_id, consumer.user.id)
    if not is_allowed:
        return
    
    rate_key = f"{consumer.user.id}:room:{consumer.room_id}:quotas"
    if not room_update_limiter.is_allowed(rate_key):
        return
    
    await RoomService.save_room_data(consumer.room_id, quotas=content)
    await consumer.channel_layer.group_send(
        consumer.room_group, {"type": "room_message", "payload": data}
    )

async def handle_update_museum(consumer, data):
    content = data.get("content")
    if not validate_museum_payload(content):
        return

    is_allowed = await RoomService.is_user_in_room(consumer.room_id, consumer.user.id)
    if not is_allowed:
        return

    rate_key = f"{consumer.user.id}:room:{consumer.room_id}:museum"
    if not room_update_limiter.is_allowed(rate_key):
        return

    await RoomService.save_room_data(consumer.room_id, museum=content)
    await consumer.channel_layer.group_send(
        consumer.room_group, {"type": "room_message", "payload": data}
    )

async def handle_set_emoji(consumer, data):
    emoji = data.get("emoji")
    if not emoji or not isinstance(emoji, str) or len(emoji) > 10:
        return

    rate_key = f"{consumer.user.id}:emoji"
    if not emoji_update_limiter.is_allowed(rate_key):
        return

    if consumer.user.is_authenticated:
        await RoomService.update_user_emoji(consumer.user.id, emoji)
        await consumer.broadcast_player_list()

message_registry = MessageHandlerRegistry()
message_registry.register("PING", handle_ping)
message_registry.register("UPDATE_QUOTAS", handle_update_quotas)
message_registry.register("UPDATE_MUSEUM", handle_update_museum)
message_registry.register("SET_EMOJI", handle_set_emoji)