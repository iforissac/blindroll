'use strict';

import { supabase } from './supabase';
import { THEMES } from './constants';
import { Roll } from '@/types';

// 隨機分配公開卷
export async function drawCamera(userId: string) {
  const { data: assigned, error: rpcError } = await supabase.rpc('assign_mission_v2', { p_user_id: userId });

  if (assigned) {
    return { ...assigned, expires_at: assigned.expires_at } as any;
  }

  const randomThemeObj = THEMES[Math.floor(Math.random() * THEMES.length)];
  const { data: newRoll, error: insertError } = await supabase
    .from('rolls')
    .insert([{ 
        theme: randomThemeObj.zh, 
        filter_style: 'standard', 
        current_count: 0, 
        max_count: 6, // 從 12 改為 6
        is_private: false 
    }])
    .select().single();

  if (insertError) {
    console.error("Solo Roll Insert Error:", insertError);
    throw new Error("無法建立公開卷，請檢查資料庫欄位 (is_private)");
  }

  const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
  await supabase.from('reservations').insert({ roll_id: newRoll.id, user_id: userId, expires_at: expiresAt });

  return { ...newRoll, expires_at: expiresAt };
}

// 發起雙人專屬卷 (2張完賽)
export async function createDuoRoll(userId: string, customTheme?: string) {
  const randomThemeObj = THEMES[Math.floor(Math.random() * THEMES.length)];
  const finalTheme = customTheme?.trim() || randomThemeObj.zh;

  const { data: newRoll, error: insertError } = await supabase
    .from('rolls')
    .insert([{ 
        theme: finalTheme, 
        filter_style: 'standard', 
        current_count: 0, 
        max_count: 2, 
        is_private: true 
    }])
    .select().single();

  if (insertError || !newRoll) {
    console.error("Duo Roll Insert Error:", insertError);
    alert("建立失敗：請確保已在 Supabase 執行 SQL 增加 'is_private' 欄位。");
    throw new Error("Duo Roll creation failed");
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error: resError } = await supabase.from('reservations').insert({ 
    roll_id: newRoll.id, 
    user_id: userId, 
    expires_at: expiresAt 
  });

  if (resError) console.error("Reservation Error:", resError);

  return { ...newRoll, expires_at: expiresAt };
}
