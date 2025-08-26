export interface Destination {
  id: string;
  name: string;
  description: string;
  address: string;
  price: number;
  trip_id: string;
  created_at: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  destination_id: string;
  created_at: string;
}

export interface TripParticipant {
  id: string;
  trip_id: string;
  user_id: string;
  role: "creator" | "participant";
  created_at: string;
  user?: {
    email: string;
    id: string;
  };
}

export interface Expense {
  id: string;
  trip_id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  trip_id: string;
  from_user_id: string;
  to_user_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}
