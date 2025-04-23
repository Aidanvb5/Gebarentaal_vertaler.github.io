-- --------------------------------------------
--Table for user accounts
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS user_accounts (
    user_id         INTEGER       PRIMARY KEY AUTOINCREMENT,
    username        VARCHAR(50)   NOT NULL UNIQUE,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------
--Table for sign languages
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS sign_languages (
    language_id     INTEGER       PRIMARY KEY AUTOINCREMENT,
    code            VARCHAR(10)   NOT NULL UNIQUE,      --'DGS' for Dutch Sign Language
    name            VARCHAR(100)  NOT NULL,             --'Dutch Sign Language'
    country         VARCHAR(100),                       --'Netherlands'
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------
--Table for gestures
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS gestures (
    gesture_id      INTEGER       PRIMARY KEY AUTOINCREMENT,
    language_id     INTEGER       NOT NULL REFERENCES sign_languages(language_id),
    gesture_code    TEXT          NOT NULL,             -- a string representation or unique ID
    name            VARCHAR(100),                       -- optional: short label
    description     TEXT,                               -- optional: longer explanation
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(language_id, gesture_code)                   -- prevent duplicates per language
);

-- --------------------------------------------
--Table for default translations (gesture -> text)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS gesture_translations (
    translation_id  INTEGER       PRIMARY KEY AUTOINCREMENT,
    gesture_id      INTEGER       NOT NULL REFERENCES gestures(gesture_id),
    target_locale   VARCHAR(10)   NOT NULL,             --'nl', 'en', 'fr'
    text_value      VARCHAR(255)  NOT NULL,             --'dog', 'hond'
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(gesture_id, target_locale)
);

-- --------------------------------------------
--Table for user custom translations (custom names for gestures)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS user_custom_translations (
    custom_id       INTEGER       PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER       NOT NULL REFERENCES user_accounts(user_id),
    gesture_id      INTEGER       NOT NULL REFERENCES gestures(gesture_id),
    custom_text     VARCHAR(255)  NOT NULL,             --"bob" for a dog's name
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, gesture_id)
);

-- --------------------------------------------
--Table for gesture hand landmark data (for tracking and recognition)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS gesture_landmarks (
    landmark_id     INTEGER       PRIMARY KEY AUTOINCREMENT,
    gesture_id      INTEGER       NOT NULL REFERENCES gestures(gesture_id),
    hand_label      VARCHAR(5)    NOT NULL,             -- 'Left' or 'Right'
    landmark_index  INTEGER       NOT NULL,             -- 0 to 20 (finger points)
    x_norm          REAL          NOT NULL,             -- normalized x (0.0 - 1.0)
    y_norm          REAL          NOT NULL,             -- normalized y (0.0 - 1.0)
    x_world         REAL,                               -- optional world x position (in meters)
    y_world         REAL,                               -- optional world y position (in meters)
    z_world         REAL,                               -- optional world z position (in meters)
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------
--Table for text-to-gesture output sequences (for typed input)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS output_sequences (
    sequence_id     INTEGER       PRIMARY KEY AUTOINCREMENT,
    language_id     INTEGER       NOT NULL REFERENCES sign_languages(language_id),
    input_text      TEXT          NOT NULL,             -- the full input text, e.g., "My dog"
    description     TEXT,                               -- optional description
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS output_sequence_steps (
    step_id         INTEGER       PRIMARY KEY AUTOINCREMENT,
    sequence_id     INTEGER       NOT NULL REFERENCES output_sequences(sequence_id),
    gesture_id      INTEGER       NOT NULL REFERENCES gestures(gesture_id),
    step_order      INTEGER       NOT NULL,             -- the order of gestures for output
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gesture_predictions (
    prediction_id   INTEGER       PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER       REFERENCES user_accounts(user_id),
    timestamp       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    input_data      TEXT,                           -- could store raw keypoints or summary info
    predicted_label TEXT,                           --'hello'
    confidence      REAL,                           -- 0.95 
    gesture_id      INTEGER       REFERENCES gestures(gesture_id)  -- optional, if matched
);


CREATE TABLE IF NOT EXISTS prediction_feedback (
    feedback_id     INTEGER       PRIMARY KEY AUTOINCREMENT,
    prediction_id   INTEGER       NOT NULL REFERENCES gesture_predictions(prediction_id),
    is_correct      BOOLEAN       NOT NULL,
    user_comment    TEXT,
    submitted_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- --------------------------------------------
-- Indexes for better query performance
-- --------------------------------------------
CREATE INDEX IF NOT EXISTS idx_gestures_language
    ON gestures(language_id);

CREATE INDEX IF NOT EXISTS idx_translations_gesture
    ON gesture_translations(gesture_id);

CREATE INDEX IF NOT EXISTS idx_custom_user_gesture
    ON user_custom_translations(user_id, gesture_id);

CREATE INDEX IF NOT EXISTS idx_landmarks_gesture
    ON gesture_landmarks(gesture_id);

CREATE INDEX IF NOT EXISTS idx_output_sequence_steps
    ON output_sequence_steps(sequence_id, step_order);

-- --------------------------------------------
-- run to start NL DB
-- INSERT INTO sign_languages (code, name, country)
-- VALUES ('DGS', 'Dutch Sign Language', 'Netherlands');
