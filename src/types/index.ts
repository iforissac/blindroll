export type FilterStyle = 
  | 'kodak-portra-400-vc' 
  | 'fuji-superia-400' 
  | 'ilford-delta-3200' 
  | 'kodak-portra-160-nc' 
  | 'fuji-neopan-1600';

export interface Roll {
  id: string;
  theme: string;
  filter_style: FilterStyle;
  is_full: boolean;
  current_count: number;
  max_count: number;
  created_at: string;
}

export interface Photo {
  id: string;
  roll_id: string;
  user_id: string;
  storage_url: string;
  order_index: number;
  created_at: string;
  photographer_name?: string;
  photographer_gender?: string;
  location_name?: string;
}
