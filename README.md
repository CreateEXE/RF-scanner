# Uconnect® Audio Hub & 2-Channel RF/IR Diagnostic

A dual-target system (Interactive Web Applet & Native Android Application) designed to test, diagnose, and bridge dual-channel automotive wireless headphones (Chrysler / Dodge / Jeep / Ram Uconnect® VES systems) and provide high-fidelity audio visualization.

---

## 🎧 How to Connect Your 2-Channel Uconnect Headphones

### Why You Can't Find Them in Your Phone's Bluetooth Menu
These headphones **do not use standard 2.4 GHz Bluetooth or Wi-Fi**. They are **carrier-frequency Optical Infrared (IR) / 900 MHz RF receivers**. They do not have a Bluetooth discovery mode, pairing code, or passkey.

Instead, they pick up wireless carrier signals broadcast through the air by a transmitter dome or console:
- **Channel 1 (Carrier A):** Left: 2.3 MHz / Right: 2.8 MHz
- **Channel 2 (Carrier B):** Left: 3.2 MHz / Right: 3.8 MHz

### In-Car Connection (Chrysler, Dodge, Jeep, Ram)
1. **Turn on the Vehicle Entertainment System (VES):** Turn on the ignition and power on the front Uconnect touchscreen or rear drop-down overhead screens.
2. **Assign Media Sources:**
   - On the Uconnect touchscreen, select **Rear Media / VES**.
   - Assign Screen 1 (e.g., Blu-ray, DVD, Bluetooth Audio, or HDMI).
   - Assign Screen 2 (if equipped with dual rear screens).
3. **Power On the Headphones:**
   - Press the **Power** button on the earcup. The red indicator LED will turn on.
4. **Select Channel:**
   - Slide the **1 / 2 switch** on the earcup to **1** to listen to Screen 1.
   - Slide the switch to **2** to listen to Screen 2.
5. **Adjust Volume:** Roll the thumbwheel forward towards `+`.
6. **Ensure Line of Sight:** Because audio is carried via infrared light, keep a direct line of sight between the dark red IR sensor window on the earcup and the overhead screen/transmitters.

### Using Them at Home / With Phone or Laptop
To connect these headphones directly to a phone, laptop, or TV outside a vehicle:
- Use a **Universal 2-Channel Automotive IR Audio Transmitter box** ($15–$25 on Amazon/eBay).
- Plug the transmitter's 3.5mm Aux jack into your phone, computer, or DAC.
- Power on the headphones, flip to Channel 1 (or 2), and audio plays instantly!

---

## 🛠️ Dependency Audit Summary

The Gradle dependency catalog (`gradle/libs.versions.toml`) and `app/build.gradle.kts` have been audited for version compatibility:

| Component | Audited Version | Status & Compatibility Notes |
|---|---|---|
| **Android Gradle Plugin (AGP)** | `8.7.0` | Fully compatible with Gradle `8.10.2` & JDK 17 |
| **Kotlin** | `2.0.20` | Native Compose compiler support via `org.jetbrains.kotlin.plugin.compose` |
| **Gradle Wrapper** | `8.10.2` | Configured in `gradle/wrapper/gradle-wrapper.properties` |
| **Compose BOM** | `2024.10.00` | Manages Compose UI 1.7.4, Material3 1.3.0, and Icons Extended without version skew |
| **AndroidX Core KTX** | `1.13.1` | Clean compile against SDK 35 |
| **Lifecycle & ViewModel** | `2.8.6` | Verified Kotlin 2.0 coroutine Flow lifecycle support |
| **Activity Compose** | `1.9.3` | Stable Activity & ComponentActivity integration |
| **DataStore Preferences** | `1.1.1` | Local persistent storage without conflicts |
| **Coroutines** | `1.9.0` | Aligned with Kotlin 2.0 runtime |

---

## 🚀 GitHub Actions Workflow (`.github/workflows/build.yml`)

The repository includes an automated GitHub Actions pipeline with two jobs:
1. **`audit-and-build-android`**:
   - Sets up Temurin JDK 17 & Gradle 8.10.2.
   - Audits implementation dependencies via `./gradlew :app:dependencies`.
   - Runs Android unit tests (`testDebugUnitTest`).
   - Builds the debug APK (`./gradlew assembleDebug`).
   - Uploads the debug APK as an automated GitHub workflow artifact.
2. **`build-web`**:
   - Installs Node 22 dependencies.
   - Runs type-checking and compiles the interactive Vite web application.

---

## 📱 Building the Android APK Locally

```bash
# Make gradlew executable
chmod +x gradlew

# Run dependency audit
./gradlew :app:dependencies --configuration implementation

# Build Debug APK
./gradlew assembleDebug

# Output APK location:
# app/build/outputs/apk/debug/app-debug.apk
```
