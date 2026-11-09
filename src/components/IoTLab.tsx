import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Activity, Radio, AlertTriangle, ShieldAlert, Sparkles, Terminal, Volume2 } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from '../utils/sound';

export const IoTLab: React.FC = () => {
  const [activeSensor, setActiveSensor] = useState<string>('pir');
  const [motionTriggered, setMotionTriggered] = useState<boolean>(false);
  const [distanceCm, setDistanceCm] = useState<number>(35);
  const [tempC, setTempC] = useState<number>(27.4);
  const [luxValue, setLuxValue] = useState<number>(2450);
  const [serialLogs, setSerialLogs] = useState<string[]>([
    'ESP32 Bootloader v4.4 // 240MHz Dual-Core Xtensa LX6 initialized.',
    'WiFi connection established. IP: 192.168.1.84 // RSSI: -48dBm',
    'MQTT broker connected: broker.hivemq.com:1883 [QoS 1]',
    'Sensor bus scanning complete: I2C (0x68), One-Wire (GPIO 4), SPI (Active)',
    'Telemetry streaming active. Ready for trigger events.',
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Add Log Entry
  const addLog = (msg: string) => {
    const time = (performance.now() / 1000).toFixed(2);
    setSerialLogs((prev) => [...prev.slice(-8), `[+${time}s] ${msg}`]);
  };

  // Trigger PIR Motion Test
  const handleTriggerMotion = () => {
    sound.playClick();
    const newState = !motionTriggered;
    setMotionTriggered(newState);
    if (newState) {
      sound.playBeep(920, 0.15, 'square');
      addLog('INTERRUPT [GPIO 13] PIR Motion DETECTED! Active Buzzer triggered.');
    } else {
      addLog('INTERRUPT [GPIO 13] PIR Motion CLEARED. System IDLE.');
    }
  };

  // Ultrasonic Range Adjustment
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setDistanceCm(val);
    if (val < 30) {
      sound.playBeep(1200, 0.05, 'triangle');
      addLog(`PROXIMITY WARNING [Echo GPIO 18]: Target at ${val}cm (< 30cm safety threshold)`);
    }
  };

  // Oscilloscope Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const renderScope = () => {
      animId = requestAnimationFrame(renderScope);
      offset += 1.5;

      const w = canvas.width;
      const h = canvas.height;

      // Dark grid background
      ctx.fillStyle = '#080a0c';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = '#151c18';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Trace 1: Channel A (Clock Pulse - Emerald)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const pulse = Math.sin((x + offset * 2) * 0.08) > 0 ? 30 : 60;
        if (x === 0) ctx.moveTo(x, pulse);
        else ctx.lineTo(x, pulse);
      }
      ctx.stroke();

      // Trace 2: Channel B (Sensor Telemetry Wave - Amber/Cyan)
      ctx.strokeStyle = motionTriggered ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const waveAmp = motionTriggered ? 28 : (distanceCm / 400) * 20;
        const y = 110 + Math.sin((x + offset) * 0.05) * waveAmp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Legend in top-left
      ctx.fillStyle = '#10b981';
      ctx.font = '10px "Fira Code", monospace';
      ctx.fillText('CH1: ESP32_CLK (240MHz) 10us/div', 10, 16);
      ctx.fillStyle = motionTriggered ? '#ef4444' : '#38bdf8';
      ctx.fillText(
        motionTriggered ? 'CH2: INTR_PIR_ALARM [TRIP]' : `CH2: SENSOR_ADC (${distanceCm}cm / ${luxValue}lx)`,
        10,
        96
      );
    };

    renderScope();
    return () => cancelAnimationFrame(animId);
  }, [motionTriggered, distanceCm, luxValue]);

  return (
    <section id="iot-lab" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10 relative">
      {/* Section Header */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-white/10 font-mono text-xs text-amber-400 mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>// 04. EMBEDDED HARDWARE & IOT LAB</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Interactive Hardware Workbench
        </h2>
        <p className="mt-3 text-neutral-400 text-base sm:text-lg max-w-3xl">
          Test live simulated sensor telemetry, GPIO interrupts, and oscilloscope logic running on Prasad's ESP32 architecture. Click components below to interact in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Hardware Control Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Sensor Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PORTFOLIO_DATA.iotSensors.map((sensor) => (
              <button
                key={sensor.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveSensor(sensor.id);
                  addLog(`Focused sensor unit: ${sensor.name} on ${sensor.pin}`);
                }}
                className={`p-3 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
                  activeSensor === sensor.id
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-neutral-900/70 border-white/10 text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <div className="text-[10px] text-neutral-500 uppercase">{sensor.pin.split('|')[0]}</div>
                <div className="text-xs font-semibold mt-1 truncate">{sensor.name.split('(')[0]}</div>
              </button>
            ))}
          </div>

          {/* Interactive Sensor Workspace Board */}
          <div className="p-6 sm:p-7 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-xl space-y-6">
            {/* Active Sensor Header */}
            {PORTFOLIO_DATA.iotSensors
              .filter((s) => s.id === activeSensor)
              .map((sensor) => (
                <div key={sensor.id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
                    <div>
                      <h4 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <span>{sensor.name}</span>
                      </h4>
                      <div className="text-xs font-mono text-emerald-400 mt-0.5">
                        BUS: {sensor.pin} | TYPE: {sensor.type}
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-md bg-black/60 border border-white/10 font-mono text-xs text-neutral-300">
                      UNIT: {sensor.unit}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {sensor.desc}
                  </p>

                  {/* Dynamic Interactive Controls per Sensor */}
                  <div className="pt-2">
                    {sensor.id === 'pir' && (
                      <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-400">IR SENSOR STATE:</span>
                          <span className={motionTriggered ? 'text-red-400 font-bold animate-pulse' : 'text-emerald-400'}>
                            {motionTriggered ? 'TRIPPED [HIGH - 3.3V]' : 'NORMAL [LOW - 0.0V]'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleTriggerMotion}
                          className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                            motionTriggered
                              ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                              : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                        >
                          <Activity className="w-4 h-4" />
                          <span>{motionTriggered ? 'RESET PIR MOTION SENSOR' : 'SIMULATE HUMAN PASS-BY'}</span>
                        </button>
                      </div>
                    )}

                    {sensor.id === 'ultrasonic' && (
                      <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">MEASURED DISTANCE:</span>
                          <span className={`font-bold ${distanceCm < 30 ? 'text-amber-400 animate-pulse' : 'text-sky-400'}`}>
                            {distanceCm} cm ({Math.round(distanceCm * 58.2)} µs pulse width)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="300"
                          value={distanceCm}
                          onChange={handleDistanceChange}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-neutral-500">
                          <span>5cm (Near Obstacle)</span>
                          <span>150cm (Midfield)</span>
                          <span>300cm (Max Range)</span>
                        </div>
                      </div>
                    )}

                    {sensor.id === 'temperature' && (
                      <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">DHT22 AMBIENT TEMP:</span>
                          <span className="text-emerald-400 font-bold">{tempC}°C | 54% RH</span>
                        </div>
                        <div className="flex gap-2">
                          {[21.5, 27.4, 38.2].map((deg) => (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                setTempC(deg);
                                addLog(`DHT22 One-Wire update: Temperature registered at ${deg}°C`);
                              }}
                              className={`flex-1 py-2 rounded-lg border text-xs ${
                                tempC === deg
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-neutral-900 text-neutral-400 border-white/10'
                              }`}
                            >
                              {deg}°C
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {sensor.id === 'ldr' && (
                      <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">ADC1_CH6 12-BIT VALUE:</span>
                          <span className="text-amber-400 font-bold">{luxValue} / 4095 RAW</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="4095"
                          value={luxValue}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            setLuxValue(v);
                          }}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right Column: Digital Oscilloscope & Live Serial Console (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Oscilloscope Canvas */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between font-mono text-xs pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>DIGITAL OSCILLOSCOPE CH1 / CH2</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                100 MSa/s
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
              <canvas
                ref={canvasRef}
                width={480}
                height={160}
                className="w-full h-[150px] block"
              />
            </div>
          </div>

          {/* ESP32 Serial Monitor Console */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#07090b] border border-white/10 font-mono text-xs flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-neutral-400">
              <div className="flex items-center gap-2 text-emerald-400">
                <Terminal className="w-4 h-4" />
                <span className="font-semibold text-white">ESP32 UART SERIAL (115200 BAUD)</span>
              </div>
              <button
                type="button"
                onClick={() => setSerialLogs(['Serial buffer cleared. Ready.'])}
                className="text-[10px] text-neutral-500 hover:text-white"
              >
                CLEAR
              </button>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 text-neutral-300 text-[11px] leading-relaxed pr-1 select-text">
              {serialLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 select-none">&gt;</span>
                  <span className={log.includes('WARNING') || log.includes('TRIP') ? 'text-amber-400' : 'text-neutral-300'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
