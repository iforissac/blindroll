'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Send, CheckCircle2, MapPin, User, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Roll } from '@/types';
import { MAJOR_CITIES } from '@/lib/constants';
import CameraView from '@/components/CameraView';
import confetti from 'canvas-confetti';

export default function CameraPage() {
  const params = useParams();
  const router = useRouter();
  const rollId = params.id as string;
  
  const [roll, setRoll] = useState<Roll | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [userInfo, setUserInfo] = useState({ name: '', gender: '', location: '', age: '' });
  const [showCityList, setShowCityList] = useState(false);

  const filteredCities = useMemo(() => {
    if (!userInfo.location) return [];
    return MAJOR_CITIES.filter(c => c.toLowerCase().includes(userInfo.location.toLowerCase()) && c.toLowerCase() !== userInfo.location.toLowerCase()).slice(0, 5);
  }, [userInfo.location]);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.from('rolls').select('*').eq('id', rollId).single();
      if (data) setRoll(data);
      setUserInfo({
        name: localStorage.getItem('blind_roll_user_name') || '',
        gender: localStorage.getItem('blind_roll_user_gender') || '',
        location: localStorage.getItem('blind_roll_user_loc') || '',
        age: localStorage.getItem('blind_roll_user_age') || ''
      });
      setLoading(false);
    }
    init();
  }, [rollId]);

  const handleCapture = useCallback(async (blob: Blob) => {
    if (!roll || uploading || isTransitioning) return;
    setCapturing(false);
    setUploading(true);
    const fileName = `${rollId}/${Date.now()}.jpg`;

    try {
      const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, blob);
      if (uploadError) throw uploadError;

      const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`;

      const { data: nextIdx, error: rpcError } = await supabase.rpc('take_photo_v3', {
        target_roll_id: rollId,
        photo_url: storageUrl,
        p_name: userInfo.name || null,
        p_gender: userInfo.gender || null,
        p_location: userInfo.location || 'Unknown',
        p_user_id: localStorage.getItem('blind_roll_user_uuid'),
        p_age: userInfo.age ? parseInt(userInfo.age) : null
      });

      if (rpcError) throw rpcError;

      // 保存用戶偏好
      localStorage.setItem('blind_roll_user_name', userInfo.name);
      localStorage.setItem('blind_roll_user_gender', userInfo.gender);
      localStorage.setItem('blind_roll_user_loc', userInfo.location);
      localStorage.setItem('blind_roll_user_age', userInfo.age);

      // 紀錄參與紀錄
      const participated = JSON.parse(localStorage.getItem('film_draw_participated') || '[]');
      if (!participated.includes(rollId)) {
          localStorage.setItem('film_draw_participated', JSON.stringify([...participated, rollId]));
      }

      // 重要：邏輯修正
      // 如果是 Duo (max_count=2) 且拍完的是第一張，不清除 ID，這樣用戶回首頁才能看到「分享連結」
      // 如果是 Solo (12張) 或 Duo 且已經拍滿了，則清除 ID
      const isFull = nextIdx >= roll.max_count;
      if (isFull || !roll.is_private) {
          localStorage.removeItem('blind_roll_assigned_id');
      }

      setUploading(false);
      setIsTransitioning(true);
      if (isFull) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => router.push('/'), 3000);
    } catch (err: any) {
      alert(err.message || "Error");
      setUploading(false);
    }
  }, [rollId, uploading, isTransitioning, userInfo, roll, router]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-700 font-mono text-[10px] tracking-[0.5em] animate-pulse uppercase">Syncing Lens...</div>;
  if (!roll) return <div>Not found.</div>;

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50 overflow-hidden font-sans">
      {isTransitioning && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
            <div className="w-full max-w-xs aspect-[4/3] bg-zinc-900 border border-white/5 relative mb-12 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center"><CheckCircle2 className="w-12 h-12 text-zinc-500 opacity-20" /></div>
            </div>
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-[0.4em] italic">Perspective Shared</h3>
                <p className="text-[9px] text-zinc-600 uppercase tracking-[0.3em]">Returning to the collective archives...</p>
            </div>
        </div>
      )}

      <div className="p-6 flex items-center justify-between text-zinc-500 bg-black z-10 border-b border-zinc-900">
        <button onClick={() => router.back()} className="p-1 hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
        <div className="flex flex-col items-center text-center">
          <span className="text-[8px] uppercase tracking-[0.4em] text-zinc-700 mb-1 leading-none">Subject</span>
          <span className="text-xs font-black text-zinc-300 uppercase italic tracking-wider leading-none" style={{ fontFamily: 'var(--font-noto-serif)' }}>{roll.theme}</span>
        </div>
        <div className="text-xs font-black italic text-zinc-800 tracking-tighter w-8">{roll.current_count + 1}/{roll.max_count}</div>

      </div>

      <div className="flex-1 bg-zinc-950 relative overflow-hidden">
        <CameraView isCapturing={capturing} onCapture={handleCapture} />
        {uploading && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-40">
            <Loader2 className="animate-spin text-zinc-500 mb-4 w-6 h-6" />
            <span className="text-zinc-600 font-mono text-[8px] uppercase tracking-[0.6em]">Uploading Segment...</span>
          </div>
        )}
      </div>

      <div className="bg-black flex flex-col items-center pt-6 pb-12 px-6 gap-8 z-10 border-t border-zinc-900">
        <div className="w-full flex items-center gap-3">
            <div className="relative flex-1">
                <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700 rounded-full px-3 py-2.5 focus-within:border-white/40 transition-all">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    <input 
                        type="text" 
                        placeholder="LOCATION"
                        maxLength={50}
                        value={userInfo.location}
                        onFocus={() => setShowCityList(true)}
                        onBlur={() => setTimeout(() => setShowCityList(false), 200)}
                        onChange={(e) => setUserInfo(p => ({ ...p, location: e.target.value }))}
                        className="bg-transparent text-[9px] text-zinc-100 outline-none w-full placeholder:text-zinc-500 font-bold tracking-widest uppercase"
                    />
                </div>
                {showCityList && filteredCities.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800 rounded-xl overflow-hidden z-50 shadow-2xl">
                        {filteredCities.map(city => (
                            <button key={city} onClick={() => setUserInfo(p => ({ ...p, location: city }))} className="w-full text-left px-4 py-3 text-[9px] text-zinc-500 hover:bg-white hover:text-black transition-all border-b border-zinc-800/50 last:border-0 font-bold uppercase tracking-widest">
                                {city}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700 rounded-full px-3 py-2.5 w-28 focus-within:border-white/40 transition-all">
                <User className="w-3 h-3 text-zinc-400" />
                <input 
                    type="text" 
                    placeholder="NAME"
                    maxLength={50}
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(p => ({ ...p, name: e.target.value }))}
                    className="bg-transparent text-[9px] text-zinc-100 outline-none w-full placeholder:text-zinc-500 font-bold tracking-widest uppercase"
                />
            </div>
        </div>

        <div className="w-full flex items-center justify-between">
            <div className="flex flex-col gap-1.5 items-center">
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Gender</span>
                <div className="flex bg-zinc-800 border border-zinc-700 rounded-full overflow-hidden">
                    {['M', 'F', 'N'].map(g => (
                        <button key={g} onClick={() => setUserInfo(p => ({ ...p, gender: g }))} className={`w-8 h-7 flex items-center justify-center text-[8px] font-black transition-all ${userInfo.gender === g ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                            {g}
                        </button>
                    ))}
                </div>
            </div>
            <button 
                onClick={() => setCapturing(true)}
                disabled={capturing || uploading || isTransitioning}
                className="w-24 h-24 rounded-full border-[8px] border-zinc-900 p-1.5 active:scale-90 transition-all hover:border-zinc-800 bg-white shadow-[0_0_30px_rgba(255,255,255,0.15)] relative"
            >
                <div className="w-full h-full rounded-full bg-white border border-zinc-200 shadow-inner flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border border-zinc-100 bg-zinc-50/50"></div>
                </div>
            </button>
            <div className="flex flex-col gap-1.5 items-center">
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Age</span>
                <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-2 w-16 focus-within:border-white/40 transition-all">
                    <input 
                        type="number" 
                        placeholder="--"
                        min="1"
                        max="99"
                        value={userInfo.age}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 99)) {
                                setUserInfo(p => ({ ...p, age: val }));
                            }
                        }}
                        className="bg-transparent text-[10px] text-zinc-100 outline-none w-full text-center placeholder:text-zinc-600 font-black tracking-widest"
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
