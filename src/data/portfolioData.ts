export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  category: 'Full-Stack' | 'Mobile & Hybrid' | 'IoT & Hardware' | 'Interactive Web';
  summary: string;
  description: string;
  keyFeatures: string[];
  techs: string[];
  images: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  hardwareSpecs?: string[];
}

export const PORTFOLIO_DATA = {
  profile: {
    name: 'Prasad Gaikwad',
    role: 'Full-Stack & Hardware Developer',
    location: 'Pune, Maharashtra, India',
    status: 'AVAILABLE FOR OPPORTUNITIES',
    bio: 'Bridging the physical and digital worlds: I engineer performant full-stack web applications, cross-platform mobile tools, and embedded IoT hardware systems with clean, production-ready code.',
    avatar: '/images/prasad-portrait.jpg',
    resumeUrl: 'https://drive.google.com/file/d/1GiIQHGwUThnbyUcdNp-A2lFJq9RnSskq/view?usp=sharing',
    socials: {
      github: 'https://github.com/GaikawadaPrasad',
      linkedin: 'https://www.linkedin.com/in/prasadgaikawada/',
      instagram: 'https://www.instagram.com/princeprasad_1/profilecard/',
      email: 'gaikawadaprasad2002@gmail.com',
    },
    metrics: [
      { label: 'Production Projects', value: '10+' },
      { label: 'Hardware Prototypes', value: '5+' },
      { label: 'Core Tech Stacks', value: '4' },
      { label: 'Uptime Reliability', value: '99.9%' },
    ],
  },

  projects: [
    {
      id: 'smart-iot-surveillance',
      title: 'Smart IoT Surveillance & Alert System',
      subtitle: 'ESP32 Embedded Security & Telemetry Hub',
      badge: 'Hardware & IoT',
      category: 'IoT & Hardware',
      summary: 'An autonomous IoT security station running on ESP32 microcontrollers with ultrasonic radar, PIR motion detection, and real-time cloud WebSocket alerting.',
      description: 'Engineered a full-scale IoT security and spatial monitoring platform. The edge node runs on an ESP32 microcontroller with dual-core processing, interfacing with multiple digital and analog sensors (PIR motion detectors, HC-SR04 ultrasonic rangefinders, and buzzer actuators). Sensor telemetry is parsed in C++/MicroPython and broadcasted via WebSockets and MQTT to a responsive web dashboard for remote control, event logs, and intrusion alerts.',
      keyFeatures: [
        'Real-time edge telemetry with sub-50ms latency',
        'Multi-sensor fusion (PIR motion + Ultrasonic radar ranging)',
        'Autonomous local trigger loop with audible siren and status LED',
        'Live Web dashboard showing active radar sweeps and status logs',
        'Failsafe power circuit with capacitor backup protection',
      ],
      techs: ['ESP32', 'C++', 'MicroPython', 'WebSockets', 'MQTT', 'Node.js', 'React.js', 'Tailwind CSS'],
      images: [
        '/images/final_year_project1.webp',
        '/images/final_year_project_UI1.png',
        '/images/final_year_project_UI2.png',
      ],
      githubUrl: 'https://github.com/GaikawadaPrasad',
      featured: true,
      hardwareSpecs: [
        'MCU: ESP32-WROOM-32 (240MHz Dual-Core Xtensa LX6)',
        'SRAM: 520 KB | Flash: 4MB SPI',
        'Protocols: SPI, I2C, UART, 802.11 b/g/n Wi-Fi, BLE 4.2',
        'Sensors: HC-SR04 Ultrasonic, HC-SR501 PIR, Active Buzzer',
      ],
    },
    {
      id: 'fittrack',
      title: 'FitTrack - Biological Fitness Companion',
      subtitle: 'Algorithmic Health & Metric Dashboard',
      badge: 'Interactive Web App',
      category: 'Interactive Web',
      summary: 'A precision fitness metrics tracker computing BMI, BMR, and TDEE with dynamic Chart.js visualizations and real-time Firebase sync.',
      description: 'FitTrack is a health companion designed to empower individuals with scientific health tracking. Using the Mifflin-St Jeor equation and body composition algorithms, it dynamically computes caloric expenditures, resting metabolic rates, and recommended macro splits. Built with an intuitive React frontend, dynamic Chart.js historical progress plots, and secure Firebase Authentication.',
      keyFeatures: [
        'Mifflin-St Jeor equation calculation engine for accurate BMR & TDEE',
        'Interactive Chart.js health timeline with smooth animated transitions',
        'Real-time Firebase Firestore data persistence and sync',
        'Responsive layout tuned for mobile and desktop screens',
      ],
      techs: ['React.js', 'Firebase Auth', 'Firestore', 'Chart.js', 'Vite', 'Tailwind CSS'],
      images: [
        '/images/Chart_Karo_UI1.png',
        '/images/Chart_Karo_UI2.png',
      ],
      liveUrl: 'https://vdp-fit-track.vercel.app/login',
      githubUrl: 'https://github.com/GaikawadaPrasad',
      featured: true,
    },
    {
      id: 'melodix',
      title: 'Melodix - Offline-First Hybrid Audio Player',
      subtitle: 'Native Capacitor Android & React Engine',
      badge: 'Mobile & Hybrid',
      category: 'Mobile & Hybrid',
      summary: 'A responsive offline-first audio player compiled natively for Android with Capacitor, IndexedDB metadata caching, and dnd-kit playlist reordering.',
      description: 'Melodix solves the problem of clunky offline music management on mobile. Leveraging Capacitor native bridges, it accesses device storage directly, reads ID3 audio metadata, caches album artwork in IndexedDB, and features a gesture-driven playlist management interface using dnd-kit and Framer Motion.',
      keyFeatures: [
        'Hardware-accelerated native audio playback via Capacitor bridges',
        'Zero-network IndexedDB persistent metadata and track caching',
        'Drag-and-drop playlist reordering with tactile haptic feedback',
        'Zustand lightweight reactive state store',
      ],
      techs: ['React.js', 'Capacitor', 'Android SDK', 'Zustand', 'IndexedDB', 'dnd-kit', 'Tailwind CSS', 'Framer Motion'],
      images: [
        '/images/Chart_Karo_UI2.png',
        '/images/Chart_Karo_UI1.png',
      ],
      githubUrl: 'https://github.com/GaikawadaPrasad/Melodix',
      featured: true,
    },
    {
      id: 'chart-karo',
      title: 'Chart Karo - Real-Time Collaborative Workspace',
      subtitle: 'High-Concurrency Socket.io Messaging Hub',
      badge: 'Full-Stack Web',
      category: 'Full-Stack',
      summary: 'High-speed WebSocket messaging application with end-to-end event broadcasting, active room management, and responsive dark interface.',
      description: 'Designed and deployed an ultra-responsive messaging hub built on Node.js and Socket.io. Features zero-lag bidirectional socket piping, room authorization tokens, typing indicators, and message history storage in MongoDB.',
      keyFeatures: [
        'Bi-directional WebSocket streaming with auto-reconnection',
        'Scoped chat channels and private user messaging rooms',
        'Optimistic UI message updates with delivery receipts',
        'Clean obsidian interface with monospaced log tags',
      ],
      techs: ['Node.js', 'Socket.io', 'Express.js', 'MongoDB', 'React.js', 'Tailwind CSS'],
      images: [
        '/images/Chart_Karo_UI2.png',
        '/images/Chart_Karo_UI1.png',
      ],
      githubUrl: 'https://github.com/GaikawadaPrasad',
      featured: true,
    },
    {
      id: 'sri-sri-associates',
      title: 'Sri Sri Associates - Real Estate Portfolio',
      subtitle: 'Corporate Real Estate & Architecture Portal',
      badge: 'Client Production',
      category: 'Interactive Web',
      summary: 'A client production web platform showcasing luxury commercial and residential real estate developments with property filtering and inquiries.',
      description: 'Developed a high-converting web presence for an architectural and real estate consultancy firm. Features responsive property galleries, location mapping, interactive project specs, and an integrated inquiry transmission form.',
      keyFeatures: [
        'Fluid image galleries with thumbnail preview sync',
        'Custom interactive property specs grid',
        'Fast initial load time optimized via modern image compression',
        'Integrated client inquiry workflow',
      ],
      techs: ['React.js', 'Tailwind CSS', 'Vite', 'Framer Motion'],
      images: [
        '/images/Sri_Sri_Associates.png',
      ],
      githubUrl: 'https://github.com/GaikawadaPrasad',
      featured: false,
    },
    {
      id: 'muscle-up-cafe',
      title: 'Muscle UP CAFE - Nutrition & Order Hub',
      subtitle: 'Performance Nutrition & Food Menu Application',
      badge: 'Commercial Web',
      category: 'Interactive Web',
      summary: 'A modern fitness café web application featuring high-protein menu builders, macro nutrient calculators, and sleek dark visuals.',
      description: 'Built for fitness enthusiasts and athletes, Muscle UP CAFE provides seamless digital menu browsing, customized meal combo creation, and direct macro breakdown calculation per order.',
      keyFeatures: [
        'Dynamic macro nutrition aggregator per dish',
        'Categorized menu filtering with responsive search',
        'Engaging food visuals with interactive hover states',
      ],
      techs: ['React.js', 'Tailwind CSS', 'Vite', 'Framer Motion'],
      images: [
        '/images/Muscle_UP_CAFE1.png',
        '/images/Muscle_Up_CAFE2.png',
        '/images/Muscle_UP_CAFE3.png',
      ],
      githubUrl: 'https://github.com/GaikawadaPrasad',
      featured: false,
    },
    {
      id: 'terminal-portfolio',
      title: 'Terminal CLI Portfolio',
      subtitle: 'Unix Command-Line Interface Portfolio',
      badge: 'Developer Tooling',
      category: 'Interactive Web',
      summary: 'A fully functional interactive browser terminal emulator supporting custom bash commands, autocomplete, history, and system queries.',
      description: 'Engineered an authentic Unix-style terminal in React. Visitors can type commands like `help`, `cat bio.txt`, `ls projects`, `fetch hardware`, `sudo rm -rf /` (with Easter eggs), and `contact` to inspect developer stats.',
      keyFeatures: [
        'Command parsing engine with command history up/down arrows',
        'Tab autocomplete and help documentation',
        'Authentic monospace scanline styling with CRT flicker toggle',
      ],
      techs: ['React.js', 'Tailwind CSS', 'Fira Code', 'Vite'],
      images: [
        '/images/final_year_project_UI2.png',
      ],
      liveUrl: 'https://gaikawadaprasad.github.io/terminal-portfolio/',
      githubUrl: 'https://github.com/GaikawadaPrasad/terminal-portfolio',
      featured: false,
    },
  ] as ProjectItem[],

  skills: {
    frontend: [
      { name: 'React.js', level: 92, tag: 'Component Architecture' },
      { name: 'Three.js / WebGL', level: 85, tag: '3D Graphics & Shaders' },
      { name: 'Tailwind CSS', level: 95, tag: 'Utility Design System' },
      { name: 'JavaScript / ESNext', level: 90, tag: 'Asynchronous Core' },
      { name: 'TypeScript', level: 84, tag: 'Type Safety' },
      { name: 'Framer Motion', level: 88, tag: 'Spring Physics' },
      { name: 'HTML5 & CSS3', level: 96, tag: 'Semantics & Layout' },
    ],
    backend: [
      { name: 'Node.js', level: 88, tag: 'Event-Driven Runtime' },
      { name: 'Express.js', level: 86, tag: 'RESTful Middleware' },
      { name: 'Socket.io', level: 82, tag: 'Bidirectional Streaming' },
      { name: 'Python', level: 80, tag: 'Scripting & Telemetry' },
      { name: 'Java', level: 78, tag: 'OOP & Data Structures' },
      { name: 'REST APIs', level: 90, tag: 'Architecture & Design' },
    ],
    hardware: [
      { name: 'ESP32 MCU', level: 90, tag: 'Dual-Core 240MHz SoC' },
      { name: 'C++ / Arduino IDE', level: 84, tag: 'Firmware & Logic' },
      { name: 'MicroPython', level: 82, tag: 'Edge Scripting' },
      { name: 'IoT Sensor Interfacing', level: 88, tag: 'PIR, Ultrasonic, ADC' },
      { name: 'MQTT & WebSockets', level: 85, tag: 'IoT Protocol Stack' },
      { name: 'Circuit Prototyping', level: 80, tag: 'Breadboard, Power Rails' },
    ],
    databases: [
      { name: 'MongoDB & Mongoose', level: 85, tag: 'NoSQL Document Store' },
      { name: 'Firebase & Firestore', level: 84, tag: 'BaaS & Realtime Auth' },
      { name: 'IndexedDB', level: 80, tag: 'Browser Client Persistence' },
    ],
    tools: [
      { name: 'Git & GitHub', level: 92, tag: 'Version Control & CI' },
      { name: 'Capacitor', level: 82, tag: 'Android Native Bridge' },
      { name: 'Postman', level: 88, tag: 'API Testing & Mocks' },
      { name: 'Vite', level: 92, tag: 'Next-Gen Build Engine' },
    ],
  },

  iotSensors: [
    {
      id: 'pir',
      name: 'PIR Motion Sensor (HC-SR501)',
      pin: 'GPIO 13',
      type: 'Digital Input',
      unit: 'Detection',
      defaultVal: 'IDLE (0)',
      activeVal: 'MOTION DETECTED (1)',
      desc: 'Detects infrared radiation variations caused by human movement within a 7-meter radius.',
    },
    {
      id: 'ultrasonic',
      name: 'Ultrasonic Radar (HC-SR04)',
      pin: 'Trig: GPIO 5 | Echo: GPIO 18',
      type: 'Time of Flight',
      unit: 'cm',
      defaultVal: '142 cm',
      activeVal: '28 cm (PROXIMITY ALERT)',
      desc: 'Emits 40kHz sonic bursts to calculate distance by measuring pulse echo duration.',
    },
    {
      id: 'temperature',
      name: 'Thermal Sensor (DHT22)',
      pin: 'GPIO 4',
      type: 'One-Wire Digital',
      unit: '°C / %RH',
      defaultVal: '26.4°C | 52% RH',
      activeVal: '34.8°C | 78% RH (HIGH)',
      desc: 'Calibrated digital signal output measuring ambient temperature and relative humidity.',
    },
    {
      id: 'ldr',
      name: 'Photoresistor Ambient Sensor',
      pin: 'GPIO 34 (ADC1_CH6)',
      type: '12-bit Analog ADC',
      unit: 'Lux (0-4095)',
      defaultVal: '2840 (DAYLIGHT)',
      activeVal: '420 (NIGHT / SHADOW)',
      desc: 'Monitors ambient light intensity to automatically toggle night illumination protocols.',
    },
  ],

  emailJsConfig: {
    serviceId: 'service_kx1qjdj',
    templateId: 'template_oziconp',
    publicKey: 'aORidiTZGt5beCvS_',
  },
};
