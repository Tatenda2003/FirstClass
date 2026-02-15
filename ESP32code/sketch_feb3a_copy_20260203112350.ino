#include <LiquidCrystal_I2C_Hangul.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>

LiquidCrystal_I2C_Hangul lcd(0x27, 16, 2);

// ================= PINS =================
#define RXD2 16
#define TXD2 17
#define CONVEYOR 2
#define METAL 19
#define PLASTIC 18
#define PAPER 5
#define PROXIMITY 32
#define INFRA1 27
#define INFRA2 26
#define CURRENT_PIN 36
#define ECHO 25
#define TRIG 26

// ================= WIFI =================
const char* ssid = "Catman";
const char* password = "00000006";

// ================= FIRESTORE =================
const char* firestorePatchUrl =
  "https://firestore.googleapis.com/v1/projects/hit-200-project/databases/(default)/documents/recycling/summary"
  "?updateMask.fieldPaths=metal"
  "&updateMask.fieldPaths=plastic"
  "&updateMask.fieldPaths=paper"
  "&updateMask.fieldPaths=other"
  "&updateMask.fieldPaths=throughput"
  "&updateMask.fieldPaths=current";

// ================= VARIABLES =================
int metal = 0;
int plastic = 0;
int paper = 0;
int other = 0;
int throughput = 0;
float current = 0.0;

String incoming = "";
bool processingItem = false;
unsigned long lastUpdateTime = 0;
unsigned long lastServoUpdate = 0;
const unsigned long FIRESTORE_UPDATE_INTERVAL = 2000; // Update every 2 seconds
const unsigned long DEBOUNCE_DELAY = 50;

// Servo positions
enum ServoState {
  SERVO_IDLE,
  SERVO_METAL,
  SERVO_PLASTIC,
  SERVO_PAPER,
  SERVO_OTHER
};
ServoState currentServoState = SERVO_IDLE;

// ADC constants
#define ADC_MAX 4095.0
#define VREF 3.3
#define ZERO_CURRENT_VOLTAGE 2.5
#define SENSITIVITY 0.185

// ================= FUNCTION DECLARATIONS =================
bool patchRecyclingSummary(int metal, int plastic, int paper, int other, int throughput, float current);
float readCurrent();
void servoControl(int pin, int angle);
void smoothServoMove(int pin, int currentAngle, int targetAngle, int stepDelay = 15);
void processMessage(String msg);
void setServoPositions(ServoState state);
void updateLCD();
int readLevel(int trigger_pin, int echo_pin);

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2);
  delay(500);
  analogReadResolution(12);

  // LCD initialization
  lcd.init();
  lcd.backlight();
  lcd.setCursor(4, 0);
  lcd.print("GARBAGE");
  lcd.setCursor(1, 1);
  lcd.print("CLASSIFICATION");

  // Pin modes
  pinMode(CONVEYOR, OUTPUT);
  pinMode(METAL, OUTPUT);
  pinMode(PLASTIC, OUTPUT);
  pinMode(PAPER, OUTPUT);
  pinMode(PROXIMITY, INPUT);
  pinMode(INFRA1, INPUT);
  pinMode(INFRA2, INPUT);
  pinMode(ECHO, INPUT);
  pinMode(TRIG, OUTPUT);

  // Initialize servos to home position smoothly
  Serial.println("Initializing servos...");
  smoothServoMove(METAL, 0, 90, 10);
  smoothServoMove(PLASTIC, 180, 0, 10);
  smoothServoMove(PAPER, 0, 180, 10);
  delay(500);

  // WiFi connection
  WiFi.begin(ssid, password);
  Serial.print("🔌 Connecting to WiFi");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Connected!");
    delay(1000);
  } else {
    Serial.println("\n⚠ WiFi Failed!");
    lcd.setCursor(0, 0);
    lcd.print("WiFi Failed!");
    delay(1000);
  }

  // Start conveyor
  digitalWrite(CONVEYOR, HIGH);
  delay(500);

  // Setup LCD display
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("MT:   PL:");
  lcd.setCursor(0, 1);
  lcd.print("PP:   OT:");
  
  lastUpdateTime = millis();
}

