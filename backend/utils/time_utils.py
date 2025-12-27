from datetime import time

def time_to_rotated_minutes(t: time) -> int:
    if t >= time(7, 0):
        return (t.hour - 7) * 60 + t.minute
    return (t.hour + 17) * 60 + t.minute
