from flask import Blueprint, request, jsonify
from services.receipt_parser import parse_uploaded_files
from services.stats import generate_receipt_statistics
from datetime import datetime

upload_bp = Blueprint("upload", __name__)

@upload_bp.route("/upload_emls", methods=["POST"])
def upload_emls():
    try:
        files = request.files.getlist("files")
        if not files:
            return jsonify({"error": "No files uploaded."}), 400

        email_data = parse_uploaded_files(files)
        if not email_data:
            return jsonify({"error": "No valid .eml or .msg files found."}), 400

        (
            item_stats,
            most_expensive,
            total_items,
            total_unique_items,
            busiest_day,
            restaurant_counts,
            earliest_order,
            unique_restaurants,
            top_restaurant,
            latest_order,
        ) = generate_receipt_statistics(email_data)

        busiest_date = busiest_day["date"]
        busiest_day_orders = []

        for entry in email_data:
            for attach in entry.get("attachments", []):
                receipt = attach.get("parsed_receipt", {})
                ts = receipt.get("order_time")
                if not ts:
                    continue
                try:
                    dt = datetime.strptime(ts.strip(), "%Y-%m-%d %I:%M %p")
                    if str(dt.date()) == busiest_date:
                        busiest_day_orders.append(receipt)
                except ValueError:
                    pass

        recipient_name = next(
            (e.get("recipient_name") for e in email_data if e.get("recipient_name")),
            None
        )

        return jsonify({
            "recipient_name": recipient_name,
            "item_counts": item_stats,
            "most_expensive_order": most_expensive,
            "total_items_ordered": total_items,
            "total_unique_items": total_unique_items,
            "busiest_day": busiest_day,
            "busiest_day_orders": busiest_day_orders,
            "restaurant_counts": restaurant_counts,
            "unique_restaurants": unique_restaurants,
            "top_restaurant": top_restaurant,
            "earliest_order_by_time": earliest_order,
            "latest_order_by_time": latest_order,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
