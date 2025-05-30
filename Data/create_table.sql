-- Create database if not exists
CREATE DATABASE IF NOT EXISTS HandTrackerDB;
USE HandTrackerDB;

-- --------------------------------------------
-- Table for user accounts
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS user_accounts (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)    NOT NULL UNIQUE,
    email           VARCHAR(255)   NOT NULL UNIQUE,
    password_hash   VARCHAR(255)   NOT NULL,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------
-- Table for sign languages
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS sign_languages (
    language_id     INT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(10)    NOT NULL UNIQUE,
    name            VARCHAR(100)   NOT NULL,
    country         VARCHAR(100),
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------
-- Table for gestures
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS gestures (
    gesture_id      INT AUTO_INCREMENT PRIMARY KEY,
    language_id     INT NOT NULL,
    gesture_code    VARCHAR(255)   NOT NULL,
    name            VARCHAR(100),
    description     TEXT,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(language_id, gesture_code),
    FOREIGN KEY (language_id) REFERENCES sign_languages(language_id)
);

-- --------------------------------------------
-- Table for default translations
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS gesture_translations (
    translation_id  INT AUTO_INCREMENT PRIMARY KEY,
    gesture_id      INT NOT NULL,
    target_locale   VARCHAR(10)    NOT NULL,
    text_value      VARCHAR(255)   NOT NULL,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(gesture_id, target_locale),
    FOREIGN KEY (gesture_id) REFERENCES gestures(gesture_id)
);

-- --------------------------------------------
-- Table for user custom translations
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS user_custom_translations (
    custom_id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    gesture_id      INT NOT NULL,
    custom_text     VARCHAR(255)   NOT NULL,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(user_id, gesture_id),
    FOREIGN KEY (user_id) REFERENCES user_accounts(user_id),
    FOREIGN KEY (gesture_id) REFERENCES gestures(gesture_id)
);

-- --------------------------------------------
-- Table for gesture landmarks
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS gesture_landmarks (
    landmark_id     INT AUTO_INCREMENT PRIMARY KEY,
    gesture_id      INT NOT NULL,
    hand_label      VARCHAR(5)     NOT NULL,
    landmark_index  INT            NOT NULL,
    x_norm          FLOAT          NOT NULL,
    y_norm          FLOAT          NOT NULL,
    x_world         FLOAT,
    y_world         FLOAT,
    z_world         FLOAT,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gesture_id) REFERENCES gestures(gesture_id)
);

-- --------------------------------------------
-- Table for output sequences
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS output_sequences (
    sequence_id     INT AUTO_INCREMENT PRIMARY KEY,
    language_id     INT NOT NULL,
    input_text      TEXT           NOT NULL,
    description     TEXT,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (language_id) REFERENCES sign_languages(language_id)
);

-- --------------------------------------------
-- Table for output sequence steps
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS output_sequence_steps (
    step_id         INT AUTO_INCREMENT PRIMARY KEY,
    sequence_id     INT NOT NULL,
    gesture_id      INT NOT NULL,
    step_order      INT            NOT NULL,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sequence_id) REFERENCES output_sequences(sequence_id),
    FOREIGN KEY (gesture_id) REFERENCES gestures(gesture_id)
);

-- --------------------------------------------
-- Table for gesture predictions
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS gesture_predictions (
    prediction_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT,
    timestamp       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    input_data      TEXT,
    predicted_label VARCHAR(255),
    confidence      FLOAT,
    gesture_id      INT,
    FOREIGN KEY (user_id) REFERENCES user_accounts(user_id),
    FOREIGN KEY (gesture_id) REFERENCES gestures(gesture_id)
);

-- --------------------------------------------
-- Table for prediction feedback
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS prediction_feedback (
    feedback_id     INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id   INT NOT NULL,
    is_correct      BOOLEAN        NOT NULL,
    user_comment    TEXT,
    submitted_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prediction_id) REFERENCES gesture_predictions(prediction_id)
);

-- --------------------------------------------
-- Indexes
-- --------------------------------------------
CREATE INDEX idx_gestures_language ON gestures(language_id);
CREATE INDEX idx_translations_gesture ON gesture_translations(gesture_id);
CREATE INDEX idx_custom_user_gesture ON user_custom_translations(user_id, gesture_id);
CREATE INDEX idx_landmarks_gesture ON gesture_landmarks(gesture_id);
CREATE INDEX idx_output_sequence_steps ON output_sequence_steps(sequence_id, step_order);

-- Insert default language
INSERT IGNORE INTO sign_languages (code, name, country)
VALUES ('DGS', 'Dutch Sign Language', 'Netherlands');
