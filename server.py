import sys
import os
import json
import io
import numpy as np
from http.server import HTTPServer, SimpleHTTPRequestHandler
import tensorflow as tf
import keras
from PIL import Image

PORT = 8000

# -------------------------------------------------------------------
# ABSOLUTE PATHS TO YOUR TRAINED MODEL FILES
# -------------------------------------------------------------------
MODEL_PATH = r"C:\Users\Aakash\Documents\NNDL prediction project\training\crop_disease_model.h5"
CLASS_NAMES_PATH = r"C:\Users\Aakash\Documents\NNDL prediction project\training\class_names.json"

print("Loading class mappings...")
with open(CLASS_NAMES_PATH, "r") as f:
    class_names = json.load(f)
print(f"Loaded {len(class_names)} class mappings.")

print("Loading TensorFlow model...")

# Register custom TrueDivide layer mapping for Keras 3 deserialization
custom_objects = {
    'TrueDivide': lambda x, y: tf.math.divide(x, y),
    'tf': tf
}

try:
    with keras.saving.custom_object_scope(custom_objects):
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("Model loaded successfully via Keras custom object scope!")
except Exception as e:
    print(f"Standard load failed, attempting weight transfer workaround: {e}")
    # Fallback: Construct matching architecture and load weights safely
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(len(class_names), activation='softmax')(x)

    model = tf.keras.Model(inputs, outputs)
    model.load_weights(MODEL_PATH, by_name=True, skip_mismatch=True)
    print("Model constructed and weights mapped successfully!")


class AgriScanHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                "status": "healthy",
                "service": "AgriScan AI Foliar Neural Engine",
                "model_loaded": True,
                "classes_count": len(class_names)
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        super().do_GET()

    def do_POST(self):
        if self.path == '/api/predict':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                image = Image.open(io.BytesIO(post_data)).convert('RGB')
                image = image.resize((224, 224))
                img_array = np.expand_dims(np.array(image, dtype=np.float32), axis=0)

                preds = model.predict(img_array)
                top_idx = int(np.argmax(preds[0]))
                confidence = float(preds[0][top_idx] * 100)
                predicted_raw_class = class_names[top_idx]

                if "___" in predicted_raw_class:
                    crop, disease_name = predicted_raw_class.split("___", 1)
                elif "_" in predicted_raw_class:
                    crop, disease_name = predicted_raw_class.split("_", 1)
                else:
                    crop, disease_name = "Crop", predicted_raw_class

                crop = crop.replace("_", " ").title()
                disease_name = disease_name.replace("_", " ").title()

                response = {
                    "diseaseId": predicted_raw_class.lower(),
                    "crop": crop,
                    "diseaseName": disease_name,
                    "confidence": round(confidence, 1),
                    "pathogen": "Identified by MobileNetV2 Neural Classifier"
                }

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))

            except Exception as e:
                print(f"Prediction Error: {e}")
                self.send_response(500)
                self.end_headers()
            return

        self.send_error(404, "Endpoint not found")

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, AgriScanHandler)
    print(f"============================================================")
    print(f"  AgriScan AI Live Server running at http://localhost:{PORT}")
    print(f"============================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")
        httpd.server_close()

if __name__ == '__main__':
    run()