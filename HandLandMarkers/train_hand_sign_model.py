import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
import csv
import joblib
import os

# Load the collected data
CSV_PATH = '../Data/POCHandSigns.csv'
def count_csv_columns(csv_path):
    with open(csv_path, newline='') as f:
        reader = csv.reader(f)
        header = next(reader)
        return len(header)

EXPECTED_COLS = count_csv_columns(CSV_PATH)

def clean_csv(csv_path, expected_cols):
    import pandas as pd
    good_rows = []
    with open(csv_path, newline='') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if len(row) == expected_cols:
                good_rows.append(row)
    # Save only good rows
    clean_path = csv_path + '.cleaned'
    with open(clean_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(good_rows)
    return clean_path

# Clean the CSV and use the cleaned file for training
CLEANED_CSV_PATH = clean_csv(CSV_PATH, EXPECTED_COLS)
df = pd.read_csv(CLEANED_CSV_PATH)
print(f"Loaded {len(df)} valid rows from cleaned CSV.")
X = df.drop('label', axis=1).values
le = LabelEncoder()
y = le.fit_transform(df['label'])
# Save the label encoder for API use
joblib.dump(le, "label_encoder.joblib")

# Split into train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Build a simple neural network
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(63,)),  # 21 landmarks * 3 coords
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(len(set(y)), activation='softmax')
])
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(X_train, y_train, epochs=20, validation_data=(X_test, y_test))

# Save model and label encoder to the models directory after training
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)
model.save(os.path.join(MODEL_DIR, 'hand_sign_model.h5'))
joblib.dump(le, os.path.join(MODEL_DIR, 'label_encoder.joblib'))
