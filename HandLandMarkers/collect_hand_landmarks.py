import cv2
import mediapipe as mp
import csv
import os

# === CONFIGURATION ===
LABELS = [
    'Hallo', 'Doei', 'Ik', 'Lopen', 'Zeeschildpad',
    'Zondag', 'Jij', 'Douchen', 'Fietsen', 'Auto'
]
SAMPLES_PER_LABEL = 100  # Number of frames to record per sign
header = ['label'] + [f'hand{h}_{i}_{axis}' for h in range(2) for i in range(21) for axis in ['x', 'y', 'z']]

CSV_PATH = 'Data\POCHandSigns.csv'

# Ensure the parent directory exists
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Data'))
os.makedirs(parent_dir, exist_ok=True)

# If file doesn't exist, create and write header
if not os.path.exists(CSV_PATH):
    with open(CSV_PATH, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2)

cap = cv2.VideoCapture(0)

cycle_count = 0

while True:
    cycle_count += 1
    print(f'--- Starting cycle {cycle_count} of all signs ---')
    for label in LABELS:
        print(f'Get ready to record: {label}. Press SPACE to start, ESC to skip.')
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            cv2.putText(frame, f'Label: {label} - Press SPACE to start', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
            cv2.putText(frame, f'Cycle: {cycle_count}', (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,0,0), 2)
            cv2.imshow('Collecting Data', frame)
            key = cv2.waitKey(1)
            if key == 27:  # ESC
                break
            if key == 32:  # SPACE
                while True:
                    print(f'Recording {SAMPLES_PER_LABEL} samples for {label} (Cycle {cycle_count})...')
                    count = 0
                    while count < SAMPLES_PER_LABEL:
                        ret, frame = cap.read()
                        if not ret:
                            break
                        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        results = hands.process(frame_rgb)
                        if results.multi_hand_landmarks:
                            hand_landmarks_list = list(results.multi_hand_landmarks)
                            while len(hand_landmarks_list) < 2:
                                hand_landmarks_list.append(None)
                            row = [label]
                            for hand_landmarks in hand_landmarks_list:
                                if hand_landmarks:
                                    for lm in hand_landmarks.landmark:
                                        row.extend([lm.x, lm.y, lm.z])
                                else:
                                    row.extend([None, None, None] * 21)
                            with open(CSV_PATH, 'a', newline='') as f:
                                writer = csv.writer(f)
                                writer.writerow(row)
                                f.flush()
                            print(f'Wrote row for {label} sample {count+1} (Cycle {cycle_count})')
                            count += 1
                            for hand_landmarks in hand_landmarks_list:
                                if hand_landmarks:
                                    mp.solutions.drawing_utils.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                        else:
                            print('No hands detected in this frame.')
                        cv2.putText(frame, f'{label}: {count}/{SAMPLES_PER_LABEL}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
                        cv2.putText(frame, f'Cycle: {cycle_count}', (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,0,0), 2)
                        cv2.imshow('Collecting Data', frame)
                        if cv2.waitKey(1) & 0xFF == 27:
                            break
                    print(f'Done recording for {label} (Cycle {cycle_count}).')
                    print('Press SPACE to repeat this sign, ESC to continue to next sign.')
                    # Wait for user input: SPACE to repeat, ESC to continue
                    while True:
                        key = cv2.waitKey(0)
                        if key == 27:  # ESC
                            repeat = False
                            break
                        if key == 32:  # SPACE
                            repeat = True
                            break
                    if not repeat:
                        break
    print(f'--- Completed cycle {cycle_count} of all signs ---')
    print('Press SPACE to start another cycle, or ESC to finish and exit.')
    while True:
        key = cv2.waitKey(0)
        if key == 27:  # ESC
            cap.release()
            cv2.destroyAllWindows()
            print('Data collection complete!')
            exit()
        if key == 32:  # SPACE
            break
