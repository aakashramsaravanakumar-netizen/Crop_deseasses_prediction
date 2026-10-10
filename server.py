"""
AgriScan AI - Python API & Static Server Backend
================================================
Zero-dependency server using standard Python library (no pip packages needed to run).
Serves the web application on port 8000 and provides REST endpoints:
  - GET  /api/health   -> Health check ping
  - POST /api/predict  -> Foliage image disease classification endpoint

Ready for dropping in PyTorch (ResNet50 / EfficientNet) or TensorFlow / Keras models.
"""

import sys
import os
import json
import random
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8000

class AgriScanHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for external API client access
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # API Health Check Endpoint
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                "status": "healthy",
                "service": "AgriScan AI Foliar Neural Engine",
                "version": "2.5.0",
                "supported_crops": ["Tomato", "Corn", "Apple", "Rice", "Potato", "Bell Pepper", "Grape"]
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # Serve static frontend files
        super().do_GET()

    def do_POST(self):
        # Foliar Image Disease Prediction Endpoint
        if self.path == '/api/predict':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            # --- MODEL INFERENCE INTEGRATION POINT ---
            # To connect a custom PyTorch or TensorFlow model:
            # 1. Parse image bytes:
            #      image = Image.open(io.BytesIO(post_data)).convert('RGB')
            # 2. Run tensor transform & forward pass:
            #      tensor = transform(image).unsqueeze(0)
            #      with torch.no_grad():
            #          outputs = model(tensor)
            #          predicted_idx = torch.argmax(outputs, 1).item()
            # -----------------------------------------

            # Simulated high-confidence CNN inference result
            candidate_diseases = [
                {
                    "diseaseId": "tomato_late_blight",
                    "crop": "Tomato",
                    "diseaseName": "Late Blight",
                    "confidence": round(94.0 + random.random() * 4.5, 1),
                    "pathogen": "Phytophthora infestans (Oomycete)"
                },
                {
                    "diseaseId": "corn_common_rust",
                    "crop": "Corn (Maize)",
                    "diseaseName": "Common Rust",
                    "confidence": round(93.0 + random.random() * 4.0, 1),
                    "pathogen": "Puccinia sorghi (Fungus)"
                },
                {
                    "diseaseId": "apple_scab",
                    "crop": "Apple",
                    "diseaseName": "Apple Scab",
                    "confidence": round(95.0 + random.random() * 3.5, 1),
                    "pathogen": "Venturia inaequalis (Fungus)"
                },
                {
                    "diseaseId": "rice_leaf_blast",
                    "crop": "Rice (Paddy)",
                    "diseaseName": "Rice Leaf Blast",
                    "confidence": round(96.0 + random.random() * 3.0, 1),
                    "pathogen": "Magnaporthe oryzae (Fungus)"
                },
                {
                    "diseaseId": "healthy_crop_leaf",
                    "crop": "Tomato / Crop General",
                    "diseaseName": "Healthy Foliage",
                    "confidence": round(97.5 + random.random() * 2.0, 1),
                    "pathogen": "None (Healthy Tissue)"
                }
            ]

            selected = random.choice(candidate_diseases)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(selected).encode('utf-8'))
            return

        self.send_error(404, "Endpoint not found")

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, AgriScanHandler)
    print(f"============================================================")
    print(f"  AgriScan AI Web & API Server running at:")
    print(f"  http://localhost:{PORT}")
    print(f"  Health Check: http://localhost:{PORT}/api/health")
    print(f"  Prediction Endpoint: http://localhost:{PORT}/api/predict")
    print(f"============================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")
        httpd.server_close()

if __name__ == '__main__':
    run()
