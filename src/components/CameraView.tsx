'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCcw } from 'lucide-react';

interface CameraViewProps {
  onCapture: (blob: Blob) => void;
  isCapturing: boolean;
}

export default function CameraView({ onCapture, isCapturing }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');

  useEffect(() => {
    async function getDevices() {
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        const vds = all.filter(d => d.kind === 'videoinput');
        setDevices(vds);
        if (vds.length > 0 && !currentDeviceId) {
          const real = vds.find(d => !d.label.toLowerCase().includes('obs')) || vds[0];
          setCurrentDeviceId(real.deviceId);
        }
      } catch (e) { console.error(e); }
    }
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => { s.getTracks().forEach(t => t.stop()); getDevices(); })
      .catch(() => setError("請授權相機權限"));
  }, []);

  useEffect(() => {
    if (!currentDeviceId) return;
    let stream: MediaStream | null = null;
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: currentDeviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (e) { setError("無法啟動相機"); }
    }
    start();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [currentDeviceId]);

  useEffect(() => {
    if (isCapturing && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(b => b && onCapture(b), 'image/jpeg', 0.9);
      }
    }
  }, [isCapturing, onCapture]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
      {error ? <div className="text-white text-xs p-8 text-center">{error}</div> : (
        <>
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          
          {devices.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setCurrentDeviceId(devices[(devices.findIndex(d => d.deviceId === currentDeviceId) + 1) % devices.length].deviceId); }}
              className="absolute bottom-24 right-6 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white z-50 active:rotate-180 transition-all"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          )}

          {isCapturing && <div className="absolute inset-0 bg-white animate-flash z-50" />}
        </>
      )}
    </div>
  );
}
