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

# Load model and label encoder from a dedicated 'models' directory
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
model = tf.keras.models.load_model(os.path.join(MODEL_DIR, "hand_sign_model.h5"))
label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder.joblib"))

@app.post("/predict")
async def predict(request: Request):
    data = await request.json()
    # Expecting data["landmarks"] as a list of up to 2 lists, each 63 floats
    hands = data["landmarks"]
    # Pad with zeros if only 1 hand detected
    if len(hands) == 1:
        hands.append([0.0]*63)
    elif len(hands) == 0:
        hands = [[0.0]*63, [0.0]*63]
    # Flatten to 126 values
    flat_landmarks = np.array(hands).flatten().reshape(1, -1)
    pred = model.predict(flat_landmarks)
    label = label_encoder.inverse_transform([np.argmax(pred)])[0]
    return {"label": label}
