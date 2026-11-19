import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Pressable as TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ScreenHeader from '../components/ScreenHeader';
import AppIcon from '../components/AppIcon';
import AppText from '../components/AppText';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../api/client';
import { colors, shadow } from '../theme';
import { navigateRoot } from '../navigation/navigationRef';

const Text = AppText;

export default function ProfileScreen({ navigation }) {
  const { user, token, logout, trips, tripsLoading, refreshTrips, openTrip, deleteTrip, currentTrip } = useApp();
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);

  async function loadData() {
    setError('');
    try {
      await refreshTrips();
    } catch (requestError) {
      setError(requestError.message);
    }

    if (token) {
      setFavLoading(true);
      try {
        const favRes = await apiRequest('/destinations/favorites', { token });
        setFavorites(favRes.favorites || []);
      } catch (err) {
        // silent fail on favorites in profile
      } finally {
        setFavLoading(false);
      }
    }
  }

  useEffect(() => {
    loadData();
    return navigation.addListener('focus', loadData);
  }, [navigation, token]);

  function chooseTrip(trip) {
    openTrip(trip);
    navigation.navigate('Itinerary', { trip });
  }

  function handleGoBack() {
    if (currentTrip) {
      openTrip(currentTrip);
      navigateRoot('Itinerary', { trip: currentTrip });
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigateRoot('MainApp', { screen: 'Home' });
    }
  }

  const [loggingOut, setLoggingOut] = useState(false);

  function confirmDelete(trip) {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm
        ? window.confirm(`Delete ${trip.destination} saved trip?`)
        : true;
      if (confirmed) {
        deleteTrip(trip._id).catch((requestError) => {
          if (typeof window !== 'undefined' && window.alert) {
            window.alert('Delete failed: ' + requestError.message);
          } else {
            Alert.alert('Delete failed', requestError.message);
          }
        });
      }
      return;
    }
    Alert.alert('Delete saved trip?', `${trip.destination} and its expenses will be removed.`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTrip(trip._id);
          } catch (requestError) {
            Alert.alert('Delete failed', requestError.message);
          }
        },
      },
    ]);
  }

  async function performLogout() {
    setLoggingOut(true);
    try {
      await logout();
      const parent = navigation.getParent();
      if (parent && parent.reset) {
        parent.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      } else if (navigation.reset) {
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      } else {
        navigation.navigate('Welcome');
      }
    } catch (err) {
      console.error('Logout error:', err);
      navigation.navigate('Welcome');
    } finally {
      setLoggingOut(false);
    }
  }

  function confirmLogout() {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm
        ? window.confirm('Are you sure you want to sign out?')
        : true;
      if (confirmed) {
        performLogout();
      }
    } else {
      Alert.alert('Sign out', 'End this session?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  }

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <ScreenHeader
        title={user?.fullName || 'Traveler'}
        subtitle={user?.email || ''}
        onBack={currentTrip ? handleGoBack : undefined}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.initials || 'U'}</Text>
        </View>
      </ScreenHeader>

      {currentTrip ? (
        <View style={styles.topBackStrip}>
          <TouchableOpacity
            style={styles.backToItineraryBigBtn}
            onPress={handleGoBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Return to ${currentTrip.destination} itinerary`}
          >
            <AppIcon name="arrow-back" size={17} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.backToItineraryBigText}>Back to {currentTrip.destination} Itinerary (Day Plan)</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Stats */}
        <View style={styles.stats}>
          <View>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>TRIPS</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{trips.reduce((sum, trip) => sum + Number(trip.days || 0), 0)}</Text>
            <Text style={styles.statLabel}>DAYS</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{new Set(trips.map((trip) => trip.destination)).size}</Text>
            <Text style={styles.statLabel}>CITIES</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>FAVORITES</Text>
          </View>
        </View>

        {/* Favorite Destinations Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.title}>Favorite Destinations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}>
              <Text style={styles.exploreLink}>Explore more</Text>
            </TouchableOpacity>
          </View>
          {favLoading ? (
            <ActivityIndicator color={colors.forest} style={{ margin: 15 }} />
          ) : favorites.length === 0 ? (
            <Text style={styles.empty}>No favorites yet. Tap the heart on destinations in the Dashboard to save them here.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favScroll}>
              {favorites.map((dest) => (
                <TouchableOpacity
                  key={dest._id}
                  style={styles.favItem}
                  onPress={() => navigation.navigate('DestinationDetail', { destination: dest })}
                >
                  <Image source={{ uri: dest.imageUrl }} style={styles.favImage} />
                  <Text style={styles.favName} numberOfLines={1}>{dest.name}</Text>
                  <Text style={styles.favRegion} numberOfLines={1}>{dest.region}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Saved Trips Section */}
        <View style={styles.card}>
          <Text style={styles.title}>Saved Trips</Text>
          {tripsLoading ? <ActivityIndicator color={colors.forest} style={{ margin: 20 }} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!tripsLoading && !error && trips.length === 0 ? (
            <Text style={styles.empty}>No saved trips yet. Start planning a trip from the Dashboard!</Text>
          ) : null}
          {trips.map((trip) => (
            <View key={trip._id} style={styles.trip}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => chooseTrip(trip)}>
                <Text style={styles.tripTitle}>{trip.destination}</Text>
                <Text style={styles.tripMeta}>
                  {trip.days} days - PKR {Number(trip.budget).toLocaleString()}
                  {trip.travelType ? ` - ${trip.travelType}` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel={`Delete ${trip.destination} trip`}
                style={styles.deleteTrip}
                onPress={() => confirmDelete(trip)}
              >
                <AppIcon name="trash-outline" color={colors.red} size={19} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => chooseTrip(trip)}>
                <Text style={styles.open}>Open</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Menu Navigation Items */}
        <View style={styles.menuCard}>
          <TouchableOpacity accessibilityRole="button" style={styles.menuRow} onPress={() => navigation.navigate('EditProfile')}>
            <View style={styles.menuIcon}><AppIcon name="create-outline" color={colors.forest} size={19} /></View>
            <View style={styles.menuCopy}><AppText variant="bodyStrong">Edit profile</AppText><AppText variant="caption" color={colors.muted}>Update your traveler name</AppText></View>
            <AppIcon name="chevron-forward" color={colors.muted} size={18} />
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.menuRow} onPress={() => navigation.navigate('TravelPreferences')}>
            <View style={styles.menuIcon}><AppIcon name="options-outline" color={colors.forest} size={19} /></View>
            <View style={styles.menuCopy}><AppText variant="bodyStrong">Travel preferences</AppText><AppText variant="caption" color={colors.muted}>Budget, interests, and hotel style</AppText></View>
            <AppIcon name="chevron-forward" color={colors.muted} size={18} />
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.menuRow} onPress={() => navigation.navigate('Alerts')}>
            <View style={styles.menuIcon}><AppIcon name="warning-outline" color={colors.forest} size={19} /></View>
            <View style={styles.menuCopy}><AppText variant="bodyStrong">Travel safety alerts</AppText><AppText variant="caption" color={colors.muted}>Fog, smog, landslides, and road hazards</AppText></View>
            <AppIcon name="chevron-forward" color={colors.muted} size={18} />
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.menuRow} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.menuIcon}><AppIcon name="settings-outline" color={colors.forest} size={19} /></View>
            <View style={styles.menuCopy}><AppText variant="bodyStrong">Settings</AppText><AppText variant="caption" color={colors.muted}>Configuration and data providers</AppText></View>
            <AppIcon name="chevron-forward" color={colors.muted} size={18} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logout, loggingOut && { opacity: 0.6 }]}
          onPress={confirmLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.red} size="small" />
          ) : (
            <Text style={styles.logoutText}>SIGN OUT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  topBackStrip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d1e3d4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  backToItineraryBigBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    ...shadow,
  },
  backToItineraryBigText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  avatar: { position: 'absolute', right: 20, bottom: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.forest, fontWeight: '900', fontSize: 18 },
  content: { padding: 16, paddingBottom: 34 },
  stats: { ...shadow, backgroundColor: colors.paper, borderRadius: 20, padding: 18, flexDirection: 'row', justifyContent: 'space-around' },
  statValue: { textAlign: 'center', color: colors.forest, fontWeight: '900', fontSize: 23 },
  statLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 2, textAlign: 'center' },
  card: { ...shadow, backgroundColor: colors.paper, borderRadius: 20, padding: 18, marginTop: 15 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: colors.ink, fontWeight: '900', fontSize: 18 },
  exploreLink: { color: colors.forest, fontWeight: '800', fontSize: 12 },
  favScroll: { marginTop: 4 },
  favItem: { width: 110, marginRight: 12 },
  favImage: { width: 110, height: 75, borderRadius: 12, backgroundColor: '#dce8dc' },
  favName: { color: colors.ink, fontWeight: '800', fontSize: 12, marginTop: 6 },
  favRegion: { color: colors.muted, fontSize: 10, marginTop: 1 },
  menuCard: { ...shadow, backgroundColor: colors.paper, borderRadius: 20, paddingHorizontal: 16, marginTop: 15, overflow: 'hidden' },
  menuRow: { minHeight: 65, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line },
  menuIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuCopy: { flex: 1 },
  trip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderColor: colors.line, paddingVertical: 12 },
  deleteTrip: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  tripTitle: { color: colors.ink, fontWeight: '900', fontSize: 15 },
  tripMeta: { color: colors.muted, fontSize: 11, marginTop: 3 },
  open: { color: colors.green, fontWeight: '900', fontSize: 13 },
  empty: { color: colors.muted, paddingVertical: 14, fontSize: 12, lineHeight: 18 },
  error: { color: colors.red, paddingVertical: 14 },
  logout: { borderWidth: 1, borderColor: colors.red, borderRadius: 13, padding: 14, alignItems: 'center', marginTop: 22 },
  logoutText: { color: colors.red, fontWeight: '900', letterSpacing: 0.5 },
});
