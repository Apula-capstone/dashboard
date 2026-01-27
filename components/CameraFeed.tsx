
import React, { useRef } from 'react';

const CameraFeed: React.FC<{ serialImage?: string; isWireless?: boolean; wirelessUrl?: string }> = ({ serialImage, isWireless, wirelessUrl }) => {
  const sourceColors = { SERIAL: 'bg-yellow-600', WIRELESS: 'bg-emerald-600' } as const;

  return (
    <div className="bg-stone-900 rounded-[25px] md:rounded-[35px] overflow-hidden border-4 md:border-10 border-orange-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-full flex flex-col relative transition-all">
      <div className="p-3 md:p-5 bg-stone-800 flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-center border-b-4 border-stone-700 z-10">
        <div className="flex items-center gap-2 md:gap-3 self-start sm:self-auto">
          <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full status-pulse ${isWireless && wirelessUrl ? 'bg-emerald-500' : serialImage ? 'bg-yellow-500' : 'bg-stone-500'}`}></div>
          <span className="text-[11px] md:text-sm font-black uppercase text-white tracking-widest">
            {isWireless ? 'Wireless ESP32 Camera' : 'Serial ESP32 Camera'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {isWireless && wirelessUrl && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">
              IP: {wirelessUrl.replace('http://', '').split('/')[0]}
            </div>
          )}
        </div>
      </div>
      
      {/* Main Viewport */}
      <div className="relative flex-grow bg-black flex items-center justify-center min-h-[250px] overflow-hidden group">
        {isWireless && wirelessUrl ? (
          <img 
            src={wirelessUrl} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Wireless Feed"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x480?text=SIGNAL+LOST';
            }}
          />
        ) : serialImage ? (
          <img 
            src={serialImage} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Serial Feed"
          />
        ) : (
          <div className="flex flex-col items-center text-stone-800 p-10 text-center select-none">
            <div className="relative mb-6 md:mb-10">
              <i className={`fa-solid ${isWireless ? 'fa-wifi' : 'fa-network-wired'} text-7xl md:text-9xl animate-pulse text-stone-700`}></i>
              <div className="absolute inset-0 blur-3xl rounded-full transition-all duration-1000 bg-stone-500/10"></div>
            </div>
            <p className="font-black text-xl md:text-4xl uppercase tracking-tighter text-stone-500">
              {isWireless ? 'Awaiting Wireless Link' : 'Awaiting Serial Frames'}
            </p>
            <p className="text-[10px] md:text-base font-bold text-stone-600 mt-4 uppercase max-w-sm tracking-widest leading-relaxed">
              {isWireless ? 'Configure IP in the Control Panel' : 'Connect ESP32 in the Control Panel'}
            </p>
          </div>
        )}
        
        {/* Hud Overlays */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 pointer-events-none z-20 space-y-2">
          <div className="bg-red-600 text-white px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-black rounded-lg shadow-xl flex items-center gap-2 italic">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            LIVE: {isWireless ? 'WIRELESS_SYNC' : 'LOCAL_HARDWARE'}
          </div>
          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[8px] font-mono text-orange-500/70 border border-white/5 uppercase">
            RES: {isWireless ? '720P' : '1080P'} // LAT: {isWireless ? '24MS' : '6MS'}
          </div>
        </div>

        {/* Viewfinder corners */}
        <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-white/20 rounded-tr-3xl pointer-events-none group-hover:border-orange-500/40 transition-colors"></div>
        <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-white/20 rounded-bl-3xl pointer-events-none group-hover:border-orange-500/40 transition-colors"></div>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default CameraFeed;
