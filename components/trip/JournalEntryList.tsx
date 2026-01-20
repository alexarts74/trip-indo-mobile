import React from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useTheme } from "../../src/contexts/ThemeContext";
import { JournalEntry } from "../../src/types/journal";
import JournalEntryCard from "./JournalEntryCard";
import { BookOpen, PenLine } from "lucide-react-native";

interface JournalEntryListProps {
  entries: JournalEntry[];
  isLoading: boolean;
  currentUserId?: string;
  onDeleteEntry: (entryId: string) => void;
  onRefresh: () => void;
}

export default function JournalEntryList({
  entries,
  isLoading,
  currentUserId,
  onDeleteEntry,
  onRefresh,
}: JournalEntryListProps) {
  const { colors } = useTheme();

  const handleDelete = (entry: JournalEntry) => {
    Alert.alert(
      "Supprimer l'entrée",
      "Êtes-vous sûr de vouloir supprimer cette entrée du journal ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => onDeleteEntry(entry.id),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="py-10 items-center">
        <ActivityIndicator size="small" color={colors.primary} />
        <Text
          className="mt-3 text-sm"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Chargement du journal...
        </Text>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View className="py-10 items-center">
        <View
          className="w-20 h-20 rounded-full justify-center items-center mb-4"
          style={{ backgroundColor: colors.primary + "10" }}
        >
          <PenLine size={36} color={colors.primary} />
        </View>
        <Text
          className="text-lg font-bold text-center mb-2"
          style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
        >
          Aucune entrée
        </Text>
        <Text
          className="text-sm text-center px-6 leading-5"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Partagez vos expériences, découvertes et souvenirs de cette destination avec votre groupe !
        </Text>
      </View>
    );
  }

  return (
    <View>
      {entries.map((entry, index) => (
        <JournalEntryCard
          key={entry.id}
          entry={entry}
          isOwner={currentUserId === entry.user_id}
          onDelete={() => handleDelete(entry)}
        />
      ))}
    </View>
  );
}
