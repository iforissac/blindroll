'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { THEMES } from '@/lib/constants';
import { Loader2, Camera, Users } from 'lucide-react';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const rollId = params.id as string;
  const [roll, setRoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoll() {
      const { data } = await supabase.from('rolls').select('*').eq('id', rollId).single();
      if (data) setRoll(data);
      setLoading(false);
    }
    fetchRoll();
  }, [rollId]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-800 font-mono text-[10px] tracking-[0.5em] uppercase">Checking Invitation...</div>;
  if (!roll || roll.is_full) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-center p-8">這卷任務已被完成或失效。</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center font-sans selection:bg-white selection:text-black">
      <div className="space-y-16 max-w-xs w-full animate-in fade-in duration-1000">
        <div className="space-y-6">
            <span className="text-[9px] uppercase tracking-[0.6em] text-amber-500 font-bold animate-pulse">Special Invitation</span>
            <div className="space-y-3">
                <h1 className="text-5xl font-black italic tracking-tighter text-white" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                    {roll.theme}
                </h1>
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-medium">
                    {THEMES.find(t => t.zh === roll.theme)?.en || 'Custom Subject'}
                </p>
            </div>
        </div>

        <div className="h-px w-8 bg-zinc-900 mx-auto" />

        <div className="space-y-10">
            <div className="space-y-4">
                <p className="text-[11px] text-zinc-400 leading-loose font-serif uppercase tracking-[0.2em]">
                    一位朋友正邀請你參與這場攝影實驗。<br />
                    你的視角，將是這卷作品的最後一塊拼圖。
                </p>
                <div className="text-[8px] text-zinc-700 font-mono tracking-widest uppercase">
                    Slot #2 of 2 Available
                </div>
            </div>

            <button 
                onClick={() => router.push(`/camera/${rollId}`)} 
                className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.5em] text-[11px] hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
                Accept & Open Lens
            </button>
        </div>

        <footer className="pt-12 text-[8px] text-zinc-900 uppercase tracking-[0.6em] leading-relaxed italic">
          Perspective is a shared gift.
        </footer>
      </div>
    </div>
  );
}
