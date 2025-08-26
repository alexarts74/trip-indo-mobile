import React, { createContext, useContext, useState, ReactNode } from "react";
import { Trip } from "../types/trip";

interface TripContextType {
  selectedTrip: Trip | null;
  setSelectedTrip: (trip: Trip | null) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  return (
    <TripContext.Provider value={{ selectedTrip, setSelectedTrip }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
}
