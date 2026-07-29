# 🏋️ Workout Tracker

A modern, high-performance **React + Vite** workout logging web application cross-compiled to native **Android APK** using Ionic **Capacitor**. 

Designed for seamless exercise logging, progress analytics, rest timing, body weight tracking, and automated Google Drive cloud backups.

---

## ✨ Features

- 🏋️ **Workout Logging**: Track weight, reps, sets, RPE, distance, and duration with intuitive UI controls.
- ⏱️ **Floating Rest Timer**: Automatic rest countdown overlay with completion notifications.
- 📊 **Analytics & Insights**: Dynamic volume graphs, muscle group breakdown, PR tracking, and cardio logs.
- 📱 **Cross-Platform & Native APK**: Embedded Ionic Capacitor configuration targeting Android 14+ (SDK 35/36).
- ☁️ **Google Drive Backup & Restore**: Sync your workout history and custom exercises safely to cloud storage.
- 📅 **Calendar & History Log**: View past workouts, log historical entries, and track long-term progress.
- 🌙 **Dark Mode First**: High-contrast, dark-mode design system built with Tailwind CSS and Lucide Icons.

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Recharts, Lucide Icons
- **Mobile Native**: Ionic Capacitor 7 (`@capacitor/core`, `@capacitor/android`)
- **Build Tools**: Node.js, Gradle, Java 21 JDK (Android Studio JBR)

---

## 🛠️ Local Development & Web Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- `npm` or `bun`

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone git@github.com:hexvish/workout-tracker.git
   cd workout-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build production bundle:**
   ```bash
   npm run build
   ```

---

## 🤖 Building the Android APK

1. **Build web production assets:**
   ```bash
   npm run build
   ```

2. **Sync web bundle with Capacitor Android:**
   ```bash
   npx cap sync android
   ```

3. **Compile Debug APK via Gradle:**
   ```powershell
   $env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
   $env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
   cd android
   .\gradlew assembleDebug
   ```

   The generated APK will be available at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📜 License

Apache-2.0 License.
