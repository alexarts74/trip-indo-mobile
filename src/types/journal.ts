export interface JournalEntry {
  id: string;
  destination_id: string;
  user_id: string;
  title?: string;
  content: string;
  image_urls?: string[];
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface CreateJournalEntryData {
  destination_id: string;
  title?: string;
  content: string;
  image_urls?: string[];
}

export interface UpdateJournalEntryData {
  title?: string;
  content?: string;
  image_urls?: string[];
}
