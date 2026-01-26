import React from 'react';

interface Props {
  onBack: () => void;
}

const DownloadPage: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-stone-950 text-white p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-orange-500 font-black uppercase tracking-widest hover:text-orange-400 transition-colors mb-8 group"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          Back to Dashboard
        </button>

        <header className="mb-12 border-l-8 border-orange-600 pl-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">Offline Deployment</h1>
          <p className="text-stone-500 font-bold uppercase tracking-widest text-sm md:text-base">Complete Guide for Local APULA Installation</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Step 1: Download */}
          <section className="bg-stone-900 rounded-[30px] p-8 border-b-8 border-stone-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="flex items-start gap-6 relative z-10">
              <div className="bg-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-orange-600/20">1</div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Download Source Code</h2>
                <p className="text-stone-400 mb-6 leading-relaxed">
                  To run APULA offline, you need the complete project files on your local machine.
                </p>
                <button className="bg-white text-stone-950 font-black px-8 py-4 rounded-2xl uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all flex items-center gap-3 active:scale-95 shadow-xl">
                  <i className="fa-solid fa-download"></i>
                  Download ZIP Archive
                </button>
              </div>
            </div>
          </section>

          {/* Step 2: Install Node.js */}
          <section className="bg-stone-900 rounded-[30px] p-8 border-b-8 border-stone-800 relative overflow-hidden group">
            <div className="flex items-start gap-6 relative z-10">
              <div className="bg-stone-800 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 border border-white/5">2</div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Install Runtime Environment</h2>
                <p className="text-stone-400 mb-4 leading-relaxed">
                  Install <strong>Node.js (LTS version)</strong>. This allows the application to serve files and handle hardware communication locally.
                </p>
                <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-bold hover:underline inline-flex items-center gap-2">
                  Visit nodejs.org <i className="fa-solid fa-external-link text-xs"></i>
                </a>
              </div>
            </div>
          </section>

          {/* Step 3: Local Setup */}
          <section className="bg-stone-900 rounded-[30px] p-8 border-b-8 border-stone-800 relative overflow-hidden group">
            <div className="flex items-start gap-6 relative z-10">
              <div className="bg-stone-800 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 border border-white/5">3</div>
              <div className="w-full">
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Initialize & Run</h2>
                <p className="text-stone-400 mb-6 leading-relaxed">Open your terminal in the project folder and execute these commands:</p>
                
                <div className="bg-stone-950 rounded-2xl p-6 border border-white/5 font-mono text-sm space-y-4 shadow-inner">
                  <div>
                    <span className="text-stone-600 block mb-1"># Install dependencies</span>
                    <code className="text-orange-500">npm install</code>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-stone-600 block mb-1"># Start offline server</span>
                    <code className="text-emerald-500">npm run dev</code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hardware Guide */}
          <section className="bg-orange-600 rounded-[40px] p-8 md:p-12 text-white shadow-2xl shadow-orange-600/20">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="shrink-0">
                <i className="fa-solid fa-microchip text-7xl md:text-9xl opacity-20"></i>
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">Hardware Sync Required</h2>
                <p className="font-bold text-orange-100 leading-relaxed mb-6">
                  Ensure your ESP32 Camera and Arduino UNO are connected via USB before starting the local server. The browser will prompt for Serial access once the dashboard loads.
                </p>
                <div className="flex flex-wrap gap-4">
                  <span className="bg-orange-800/50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Baud: 115200 (ESP32)</span>
                  <span className="bg-orange-800/50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Baud: 9600 (Arduino)</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-16 pb-12 text-center text-stone-600 font-bold uppercase tracking-[0.4em] text-[10px]">
          APULA // Air-Gapped Security Architecture // v2.6.0
        </footer>
      </div>
    </div>
  );
};

export default DownloadPage;
