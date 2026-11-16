import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Pressable as TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ScreenHeader from '../components/ScreenHeader';
import EmptyTrip from '../components/EmptyTrip';
import { useApp } from '../context/AppContext';
import { colors, shadow } from '../theme';
import OpenStreetMap from '../components/OpenStreetMap';
import Text from '../components/AppText';
import AppIcon from '../components/AppIcon';
import { navigateRoot } from '../navigation/navigationRef';

function hasImplausibleCoordinates(routeDay) {
  return Number(routeDay?.distanceMeters || 0) > 1500000 || (routeDay?.activities || []).some((activity) => (
    Number.isFinite(activity.latitude) && Number.isFinite(activity.longitude)
    && (activity.latitude < 23.4 || activity.latitude > 37.2 || activity.longitude < 60.8 || activity.longitude > 77.9)
  ));
}

export default function MapScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 950;
  const mapHeight = desktop ? 460 : 340;
  const { currentTrip: contextTrip, trips, tripsLoading, openTrip, refreshTrips, refreshTripRoute, deleteTrip, track } = useApp();
  const routeTrip = route?.params?.trip;
  const currentTrip = routeTrip || contextTrip;

  const routeDays = currentTrip?.route?.days || [];
  const routeNeedsRepair = !routeDays.length
    || routeDays.some((day) => !day.coordinates?.length || day.status === 'unavailable' || Number(day.distanceMeters || 0) === 0 || hasImplausibleCoordinates(day));

  const [day, setDay] = useState(routeDays[0]?.day || 1);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');

  // Lock to prevent infinite re-route loops or bouncing between trips
  const repairedTripIds = useRef(new Set());
  const activeRepairTripId = useRef(null);

  useEffect(() => {
    setDay(routeDays[0]?.day || 1);
    setRouteError('');
  }, [currentTrip?._id]);

  async function loadMissingRoute(force = false) {
    if (!currentTrip?._id || !currentTrip.itinerary?.length) return;
    const tripId = String(currentTrip._id);
    if (!force && repairedTripIds.current.has(tripId)) return;
    if (activeRepairTripId.current === tripId) return;

    activeRepairTripId.current = tripId;
    setRouteLoading(true);
    setRouteError('');
    try {
      repairedTripIds.current.add(tripId);
      await refreshTripRoute();
    } catch (error) {
      setRouteError(error.message || 'Could not rebuild this saved route.');
    } finally {
      activeRepairTripId.current = null;
      setRouteLoading(false);
    }
  }

  useEffect(() => {
    if (!currentTrip?._id) return;
    const tripId = String(currentTrip._id);
    if (routeNeedsRepair && !repairedTripIds.current.has(tripId)) {
      loadMissingRoute(true);
    }
  }, [currentTrip?._id, routeNeedsRepair]);

  function handleGoBack() {
    if (currentTrip) {
      openTrip(currentTrip);
    }
    // Navigate directly to Itinerary screen on the root stack navigator
    navigateRoot('Itinerary', { trip: currentTrip });
  }

  function handleSelectTrip(selectedTrip) {
    if (!selectedTrip || String(selectedTrip._id) === String(currentTrip?._id)) return;
    openTrip(selectedTrip);
  }

  function handleDeleteTripConfirm(tripToDelete, e) {
    if (e?.stopPropagation) e.stopPropagation();
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete saved trip to ${tripToDelete.destination}?`);
      if (confirmed) {
        deleteTrip(tripToDelete._id).catch(() => {});
      }
    } else {
      Alert.alert(
        'Delete Trip',
        `Are you sure you want to delete your trip to ${tripToDelete.destination}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteTrip(tripToDelete._id).catch(() => {}) },
        ],
      );
    }
  }

  if (!currentTrip) return (
    <View style={styles.page}>
      <ScreenHeader
        title="Route map"
        subtitle="Your saved itinerary routes"
        onBack={handleGoBack}
      />
      {tripsLoading ? (
        <ActivityIndicator color={colors.forest} style={styles.loader} />
      ) : (
        <EmptyTrip message="Create a trip first. Saved trips will automatically return here whenever you sign in." />
      )}
    </View>
  );

  const selected = routeDays.find((item) => item.day === day) || routeDays[0];
  const coordinates = selected?.coordinates || [];
  const activityCoordinates = (selected?.activities || []).filter((activity) => Number.isFinite(activity.latitude) && Number.isFinite(activity.longitude));
  const allPoints = coordinates.length ? coordinates : activityCoordinates.map((activity) => [activity.longitude, activity.latitude]);
  const totalStops = selected?.activities?.length || 0;
  const mappedStops = activityCoordinates.length;
  const isLiveRoute = selected?.status === 'live';

  async function openDirections() {
    if (activityCoordinates.length < 1) return Alert.alert('Route unavailable', 'This itinerary does not yet have enough geocoded stops.');
    const points = activityCoordinates.slice(0, 8);
    const origin = `${points[0].latitude},${points[0].longitude}`;
    const destination = `${points.at(-1).latitude},${points.at(-1).longitude}`;
    const waypoints = points.slice(1, -1).map((item) => `${item.latitude},${item.longitude}`).join('|');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}`;
    track('open_details', { tripId: currentTrip._id, itemType: 'route', itemId: String(day) });
    await Linking.openURL(url);
  }

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <ScreenHeader
        title="Route map"
        subtitle={`${currentTrip.destination}, ${(Number(currentTrip.route?.totalDistanceMeters || 0) / 1000).toFixed(1)} km and ${Math.round(Number(currentTrip.route?.totalDurationSeconds || 0) / 60)} min total`}
        onBack={handleGoBack}
      />

      {/* TOP NAVIGATION BAR: CLEAR "BACK TO ITINERARY" ACTION */}
      <View style={styles.topBackStrip}>
        <TouchableOpacity
          style={styles.backToItineraryBigBtn}
          onPress={handleGoBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Return to ${currentTrip.destination} itinerary`}
        >
          <AppIcon name="arrow-back" size={17} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.backToItineraryBigText}>← Back to {currentTrip.destination} Itinerary (Day Plan)</Text>
        </TouchableOpacity>
      </View>

      {/* SAVED TRIPS SELECTOR WITH TIMESTAMPS AND ACTIVE INDICATOR */}
      <View style={styles.tripPicker}>
        <View style={styles.tripPickerHeaderRow}>
          <Text style={styles.pickerLabel}>SAVED TRIPS ({trips.length})</Text>
          <Text style={styles.pickerSubLabel}>Tap to switch trip view</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {trips.map((trip, idx) => {
            const isSelected = String(currentTrip?._id) === String(trip._id);
            const dateStr = trip.createdAt
              ? new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : `Trip #${idx + 1}`;
            return (
              <TouchableOpacity
                key={String(trip._id || idx)}
                onPress={() => handleSelectTrip(trip)}
                style={[styles.tripChip, isSelected && styles.tripChipOn]}
                activeOpacity={0.85}
              >
                <View style={styles.chipTopRow}>
                  <Text style={[styles.tripName, isSelected && styles.tripNameOn]} numberOfLines={1}>
                    {trip.destination}
                  </Text>
                  {isSelected ? (
                    <View style={styles.activeDotBadge}>
                      <Text style={styles.activeDotText}>ACTIVE</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={(e) => handleDeleteTripConfirm(trip, e)}
                      hitSlop={6}
                      style={styles.deleteChipBtn}
                      accessibilityLabel="Delete duplicate trip"
                    >
                      <AppIcon name="trash-outline" size={13} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.tripDays, isSelected && styles.tripDaysOn]}>
                  {trip.days} days • {dateStr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* DAY TABS */}
      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {routeDays.map((item) => (
            <TouchableOpacity
              key={item.day}
              onPress={() => setDay(item.day)}
              style={[styles.tab, day === item.day && styles.tabOn]}
            >
              <Text style={[styles.tabText, day === item.day && styles.tabTextOn]}>Day {item.day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* MAIN CONTENT AREA */}
      {routeLoading ? (
        <View style={styles.routeLoader}>
          <ActivityIndicator color={colors.forest} size="large" />
          <Text style={styles.loadingText}>Building live road route & map coordinates...</Text>
        </View>
      ) : !selected ? (
        <View style={{ padding: 20 }}>
          <EmptyTrip message={routeError || "No daily route data is available for this trip."} />
          <TouchableOpacity style={styles.retryButton} onPress={() => loadMissingRoute(true)}>
            <Text style={styles.retryText}>REBUILD ROUTE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, desktop && styles.desktopContent]}>
          {allPoints.length ? (
            <View style={[styles.map, desktop && styles.desktopMap, { height: mapHeight }]}>
              <OpenStreetMap routeDay={selected} height={mapHeight} />
            </View>
          ) : (
            <View style={[styles.noMap, desktop && styles.desktopMap]}>
              <Text style={styles.noMapTitle}>Coordinates unavailable</Text>
              <Text style={styles.noMapText}>Rebuilding itinerary map coordinates...</Text>
              <TouchableOpacity style={[styles.retryButton, { marginTop: 14 }]} onPress={() => loadMissingRoute(true)}>
                <Text style={styles.retryText}>RETRY BUILDING ROUTE</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.summary, desktop && styles.desktopSummary]}>
            <View style={styles.routeStatusRow}>
              <Text style={[styles.routeStatus, isLiveRoute ? styles.liveStatus : styles.estimatedStatus]}>
                {isLiveRoute ? 'LIVE ROAD ROUTE' : 'ESTIMATED ROUTE'}
              </Text>
              <Text style={styles.mappedStops}>{mappedStops} of {totalStops} stops mapped</Text>
            </View>
            <Text style={styles.title}>{selected.title || `Day ${day}`}</Text>
            <Text style={styles.meta}>
              {(Number(selected.distanceMeters || 0) / 1000).toFixed(1)} km, {Math.round(Number(selected.durationSeconds || 0) / 60)} min
            </Text>
            <Text style={styles.note}>{selected.note || 'Scenic journey across mapped destinations.'}</Text>
            {(selected.activities || []).map((activity, index) => (
              <View key={`${activity.place}-${index}`} style={styles.stop}>
                <Text style={styles.number}>{index + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stopName}>{activity.place}</Text>
                  <Text style={styles.stopTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.openButton} onPress={openDirections}>
                <Text style={styles.openText}>OPEN DIRECTIONS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rebuildButton} onPress={() => loadMissingRoute(true)}>
                <Text style={styles.rebuildText}>REFRESH ROUTE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
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
    gap: 10,
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
  homeShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf4ed',
    borderWidth: 1,
    borderColor: '#c5dcc8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  homeShortcutText: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  tabs: { backgroundColor: colors.paper, padding: 10 },
  loader: { marginTop: 50 },
  routeLoader: { padding: 50, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.forest, marginTop: 14, fontWeight: '800' },
  tripPicker: {
    backgroundColor: '#edf4ed',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tripPickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pickerLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  pickerSubLabel: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  tripChip: {
    minWidth: 130,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tripChipOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  tripName: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  tripNameOn: { color: colors.white },
  activeDotBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activeDotText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  deleteChipBtn: {
    padding: 2,
  },
  tripDays: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 4 },
  tripDaysOn: { color: colors.mint },
  retryButton: { alignSelf: 'center', backgroundColor: colors.forest, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  retryText: { color: colors.white, fontWeight: '900' },
  tab: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 18, marginRight: 7, backgroundColor: colors.cream },
  tabOn: { backgroundColor: colors.forest },
  tabText: { color: colors.muted, fontWeight: '800' },
  tabTextOn: { color: '#fff' },
  content: { padding: 16, paddingBottom: 34 },
  map: { ...shadow, height: 340, borderRadius: 22, overflow: 'hidden', backgroundColor: '#eaf1ea', borderWidth: 1, borderColor: '#bfd0c1' },
  desktopContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, paddingHorizontal: 20, paddingTop: 20 },
  desktopMap: { flex: 1.35, minWidth: 0 },
  desktopSummary: { flex: 0.85, minWidth: 0, marginTop: 0 },
  noMap: { ...shadow, backgroundColor: colors.paper, borderRadius: 20, padding: 22 },
  noMapTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  noMapText: { color: colors.muted, lineHeight: 20, marginTop: 6 },
  summary: { ...shadow, backgroundColor: colors.paper, borderRadius: 20, padding: 18, marginTop: 15 },
  title: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  meta: { color: colors.green, fontWeight: '800', marginTop: 5 },
  note: { color: colors.muted, fontSize: 12, marginVertical: 10 },
  routeStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  routeStatus: { borderRadius: 999, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  liveStatus: { backgroundColor: colors.mint, color: colors.forest },
  estimatedStatus: { backgroundColor: '#fff1d6', color: '#6f4815' },
  mappedStops: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  stop: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderTopWidth: 1, borderColor: colors.line },
  number: { width: 26, height: 26, borderRadius: 13, textAlign: 'center', textAlignVertical: 'center', backgroundColor: colors.mint, color: colors.forest, fontWeight: '900', marginRight: 10 },
  stopName: { color: colors.ink, fontWeight: '800' },
  stopTime: { color: colors.muted, fontSize: 11, marginTop: 2 },
  actionButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  openButton: { flex: 1.4, backgroundColor: colors.forest, borderRadius: 12, padding: 13, alignItems: 'center' },
  openText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  rebuildButton: { flex: 1, backgroundColor: '#e2ece4', borderWidth: 1, borderColor: '#b5cebb', borderRadius: 12, padding: 13, alignItems: 'center' },
  rebuildText: { color: colors.forest, fontWeight: '900', fontSize: 13 },
});
