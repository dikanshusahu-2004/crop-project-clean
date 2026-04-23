from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
import random   # 👈 add this

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        file = request.files["file"]

        img = Image.open(file).convert("RGB")
        img = img.resize((224, 224))

        # 🔥 FAKE prediction (testing)
        
        prediction_value = random.random()

        print("Prediction:", prediction_value)

        if prediction_value > 0.5:
         result = "Damaged"
        else:
         result = "Healthy"

        return jsonify({"result": result})

    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)