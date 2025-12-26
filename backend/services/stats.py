from collections import defaultdict
from datetime import datetime, time
from utils.time_utils import time_to_rotated_minutes

def generate_receipt_statistics(email_data):
    item_counts = defaultdict(int)
    restaurant_counts = defaultdict(int)
    date_counts = defaultdict(int)

    max_total = 0
    most_expensive = {}

    earliest_order = None
    latest_order = None
    earliest_rot = 1440
    latest_rot = -1

    for entry in email_data:
        for att in entry["attachments"]:
            r = att["parsed_receipt"]

            if ts := r.get("order_time"):
                try:
                    dt = datetime.strptime(ts, "%Y-%m-%d %I:%M %p")
                    rot = time_to_rotated_minutes(dt.time())
                    date_counts[str(dt.date())] += 1

                    if rot < earliest_rot:
                        earliest_rot = rot
                        earliest_order = r
                    if rot > latest_rot:
                        latest_rot = rot
                        latest_order = r
                except ValueError:
                    pass

            for item in r.get("items", []):
                item_counts[item["name"]] += 1

            if (t := r.get("total", 0)) > max_total:
                max_total = t
                most_expensive = r

    busiest = max(date_counts.items(), key=lambda x: x[1], default=(None, 0))

    return (
        [{"item": k, "count": v} for k, v in sorted(item_counts.items(), key=lambda x: x[1], reverse=True)],
        most_expensive,
        sum(item_counts.values()),
        len(item_counts),
        {"date": busiest[0], "order_count": busiest[1]},
        dict(restaurant_counts),
        earliest_order,
        len(restaurant_counts),
        {"name": None, "count": 0},
        latest_order,
    )
