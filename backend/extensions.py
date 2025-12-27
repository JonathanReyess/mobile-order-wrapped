import os
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv

load_dotenv()

cors = CORS(resources={r"/*": {"origins": "*"}})

GENAI_CLIENT = genai.Client(
    api_key=os.environ["GOOGLE_API_KEY"]
)
