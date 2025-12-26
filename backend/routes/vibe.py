from flask import Blueprint, request, jsonify
from extensions import GENAI_CLIENT
from google.genai import types
import json
import re

vibe_bp = Blueprint("vibe", __name__)

@vibe_bp.route("/api/generate-vibe", methods=["POST"])
def generate_vibe():
    payload = request.get_json() or {}
    stats = payload.get("stats")
    if not stats:
        return jsonify({"error": "Missing stats payload"}), 400

    filtered = {k: v for k, v in stats.items()
                if k not in ["earliest_order_by_time", "latest_order_by_time", "recipient_name"]}

    if isinstance(filtered.get("item_counts"), list):
        filtered["item_counts"] = filtered["item_counts"][:5]

    if isinstance(filtered.get("restaurant_counts"), dict):
        filtered["restaurant_counts"] = dict(
            sorted(filtered["restaurant_counts"].items(),
                   key=lambda x: x[1],
                   reverse=True)[:5]
        )

    reformatted = {
        "top_items": [i["item"] for i in filtered.get("item_counts", [])],
        "top_restaurants": list(filtered.get("restaurant_counts", {}).keys()),
        "total_items_ordered": filtered.get("total_items_ordered"),
        "total_unique_items": filtered.get("total_unique_items"),
        "top_restaurant": filtered.get("top_restaurant", {}).get("name"),
    }

    prompt = (
        "You are a savage Gen-Z roast writer for a college dining app. "
        "Roast the user in ONE sentence. Start EXACTLY with: \"You're a...\" "
        "Respond ONLY as JSON with fields `sentence` and `colors`.\n\n"
        f"{reformatted}"
    )

    try:
        response = GENAI_CLIENT.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(temperature=1.1),
        )

        raw = response.candidates[0].content.parts[0].text
        raw = re.sub(r"^```json\s*|\s*```$", "", raw).strip()
        data = json.loads(raw)

        return jsonify({
            "vibe": data.get("sentence"),
            "colors": data.get("colors"),
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
