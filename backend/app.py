from flask import Flask, request, jsonify
from flask_cors import CORS
import email
import zipfile
import tempfile
import os
from bs4 import BeautifulSoup
import re
from collections import defaultdict
from datetime import datetime, time
from email.utils import parseaddr
import json
from google import genai


# Initialize Flask app
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})


# -----------------------
# Helper functions
# -----------------------

def parse_receipt_from_html(html_body):
    soup = BeautifulSoup(html_body, "html.parser")
    text = soup.get_text(separator="\n")
    lines = text.splitlines()

    receipt = {"items": []}

    # Transaction ID
    receipt_number = re.search(r"#(\d{5,})", text)
    if receipt_number:
        receipt["transaction_id"] = receipt_number.group(1)

    # Order Date & Time
    date_match = re.search(r"\d{4}-\d{2}-\d{2} \d{1,2}:\d{2} [AP]M", text)
    if date_match:
        receipt["order_time"] = date_match.group()

    # Pickup Time
    pickup_match = re.search(r"Target:\s+(\d{1,2}:\d{2} [AP]M)", text)
    if pickup_match:
        receipt["pickup_time"] = pickup_match.group(1)

    # Restaurant Name
    for i, line in enumerate(lines):
        if "Target:" in line:
            for next_line in lines[i + 1:]:
                next_line = next_line.strip()
                if next_line:
                    # 🛡️ Add a filter here: avoid times or weird lines
                    if not re.match(r"(Completed|Picked Up|Cancelled|Order|Ready|Started):", next_line, re.IGNORECASE) \
                    and not re.match(r"\d{1,2}:\d{2}\s*[AP]M", next_line) \
                    and len(next_line) > 2:  # At least 3 characters
                        receipt["restaurant_name"] = next_line
                        break
            break

    # Line items
    for line in lines:
        line = line.strip()
        match = re.match(r"\d+\.\s+(.*)", line)
        if match:
            item_name = match.group(1).strip()
            if item_name:
                receipt["items"].append({"name": item_name})

    # Total Amount
    total_match = re.search(r"Total\s*[:\s]\s*\$?(\d+(?:\.\d{1,2})?)", text, re.IGNORECASE)
    if total_match:
        try:
            receipt["total"] = float(total_match.group(1))
        except ValueError:
            pass

    return receipt if receipt else {"raw_text": text[:300]}


def extract_name_from_email_header(header_value):
    name, email_addr = parseaddr(header_value)
    if name:
        return name
    elif email_addr:
        local_part = email_addr.split("@")[0]
        if "." in local_part:
            parts = local_part.split(".")
        elif "_" in local_part:
            parts = local_part.split("_")
        else:
            parts = re.findall(r"[a-zA-Z]+", local_part)

        return " ".join(part.capitalize() for part in parts if part)
    return None


def parse_single_eml(msg, filename):
    attachments = []
    body = ""

    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() in ["text/plain", "text/html"]:
                try:
                    part_content = part.get_payload(decode=True).decode(errors="ignore")
                    if len(part_content.strip()) > len(body):
                        body = part_content
                except Exception as e:
                    print(f"⚠️ Error decoding part in multipart .eml: {e}")
    else:
        try:
            body = msg.get_payload(decode=True).decode(errors="ignore")
        except Exception as e:
            print(f"⚠️ Error decoding singlepart .eml: {e}")

    recipient_header = msg.get("To") or msg.get("Delivered-To")
    recipient_name = extract_name_from_email_header(recipient_header) if recipient_header else None

    return {
        "subject": msg.get("Subject"),
        "to": recipient_header,
        "recipient_name": recipient_name,
        "attachments": [{
            "filename": filename,
            "parsed_subject": msg.get("Subject"),
            "parsed_receipt": parse_receipt_from_html(body)
        }]
    }


def time_to_rotated_minutes(t: time) -> int:
    if t >= time(7, 0):
        return (t.hour - 7) * 60 + t.minute
    else:
        return (t.hour + 17) * 60 + t.minute


