# backend/app.py
from flask import Flask, request, jsonify
from privy import PrivyAPI
from dotenv import load_dotenv
import os
from hash import hashing, get_file_date

load_dotenv()

PRIVY_APP_ID = os.getenv("PRIVY_APP_ID")
PRIVY_CLIENT_ID = os.getenv("PRIVY_CLIENT_ID")
PRIVY_SECRET = os.getenv("PRIVY_SECRET")

app = Flask(__name__)

# Initialize Privy client with your app credentials
client = PrivyAPI(
    app_id=PRIVY_APP_ID,
    app_secret=PRIVY_CLIENT_ID
)

# Generate a single server-side authorization key
signer = client.wallets.generate_user_signer(user_jwt=None)  # no JWT needed
client.update_authorization_key(signer.decrypted_authorization_key)

@app.route("/verify-image", methods=["POST"])
def verify_image():
    data = request.json
    image_url = data.get("image_url")  # for example

    # Example: Call Privy to verify or analyze image
    result = client.verifications.create(
        image_url=image_url,
        verification_type="image"  # adjust as needed
    )

    return jsonify(result)


@app.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "hello world"})

if __name__ == "__main__":
    app.run(debug=True)


if __name__ == "__main__":
    app.run(debug=True)