class RoomError(Exception):
    def __init__(self, message="Room operation failed"):
        self.message = message
        super().__init__(self.message)

class RoomValidationError(RoomError):
    """(400)"""
    pass

class RoomNotFound(RoomError):
    """(404)"""
    pass

class RoomConflictError(RoomError):
    """(409)"""
    pass

class RoomInternalError(RoomError):
    """(500)"""
    pass