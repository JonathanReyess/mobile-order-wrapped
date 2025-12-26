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
    "You are a savage Gen-Z roast writer for a college dining app. Based on these mobile-order stats, "
    "brutally roast the user in ONE short and punchy sentence. "
    "Be MEAN, sarcastic, chaotic, and **specific** to their ordering behavior. "
    "Channel the vibe of a snarky friend who knows all their embarrassing habits. "
    "This is *supposed* to hurt their feelings a little (but still be funny). "
    "No positivity. No polite wording. No wholesome compliments. "
    "Avoid being vague or abstract — call out real behaviors like laziness, spending habits, late-night munching, etc. "
    "Do **not** use the words 'foodie' or 'penchant' and do **not** use the phrase 'one mobile order at a time.' "
    "Start the roast EXACTLY with: \"You're a...\" (including the ellipsis). "
    "Tone inspirations: chaotic TikTok captions, Gen-Z meme humor, judgmental roommate energy. "
    "ONE sentence only. No emojis. "
    "RETURN FORMAT: Respond **only** as a JSON object with two fields:\n"
    "1. `sentence`: the roast\n"
    "2. `colors`: a dictionary mapping 2–5 **relevant** keywords from the roast to fitting hex colors\n"
    "Valid hex colors (pick only from these, never invent new ones): "
    "#907350, #7a4b8f, #87CEEB, #F7A3BA, #70996D, #3d2758, #dd660d, #c4bd8b, #feb204. "
    "Wrap your response inside triple backticks like ```json ... ```.\n\n"
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
