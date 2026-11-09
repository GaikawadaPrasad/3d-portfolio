# 3D Interactive Portfolio — Prasad Gaikwad
> Full-Stack & Hardware / IoT Developer Portfolio built with Three.js, React, and Tailwind CSS.

![Portfolio Preview](./preview.png)

## Core Capabilities & Architecture

- **3D WebGL Interactive Workspace (`ThreeScene.tsx`)**:
  - Procedural 3D scene running at a smooth 60+ FPS with zero heavy external 3D asset downloading bottlenecks.
  - Interactive 3D **ESP32 Microcontroller Node** with copper traces, dual MCU Xtensa LX6 shield, gold pin headers, and blinking RX/TX LEDs.
  - Interactive 3D **Holographic Terminal Screen** rendering a real-time procedural canvas with live oscilloscope waveforms, system metrics, and telemetry data.
  - Orbiting 3D geometric skill polyhedra (Frontend, Backend, Hardware, Databases) that respond to cursor physics.
  - Multi-camera director modes: `[Orbit View]`, `[ESP32 MCU Close-up]`, `[Terminal Console]`, and `[Skills 3D]`.
  - Mouse parallax easing, click-to-focus raycasting, and Starfield cosmic particle cloud.

- **Embedded Hardware & IoT Lab (`IoTLab.tsx`)**:
  - Interactive simulator demonstrating Prasad's real-world embedded systems engineering.
  - **PIR Motion Sensor (HC-SR501)**: Click to simulate human motion, triggering GPIO 13 interrupts, alerting the active buzzer, and updating UART serial logs.
  - **Ultrasonic Radar (HC-SR04)**: Interactive distance slider (5cm - 300cm) computing microsecond pulse widths and triggering proximity thresholds.
  - **DHT22 Thermal Sensor**: Interactive temperature and humidity selector.
  - **Photoresistor (LDR)**: 12-bit ADC raw value slider (0 - 4095).
  - **Digital Oscilloscope & Logic Analyzer**: Real-time dual-channel canvas displaying clock signals and dynamic telemetry waveforms.
  - **Live UART Serial Monitor**: 115200 baud streaming console output.

- **Production & Prototype Showcase (`Projects.tsx` & `ProjectModal.tsx`)**:
  - 3D interactive tilting cards with lighting reflection effects.
  - Filterable by `[All]`, `[IoT & Hardware]`, `[Full-Stack]`, `[Mobile & Hybrid]`, `[Interactive Web]`.
  - Detailed modal inspector featuring real project screenshots, hardware specifications, and live demo / source links:
    - *Smart IoT Surveillance & Alert System (ESP32, C++, MicroPython, WebSockets, MQTT)*
    - *FitTrack - Biological Fitness Companion (React, Firebase, Chart.js, Tailwind)*
    - *Melodix - Offline-First Hybrid Audio Player (Capacitor, Android SDK, Zustand, IndexedDB)*
    - *Chart Karo - Real-Time Collaborative Workspace (Node.js, Express, Socket.io, React)*
    - *Sri Sri Associates - Real Estate Portfolio*
    - *Muscle UP CAFE - Nutrition & Order Hub*
    - *Terminal CLI Portfolio*

- **Interactive CLI Terminal (`TerminalModal.tsx`)**:
  - Accessible via the Navbar, Hero button, or global keyboard shortcut (press `` ` `` backquote).
  - Supports commands: `help`, `about`, `projects`, `hardware`, `skills`, `contact`, `matrix`, `clear`, `sudo`, `exit`.

- **Web Audio API Soundscape Engine (`sound.ts`)**:
  - Synthesizes procedural retro-futuristic audio (clicks, hovers, frequency chirps, success fanfares) directly in browser memory without external MP3 files.
  - Global sound toggle with persistent preference in `localStorage`.

- **Authentic Engineering Aesthetic**:
  - Built strictly adhering to authentic developer visual language (Obsidian dark, Matrix emerald `#10b981`, Hardware amber `#f59e0b`, Steel slate `#38bdf8`, and clean Fira Code monospace typography).
  - Zero generic AI purple/magenta gradients and zero emojis.

## Quick Start

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Compile production build
npm run build

# Preview production build
npm run preview
```
