MAX_QUOTA_ROWS = 30
MAX_MUSEUM_ITEMS = 100
MAX_DICT_KEYS = 50
MAX_STRING_LENGTH = 200
MAX_NUMBER_ABS_VALUE = 100_000
MAX_DEPTH = 5


def is_valid_ws_payload(value, depth=0):
    if depth > MAX_DEPTH:
        return False

    if isinstance(value, str):
        return len(value) <= MAX_STRING_LENGTH

    if isinstance(value, bool) or value is None:
        return True

    if isinstance(value, int):
        return abs(value) <= MAX_NUMBER_ABS_VALUE

    if isinstance(value, float):
        return value == value and abs(value) <= MAX_NUMBER_ABS_VALUE

    if isinstance(value, list):
        return all(is_valid_ws_payload(item, depth + 1) for item in value)

    if isinstance(value, dict):
        if len(value) > MAX_DICT_KEYS:
            return False

        return all(
            isinstance(key, str)
            and len(key) <= MAX_STRING_LENGTH
            and is_valid_ws_payload(item, depth + 1)
            for key, item in value.items()
        )

    return False


def validate_quotas_payload(content):
    if not isinstance(content, list):
        return False

    if len(content) > MAX_QUOTA_ROWS:
        return False

    return is_valid_ws_payload(content)


def validate_museum_payload(content):
    if not isinstance(content, list):
        return False

    if len(content) > MAX_MUSEUM_ITEMS:
        return False

    return is_valid_ws_payload(content)