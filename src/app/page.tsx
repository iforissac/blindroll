'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Image as ImageIcon, ChevronRight, Zap, Camera, Clock, Timer, Users, Share2, UserPlus, X } from "lucide-react";
import { drawCamera, createDuoRoll } from '@/lib/actions';
import { supabase } from '@/lib/supabase';
import { Roll } from '@/types';
import { THEMES } from '@/lib/constants';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeRolls, setActiveRolls] = useState<Roll[]>([]);
  const [completedRolls, setCompletedRolls] = useState<Roll[]>([]);
  const [currentMission, setCurrentMission] = useState<any>(null);
  const [fetchingData, setFetchingData] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  const [showDuoInput, setShowDuoInput] = useState(false);
  const [customTheme, setCustomTheme] = useState('');

  const getUserId = () => {
    let id = localStorage.getItem('blind_roll_user_uuid');
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('blind_roll_user_uuid', id);
    }
    return id;
  };

  useEffect(() => {
    async function fetchData() {
      const userId = getUserId();
      const { data: completed } = await supabase.from('rolls').select('*').eq('is_full', true).order('created_at', { ascending: false }).limit(10);
      if (completed) setCompletedRolls(completed);

      const participatedIds = JSON.parse(localStorage.getItem('film_draw_participated') || '[]');
      if (participatedIds.length > 0) {
        const { data: active } = await supabase.from('rolls').select('*').in('id', participatedIds).eq('is_full', false);
        if (active) setActiveRolls(active);
      }

      const assignedId = localStorage.getItem('blind_roll_assigned_id');
      if (assignedId) {
        const { data: reservation } = await supabase.from('reservations').select('*, rolls(*)').eq('roll_id', assignedId).eq('user_id', userId).gt('expires_at', new Date().toISOString()).single();
        if (reservation) {
          setCurrentMission({ ...reservation.rolls, expires_at: reservation.expires_at });
        } else {
          const { data: privRoll } = await supabase.from('rolls').select('*').eq('id', assignedId).eq('is_full', false).single();
          if (privRoll) setCurrentMission(privRoll);
          else localStorage.removeItem('blind_roll_assigned_id');
        }
      }
      setFetchingData(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!currentMission?.expires_at) return;
    const interval = setInterval(() => {
      const diff = new Date(currentMission.expires_at).getTime() - Date.now();
      if (diff <= 0) {
        localStorage.removeItem('blind_roll_assigned_id');
        setCurrentMission(null);
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentMission]);

  const handleDraw = async (type: 'solo' | 'duo') => {
    setLoading(true);
    try {
      const roll = await drawCamera(getUserId(), type === 'duo' ? customTheme : undefined);
      localStorage.setItem('blind_roll_assigned_id', roll.id);
      setCurrentMission(roll);
      setShowDuoInput(false);
      setCustomTheme('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/invite/${currentMission.id}`;
    navigator.clipboard.writeText(url);
    alert("專屬邀請函連結已複製！傳給你的朋友，讓他們完成另一半。");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* Duo Input Modal (僅用於自擬題目，揭曉則會在正方格進行) */}
      {showDuoInput && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <button onClick={() => setShowDuoInput(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            <div className="space-y-8 max-w-xs w-full">
                <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-[0.5em] text-zinc-500 font-bold">Duo Custom Subject</span>
                    <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">自擬雙人題目</h2>
                </div>
                <div className="space-y-4">
                    <input autoFocus type="text" placeholder="例如：我們的晚餐 (留空則隨機)" maxLength={10} value={customTheme} onChange={(e) => setCustomTheme(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-center text-sm font-bold text-white outline-none focus:border-white/20 transition-all placeholder:text-zinc-700" />
                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest">Max 10 Characters</p>
                </div>
                <button onClick={() => handleDraw('duo')} disabled={loading} className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] hover:bg-zinc-200 transition-all disabled:opacity-50">{loading ? 'Creating...' : 'Initialize Duo Roll'}</button>
            </div>
        </div>
      )}

      <main className="max-w-md w-full flex flex-col items-center gap-16 text-center py-16">
        <header className="space-y-3">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic opacity-95">BlindRoll</h1>
          <p className="text-zinc-600 text-[9px] uppercase tracking-[0.6em] font-medium leading-relaxed">Collaborative Photography Experiment</p>
        </header>

        {/* 核心玩法說明 */}
        <section className="max-w-[320px] space-y-8">
            <div className="space-y-6 text-zinc-300" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                <p className="text-[13px] font-medium leading-relaxed tracking-wide text-zinc-200">
                    受「六度分隔理論」啟發，我們相信六個陌生的視角，足以串聯起整個世界。
                </p>
                <p className="text-[12px] font-medium leading-relaxed text-zinc-400">
                    認領主題並完成拍攝，剩下的空白將留給其他旅人。當六份視角匯合，即可查看不同眼睛下的共同世界。
                </p>
                
                <div className="space-y-4 pt-2">
                    <p className="text-[11px] font-medium leading-relaxed text-zinc-500 border-l border-zinc-900 pl-4 text-left">
                        領取主題後，你有 3 小時的時間按下快門。逾時名額將會自動釋出，但別擔心，你隨時可以重新參與。
                    </p>
                    <p className="text-[11px] font-medium leading-relaxed text-zinc-500 border-l border-zinc-900 pl-4 text-left">
                        當菲林圓滿，集體創作的成果便會揭曉。所有照片僅存放 48 小時——因為唯有消逝，回憶才有重量。
                    </p>
                </div>

                <div className="pt-2">
                    <p className="text-[8px] text-zinc-600 font-medium uppercase tracking-[0.2em] leading-normal">
                        Claim a subject to start; we leave the remaining blanks for others to fill. 
                        Once six visions converge, witness the world through these different eyes.
                    </p>
                </div>
            </div>
            <div className="h-px w-6 bg-zinc-900 mx-auto" />
        </section>

        {/* 當前任務區 (現在任務會直接在此展開) */}
        <section className="w-full min-h-[350px]">
          {currentMission ? (
            <div className="w-full aspect-square border border-white/10 flex flex-col items-center justify-center gap-8 relative bg-zinc-900/20 backdrop-blur-sm shadow-2xl animate-in zoom-in-95 fade-in duration-700">
                <div className="absolute top-6 flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                    <Timer className="w-3 h-3 text-amber-500 animate-pulse" />
                    <span className="text-[9px] uppercase tracking-[0.2em] text-amber-500 font-black">{timeLeft}</span>
                </div>
                <div className="space-y-3 px-6">
                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase flex items-center justify-center gap-3" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                        {currentMission.theme}
                        {currentMission.is_private && <Users className="w-5 h-5 text-amber-500/40" />}
                    </h2>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-medium italic">
                        {THEMES.find(t => t.zh === currentMission.theme)?.en || 'Custom Subject'}
                    </p>
                </div>
                <div className="flex flex-col gap-3 w-full px-12">
                    <button onClick={async () => {
                        const { data } = await supabase.from('rolls').select('is_full').eq('id', currentMission.id).single();
                        if (data?.is_full) { alert("任務已完成！"); localStorage.removeItem('blind_roll_assigned_id'); setCurrentMission(null); }
                        else router.push(`/camera/${currentMission.id}`);
                    }} className="flex items-center justify-center gap-3 w-full py-4 bg-white text-black rounded-full hover:scale-105 transition-all shadow-xl"><Camera className="w-4 h-4 fill-black" /><span className="text-[10px] font-black uppercase tracking-widest">Open Lens</span></button>
                    {currentMission.is_private && currentMission.current_count >= 1 && (
                        <button onClick={handleShare} className="flex items-center justify-center gap-3 w-full py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full hover:bg-zinc-800 transition-all"><Share2 className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Invite Friend</span></button>
                    )}
                </div>
                <div className="absolute bottom-6 text-[8px] text-zinc-700 font-mono tracking-widest uppercase italic">{currentMission.is_private ? 'Duo Resonance' : `Frame #${currentMission.current_count + 1} / 12`}</div>
            </div>
          ) : (
            <div className="grid gap-4 w-full h-full animate-in fade-in duration-500">
                <button onClick={() => handleDraw('solo')} disabled={loading} className="w-full aspect-square border border-zinc-900 flex flex-col items-center justify-center gap-4 group hover:border-zinc-700 transition-all relative overflow-hidden">
                    {loading ? <Loader2 className="w-8 h-8 animate-spin text-zinc-800" /> : (
                        <>
                            <div className="w-12 h-12 rounded-full border border-zinc-900 flex items-center justify-center group-hover:border-zinc-500"><Zap className="w-5 h-5 text-zinc-800 group-hover:text-white" /></div>
                            <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-zinc-700 group-hover:text-zinc-400">Join Solo Experiment</span>
                        </>
                    )}
                </button>
                <div className="space-y-3">
                    <button onClick={() => setShowDuoInput(true)} disabled={loading} className="w-full py-4 border border-zinc-900 text-zinc-600 flex items-center justify-center gap-3 hover:text-white hover:border-zinc-500 transition-all"><Users className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-[0.4em]">Start Duo Journey</span></button>
                    <p className="text-[8px] text-zinc-800 uppercase tracking-widest font-medium">Create a private roll for two. Invite a friend to capture the other half.</p>
                </div>
            </div>
          )}
        </section>

        {/* Collective In-Progress */}
        {activeRolls.filter(r => r.id !== currentMission?.id).length > 0 && (
          <section className="w-full space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <h2 className="text-[9px] uppercase tracking-[0.4em] text-zinc-500 font-bold italic">Collective In-Progress</h2>
              <Users className="w-3.5 h-3.5 text-zinc-800" />
            </div>
            <div className="grid gap-6">
              {activeRolls.filter(r => r.id !== currentMission?.id).map((roll) => {
                const progress = Math.round((roll.current_count / roll.max_count) * 100);
                return (
                  <div key={roll.id} className="group cursor-default space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[12px] font-black text-zinc-300 uppercase italic tracking-tighter flex items-center gap-2" style={{ fontFamily: 'var(--font-noto-serif)' }}>{roll.theme}{roll.is_private && <Users className="w-3 h-3 text-zinc-600" />}</span>
                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest leading-none">Waiting for {roll.max_count - roll.current_count} more strangers</div>
                      </div>
                      <div className="text-right"><span className="text-lg font-black text-zinc-700 group-hover:text-zinc-400 transition-colors">{progress}%</span></div>
                    </div>
                    <div className="w-full h-[2px] bg-zinc-950 relative overflow-hidden"><div className="absolute inset-0 bg-zinc-900" /><div className="absolute top-0 left-0 h-full bg-zinc-600 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Archives */}
        <section className="w-full space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <h2 className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-bold">Archives</h2>
            <ImageIcon className="w-3.5 h-3.5 text-zinc-900" />
          </div>
          {fetchingData ? (
            <div className="py-8 flex justify-center"><Loader2 className="animate-spin w-4 h-4 text-zinc-900" /></div>
          ) : completedRolls.length > 0 ? (
            <div className="grid gap-2">
              {completedRolls.map((roll) => {
                // 改用 completed_at 計算 48 小時
                const referenceTime = roll.completed_at || roll.created_at;
                const expiry = new Date(referenceTime).getTime() + 48 * 60 * 60 * 1000;
                const hoursLeft = Math.max(0, Math.floor((expiry - new Date().getTime()) / (1000 * 60 * 60)));

                return (
                  <button key={roll.id} onClick={() => router.push(`/gallery/${roll.id}`)} className="flex items-center justify-between py-4 border-b border-zinc-900/50 hover:px-2 transition-all group relative">
                    <div className="flex flex-col text-left truncate pr-4">
                        <span className="text-[11px] font-medium text-zinc-500 group-hover:text-white transition-colors italic uppercase flex items-center gap-2" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                            {roll.theme}{roll.is_private && <Users className="w-3 h-3 text-zinc-700" />}
                        </span>
                        <span className="text-[7px] text-zinc-800 uppercase tracking-widest mt-1">
                            {hoursLeft}h until destruction
                        </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-900 group-hover:text-zinc-500 transition-colors" />
                  </button>
                );
              })}

            </div>
          ) : (
            <p className="py-8 text-[9px] text-zinc-900 uppercase tracking-widest italic text-center">Empty Archives.</p>
          )}
        </section>

        <footer className="mt-16 text-[8px] text-zinc-900 uppercase tracking-[0.6em] leading-relaxed max-w-[240px] font-serif italic text-center mx-auto">Six stranger perspectives,<br />One shared vision.</footer>
      </main>
    </div>
  );
}
