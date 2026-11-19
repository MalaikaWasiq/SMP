import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable as TouchableOpacity,
  View,
} from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/AppText';
import MarkdownText from '../components/MarkdownText';
import AppIcon from '../components/AppIcon';
import { apiRequest } from '../api/client';
import { useApp } from '../context/AppContext';
import { colors, fonts, radius, spacing } from '../theme';

const starterPrompts = [
  'Explore Pakistan',
  'Find peaceful destinations',
  'Travel safety tips',
  'Best time to visit Northern Areas',
  'Family travel suggestions',
  'Learn about Pakistani culture',
];

export default function ChatScreen({ navigation, route }) {
  const { token, currentTrip, trips } = useApp();
  const [session, setSession] = useState(route.params?.session || null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(!route.params?.session);

  useEffect(() => {
    if (session) return;
    (async () => {
      if (!token) {
        // Guest mode: Initialize local session state
        setSession({ _id: 'guest', messages: [] });
        setBooting(false);
        return;
      }
      try {
        const data = await apiRequest('/chat', {
          method: 'POST',
          token,
          body: { tripId: currentTrip?._id },
        });
        setSession(data.session);
      } catch (error) {
        // Fall back gracefully to guest session
        setSession({ _id: 'guest', messages: [] });
      } finally {
        setBooting(false);
      }
    })();
  }, [token]);

  async function send(value = input) {
    const message = String(value).trim();
    if (!message || !session || loading) return;
    setInput('');
    setLoading(true);
    setSession((current) => ({
      ...current,
      messages: [...(current?.messages || []), { _id: `local-${Date.now()}`, role: 'user', content: message }],
    }));
    try {
      if (session._id === 'guest') {
        const data = await apiRequest('/chat', {
          method: 'POST',
          body: { message },
        });
        setSession((current) => ({
          ...current,
          messages: [
            ...(current?.messages || []),
            {
              _id: `bot-${Date.now()}`,
              role: 'assistant',
              content: data.reply || data.content,
              recommendedDestinations: data.recommendedDestinations || data.destinations || [],
              suggestedActions: data.suggestions || [],
              fallbackUsed: data.fallbackUsed,
            },
          ],
        }));
      } else {
        const data = await apiRequest(`/chat/${session._id}/messages`, {
          method: 'POST',
          token,
          body: { message },
        });
        setSession(data.session);
      }
    } catch (error) {
      Alert.alert('Could not send', error.message);
    } finally {
      setLoading(false);
    }
  }

  const messages = session?.messages || [];
  const quickPrompts = messages.at(-1)?.suggestedActions || starterPrompts;
  const contextTrip = trips.find((trip) => String(trip._id) === String(session?.tripId)) || currentTrip;

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title="SafarSaathi AI"
        subtitle={contextTrip ? `Smart Assistant - Active trip: ${contextTrip.destination}` : 'Your Smart Travel & Tourism Companion'}
        onBack={() => navigation.goBack()}
      />
      {booting ? <ActivityIndicator color={colors.forest} style={{ flex: 1 }} /> : (
        <>
          <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
            {!messages.length ? (
              <View style={styles.intro}>
                <View style={styles.introIcon}><AppIcon name="compass" color={colors.forest} size={24} /></View>
                <View style={styles.introCopy}>
                  <AppText variant="heading" style={styles.introTitle}>SafarSaathi AI Travel Companion</AppText>
                  <AppText color={colors.muted} style={styles.introDesc}>
                    Your multilingual travel assistant powered by Groq. Ask in English, Roman Urdu, or Urdu about destinations, cultural heritage, weather, travel tips, routes, or local cuisines across Pakistan.
                  </AppText>
                  <AppText variant="caption" color={colors.forest} style={{ marginTop: 4 }}>
                    Note: For detailed day-by-day itineraries and budget calculations, use the Plan a Trip screen.
                  </AppText>
                </View>
              </View>
            ) : null}
            {messages.map((item, index) => (
              <View key={item._id || index} style={[styles.bubbleWrap, item.role === 'user' ? styles.bubbleUserWrap : styles.bubbleBotWrap]}>
                <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.bot]}>
                  <MarkdownText compact color={item.role === 'user' ? colors.white : colors.ink}>{item.content}</MarkdownText>
                  {item.fallbackUsed ? <AppText variant="caption" color={colors.muted}>Deterministic fallback answer</AppText> : null}
                </View>

                {/* Destination Recommendation Cards */}
                {(item.recommendedDestinations || item.destinations)?.length > 0 ? (
                  <View style={styles.destList}>
                    {(item.recommendedDestinations || item.destinations).map((d) => (
                      <View key={d.name} style={styles.destCard}>
                        {d.imageUrl ? (
                          <Image source={{ uri: d.imageUrl }} style={styles.destThumb} resizeMode="cover" />
                        ) : null}
                        <View style={styles.destCardBody}>
                          <AppText style={styles.destTitle} numberOfLines={1}>{d.name}</AppText>
                          <AppText style={styles.destSubtitle} numberOfLines={1}>
                            {d.region || d.category || 'Pakistan'}
                          </AppText>
                          <TouchableOpacity
                            style={styles.exploreBtn}
                            onPress={() => navigation.navigate('DestinationDetail', { destination: d })}
                          >
                            <AppText style={styles.exploreBtnText}>Explore</AppText>
                            <AppIcon name="chevron-forward" size={12} color={colors.white} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Direct Trip Planner Navigation Shortcut */}
                {item.suggestedPlanDestination ? (
                  <TouchableOpacity
                    style={styles.planTripBtn}
                    onPress={() => navigation.navigate('TripPlanning', {
                      preselectedDestination: item.suggestedPlanDestination,
                    })}
                  >
                    <AppIcon name="map-outline" size={15} color={colors.forest} />
                    <AppText style={styles.planTripBtnText}>
                      Open Trip Planner for {item.suggestedPlanDestination}
                    </AppText>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
            {loading ? <ActivityIndicator color={colors.forest} style={{ marginVertical: 12 }} /> : null}
          </ScrollView>
          <View style={styles.quick}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickPrompts.map((prompt) => (
                <TouchableOpacity key={prompt} style={styles.quickChip} onPress={() => send(prompt)} disabled={loading}>
                  <AppText variant="caption" color={colors.forest}>{prompt}</AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.composer}>
            <TextInput
              id="chat-message-input"
              nativeID="chat-message-input"
              name="chatMessage"
              accessibilityLabel="Chat Message Input"
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask SafarSaathi in English, Roman Urdu, or Urdu..."
              multiline
              maxLength={1000}
              onSubmitEditing={() => send()}
            />
            <TouchableOpacity accessibilityLabel="Send message" style={styles.send} onPress={() => send()} disabled={loading}>
              <AppIcon name="send" color={colors.white} size={18} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  messages: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: spacing.lg, gap: 12, flexGrow: 1 },
  intro: { backgroundColor: colors.paper, padding: 20, borderRadius: radius.lg, gap: 12, flexDirection: 'row', borderWidth: 1, borderColor: colors.line },
  introIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  introCopy: { flex: 1, gap: 5 },
  introTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  introDesc: { fontSize: 13, lineHeight: 18, color: colors.muted },
  bubbleWrap: { maxWidth: 760, gap: 8 },
  bubbleUserWrap: { alignSelf: 'flex-end' },
  bubbleBotWrap: { alignSelf: 'flex-start' },
  bubble: { padding: 12, borderRadius: radius.lg, gap: 5 },
  user: { backgroundColor: colors.forest, borderBottomRightRadius: 4 },
  bot: { backgroundColor: colors.paper, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.line },
  destList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  destCard: { width: 170, backgroundColor: colors.paper, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  destThumb: { width: '100%', height: 95 },
  destCardBody: { padding: 8, gap: 4 },
  destTitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  destSubtitle: { fontSize: 11, color: colors.muted },
  exploreBtn: { marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.forest, paddingVertical: 5, paddingHorizontal: 8, borderRadius: radius.sm },
  exploreBtnText: { color: colors.white, fontSize: 11, fontFamily: fonts.semiBold },
  planTripBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.mint, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.green },
  planTripBtnText: { color: colors.forest, fontSize: 12, fontFamily: fonts.semiBold },
  quick: { paddingHorizontal: 12, paddingVertical: 7, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.cream },
  quickChip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.green, borderRadius: radius.pill, marginRight: 7, backgroundColor: colors.paper },
  composer: { width: '100%', maxWidth: 900, alignSelf: 'center', flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 8, backgroundColor: colors.paper },
  input: { flex: 1, maxHeight: 110, minHeight: 46, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 11, color: colors.ink, fontFamily: fonts.body },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
});
