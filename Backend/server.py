# run: python app/server.py

from flask import Flask, request, jsonify
from PIL import Image
import imagehash
import base64
import io
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def phash_image():
    if 'image' not in request.json:
        return jsonify({'error': 'No image provided'}), 400

    image_data = request.json['image']
    try:
        # Decode the base64 string
        image_bytes = base64.b64decode(image_data)
        
        # Open the image using Pillow
        image = Image.open(io.BytesIO(image_bytes))
        
        # Calculate the perceptual hash
        hash_value = imagehash.phash(image)
        
        return jsonify({'hash': str(hash_value)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
