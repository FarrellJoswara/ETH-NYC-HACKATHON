# backend/app.py
from flask import Flask, request, jsonify
from privy import PrivyAPI
from dotenv import load_dotenv
import os
from flask_cors import CORS
import hashlib
from photo_nft import PhotoNFT
import json

with open("abi.json") as f:
    abi = json.load(f)
load_dotenv()

PRIVY_APP_ID = os.getenv("PRIVY_APP_ID")
PRIVY_CLIENT_ID = os.getenv("PRIVY_CLIENT_ID")
PRIVY_SECRET = os.getenv("PRIVY_SECRET")

# --- Flow EVM testnet provider ---
provider = "https://testnet.evm.nodes.onflow.org"
contract_address = "0x61eaDf415e30E55f912fc2250B3048EffA3a8bf4"
wallet_address = "0x70c8Af5E0D1B00B166421505a034f0BA7B31a73c"
private_key = "e4ce195f5d708f55e056cdfc6a986f22e3e8b53d04e2e8db9f249665c32746fe"

nft = PhotoNFT(provider, contract_address, abi, wallet_address, private_key)

app = Flask(__name__)
CORS(app)  # allow cross-origin requests

# Initialize Privy client
client = PrivyAPI(
    app_id=PRIVY_APP_ID,
    app_secret=PRIVY_SECRET
)

@app.route("/hello", methods=["GET"])
def hello():

    # In your Flask app or elsewhere:
    total_nfts = nft.get_token_count()          # Total across everyone
    my_photos = nft.get_user_photo_count()      # Just your photos
    other_user = nft.get_user_photo_count("0x...") # Someone else's photos

    print(f"Total NFTs: {total_nfts}")
    print(f"My photos: {my_photos}")


    return jsonify({"message": "hello world"})

@app.route("/verify-image", methods=["POST"])
def verify_image():
    if 'photo' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    photo = request.files['photo']
    file_bytes = photo.read()
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    #file_hash = "5041022a4eab79829c6ca6d1f41064bc9292250b29ac7f4418b2ab3829ba47af" # for testing
    # --- Use Privy to verify the photo here ---
    # Example placeholder: always verified for now
    is_verified = True  # Replace with actual Privy verification logic if needed

    # --- Check if photo already exists on the blockchain ---
    already_exists = nft.check_photo(file_hash)
    print("This Photo Exists alr?: ", already_exists)

    if not is_verified:
        return jsonify({
            "message": "Photo verification failed",
        }), 400
    elif already_exists:
        return jsonify({
            "message": "Photo already exists on-chain",
        }), 400
    else:
        # Mint NFT using only the photo hash
        receipt = nft.mint_nft(file_hash)

        # Convert any HexBytes in the receipt to strings
        receipt_dict = {k: (v.hex() if isinstance(v, bytes) else v) for k, v in dict(receipt).items()}

        return jsonify({
            "message": "Photo verified and NFT minted",
    
    })

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5008, debug=True)
