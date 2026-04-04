'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Download, Share2, AlertCircle, MapPin, User, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Roll, Photo } from '@/types';

interface PhotoWithMeta extends Photo {
  photographer_name?: string;
  photographer_gender?: string;
  location_name?: string;
  photographer_age?: number;
}

export default function GalleryPage() {
  const params = useParams();
  const router = useRouter();
  const rollId = params.id as string;

  const [roll, setRoll] = useState<Roll | null>(null);
  const [photos, setPhotos] = useState<PhotoWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      const [rollRes, photosRes] = await Promise.all([
        supabase.from('rolls').select('*').eq('id', rollId).single(),
        supabase.from('photos').select('*').eq('roll_id', rollId).order('order_index', { ascending: true })
      ]);

      if (rollRes.data) {
        setRoll(rollRes.data);
        const referenceTime = rollRes.data.completed_at || rollRes.data.created_at;
        const expiry = new Date(referenceTime).getTime() + 48 * 60 * 60 * 1000;
        const diff = expiry - new Date().getTime();
        setTimeLeft(diff > 0 ? `${Math.floor(diff / (1000 * 60 * 60))}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m` : 'Expired');
      }
      if (photosRes.data) setPhotos(photosRes.data);
      setLoading(false);
    }
    fetchData();
  }, [rollId]);

  const handleDownloadAll = async () => {
    for (const [index, photo] of photos.entries()) {
      try {
        const response = await fetch(photo.storage_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `blindroll-${index + 1}.jpg`;
        link.click();
        await new Promise(r => setTimeout(r, 300));
      } catch (e) { console.error(e); }
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-800 font-mono text-[10px] tracking-[0.5em] uppercase">Loading Archives...</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-300 pb-24 font-sans selection:bg-white selection:text-black">
      <header className="p-8 sticky top-0 bg-black/80 backdrop-blur-2xl z-20 border-b border-zinc-900 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="p-2 -ml-2 text-zinc-600 hover:text-white transition-colors"><ChevronLeft className="w-6 h-6" /></button>
        <div className="text-center space-y-1">
          <h1 className="text-xs font-black uppercase italic tracking-[0.3em] text-white leading-none">{roll?.theme}</h1>
          <span className="text-[8px] text-zinc-700 uppercase tracking-[0.5em] block">Collective Memory #{roll?.max_count || 6}</span>
        </div>
        <div className="w-10" />
      </header>

      <div className="bg-zinc-950 p-3 flex items-center justify-center gap-3 text-[9px] text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900">
        <AlertCircle className="w-3 h-3 opacity-50" /> Destroying in {timeLeft}
      </div>

      <main className="max-w-2xl mx-auto px-6 mt-12 space-y-24">
        {photos.map((photo, index) => (
          <article key={photo.id} className="group space-y-6">
            <div className="bg-zinc-900 aspect-[4/3] overflow-hidden rounded-sm shadow-2xl relative">
              <img src={photo.storage_url} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" alt="" />
              <div className="absolute top-4 right-4 text-[10px] font-black italic text-white/10 group-hover:text-white/30 transition-colors">
                FRAME {String(index + 1).padStart(2, '0')}
              </div>
            </div>

            <div className="flex justify-between items-start px-1">
              <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-200 uppercase tracking-widest">
                      <User className="w-3 h-3 text-zinc-700" />
                      {photo.photographer_name || 'ANONYMOUS'} 
                      {photo.photographer_gender && <span className="text-zinc-700">[{photo.photographer_gender}]</span>}
                      {photo.photographer_age && <span className="text-zinc-700 italic">· AGE {photo.photographer_age}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest">
                      <MapPin className="w-3 h-3 text-zinc-800" />
                      {photo.location_name || 'UNKNOWN'}
                  </div>
              </div>
              <div className="text-[14px] font-black text-white italic tracking-tighter opacity-20 group-hover:opacity-100 transition-opacity">
                  {new Date(photo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
              </div>
            </div>
          </article>
        ))}

        <div className="pt-12 flex justify-center gap-8">
          <button onClick={handleDownloadAll} className="flex flex-col items-center gap-3 group">
            <div className="p-5 rounded-full border border-zinc-900 bg-zinc-950 group-hover:border-zinc-500 transition-all">
              <Download className="w-5 h-5 text-zinc-700 group-hover:text-white" />
            </div>
            <span className="text-[8px] uppercase font-black tracking-[0.4em] text-zinc-700 group-hover:text-zinc-400">Download</span>
          </button>
          <button className="flex flex-col items-center gap-3 group">
            <div className="p-5 rounded-full border border-zinc-900 bg-zinc-950 group-hover:border-zinc-500 transition-all">
              <Share2 className="w-5 h-5 text-zinc-700 group-hover:text-white" />
            </div>
            <span className="text-[8px] uppercase font-black tracking-[0.4em] text-zinc-700 group-hover:text-zinc-400">Share</span>
          </button>
        </div>

        <footer className="py-24 text-[8px] text-zinc-900 font-mono text-center uppercase tracking-[0.6em] leading-relaxed italic">
          Shared vision from twelve strangers.<br />
          The roll is now complete.
        </footer>
      </main>
    </div>
  );
}
