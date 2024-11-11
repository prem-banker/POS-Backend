from flask import Flask, jsonify, request
from flask_cors import CORS
import pickle

app = Flask(__name__)
CORS(app)  # Enables CORS for all routes by default

# Load models from pickle files at startup
model_files = {
    "Pet Food & Treats": "food_model.pkl",
    "Pet Medicines": "medicine_model.pkl",
    "Others": "other_model.pkl",
    "Pet Grooming": "grooming_model.pkl",
    "Pet Accessories": "access_model.pkl"
}

models = {}

# Load each model
for category, model_file in model_files.items():
    with open('models/' + model_file, "rb") as f:
        models[category] = pickle.load(f)

# Function to generate forecast for a given model and steps
def generate_forecast(model, steps):
    forecast = model.forecast(steps=steps)
    forecast = [round(value) for value in forecast.tolist()]  # Ensure forecast is a list of rounded values
    return forecast

# Flask route to get forecast for each category for the next x weeks
@app.route('/forecast/<int:weeks>', methods=['GET'])
def forecast(weeks):
    response = {}

    # Generate forecasts for each category
    for category, model in models.items():
        response[category] = generate_forecast(model, weeks)

    return jsonify(response)

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
