import * as THREE from 'three';

// Procedural PBR Texture Generator (High Resolution, Zero Download Lag)
export class TextureFactory {
  // 1. Authentic ESP32 PCB Silk-screen & Circuit Trace Texture
  static createPcbTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Matte dark solder mask base
    ctx.fillStyle = '#081a10';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle fiberglass FR4 weave pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 1024; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1024);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1024, i);
      ctx.stroke();
    }

    // Copper / Gold Circuit Traces
    ctx.strokeStyle = '#c99632';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const traces = [
      [120, 200, 280, 200, 360, 280, 360, 500],
      [120, 240, 240, 240, 320, 320, 320, 600],
      [120, 300, 200, 300, 260, 360, 260, 700],
      [900, 200, 740, 200, 660, 280, 660, 500],
      [900, 240, 780, 240, 700, 320, 700, 600],
      [900, 300, 820, 300, 760, 360, 760, 700],
      [400, 850, 400, 650, 480, 570],
      [624, 850, 624, 650, 544, 570],
    ];

    traces.forEach((pts) => {
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let j = 2; j < pts.length; j += 2) {
        ctx.lineTo(pts[j], pts[j + 1]);
      }
      ctx.stroke();
    });

    // Gold Pin Solder Pads along left & right edges
    ctx.fillStyle = '#eab308';
    for (let y = 140; y <= 900; y += 42) {
      // Left pads
      ctx.fillRect(80, y, 40, 18);
      ctx.beginPath();
      ctx.arc(100, y + 9, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#081a10';
      ctx.fill();
      ctx.fillStyle = '#eab308';

      // Right pads
      ctx.fillRect(904, y, 40, 18);
      ctx.beginPath();
      ctx.arc(924, y + 9, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#081a10';
      ctx.fill();
      ctx.fillStyle = '#eab308';
    }

    // Silkscreen White Markings & Pin Labels
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 22px "Fira Code", monospace';
    ctx.fillText('ESP32-DEVKIT-V1', 370, 180);
    ctx.font = '16px "Fira Code", monospace';
    ctx.fillText('XTENSA DUAL-CORE 240MHz', 360, 210);
    ctx.fillText('PRASAD GAIKWAD // HW LAB', 365, 880);

    // Pin Names Left
    const leftPins = ['3V3', 'EN', 'VP', 'VN', 'D34', 'D35', 'D32', 'D33', 'D25', 'D26', 'D27', 'D14', 'D12', 'D13', 'GND', 'VIN'];
    ctx.font = '12px "Fira Code", monospace';
    leftPins.forEach((pin, idx) => {
      ctx.fillText(pin, 135, 154 + idx * 42);
    });

    // Pin Names Right
    const rightPins = ['GND', 'D23', 'D22', 'TXD', 'RXD', 'D21', 'D19', 'D18', 'D5', 'D17', 'D16', 'D4', 'D0', 'D2', 'D15', 'CLK'];
    rightPins.forEach((pin, idx) => {
      ctx.fillText(pin, 855, 154 + idx * 42);
    });

    // Component Outlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(430, 460, 164, 164); // MCU die socket
    ctx.fillText('MCU_DIE_U1', 460, 545);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  // 2. Laser-Etched Metal RF Shield Texture
  static createRfShieldTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Brushed metal finish
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(0, 0, 512, 512);

    // Brushed metal horizontal grain lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 2) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Laser etching (Dark charcoal / engraved)
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 36px "Fira Code", sans-serif';
    ctx.fillText('ESPRESSIF', 140, 110);

    ctx.font = 'bold 44px "Fira Code", monospace';
    ctx.fillText('ESP-WROOM-32', 90, 190);

    ctx.font = '18px "Fira Code", monospace';
    ctx.fillText('FCC ID: 2AC7Z-ESPWROOM32', 110, 260);
    ctx.fillText('Wi-Fi 802.11 b/g/n + BLE 4.2', 105, 300);
    ctx.fillText('CE 0700   [RoHS COMPLIANT]', 115, 340);
    ctx.fillText('DESIGNED BY PRASAD GAIKWAD', 110, 410);

    // QR / DataMatrix code simulation in corner
    ctx.fillStyle = '#1f2937';
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if ((r + c) % 2 === 0 || r === 0 || c === 0 || r === 6 || c === 6) {
          ctx.fillRect(400 + c * 10, 400 + r * 10, 8, 8);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // 3. Realistic Breadboard Texture
  static createBreadboardTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Cream / Ivory Breadboard surface
    ctx.fillStyle = '#1c1f26';
    ctx.fillRect(0, 0, 1024, 512);

    // Power Rails (Red and Blue)
    ctx.fillStyle = '#ef4444'; // Red +
    ctx.fillRect(40, 30, 944, 4);
    ctx.fillRect(40, 478, 944, 4);

    ctx.fillStyle = '#3b82f6'; // Blue -
    ctx.fillRect(40, 75, 944, 4);
    ctx.fillRect(40, 433, 944, 4);

    // Central Divider Trough
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(40, 246, 944, 20);

    // Pin Sockets (Tiny rounded dark holes with metallic contacts)
    ctx.fillStyle = '#000000';
    for (let col = 60; col < 980; col += 18) {
      // Top power bus
      ctx.fillRect(col, 45, 6, 6);
      ctx.fillRect(col, 60, 6, 6);

      // Terminal rows A-E
      for (let r = 0; r < 5; r++) {
        ctx.fillRect(col, 110 + r * 22, 6, 6);
      }

      // Terminal rows F-J
      for (let r = 0; r < 5; r++) {
        ctx.fillRect(col, 280 + r * 22, 6, 6);
      }

      // Bottom power bus
      ctx.fillRect(col, 445, 6, 6);
      ctx.fillRect(col, 460, 6, 6);
    }

    // Numbering labels (1, 5, 10, 15, ..., 60)
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "Fira Code", monospace';
    let count = 1;
    for (let col = 60; col < 980; col += 18 * 5) {
      ctx.fillText(count.toString(), col - 4, 102);
      ctx.fillText(count.toString(), col - 4, 412);
      count += 5;
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // 4. Ultrasonic Sensor Metal Mesh Grill Texture
  static createUltrasonicMeshTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#c4c8d0';
    ctx.fillRect(0, 0, 256, 256);

    // Concentric speaker mesh rings
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    for (let r = 10; r < 120; r += 12) {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Perforation grid
    ctx.fillStyle = '#1e293b';
    for (let x = 20; x < 240; x += 10) {
      for (let y = 20; y < 240; y += 10) {
        const d = Math.hypot(x - 128, y - 128);
        if (d < 110) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // 5. Laptop Keyboard & Trackpad Texture
  static createKeyboardTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Matte dark aluminum deck
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, 1024, 512);

    // Keyboard well recess
    ctx.fillStyle = '#0a0c0e';
    ctx.fillRect(40, 30, 944, 280);
    ctx.strokeStyle = '#1e242d';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 30, 944, 280);

    // Function keys row
    const fnLabels = ['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'DEL'];
    const fnWidth = (944 - 15 * 6) / 14;
    fnLabels.forEach((lbl, i) => {
      const kx = 46 + i * (fnWidth + 6);
      ctx.fillStyle = '#161920';
      ctx.fillRect(kx, 40, fnWidth, 24);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px "Fira Code", monospace';
      ctx.fillText(lbl, kx + 8, 56);
    });

    // QWERTY Key Rows
    const rows = [
      ['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BACK'],
      ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
      ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'],
      ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'],
      ['CTRL', 'FN', 'OPT', 'CMD', '     SPACEBAR     ', 'CMD', 'OPT', '<', '^', 'v', '>'],
    ];

    rows.forEach((row, rIdx) => {
      const ky = 76 + rIdx * 44;
      const totalKeys = row.length;
      let curX = 46;

      row.forEach((key) => {
        let kw = 52;
        if (key.includes('SPACEBAR')) kw = 320;
        else if (key === 'BACK' || key === 'TAB') kw = 72;
        else if (key === 'CAPS' || key === 'ENTER') kw = 84;
        else if (key === 'SHIFT') kw = 104;
        else if (key === 'CMD' || key === 'CTRL' || key === 'OPT' || key === 'FN') kw = 50;

        // Key cap
        ctx.fillStyle = '#181c24';
        ctx.fillRect(curX, ky, kw, 38);
        ctx.strokeStyle = '#272f3d';
        ctx.lineWidth = 1;
        ctx.strokeRect(curX, ky, kw, 38);

        // Key legend
        ctx.fillStyle = key.includes('SPACEBAR') ? '#10b981' : '#cbd5e1';
        ctx.font = '11px "Fira Code", monospace';
        const textX = curX + (key.includes('SPACEBAR') ? 95 : 12);
        ctx.fillText(key, textX, ky + 24);

        curX += kw + 6;
      });
    });

    // Glass Trackpad
    ctx.fillStyle = '#13161c';
    ctx.fillRect(362, 335, 300, 160);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.strokeRect(362, 335, 300, 160);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // 6. Photovoltaic Solar Array Texture (for Radar Station)
  static createSolarPanelTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Deep deep space photovoltaic blue
    ctx.fillStyle = '#06162d';
    ctx.fillRect(0, 0, 512, 512);

    // Silicon wafer cells grid
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Silver busbars & micro-conductors
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1;
    for (let x = 16; x < 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // 7. Mini 0.96" OLED I2C Display Screen Texture
  static createOledScreenTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Black OLED substrate
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 256, 128);

    // Cyan / Emerald 128x64 display content
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "Fira Code", monospace';
    ctx.fillText('PRASAD HW LAB', 12, 22);

    ctx.font = '10px "Fira Code", monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('IP: 192.168.4.1', 12, 40);
    ctx.fillText('HEAP: 284.2 KB FREE', 12, 56);
    ctx.fillText('PULL: 400kHz I2C OK', 12, 72);

    // Live wave miniature
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 12; x < 244; x += 4) {
      const y = 102 + Math.sin(x * 0.12) * 12;
      if (x === 12) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
}
