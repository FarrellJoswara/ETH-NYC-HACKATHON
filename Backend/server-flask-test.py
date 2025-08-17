# backend/app.py
from flask import Flask, request, jsonify
from privy import PrivyAPI
from dotenv import load_dotenv
import os
from flask_cors import CORS
import hashlib  # for example hash function

load_dotenv()

PRIVY_APP_ID = os.getenv("PRIVY_APP_ID")
PRIVY_CLIENT_ID = os.getenv("PRIVY_CLIENT_ID")
PRIVY_SECRET = os.getenv("PRIVY_SECRET")

app = Flask(__name__)
CORS(app)  # allow cross-origin requests

# Initialize Privy client
client = PrivyAPI(
    app_id=PRIVY_APP_ID,
    app_secret=PRIVY_SECRET
)

# Example hello route
@app.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "hello world"})


# Fixed: define this route BEFORE app.run()
@app.route("/verify-image", methods=["POST"])
def verify_image():
    if 'photo' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    photo = request.files['photo']
    #isJailBroken = request.form.get('is_jailbroken', 'false') == 'true'
    #is_emulated = request.form.get('is_emulated', 'false') == 'true'
    # Example hash function using hashlib
    file_bytes = photo.read()
    file_hash = hashlib.sha256(file_bytes).hexdigest()

    return jsonify({
        "message": "File received successfully",
        "hash": file_hash
    })


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5008, debug=True)
