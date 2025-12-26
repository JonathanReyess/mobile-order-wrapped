from flask import Flask
from dotenv import load_dotenv
from extensions import cors
from routes.upload import upload_bp
from routes.vibe import vibe_bp
import os

load_dotenv()

def create_app():
    app = Flask(__name__)

    cors.init_app(app)

    app.register_blueprint(upload_bp)
    app.register_blueprint(vibe_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )
