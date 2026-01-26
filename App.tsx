
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import CameraFeed from './components/CameraFeed';
import SensorStatusPanel from './components/SensorStatus';
import Statistics from './components/Statistics';
import ArduinoConnect from './components/ArduinoConnect';
import AlarmSystem from './components/AlarmSystem';
import LoadingScreen from './components/LoadingScreen';
import DownloadPage from './components/DownloadPage';
import { SensorData, SensorStatus, HistoryPoint, ConnectionState } from './types';

const INITIAL_SENSORS: SensorData[] = [
  { id: '1', name: 'Alpha Zone', value: 0, status: SensorStatus.NOT_READY, lastUpdated: 'Disconnected' },
  { id: '2', name: 'Beta Zone', value: 0, status: SensorStatus.NOT_READY, lastUpdated: 'Disconnected' },
  { id: '3', name: 'Gamma Zone', value: 0, status: SensorStatus.NOT_READY, lastUpdated: 'Disconnected' },
];

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isDownloadMode, setIsDownloadMode] = useState(false);
  const [sensors, setSensors] = useState<SensorData[]>(INITIAL_SENSORS);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [fireIncidentCount, setFireIncidentCount] = useState(0);
  const [connection, setConnection] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [isTestActive, setIsTestActive] = useState(false);
  
  const serialPortRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const fireInCurrentTurn = useRef(false);
  const [serialImage, setSerialImage] = useState<string | null>(null);
  const esp32PortRef = useRef<any>(null);
  const espReaderRef = useRef<any>(null);
  const [espConnection, setEspConnection] = useState<ConnectionState>(ConnectionState.DISCONNECTED);

  const handleLoadingFinished = () => {
    setIsLoading(false);
    setTimeout(() => setShowDashboard(true), 100);
  };

  useEffect(() => {
    const fireDetected = sensors.some(s => s.status === SensorStatus.FIRE_DETECTED);
    if (fireDetected && !isAlarmActive && !fireInCurrentTurn.current) {
      setIsAlarmActive(true);
      setFireIncidentCount(prev => prev + 1);
      fireInCurrentTurn.current = true;
    } else if (!fireDetected) {
      fireInCurrentTurn.current = false;
    }
  }, [sensors, isAlarmActive]);

  const processSerialData = useCallback((data: string) => {
    const raw = data.trim();
    if (raw.startsWith("IMAGE:")) {
      const b64 = raw.slice(6).trim();
      if (b64) setSerialImage(`data:image/jpeg;base64,${b64}`);
      return;
    }
    const cleanData = raw.toUpperCase();
    if (isTestActive) return;

    // Detection logic:
    // 1. Check for "SENSORS:x,y,z" (0=FIRE, 1=SAFE)
    // 2. Check for "FIRE" anywhere in the stream
    // 3. Fallback to raw CSV parsing if it contains 0s and 1s
    
    let sensorTriggered = [false, false, false];

    if (cleanData.includes("SENSORS:")) {
      const payload = cleanData.split("SENSORS:")[1];
      const values = payload.split(',').map(v => parseInt(v.trim(), 10));
      if (values.length >= 3) {
        sensorTriggered = values.map(v => v === 0);
      }
    } else if (cleanData.includes("FIRE")) {
      // If "FIRE" is detected without specific zone, we check for specific labels
      sensorTriggered[0] = cleanData.includes("ALPHA") || cleanData.includes("SENSOR1");
      sensorTriggered[1] = cleanData.includes("BETA") || cleanData.includes("SENSOR2");
      sensorTriggered[2] = cleanData.includes("GAMMA") || cleanData.includes("SENSOR3");
      // If no specific zone, trigger all as a fallback
      if (!sensorTriggered.some(v => v)) sensorTriggered = [true, true, true];
    } else if (/^[01],[01],[01]$/.test(cleanData)) {
      const values = cleanData.split(',').map(v => parseInt(v.trim(), 10));
      sensorTriggered = values.map(v => v === 0);
    }

    if (sensorTriggered.some(v => v) || cleanData.length > 0) {
      setSensors(prev => prev.map((s, i) => {
        const isFlame = sensorTriggered[i];
        // If we didn't explicitly trigger this sensor and there's no data, keep prev status if safe
        const newStatus = isFlame ? SensorStatus.FIRE_DETECTED : SensorStatus.SAFE;
        
        return {
          ...s,
          value: isFlame ? 100 : 0,
          status: newStatus,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      }));
    }
  }, [isTestActive]);

  const connectArduino = async () => {
    if (!("serial" in navigator)) {
      alert("Serial API not supported. Use a Desktop browser like Chrome or Edge.");
      return;
    }
    setConnection(ConnectionState.CONNECTING);
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      serialPortRef.current = port;
      setConnection(ConnectionState.CONNECTED);
      
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;
      
      setSensors(prev => prev.map(s => ({ ...s, status: SensorStatus.READY })));

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';
          lines.forEach(line => processSerialData(line));
        }
      }
    } catch (err) {
      console.error("Serial Error:", err);
      setConnection(ConnectionState.ERROR);
    }
  };

  const disconnectArduino = async () => {
    try {
      if (readerRef.current) await readerRef.current.cancel();
      if (serialPortRef.current) await serialPortRef.current.close();
    } catch (e) {}
    setConnection(ConnectionState.DISCONNECTED);
    setSensors(INITIAL_SENSORS);
    setIsTestActive(false);
    setSerialImage(null);
  };
  
  const connectESP32 = async () => {
    if (!("serial" in navigator)) {
      alert("Serial API not supported. Use a Desktop browser like Chrome or Edge.");
      return;
    }
    setEspConnection(ConnectionState.CONNECTING);
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      esp32PortRef.current = port;
      setEspConnection(ConnectionState.CONNECTED);
      
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      espReaderRef.current = reader;
      
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';
          lines.forEach(line => {
            const raw = line.trim();
            if (raw.startsWith("IMAGE:")) {
              const b64 = raw.slice(6).trim();
              if (b64) setSerialImage(`data:image/jpeg;base64,${b64}`);
            }
          });
        }
      }
    } catch (err) {
      console.error("ESP32 Serial Error:", err);
      setEspConnection(ConnectionState.ERROR);
    }
  };
  
  const disconnectESP32 = async () => {
    try {
      if (espReaderRef.current) await espReaderRef.current.cancel();
      if (esp32PortRef.current) await esp32PortRef.current.close();
    } catch (e) {}
    setEspConnection(ConnectionState.DISCONNECTED);
    setSerialImage(null);
  };

  const triggerTestAlarm = () => {
    setIsTestActive(true);
    setSensors(prev => prev.map((s, i) => i === 0 ? { 
      ...s, 
      value: 100, 
      status: SensorStatus.FIRE_DETECTED,
      lastUpdated: 'TEST_MODE'
    } : s));
  };

  const acknowledgeAlarm = () => {
    setIsAlarmActive(false);
    if (isTestActive) {
      setIsTestActive(false);
      setSensors(prev => prev.map(s => ({ 
        ...s, 
        status: connection === ConnectionState.CONNECTED ? SensorStatus.READY : SensorStatus.NOT_READY 
      })));
    }
  };

  useEffect(() => {
    const point: HistoryPoint = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      alpha: sensors[0].value,
      beta: sensors[1].value,
      gamma: sensors[2].value
    };
    setHistory(prev => [...prev.slice(-19), point]);
  }, [sensors]);

  if (isLoading) return <LoadingScreen onFinished={handleLoadingFinished} />;

  if (isDownloadMode) {
    return <DownloadPage onBack={() => setIsDownloadMode(false)} />;
  }

  return (
    <div className={`transition-all duration-1000 ease-out transform ${showDashboard ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
      <AlarmSystem isActive={isAlarmActive} onAcknowledge={acknowledgeAlarm} />
      <div className="max-w-[1700px] mx-auto px-4 pb-12 overflow-x-hidden">
        <Header />
        
        {/* Offline Mode Entry Point */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => setIsDownloadMode(true)}
            className="bg-stone-900 hover:bg-orange-600 text-orange-500 hover:text-white px-6 py-3 rounded-2xl border-2 border-orange-600/30 hover:border-orange-500 transition-all font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-3 shadow-lg group"
          >
            <i className="fa-solid fa-cloud-arrow-down group-hover:bounce"></i>
            Enable Offline Mode
          </button>
        </div>
        
        <main className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 md:gap-10">
            <div className="h-[300px] sm:h-[450px] md:h-[600px] xl:h-[700px] w-full">
              <CameraFeed serialImage={serialImage || undefined} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
              <ArduinoConnect 
                state={connection} 
                onConnect={connectArduino} 
                onDisconnect={disconnectArduino}
                label="Arduino UNO"
                baudRate={9600}
              />
              <ArduinoConnect 
                state={espConnection} 
                onConnect={connectESP32} 
                onDisconnect={disconnectESP32}
                label="ESP32 Camera"
                baudRate={115200}
              />
            </div>

            <Statistics data={history} fireCount={fireIncidentCount} />
          </div>

          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 md:gap-8 lg:sticky lg:top-8">
            <div className={`rounded-[35px] md:rounded-[45px] p-8 md:p-12 border-b-[10px] md:border-b-[15px] transition-all flex items-center justify-between shadow-2xl relative overflow-hidden ${
              sensors.some(s => s.status === SensorStatus.FIRE_DETECTED) 
              ? 'bg-red-700 border-red-900 animate-pulse' 
              : connection === ConnectionState.CONNECTED ? 'bg-emerald-600 border-emerald-800' : 'bg-stone-800 border-stone-900'
            }`}>
               <div className="text-white relative z-10">
                  <h3 className="text-[11px] md:text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-70">Detection Grid</h3>
                  <p className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                    {sensors.some(s => s.status === SensorStatus.FIRE_DETECTED) ? 'PANIC ACTIVE' : connection === ConnectionState.CONNECTED ? 'ARMED' : 'STANDBY'}
                  </p>
               </div>
               <i className={`fa-solid ${sensors.some(s => s.status === SensorStatus.FIRE_DETECTED) ? 'fa-fire-alt' : 'fa-shield-halved'} text-4xl md:text-7xl text-white opacity-80 z-10`}></i>
               <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
            </div>

            <SensorStatusPanel sensors={sensors} />
            
            <div className="bg-stone-900 rounded-[35px] md:rounded-[45px] p-8 md:p-12 border-b-[10px] md:border-b-[15px] border-stone-950 flex flex-col gap-6 md:gap-8 shadow-2xl">
              <h4 className="text-[11px] md:text-xs font-black text-stone-500 uppercase tracking-widest border-l-4 border-orange-600 pl-4">Directive Control Console</h4>
              
              <button 
                className="w-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black py-5 md:py-8 rounded-2xl md:rounded-[35px] border-b-8 md:border-b-[12px] border-red-800 transition-all uppercase flex items-center justify-center gap-4 text-sm md:text-2xl shadow-xl"
                onClick={triggerTestAlarm}
              >
                <i className="fa-solid fa-radiation animate-spin-slow text-2xl md:text-4xl"></i>
                Simulate Panic
              </button>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <button 
                  onClick={() => setFireIncidentCount(0)}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-400 font-black py-4 md:py-6 rounded-xl md:rounded-[25px] border-b-4 border-stone-950 transition-all uppercase text-[10px] md:text-xs tracking-widest"
                >
                  Clear Logs
                </button>
                <button 
                  onClick={() => setSensors(INITIAL_SENSORS)}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-400 font-black py-4 md:py-6 rounded-xl md:rounded-[25px] border-b-4 border-stone-950 transition-all uppercase text-[10px] md:text-xs tracking-widest"
                >
                  Hard Reset
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-20 md:mt-32 pt-12 md:pt-16 border-t border-white/5 text-center text-stone-600">
          <p className="text-[10px] md:text-[13px] font-black uppercase tracking-[0.5em] mb-4 text-stone-500/50">APULA SYSTEM ARCHITECTURE // HARDWARE SYNC V2.6.0</p>
        </footer>
      </div>
      
      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
