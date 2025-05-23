import os
import cv2
import mediapipe as mp
import csv

# Update the dataset directory to match your folder structure
DATASET_DIR = 'Dataset asl/asl_alphabet_train/asl_alphabet_train'
OUTPUT_CSV = 'Data/ASLHandSigns.csv'

mp_hands = mp.solutions.hands.Hands(static_image_mode=True, max_num_hands=1)
mp_drawing = mp.solutions.drawing_utils

header = []
for i in range(21):
    header += [f'x{i}', f'y{i}', f'z{i}']
header.append('label')

count = 0
skipped = 0
with open(OUTPUT_CSV, 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(header)
    for label in os.listdir(DATASET_DIR):
        label_dir = os.path.join(DATASET_DIR, label)
        if not os.path.isdir(label_dir):
            continue
        for img_name in os.listdir(label_dir):
            img_path = os.path.join(label_dir, img_name)
            image = cv2.imread(img_path)
            if image is None:
                skipped += 1
                continue
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = mp_hands.process(image_rgb)
            if results.multi_hand_landmarks:
                # Only use the first detected hand
                hand_landmarks = results.multi_hand_landmarks[0]
                row = []
                for lm in hand_landmarks.landmark:
                    row += [lm.x, lm.y, lm.z]
                row.append(label)
                writer.writerow(row)
                count += 1
                if count % 500 == 0:
                    print(f"Processed {count} images...")
            else:
                skipped += 1
print(f"Done! Processed {count} images. Skipped {skipped} images with no hand detected or read error.")