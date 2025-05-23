import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
import pandas as pd
from sklearn.preprocessing import LabelEncoder

CSV_PATH = 'Data/POCHandSigns.csv'

LABELS = [
    'Hallo', 'Doei', 'Ik', 'Lopen', 'Zeeschildpad',
    'Zondag', 'Jij', 'Douchen', 'Fietsen', 'Auto'
]

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1)
model = tf.keras.models.load_model('hand_sign_model.h5')
le = LabelEncoder()
le.fit(LABELS)
df = pd.read_csv(CSV_PATH)

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)
    prediction = ''
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            row = []
            for lm in hand_landmarks.landmark:
                row.extend([lm.x, lm.y, lm.z])
            if len(row) == 63:
                X = np.array(row).reshape(1, -1)
                pred = model.predict(X, verbose=0)
                class_id = np.argmax(pred)
                prediction = le.inverse_transform([class_id])[0]
            mp.solutions.drawing_utils.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
    cv2.putText(frame, f'Prediction: {prediction}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
    cv2.imshow('Dutch Sign Language Prediction', frame)
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
