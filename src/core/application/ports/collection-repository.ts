export interface CollectionRecord {
  user_id: string;
  card_id: string;
  is_duplicate: boolean;
  source?: string;
  collected_at?: string;
}

export interface CollectionRepository {
  getCollection(userId: string): Promise<CollectionRecord[]>;
  addCard(userId: string, cardId: string, source?: string): Promise<void>;
  removeDuplicate(userId: string, cardId: string): Promise<void>;
  isCollected(userId: string, cardId: string): Promise<boolean>;
  getDuplicates(userId: string): Promise<string[]>;
}
