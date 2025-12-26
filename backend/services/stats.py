from collections import defaultdict
from datetime import datetime
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

            # --- Track order times for earliest/latest ---
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

            # --- Track item counts ---
            for item in r.get("items", []):
                name = item.get("name")
                if name:
                    item_counts[name] += 1

            # --- Track most expensive order ---
            if (t := r.get("total", 0)) > max_total:
                max_total = t
                most_expensive = r

            # --- Track restaurant counts ---s
            if rname := r.get("restaurant_name"):
                restaurant_counts[rname] += 1

    # --- Busiest day ---
    busiest = max(date_counts.items(), key=lambda x: x[1], default=(None, 0))

    # --- Top restaurant & unique count ---
    unique_restaurants = len(restaurant_counts)
    if restaurant_counts:
        top_name, top_visits = max(restaurant_counts.items(), key=lambda x: x[1])
        top_restaurant = {"name": top_name, "count": top_visits}
    else:
        top_restaurant = {"name": None, "count": 0}

    # --- Return statistics ---
    return (
        [{"item": k, "count": v} for k, v in sorted(item_counts.items(), key=lambda x: x[1], reverse=True)],
        most_expensive,
        sum(item_counts.values()),
        len(item_counts),
        {"date": busiest[0], "order_count": busiest[1]},
        dict(restaurant_counts),
        earliest_order,
        unique_restaurants,
        top_restaurant,
        latest_order,
    )
