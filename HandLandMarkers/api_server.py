from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import tensorflow as tf
import joblib
import os

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Update these paths if needed
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'hand_sign_model.h5')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), 'models', 'label_encoder.joblib')

# Load model and label encoder from a dedicated 'models' directory
model = tf.keras.models.load_model(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)

@app.post("/predict")
async def predict(request: Request):
    data = await request.json()
    # Expecting data["landmarks"] as a list of up to 2 lists, each 63 floats
    hands = data["landmarks"]
    # If only 1 hand, pad with zeros for the second hand
    if len(hands) == 1:
        hands.append([0.0]*63)
    elif len(hands) == 0:
        hands = [[0.0]*63, [0.0]*63]
    # Try both hands (126 features), fallback to 1 hand (63 features) if model expects it
    flat_landmarks = np.array(hands).flatten().reshape(1, -1)
    try:
        pred = model.predict(flat_landmarks)
    except Exception as e:
        # If model expects only 1 hand (63 features), use only the first hand
        flat_landmarks = np.array(hands[0]).reshape(1, -1)
        pred = model.predict(flat_landmarks)
    label = label_encoder.inverse_transform([np.argmax(pred)])[0]
    return {"label": label}
