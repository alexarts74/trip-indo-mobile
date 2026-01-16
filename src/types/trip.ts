export interface Trip {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
  user_id: string;
  created_at: string;
}

export interface TripParticipant {
  id: string;
  trip_id: string;
  user_id: string;
  role: "creator" | "participant";
  created_at: string;
}

export interface CreateTripData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
}

export interface Destination {
  id: string;
  trip_id: string;
  name: string;
  description?: string;
  country?: string;
  price?: number;
  address?: string;
  created_at: string;
}
