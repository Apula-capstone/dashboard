// ==========================================
// APULA FIRE PREVENTION - ARDUINO UNO NODE
// ==========================================

// PIN CONFIGURATION
const int FLAME_ALPHA = 2;
const int FLAME_BETA  = 3;
const int FLAME_GAMMA = 4;
const int BUZZER_PIN  = 5;
const int STATUS_LED  = 13;

void setup() {
  // Standard Baud Rate
  Serial.begin(115200);
  
  pinMode(FLAME_ALPHA, INPUT);
  pinMode(FLAME_BETA, INPUT);
  pinMode(FLAME_GAMMA, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  
  // Handshake signal
  Serial.println("ARDUINO_NODE_READY");
}

void loop() {
  // Read Sensors (Digital)
  // LOW usually means Fire Detected on IR Flame Sensors
  int s1 = digitalRead(FLAME_ALPHA);
  int s2 = digitalRead(FLAME_BETA);
  int s3 = digitalRead(FLAME_GAMMA);

  // Local Alarm Logic
  if (s1 == LOW || s2 == LOW || s3 == LOW) {
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(STATUS_LED, HIGH);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(STATUS_LED, LOW);
  }

  // Send to Serial (For Web Dashboard)
  // Format: SENSORS:Alpha,Beta,Gamma 
  // APULA Web expects: 0 = FIRE, 1 = SAFE
  
  Serial.print("SENSORS:");
  // If s1 is LOW (Fire), send "0". If HIGH (Safe), send "1".
  Serial.print(s1 == LOW ? "0" : "1");
  Serial.print(",");
  Serial.print(s2 == LOW ? "0" : "1");
  Serial.print(",");
  Serial.println(s3 == LOW ? "0" : "1");

  delay(200); // Send data 5 times per second
}
