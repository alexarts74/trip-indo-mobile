import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Linking, StatusBar, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ArrowLeft, MessageCircle, Send, HelpCircle, Mail, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { ResponsiveContainer } from '@/src/components/ResponsiveContainer';

const SUPPORT_EMAIL = 'artusalexandre74@gmail.com';

export default function SupportScreen() {
  const [message, setMessage] = useState('');
  const { theme, colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleSendEmail = () => {
    if (!message.trim()) {
      Alert.alert('Message requis', 'Veuillez écrire un message avant d\'envoyer.');
      return;
    }

    const subject = 'Demande de support - TripMate App';
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(err => {
      console.error('An error occurred', err);
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application de messagerie.');
    });
  };

  return (
    <ResponsiveContainer containerStyle={{ backgroundColor: colors.background }}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.surface}
        />

        {/* Header */}
        <View
          className="pb-5 px-5 flex-row items-center border-b"
          style={{
            paddingTop: insets.top + 10,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.03,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <TouchableOpacity
            className="w-10 h-10 justify-center items-center rounded-full mr-3"
            style={{ backgroundColor: colors.card }}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text
              className="text-[28px] font-bold"
              style={{
                color: colors.text,
                fontFamily: 'Ubuntu-Bold',
                letterSpacing: -0.5,
              }}
            >
              Support
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4 pt-5"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <View
            className="rounded-2xl p-5 mb-6 border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-12 h-12 rounded-full justify-center items-center mr-4"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <HelpCircle size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-lg font-bold mb-1"
                  style={{
                    color: colors.text,
                    fontFamily: 'Ubuntu-Bold',
                    letterSpacing: -0.3,
                  }}
                >
                  Besoin d'aide ?
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary, fontFamily: 'Ubuntu-Regular' }}
                >
                  Notre équipe est là pour vous aider
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 flex-row items-center gap-2">
                <Mail size={14} color={colors.textSecondary} />
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary, fontFamily: 'Ubuntu-Regular' }}
                >
                  Par email
                </Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2">
                <Clock size={14} color={colors.textSecondary} />
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary, fontFamily: 'Ubuntu-Regular' }}
                >
                  Réponse sous 24h
                </Text>
              </View>
            </View>
          </View>

          {/* Message Section */}
          <View className="mb-6">
            <Text
              className="text-xl font-bold mb-4"
              style={{
                color: colors.text,
                fontFamily: "Ubuntu-Bold",
                letterSpacing: -0.3,
              }}
            >
              Votre message
            </Text>

            <View
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-start p-4">
                <View
                  className="w-10 h-10 rounded-full justify-center items-center mr-3 mt-1"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <MessageCircle size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold mb-2"
                    style={{ color: colors.text, fontFamily: 'Ubuntu-Medium' }}
                  >
                    Décrivez votre problème
                  </Text>
                  <Text
                    className="text-[13px] mb-3"
                    style={{ color: colors.textSecondary, fontFamily: 'Ubuntu-Regular' }}
                  >
                    Soyez le plus précis possible pour nous aider à vous répondre rapidement
                  </Text>
                </View>
              </View>

              <View className="px-4 pb-4">
                <TextInput
                  className="p-4 rounded-xl text-base"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1,
                    minHeight: 160,
                    textAlignVertical: 'top',
                    fontFamily: 'Ubuntu-Regular'
                  }}
                  placeholder="Ex: J'ai un problème avec le partage des dépenses..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  value={message}
                  onChangeText={setMessage}
                />
              </View>
            </View>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 rounded-2xl gap-2.5"
            style={{
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={handleSendEmail}
            activeOpacity={0.8}
          >
            <Send size={20} color="#FFFFFF" />
            <Text
              className="text-base font-bold"
              style={{ color: "#FFFFFF", fontFamily: 'Ubuntu-Bold' }}
            >
              Ouvrir l'application Mail
            </Text>
          </TouchableOpacity>

          {/* FAQ Hint */}
          <View className="mt-6 items-center">
            <Text
              className="text-sm text-center"
              style={{ color: colors.textSecondary, fontFamily: 'Ubuntu-Regular' }}
            >
              En cliquant sur le bouton, votre application{'\n'}de messagerie s'ouvrira automatiquement
            </Text>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ResponsiveContainer>
  );
}
