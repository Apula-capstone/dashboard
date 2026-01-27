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
  // Use 115200 to match ESP32 if connecting via Serial
  Serial.begin(115200);
  
  pinMode(FLAME_ALPHA, INPUT);
  pinMode(FLAME_BETA, INPUT);
  pinMode(FLAME_GAMMA, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  
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

  // Send to Serial (For ESP32 Bridge or Direct Serial)
  // Format: SENSORS:s1,s2,s3 (0=Fire, 1=Safe) - DASHBOARD EXPECTS 0 FOR FIRE
  Serial.print("SENSORS:");
  Serial.print(s1);
  Serial.print(",");
  Serial.print(s2);
  Serial.print(",");
  Serial.println(s3);

  delay(200); // Send data 5 times per second
}
