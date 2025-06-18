from flask import Flask, request, jsonify
import numpy as np
import pickle
import json

app = Flask(__name__)

# Load model and symptom list
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('symptom_list.json', 'r') as f:
    symptom_list = json.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    user_symptoms = data.get("symptoms", [])

    # Convert user symptoms to binary vector
    input_vector = [1 if symptom in user_symptoms else 0 for symptom in symptom_list]
    input_vector = np.array(input_vector).reshape(1, -1)

    # Predict
    prediction = model.predict(input_vector)[0]  # Already string label

    return jsonify({"predicted_disease": prediction})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
