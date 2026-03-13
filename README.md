# Mind-Body Awareness (MBA) 🌿🧘‍♂️

**Mind-Body Awareness** is a minimalist, premium journaling application designed to deepen the connection between physical sensations and emotional states. Built with a "Privacy-First" philosophy, it provides a serene space for self-reflection without compromising personal data.

Available as a high-performance **PWA (Progressive Web App)**, it feels like a native application on iPhone and Android, supporting full offline functionality.

---

## 🚀 Key Features

### 🌿 Holistic Tracking
- **Sensation Logging**: Quickly record physical body signals (tension, warmth, tingling) using a curated list of sensations.
- **Emotional Mapping**: Track both positive and negative emotions to identify patterns and triggers.
- **Root Cause Analysis**: Dedicated space to document the "why" behind your current state.

### 📊 Smart Insights & History
- **Personal History**: A virtual-scrolled, high-performance feed of all previous reflections.
- **Progress Tracking**: Dynamic feedback based on your journaling consistency (from seeds to full-grown trees 🌳).
- **Searchable Database**: Powered by **Dexie.js**, allowing for instant local queries.

### 📄 Premium PDF Export
- **Vibrant Export**: A professional, full-color PDF summary of your entries with elegant typography.
- **Print-Friendly**: A minimalist B&W version optimized for physical archiving or sharing with professionals.

### 🔒 Privacy by Design
- **Local-Only Storage**: Your data never leaves your device. Everything is stored securely in your browser's **IndexedDB**.
- **Offline First**: Full functionality even without an internet connection. No cloud, no tracking, no accounts required.

---

## 💻 Tech Stack

- **Frontend**: Angular 21 (Modern Signals & Standalone Components)
- **UI Architecture**: Angular Material with a custom **Sage & Beige** design system.
- **Database**: Dexie.js (IndexedDB Wrapper for robust local storage).
- **PDF Generation**: jsPDF with custom layouts and Romanian diacritics support.
- **PWA**: Angular Service Worker with custom manifest and iOS optimization.

---

## ⚙️ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-username/mind-body-awareness.git
cd mind-body-awareness
npm install
```

### 2. Run Locally
```bash
npm start
```
Access the app at `http://localhost:4200`.

### 3. Build for Production (PWA)
```bash
ng build
```
The output will be in `dist/mind-body-awareness/browser`.

---

## 📱 Mobile Installation

MBA is optimized for smartphone installation:
1. Open the app link in your mobile browser.
2. Tap **"Add to Home Screen"**.
3. Launch MBA from your homescreen to experience the custom **Premium Splash Screen** and standalone interface.

---

## ⚖️ Privacy Disclaimer
All data is stored locally on the user's device. As an open-source tool, **Mind-Body Awareness** does not collect, transmit, or sell any personal information. Users are encouraged to use the **PDF Export** feature to back up their data periodically.

---

## 📜 License
Distributed under the MIT License.

Built with ❤️ for a more conscious life.