// ================= MAIN LOOP =================
void loop() {
  unsigned long currentTime = millis();

  // Update LCD periodically
  updateLCD();

  // Read current sensor
  current = readCurrent();
  current = 9 - abs(current);

  // Check for metal detection (proximity sensor)
  static bool lastProximityState = HIGH;
  bool proximityState = digitalRead(PROXIMITY);
  
  if (proximityState == LOW && lastProximityState == HIGH && !processingItem) {
    delay(DEBOUNCE_DELAY);
    if (digitalRead(PROXIMITY) == LOW) {
      processingItem = true;
      metal++;
      Serial.println("🧲 METAL detected");
      setServoPositions(SERVO_METAL);
      digitalWrite(CONVEYOR, LOW);
      delay(1500); // Allow item to drop
      digitalWrite(CONVEYOR, HIGH);
      processingItem = false;
    }
  }
  lastProximityState = proximityState;

  // Check infrared sensor for non-metal items
  static bool lastInfra1State = HIGH;
  bool infra1State = digitalRead(INFRA1);
  
  if (infra1State == LOW && lastInfra1State == HIGH && !processingItem) {
    delay(DEBOUNCE_DELAY);
    if (digitalRead(INFRA1) == LOW) {
      processingItem = true;
      digitalWrite(CONVEYOR, LOW);
      
      Serial.println("📸 Item detected - waiting for classification...");
      
      // Wait for classification from Serial2
      incoming = "";
      unsigned long startTime = millis();
      bool messageReceived = false;

      while (millis() - startTime < 5000) {
        while (Serial2.available()) {
          char c = Serial2.read();
          if (c == '\n' || c == '\r') {
            if (incoming.length() > 0) {
              processMessage(incoming);
              incoming = "";
              messageReceived = true;
              break;
            }
          } else {
            incoming += c;
          }
        }
        if (messageReceived) break;
        delay(10);
      }

      // If no message received, classify as other
      if (!messageReceived) {
        Serial.println("⚠ No classification - marked as OTHER");
        other++;
        setServoPositions(SERVO_OTHER);
      }

      delay(1500); // Allow item to drop
      digitalWrite(CONVEYOR, HIGH);
      processingItem = false;
    }
  }
  lastInfra1State = infra1State;

  // Update Firestore periodically
  if (currentTime - lastUpdateTime >= FIRESTORE_UPDATE_INTERVAL) {
    lastUpdateTime = currentTime;
    
    throughput = (metal + plastic + paper + other);
    
    if (WiFi.status() == WL_CONNECTED) {
      bool success = patchRecyclingSummary(metal, plastic, paper, other, throughput, current);
      if (success) {
        Serial.println("✅ Firestore updated");
      } else {
        Serial.println("❌ Firestore update failed");
      }
    } else {
      Serial.println("⚠ WiFi disconnected - attempting reconnect");
      WiFi.reconnect();
    }
  }

  delay(10); // Small delay for stability
}

// ================= FUNCTIONS =================

void updateLCD() {
  static unsigned long lastLCDUpdate = 0;
  if (millis() - lastLCDUpdate >= 500) { // Update LCD every 500ms
    lastLCDUpdate = millis();
    
    lcd.setCursor(3, 0);
    lcd.print("   "); // Clear old value
    lcd.setCursor(3, 0);
    lcd.print(metal);
    
    lcd.setCursor(10, 0);
    lcd.print("   ");
    lcd.setCursor(10, 0);
    lcd.print(plastic);
    
    lcd.setCursor(3, 1);
    lcd.print("   ");
    lcd.setCursor(3, 1);
    lcd.print(paper);
    
    lcd.setCursor(10, 1);
    lcd.print("   ");
    lcd.setCursor(10, 1);
    lcd.print(other);
  }
}

