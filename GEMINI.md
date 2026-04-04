# FilmDraw (抽菲林) - 專案核心指南

## 專案願景
一個模仿復古菲林相機、強調「不可逆性」與「隨機協作」的網頁應用。

## 技術棧 (Stack)
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage, Realtime)
- **Camera API**: `navigator.mediaDevices.getUserMedia`
- **Processing**: HTML5 Canvas (即時濾鏡與照片處理)

## 核心規則
- 每卷菲林固定 **12 張**。
- **單一主題與濾鏡**：每卷隨機產生一個主題與固定濾鏡，參與者無法手動選擇。
- **隨機協作**：用戶點擊「抽一部相機」後，系統分配目前未滿的菲林卷中的一張配額。
- **即時通知**：當整卷拍滿時，所有參與者收到通知，並可在專屬相簿查看成果。

## 資料庫結構 (Supabase)
- `rolls`: `id`, `theme`, `filter_style`, `is_full`, `created_at`
- `photos`: `id`, `roll_id`, `user_id`, `storage_url`, `order_index`, `created_at`
- `participants`: `roll_id`, `user_id`, `last_notified`

## 待辦清單 (Roadmap)
- [ ] 基礎 Setup (Supabase Client, Types)
- [ ] 「抽菲林」隨機分配邏輯
- [ ] 行動優先相機組件 (With Canvas Filter)
- [ ] Supabase Storage 照片上傳流
- [ ] 菲林卷相簿展示
- [ ] 實時通知機制 (Supabase Realtime)
