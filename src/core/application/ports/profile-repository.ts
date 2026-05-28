export interface ProfileDTO {
  id: string;
  display_name?: string;
  avatar_url?: string;
  country?: string;
  reputation?: number;
  badge_tier?: string;
  created_at?: string;
}

export interface ProfileStats {
  totalCollected: number;
  totalDuplicates: number;
  totalTrades: number;
  reputation: number;
}

export interface ProfileRepository {
  getProfile(userId: string): Promise<ProfileDTO | null>;
  updateProfile(userId: string, data: Partial<Pick<ProfileDTO, "display_name" | "avatar_url" | "country">>): Promise<void>;
  getStats(userId: string): Promise<ProfileStats>;
}