void setServoPositions(ServoState state) {
  if (state == currentServoState) return; // Already in position
  
  switch (state) {
    case SERVO_METAL:
      Serial.println("Setting servos for METAL");
      smoothServoMove(METAL, 90, 180, 5);
      servoControl(PLASTIC, 0);
      servoControl(PAPER, 180);
      break;
      
    case SERVO_PLASTIC:
      Serial.println("Setting servos for PLASTIC");
      smoothServoMove(METAL, 180, 90, 5);
      smoothServoMove(PLASTIC, 0, 180, 5);
      servoControl(PAPER, 180);
      break;
      
    case SERVO_PAPER:
      Serial.println("Setting servos for PAPER");
      smoothServoMove(METAL, 180, 90, 5);
      smoothServoMove(PAPER, 180, 0, 5);
      servoControl(PLASTIC, 0);
      break;
      
    case SERVO_OTHER:
      Serial.println("Setting servos for OTHER");
      smoothServoMove(METAL, 180, 90, 5);
      smoothServoMove(PLASTIC, 180, 0, 5);
      servoControl(PAPER, 180);
      break;
      
    case SERVO_IDLE:
    default:
      smoothServoMove(METAL, 180, 90, 5);
      servoControl(PLASTIC, 0);
      servoControl(PAPER, 180);
      break;
  }
  
  currentServoState = state;
  delay(500); // Settling time
}

void smoothServoMove(int pin, int currentAngle, int targetAngle, int stepDelay) {
  int step = (currentAngle < targetAngle) ? 5 : -5;
  
  for (int angle = currentAngle; 
       (step > 0 && angle <= targetAngle) || (step < 0 && angle >= targetAngle); 
       angle += step) {
    servoControl(pin, angle);
    delay(stepDelay);
  }
  servoControl(pin, targetAngle); // Ensure we hit exact target
}

void servoControl(int pin, int angle) {
  angle = constrain(angle, 0, 180);
  int pulseWidth = map(angle, 0, 180, 1000, 2000);
  
  for (int i = 0; i < 10; i++) { // Send multiple pulses for stability
    digitalWrite(pin, HIGH);
    delayMicroseconds(pulseWidth);
    digitalWrite(pin, LOW);
    delayMicroseconds(20000 - pulseWidth);
  }
}

void processMessage(String msg) {
  msg.trim();
  msg.toUpperCase();
  
  Serial.print("📦 Classified as: ");
  Serial.println(msg);
  
  if (msg == "PLASTIC") {
    plastic++;
    setServoPositions(SERVO_PLASTIC);
  } 
  else if (msg == "PAPER") {
    paper++;
    setServoPositions(SERVO_PAPER);
  } 
  else {
    other++;
    setServoPositions(SERVO_OTHER);
  }
}

float readCurrent() {
  const int numSamples = 10;
  long sum = 0;
  
  for (int i = 0; i < numSamples; i++) {
    sum += analogRead(CURRENT_PIN);
    delay(2);
  }
  
  int avgRaw = sum / numSamples;
  float voltage = (avgRaw / ADC_MAX) * VREF;
  float current = (voltage - ZERO_CURRENT_VOLTAGE) / SENSITIVITY;
  
  return current;
}

bool patchRecyclingSummary(int metal, int plastic, int paper, int other, int throughput, float current) {
  HTTPClient http;
  http.begin(firestorePatchUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000); // 5 second timeout

  String payload = "{\"fields\":{"
                   "\"metal\":{\"integerValue\":" + String(metal) + "},"
                   "\"plastic\":{\"integerValue\":" + String(plastic) + "},"
                   "\"paper\":{\"integerValue\":" + String(paper) + "},"
                   "\"other\":{\"integerValue\":" + String(other) + "},"
                   "\"throughput\":{\"integerValue\":" + String(throughput) + "},"
                   "\"current\":{\"doubleValue\":" + String(current, 2) + "}"
                   "}}";

  int httpCode = http.PATCH(payload);
  http.end();
  
  return (httpCode == 200);
}

int readLevel(int trigger_pin, int echo_pin) {
  const int numReadings = 5;
  long readings[numReadings];
  
  for (int i = 0; i < numReadings; i++) {
    digitalWrite(trigger_pin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigger_pin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigger_pin, LOW);
    
    long duration = pulseIn(echo_pin, HIGH, 30000);
    readings[i] = (duration * 343) / 2000; // mm
    delay(50);
  }
  
  // Remove outliers and average
  long sum = 0;
  long maxVal = readings[0];
  long minVal = readings[0];
  
  for (int i = 0; i < numReadings; i++) {
    if (readings[i] > maxVal) maxVal = readings[i];
    if (readings[i] < minVal) minVal = readings[i];
    sum += readings[i];
  }
  
  sum = sum - maxVal - minVal;
  int filteredDistance = sum / (numReadings - 2);
  
  return filteredDistance;
}