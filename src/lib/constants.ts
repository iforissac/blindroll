export interface ThemeModel {
  zh: string;
  en: string;
}

export const THEMES: ThemeModel[] = [
  { zh: "孤獨的背面", en: "Solitude from Behind" },
  { zh: "光影邊界", en: "Edges of Light & Shadow" },
  { zh: "城市呼吸", en: "The City's Breath" },
  { zh: "時間痕跡", en: "Traces of Time" },
  { zh: "遺忘角落", en: "Forgotten Corners" },
  { zh: "日常陌生感", en: "Uncanny Daily Life" },
  { zh: "色彩律動", en: "Rhythm of Colors" },
  { zh: "溫暖瞬間", en: "Moments of Warmth" },
  { zh: "幾何秩序", en: "Geometry & Order" },
  { zh: "失焦", en: "Out-of-Focus" },
  { zh: "等待", en: "Waiting" },
  { zh: "反射倒影", en: "Reflections" },
  { zh: "距離", en: "Distance" },
  { zh: "生命力", en: "Growth" },
  { zh: "午夜寂靜", en: "Midnight Silence" },
  { zh: "框架世界", en: "World in Frames" },
  { zh: "純粹質地", en: "Pure Textures" },
  { zh: "流動", en: "Flowing" },
  { zh: "消失", en: "Vanishing" },
  { zh: "奇蹟", en: "Miracle" }
];

export const MAJOR_CITIES = [
  "Taiwan", "Hong Kong", "Macau", "China", "Japan", "South Korea", 
  "Singapore", "Malaysia", "Thailand", "United Kingdom", "USA", "Canada", "Australia",
  "Taipei, Taiwan", "New Taipei, Taiwan", "Taoyuan, Taiwan", "Taichung, Taiwan", 
  "Tainan, Taiwan", "Kaohsiung, Taiwan", "Keelung, Taiwan", "Hsinchu, Taiwan", 
  "Chiayi, Taiwan", "Changhua, Taiwan", "Pingtung, Taiwan", "Yilan, Taiwan", 
  "Hualien, Taiwan", "Taitung, Taiwan", "Miaoli, Taiwan", "Nantou, Taiwan", 
  "Yunlin, Taiwan", "Penghu, Taiwan", "Kinmen, Taiwan", "Matsu, Taiwan",
  "Tokyo, Japan", "Osaka, Japan", "Kyoto, Japan", "Fukuoka, Japan", "Sapporo, Japan",
  "Seoul, Korea", "Busan, Korea", "Singapore City", "Kuala Lumpur", "Bangkok",
  "London, UK", "Paris, France", "Berlin, Germany", "Rome, Italy",
  "New York, USA", "Los Angeles, USA", "San Francisco, USA", "Vancouver, Canada", "Toronto, Canada",
  "Sydney, Australia", "Melbourne, Australia", "Shanghai, China", "Beijing, China", "Shenzhen, China"
].sort();
