import React from 'react';

interface Props {
  onBack: () => void;
}

const GuidesPage: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-stone-950 text-white p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest hover:text-emerald-400 transition-colors mb-8 group"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          Back to Dashboard
        </button>

        <header className="mb-12 border-l-8 border-emerald-600 pl-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">System Guides</h1>
          <p className="text-stone-500 font-bold uppercase tracking-widest text-sm md:text-base">Hardware & Software Integration</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Combined ESP32 Hub Guide */}
          <section className="bg-emerald-600 rounded-[40px] p-8 md:p-12 text-white shadow-2xl shadow-emerald-600/20">
            <header className="mb-10">
              <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-cube text-3xl"></i>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Combined ESP32 Hub</h2>
              <p className="text-emerald-100 font-bold uppercase tracking-widest text-sm">Camera + Sensors in ONE device</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 rounded-[30px] p-6 border border-white/10">
                <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-3">
                  <i className="fa-solid fa-download"></i>
                  1. Setup
                </h3>
                <ul className="space-y-3 text-emerald-100 font-bold text-sm">
                  <li className="bg-emerald-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    Flash **ESP32_COMBINED_HUB.ino** to your ESP32-CAM.
                  </li>
                  <li className="bg-emerald-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    Connect 3 Sensors to Pins **14, 15, 13**.
                  </li>
                  <li className="bg-emerald-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    Connect Buzzer to Pin **4** (Flashlight pin).
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-[30px] p-6 border border-white/10">
                <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-3">
                  <i className="fa-solid fa-link"></i>
                  2. Connect
                </h3>
                <ul className="space-y-3 text-emerald-100 font-bold text-sm">
                  <li className="bg-emerald-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    Use **Sync Wi-Fi** on Dashboard via USB.
                  </li>
                  <li className="bg-emerald-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    Dashboard IP for Camera: **[Device IP]**
                  </li>
                  <li className="bg-emerald-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    Dashboard IP for Sensors: **[Device IP]**
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Wiring Guide */}
          <section className="bg-stone-900 rounded-[30px] p-8 border border-white/5 relative overflow-hidden group">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-white flex items-center gap-3">
              <i className="fa-solid fa-plug text-emerald-500"></i>
              Hardware Wiring & Logic
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-emerald-500 font-black mb-2 uppercase text-xs tracking-widest">Sensors (Flame)</p>
                <p className="text-stone-400 text-xs font-bold leading-relaxed">
                  <span className="text-white">ESP32:</span> Pins 34, 35, 32<br/>
                  <span className="text-white">Arduino UNO:</span> Pins 2, 3, 4
                </p>
              </div>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-emerald-500 font-black mb-2 uppercase text-xs tracking-widest">Alerts (Buzzer)</p>
                <p className="text-stone-400 text-xs font-bold leading-relaxed">
                  <span className="text-white">ESP32:</span> Pin 33<br/>
                  <span className="text-white">Arduino UNO:</span> Pin 5
                </p>
              </div>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-emerald-500 font-black mb-2 uppercase text-xs tracking-widest">Logic Type</p>
                <p className="text-stone-400 text-xs font-bold leading-relaxed">
                  Active <span className="text-white">LOW</span> sensors. Buzzer triggers when any sensor goes LOW.
                </p>
              </div>
            </div>
          </section>

          {/* Hotspot Backup */}
          <section className="bg-stone-900 rounded-[30px] p-8 border border-white/5">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-white flex items-center gap-3">
              <i className="fa-solid fa-tower-broadcast text-emerald-500"></i>
              Hotspot Mode (No Router)
            </h2>
            <p className="text-stone-400 text-sm font-bold mb-6">
              If no Wi-Fi router is available, connect your laptop directly to the device:
            </p>
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <p className="text-emerald-500 font-black uppercase text-[10px] tracking-widest mb-2">Credentials</p>
                <ul className="text-xs font-bold text-stone-300 space-y-2">
                  <li>SSID: <span className="text-white">APULA_SENSOR_NODE</span></li>
                  <li>PASS: <span className="text-white">apula123</span></li>
                  <li>IP: <span className="text-white">192.168.4.1</span></li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-16 pb-12 text-center text-stone-600 font-bold uppercase tracking-[0.4em] text-[10px]">
          APULA // System Documentation // v2.6.0
        </footer>
      </div>
    </div>
  );
};

export default GuidesPage;
