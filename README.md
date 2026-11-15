# 3D Interactive Portfolio

Hey, I'm Prasad Gaikwad. I'm a full-stack developer and hardware / IoT engineer based in Pune, India.

Most 3D developer portfolios out there follow the same pattern: they download a massive 40MB to 80MB GLTF model of a desk or computer, slap on bright purple neon gradients, and drop frames on anyone browsing on an average laptop or mobile phone.

I wanted to build something different. This is a full-screen, 60+ FPS interactive 3D universe that reflects what I actually work on: embedded hardware, microcontrollers (specifically the ESP32), sensor telemetry, and modern web platforms. Everything in the 3D scene is procedurally built with Three.js geometries and custom canvas-generated PBR textures, which means the whole bundle compiles to under 450 KB and loads instantly with zero model-download wait times.

No generic templates, no AI neon colors, and no bloated asset pipelines.

---

## What is Inside

The portfolio is structured along a continuous 3D coordinate spine with 6 spatial stations you can warp between using the mouse wheel, keyboard arrows, or the HUD navigation tabs:

### 1. Station 00 // Nexus Developer Rig (`[0, 0, 0]`)
My main workstation setup.
- Curved ultrawide monitor displaying a live procedural oscilloscope waveform, active memory metrics, and real-time canvas readouts.
- Unibody developer laptop with a rendered chiclet keyboard deck, trackpad, and angled display.
- Desk details: custom 75% mechanical keyboard, wireless mouse, ceramic developer mug, and an edge-lit holographic avatar frame.

### 2. Station 01 // Silicon Foundry (`[0, -25, 20]`)
A CAD-level recreation of the ESP32-DEVKIT-V1 microcontroller board.
- Dual-layer FR4 PCB with fiberglass weave, gold circuit traces, and silkscreen labels (`ESP32-DEVKIT-V1`, `XTENSA DUAL-CORE 240MHz`).
- 30 individual gold-plated square header pins mounted on black plastic socket blocks.
- Onboard hardware components: USB-C port with internal tongue, CP2102 USB-UART bridge, AMS1117 3.3V LDO regulator with copper heatsink tab, tactile `EN` and `BOOT` microswitches, and status LEDs.
- Exploded ESP-WROOM-32 metal RF shield hovering above the board with authentic laser-etched markings, exposing the dual Xtensa LX6 silicon CPU dies and 40MHz quartz crystal oscillator underneath.
- Three concentric holographic data rings rotating on independent orbital planes.

### 3. Station 02 // Project Showroom Hangar (`[0, -50, 40]`)
A panoramic curved gallery displaying my production web apps and IoT systems.
- Heavy chamfered pedestals with glowing conduit rings and optical projector heads.
- Beveled display monoliths with real screenshots, metal corner brackets, and floating category badges.
- Click any monolith to open the Project Modal with high-res screenshots, architecture breakdowns, hardware pinouts, and live demo / GitHub links.

### 4. Station 03 // IoT Electronics Workbench (`[0, -75, 60]`)
A working virtual electronics bench connected to the UI.
- Full 830-tie-point solderless breadboard with red/blue power buses, coordinate numbering, and center IC trough.
- ESP32 module seated across the divider.
- HC-SR04 Ultrasonic Distance Sensor: dual aluminum cylindrical transducer cans with acoustic mesh covers. Changing the distance slider in the HUD updates the 3D sonic pulse rings in real time.
- HC-SR501 PIR Motion Sensor: faceted Fresnel lens dome and dual calibration trimmers. Clicking it simulates human movement, triggers the red laser cone, and flashes the alarm strobe.
- 0.96" I2C OLED display showing live hardware telemetry text and mini waveforms.
- Flexible curved 3D DuPont jumper wires (VCC red, GND black, signal yellow/blue) and color-banded carbon film resistors.

### 5. Station 04 // Skill Constellation Galaxy (`[0, -100, 80]`)
My technical skill set represented as orbiting dual-layer polyhedra.
- Central emerald quantum reactor core.
- 8 compound skill nodes: inner faceted core surrounded by a counter-rotating wireframe gyroscopic cage.
- Covered areas: React 19, Three.js / WebGL, Node.js, ESP32 Firmware, TypeScript, WebSockets, MongoDB / PostgreSQL, and Embedded C / C++.

### 6. Station 05 // Quantum Transmission Beacon (`[0, -125, 100]`)
The contact station.
- Industrial ground bunker with a parabolic communication dish and rear lattice truss support.
- Tripod sub-reflector feedhorn assembly at the focal point.
- Dual lateral photovoltaic solar wings with micro-conductor grids.
- Alternating red aviation obstruction strobes.
- High-energy focused particle beam that pulses rapidly whenever you send a message through the direct dispatch form.

---

## Additional Features

- **Embedded Unix CLI Terminal**: Press `` ` `` (backtick) or click the terminal button in the HUD to launch an interactive terminal with custom command parsing (`help`, `about`, `projects`, `hardware`, `skills`, `contact`, `clear`, `matrix`, `sudo`, `exit`).
- **Web Audio API Sound Engine**: Zero external MP3 files. All UI audio (subtle clicks, hover frequency sweeps, sensor alert pulses, and transmission chirps) is synthesized on the fly using native Web Audio oscillators and gain envelopes.
- **Glassmorphic Sci-Fi HUD**: Clean overlay showing live 3D coordinates, station status, interactive sensor controls, audio toggle, and direct transmission form powered by EmailJS.
- **Mouse Parallax & Raycasting**: Eased cursor tracking for natural camera depth, plus full 3D object hit detection for clicks and hovers.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **3D Engine**: Three.js (`^0.187.0`)
- **Styling**: Tailwind CSS v4
- **Icons**: Custom SVG icons (`Icons.tsx`) & Lucide React
- **Audio**: Web Audio API (procedural synthesizer)
- **Email Service**: EmailJS
- **Build Tool**: Vite 8

---

## Running Locally

Clone the repository and install the dependencies:

```bash
git clone https://github.com/GaikawadaPrasad/3D-Interactive-Portfolio.git
cd 3D-Interactive-Portfolio

# Install dependencies
npm install

# Start the local development server (runs on port 5173 / 5175)
npm run dev
```

To build for production:

```bash
npm run build
npm run preview
```

---

## Contact & Links

- **Portfolio**: [Prasad Gaikwad Portfolio](https://github.com/GaikawadaPrasad)
- **GitHub**: [@GaikawadaPrasad](https://github.com/GaikawadaPrasad)
- **LinkedIn**: [Prasad Gaikwad](https://linkedin.com/in/prasad-gaikwad-dev)
- **Location**: Pune, Maharashtra, India
