
import React, { useState, useRef, useEffect } from 'react';
import { CameraSource } from '../types';

/**
 * Senior Note: Direct RTSP in browser is not possible due to protocol restrictions.
 * This implementation utilizes a WebRTC bridge pattern (e.g., webrtc-streamer).
 * It attempts to negotiate a PeerConnection with the RTSP gateway on the provided IP.
 */
const CameraFeed: React.FC = () => {
  const [source, setSource] = useState<CameraSource>(CameraSource.WEBCAM);
  const [rtspUrl, setRtspUrl] = useState('');
  const [isRtspConnecting, setIsRtspConnecting] = useState(false);
  const [connectionLog, setConnectionLog] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const log = (msg: string) => setConnectionLog(prev => [msg, ...prev.slice(0, 4)]);

  useEffect(() => {
    // Cleanup on source change
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (source === CameraSource.WEBCAM) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => {
          console.error("Webcam Access Error:", err);
          log("Webcam access denied");
        });
    }
  }, [source]);

  const handleRtspConnect = async () => {
    if (!rtspUrl) return;
    setIsRtspConnecting(true);
    setConnectionLog([]);
    log("Initializing RTSP Tunnel...");

    try {
      // Step 1: Detect IP from RTSP URL
      const match = rtspUrl.match(/rtsp:\/\/([^:/]+)/);
      if (!match) {
        log("Invalid RTSP URL Format");
        setIsRtspConnecting(false);
        return;
      }
      const ip = match[1];
      log(`Target IP: ${ip}`);

      // Step 2: Connect to local WebRTC Gateway (webrtc-streamer)
      // Defaults to localhost:8001 (Option B) if not specified
      const STREAMER_URL = import.meta.env.VITE_WEBRTC_GATEWAY || "http://localhost:8001"; 
      log(`Gateway: ${STREAMER_URL}`);
      log(`Contacting Gateway...`);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      peerConnectionRef.current = pc;

      pc.ontrack = (event) => {
        log("Stream received!");
        setStream(event.streams[0]);
        if (videoRef.current) {
             videoRef.current.srcObject = event.streams[0];
        }
        setIsRtspConnecting(false);
      };

      // Create Offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      // Call webrtc-streamer
      const peerId = Math.random().toString(36).substring(7);
      const apiUrl = `${STREAMER_URL}/api/call?peerid=${peerId}&url=${encodeURIComponent(rtspUrl)}`;

      const response = await fetch(apiUrl, {
          method: "POST",
          body: JSON.stringify(offer),
          headers: { "Content-Type": "application/json" } // webrtc-streamer expects JSON of RTCSessionDescription
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`404 Not Found at ${apiUrl}. Is webrtc-streamer running on port ${STREAMER_URL.split(':').pop()}?`);
        }
        throw new Error(`Gateway Error: ${response.status} ${response.statusText}`);
      }
      
      const answer = await response.json();
      await pc.setRemoteDescription(answer);
      
      log("Tunnel Established - Waiting for tracks...");

    } catch (err: any) {
      console.error(err);
      log("Connection Failed");
      log(err.message || "Unknown Error");
      log("Check RTSP_SETUP.md in project root");
      setIsRtspConnecting(false);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    }
  };

  const sourceColors: Record<CameraSource, string> = {
    [CameraSource.WIFI]: 'bg-blue-600',
    [CameraSource.BLUETOOTH]: 'bg-purple-600',
    [CameraSource.WEBCAM]: 'bg-emerald-600',
    [CameraSource.RTSP]: 'bg-orange-600'
  };

  return (
    <div className="bg-stone-900 rounded-[25px] md:rounded-[35px] overflow-hidden border-4 md:border-10 border-orange-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-full flex flex-col relative transition-all">
      {/* Top Header Controls */}
      <div className="p-3 md:p-5 bg-stone-800 flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-center border-b-4 border-stone-700 z-10">
        <div className="flex items-center gap-2 md:gap-3 self-start sm:self-auto">
          <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full status-pulse ${source === CameraSource.WEBCAM || isRtspConnecting ? 'bg-red-500' : 'bg-stone-500'}`}></div>
          <span className="text-[11px] md:text-sm font-black uppercase text-white tracking-widest">
            {source === CameraSource.RTSP ? 'Network Stream' : `Local ${source.split(' ')[0]}`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.values(CameraSource).map(src => (
            <button
              key={src}
              onClick={() => setSource(src)}
              className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[9px] md:text-[11px] font-black uppercase transition-all transform active:scale-95 ${
                source === src ? `${sourceColors[src]} text-white shadow-lg scale-105` : 'bg-stone-700 text-stone-400 hover:bg-stone-600 hover:text-stone-200'
              }`}
            >
              {src.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
      
      {/* RTSP Input Panel */}
      {source === CameraSource.RTSP && (
        <div className="p-4 bg-stone-800 border-b-4 border-stone-900 flex flex-col gap-3 z-10 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
            <div className="relative flex-grow w-full">
              <i className="fa-solid fa-satellite-dish absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 text-sm"></i>
              <input 
                type="text" 
                placeholder="rtsp://ip:port/h264_pcm.sdp"
                value={rtspUrl}
                onChange={(e) => setRtspUrl(e.target.value)}
                className="w-full bg-black border border-stone-700 text-orange-400 pl-10 pr-4 py-3 rounded-xl font-bold text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner"
              />
            </div>
            <button 
              onClick={handleRtspConnect}
              disabled={isRtspConnecting}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-lg active:translate-y-1 transition-all disabled:opacity-50"
            >
              {isRtspConnecting ? <i className="fa-solid fa-sync fa-spin mr-2"></i> : <i className="fa-solid fa-plug mr-2"></i>}
              Link
            </button>
          </div>
          <div className="flex flex-col gap-1">
             <div className="text-[9px] text-stone-500 font-bold uppercase flex items-center gap-2 px-1">
                <i className="fa-solid fa-shield-halved text-emerald-500"></i>
                WebRTC Gateway Bridge Protocol Active
             </div>
             {connectionLog.length > 0 && (
                <div className="bg-black/50 p-2 rounded-lg text-[8px] font-mono text-stone-400 mt-2 border border-white/5 space-y-1">
                   {connectionLog.map((l, i) => (
                     <div key={i} className={i === 0 ? "text-orange-500" : ""}>[{new Date().toLocaleTimeString()}] {l}</div>
                   ))}
                </div>
             )}
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <div className="relative flex-grow bg-black flex items-center justify-center min-h-[250px] overflow-hidden group">
        {(source === CameraSource.WEBCAM || (source === CameraSource.RTSP && stream)) ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center text-stone-800 p-10 text-center select-none">
            <div className="relative mb-6 md:mb-10">
              <i className={`fa-solid ${source === CameraSource.WIFI ? 'fa-wifi' : source === CameraSource.BLUETOOTH ? 'fa-bluetooth' : 'fa-network-wired'} text-7xl md:text-9xl ${isRtspConnecting ? 'animate-bounce text-orange-500' : 'animate-pulse text-stone-700'}`}></i>
              <div className={`absolute inset-0 blur-3xl rounded-full transition-all duration-1000 ${isRtspConnecting ? 'bg-orange-500/20' : 'bg-stone-500/10'}`}></div>
            </div>
            <p className="font-black text-xl md:text-4xl uppercase tracking-tighter text-stone-500">
              {isRtspConnecting ? 'NEGOTIATING PEER' : `AWAITING ${source.split(' ')[0]}`}
            </p>
            <p className="text-[10px] md:text-base font-bold text-stone-600 mt-4 uppercase max-w-sm tracking-widest leading-relaxed">
              Target Link: {rtspUrl || 'UNSPECIFIED'}
            </p>
          </div>
        )}
        
        {/* Hud Overlays */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 pointer-events-none z-20 space-y-2">
          <div className="bg-red-600 text-white px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-black rounded-lg shadow-xl flex items-center gap-2 italic">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            LIVE: {source === CameraSource.RTSP ? 'REMOTE_TUNNEL' : 'LOCAL_HARDWARE'}
          </div>
          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[8px] font-mono text-orange-500/70 border border-white/5 uppercase">
            RES: 1080P // LAT: {isRtspConnecting ? 'SYNC' : '6MS'}
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