def generate_receipt_statistics(email_data):
    item_counts       = defaultdict(int)
    date_counts       = defaultdict(int)
    restaurant_counts = defaultdict(int)
    max_total         = 0
    most_expensive    = {}
    total_items_ordered = 0

    earliest_order    = None
    latest_order      = None
    earliest_rotated  = 1440  # max value in minutes (24 hrs)
    latest_rotated    = -1


    for email_entry in email_data:
        for attachment in email_entry.get("attachments", []):
            receipt = attachment.get("parsed_receipt", {})

            order_time_str = receipt.get("order_time")
            if order_time_str:
                try:
                    order_time_str = ' '.join(order_time_str.strip().split())
                    dt = datetime.strptime(order_time_str, "%Y-%m-%d %I:%M %p")
                    order_t = dt.time()
                    
                    if order_t >= time(7, 0) or order_t <= time(4, 0):
                        rotated = time_to_rotated_minutes(order_t)
                        date_counts[str(dt.date())] += 1

                        if rotated < earliest_rotated:
                            earliest_rotated = rotated
                            earliest_order   = receipt

                        if rotated > latest_rotated:
                            latest_rotated = rotated
                            latest_order   = receipt

                except ValueError as e:
                    print(f"⚠️ Failed to parse order_time: {order_time_str}. Error: {e}")

            for item in receipt.get("items", []):
                name = item.get("name", "").strip()
                qty  = int(item.get("qty", 1)) if item.get("qty") else 1
                if name:
                    item_counts[name] += qty
                    total_items_ordered += qty

            try:
                total = float(receipt.get("total", 0))
                if total > max_total:
                    max_total = total
                    most_expensive = {
                        "filename": attachment.get("filename"),
                        "total": total,
                        "transaction_id": receipt.get("transaction_id"),
                        "order_time": receipt.get("order_time"),
                        "items": receipt.get("items", [])  # <-- ADD THIS
                    }

            except (ValueError, TypeError):
                pass

            rname = receipt.get("restaurant_name")
            if rname:
                restaurant_counts[rname] += 1

    busiest_day = max(date_counts.items(), key=lambda x: x[1], default=(None, 0))

    sorted_items = [
        {"item": name, "count": cnt}
        for name, cnt in sorted(item_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    unique_restaurants = len(restaurant_counts)
    if restaurant_counts:
        top_name, top_visits = max(restaurant_counts.items(), key=lambda x: x[1])
        top_restaurant = {"name": top_name, "count": top_visits}
    else:
        top_restaurant = {"name": None, "count": 0}
    total_unique_items = len(item_counts)
    return (
        sorted_items,
        most_expensive,
        total_items_ordered,
        total_unique_items,   # <-- ADD THIS
        {"date": busiest_day[0], "order_count": busiest_day[1]},
        dict(restaurant_counts),
        earliest_order,
        unique_restaurants,
        top_restaurant,
        latest_order,
    )


# -----------------------
# Main upload route
# -----------------------

@app.route("/upload_emls", methods=["POST"])
def upload_emls():
    try:
        uploaded_files = request.files.getlist("files")
        if not uploaded_files:
            return jsonify({"error": "No files uploaded."}), 400

        email_data = []

        for file in uploaded_files:
            filename = file.filename.lower()

            if filename.endswith(".zip"):
                with tempfile.TemporaryDirectory() as temp_dir:
                    zip_path = os.path.join(temp_dir, "upload.zip")
                    file.save(zip_path)

                    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                        zip_ref.extractall(temp_dir)

                    for root, _, files_inside in os.walk(temp_dir):
                        for name in files_inside:
                            if name.endswith(".eml"):
                                eml_path = os.path.join(root, name)
                                with open(eml_path, "rb") as f:
                                    content = f.read()
                                    msg = email.message_from_bytes(content)
                                    email_data.append(parse_single_eml(msg, name))

            elif filename.endswith(".eml"):
                content = file.read()
                msg = email.message_from_bytes(content)
                email_data.append(parse_single_eml(msg, filename))

            else:
                print(f"⚠️ Skipped unsupported file: {filename}")

        if not email_data:
            return jsonify({"error": "No valid .eml files found."}), 400

        # Generate statistics
        item_stats, most_expensive, total_items, total_unique_items, busiest_day, restaurant_counts, earliest_order, unique_restaurants, top_restaurant, latest_order = generate_receipt_statistics(email_data)


        # ── NEW: collect all receipts from the busiest day ─────────────
        busiest_date = busiest_day["date"]  # e.g. "2025-02-12"
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
                    continue
        # ────────────────────────────────────────────────────────────────

        recipient_name = next(
            (entry.get("recipient_name") for entry in email_data if entry.get("recipient_name")),
            None
        )

        return jsonify({
            "recipient_name": recipient_name,
            "item_counts": item_stats,
            "most_expensive_order": most_expensive,
            "total_items_ordered": total_items,
            "total_unique_items": total_unique_items,    # <-- ADD THIS
            "busiest_day": busiest_day,
            "busiest_day_orders": busiest_day_orders,
            "restaurant_counts": restaurant_counts,
            "unique_restaurants": unique_restaurants,
            "top_restaurant": top_restaurant,
            "earliest_order_by_time": earliest_order,
            "latest_order_by_time": latest_order
        })


    except Exception as e:
        print("❌ Exception in /upload_emls:", e)
        return jsonify({"error": str(e)}), 500

GENAI_CLIENT = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])

