import time


class WebSocketRateLimiter:
    def __init__(self, limit, window_seconds):
        self.limit = limit
        self.window_seconds = window_seconds
        self.events = {}

    def is_allowed(self, key):
        now = time.monotonic()
        valid_after = now - self.window_seconds

        user_events = self.events.get(key, [])
        recent_events = []

        for event_time in user_events:
            if event_time > valid_after:
                recent_events.append(event_time)

        if len(recent_events) >= self.limit:
            self.events[key] = recent_events
            return False

        recent_events.append(now)
        self.events[key] = recent_events
        return True


room_update_limiter = WebSocketRateLimiter(limit=30, window_seconds=10)
emoji_update_limiter = WebSocketRateLimiter(limit=10, window_seconds=60)