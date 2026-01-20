import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { useTheme } from "../../src/contexts/ThemeContext";
import { JournalEntry } from "../../src/types/journal";
import { Trash2, X, ChevronLeft, ChevronRight } from "lucide-react-native";

interface JournalEntryCardProps {
  entry: JournalEntry;
  isOwner: boolean;
  onDelete: () => void;
}

export default function JournalEntryCard({
  entry,
  isOwner,
  onDelete,
}: JournalEntryCardProps) {
  const { colors } = useTheme();
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getUserDisplayName = () => {
    if (!entry.user) return "Utilisateur";
    if (entry.user.first_name && entry.user.last_name) {
      return `${entry.user.first_name} ${entry.user.last_name}`;
    }
    if (entry.user.first_name) return entry.user.first_name;
    if (entry.user.email) {
      return entry.user.email.split("@")[0];
    }
    return "Utilisateur";
  };

  const getInitials = () => {
    if (!entry.user) return "U";
    if (entry.user.first_name) {
      return entry.user.first_name.charAt(0).toUpperCase();
    }
    if (entry.user.email) {
      return entry.user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handlePrevImage = () => {
    if (entry.image_urls && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (entry.image_urls && currentImageIndex < entry.image_urls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const hasImages = entry.image_urls && entry.image_urls.length > 0;

  return (
    <View className="flex-row">
      {/* Timeline indicator */}
      <View className="items-center mr-3">
        <View
          className="w-10 h-10 rounded-full justify-center items-center"
          style={{ backgroundColor: colors.primary + "20" }}
        >
          <Text
            className="text-sm font-bold"
            style={{ color: colors.primary, fontFamily: "Ubuntu-Bold" }}
          >
            {getInitials()}
          </Text>
        </View>
        <View
          className="flex-1 w-0.5 mt-2"
          style={{ backgroundColor: colors.border }}
        />
      </View>

      {/* Content */}
      <View className="flex-1 pb-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
            >
              {getUserDisplayName()}
            </Text>
            <Text
              className="text-xs"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
            >
              {formatDate(entry.created_at)}
            </Text>
          </View>
          {isOwner && (
            <TouchableOpacity
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.error + "10" }}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={14} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>

        {/* Titre */}
        {entry.title && (
          <Text
            className="text-base font-bold mb-1"
            style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
          >
            {entry.title}
          </Text>
        )}

        {/* Texte */}
        <Text
          className="text-sm leading-5"
          style={{ color: colors.text, fontFamily: "Ubuntu-Regular" }}
        >
          {entry.content}
        </Text>

        {/* Images */}
        {hasImages && (
          <View className="mt-3">
            {entry.image_urls!.length === 1 ? (
              <TouchableOpacity
                onPress={() => {
                  setCurrentImageIndex(0);
                  setImageViewerOpen(true);
                }}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: entry.image_urls![0] }}
                  className="w-full h-44 rounded-xl"
                  style={{ backgroundColor: colors.input }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {entry.image_urls!.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setCurrentImageIndex(index);
                      setImageViewerOpen(true);
                    }}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: url }}
                      className="w-32 h-32 rounded-xl"
                      style={{ backgroundColor: colors.input }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setImageViewerOpen(false)}
      >
        <View className="flex-1 bg-black justify-center items-center">
          <TouchableOpacity
            className="absolute top-14 right-5 z-10 p-3 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            onPress={() => setImageViewerOpen(false)}
          >
            <X size={24} color="#ffffff" />
          </TouchableOpacity>

          {entry.image_urls && entry.image_urls.length > 1 && (
            <View
              className="absolute top-14 left-5 z-10 px-4 py-2 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Text className="text-white text-sm font-medium">
                {currentImageIndex + 1} / {entry.image_urls.length}
              </Text>
            </View>
          )}

          {entry.image_urls && (
            <Image
              source={{ uri: entry.image_urls[currentImageIndex] }}
              style={{ width: screenWidth, height: screenWidth }}
              resizeMode="contain"
            />
          )}

          {entry.image_urls && entry.image_urls.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <TouchableOpacity
                  className="absolute left-4 p-3 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                  onPress={handlePrevImage}
                >
                  <ChevronLeft size={28} color="#ffffff" />
                </TouchableOpacity>
              )}
              {currentImageIndex < entry.image_urls.length - 1 && (
                <TouchableOpacity
                  className="absolute right-4 p-3 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                  onPress={handleNextImage}
                >
                  <ChevronRight size={28} color="#ffffff" />
                </TouchableOpacity>
              )}
            </>
          )}

          {entry.image_urls && entry.image_urls.length > 1 && (
            <View className="absolute bottom-10 flex-row gap-2">
              {entry.image_urls.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                >
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        index === currentImageIndex
                          ? "#ffffff"
                          : "rgba(255,255,255,0.4)",
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
