from rooms.services import RoomService

class MessageHandlerRegistry:
    def __init__(self):
        self._handlers = {}

    def register(self, msg_type, handler):
        self._handlers[msg_type] = handler

    async def dispatch(self, consumer, data):
        handler = self._handlers.get(data.get("type"))
        if handler:
            await handler(consumer, data)
        else:
            await consumer.channel_layer.group_send(
                consumer.room_group,
                {"type": "room_message", "payload": data}
            )

async def handle_update_quotas(consumer, data):
    await RoomService.save_room_data(consumer.room_id, quotas=data.get("content"))
    await consumer.channel_layer.group_send(
        consumer.room_group, {"type": "room_message", "payload": data}
    )

async def handle_update_museum(consumer, data):
    await RoomService.save_room_data(consumer.room_id, museum=data.get("content"))
    await consumer.channel_layer.group_send(
        consumer.room_group, {"type": "room_message", "payload": data}
    )

async def handle_set_emoji(consumer, data):
    if consumer.user.is_authenticated:
        await RoomService.update_user_emoji(consumer.user.id, data.get("emoji"))
        await consumer.broadcast_player_list()


message_registry = MessageHandlerRegistry()
message_registry.register("UPDATE_QUOTAS", handle_update_quotas)
message_registry.register("UPDATE_MUSEUM", handle_update_museum)
message_registry.register("SET_EMOJI", handle_set_emoji)