@app.route("/api/generate-vibe", methods=["POST"])
def generate_vibe():
    payload = request.get_json() or {}
    stats = payload.get("stats")
    if not stats:
        return jsonify({"error": "Missing stats payload"}), 400

    print("DEBUG stats:", json.dumps(stats, indent=2))
    # Filter stats: exclude 'earliest_order_by_time' and 'latest_order_by_time'
    # 1. Filter out unwanted top-level keys
    filtered_stats = {k: v for k, v in stats.items() if k not in ["earliest_order_by_time", "latest_order_by_time", "recipient_name"]}

    # 2. Limit 'item_counts' to first 10 entries
    if "item_counts" in filtered_stats and isinstance(filtered_stats["item_counts"], list):
        filtered_stats["item_counts"] = filtered_stats["item_counts"][:5]

    # 3. Clean 'busiest_day_orders': remove 'pickup_time' and 'transaction_id' fields
    if "busiest_day_orders" in filtered_stats and isinstance(filtered_stats["busiest_day_orders"], list):
        cleaned_orders = []
        for order in filtered_stats["busiest_day_orders"]:
            cleaned_order = {k: v for k, v in order.items() if k not in ["pickup_time", "transaction_id", "total"]}
            cleaned_orders.append(cleaned_order)
        filtered_stats["busiest_day_orders"] = cleaned_orders
    # 4. Limit 'restaurant_counts' to top 5 restaurants
    if "restaurant_counts" in filtered_stats and isinstance(filtered_stats["restaurant_counts"], dict):
        sorted_restaurants = sorted(filtered_stats["restaurant_counts"].items(), key=lambda x: x[1], reverse=True)
        filtered_stats["restaurant_counts"] = dict(sorted_restaurants[:5])
    # Build a new structure
    reformatted_stats = {
        "top_items": [entry["item"] for entry in filtered_stats.get("item_counts", [])],
        "top_restaurants": list(filtered_stats.get("restaurant_counts", {}).keys()),
        "total_items_ordered": filtered_stats.get("total_items_ordered"),
        "total_unique_items": filtered_stats.get("total_unique_items"),
        "top_restaurant": filtered_stats.get("top_restaurant", {}).get("name"),
    }


    print("DEBUG stats:", reformatted_stats )
    # Now build your prompt using filtered_stats
    prompt = (
        "Based on these mobile-order stats, describe the user's vibe in one catchy, Spotify-Wrapped-style sentence. "
        "Use playful language and food-related descriptions. Don't use the word 'foodie.' Don't use the phrase 'one mobile order at a time.' "
        "Start with 'You're a...' and use flavorful adjectives and hyphenated phrases. "
        "RESPOND ONLY as a JSON object with two fields: "
        "`sentence` (the vibe description) and `colors` (a dictionary mapping key words to a fitting color). "
        "For `colors`, you MUST choose from this exact list of hex codes: "
        "#5a8b5d, #907350, #7a4b8f, #3d2758, #dd660d, #dd660d, #8faab3, #c4bd8b, #aeb8f9, #d4a1a1, #400000, #02006c, #026a81, #aeb8f9, #feb204. "
        "Do not invent new colors. Only use these. "
        "Wrap your response inside triple backticks like ```json ... ```.\n\n"
        f"{reformatted_stats }"
    )


    try:
        
        response = GENAI_CLIENT.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        raw_text = response.candidates[0].content.parts[0].text
        print("RAW Gemini output:", raw_text)

        # Strip ```json and ``` if they exist
        if raw_text.startswith("```"):
            raw_text = re.sub(r"^```json\s*", "", raw_text)
            raw_text = re.sub(r"```$", "", raw_text)
            raw_text = raw_text.strip()

        data = json.loads(raw_text)

        sentence = data.get("sentence", "").strip()
        colors = data.get("colors", {})

        return jsonify({"vibe": sentence, "colors": colors})

    except Exception as e:
        app.logger.error("Gemini generate_content error: %s", e)
        return jsonify({"error": str(e)}), 500




# -----------------------
# Run the server
# -----------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

