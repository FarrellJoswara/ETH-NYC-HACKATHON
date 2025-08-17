#run python app/hash.py

from PIL import Image, ExifTags
import imagehash
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image
import os
from datetime import datetime
import pytz

# Load your image
image = Image.open('./assets/images/pic.jpg')
image2 = Image.open('./assets/images/PhotoID2.png')
# Generate the perceptual hash
hash_value = imagehash.phash(image, hash_size=256)
hash_value2 = imagehash.phash(image2, hash_size=256)
# Print the hash value
#print("Perceptual Hash:", hash_value)
#print("Perceptual Hash:", hash_value2)
#print(hash_value - hash_value2)

perc = ((hash_value - hash_value2)/len(hash_value))*100
print(100-perc)

#METADATAAAAAAAA

def get_file_date(path):
    stats = os.stat(path)
    
    # Convert timestamps to datetime objects
    created = datetime.fromtimestamp(stats.st_ctime)
    modified = datetime.fromtimestamp(stats.st_mtime)
    
    # Set timezone to Eastern Time
    eastern = pytz.timezone('America/New_York')
    created = eastern.localize(created)
    modified = eastern.localize(modified)
    
    return {
        'created': created.strftime('%m/%d/%Y, %I:%M:%S %p'),
        'modified': modified.strftime('%m/%d/%Y, %I:%M:%S %p')
    }

print(get_file_date('./assets/images/pic.jpg'))