import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable as TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/AppText';
import AppIcon from '../components/AppIcon';
import PrimaryButton from '../components/PrimaryButton';
import FloatingChatButton from '../components/FloatingChatButton';
import CalendarPickerModal from '../components/CalendarPickerModal';
import { apiRequest } from '../api/client';
import { useApp } from '../context/AppContext';
import { colors, fonts, radius, shadowSoft, spacing } from '../theme';

const DEPARTURE_CITIES = [
  'Islamabad / Rawalpindi',
  'Lahore',
  'Karachi',
  'Peshawar',
  'Multan',
  'Faisalabad',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Sukkur',
  'Abbottabad',
  'Muzaffarabad',
];

const CATEGORIES = [
  'Cultural & Historical',
  'Northern Areas',
  'Adventure & Nature',
  'Coastal Areas',
];

const CATEGORY_CITIES_MAP = {
  'Cultural & Historical': [
    'Lahore', 'Multan', 'Bahawalpur', 'Taxila', 'Peshawar',
    'Rohtas Fort', 'Mohenjo-daro', 'Thatta & Makli', 'Swat Valley',
    'Rawalpindi', 'Faisalabad', 'Sialkot', 'Harappa', 'Katas Raj & Khewra',
    'Hyderabad', 'Sukkur', 'Ziarat'
  ],
  'Northern Areas': [
    'Hunza Valley', 'Skardu', 'Gilgit', 'Fairy Meadows',
    'Neelum Valley', 'Deosai Plains', 'Naltar Valley', 'Khunjerab Pass',
    'Kalam Valley', 'Astore & Rama', 'Khaplu & Shigar', 'Ghizer & Phander', 'Muzaffarabad'
  ],
  'Adventure & Nature': [
    'Islamabad', 'Murree & Galyat', 'Babusar Top', 'Malam Jabba',
    'Naran & Kaghan', 'Kumrat Valley', 'Chitral & Kalash', 'Quetta',
    'Abbottabad & Thandiani', 'Rawalakot & Banjosa'
  ],
  'Coastal Areas': [
    'Karachi Coast', 'Clifton Beach', 'Hawksbay', 'French Beach',
    'Manora Island', 'Kund Malir', 'Ormara Beach', 'Gwadar', 'Astola Island'
  ],
};

const TRAVEL_TYPES = [
  { id: 'Solo', label: 'Solo', icon: 'person-outline', desc: 'Flexible & independent pacing' },
  { id: 'Family', label: 'Family', icon: 'people-outline', desc: 'Kid-friendly, safe & comfortable' },
  { id: 'Group', label: 'Group', icon: 'bus-outline', desc: 'Structured group tour coordination' },
];

const RENTAL_VEHICLES = [
  { id: 'Economy-Alto', name: 'Suzuki Alto 660cc / Mehran', persons: '1-3 persons', luggage: '2 Luggage Bags', rentPerDay: 3000, fuelPerDay: 2000, maxPersons: 3, icon: 'car-outline' },
  { id: 'Economy-Mira', name: 'Daihatsu Mira / Suzuki Every', persons: '1-4 persons', luggage: '3 Luggage Bags', rentPerDay: 3800, fuelPerDay: 2200, maxPersons: 4, icon: 'car-outline' },
  { id: 'Economy-WagonR', name: 'Suzuki Wagon R / Cultus VXL', persons: '1-4 persons', luggage: '3 Luggage Bags', rentPerDay: 4000, fuelPerDay: 2500, maxPersons: 4, icon: 'car-outline' },
  { id: 'Compact-Vitz', name: 'Toyota Vitz / Yaris 1.3L', persons: '1-4 persons', luggage: '3 Luggage Bags', rentPerDay: 4800, fuelPerDay: 2800, maxPersons: 4, icon: 'car-outline' },
  { id: 'Sedan-City', name: 'Honda City 1.3L / 1.5L', persons: '3-5 persons', luggage: '4 Luggage Bags', rentPerDay: 5500, fuelPerDay: 3200, maxPersons: 5, icon: 'car-sport-outline' },
  { id: 'Sedan-Corolla', name: 'Toyota Corolla GLi / Altis', persons: '3-5 persons', luggage: '4 Luggage Bags', rentPerDay: 6500, fuelPerDay: 3600, maxPersons: 5, icon: 'car-sport-outline' },
  { id: 'Sedan-Civic', name: 'Honda Civic Oriel 1.8L', persons: '3-5 persons', luggage: '4 Luggage Bags', rentPerDay: 7500, fuelPerDay: 4000, maxPersons: 5, icon: 'car-sport-outline' },
  { id: 'MPV-Karvaan', name: 'Changan Karvaan Plus MPV', persons: '4-7 persons', luggage: '5 Luggage Bags', rentPerDay: 8000, fuelPerDay: 4200, maxPersons: 7, icon: 'bus-outline' },
  { id: 'Family-BRV', name: 'Honda BR-V 7-Seater MPV', persons: '4-6 persons', luggage: '5 Luggage Bags', rentPerDay: 8800, fuelPerDay: 4600, maxPersons: 6, icon: 'car-sport-outline' },
  { id: 'SUV-Sportage', name: 'KIA Sportage / Tucson AWD', persons: '4-5 persons', luggage: '5 Luggage Bags', rentPerDay: 11000, fuelPerDay: 5200, maxPersons: 5, icon: 'trail-sign-outline' },
  { id: 'SUV-Fortuner', name: 'Toyota Fortuner / Hilux Revo 4x4', persons: '4-7 persons', luggage: '6 Luggage Bags', rentPerDay: 13000, fuelPerDay: 5800, maxPersons: 7, icon: 'trail-sign-outline' },
  { id: 'SUV-Prado', name: 'Toyota Prado / Mountain 4x4 Jeep', persons: '4-6 persons', luggage: '6 Luggage Bags', rentPerDay: 14000, fuelPerDay: 6000, maxPersons: 6, icon: 'trail-sign-outline' },
  { id: 'Van-HiAce', name: 'Toyota HiAce Standard Commuter', persons: '7-11 persons', luggage: '8 Luggage Bags', rentPerDay: 13500, fuelPerDay: 6500, maxPersons: 11, icon: 'bus-outline' },
  { id: 'Grand-Cabin', name: 'Toyota HiAce Grand Cabin VIP', persons: '8-14 persons', luggage: '10 Luggage Bags', rentPerDay: 16000, fuelPerDay: 7500, maxPersons: 14, icon: 'bus-outline' },
  { id: 'Bus-Coaster', name: 'Toyota Coaster Saloon Mini-Bus', persons: '14-24 persons', luggage: '20 Luggage Bags', rentPerDay: 22000, fuelPerDay: 9500, maxPersons: 24, icon: 'bus-outline' },
];

const BOOKME_VEHICLES = RENTAL_VEHICLES;

const PERSON_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12];
const BUDGET_PER_PERSON_PRESETS = [25000, 38500, 50000, 75000, 100000];

const TRANSPORT_MODES = [
  { id: 'Private Car', icon: 'car-outline' },
  { id: 'Rental Car', icon: 'key-outline' },
  { id: 'Jeep/4x4', icon: 'trail-sign-outline' },
  { id: 'Bus', icon: 'bus-outline' },
  { id: 'Train', icon: 'train-outline' },
  { id: 'Flight', icon: 'airplane-outline' },
  { id: 'Public Transport', icon: 'navigate-outline' },
];

const ALL_INTERESTS = [
  'Hiking', 'Trekking', 'Nature', 'Food', 'Culture', 'History',
  'Adventure', 'Photography', 'Shopping', 'Beaches', 'Camping',
  'Skiing', 'Sightseeing', 'Relaxation',
];

const DAY_OPTIONS = [1, 2, 3, 4, 5, 7, 10, 14];
const BUDGET_PRESETS = [40000, 75000, 120000, 200000];
const COMFORT_LEVELS = [
  { id: 'Basic', label: 'Budget', badge: 'Economy', desc: 'Budget-friendly hotels & transit' },
  { id: 'Normal', label: 'Standard', badge: 'Standard', desc: 'Comfortable mid-range choices' },
  { id: 'Luxury', label: 'Premium', badge: 'Luxury', desc: '4-5 Star resorts & private transit' },
];

const CATEGORY_ROUTES_MAP = {
  'Northern Areas': [
    'Hazara Motorway (M-15) + Karakoram Highway (KKH / N-35)',
    'Babusar Pass Scenic Route (N-15 via Naran & Kaghan)',
    'Skardu Strategic Highway (S-1 via Jaglot)',
    'Gilgit-Chitral Road via Shandur Pass',
  ],
  'Adventure & Nature': [
    'Swat Expressway (M-16) + Kalam Valley Road',
    'Islamabad - Murree Expressway (N-75) + Galyat Route',
    'Dir - Lowari Tunnel - Chitral Highway (N-45)',
    'Naran-Kaghan Highway (N-15)',
  ],
  'Cultural & Historical': [
    'Lahore - Islamabad Motorway (M-2)',
    'Peshawar - Islamabad Motorway (M-1)',
    'Multan - Sukkur Motorway (M-5) & National Highway (N-5 / GT Road)',
    'Faisalabad - Multan Motorway (M-4)',
  ],
  'Coastal Areas': [
    'Makran Coastal Highway (N-10 via Kund Malir & Ormara to Gwadar)',
    'Karachi - Thatta - Hyderabad National Highway (N-5)',
    'Karachi Northern Bypass (M-10) to Hub & Coastal Highway',
  ],
};

const DESTINATION_ACTIVITIES_MAP = {
  // --- Lahore ---
  lahore: [
    { id: 'lahore_heritage', name: 'Shahi Qila & Badshahi Mosque Heritage Pass', icon: 'ribbon-outline', pricePerPerson: 600, desc: 'Official entry & Mughal architectural guided tour of Lahore Fort and Badshahi Mosque' },
    { id: 'lahore_wagah', name: 'Wagah Border Flag Ceremony VIP Pass', icon: 'flag-outline', pricePerPerson: 1500, desc: 'Reserved stadium seating & escorted parade pass at Pak-India Wagah Border' },
    { id: 'lahore_food_street', name: 'Old Lahore (Androon) Food Street & Haveli Walk', icon: 'restaurant-outline', pricePerPerson: 1800, desc: 'Guided night heritage walk through Delhi Gate, Wazir Khan Mosque & Fort Road Food Street feast' },
    { id: 'lahore_shalimar', name: 'Shalimar Gardens & Lahore Museum Pass', icon: 'leaf-outline', pricePerPerson: 500, desc: 'Official UNESCO Mughal garden entry and historic Lahore Museum relics pass' },
    { id: 'lahore_joyland', name: 'Sozo Water Park / Joyland Family Thrill Rides', icon: 'color-wand-outline', pricePerPerson: 1200, desc: 'All-inclusive pass for water slides, rollercoasters & family amusement' },
  ],

  // --- Malam Jabba ---
  'malam jabba': [
    { id: 'malam_ski', name: 'Skiing & Snowboard Equipment Rental', icon: 'snow-outline', pricePerPerson: 2500, desc: 'Full ski gear, snow boots, poles & ski slope access pass' },
    { id: 'malam_chairlift', name: 'Panoramic Mountain Chairlift & Cable Car', icon: 'trending-up-outline', pricePerPerson: 1200, desc: 'Spectacular dual chairlift ride to the 9,200ft Malam Jabba summit' },
    { id: 'malam_zipline', name: 'High-Altitude Mountain Zipline Thrill', icon: 'airplane-outline', pricePerPerson: 1800, desc: 'Certified alpine zipline flight across the snow-capped valley gorge' },
    { id: 'malam_tubing', name: 'Pine Forest Snow Tubing & Ice Skating', icon: 'football-outline', pricePerPerson: 900, desc: 'Fun snow tube sliding & ice rink session with safety gear' },
    { id: 'malam_forest_hike', name: 'Guided Cedar Forest Nature Trek', icon: 'trail-sign-outline', pricePerPerson: 800, desc: 'Guided scenic hiking trail through pristine Swat pine forests' },
  ],

  // --- Hunza Valley ---
  hunza: [
    { id: 'hunza_attabad_boat', name: 'Attabad Lake Speedboat & Jet Ski Ride', icon: 'boat-outline', pricePerPerson: 2000, desc: 'High-speed turquoise lake boating session & jet ski thrill at Attabad' },
    { id: 'hunza_forts', name: 'Baltit & Altit Forts Guided Heritage Pass', icon: 'shield-outline', pricePerPerson: 1200, desc: '800-year-old Mir of Hunza royal palaces entry and local guide' },
    { id: 'hunza_bridge', name: 'Passu Cones Suspension Bridge Walk & Zipline', icon: 'walk-outline', pricePerPerson: 1500, desc: 'Adrenaline suspension bridge crossing over Hunza River with rope safety' },
    { id: 'hunza_khunjerab_jeep', name: '4x4 Mountain Jeep Safari to Khunjerab Pass', icon: 'trail-sign-outline', pricePerGroup: 7500, desc: 'Rugged mountain 4x4 excursion up to the Pak-China border at 15,397 ft' },
    { id: 'hunza_eagles_nest', name: 'Eagles Nest Sunset Viewpoint & Cultural Music', icon: 'musical-notes-outline', pricePerPerson: 1000, desc: 'Panoramic sunset over 7 peaks with live Rubab & Hunza folk instruments' },
  ],

  // --- Skardu ---
  skardu: [
    { id: 'skardu_boating', name: 'Shangrila Resort Lake & Upper Kachura Boating', icon: 'boat-outline', pricePerPerson: 1500, desc: 'Serene shikara boat ride on Lower & Upper Kachura crystal lakes' },
    { id: 'skardu_katpana', name: 'Katpana Cold Desert 4x4 Dune Bashing', icon: 'car-sport-outline', pricePerGroup: 4500, desc: "World's highest cold desert sand dune drifting & quad bike thrill" },
    { id: 'skardu_deosai', name: 'Deosai Plains & Sheosar Lake 4x4 Expedition', icon: 'trail-sign-outline', pricePerGroup: 9000, desc: 'Full-day rugged 4x4 safari across the Land of Giants (Deosai plateau)' },
    { id: 'skardu_forts', name: 'Kharpocho Fort Mountain Hike & Shigar Palace', icon: 'business-outline', pricePerPerson: 1000, desc: 'Heritage entry and high vantage point overlooking the Indus River' },
    { id: 'skardu_trout', name: 'Fresh Indus Trout Angling & Riverside BBQ', icon: 'fish-outline', pricePerPerson: 2500, desc: 'Guided trout fishing permit & riverside barbecue experience' },
  ],

  // --- Islamabad & Rawalpindi ---
  islamabad: [
    { id: 'isb_rawal_lake', name: 'Rawal Lake Motorboat & Water Sports', icon: 'boat-outline', pricePerPerson: 1200, desc: 'Scenic motorboat cruise & water sports session at Rawal Lake / Lake View Park' },
    { id: 'isb_trail_hike', name: 'Margalla Hills Guided Hike (Trail 3/5 to Monal)', icon: 'trail-sign-outline', pricePerPerson: 1000, desc: 'Guided ridge trail hike with wildlife spotting and summit refreshments' },
    { id: 'isb_lok_virsa', name: 'Lok Virsa & National Heritage Museum Pass', icon: 'ribbon-outline', pricePerPerson: 600, desc: 'Pakistan National Monument Museum & Lok Virsa folk heritage ticket' },
    { id: 'isb_bus_tour', name: 'Islamabad Sightseeing Double Decker Bus Tour', icon: 'bus-outline', pricePerPerson: 800, desc: 'Open-roof scenic tour covering Faisal Mosque, Shakarparian & Blue Area' },
    { id: 'isb_monal_dinner', name: 'Daman-e-Koh Hilltop Dining & Monal Sunset Pass', icon: 'restaurant-outline', pricePerPerson: 2000, desc: 'Reserved scenic viewpoint table overlooking entire capital skyline' },
  ],
  rawalpindi: [
    { id: 'rwp_bazaar', name: 'Raja Bazaar & Saddar Heritage Food Walk', icon: 'restaurant-outline', pricePerPerson: 1200, desc: 'Authentic Punjabi street food tour and historic colonial cantonment walk' },
    { id: 'rwp_ayub_park', name: 'Ayub National Park Boating & Jungle Barracks Pass', icon: 'boat-outline', pricePerPerson: 700, desc: 'Lake pedal boating, aviary safari and family amusement park rides' },
    { id: 'rwp_havelis', name: 'Historic Rawalpindi Havelis & Clock Tower Trail', icon: 'ribbon-outline', pricePerPerson: 600, desc: 'Architectural photography of 19th-century carved wood and brick mansions' },
  ],

  // --- Murree & Galyat ---
  murree: [
    { id: 'murree_patriata', name: 'Patriata (New Murree) Chairlift & Cable Car', icon: 'trending-up-outline', pricePerPerson: 1200, desc: 'Famous 7km panoramic dual chairlift and gondola cable car ride' },
    { id: 'murree_pipeline', name: 'Ayubia National Park Pipeline Track Guided Walk', icon: 'walk-outline', pricePerPerson: 800, desc: 'Historic mountain pipeline nature trail walk through pine forests' },
    { id: 'murree_miranjani', name: 'Nathia Gali Green Spot & Miranjani Hilltop Trek', icon: 'trail-sign-outline', pricePerPerson: 1500, desc: 'Guided trekking pass to the highest peak in Abbottabad/Galyat region' },
    { id: 'murree_horse_ride', name: 'Mall Road Horse Riding & Evening Heritage Stroll', icon: 'paw-outline', pricePerPerson: 700, desc: 'Traditional horse ride along Kashmir Point and Mall Road bazaars' },
  ],

  // --- Swat & Kalam ---
  swat: [
    { id: 'swat_rafting', name: 'Swat River White Water Rafting Thrill', icon: 'water-outline', pricePerPerson: 2500, desc: 'Certified rapids rafting adventure along the roaring Swat River' },
    { id: 'swat_mahodand', name: 'Mahodand Lake 4x4 Mountain Jeep Safari', icon: 'trail-sign-outline', pricePerGroup: 6500, desc: 'Scenic off-road jeep drive through Ushu pine forest and Matiltan waterfall' },
    { id: 'swat_chairlift', name: 'Malam Jabba Chairlift & Mountain Zipline', icon: 'trending-up-outline', pricePerPerson: 1600, desc: 'High altitude cable ride and alpine resort pass' },
    { id: 'swat_heritage', name: 'Swat Buddhist Stupas & Museum Heritage Pass', icon: 'ribbon-outline', pricePerPerson: 600, desc: 'Ancient Butkara Stupa, Buddhist rock reliefs and Swat Archaeological Museum' },
  ],
  kalam: [
    { id: 'kalam_mahodand', name: 'Mahodand & Saifullah Lakes 4x4 Jeep Safari', icon: 'trail-sign-outline', pricePerGroup: 6500, desc: 'Rugged off-road expedition to glacial alpine lakes through Ushu Forest' },
    { id: 'kalam_trout', name: 'Ushu River Trout Fishing & Riverside BBQ', icon: 'fish-outline', pricePerPerson: 2000, desc: 'Fresh mountain trout fishing with rods and riverbank campfire meal' },
    { id: 'kalam_kundol', name: 'Kundol Lake Glacial Alpine Trek Guide', icon: 'walk-outline', pricePerGroup: 4000, desc: 'Professional local guide for the high-altitude glacial Kundol lake trek' },
  ],

  // --- Naran & Kaghan ---
  naran: [
    { id: 'naran_saiful_jeep', name: 'Lake Saif-ul-Malook 4x4 Jeep Expedition', icon: 'trail-sign-outline', pricePerGroup: 5500, desc: 'Exciting mountain jeep climb to the legendary fairy-tale lake at 10,578 ft' },
    { id: 'naran_rafting', name: 'Kunhar River White Water Rafting', icon: 'water-outline', pricePerPerson: 2200, desc: 'Certified rapids rafting thrilling adventure on Kunhar River' },
    { id: 'naran_boating', name: 'Saif-ul-Malook Boating & Lakeside Horse Riding', icon: 'boat-outline', pricePerPerson: 1500, desc: 'Wooden boat rowing on emerald waters and lakeside horse trot' },
    { id: 'naran_babusar_tour', name: 'Babusar Top & Lulusar Lake Mountain Jeep Tour', icon: 'car-sport-outline', pricePerGroup: 7000, desc: 'Scenic mountain pass tour to 13,691 ft Babusar summit and turquoise lake' },
  ],

  // --- Fairy Meadows ---
  'fairy meadows': [
    { id: 'fairy_jeep', name: 'Raikot Bridge to Tattu 4x4 Mountain Jeep Safari', icon: 'trail-sign-outline', pricePerGroup: 8500, desc: 'World-famous thrilling cliffside mountain jeep track to Tattu village' },
    { id: 'fairy_horse', name: 'Horse Riding / Mule Portage to Fairy Meadows', icon: 'paw-outline', pricePerPerson: 3500, desc: 'Scenic alpine horseback ascent to Fairy Meadows plateau' },
    { id: 'fairy_trek', name: 'Guided Beyal Camp & Nanga Parbat Base Camp Trek', icon: 'walk-outline', pricePerGroup: 4000, desc: 'Professional mountaineering guide trek right beneath Killer Mountain' },
    { id: 'fairy_bonfire', name: 'Alpine Stargazing & Bonfire Night', icon: 'flame-outline', pricePerPerson: 1200, desc: 'Clear Milky Way telescope viewing and pine wood campfire' },
  ],

  // --- Neelum Valley & Muzaffarabad ---
  neelum: [
    { id: 'neelum_rattigali', name: 'Ratti Gali Lake 4x4 Jeep Safari', icon: 'trail-sign-outline', pricePerGroup: 7000, desc: 'Thrilling jeep track to the alpine red-flower glacial lake (12,130 ft)' },
    { id: 'neelum_arangkel', name: 'Arang Kel Cable Car & Hilltop Village Hike', icon: 'trending-up-outline', pricePerPerson: 1000, desc: 'Local river cable lift and hike to the breathtaking pearl of Neelum' },
    { id: 'neelum_sharda', name: 'Sharda Ancient Buddhist University Heritage Walk', icon: 'ribbon-outline', pricePerPerson: 500, desc: 'Historical 9th-century ancient temple ruins guided heritage tour' },
    { id: 'neelum_waterfall', name: 'Kutton Waterfall & Jagran Stream Trout Meal', icon: 'water-outline', pricePerPerson: 1200, desc: 'Crystal cascading waterfall visit and stream trout meal experience' },
  ],
  muzaffarabad: [
    { id: 'muz_pir_chinasi', name: 'Pir Chinasi Mountain Peak 4x4 Drive', icon: 'trail-sign-outline', pricePerGroup: 4500, desc: 'Scenic 9,500 ft mountain drive with panoramic views of Kashmir valley' },
    { id: 'muz_red_fort', name: 'Red Fort (Rutta Qila) & Neelum-Jhelum Confluence', icon: 'ribbon-outline', pricePerPerson: 500, desc: 'Historic 16th-century fortress and two-tone river confluence viewpoint' },
  ],

  // --- Coastal Areas: Karachi, Clifton, Hawksbay, French Beach, Manora ---
  karachi: [
    { id: 'coast_scuba', name: 'Churna Island Scuba Diving & Coral Snorkeling', icon: 'water-outline', pricePerPerson: 4500, desc: 'Full scuba diving session with instructor, boat ride & underwater photography' },
    { id: 'coast_jetski', name: 'Clifton & Sea View Jet Ski & Speedboat', icon: 'boat-outline', pricePerPerson: 2000, desc: 'High-thrill coastal speedboat and jet ski riding on Arabian Sea' },
    { id: 'coast_quad', name: 'Beachfront Quad Biking & Camel Ride', icon: 'car-sport-outline', pricePerPerson: 1000, desc: 'Sand dune quad bike ride and traditional decorated camel safari on the beach' },
    { id: 'coast_manora', name: 'Manora Island Ferry Cruise & Waterfront Boardwalk', icon: 'navigate-outline', pricePerPerson: 800, desc: 'Scenic Keamari ferry ride to Manora Lighthouse and historic temple' },
    { id: 'coast_fishing', name: 'Deep Sea Fishing & Sunset Dinner Cruise', icon: 'fish-outline', pricePerGroup: 5500, desc: 'Chartered fishing boat expedition with rods, bait & sunset sea grill' },
  ],
  clifton: [
    { id: 'clifton_jetski', name: 'Sea View Jet Ski & Speedboat Thrill', icon: 'boat-outline', pricePerPerson: 2000, desc: 'High-speed Arabian Sea coastal boat ride and jet ski session' },
    { id: 'clifton_camel', name: 'Decorated Beach Camel & Buggy Ride', icon: 'paw-outline', pricePerPerson: 900, desc: 'Traditional camel trotting along Clifton shoreline and beach buggy' },
    { id: 'clifton_darya', name: 'Do Darya Waterfront Seafood Experience', icon: 'restaurant-outline', pricePerPerson: 2200, desc: 'Reserved open-air wooden deck dining directly over ocean waves' },
  ],
  hawksbay: [
    { id: 'hawksbay_snork', name: 'Turtle Beach Snorkeling & Water Sports', icon: 'water-outline', pricePerPerson: 2800, desc: 'Guided snorkeling session, paddleboarding and green sea turtle spotting' },
    { id: 'hawksbay_hut', name: 'Private Beach Hut Day Retreat & BBQ', icon: 'home-outline', pricePerGroup: 8000, desc: 'Furnished beachfront private hut with shaded deck and barbecue pit' },
  ],
  'french beach': [
    { id: 'french_scuba', name: 'French Beach Scuba Diving & Cliff Jumping', icon: 'water-outline', pricePerPerson: 4200, desc: 'Clear water scuba dive, cliff jump safety guide and underwater video' },
    { id: 'french_surf', name: 'Arabian Sea Paddleboard & Surfing Rental', icon: 'boat-outline', pricePerPerson: 1800, desc: 'Stand-up paddleboard rental with instructor and life jacket' },
  ],
  manora: [
    { id: 'manora_ferry', name: 'Keamari Ferry Boat Cruise to Manora Island', icon: 'navigate-outline', pricePerPerson: 800, desc: 'Traditional harbor boat crossing with seagulls, port views and lighthouse tour' },
    { id: 'manora_temple', name: 'Varun Dev Temple & Waterfront Promenade Pass', icon: 'ribbon-outline', pricePerPerson: 500, desc: 'Guided tour of the 1,000-year-old restored coastal temple & beach boardwalk' },
  ],

  // --- Gwadar & Kund Malir ---
  gwadar: [
    { id: 'gwadar_cliff', name: 'Hammerhead Cliff & Marine Drive Sunset Cruise', icon: 'boat-outline', pricePerGroup: 3500, desc: 'Dramatic peninsula cliff vantage point and ocean boat cruise in Gwadar' },
    { id: 'gwadar_batil', name: 'Koh-e-Batil Stairway Mountain Climb', icon: 'walk-outline', pricePerPerson: 600, desc: 'Scenic climb up the historic mountain overlooking Gwadar Port and Arabian Sea' },
    { id: 'gwadar_astola', name: 'Astola Island Coral Reef Snorkeling Boat Trip', icon: 'water-outline', pricePerPerson: 6500, desc: 'Expedition boat voyage to the uninhabited Island of Seven Hills' },
  ],
  'kund malir': [
    { id: 'kund_princess', name: 'Princess of Hope & Hingol Rock Formations Tour', icon: 'image-outline', pricePerGroup: 2500, desc: 'Breathtaking geological natural stone sculptures in Hingol National Park' },
    { id: 'kund_camping', name: 'Kund Malir Golden Beach Stargazing & Camping', icon: 'bonfire-outline', pricePerPerson: 3000, desc: 'Desert-meets-sea overnight beach camping and stargazing under pristine skies' },
  ],

  // --- Multan ---
  multan: [
    { id: 'multan_shrines', name: 'Shah Rukn-e-Alam & Bahauddin Zakariya Shrines Tour', icon: 'ribbon-outline', pricePerPerson: 600, desc: 'Guided architecture tour of 14th-century mastercraft blue tile shrines' },
    { id: 'multan_pottery', name: 'Kashigari Blue Pottery Artisan Workshop', icon: 'color-palette-outline', pricePerPerson: 1200, desc: 'Hands-on pottery making & glazed ceramic souvenir craft experience' },
    { id: 'multan_bazaar', name: 'Old Walled City & Hussain Agahi Bazaar Walk', icon: 'walk-outline', pricePerPerson: 800, desc: 'Authentic bazaar walk with original Multani Sohan Halwa tasting' },
    { id: 'multan_fort', name: 'Multan Fort (Qasim Bagh) & Damdama Viewpoint', icon: 'eye-outline', pricePerPerson: 500, desc: 'Panoramic fortress viewpoint and historic Sun Temple site visit' },
  ],

  // --- Bahawalpur ---
  bahawalpur: [
    { id: 'bahawalpur_palace', name: 'Noor Mahal & Darbar Mahal Royal Palace Tour', icon: 'business-outline', pricePerPerson: 800, desc: 'Italian neoclassical royal palace state apartments & light show' },
    { id: 'bahawalpur_derawar', name: 'Derawar Fort & Cholistan Desert 4x4 Safari', icon: 'trail-sign-outline', pricePerGroup: 6500, desc: 'Rugged 4x4 desert safari to the 40 colossal bastions of Derawar Fort' },
    { id: 'bahawalpur_camel', name: 'Cholistan Camel Caravan Trek & Bedouin Camp', icon: 'bonfire-outline', pricePerPerson: 2200, desc: 'Sunset camel caravan trek and desert campfire with traditional Rohi music' },
    { id: 'bahawalpur_safari', name: 'Lal Suhanra National Park Blackbuck Safari', icon: 'paw-outline', pricePerPerson: 1200, desc: 'Wildlife sanctuary tour spotting rare blackbucks, deer & desert birds' },
  ],

  // --- Peshawar ---
  peshawar: [
    { id: 'peshawar_qissa', name: 'Qissa Khwani Bazaar & Sethi Havelis Cultural Walk', icon: 'walk-outline', pricePerPerson: 1000, desc: 'Guided cultural walk through historic wood-carved merchant mansions' },
    { id: 'peshawar_bbq', name: 'Namak Mandi Shinwari BBQ Culinary Tour', icon: 'restaurant-outline', pricePerPerson: 2200, desc: 'Authentic tribal salt-meat Lamb Karahi & Peshawari Chappal Kabab feast' },
    { id: 'peshawar_museum', name: 'Peshawar Museum Gandhara Buddhist Art Pass', icon: 'ribbon-outline', pricePerPerson: 600, desc: "Entry to the world's largest collection of ancient Buddhist sculptures" },
    { id: 'peshawar_khyber', name: 'Bala Hissar Fort Viewpoint & Bab-e-Khyber Pass', icon: 'shield-outline', pricePerPerson: 1500, desc: 'Historic gateway to Central Asia excursion and fort vantage point' },
  ],

  // --- Taxila ---
  taxila: [
    { id: 'taxila_stupa', name: 'Dharmarajika Stupa & Sirkap Greek City Pass', icon: 'ribbon-outline', pricePerPerson: 700, desc: 'Guided archaeological walk across 2,500-year-old Gandhara ruins' },
    { id: 'taxila_museum', name: 'Taxila Museum Ancient Relics & Gold Treasures', icon: 'school-outline', pricePerPerson: 500, desc: 'Special museum entry showcasing ancient coins, jewelry and relics' },
    { id: 'taxila_julian', name: 'Julian Buddhist Monastery Mountain Hike', icon: 'walk-outline', pricePerPerson: 600, desc: 'Scenic hill hike to the ancient university & meditation cells of Julian' },
  ],

  // --- Rohtas Fort ---
  'rohtas fort': [
    { id: 'rohtas_walls', name: 'Sher Shah Suri Fortress Ramparts Trek', icon: 'shield-outline', pricePerPerson: 800, desc: 'Guided trek across the 4km massive UNESCO stone fortress walls' },
    { id: 'rohtas_gate', name: 'Sohail Gate & Haveli Man Singh Photo Tour', icon: 'camera-outline', pricePerPerson: 600, desc: 'Historic royal palace and intricate architectural photo expedition' },
    { id: 'rohtas_stepwell', name: 'Stepwell (Baoli) & Subterranean Tunnels Exploration', icon: 'trail-sign-outline', pricePerPerson: 700, desc: 'Historic subterranean water reservoir and military tunnel tour' },
  ],

  // --- Mohenjo-daro ---
  'mohenjo-daro': [
    { id: 'mohenjo_ruins', name: 'Ancient Indus Valley Ruins Guided Expedition', icon: 'school-outline', pricePerPerson: 800, desc: 'Expert archaeological guide through the 4,500-year-old Bronze Age city' },
    { id: 'mohenjo_bath', name: 'The Great Bath & Granary Discovery Walk', icon: 'walk-outline', pricePerPerson: 500, desc: 'Iconic prehistoric bath and urban planning discovery tour' },
    { id: 'mohenjo_museum', name: 'Mohenjo-daro Museum & Priest-King Relics', icon: 'ribbon-outline', pricePerPerson: 500, desc: 'Special museum gallery showcasing seals, pottery and bronze sculptures' },
  ],

  // --- Katas Raj & Khewra ---
  khewra: [
    { id: 'khewra_train', name: 'Khewra Salt Mine Electric Train & Salt Palace Tour', icon: 'train-outline', pricePerPerson: 1000, desc: 'Underground train ride through illuminated salt brick mosques & bridges' },
    { id: 'katas_temples', name: 'Katas Raj Sacred Temples & Holy Pond Heritage Walk', icon: 'ribbon-outline', pricePerPerson: 600, desc: 'Historic 7-temple Hindu complex and sacred pond guided tour' },
    { id: 'khewra_canyon', name: 'Salt Range Geological Canyon Safari', icon: 'car-sport-outline', pricePerGroup: 3500, desc: 'Scenic drive through dramatic prehistoric fossil valleys & red rock gorges' },
  ],

  // --- Quetta & Ziarat ---
  ziarat: [
    { id: 'ziarat_residency', name: 'Quaid-e-Azam Residency & Juniper Forest Pass', icon: 'home-outline', pricePerPerson: 600, desc: "Tour of the historic wooden summer retreat in the world's 2nd largest juniper forest" },
    { id: 'ziarat_prospect', name: 'Prospect Point Panoramic Hilltop 4x4 Safari', icon: 'trail-sign-outline', pricePerGroup: 2500, desc: 'Scenic 4x4 drive to the 8,800 ft cliff overlooking Chautair valley' },
  ],
  quetta: [
    { id: 'quetta_hanna', name: 'Hanna Lake Boating & Mountain Picnic Pass', icon: 'boat-outline', pricePerPerson: 1000, desc: 'Serene boating on turquoise Hanna Lake framed by rugged crags' },
    { id: 'quetta_wildlife', name: 'Hazarganji Chiltan National Park Wildlife Safari', icon: 'paw-outline', pricePerPerson: 1500, desc: 'Guided safari to spot rare Chiltan wild markhor and mountain ibex' },
    { id: 'quetta_bazaar', name: 'Liaquat Bazaar Afghan Carpets & Dry Fruit Trail', icon: 'restaurant-outline', pricePerPerson: 800, desc: 'Traditional dry fruits tasting, Peshawari/Quetta chappal & antique carpets' },
  ],

  // --- Kumrat Valley ---
  kumrat: [
    { id: 'kumrat_katora', name: 'Katora Lake Alpine Trekking Guide', icon: 'trail-sign-outline', pricePerGroup: 4500, desc: 'Guided trek to the bowl-shaped glacial lake surrounded by snowy peaks' },
    { id: 'kumrat_camping', name: 'Deodar Forest River Camping & Bonfire', icon: 'bonfire-outline', pricePerPerson: 2500, desc: 'Riverside tenting under towering deodars with stargazing campfire' },
    { id: 'kumrat_jeep', name: 'Kumrat Waterfall 4x4 Jeep Safari', icon: 'car-sport-outline', pricePerGroup: 5000, desc: 'Rugged jeep drive to the roaring cascading forest waterfalls' },
  ],

  // --- Chitral & Kalash ---
  chitral: [
    { id: 'kalash_culture', name: 'Kalash Valleys Cultural Immersion & Chilam Joshi Pass', icon: 'people-outline', pricePerPerson: 2500, desc: 'Unique indigenous animist culture, temple visits and traditional dance' },
    { id: 'chitral_markhor', name: 'Chitral Gol National Park Markhor Safari', icon: 'paw-outline', pricePerGroup: 3000, desc: "Wildlife ranger tour spotting Pakistan's national animal (Markhor)" },
    { id: 'chitral_shandur', name: 'Shandur Polo Ground Excursion', icon: 'trophy-outline', pricePerGroup: 6500, desc: "High mountain excursion to the world's highest polo ground (12,200 ft)" },
    { id: 'chitral_fort', name: 'Historic Shahi Mosque & Chitral Fort Tour', icon: 'shield-outline', pricePerPerson: 700, desc: 'Guided heritage walk through the ancient royal capital of Chitral' },
  ],

  // --- Gilgit, Naltar & Phander ---
  gilgit: [
    { id: 'gilgit_naltar', name: 'Naltar Valley Rainbow Lakes 4x4 Safari', icon: 'trail-sign-outline', pricePerGroup: 6500, desc: 'Thrilling 4x4 jeep expedition to green, blue and yellow crystal lakes' },
    { id: 'gilgit_buddha', name: 'Kargah Buddha 7th-Century Rock Relief Tour', icon: 'ribbon-outline', pricePerPerson: 500, desc: 'Historical relief carved high on cliffside along Kargah Nala' },
    { id: 'gilgit_phander', name: 'Phander Lake Trout Fishing & Riverside Camp', icon: 'fish-outline', pricePerPerson: 3000, desc: 'Catch-and-cook trout experience along emerald Phander waters' },
    { id: 'gilgit_rafting', name: 'Gilgit River Rafting & Suspension Bridge Walk', icon: 'water-outline', pricePerPerson: 2200, desc: 'River rapids thrill and traditional wooden cable bridge crossing' },
  ],

  // --- Deosai & Astore ---
  deosai: [
    { id: 'deosai_safari', name: 'Sheosar Lake & Himalayan Brown Bear 4x4 Safari', icon: 'trail-sign-outline', pricePerGroup: 8500, desc: "Land of Giants high plateau expedition spotting wild Himalayan bears" },
    { id: 'astore_rama', name: 'Rama Lake Alpine Pine Forest Trek', icon: 'walk-outline', pricePerPerson: 1500, desc: 'Scenic mountain trek through cedar forests to emerald Rama Lake' },
    { id: 'deosai_camp', name: 'High Plateau Stargazing & Alpine Camp', icon: 'bonfire-outline', pricePerPerson: 3000, desc: 'Overnight tenting under zero-light pollution Milky Way galaxy' },
  ],

  // --- Faisalabad ---
  faisalabad: [
    { id: 'fsb_clock_tower', name: 'Eight Bazaars & Clock Tower Heritage Tour', icon: 'time-outline', pricePerPerson: 600, desc: 'British architectural Union Jack 8-bazaar plan and Clock Tower Square' },
    { id: 'fsb_textile', name: 'Khaddi & Textile Artisan Weaver Tour', icon: 'color-palette-outline', pricePerPerson: 900, desc: 'Visit famous fabric mills, handloom khaddi centers and traditional bazaar' },
    { id: 'fsb_food', name: 'D-Ground & Katchery Bazaar Food Trail', icon: 'restaurant-outline', pricePerPerson: 1200, desc: 'Authentic Punjabi dal chawal, samosa chat and rabri kheer crawl' },
  ],

  // --- Sialkot ---
  sialkot: [
    { id: 'skt_iqbal', name: 'Iqbal Manzil National Poet Birthplace Tour', icon: 'book-outline', pricePerPerson: 500, desc: 'Historic residence and museum of Allama Muhammad Iqbal' },
    { id: 'skt_fort', name: 'Sialkot Fort (Raja Salban) & Ancient Mounds Walk', icon: 'shield-outline', pricePerPerson: 600, desc: '2,000-year-old fort ramparts and historic city overlook' },
    { id: 'skt_craft', name: 'Master Craftsmen Sports & Leather Artisan Tour', icon: 'trophy-outline', pricePerPerson: 1000, desc: 'Behind-the-scenes tour of FIFA World Cup soccer ball & leathercraft makers' },
  ],

  // --- Harappa ---
  harappa: [
    { id: 'hrp_ruins', name: 'Indus Valley Civilization Harappa Ruins Tour', icon: 'school-outline', pricePerPerson: 700, desc: 'Guided archaeological walk through 5,000-year-old granaries & city plan' },
    { id: 'hrp_museum', name: 'Harappa Archaeological Museum Pass', icon: 'ribbon-outline', pricePerPerson: 500, desc: 'Ancient terra-cotta toys, seals and copper tool collections' },
  ],

  // --- Thatta & Makli ---
  thatta: [
    { id: 'thatta_makli', name: 'UNESCO Makli Necropolis Royal Tombs Walk', icon: 'ribbon-outline', pricePerPerson: 700, desc: 'One of the world largest funerary sites with intricate stone carvings' },
    { id: 'thatta_shahjahan', name: 'Shah Jahan Mosque 100-Dome Acoustic Tour', icon: 'business-outline', pricePerPerson: 500, desc: 'Remarkable Mughal tilework and unique architectural acoustic domes' },
    { id: 'thatta_keenjhar', name: 'Keenjhar (Kalri) Lake Boating & Noori Shrine', icon: 'boat-outline', pricePerPerson: 1200, desc: 'Motorboat cruise to the mid-lake shrine of Noori Jam Tamachi' },
  ],

  // --- Hyderabad & Sukkur ---
  hyderabad: [
    { id: 'hyd_pacco_qillo', name: 'Pacco Qillo Fort & Talpur Mirs Tombs Tour', icon: 'shield-outline', pricePerPerson: 600, desc: 'Historic brick fortress built by Ghulam Shah Kalhoro in 1768' },
    { id: 'hyd_shahi_bazaar', name: 'Shahi Bazaar Glass Bangles & Choorian Walk', icon: 'color-palette-outline', pricePerPerson: 700, desc: 'Famous 2km covered bazaar for authentic glass bangles and Sindhi ajrak' },
    { id: 'hyd_kotri_boat', name: 'Indus River Sunset Boat Ride at Kotri Barrage', icon: 'boat-outline', pricePerPerson: 1000, desc: 'Scenic evening boat cruise on the Indus River with fresh river fish' },
  ],
  sukkur: [
    { id: 'sukkur_sadhubela', name: 'Sadhu Bela Island Temple Boat Ride', icon: 'boat-outline', pricePerPerson: 1200, desc: 'Serene river boat voyage to the sacred marble island temple in the Indus' },
    { id: 'sukkur_lansdowne', name: 'Lansdowne Bridge & Sukkur Barrage Museum', icon: 'business-outline', pricePerPerson: 600, desc: 'Historic 1889 cantilever railway bridge and 66-gate barrage engineering tour' },
    { id: 'sukkur_masoom', name: 'Masoom Shah Minaret Spiral Climb & Panorama', icon: 'eye-outline', pricePerPerson: 500, desc: 'Climb the 84-step red brick minaret for 360-degree views of Sukkur' },
  ],

  // --- Abbottabad & Thandiani ---
  abbottabad: [
    { id: 'abt_thandiani', name: 'Thandiani Summit Cloud Forest Ridge Walk', icon: 'trail-sign-outline', pricePerPerson: 1200, desc: 'High-altitude 9,000 ft tranquil pine ridge walk above the clouds' },
    { id: 'abt_ilyasi', name: 'Ilyasi Mosque Spring & Traditional Pakora Trail', icon: 'restaurant-outline', pricePerPerson: 600, desc: 'Historic spring-water mosque architecture and renowned mountain snacks' },
    { id: 'abt_shimla', name: 'Shimla Hill Viewpoint & Pine Forest Walk', icon: 'walk-outline', pricePerPerson: 500, desc: 'Scenic hill park viewpoint overlooking entire Abbottabad valley' },
  ],

  // --- Rawalakot & Banjosa Lake ---
  rawalakot: [
    { id: 'rwk_banjosa', name: 'Banjosa Lake Paddle Boating & Pine Picnic', icon: 'boat-outline', pricePerPerson: 1000, desc: 'Serene pine-encircled artificial lake boating and lakeside rest' },
    { id: 'rwk_toli_peer', name: 'Toli Peer 8,800 ft Mountain Top Trek', icon: 'trail-sign-outline', pricePerPerson: 1500, desc: 'Panoramic vast green hilltop with views of Poonch river and snow peaks' },
  ],
};

function getActivitiesForDestination(destName, categoryName) {
  const normalized = (destName || '').trim().toLowerCase();
  
  // 1. Direct city lookup
  if (normalized) {
    for (const [key, list] of Object.entries(DESTINATION_ACTIVITIES_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return list;
      }
    }
  }

  // 2. Category-based fallback
  const cat = (categoryName || '').toLowerCase();
  if (cat.includes('cultural') || cat.includes('historical')) {
    return [
      { id: 'cat_fort_pass', name: 'Historic Fortress & Heritage Site Guided Pass', icon: 'shield-outline', pricePerPerson: 700, desc: 'Official ticket and architectural guide to local forts, museums and heritage sites' },
      { id: 'cat_food_trail', name: 'Old Town Heritage & Traditional Food Street Walk', icon: 'restaurant-outline', pricePerPerson: 1500, desc: 'Guided evening walking tour through ancient bazaars and regional culinary delights' },
      { id: 'cat_artisan_craft', name: 'Traditional Artisan Workshop & Handicraft Crafting', icon: 'color-palette-outline', pricePerPerson: 1000, desc: 'Hands-on cultural souvenir workshop with local master craftsmen' },
      { id: 'cat_museum_pass', name: 'Archaeological Museum & Monument Pass', icon: 'school-outline', pricePerPerson: 500, desc: 'All-access admission to regional history museums and monuments' },
    ];
  }
  if (cat.includes('coastal') || cat.includes('beach')) {
    return [
      { id: 'cat_coast_boat', name: 'Coastal Speedboat & Jet Ski Ride', icon: 'boat-outline', pricePerPerson: 2000, desc: 'High-speed marine boating session and water sports thrill' },
      { id: 'cat_coast_scuba', name: 'Scuba Diving & Coral Reef Snorkeling', icon: 'water-outline', pricePerPerson: 4200, desc: 'Certified underwater snorkeling with equipment, guide and photos' },
      { id: 'cat_coast_quad', name: 'Beachfront Quad Biking & Camel Safari', icon: 'car-sport-outline', pricePerPerson: 1000, desc: 'Sand dune buggy riding and decorated camel tour along the coastline' },
      { id: 'cat_coast_cruise', name: 'Sunset Island Ferry Cruise & Seafood Grill', icon: 'restaurant-outline', pricePerGroup: 5000, desc: 'Evening boat cruise with panoramic sea views and fresh coastal fish' },
    ];
  }
  if (cat.includes('adventure') || cat.includes('nature')) {
    return [
      { id: 'cat_chairlift', name: 'Panoramic Mountain Chairlift & Cable Car', icon: 'trending-up-outline', pricePerPerson: 1200, desc: 'Scenic aerial cable car ride over mountain ridges and pine forests' },
      { id: 'cat_zipline', name: 'High-Altitude Mountain Zipline Flight', icon: 'airplane-outline', pricePerPerson: 1800, desc: 'Certified alpine zipline adventure across scenic valley gorge' },
      { id: 'cat_jeep_safari', name: '4x4 Off-Road Mountain Valley Safari', icon: 'trail-sign-outline', pricePerGroup: 6000, desc: 'Rugged 4x4 mountain trail excursion to hidden alpine viewpoints' },
      { id: 'cat_rafting', name: 'White Water Mountain River Rafting', icon: 'water-outline', pricePerPerson: 2500, desc: 'Certified river rafting thrill with life jackets and safety instructor' },
    ];
  }

  // Northern Areas & Universal Default
  return [
    { id: 'cat_lake_boat', name: 'Glacial Lake Boating & Speedboat Session', icon: 'boat-outline', pricePerPerson: 1800, desc: 'Scenic motorboat cruise on crystal turquoise alpine waters' },
    { id: 'cat_mountain_jeep', name: '4x4 Mountain Jeep Safari Expedition', icon: 'trail-sign-outline', pricePerGroup: 6500, desc: 'Exciting 4x4 jeep journey to alpine plateaus and high mountain passes' },
    { id: 'cat_fort_heritage', name: 'Ancient Mountain Fort & Royal Palace Pass', icon: 'shield-outline', pricePerPerson: 1000, desc: 'Guided tour of historical mountain citadels and royal valley landmarks' },
    { id: 'cat_stargazing', name: 'Alpine Campfire & Milky Way Stargazing Night', icon: 'flame-outline', pricePerPerson: 1200, desc: 'Overnight campfire under high-altitude unpolluted night skies' },
  ];
}

function getPresetDate(type) {
  const now = new Date();
  if (type === 'tomorrow') {
    now.setDate(now.getDate() + 1);
  } else if (type === 'weekend') {
    const day = now.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    now.setDate(now.getDate() + diff);
  } else if (type === 'nextWeek') {
    now.setDate(now.getDate() + 7);
  }
  return now.toISOString().split('T')[0];
}

function computeEndDate(startStr, numDays) {
  try {
    const d = new Date(startStr);
    if (isNaN(d.getTime())) return '';
    const endD = new Date(d.getTime() + Math.max(0, numDays - 1) * 24 * 60 * 60 * 1000);
    return endD.toISOString().split('T')[0];
  } catch (_) {
    return '';
  }
}

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validateJourneyDates(sDate, eDate, tripDays) {
  const today = getTodayStr();

  if (sDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(sDate)) {
      return `Invalid start date format. Please use YYYY-MM-DD (e.g. ${today}).`;
    }
    const [y, m, d] = sDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m - 1 || dateObj.getDate() !== d) {
      return 'Start date does not exist on calendar (invalid calendar date).';
    }
    if (sDate < today) {
      return `Start date cannot be in the past (${sDate}). Please select today (${today}) or a future date.`;
    }
  }

  if (eDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(eDate)) {
      return 'Invalid end date format. Please use YYYY-MM-DD.';
    }
    const [y, m, d] = eDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m - 1 || dateObj.getDate() !== d) {
      return 'End date does not exist on calendar (invalid calendar date).';
    }
    if (sDate && eDate < sDate) {
      return `End date (${eDate}) cannot be earlier than start date (${sDate}). Please select an end date on or after the start date.`;
    }
  }

  if (tripDays !== undefined && tripDays !== '') {
    const count = parseInt(tripDays, 10);
    if (isNaN(count) || count < 1) {
      return 'Total trip duration must be at least 1 day.';
    }
    if (count > 60) {
      return 'Maximum trip duration is 60 days.';
    }
  }

  return '';
}

export default function TripPlanningScreen({ navigation, route }) {
  const { preselectedDestination, preselectedCategory, initialTripMode } = route.params || {};
  const { user, generateTrip } = useApp();

  // 0. Journey Planning Mode (Supervisor handwritten breakdown)
  const [tripMode, setTripMode] = useState(initialTripMode || 'company'); // 'company' (Company Tour or Full Package) | 'customized' (Customize My Trip)
  const [transportRequired, setTransportRequired] = useState(true);
  const [hotelRequired, setHotelRequired] = useState(true);
  const [foodRequired, setFoodRequired] = useState(true);
  const [activitiesRequired, setActivitiesRequired] = useState(true);

  // Sync mode if navigated with explicit mode parameter
  useEffect(() => {
    if (initialTripMode) {
      setTripMode(initialTripMode);
      if (initialTripMode === 'company') {
        setTransportRequired(true);
        setHotelRequired(true);
        setFoodRequired(true);
        setActivitiesRequired(true);
        setFoodChoice('included');
        setTransportChoice('rental');
      }
    }
  }, [initialTripMode]);
  const [roomsQuantity, setRoomsQuantity] = useState(1);
  const [selectedMeals, setSelectedMeals] = useState({ breakfast: true, lunch: false, dinner: true });
  const [transportChoice, setTransportChoice] = useState('rental'); // 'rental' | 'own'
  const [preferredRoute, setPreferredRoute] = useState('Hazara Motorway (M-15) + Karakoram Highway (KKH / N-35)');
  const [customRouteInput, setCustomRouteInput] = useState('');
  const [foodChoice, setFoodChoice] = useState('included'); // 'included' | 'self'
  const [selectedOptionalActivities, setSelectedOptionalActivities] = useState([]);

  // 1. Category & Destination State
  const [category, setCategory] = useState(preselectedCategory || 'Northern Areas');
  const [destination, setDestination] = useState(preselectedDestination || 'Hunza Valley');

  // Compute destination-specific activities dynamically based on selected city
  const currentActivitiesList = useMemo(() => {
    return getActivitiesForDestination(destination, category);
  }, [destination, category]);

  // Reset selected optional activities when destination changes so no mismatched activities remain selected
  useEffect(() => {
    setSelectedOptionalActivities([]);
  }, [destination]);

  // 2. Journey Origin / Departure Point
  const [startLocation, setStartLocation] = useState('Islamabad / Rawalpindi');

  // 3. Journey Dates & Duration (all fields clear initially for manual user entry)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState('');
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [calendarPickerMode, setCalendarPickerMode] = useState('start'); // 'start' | 'end'
  const [dateError, setDateError] = useState('');

  // 4. Tour Group Size & Budget (all fields clear initially for manual user entry)
  const [numberOfPersons, setNumberOfPersons] = useState('');
  const [malesInput, setMalesInput] = useState('');
  const [femalesInput, setFemalesInput] = useState('');
  const [budgetPerPerson, setBudgetPerPerson] = useState('');
  const [budget, setBudget] = useState('');
  const [travelerGender, setTravelerGender] = useState('mixed'); // 'male' | 'female' | 'mixed'
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [vehicleType, setVehicleType] = useState('Economy-Alto');
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [driverRequired, setDriverRequired] = useState(true);

  // Dynamic destination-specific food menu
  const [foodMenuData, setFoodMenuData] = useState(null);
  const [foodMenuLoading, setFoodMenuLoading] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState({ breakfast: [], lunch: [], dinner: [] });

  // Priority budget shortfall proposal interactive modal
  const [shortfallModalVisible, setShortfallModalVisible] = useState(false);
  const [activeShortfallProposal, setActiveShortfallProposal] = useState(null);

  // Live GPS Geolocation
  const [gpsLoading, setGpsLoading] = useState(false);

  // Travel Style
  const [travelType, setTravelType] = useState('Family');
  const [selectedInterests, setSelectedInterests] = useState(['Nature', 'Sightseeing', 'Food']);
  const [transportation, setTransportation] = useState('Private Car');
  const [comfortLevel, setComfortLevel] = useState('Normal');

  // In-App Hotel State
  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [hotelUnavailableNotice, setHotelUnavailableNotice] = useState(null);
  const [alternativeHotels, setAlternativeHotels] = useState([]);

  // Submitting
  const [generating, setGenerating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Synchronization & Calendar helpers
  function openCalendarPicker(mode) {
    setCalendarPickerMode(mode);
    setCalendarModalVisible(true);
  }

  function handleCalendarSelect(selectedDateStr) {
    if (calendarPickerMode === 'start') {
      handleStartDateSelect(selectedDateStr);
    } else {
      handleEndDateSelect(selectedDateStr);
    }
  }

  function handleStartDateSelect(newStart) {
    setStartDate(newStart);
    let nextEndDate = endDate;
    let nextDays = days;

    if (endDate) {
      if (endDate < newStart) {
        const dCount = parseInt(days, 10) || 3;
        nextEndDate = computeEndDate(newStart, dCount);
        setEndDate(nextEndDate);
      } else {
        try {
          const s = new Date(newStart);
          const e = new Date(endDate);
          const diffDays = Math.round((e - s) / (24 * 60 * 60 * 1000)) + 1;
          if (diffDays >= 1) {
            nextDays = String(diffDays);
            setDays(nextDays);
          }
        } catch (_) {}
      }
    } else if (days) {
      const dCount = parseInt(days, 10);
      if (dCount > 0) {
        nextEndDate = computeEndDate(newStart, dCount);
        setEndDate(nextEndDate);
      }
    }

    const err = validateJourneyDates(newStart, nextEndDate, nextDays);
    setDateError(err);
  }

  function handleEndDateSelect(newEnd) {
    setEndDate(newEnd);
    let nextDays = days;

    if (startDate) {
      if (newEnd < startDate) {
        const err = `End date (${newEnd}) cannot be earlier than start date (${startDate}).`;
        setDateError(err);
        return;
      }
      try {
        const s = new Date(startDate);
        const e = new Date(newEnd);
        const diffDays = Math.round((e - s) / (24 * 60 * 60 * 1000)) + 1;
        if (diffDays >= 1) {
          nextDays = String(diffDays);
          setDays(nextDays);
        }
      } catch (_) {}
    }

    const err = validateJourneyDates(startDate, newEnd, nextDays);
    setDateError(err);
  }

  function handleStartDateChange(text) {
    setStartDate(text);
    if (text.length >= 10) {
      handleStartDateSelect(text);
    } else {
      const err = text.length > 0 ? validateJourneyDates(text, endDate, days) : '';
      setDateError(err);
    }
  }

  function handleEndDateChange(text) {
    setEndDate(text);
    if (text.length >= 10) {
      handleEndDateSelect(text);
    } else {
      const err = text.length > 0 ? validateJourneyDates(startDate, text, days) : '';
      setDateError(err);
    }
  }

  function handleDaysChange(text) {
    const clean = String(text ?? '').replace(/[^0-9]/g, '');
    setDays(clean);
    const num = parseInt(clean, 10);
    let nextEnd = endDate;
    if (!isNaN(num) && num > 0 && startDate) {
      nextEnd = computeEndDate(startDate, num);
      setEndDate(nextEnd);
    }
    const err = validateJourneyDates(startDate, nextEnd, clean);
    setDateError(err);
  }

  function getRecommendedRooms(personsCount, ppBudget, totBudget) {
    const p = Math.max(1, Number(personsCount) || 1);
    const pp = Number(ppBudget) || (p > 0 ? Number(totBudget) / p : 0) || 0;
    // For low / tight budget (<= 12,000 PKR per person), allocate Family Quad Room (up to 4 per room)
    if (pp > 0 && pp <= 12000) {
      return Math.max(1, Math.ceil(p / 4));
    }
    return Math.max(1, Math.ceil(p / 2));
  }

  function handleMalesChange(text) {
    const clean = String(text ?? '').replace(/[^0-9]/g, '');
    setMalesInput(clean);
    const m = parseInt(clean, 10) || 0;
    const f = parseInt(femalesInput, 10) || 0;
    const total = m + f;
    setMaleCount(m);
    setFemaleCount(f);
    setNumberOfPersons(total > 0 ? String(total) : '');

    if (m > 0 && f === 0) setTravelerGender('male');
    else if (f > 0 && m === 0) setTravelerGender('female');
    else setTravelerGender('mixed');

    if (total > 0) {
      const perPerson = Number(budgetPerPerson) || 0;
      setRoomsQuantity(getRecommendedRooms(total, perPerson, total * perPerson));
      if (perPerson > 0) {
        setBudget(String(total * perPerson));
      }
    } else if (budgetPerPerson) {
      setBudget(String(budgetPerPerson));
    } else {
      setBudget('');
    }
  }

  function handleFemalesChange(text) {
    const clean = String(text ?? '').replace(/[^0-9]/g, '');
    setFemalesInput(clean);
    const f = parseInt(clean, 10) || 0;
    const m = parseInt(malesInput, 10) || 0;
    const total = m + f;
    setMaleCount(m);
    setFemaleCount(f);
    setNumberOfPersons(total > 0 ? String(total) : '');

    if (m > 0 && f === 0) setTravelerGender('male');
    else if (f > 0 && m === 0) setTravelerGender('female');
    else setTravelerGender('mixed');

    if (total > 0) {
      const perPerson = Number(budgetPerPerson) || 0;
      setRoomsQuantity(getRecommendedRooms(total, perPerson, total * perPerson));
      if (perPerson > 0) {
        setBudget(String(total * perPerson));
      }
    } else if (budgetPerPerson) {
      setBudget(String(budgetPerPerson));
    } else {
      setBudget('');
    }
  }

  function handlePersonsChange(text) {
    const clean = String(text ?? '').replace(/[^0-9]/g, '');
    setNumberOfPersons(clean);
    const count = parseInt(clean, 10);
    if (!isNaN(count) && count > 0) {
      const perPerson = Number(budgetPerPerson) || 0;
      setRoomsQuantity(getRecommendedRooms(count, perPerson, count * perPerson));
      if (perPerson > 0) {
        setBudget(String(count * perPerson));
      }
      const m = parseInt(malesInput, 10) || 0;
      const f = parseInt(femalesInput, 10) || 0;
      if (m + f !== count) {
        const half = Math.ceil(count / 2);
        setMalesInput(String(half));
        setFemalesInput(String(Math.max(0, count - half)));
        setMaleCount(half);
        setFemaleCount(Math.max(0, count - half));
      }
    } else {
      setBudget('');
      setMalesInput('');
      setFemalesInput('');
      setMaleCount(0);
      setFemaleCount(0);
    }
  }

  function handleBudgetPerPersonChange(text) {
    const clean = String(text ?? '').replace(/[^0-9]/g, '');
    setBudgetPerPerson(clean);
    const perPerson = Number(clean) || 0;
    const m = parseInt(malesInput, 10) || 0;
    const f = parseInt(femalesInput, 10) || 0;
    const count = parseInt(numberOfPersons, 10) || (m + f) || 1;
    if (perPerson > 0) {
      setBudget(String(perPerson * count));
      setRoomsQuantity(getRecommendedRooms(count, perPerson, perPerson * count));
    } else {
      setBudget('');
    }
  }

  function handleTotalBudgetChange(text) {
    const clean = String(text ?? '').replace(/[^0-9]/g, '');
    setBudget(clean);
    const total = Number(clean) || 0;
    const count = parseInt(numberOfPersons, 10) || 0;
    if (total > 0 && count > 0) {
      setBudgetPerPerson(String(Math.round(total / count)));
    } else {
      setBudgetPerPerson('');
    }
  }

  // Sync category when preselectedDestination changes
  useEffect(() => {
    if (preselectedCategory) {
      setCategory(preselectedCategory);
    }
  }, [preselectedCategory]);

  useEffect(() => {
    if (preselectedDestination) {
      setDestination(preselectedDestination);
    }
  }, [preselectedDestination]);

  // Group size & duration safe numbers
  const numDays = Math.max(0, parseInt(days, 10) || 0);
  const numPersons = Math.max(0, parseInt(numberOfPersons, 10) || 0);
  const numBudget = Number(budget) || 0;
  const numBudgetPerPerson = Number(budgetPerPerson) || 0;
  const nights = Math.max(0, numDays > 1 ? numDays - 1 : (numDays === 1 ? 1 : 0));

  // Supervisor Rule: If budget is low, system manages hotel stay & transport while customer handles food on their own
  const isLowBudget = useMemo(() => {
    if (numBudget <= 0 || numDays <= 0 || numPersons <= 0) return false;
    return numBudget < (numPersons * numDays * 3500);
  }, [numBudget, numDays, numPersons]);

  // Allocation formula: If company mode, 10% company profit is deducted from budget
  const companyProfit = (tripMode === 'company') ? Math.round(numBudget * 0.10) : 0;
  const allocTransport = isLowBudget
    ? ((tripMode === 'company') ? Math.round(numBudget * 0.43) : Math.round(numBudget * 0.46))
    : ((tripMode === 'company') ? Math.round(numBudget * 0.30) : Math.round(numBudget * 0.35));
  const allocHotel = isLowBudget
    ? ((tripMode === 'company') ? Math.round(numBudget * 0.43) : Math.round(numBudget * 0.50))
    : Math.round(numBudget * 0.35);
  const allocFood = isLowBudget ? 0 : Math.round(numBudget * 0.15);
  const allocActivities = isLowBudget
    ? 0
    : ((tripMode === 'company') ? Math.round(numBudget * 0.05) : Math.round(numBudget * 0.10));
  const allocSafety = Math.round(numBudget * ((tripMode === 'company') ? 0.05 : 0.04));
  // Daily budget per room per night (hotel allocation divided by total room-nights)
  const dailyHotelBudget = (nights > 0 && roomsQuantity > 0) ? Math.round(allocHotel / (nights * roomsQuantity)) : allocHotel;

  // Fetch destination-specific hotels when destination, budget, or days change
  useEffect(() => {
    if (!destination.trim() || !hotelRequired) return;
    let active = true;

    async function loadHotels() {
      setHotelsLoading(true);
      setHotelUnavailableNotice(null);
      try {
        const res = await apiRequest(
          `/hotels?city=${encodeURIComponent(destination.trim())}&budget=${numBudget}&days=${numDays || 1}&comfortLevel=${comfortLevel}&dailyHotelBudget=${dailyHotelBudget}&roomsQuantity=${roomsQuantity}&numberOfPersons=${numPersons}`
        );
        if (active) {
          const list = res.hotels || [];
          setHotels(list);
          if (list.length > 0) {
            // Auto-select first hotel that is within budget
            const withinBudgetChoice = list.find((h) => h.withinBudget) || list[0];
            setSelectedHotel(withinBudgetChoice);
            setSelectedRoom(withinBudgetChoice.defaultRoom || withinBudgetChoice.rooms?.[0] || null);
          } else {
            setSelectedHotel(null);
            setSelectedRoom(null);
          }
        }
      } catch (_) {
        if (active) setHotels([]);
      } finally {
        if (active) setHotelsLoading(false);
      }
    }

    loadHotels();
    return () => { active = false; };
  }, [destination, numBudget, numDays, comfortLevel, hotelRequired, dailyHotelBudget, roomsQuantity, numPersons]);

  // Clear hotel state when user selects NO hotel
  useEffect(() => {
    if (!hotelRequired) {
      setHotels([]);
      setSelectedHotel(null);
      setSelectedRoom(null);
    }
  }, [hotelRequired]);

  // Handle hotel selection & availability check
  async function handleSelectHotel(hotel) {
    setHotelUnavailableNotice(null);
    setAlternativeHotels([]);

    try {
      const room = hotel.rooms?.[0] || hotel.defaultRoom;
      const res = await apiRequest('/hotels/check-availability', {
        method: 'POST',
        body: {
          hotelId: hotel.id,
          roomId: room?.id,
          days: numDays || 1,
          roomsQuantity,
          budget: numBudget,
        },
      });

      if (!res.available) {
        setHotelUnavailableNotice(res.message || 'Sorry, this hotel is currently unavailable.');
        setAlternativeHotels(res.alternativeHotels || []);
        return;
      }

      setSelectedHotel(hotel);
      setSelectedRoom(room || null);
    } catch (_) {
      setSelectedHotel(hotel);
      setSelectedRoom(hotel.rooms?.[0] || hotel.defaultRoom || null);
    }
  }

  function notifyUser(title, message) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  function handleSelectRoom(room) {
    if (room.available === 0) {
      notifyUser(
        'Room Unavailable',
        'This specific room type is currently fully booked. Please select another room or hotel.'
      );
      return;
    }
    setSelectedRoom(room);
  }

  function toggleInterest(interest) {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest]
    );
  }

  function toggleOptionalActivity(id) {
    setSelectedOptionalActivities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  // Journey mode flags
  const isCompany = tripMode === 'company';
  const isTransportNeeded = Boolean(transportRequired);
  const isHotelNeeded = Boolean(hotelRequired);
  const isFoodNeeded = isLowBudget ? false : Boolean(foodRequired);
  const isActivitiesNeeded = isLowBudget ? false : Boolean(activitiesRequired);
  const isOwnCar = isTransportNeeded && transportChoice === 'own';

  // Filter vehicles strictly by capacity and budget (shows MULTIPLE cars within budget)
  const matchingVehicles = useMemo(() => {
    const tripDays = Math.max(1, numDays);
    const mCount = parseInt(malesInput, 10) || 0;
    const fCount = parseInt(femalesInput, 10) || 0;
    const count = parseInt(numberOfPersons, 10) || (mCount + fCount) || 1;

    // Determine user's budget ceiling
    const rawBudget = Number(budget) || 0;
    const ppBudget = Number(budgetPerPerson) || 0;
    const effectiveTotal = rawBudget > 0 ? rawBudget : (ppBudget > 0 ? ppBudget * count : 0);
    // Flexible daily/per-person budget limit
    const budgetLimit = Math.max(
      effectiveTotal,
      ppBudget,
      tripDays > 1 ? Math.round(effectiveTotal / tripDays) : 0
    );

    // 1. Capacity filtering based on actual group size (v.maxPersons >= count)
    let list = RENTAL_VEHICLES.filter((v) => v.maxPersons >= count);

    // Reasonable upper limits so 2 people don't see a 24-seater bus
    if (count <= 3) {
      list = list.filter((v) => v.maxPersons <= 5);
    } else if (count === 4) {
      list = list.filter((v) => v.maxPersons <= 7);
    } else if (count <= 6) {
      list = list.filter((v) => v.maxPersons >= 4 && v.maxPersons <= 11);
    } else if (count <= 12) {
      list = list.filter((v) => v.maxPersons >= 7 && v.maxPersons <= 14);
    } else {
      list = list.filter((v) => v.maxPersons >= 13);
    }

    const computed = list.map((veh) => {
      const vehRent = veh.rentPerDay * tripDays;
      const vehFuel = veh.fuelPerDay * tripDays;
      const toll = 800 * tripDays;
      const totalCost = vehRent + vehFuel + toll;
      return {
        ...veh,
        vehRentTotal: vehRent,
        tripTotalCost: totalCost,
      };
    });

    // 2. Budget filter: Show MULTIPLE cars within budget
    if (budgetLimit > 0) {
      const affordable = computed.filter((veh) => {
        return (
          veh.rentPerDay <= budgetLimit ||
          (effectiveTotal > 0 && veh.vehRentTotal <= effectiveTotal) ||
          (effectiveTotal > 0 && veh.rentPerDay <= effectiveTotal)
        );
      });

      if (affordable.length > 0) {
        return affordable.map((v) => ({ ...v, fitsBudget: true }));
      }

      // If budget is lower than any vehicle rent (e.g. 1000), show top 3 lowest-cost cars so user has multiple options!
      const topLowest = [...computed].sort((a, b) => a.rentPerDay - b.rentPerDay).slice(0, 3);
      return topLowest.map((v) => ({ ...v, fitsBudget: false, budgetTooLow: true }));
    }

    return computed.map((v) => ({ ...v, fitsBudget: true }));
  }, [numberOfPersons, malesInput, femalesInput, budget, budgetPerPerson, numDays]);

  // Keep vehicleType in sync with matching vehicles
  useEffect(() => {
    if (matchingVehicles.length > 0) {
      const exists = matchingVehicles.some((v) => v.id === vehicleType);
      if (!exists) {
        setVehicleType(matchingVehicles[0].id);
      }
    }
  }, [matchingVehicles, vehicleType]);

  // Multi-vehicle and transport calculation
  const currentVehicle = matchingVehicles.find((v) => v.id === vehicleType) || RENTAL_VEHICLES.find((v) => v.id === vehicleType) || RENTAL_VEHICLES[0];
  const vehicleCapacity = currentVehicle.maxPersons || 4;
  const vehiclesRequired = Math.max(1, Math.ceil(numPersons / vehicleCapacity));
  const vehicleRentTotal = (!isTransportNeeded || isOwnCar) ? 0 : (vehiclesRequired * currentVehicle.rentPerDay * (numDays || 1));
  const vehicleFuelTotal = (!isTransportNeeded || isOwnCar) ? 0 : (vehiclesRequired * currentVehicle.fuelPerDay * (numDays || 1));
  const driverCharges = (!isTransportNeeded || isOwnCar || !driverRequired) ? 0 : (vehiclesRequired * 2000 * (numDays || 1));
  const tollParkingEstimate = (!isTransportNeeded || isOwnCar) ? 0 : (vehiclesRequired * 800 * (numDays || 1));
  const rawVehicleCost = (!isTransportNeeded || isOwnCar) ? 0 : (vehicleRentTotal + vehicleFuelTotal + driverCharges + tollParkingEstimate);

  // Hotel calculations (room price * nights * roomsQuantity)
  const roomPricePerNight = selectedRoom?.price || selectedRoom?.pricePerNight || selectedHotel?.pricePerNight || 3200;
  const rawHotelCost = (!hotelRequired || !isHotelNeeded)
    ? 0
    : (roomPricePerNight * nights * roomsQuantity);

  // Food calculations: destination menu item prices or standard breakfast/lunch/dinner
  const destinationBfPrice = foodMenuData?.menu?.breakfast?.defaultPricePerPerson || foodMenuData?.menu?.breakfast?.items?.[0]?.price || 450;
  const destinationLunchPrice = foodMenuData?.menu?.lunch?.defaultPricePerPerson || foodMenuData?.menu?.lunch?.items?.[0]?.price || 850;
  const destinationDinnerPrice = foodMenuData?.menu?.dinner?.defaultPricePerPerson || foodMenuData?.menu?.dinner?.items?.[0]?.price || 1200;

  let dailyMealRate = 0;
  if (!foodRequired || !isFoodNeeded || foodChoice === 'self') {
    dailyMealRate = 0;
  } else if (isCompany) {
    dailyMealRate = destinationBfPrice + destinationDinnerPrice; // Daily breakfast buffet and gourmet dinner included in Company Package
  } else {
    // Customized mode: sum dishes or meal toggles
    let dishRate = 0;
    if (selectedDishes.breakfast.length > 0) {
      dishRate += selectedDishes.breakfast.reduce((s, d) => s + (d.price || 0), 0);
    } else if (selectedMeals.breakfast) {
      dishRate += destinationBfPrice;
    }

    if (selectedDishes.lunch.length > 0) {
      dishRate += selectedDishes.lunch.reduce((s, d) => s + (d.price || 0), 0);
    } else if (selectedMeals.lunch) {
      dishRate += destinationLunchPrice;
    }

    if (selectedDishes.dinner.length > 0) {
      dishRate += selectedDishes.dinner.reduce((s, d) => s + (d.price || 0), 0);
    } else if (selectedMeals.dinner) {
      dishRate += destinationDinnerPrice;
    }

    dailyMealRate = dishRate;
  }
  const rawFoodCost = dailyMealRate * numPersons * (numDays || 1);

  // Optional Activities calculations
  const calculatedActivitiesCost = (!isActivitiesNeeded)
    ? 0
    : (isCompany
      ? 0
      : selectedOptionalActivities.reduce((sum, actId) => {
          const item = currentActivitiesList.find((a) => a.id === actId);
          if (!item) return sum;
          const cost = item.pricePerGroup ? item.pricePerGroup : (item.pricePerPerson * numPersons);
          return sum + cost;
        }, 0));

  // Dynamic destination-specific food menu fetch
  useEffect(() => {
    if (!destination || !destination.trim()) return;
    let active = true;

    async function fetchMenu() {
      setFoodMenuLoading(true);
      try {
        const res = await apiRequest(`/budget/food-menu?destination=${encodeURIComponent(destination.trim())}`);
        if (active && res && res.menu) {
          setFoodMenuData(res);
          // Automatically reset selected dishes on destination change (Supervisor Test J)
          setSelectedDishes({ breakfast: [], lunch: [], dinner: [] });
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (active) setFoodMenuLoading(false);
      }
    }

    fetchMenu();
    return () => { active = false; };
  }, [destination]);

  // Live GPS Geolocation
  async function handleUseGpsLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      notifyUser('GPS Unavailable', 'Geolocation is not supported by your current browser or device.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
            headers: { 'User-Agent': 'SmartTravelPlanner-App/1.0' },
          });
          const data = await res.json();
          const city = data?.address?.city || data?.address?.town || data?.address?.county || data?.address?.state || 'Current Location';
          setStartLocation(city);
          notifyUser('Live Location Detected', `Your starting origin is set to ${city}.`);
        } catch (_) {
          setStartLocation('Current Location');
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsLoading(false);
        notifyUser('Location Access', 'Could not access GPS location. Please allow location permissions or type your city.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // Handle user response to shortfall proposal
  function handleApplyShortfallOption(opt) {
    if (opt.adjustedDays) {
      setDays(String(opt.adjustedDays));
      setEndDate(computeEndDate(startDate, opt.adjustedDays));
      notifyUser('Trip Adjusted', `Journey duration updated to ${opt.adjustedDays} days to fit within your budget.`);
    }
    if (opt.selfManaged) {
      if (activeShortfallProposal?.service === 'transport') setTransportChoice('own');
      if (activeShortfallProposal?.service === 'food') setFoodChoice('self');
      if (activeShortfallProposal?.service === 'hotel') setHotelRequired(false);
      notifyUser('Service Adjusted', 'Service set to self-arranged (cost PKR 0 in package).');
    }
    if (opt.comfortLevel) {
      setComfortLevel(opt.comfortLevel);
      notifyUser('Hotel Tier Adjusted', 'Updated to budget-friendly lodging.');
    }
    setShortfallModalVisible(false);
  }

  // PRIORITY SEQUENTIAL BUDGET ENGINE (Priority 1: Transport -> Priority 2: Food -> Priority 3: Hotel -> Priority 4: Activities)
  const priorityResult = useMemo(() => {
    let unallocated = numBudget;
    const breakdown = {
      transport: { allocatedCost: 0, actualCost: rawVehicleCost, status: 'unselected', details: '', isSelfManaged: isOwnCar },
      food: { allocatedCost: 0, actualCost: rawFoodCost, status: 'unselected', details: '', isSelfManaged: (!foodRequired || foodChoice === 'self') },
      hotel: { allocatedCost: 0, actualCost: rawHotelCost, status: 'unselected', details: '', isSelfManaged: (!hotelRequired || !isHotelNeeded) },
      activities: { allocatedCost: 0, actualCost: calculatedActivitiesCost, status: 'unselected', details: '' },
    };
    const proposals = [];

    // Priority 1: Transport
    if (isTransportNeeded && !isOwnCar && rawVehicleCost > 0) {
      if (unallocated >= rawVehicleCost) {
        breakdown.transport.allocatedCost = rawVehicleCost;
        breakdown.transport.status = 'covered';
        breakdown.transport.details = `${vehiclesRequired} x ${currentVehicle.name} (${vehicleCapacity} seats) for ${numDays || 1} days`;
        unallocated -= rawVehicleCost;
      } else {
        breakdown.transport.allocatedCost = rawVehicleCost;
        breakdown.transport.status = 'shortfall';
        const singleDayTransport = Math.max(1, Math.round(rawVehicleCost / Math.max(1, numDays || 1)));
        const affordableDays = Math.max(1, Math.floor(unallocated / singleDayTransport));
        const adjustedCost = affordableDays * singleDayTransport;
        const remainingAfterAdjusted = Math.max(0, numBudget - adjustedCost);
        proposals.push({
          service: 'transport',
          message: `The total cost for ${numDays || 1} days of transportation is PKR ${rawVehicleCost.toLocaleString()}, which exceeds your PKR ${numBudget.toLocaleString()} budget. You can either arrange transport on your own (cost: PKR 0) or accept a ${affordableDays}-day package for PKR ${adjustedCost.toLocaleString()} with PKR ${remainingAfterAdjusted.toLocaleString()} remaining.`,
          options: [
            { id: 'accept_adjusted_days', label: `Accept ${affordableDays}-day package (PKR ${adjustedCost.toLocaleString()})`, adjustedDays: affordableDays, cost: adjustedCost },
            { id: 'manage_own_transport', label: 'Arrange transport on my own (Cost: PKR 0)', selfManaged: true, cost: 0 },
          ],
        });
      }
    } else if (isTransportNeeded && isOwnCar) {
      breakdown.transport.status = 'self_arranged';
      breakdown.transport.details = 'Personal vehicle (PKR 0 rental)';
    }

    // Priority 2: Hotel & Lodging
    if (isHotelNeeded && hotelRequired && rawHotelCost > 0) {
      if (unallocated >= rawHotelCost) {
        breakdown.hotel.allocatedCost = rawHotelCost;
        breakdown.hotel.status = 'covered';
        breakdown.hotel.details = `${roomsQuantity} room(s) x ${nights} night(s)`;
        unallocated -= rawHotelCost;
      } else {
        breakdown.hotel.status = 'dropped';
        breakdown.hotel.allocatedCost = 0;
        breakdown.hotel.details = 'Budget shortfall for selected hotel stay';
        breakdown.hotel.isSelfManaged = true;
        proposals.push({
          service: 'hotel',
          message: `Your transportation can be arranged within your budget (PKR ${rawVehicleCost.toLocaleString()}), but your remaining budget (PKR ${unallocated.toLocaleString()}) cannot cover the selected hotel stay (PKR ${rawHotelCost.toLocaleString()}). You can choose budget-friendly guest houses or self-arrange accommodation for PKR 0 in package.`,
          options: [
            { id: 'self_arranged_hotel', label: 'Self-arrange accommodation (PKR 0 in package)', selfManaged: true, cost: 0 },
            { id: 'switch_budget_hotel', label: 'Switch to Budget Guest House', comfortLevel: 'Basic' },
          ],
        });
      }
    } else {
      breakdown.hotel.status = 'self_arranged';
      breakdown.hotel.allocatedCost = 0;
      breakdown.hotel.details = 'Self-arranged / No hotel required (PKR 0)';
    }

    // Priority 3: Food & Meals
    if (isFoodNeeded && foodRequired && rawFoodCost > 0 && foodChoice !== 'self') {
      if (unallocated >= rawFoodCost) {
        breakdown.food.allocatedCost = rawFoodCost;
        breakdown.food.status = 'covered';
        breakdown.food.details = `${numPersons} persons x ${numDays || 1} days`;
        unallocated -= rawFoodCost;
      } else {
        breakdown.food.status = 'dropped';
        breakdown.food.allocatedCost = 0;
        breakdown.food.details = 'Budget shortfall: meals self-arranged at local eateries (PKR 0 in package)';
        breakdown.food.isSelfManaged = true;
        const coveredList = [];
        if (breakdown.transport.status === 'covered') coveredList.push('transportation');
        if (breakdown.hotel.status === 'covered') coveredList.push('hotel stay');
        const coveredPrefix = coveredList.length > 0 ? `Your ${coveredList.join(' and ')} can be arranged, but your` : 'Your';
        proposals.push({
          service: 'food',
          message: `${coveredPrefix} remaining budget (PKR ${unallocated.toLocaleString()}) cannot cover company dining (PKR ${rawFoodCost.toLocaleString()}). Dining can be self-arranged at local eateries for PKR 0 in your package.`,
          options: [
            { id: 'self_arranged_food', label: 'Self-arrange meals at local eateries (PKR 0)', selfManaged: true, cost: 0 },
          ],
        });
      }
    } else {
      breakdown.food.status = 'self_arranged';
      breakdown.food.allocatedCost = 0;
      breakdown.food.details = 'Self-arranged by customer (PKR 0)';
    }

    // Priority 4: Activities
    if (isActivitiesNeeded && calculatedActivitiesCost > 0) {
      if (unallocated >= calculatedActivitiesCost) {
        breakdown.activities.allocatedCost = calculatedActivitiesCost;
        breakdown.activities.status = 'covered';
        breakdown.activities.details = `${selectedOptionalActivities.length} adventure activity(s)`;
        unallocated -= calculatedActivitiesCost;
      } else {
        breakdown.activities.status = 'dropped';
        breakdown.activities.details = 'Excluded to fit within budget (standard sightseeing is free)';
      }
    } else {
      breakdown.activities.status = 'covered';
      breakdown.activities.details = isCompany ? 'Standard sights entry coordination included' : 'No paid activities selected';
    }

    const totalCovered = breakdown.transport.allocatedCost + breakdown.food.allocatedCost + breakdown.hotel.allocatedCost + breakdown.activities.allocatedCost + companyProfit;
    const finalRemaining = Math.max(0, numBudget - totalCovered);
    const hasShortfall = proposals.length > 0 || (breakdown.transport.status === 'shortfall');

    return {
      breakdown,
      totalIncurred: totalCovered,
      remainingBudget: finalRemaining,
      hasShortfall,
      shortfallProposals: proposals,
      perPersonCost: Math.round(totalCovered / Math.max(1, numPersons)),
    };
  }, [numBudget, isTransportNeeded, isOwnCar, rawVehicleCost, vehiclesRequired, currentVehicle, vehicleCapacity, numDays, driverRequired, isFoodNeeded, foodRequired, foodChoice, rawFoodCost, numPersons, isHotelNeeded, hotelRequired, rawHotelCost, roomsQuantity, nights, isActivitiesNeeded, calculatedActivitiesCost, selectedOptionalActivities, isCompany, companyProfit]);

  const totalIncurred = priorityResult.totalIncurred;
  const remainingBudget = priorityResult.remainingBudget;
  const perPersonIncurred = priorityResult.perPersonCost;
  const budgetExceeded = priorityResult.hasShortfall;
  const budgetShortfall = Math.max(0, (rawVehicleCost + rawFoodCost + rawHotelCost + calculatedActivitiesCost + companyProfit) - numBudget);
  const estimatedVehicleCost = priorityResult.breakdown.transport.allocatedCost;
  const hotelTotalCost = priorityResult.breakdown.hotel.allocatedCost;
  const foodTotalCost = priorityResult.breakdown.food.allocatedCost;

  // Auto-fit function: 1-click optimization
  function handleAutoFitBudget() {
    setVehicleType('Economy-Mehran');
    setComfortLevel('Basic');
    if (!isCompany) {
      setSelectedMeals((prev) => ({ ...prev, lunch: false }));
    }
  }

  // Individual optimization helper
  function applyOptimization(suggestion) {
    if (suggestion.type === 'vehicle') {
      setVehicleType('Economy-Mehran');

    } else if (suggestion.type === 'hotel') {
      setComfortLevel('Basic');
    } else if (suggestion.type === 'food') {
      setSelectedMeals((prev) => ({ ...prev, lunch: false }));
    } else if (suggestion.type === 'transportChoice') {
      setTransportChoice('own');
    }
  }

  // Active optimization suggestions computed live on frontend
  const liveSuggestions = useMemo(() => {
    if (!budgetExceeded) return [];
    const suggestions = [];

    // Vehicle downgrade
    if (isTransportNeeded && !isOwnCar && vehicleType !== 'Economy-Mehran') {
      const mehran = RENTAL_VEHICLES[0];
      const savings = (currentVehicle.rentPerDay - mehran.rentPerDay + currentVehicle.fuelPerDay - mehran.fuelPerDay) * (numDays || 1);
      if (savings > 0) {
        suggestions.push({
          id: 'opt_vehicle',
          type: 'vehicle',
          title: `Switch to ${mehran.name}`,
          desc: `Save fuel and vehicle rent by choosing compact economy (${mehran.luggage}).`,
          savings,
        });
      }
    }

    // Budget hotel
    if (isHotelNeeded && comfortLevel !== 'Basic') {
      const hotelSavings = Math.max(1000, (roomPricePerNight - 2800) * nights * roomsQuantity);
      if (hotelSavings > 0) {
        suggestions.push({
          id: 'opt_hotel',
          type: 'hotel',
          title: 'Switch to Budget Friendly Hotel',
          desc: 'Select standard economy rooms and guest houses.',
          savings: hotelSavings,
        });
      }
    }

    // Lunch self-paid
    if (isFoodNeeded && selectedMeals.lunch) {
      const lunchSavings = 850 * numPersons * (numDays || 1);
      suggestions.push({
        id: 'opt_food',
        type: 'food',
        title: 'Self-arrange lunch at local food stops',
        desc: 'Exclude lunch from pre-booked package.',
        savings: lunchSavings,
      });
    }

    // Own car
    if (isTransportNeeded && !isCompany && transportChoice === 'rental') {
      const ownSavings = vehicleRentTotal + vehicleFuelTotal;
      if (ownSavings > 0) {
        suggestions.push({
          id: 'opt_own',
          type: 'transportChoice',
          title: 'Use Personal / Own Car',
          desc: 'Drive your own vehicle to avoid car rental fees.',
          savings: ownSavings,
        });
      }
    }

    return suggestions;
  }, [budgetExceeded, isTransportNeeded, isOwnCar, vehicleType, currentVehicle, numDays, isCompany, driverRequired, isHotelNeeded, comfortLevel, roomPricePerNight, nights, roomsQuantity, isFoodNeeded, selectedMeals, numPersons, transportChoice, vehicleRentTotal, vehicleFuelTotal]);

  async function handleGenerateItinerary() {
    setValidationMessage('');
    if (!destination || !destination.trim()) {
      const msg = 'Please specify a travel destination.';
      setValidationMessage(msg);
      notifyUser('Destination Required', msg);
      return;
    }
    if (!startLocation || !startLocation.trim()) {
      const msg = 'Please specify where you will start your journey from.';
      setValidationMessage(msg);
      notifyUser('Origin Required', msg);
      return;
    }
    if (!startDate || !startDate.trim()) {
      const msg = 'Please enter your journey start date (YYYY-MM-DD).';
      setDateError(msg);
      setValidationMessage(msg);
      notifyUser('Start Date Required', msg);
      return;
    }
    const dateValidationErr = validateJourneyDates(startDate, endDate, numDays);
    if (dateValidationErr) {
      setDateError(dateValidationErr);
      setValidationMessage(dateValidationErr);
      notifyUser('Invalid Journey Dates', dateValidationErr);
      return;
    }
    if (!numDays || numDays < 1) {
      const msg = 'Please enter total trip days (at least 1 day).';
      setValidationMessage(msg);
      notifyUser('Trip Days Required', msg);
      return;
    }
    if (!numPersons || numPersons < 1) {
      const msg = 'Please enter the number of persons traveling (at least 1).';
      setValidationMessage(msg);
      notifyUser('Group Size Required', msg);
      return;
    }
    const cleanBudget = Number(budget) || 0;
    if (cleanBudget <= 0) {
      const msg = 'Please enter a valid trip budget in PKR (e.g. 50,000).';
      setValidationMessage(msg);
      notifyUser('Budget Required', msg);
      return;
    }

    // Check if there is an active shortfall in selected services
    if (priorityResult.hasShortfall && priorityResult.shortfallProposals.length > 0) {
      setActiveShortfallProposal(priorityResult.shortfallProposals[0]);
      setShortfallModalVisible(true);
      return;
    }

    // Auto-resolve hotel selection if isHotelNeeded is true
    let hotelToUse = selectedHotel;
    let roomToUse = selectedRoom;
    if (isHotelNeeded) {
      if (!hotelToUse && hotels.length > 0) {
        hotelToUse = hotels[0];
        roomToUse = hotels[0].rooms?.[0] || hotels[0].defaultRoom || null;
        setSelectedHotel(hotelToUse);
        setSelectedRoom(roomToUse);
      }
    }

    runTripGeneration(hotelToUse, roomToUse);
  }

  async function runTripGeneration(hotelToUse = selectedHotel, roomToUse = selectedRoom) {
    setGenerating(true);
    setValidationMessage('');
    try {
      const cleanBudget = Number(budget) || 0;
      const cleanBudgetPerPerson = Number(budgetPerPerson) || Math.round(cleanBudget / Math.max(1, numPersons));
      const selectedVehicleObj = RENTAL_VEHICLES.find((v) => v.id === vehicleType) || RENTAL_VEHICLES[1];

      const trip = await generateTrip({
        destination: destination.trim(),
        startLocation: startLocation.trim(),
        startDate,
        endDate: endDate || computeEndDate(startDate, numDays),
        category,
        tripMode,
        transportChoice: isCompany ? 'rental' : transportChoice,
        preferredRoute: preferredRoute || customRouteInput || 'Scenic Highway Route',
        foodChoice: (foodRequired && foodChoice !== 'self') ? 'included' : 'self',
        optionalActivities: isCompany
          ? []
          : selectedOptionalActivities.map((id) => {
              const act = currentActivitiesList.find((a) => a.id === id);
              return {
                id,
                name: act?.name || id,
                price: act?.pricePerGroup || (act?.pricePerPerson || 0) * numPersons,
              };
            }),
        days: numDays,
        budget: cleanBudget,
        numberOfPersons: numPersons,
        travelerGender,
        maleCount: travelerGender === 'male' ? numPersons : (travelerGender === 'female' ? 0 : maleCount),
        femaleCount: travelerGender === 'female' ? numPersons : (travelerGender === 'male' ? 0 : femaleCount),
        budgetPerPerson: cleanBudgetPerPerson,
        vehicleType,
        driverRequired: Boolean(driverRequired),
        interests: selectedInterests,
        travelType: isCompany ? 'Group' : travelType,
        transportation: isOwnCar ? 'Own Car (Personal Vehicle)' : selectedVehicleObj.name,
        comfortLevel,
        transportRequired: isTransportNeeded,
        foodRequired: Boolean(foodRequired && foodChoice !== 'self'),
        activitiesRequired: isActivitiesNeeded,
        roomsQuantity: roomsQuantity,
        selectedMeals,
        hotelRequired: Boolean(isHotelNeeded && hotelToUse),
        selectedHotelId: isHotelNeeded && hotelToUse ? hotelToUse.id : undefined,
        selectedRoomId: isHotelNeeded && roomToUse ? roomToUse.id : undefined,
      });

      if (!trip) {
        throw new Error('Trip generation did not return a valid itinerary.');
      }

      navigation.navigate('Itinerary', { trip });
    } catch (error) {
      const msg = error.message || 'Unable to build itinerary. Please retry.';
      setValidationMessage(msg);
      notifyUser('Trip Planning Failed', msg);
    } finally {
      setGenerating(false);
    }
  }

  const categoryCities = CATEGORY_CITIES_MAP[category] || [];

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <ScreenHeader
        title="Plan Your Trip"
        subtitle="Complete all-in-one Pakistan journey planner"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* 0. TRIP MODE SELECTION: COMPANY TOUR OR FULL PACKAGE vs CUSTOMIZE MY TRIP */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="options-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>Choose Planning Mode</AppText>
          </View>
          <AppText variant="caption" color={colors.muted}>
            Select whether you want an all-inclusive company package or full customizable control:
          </AppText>

          <View style={styles.modeToggleRow}>
            <TouchableOpacity
              style={[styles.modeCard, tripMode === 'company' && styles.modeCardActive]}
              onPress={() => {
                setTripMode('company');
                setTransportRequired(true);
                setHotelRequired(true);
                setFoodRequired(true);
                setActivitiesRequired(true);
                setFoodChoice('included');
                setTransportChoice('rental');
              }}
            >
              <View style={styles.modeHeaderRow}>
                <AppIcon name="business-outline" size={20} color={tripMode === 'company' ? colors.white : colors.forest} />
                <AppText style={[styles.modeTitle, tripMode === 'company' && styles.modeTitleActive]}>
                  Company Tour or Full Package
                </AppText>
              </View>
              <AppText style={[styles.modeDesc, tripMode === 'company' && styles.modeDescActive]}>
                Company arranges complete tour: dedicated vehicle with driver, hotel stay, meals, sightseeing, fuel & motorway tolls.
              </AppText>
              <View style={[styles.modeBadge, tripMode === 'company' && styles.modeBadgeActive]}>
                <AppText style={[styles.modeBadgeText, tripMode === 'company' && styles.modeBadgeTextActive]}>
                  {tripMode === 'company' ? 'ACTIVE' : 'SELECT'}
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeCard, tripMode === 'customized' && styles.modeCardActive]}
              onPress={() => setTripMode('customized')}
            >
              <View style={styles.modeHeaderRow}>
                <AppIcon name="construct-outline" size={20} color={tripMode === 'customized' ? colors.white : colors.forest} />
                <AppText style={[styles.modeTitle, tripMode === 'customized' && styles.modeTitleActive]}>
                  Customize My Trip
                </AppText>
              </View>
              <AppText style={[styles.modeDesc, tripMode === 'customized' && styles.modeDescActive]}>
                Select required services (Transport, Hotel, Food, Sights). Unselected services are completely hidden and cost PKR 0.
              </AppText>
              <View style={[styles.modeBadge, tripMode === 'customized' && styles.modeBadgeActive]}>
                <AppText style={[styles.modeBadgeText, tripMode === 'customized' && styles.modeBadgeTextActive]}>
                  {tripMode === 'customized' ? 'ACTIVE' : 'SELECT'}
                </AppText>
              </View>
            </TouchableOpacity>
          </View>

          {/* CUSTOMIZE MY TRIP: SERVICE CHECKLIST SWITCHES */}
          {tripMode === 'customized' ? (
            <View style={styles.serviceCustomBox}>
              <View style={styles.serviceCustomHeader}>
                <AppIcon name="options" size={16} color={colors.forest} />
                <AppText style={styles.serviceCustomTitle}>Select Required Services</AppText>
              </View>
              <AppText style={styles.serviceCustomDesc}>
                Toggle which services you need. Jo service uncheck hogi uska section niche hide ho jayega aur uski cost PKR 0 hogi:
              </AppText>
              <View style={styles.serviceGrid}>
                <TouchableOpacity
                  style={[styles.serviceCheckChip, transportRequired && styles.serviceCheckChipActive]}
                  onPress={() => setTransportRequired(!transportRequired)}
                >
                  <AppIcon name={transportRequired ? "checkbox" : "square-outline"} size={18} color={transportRequired ? colors.white : colors.forest} />
                  <AppText style={[styles.serviceCheckText, transportRequired && styles.serviceCheckTextActive]}>
                    Transport {transportRequired ? '(Active)' : '(Hidden - PKR 0)'}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.serviceCheckChip, hotelRequired && styles.serviceCheckChipActive]}
                  onPress={() => setHotelRequired(!hotelRequired)}
                >
                  <AppIcon name={hotelRequired ? "checkbox" : "square-outline"} size={18} color={hotelRequired ? colors.white : colors.forest} />
                  <AppText style={[styles.serviceCheckText, hotelRequired && styles.serviceCheckTextActive]}>
                    Hotel Stay {hotelRequired ? '(Active)' : '(Hidden - PKR 0)'}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.serviceCheckChip, foodRequired && styles.serviceCheckChipActive]}
                  onPress={() => setFoodRequired(!foodRequired)}
                >
                  <AppIcon name={foodRequired ? "checkbox" : "square-outline"} size={18} color={foodRequired ? colors.white : colors.forest} />
                  <AppText style={[styles.serviceCheckText, foodRequired && styles.serviceCheckTextActive]}>
                    Food Meals {foodRequired ? '(Active)' : '(Hidden - PKR 0)'}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.serviceCheckChip, activitiesRequired && styles.serviceCheckChipActive]}
                  onPress={() => setActivitiesRequired(!activitiesRequired)}
                >
                  <AppIcon name={activitiesRequired ? "checkbox" : "square-outline"} size={18} color={activitiesRequired ? colors.white : colors.forest} />
                  <AppText style={[styles.serviceCheckText, activitiesRequired && styles.serviceCheckTextActive]}>
                    Activities {activitiesRequired ? '(Active)' : '(Hidden - PKR 0)'}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.companyInclusionsBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppIcon name="shield-checkmark" size={18} color="#065f46" />
                <AppText style={styles.companyInclusionsTitle}>Full Company Package Inclusions</AppText>
              </View>
              <AppText style={styles.companyInclusionsText}>
                Chauffeur vehicle with fuel and motorway tolls  -  Hotel stay according to budget tier  -  Daily breakfast and dinner  -  Sights entry coordination and 24/7 support
              </AppText>
            </View>
          )}
        </View>

        {/* 1. CATEGORY SELECTION & CLARITY */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="layers-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>1. Travel Category</AppText>
          </View>
          <AppText variant="caption" color={colors.muted}>
            Select which travel region of Pakistan you want to explore:
          </AppText>

          <View style={styles.pillRow}>
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, active && styles.catChipActive]}
                  onPress={() => {
                    setCategory(cat);
                    const firstCity = CATEGORY_CITIES_MAP[cat]?.[0];
                    if (firstCity) setDestination(firstCity);
                  }}
                >
                  <AppText style={[styles.catChipText, active && styles.catChipTextActive]}>
                    {cat}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explicit Category Explanation */}
          <View style={styles.categoryInfoBox}>
            <AppIcon name="information-circle" size={16} color={colors.forest} />
            <AppText style={styles.categoryInfoText}>
              <AppIcon name="location-outline" size={14} color={colors.forest} /> <AppText style={{ fontWeight: 'bold' }}>{destination}</AppText> lies in the <AppText style={{ fontWeight: 'bold', color: colors.forest }}>{category}</AppText> category.
            </AppText>
          </View>

          {/* Cities that lie in this category */}
          <View style={{ marginTop: 8 }}>
            <AppText style={styles.sublabel}>Iconic cities in {category}:</AppText>
            <View style={styles.cityPillsWrap}>
              {categoryCities.map((city) => {
                const active = destination.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(destination.toLowerCase());
                return (
                  <TouchableOpacity
                    key={city}
                    style={[styles.cityChip, active && styles.cityChipActive]}
                    onPress={() => setDestination(city)}
                  >
                    <AppText style={[styles.cityChipText, active && styles.cityChipTextActive]}>
                      {city}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 2. WHERE YOU START YOUR JOURNEY (DEPARTURE ORIGIN) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="navigate-circle-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>2. Where You Start Your Journey</AppText>
          </View>
          <AppText variant="caption" color={colors.muted}>
            Select or enter your departure city/origin in Pakistan:
          </AppText>

          <View style={styles.pillRow}>
            {DEPARTURE_CITIES.map((city) => {
              const active = startLocation === city;
              return (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityChip, active && styles.cityChipActive]}
                  onPress={() => setStartLocation(city)}
                >
                  <AppText style={[styles.cityChipText, active && styles.cityChipTextActive]}>
                    {city}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Live GPS Origin Detection Button */}
          <TouchableOpacity
            style={styles.gpsLocationBtn}
            onPress={handleUseGpsLocation}
            disabled={gpsLoading}
            accessibilityLabel="Use live GPS location"
            accessibilityRole="button"
          >
            {gpsLoading ? (
              <ActivityIndicator size="small" color={colors.forest} />
            ) : (
              <AppIcon name="locate-outline" size={17} color={colors.forest} />
            )}
            <AppText style={styles.gpsLocationBtnText}>
              {gpsLoading ? 'Detecting Live Location...' : 'Use My Live GPS Location'}
            </AppText>
          </TouchableOpacity>

          <View style={styles.inputWrap}>
            <AppIcon name="location-outline" size={18} color={colors.muted} />
            <TextInput
              id="trip-start-location-input"
              nativeID="trip-start-location-input"
              name="startLocation"
              accessibilityLabel="Starting City / Origin"
              value={startLocation}
              onChangeText={setStartLocation}
              placeholder="Or enter custom starting city..."
              placeholderTextColor="#94a098"
              style={styles.textInput}
            />
          </View>

          <View style={styles.routeRoutePreview}>
            <AppIcon name="arrow-forward-circle" size={16} color={colors.forest} />
            <AppText style={styles.routeRoutePreviewText}>
              Route: <AppText style={{ fontWeight: 'bold' }}>{startLocation || 'Origin'}</AppText> {'->'} <AppText style={{ fontWeight: 'bold', color: colors.forest }}>{destination || 'Destination'}</AppText>
            </AppText>
          </View>
        </View>

        {/* 3. DATES & TRIP DURATION */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="calendar-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>3. Journey Dates & Duration</AppText>
          </View>

          {/* Quick Date Presets */}
          <View style={styles.quickDateRow}>
            <TouchableOpacity
              style={styles.quickDateChip}
              onPress={() => {
                const today = getTodayStr();
                handleStartDateSelect(today);
                const d = parseInt(days, 10) || 3;
                if (!days) setDays('3');
                setEndDate(computeEndDate(today, d));
              }}
              accessibilityLabel="Quick Select Today"
            >
              <AppIcon name="flash-outline" size={13} color={colors.forest} />
              <AppText style={styles.quickDateText}>Today</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickDateChip}
              onPress={() => {
                const tom = getPresetDate('tomorrow');
                handleStartDateSelect(tom);
                const d = parseInt(days, 10) || 3;
                if (!days) setDays('3');
                setEndDate(computeEndDate(tom, d));
              }}
              accessibilityLabel="Quick Select Tomorrow"
            >
              <AppText style={styles.quickDateText}>Tomorrow</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickDateChip}
              onPress={() => {
                const wk = getPresetDate('weekend');
                handleStartDateSelect(wk);
                const d = parseInt(days, 10) || 3;
                if (!days) setDays('3');
                setEndDate(computeEndDate(wk, d));
              }}
              accessibilityLabel="Quick Select This Weekend"
            >
              <AppText style={styles.quickDateText}>This Weekend</AppText>
            </TouchableOpacity>
          </View>

          {/* Date Error Banner (Real-time error feedback) */}
          {dateError ? (
            <View style={styles.dateErrorBox}>
              <AppIcon name="alert-circle" size={18} color="#b43b36" />
              <View style={{ flex: 1 }}>
                <AppText style={styles.dateErrorTitle}>Incorrect Date Selected</AppText>
                <AppText style={styles.dateErrorText}>{dateError}</AppText>
              </View>
            </View>
          ) : null}

          {/* Start Date Input with Interactive Calendar Trigger */}
          <View style={styles.inputLabelRow}>
            <AppText style={styles.sublabel}>Start Date:</AppText>
            <TouchableOpacity
              onPress={() => openCalendarPicker('start')}
              accessibilityLabel="Open Start Date Calendar Picker"
            >
              <AppText style={styles.openCalendarLink}>Open Calendar</AppText>
            </TouchableOpacity>
          </View>
          <View style={[
            styles.inputWrap,
            dateError && startDate && (startDate < getTodayStr()) && styles.inputWrapError
          ]}>
            <TouchableOpacity
              onPress={() => openCalendarPicker('start')}
              style={styles.calendarTriggerBtn}
              accessibilityLabel="Open Start Date Calendar"
              accessibilityRole="button"
            >
              <AppIcon name="calendar" size={18} color={colors.forest} />
            </TouchableOpacity>
            <TextInput
              id="trip-start-date-input"
              nativeID="trip-start-date-input"
              name="startDate"
              accessibilityLabel="Trip Start Date"
              value={startDate}
              onChangeText={handleStartDateChange}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a098"
              style={styles.textInput}
            />
            <TouchableOpacity
              onPress={() => openCalendarPicker('start')}
              style={styles.calendarBadgeBtn}
              accessibilityLabel="Pick Start Date from Calendar"
              accessibilityRole="button"
            >
              <AppIcon name="calendar-outline" size={13} color={colors.forest} />
              <AppText style={styles.calendarBadgeText}>Pick Date</AppText>
            </TouchableOpacity>
          </View>

          {/* End Date Input with Interactive Calendar Trigger */}
          <View style={[styles.inputLabelRow, { marginTop: 10 }]}>
            <AppText style={styles.sublabel}>End Date:</AppText>
            <TouchableOpacity
              onPress={() => openCalendarPicker('end')}
              accessibilityLabel="Open End Date Calendar Picker"
            >
              <AppText style={styles.openCalendarLink}>Open Calendar</AppText>
            </TouchableOpacity>
          </View>
          <View style={[
            styles.inputWrap,
            dateError && endDate && startDate && (endDate < startDate) && styles.inputWrapError
          ]}>
            <TouchableOpacity
              onPress={() => openCalendarPicker('end')}
              style={styles.calendarTriggerBtn}
              accessibilityLabel="Open End Date Calendar"
              accessibilityRole="button"
            >
              <AppIcon name="calendar-outline" size={18} color={colors.forest} />
            </TouchableOpacity>
            <TextInput
              id="trip-end-date-input"
              nativeID="trip-end-date-input"
              name="endDate"
              accessibilityLabel="Trip End Date"
              value={endDate}
              onChangeText={handleEndDateChange}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a098"
              style={styles.textInput}
            />
            <TouchableOpacity
              onPress={() => openCalendarPicker('end')}
              style={styles.calendarBadgeBtn}
              accessibilityLabel="Pick End Date from Calendar"
              accessibilityRole="button"
            >
              <AppIcon name="calendar-outline" size={13} color={colors.forest} />
              <AppText style={styles.calendarBadgeText}>Pick Date</AppText>
            </TouchableOpacity>
          </View>

          {/* Total Trip Days Input */}
          <AppText style={[styles.sublabel, { marginTop: 10 }]}>Total Trip Days:</AppText>
          <View style={styles.inputWrap}>
            <AppIcon name="time-outline" size={18} color={colors.muted} />
            <TextInput
              id="trip-days-input"
              nativeID="trip-days-input"
              name="days"
              accessibilityLabel="Total Trip Days"
              value={days}
              onChangeText={handleDaysChange}
              keyboardType="numeric"
              placeholder="e.g. 3"
              placeholderTextColor="#94a098"
              style={styles.textInput}
            />
            <AppText style={styles.perPersonSuffix}>days</AppText>
          </View>

          {/* Dynamic Journey Schedule Preview */}
          <View style={[styles.schedulePreviewBox, dateError && styles.schedulePreviewBoxError]}>
            <AppIcon
              name={dateError ? 'alert-circle' : (startDate && (endDate || days) ? 'checkmark-circle' : 'time-outline')}
              size={18}
              color={dateError ? '#b43b36' : (startDate && (endDate || days) ? colors.green : colors.forest)}
            />
            <View style={{ flex: 1 }}>
              <AppText style={[styles.schedulePreviewTitle, dateError && { color: '#b43b36' }]}>
                {dateError ? 'Date Notice' : 'Journey Schedule'}
              </AppText>
              <AppText style={[styles.schedulePreviewDates, dateError && { color: '#b43b36' }]}>
                {dateError
                  ? dateError
                  : startDate && (endDate || days)
                    ? `${startDate} -> ${endDate || computeEndDate(startDate, days)} (${numDays || 1} Days / ${nights} Nights)`
                    : 'Click the calendar or enter start date & days'}
              </AppText>
            </View>
          </View>
        </View>

        {/* 4. GROUP SIZE & BUDGET PER PERSON */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="people-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>4. Tour Group Size & Budget</AppText>
          </View>
          <AppText variant="caption" color={colors.muted}>
            Tour cost calculation: No. of persons x Budget per person
          </AppText>

          {/* Males & Females Strength Inputs */}
          <View style={styles.strengthRow}>
            {/* Males Strength */}
            <View style={styles.strengthCol}>
              <AppText style={styles.sublabel}>Males (Number of Men):</AppText>
              <View style={styles.inputWrap}>
                <AppIcon name="man" size={18} color={colors.forest} />
                <TextInput
                  id="trip-males-input"
                  nativeID="trip-males-input"
                  name="malesStrength"
                  accessibilityLabel="Number of Males"
                  value={malesInput}
                  onChangeText={handleMalesChange}
                  keyboardType="numeric"
                  placeholder="e.g. 2"
                  placeholderTextColor="#94a098"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Females Strength */}
            <View style={styles.strengthCol}>
              <AppText style={styles.sublabel}>Females (Number of Women):</AppText>
              <View style={styles.inputWrap}>
                <AppIcon name="woman" size={18} color="#db2777" />
                <TextInput
                  id="trip-females-input"
                  nativeID="trip-females-input"
                  name="femalesStrength"
                  accessibilityLabel="Number of Females"
                  value={femalesInput}
                  onChangeText={handleFemalesChange}
                  keyboardType="numeric"
                  placeholder="e.g. 1"
                  placeholderTextColor="#94a098"
                  style={styles.textInput}
                />
              </View>
            </View>
          </View>

          {/* Total Persons Display & Auto-Sync Input */}
          <View style={{ marginTop: 10 }}>
            <AppText style={styles.sublabel}>Total Persons Traveling:</AppText>
            <View style={[styles.inputWrap, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
              <AppIcon name="people" size={18} color={colors.forest} />
              <TextInput
                id="trip-persons-input"
                nativeID="trip-persons-input"
                name="numberOfPersons"
                accessibilityLabel="Total Persons Traveling"
                value={numberOfPersons}
                onChangeText={handlePersonsChange}
                keyboardType="numeric"
                placeholder="Auto-calculated (Males + Females)"
                placeholderTextColor="#94a098"
                style={[styles.textInput, { fontWeight: 'bold' }]}
              />
              <AppText style={styles.perPersonSuffix}>
                {numPersons > 0 ? `${numPersons} ${numPersons === 1 ? 'person' : 'persons'}` : 'persons'}
              </AppText>
            </View>
          </View>

          {/* Budget per Person Input */}
          <View style={{ marginTop: 6 }}>
            <AppText style={styles.sublabel}>Budget Per Person (PKR):</AppText>

            <View style={styles.inputWrap}>
              <AppText style={styles.pkrPrefix}>PKR</AppText>
              <TextInput
                id="trip-budget-per-person-input"
                nativeID="trip-budget-per-person-input"
                name="budgetPerPerson"
                accessibilityLabel="Budget Per Person in PKR"
                value={budgetPerPerson}
                onChangeText={handleBudgetPerPersonChange}
                keyboardType="numeric"
                placeholder="e.g. 38500"
                placeholderTextColor="#94a098"
                style={styles.textInput}
              />
              <AppText style={styles.perPersonSuffix}>/ person</AppText>
            </View>
          </View>

          {/* Live Calculation Banner */}
          <View style={styles.totalTourBudgetBanner}>
            <View style={styles.totalTourBannerTop}>
              <AppIcon name="calculator-outline" size={18} color={colors.forest} />
              <AppText style={styles.totalTourBannerTitle}>Total Package Budget</AppText>
            </View>
            <AppText style={styles.totalTourFormula}>
              {numPersons > 0 && numBudgetPerPerson > 0
                ? `${numPersons} ${numPersons === 1 ? 'Person' : 'Persons'} x PKR ${numBudgetPerPerson.toLocaleString()} / person`
                : 'Enter travelers and budget per person to calculate total'}
            </AppText>
            <AppText style={styles.totalTourPrice}>
              = PKR {numBudget.toLocaleString()} Total
            </AppText>
          </View>

          {/* Minimum Budget Warning Indicator */}
          {numPersons > 0 && numDays > 0 && numBudget > 0 && numBudget < (numPersons * numDays * 3500) && (
            <View style={{
              marginTop: 10,
              padding: 12,
              backgroundColor: '#fef2f2',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#fca5a5',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <AppIcon name="alert-circle" size={18} color="#dc2626" />
                <AppText style={{ fontWeight: '700', fontSize: 13, color: '#b91c1c' }}>
                  Budget Too Low
                </AppText>
              </View>
              <AppText style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 18 }}>
                Minimum realistic cost for {numDays} days with {numPersons} traveler{numPersons > 1 ? 's' : ''} is PKR {(numPersons * numDays * 3500).toLocaleString()} (approx. PKR 3,500/person/day for basic lodging, fuel & meals).
              </AppText>
              <TouchableOpacity
                style={{
                  marginTop: 8,
                  backgroundColor: '#dc2626',
                  paddingVertical: 7,
                  paddingHorizontal: 12,
                  borderRadius: 6,
                  alignSelf: 'flex-start',
                }}
                onPress={() => {
                  const minTot = numPersons * numDays * 3500;
                  const minPP = numDays * 3500;
                  setBudget(String(minTot));
                  setBudgetPerPerson(String(minPP));
                }}
              >
                <AppText style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                  Set to Recommended Min: PKR {(numPersons * numDays * 3500).toLocaleString()}
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 5. TRANSPORT BREAKDOWN: RENTAL CAR vs OWN CAR (Conditionally rendered when transport is needed) */}
        {(isCompany || transportRequired) && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="car-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>5. Transport Selection</AppText>
          </View>
          <AppText variant="caption" color={colors.muted}>
            Choose whether you are using your personal car or booking a rental vehicle:
          </AppText>

          {/* RENTAL vs OWN TOGGLE (Available in customized mode; company mode is dedicated chauffeur) */}
          {tripMode === 'customized' ? (
            <View style={styles.transportToggleContainer}>
              <TouchableOpacity
                style={[styles.transportToggleBtn, transportChoice === 'rental' && styles.transportToggleBtnActive]}
                onPress={() => setTransportChoice('rental')}
              >
                <AppIcon name="key-outline" size={18} color={transportChoice === 'rental' ? colors.white : colors.forest} />
                <AppText style={[styles.transportToggleBtnText, transportChoice === 'rental' && styles.transportToggleBtnTextActive]}>
                  Rental Car
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.transportToggleBtn, transportChoice === 'own' && styles.transportToggleBtnActive]}
                onPress={() => setTransportChoice('own')}
              >
                <AppIcon name="car-sport-outline" size={18} color={transportChoice === 'own' ? colors.white : colors.forest} />
                <AppText style={[styles.transportToggleBtnText, transportChoice === 'own' && styles.transportToggleBtnTextActive]}>
                  Own Car (Personal)
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.companyServiceBanner}>
              <AppIcon name="shield-checkmark" size={18} color="#0369a1" />
              <AppText style={styles.companyServiceBannerText}>
                Company Tour Services: Dedicated commercial tourist vehicle with certified mountain chauffeur included in package.
              </AppText>
            </View>
          )}

          {isOwnCar ? (
            <View style={styles.ownCarInfoBox}>
              <View style={styles.ownCarBadgeRow}>
                <AppIcon name="checkmark-circle" size={24} color="#15803d" />
                <View style={{ flex: 1 }}>
                  <AppText style={styles.ownCarTitle}>Traveling in Your Own Car</AppText>
                  <AppText style={styles.ownCarDesc}>
                    Personal car selected! Vehicle rental charges are <AppText style={{ fontWeight: 'bold' }}>PKR 0</AppText> and will <AppText style={{ fontWeight: 'bold' }}>NOT</AppText> be cut from your budget.
                  </AppText>
                </View>
              </View>

              <View style={styles.transportFormulaBox}>
                <AppText style={styles.transportFormulaLabel}>OWN CAR BUDGET DEDUCTION:</AppText>
                <AppText style={styles.transportFormulaText}>
                  Rent PKR 0 + Fuel (Self-Arranged) = <AppText style={{ fontWeight: 'bold', color: colors.forest }}>PKR 0 (Free / No Deduction)</AppText>
                </AppText>
              </View>
            </View>
          ) : (
            /* Rental Car Options with Dynamic Dropdown */
            <>
              {/* Driver & Chauffeur Preference Toggle */}
              <View style={{ marginTop: 8, marginBottom: 12 }}>
                <AppText style={styles.sublabel}>Driver and Chauffeur Option:</AppText>
                <View style={styles.driverToggleRow}>
                  <TouchableOpacity
                    style={[styles.driverToggleBtn, driverRequired && styles.driverToggleBtnActive]}
                    onPress={() => setDriverRequired(true)}
                  >
                    <AppIcon name="person" size={16} color={driverRequired ? colors.white : colors.forest} />
                    <AppText style={[styles.driverToggleText, driverRequired && styles.driverToggleTextActive]}>
                      With Licensed Driver (+PKR 2,000/day)
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.driverToggleBtn, !driverRequired && styles.driverToggleBtnActive]}
                    onPress={() => setDriverRequired(false)}
                  >
                    <AppIcon name="key-outline" size={16} color={!driverRequired ? colors.white : colors.forest} />
                    <AppText style={[styles.driverToggleText, !driverRequired && styles.driverToggleTextActive]}>
                      Self-Drive (Without Driver)
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ marginTop: 6 }}>
                <View style={styles.dropdownLabelRow}>
                  <AppText style={styles.sublabel}>
                    Select Vehicle:
                  </AppText>
                  {matchingVehicles.length > 0 && (
                    <View style={styles.withinBadge}>
                      <AppText style={styles.withinBadgeText}>
                        {matchingVehicles.length} within budget
                      </AppText>
                    </View>
                  )}
                </View>

                {/* Dropdown Header Trigger */}
                <TouchableOpacity
                  style={[
                    styles.vehicleDropdownHeader,
                    vehicleDropdownOpen && styles.vehicleDropdownHeaderOpen,
                  ]}
                  onPress={() => setVehicleDropdownOpen((prev) => !prev)}
                  accessibilityRole="combobox"
                  accessibilityLabel="Select Vehicle Dropdown"
                >
                  <View style={styles.dropdownHeaderLeft}>
                    <View style={styles.dropdownIconCircle}>
                      <AppIcon name={currentVehicle.icon} size={22} color={colors.forest} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText style={styles.dropdownVehicleName}>
                        {currentVehicle.name}
                      </AppText>
                      <AppText style={styles.dropdownVehicleMeta}>
                        {currentVehicle.persons} - {currentVehicle.luggage} - PKR {currentVehicle.rentPerDay.toLocaleString()}/day
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.dropdownArrowWrap}>
                    <AppIcon
                      name={vehicleDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.forest}
                    />
                  </View>
                </TouchableOpacity>

                {/* Dropdown Options List */}
                {vehicleDropdownOpen && (
                  <View style={styles.vehicleDropdownList}>
                    {matchingVehicles.map((veh) => {
                      const isSelected = vehicleType === veh.id;
                      return (
                        <TouchableOpacity
                          key={veh.id}
                          style={[
                            styles.dropdownItem,
                            isSelected && styles.dropdownItemSelected,
                          ]}
                          onPress={() => {
                            setVehicleType(veh.id);
                            setVehicleDropdownOpen(false);
                          }}
                        >
                          <View style={styles.dropdownItemLeft}>
                            <AppIcon
                              name={veh.icon}
                              size={20}
                              color={isSelected ? colors.forest : colors.muted}
                            />
                            <View style={{ flex: 1 }}>
                              <AppText
                                style={[
                                  styles.dropdownItemTitle,
                                  isSelected && styles.dropdownItemTitleSelected,
                                ]}
                              >
                                {veh.name}
                              </AppText>
                              <AppText style={styles.dropdownItemSubtitle}>
                                {veh.persons} - Rent: PKR {veh.rentPerDay.toLocaleString()}/day - Fuel: PKR {veh.fuelPerDay.toLocaleString()}/day
                              </AppText>
                            </View>
                          </View>
                          {isSelected ? (
                            <AppIcon name="checkmark-circle" size={20} color={colors.forest} />
                          ) : (
                            <View style={styles.selectPill}>
                              <AppText style={styles.selectPillText}>Select</AppText>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Selected Vehicle Details Card */}
                <View style={styles.selectedVehicleSummaryCard}>
                  <View style={styles.summaryTopRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <AppIcon name="checkmark-circle" size={16} color="#15803d" />
                      <AppText style={styles.summaryTitle}>
                        {vehiclesRequired > 1 ? `${vehiclesRequired}x ${currentVehicle.name}` : currentVehicle.name}
                      </AppText>
                    </View>
                    <View style={styles.withinBadge}>
                      <AppText style={styles.withinBadgeText}>{vehiclesRequired} Vehicle{vehiclesRequired > 1 ? 's' : ''} Required</AppText>
                    </View>
                  </View>
                  <AppText style={styles.summaryDetails}>
                    Capacity: {currentVehicle.persons} ({currentVehicle.maxPersons || 4} seats per vehicle) - {currentVehicle.luggage}
                  </AppText>
                  <AppText style={styles.summaryPricing}>
                    Daily Rent: <AppText style={{ fontWeight: 'bold' }}>PKR {currentVehicle.rentPerDay.toLocaleString()}/day</AppText>
                    {driverRequired ? ' + PKR 2,000/day driver' : ' (Self-drive)'}
                    {' + Fuel: PKR ' + currentVehicle.fuelPerDay.toLocaleString() + '/day'}
                  </AppText>
                  <AppText style={styles.summaryTripCost}>
                    Trip Transport Total ({numDays || 1} day{(numDays || 1) > 1 ? 's' : ''}): <AppText style={{ fontWeight: 'bold', color: colors.forest }}>PKR {rawVehicleCost.toLocaleString()}</AppText>
                  </AppText>
                </View>
              </View>

              {/* Transport Formula Box */}
              <View style={styles.transportFormulaBox}>
                <AppText style={styles.transportFormulaLabel}>TRANSPORT ESTIMATE FORMULA:</AppText>
                <AppText style={styles.transportFormulaText}>
                  Vehicles: CEILING({numPersons || 1} / {currentVehicle.maxPersons || 4}) = {vehiclesRequired} vehicle{vehiclesRequired > 1 ? 's' : ''} | Rent: PKR {(vehiclesRequired * currentVehicle.rentPerDay * (numDays || 1)).toLocaleString()}
                  {driverRequired ? ` + Driver: PKR ${(vehiclesRequired * 2000 * (numDays || 1)).toLocaleString()}` : ''}
                  {` + Fuel: PKR ${(vehiclesRequired * currentVehicle.fuelPerDay * (numDays || 1)).toLocaleString()}`}
                  {` + Motorway Toll/Parking: PKR ${(vehiclesRequired * 800 * (numDays || 1)).toLocaleString()}`}
                  {` = `}<AppText style={{ fontWeight: 'bold', color: colors.forest }}>PKR {rawVehicleCost.toLocaleString()}</AppText>
                </AppText>
              </View>
            </>
          )}
        </View>
        )}

        {/* 6. ROUTES & HIGHWAYS BREAKDOWN */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="trail-sign-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>6. Highway & Scenic Route Selection</AppText>
          </View>
          <AppText variant="caption" color={colors.muted}>
            Select which highway route or scenic pass to take towards {destination}:
          </AppText>

          <View style={{ gap: 8, marginTop: 4 }}>
            {(CATEGORY_ROUTES_MAP[category] || [
              'National Highway (N-5) / Motorway Network',
              'Scenic Regional Highway Corridor',
            ]).map((routeItem) => {
              const isSelected = preferredRoute === routeItem;
              return (
                <TouchableOpacity
                  key={routeItem}
                  style={[styles.routeChoiceCard, isSelected && styles.routeChoiceCardSelected]}
                  onPress={() => setPreferredRoute(routeItem)}
                >
                  <AppIcon
                    name={isSelected ? "navigate-circle" : "trail-sign-outline"}
                    size={20}
                    color={isSelected ? colors.forest : colors.muted}
                  />
                  <View style={{ flex: 1 }}>
                    <AppText style={[styles.routeChoiceTitle, isSelected && styles.routeChoiceTitleSelected]}>
                      {routeItem}
                    </AppText>
                  </View>
                  {isSelected ? (
                    <AppIcon name="checkmark-circle" size={18} color={colors.forest} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.inputWrap}>
            <AppIcon name="trail-sign" size={18} color={colors.muted} />
            <TextInput
              id="trip-custom-route-input"
              nativeID="trip-custom-route-input"
              name="customRoute"
              accessibilityLabel="Custom Route or Mountain Pass"
              value={customRouteInput}
              onChangeText={(text) => {
                setCustomRouteInput(text);
                if (text.trim()) setPreferredRoute(text);
              }}
              placeholder="Or enter a custom route / mountain pass..."
              placeholderTextColor="#94a098"
              style={styles.textInput}
            />
          </View>

          <View style={styles.routePreviewBox}>
            <AppText style={styles.routePreviewLabel}>SELECTED JOURNEY ROUTE:</AppText>
            <AppText style={styles.routePreviewText}>
              {startLocation} {'->'} <AppText style={{ fontWeight: 'bold' }}>{preferredRoute || 'Standard Scenic Route'}</AppText> {'->'} {destination}
            </AppText>
          </View>
        </View>

        {/* 8. HOTEL REQUIREMENT & IN-APP SELECTION WITH SMART EXPENSE CONTROLLER */}
        {(isCompany || hotelRequired) && (
        <View style={styles.card}>
          <View style={styles.hotelHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.cardHeaderRow}>
                <AppIcon name="bed-outline" size={20} color={colors.forest} />
                <AppText variant="heading" style={styles.cardTitle}>7. Hotel Stay & Smart Controller</AppText>
              </View>
              <AppText variant="caption" color={colors.muted}>
                {nights} nights hotel stay in {destination}
              </AppText>
            </View>

            {/* YES / NO TOGGLE */}
            <View style={styles.toggleWrap}>
              <TouchableOpacity
                style={[styles.toggleBtn, hotelRequired && styles.toggleBtnActive]}
                onPress={() => setHotelRequired(true)}
              >
                <AppText style={[styles.toggleText, hotelRequired && styles.toggleTextActive]}>YES</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !hotelRequired && styles.toggleBtnActive]}
                onPress={() => setHotelRequired(false)}
              >
                <AppText style={[styles.toggleText, !hotelRequired && styles.toggleTextActive]}>NO</AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* SMART EXPENSE CONTROLLER STATUS BANNER */}
          {hotelRequired ? (
            <View style={[
              styles.smartExpenseBanner,
              dailyHotelBudget < 3000
                ? styles.smartExpenseBudget
                : dailyHotelBudget >= 7000
                  ? styles.smartExpenseLuxury
                  : styles.smartExpenseStandard
            ]}>
              <AppIcon
                name={dailyHotelBudget < 3000 ? "shield-outline" : dailyHotelBudget >= 7000 ? "sparkles" : "checkmark-circle"}
                size={18}
                color={dailyHotelBudget < 3000 ? "#0284c7" : dailyHotelBudget >= 7000 ? "#b45309" : "#15803d"}
              />
              <View style={{ flex: 1 }}>
                <AppText style={[
                  styles.smartExpenseTitle,
                  { color: dailyHotelBudget < 3000 ? "#0369a1" : dailyHotelBudget >= 7000 ? "#92400e" : "#166534" }
                ]}>
                  {dailyHotelBudget < 3000
                    ? `Smart Controller: Budget Mode (< PKR 3,000/night)`
                    : dailyHotelBudget >= 7000
                      ? `Smart Controller: Luxury Mode (>= PKR 7,000/night)`
                      : `Smart Controller: Standard Mode (PKR 3,000 - 7,000/night)`}
                </AppText>
                <AppText style={styles.smartExpenseNote}>
                  {dailyHotelBudget < 3000
                    ? `Daily hotel allocation: PKR ${dailyHotelBudget.toLocaleString()}/night. Luxury 4-Star and 5-Star hotels are hidden; displaying verified budget-friendly guest houses & lodges.`
                    : dailyHotelBudget >= 7000
                      ? `Daily hotel allocation: PKR ${dailyHotelBudget.toLocaleString()}/night. Luxury 4-Star and 5-Star resorts, executive rooms & suites are fully unlocked!`
                      : `Daily hotel allocation: PKR ${dailyHotelBudget.toLocaleString()}/night. Quality 3-Star family hotels & deluxe standard rooms available.`}
                </AppText>
              </View>
            </View>
          ) : null}

          {hotelRequired ? (
            <View style={{ gap: 12, marginTop: 4 }}>
              {/* Rooms Quantity Stepper */}
              <View style={styles.roomsQuantityBox}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.roomsQuantityTitle}>Rooms Quantity:</AppText>
                  <AppText style={styles.roomsQuantityDesc}>
                    {roomsQuantity} Room{roomsQuantity > 1 ? 's' : ''} x {nights} Nights ({numberOfPersons} travelers)
                  </AppText>
                </View>
                <View style={styles.roomsStepperWrap}>
                  <TouchableOpacity
                    style={styles.roomsStepperBtn}
                    onPress={() => setRoomsQuantity(Math.max(1, roomsQuantity - 1))}
                  >
                    <AppText style={styles.roomsStepperBtnText}>-</AppText>
                  </TouchableOpacity>
                  <AppText style={styles.roomsStepperValue}>{roomsQuantity}</AppText>
                  <TouchableOpacity
                    style={styles.roomsStepperBtn}
                    onPress={() => setRoomsQuantity(roomsQuantity + 1)}
                  >
                    <AppText style={styles.roomsStepperBtnText}>+</AppText>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Hotel Availability Notice / Unavailable Fallback */}
              {hotelUnavailableNotice ? (
                <View style={styles.alertBoxWarning}>
                  <AppIcon name="warning" size={18} color={colors.amber} />
                  <View style={{ flex: 1 }}>
                    <AppText style={styles.alertTitle}>Hotel Unavailable</AppText>
                    <AppText style={styles.alertMessage}>{hotelUnavailableNotice}</AppText>
                    {alternativeHotels.length > 0 ? (
                      <AppText style={styles.alertSub}>We found alternative hotels in {destination} for you below:</AppText>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {hotelsLoading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color={colors.forest} />
                  <AppText style={styles.loadingText}>Filtering verified hotels in {destination}...</AppText>
                </View>
              ) : hotels.length === 0 ? (
                <View style={styles.noHotelsBox}>
                  <AppText style={styles.noHotelsText}>
                    No hotels registered for {destination} in this price tier yet. You can still plan with hotels toggle set to NO.
                  </AppText>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hotelScroll}>
                  {hotels.map((hotel) => {
                    const isSelected = selectedHotel?.id === hotel.id;
                    return (
                      <TouchableOpacity
                        key={hotel.id}
                        style={[styles.hotelCard, isSelected && styles.hotelCardSelected]}
                        onPress={() => handleSelectHotel(hotel)}
                      >
                        <Image
                          source={{ uri: hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500' }}
                          style={styles.hotelImage}
                        />
                        <View style={styles.hotelDetails}>
                          <View style={styles.hotelTopRow}>
                            <AppText style={styles.hotelName} numberOfLines={1}>{hotel.name}</AppText>
                            <View style={styles.ratingBadge}>
                              <AppIcon name="star" size={12} color="#e5a93b" />
                              <AppText style={styles.ratingNum}>{hotel.rating || 4.5}</AppText>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <AppIcon name="location-outline" size={12} color={colors.muted} />
                            <AppText style={styles.hotelCity}>{hotel.city}</AppText>
                          </View>
                          <AppText style={styles.hotelPrice}>
                            PKR {Number(hotel.pricePerNight).toLocaleString()} <AppText style={styles.nightText}>/ night</AppText>
                          </AppText>
                          {isSelected ? (
                            <View style={styles.selectedHotelBadge}>
                              <AppIcon name="checkmark-circle" size={14} color={colors.white} />
                              <AppText style={styles.selectedHotelText}>Selected</AppText>
                            </View>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* Room Selection */}
              {selectedHotel && selectedHotel.rooms?.length ? (
                <View style={styles.roomSelectContainer}>
                  <AppText style={styles.sublabel}>Select Room Type in {selectedHotel.name}:</AppText>
                  <View style={styles.roomsRow}>
                    {selectedHotel.rooms.map((room) => {
                      const isRoomSel = selectedRoom?.id === room.id;
                      const isAvail = room.available !== 0;
                      return (
                        <TouchableOpacity
                          key={room.id}
                          style={[
                            styles.roomChip,
                            isRoomSel && styles.roomChipSelected,
                            !isAvail && styles.roomChipDisabled,
                          ]}
                          onPress={() => handleSelectRoom(room)}
                        >
                          <View style={{ flex: 1 }}>
                            <AppText style={[styles.roomName, isRoomSel && styles.roomNameSelected]}>
                              {room.name}
                            </AppText>
                            <AppText style={styles.roomPrice}>
                              PKR {Number(room.price).toLocaleString()} / night
                            </AppText>
                          </View>
                          <View style={[styles.availBadge, !isAvail && styles.availBadgeRed]}>
                            <AppText style={styles.availText}>{isAvail ? `${room.available} left` : 'Sold out'}</AppText>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {/* Hotel Cost & Budget Calculation */}
              {selectedHotel ? (
                <View style={styles.budgetCalcBox}>
                  <View style={styles.calcRow}>
                    <AppText style={styles.calcLabel}>Total Hotel Cost ({nights} nights):</AppText>
                    <AppText style={styles.calcValue}>PKR {hotelTotalCost.toLocaleString()}</AppText>
                  </View>
                  <View style={styles.calcRow}>
                    <AppText style={styles.calcLabel}>Remaining for Travel & Activities:</AppText>
                    <AppText style={[styles.calcValue, { color: budgetExceeded ? colors.red : colors.forest }]}>
                      PKR {remainingBudget.toLocaleString()}
                    </AppText>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.noHotelNotice}>
              <AppText style={styles.noHotelNoticeText}>
                No hotel included. You can arrange separate lodging or day-trip accommodations.
              </AppText>
            </View>
          )}
        </View>
        )}

        {/* 8. FOOD POLICY & MEAL PLAN */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRowBetween}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppIcon name="restaurant-outline" size={18} color={colors.forest} />
                <AppText variant="heading" style={styles.cardTitle}>
                  8. Food & Meal Policy ({foodMenuData?.menu?.regionName || 'Authentic Regional Cuisine'})
                </AppText>
              </View>
              <AppText variant="caption" color={colors.muted} style={{ marginTop: 2 }}>
                Select authentic regional meals for your journey to {destination || 'your destination'}
              </AppText>
            </View>

            {/* YES / NO Toggle Switch */}
            <View style={styles.yesNoToggle}>
              <TouchableOpacity
                style={[styles.yesNoBtn, foodRequired && styles.yesNoBtnActive]}
                onPress={() => {
                  setFoodRequired(true);
                  setFoodChoice('included');
                }}
              >
                <AppText style={[styles.yesNoBtnText, foodRequired && styles.yesNoBtnTextActive]}>YES</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.yesNoBtn, !foodRequired && styles.yesNoBtnInactive]}
                onPress={() => {
                  setFoodRequired(false);
                  setFoodChoice('self');
                }}
              >
                <AppText style={[styles.yesNoBtnText, !foodRequired && styles.yesNoBtnTextInactive]}>NO</AppText>
              </TouchableOpacity>
            </View>
          </View>

          {!foodRequired || foodChoice === 'self' ? (
            <View style={styles.foodSelfNotice}>
              <AppIcon name="checkmark-circle-outline" size={18} color={colors.forest} />
              <AppText style={styles.foodSelfNoticeText}>
                Food is self-arranged by customer. PKR 0 will be deducted from your package budget.
              </AppText>
            </View>
          ) : (
            <View style={{ gap: 10, marginTop: 8 }}>
              {/* Breakfast Card */}
              <TouchableOpacity
                style={[styles.mealSelectCard, selectedMeals.breakfast && styles.mealSelectCardActive]}
                onPress={() => setSelectedMeals((prev) => ({ ...prev, breakfast: !prev.breakfast }))}
                activeOpacity={0.85}
              >
                <View style={styles.mealCardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <AppIcon
                      name={selectedMeals.breakfast ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={selectedMeals.breakfast ? colors.forest : colors.muted}
                    />
                    <AppText style={styles.mealCardTitle}>
                      Breakfast ({foodMenuData?.menu?.breakfast?.title || 'Authentic Regional Breakfast'})
                    </AppText>
                  </View>
                </View>

                <View style={styles.mealCardRateRow}>
                  <AppText style={styles.mealRateText}>
                    PKR {destinationBfPrice.toLocaleString()} / person / day
                  </AppText>
                  <AppText style={selectedMeals.breakfast ? styles.mealTotalTextActive : styles.mealTotalTextMuted}>
                    PKR {(selectedMeals.breakfast ? destinationBfPrice * numPersons * (numDays || 1) : 0).toLocaleString()}
                  </AppText>
                </View>

                <AppText style={styles.mealMenuText}>
                  Menu: {foodMenuData?.menu?.breakfast?.menuSummary || (Array.isArray(foodMenuData?.menu?.breakfast?.items) ? foodMenuData.menu.breakfast.items.map((b) => b.name).join(' • ') : 'Halwa Puri, Paratha, Chana, Chai')}
                </AppText>
              </TouchableOpacity>

              {/* Lunch Card */}
              <TouchableOpacity
                style={[styles.mealSelectCard, selectedMeals.lunch && styles.mealSelectCardActive]}
                onPress={() => setSelectedMeals((prev) => ({ ...prev, lunch: !prev.lunch }))}
                activeOpacity={0.85}
              >
                <View style={styles.mealCardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <AppIcon
                      name={selectedMeals.lunch ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={selectedMeals.lunch ? colors.forest : colors.muted}
                    />
                    <AppText style={styles.mealCardTitle}>
                      Lunch ({foodMenuData?.menu?.lunch?.title || 'Authentic Regional Lunch'})
                    </AppText>
                  </View>
                </View>

                <View style={styles.mealCardRateRow}>
                  <AppText style={styles.mealRateText}>
                    PKR {destinationLunchPrice.toLocaleString()} / person / day
                  </AppText>
                  <AppText style={selectedMeals.lunch ? styles.mealTotalTextActive : styles.mealTotalTextMuted}>
                    PKR {(selectedMeals.lunch ? destinationLunchPrice * numPersons * (numDays || 1) : 0).toLocaleString()}
                  </AppText>
                </View>

                <AppText style={styles.mealMenuText}>
                  Menu: {foodMenuData?.menu?.lunch?.menuSummary || (Array.isArray(foodMenuData?.menu?.lunch?.items) ? foodMenuData.menu.lunch.items.map((l) => l.name).join(' • ') : 'Karahi, Biryani, Roti, Salad')}
                </AppText>
              </TouchableOpacity>

              {/* Dinner Card */}
              <TouchableOpacity
                style={[styles.mealSelectCard, selectedMeals.dinner && styles.mealSelectCardActive]}
                onPress={() => setSelectedMeals((prev) => ({ ...prev, dinner: !prev.dinner }))}
                activeOpacity={0.85}
              >
                <View style={styles.mealCardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <AppIcon
                      name={selectedMeals.dinner ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={selectedMeals.dinner ? colors.forest : colors.muted}
                    />
                    <AppText style={styles.mealCardTitle}>
                      Dinner ({foodMenuData?.menu?.dinner?.title || 'Authentic Regional Dinner'})
                    </AppText>
                  </View>
                </View>

                <View style={styles.mealCardRateRow}>
                  <AppText style={styles.mealRateText}>
                    PKR {destinationDinnerPrice.toLocaleString()} / person / day
                  </AppText>
                  <AppText style={selectedMeals.dinner ? styles.mealTotalTextActive : styles.mealTotalTextMuted}>
                    PKR {(selectedMeals.dinner ? destinationDinnerPrice * numPersons * (numDays || 1) : 0).toLocaleString()}
                  </AppText>
                </View>

                <AppText style={styles.mealMenuText}>
                  Menu: {foodMenuData?.menu?.dinner?.menuSummary || (Array.isArray(foodMenuData?.menu?.dinner?.items) ? foodMenuData.menu.dinner.items.map((d) => d.name).join(' • ') : 'Charcoal BBQ, Karahi, Roghani Naan, Kheer')}
                </AppText>
              </TouchableOpacity>

              {/* Total Food Plan Cost Footer */}
              <View style={styles.foodTotalFooter}>
                <AppText style={styles.foodTotalFooterText}>
                  Total Food Plan Cost: <AppText style={styles.foodTotalFooterBold}>PKR {rawFoodCost.toLocaleString()}</AppText> ({numPersons} persons x {numDays || 1} days)
                </AppText>
              </View>
            </View>
          )}
        </View>

        {/* 9. OPTIONAL ACTIVITIES & ADVENTURES (Conditionally rendered when activities needed) */}
        {(isCompany || activitiesRequired) && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="ticket-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>
              9. Optional Activities & Paid Adventures {destination ? `in ${destination}` : ''}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.muted}>
            Select only the paid adventure activities you want in {destination || 'your destination'}. Unselected activities cost PKR 0 and are NOT cut from your budget:
          </AppText>

          <View style={{ gap: 8, marginTop: 4 }}>
            {currentActivitiesList.map((act) => {
              const isChecked = selectedOptionalActivities.includes(act.id);
              const priceText = act.pricePerGroup
                ? `PKR ${act.pricePerGroup.toLocaleString()} / group`
                : `PKR ${act.pricePerPerson.toLocaleString()} / person`;
              const totalActCost = act.pricePerGroup
                ? act.pricePerGroup
                : act.pricePerPerson * (numPersons || 1);

              return (
                <TouchableOpacity
                  key={act.id}
                  style={[styles.activityCheckItem, isChecked && styles.activityCheckItemActive]}
                  onPress={() => toggleOptionalActivity(act.id)}
                >
                  <View style={[styles.checkboxSquare, isChecked && styles.checkboxSquareChecked]}>
                    {isChecked ? <AppIcon name="checkmark" size={14} color="#ffffff" /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.activityCheckHeader}>
                      <AppText style={[styles.activityCheckTitle, isChecked && styles.activityCheckTitleActive]}>
                        {act.name}
                      </AppText>
                      <View style={[styles.activityPriceBadge, isChecked && styles.activityPriceBadgeActive]}>
                        <AppText style={[styles.activityPriceBadgeText, isChecked && styles.activityPriceBadgeTextActive]}>
                          {priceText}
                        </AppText>
                      </View>
                    </View>
                    <AppText style={styles.activityCheckDesc}>{act.desc}</AppText>
                    {isChecked ? (
                      <AppText style={styles.activityTotalText}>
                        Total for {numPersons || 1} travelers: PKR {totalActCost.toLocaleString()}
                      </AppText>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.activityPolicyNotice}>
            <AppIcon name="information-circle-outline" size={16} color={colors.forest} />
            <AppText style={styles.activityPolicyNoticeText}>
              Standard sightseeing, heritage viewpoints & photo stops are already free. Only checked paid adventures (PKR {calculatedActivitiesCost.toLocaleString()}) are deducted.
            </AppText>
          </View>
        </View>
        )}

        {/* 10. LIVE BUDGET DEDUCTION & SAVINGS CONTROLLER */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="calculator-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>10. Budget Deduction & Savings Summary</AppText>
          </View>
          <AppText variant="caption" color={colors.muted}>
            Smart Expense Controller audit: Only items you selected are deducted from your PKR {numBudget.toLocaleString()} budget:
          </AppText>

          {isLowBudget ? (
            <View style={styles.lowBudgetInfoBanner}>
              <AppIcon name="information-circle" size={18} color="#0369a1" />
              <View style={{ flex: 1 }}>
                <AppText style={styles.lowBudgetInfoTitle}>Low Budget Smart Adjustment</AppText>
                <AppText style={styles.lowBudgetInfoText}>
                  To stay strictly within your PKR {numBudget.toLocaleString()} budget, hotel stay and transport are managed by the system, while food is handled on your own (PKR 0 in package).
                </AppText>
              </View>
            </View>
          ) : null}

          <View style={styles.deductionAuditCard}>
            <View style={styles.deductionRow}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.deductionLabel}>Transport (Priority 1 - {isOwnCar ? 'Own Car' : 'Rental'}):</AppText>
                {priorityResult.breakdown.transport.details ? (
                  <AppText style={styles.deductionDetailText}>{priorityResult.breakdown.transport.details}</AppText>
                ) : null}
              </View>
              <AppText style={styles.deductionVal}>
                PKR {priorityResult.breakdown.transport.allocatedCost.toLocaleString()}
              </AppText>
            </View>

            <View style={styles.deductionRow}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.deductionLabel}>Food Plan (Priority 2):</AppText>
                {priorityResult.breakdown.food.details ? (
                  <AppText style={styles.deductionDetailText}>{priorityResult.breakdown.food.details}</AppText>
                ) : null}
              </View>
              <AppText style={styles.deductionVal}>
                PKR {priorityResult.breakdown.food.allocatedCost.toLocaleString()}
              </AppText>
            </View>

            <View style={styles.deductionRow}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.deductionLabel}>Hotel Stay (Priority 3 - {nights} nights):</AppText>
                {priorityResult.breakdown.hotel.details ? (
                  <AppText style={styles.deductionDetailText}>{priorityResult.breakdown.hotel.details}</AppText>
                ) : null}
              </View>
              <AppText style={styles.deductionVal}>
                PKR {priorityResult.breakdown.hotel.allocatedCost.toLocaleString()}
              </AppText>
            </View>

            <View style={styles.deductionRow}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.deductionLabel}>Selected Activities (Priority 4):</AppText>
                {priorityResult.breakdown.activities.details ? (
                  <AppText style={styles.deductionDetailText}>{priorityResult.breakdown.activities.details}</AppText>
                ) : null}
              </View>
              <AppText style={styles.deductionVal}>
                PKR {priorityResult.breakdown.activities.allocatedCost.toLocaleString()}
              </AppText>
            </View>

            {isCompany && companyProfit > 0 ? (
              <View style={styles.deductionRow}>
                <AppText style={styles.deductionLabel}>Company Management Fee (10%):</AppText>
                <AppText style={styles.deductionVal}>
                  PKR {companyProfit.toLocaleString()}
                </AppText>
              </View>
            ) : null}

            <View style={styles.deductionDivider} />

            <View style={styles.deductionRow}>
              <AppText style={styles.deductionTotalLabel}>TOTAL ESTIMATED COST:</AppText>
              <AppText style={styles.deductionTotalVal}>PKR {totalIncurred.toLocaleString()}</AppText>
            </View>

            <View style={styles.deductionRow}>
              <AppText style={styles.deductionLabel}>Per Person ({numberOfPersons || 1} travelers):</AppText>
              <AppText style={styles.deductionVal}>PKR {perPersonIncurred.toLocaleString()} / person</AppText>
            </View>

            <View style={styles.deductionRow}>
              <AppText style={styles.deductionRemainLabel}>
                {budgetExceeded ? 'BUDGET SHORTFALL:' : 'REMAINING SAVINGS:'}
              </AppText>
              <AppText style={[styles.deductionRemainVal, { color: budgetExceeded ? '#dc2626' : '#15803d' }]}>
                PKR {budgetExceeded ? budgetShortfall.toLocaleString() : remainingBudget.toLocaleString()}
              </AppText>
            </View>
          </View>

          {/* BUDGET SHORTFALL: INTERACTIVE PROPOSAL BANNER */}
          {budgetExceeded ? (
            <View style={{ marginTop: 12, gap: 10 }}>
              <TouchableOpacity
                style={styles.autoFitBtn}
                onPress={() => {
                  if (priorityResult.shortfallProposals.length > 0) {
                    setActiveShortfallProposal(priorityResult.shortfallProposals[0]);
                    setShortfallModalVisible(true);
                  } else {
                    handleAutoFitBudget();
                  }
                }}
                activeOpacity={0.88}
              >
                <AppIcon name="flash" size={18} color="#ffffff" />
                <AppText style={styles.autoFitBtnText}>Resolve Budget Shortfall (Adjustment Proposal)</AppText>
              </TouchableOpacity>

              {liveSuggestions.length > 0 && (
                <View style={styles.optimizationCard}>
                  <View style={styles.optimizationHeader}>
                    <AppIcon name="bulb-outline" size={18} color="#b45309" />
                    <AppText style={styles.optimizationTitle}>Optimization Assistant: Budget Adjustments</AppText>
                  </View>
                  <AppText style={styles.optimizationDesc}>
                    Your selected items exceed your budget by PKR {budgetShortfall.toLocaleString()}. Click Apply on any suggestion to adjust:
                  </AppText>
                  <View style={{ gap: 8, marginTop: 4 }}>
                    {liveSuggestions.map((sug) => (
                      <View key={sug.id} style={styles.suggestionRow}>
                        <View style={{ flex: 1 }}>
                          <AppText style={styles.sugTitle}>{sug.title}</AppText>
                          <AppText style={styles.sugDesc}>{sug.desc}</AppText>
                          <AppText style={styles.sugSavings}>Saves approx. PKR {sug.savings.toLocaleString()}</AppText>
                        </View>
                        <TouchableOpacity
                          style={styles.applyBtn}
                          onPress={() => applyOptimization(sug)}
                        >
                          <AppText style={styles.applyBtnText}>Apply</AppText>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : null}
        </View>

        {/* 11. TRAVEL INTERESTS */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="heart-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>11. Travel Interests</AppText>
          </View>
          <View style={styles.interestsWrap}>
            {ALL_INTERESTS.map((interest) => {
              const active = selectedInterests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  style={[styles.interestChip, active && styles.interestChipActive]}
                  onPress={() => toggleInterest(interest)}
                >
                  <AppText style={[styles.interestText, active && styles.interestTextActive]}>
                    {active ? `[Selected] ${interest}` : interest}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 12. TRAVEL STYLE & COMFORT LEVEL */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="shield-checkmark-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>12. Travel Style & Comfort</AppText>
          </View>

          <AppText style={styles.sublabel}>Travel Group Type:</AppText>
          <View style={styles.travelTypeRow}>
            {TRAVEL_TYPES.map((type) => {
              const active = travelType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeCard, active && styles.typeCardActive]}
                  onPress={() => setTravelType(type.id)}
                >
                  <AppIcon name={type.icon} size={22} color={active ? colors.white : colors.forest} />
                  <AppText style={[styles.typeTitle, active && styles.typeTitleActive]}>{type.label}</AppText>
                  <AppText style={[styles.typeDesc, active && styles.typeDescActive]}>{type.desc}</AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          <AppText style={[styles.sublabel, { marginTop: 10 }]}>Overall Comfort Level:</AppText>
          <View style={styles.comfortRow}>
            {COMFORT_LEVELS.map((lvl) => {
              const active = comfortLevel === lvl.id;
              return (
                <TouchableOpacity
                  key={lvl.id}
                  style={[styles.comfortCard, active && styles.comfortCardActive]}
                  onPress={() => setComfortLevel(lvl.id)}
                >
                  <View style={[styles.comfortBadge, active && styles.comfortBadgeActive]}>
                    <AppText style={[styles.comfortBadgeText, active && styles.comfortBadgeTextActive]}>{lvl.badge}</AppText>
                  </View>
                  <AppText style={[styles.comfortTitle, active && styles.comfortTitleActive]}>{lvl.label}</AppText>
                  <AppText style={[styles.comfortDesc, active && styles.comfortDescActive]}>{lvl.desc}</AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 13. PRIORITY-BASED BUDGET ALLOCATION SUMMARY */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <AppIcon name="pie-chart-outline" size={20} color={colors.forest} />
            <AppText variant="heading" style={styles.cardTitle}>13. Priority-Based Budget Allocation Summary</AppText>
          </View>
          <AppText variant="caption" color={colors.muted}>
            Sequential service hierarchy based on supervisor requirements (1. Transport {'->'} 2. Food {'->'} 3. Hotel {'->'} 4. Activities):
          </AppText>

          {/* Multi-slice Progress Bar reflecting actual allocated shares */}
          <View style={styles.allocationBarContainer}>
            <View style={[styles.allocationSegment, { flex: Math.max(1, Math.round((priorityResult.breakdown.transport.allocatedCost / Math.max(1, numBudget)) * 100)), backgroundColor: '#2563eb' }]} />
            <View style={[styles.allocationSegment, { flex: Math.max(1, Math.round((priorityResult.breakdown.food.allocatedCost / Math.max(1, numBudget)) * 100)), backgroundColor: '#d97706' }]} />
            <View style={[styles.allocationSegment, { flex: Math.max(1, Math.round((priorityResult.breakdown.hotel.allocatedCost / Math.max(1, numBudget)) * 100)), backgroundColor: '#059669' }]} />
            <View style={[styles.allocationSegment, { flex: Math.max(1, Math.round((priorityResult.breakdown.activities.allocatedCost / Math.max(1, numBudget)) * 100)), backgroundColor: '#7c3aed' }]} />
            <View style={[styles.allocationSegment, { flex: Math.max(1, Math.round((remainingBudget / Math.max(1, numBudget)) * 100)), backgroundColor: '#0284c7' }]} />
          </View>

          {/* Priority Allocation Cards Grid */}
          <View style={styles.allocationGrid}>
            <View style={styles.allocCard}>
              <View style={[styles.allocDot, { backgroundColor: '#2563eb' }]} />
              <View style={{ flex: 1 }}>
                <AppText style={styles.allocCardTitle}>Priority 1: Transport</AppText>
                <AppText style={styles.allocCardValue}>PKR {priorityResult.breakdown.transport.allocatedCost.toLocaleString()}</AppText>
                <AppText style={styles.allocCardNote}>{priorityResult.breakdown.transport.details || 'Chauffeur / Rental / Personal'}</AppText>
              </View>
            </View>

            <View style={styles.allocCard}>
              <View style={[styles.allocDot, { backgroundColor: '#059669' }]} />
              <View style={{ flex: 1 }}>
                <AppText style={styles.allocCardTitle}>Priority 2: Hotel & Stay</AppText>
                <AppText style={styles.allocCardValue}>PKR {priorityResult.breakdown.hotel.allocatedCost.toLocaleString()}</AppText>
                <AppText style={styles.allocCardNote}>{priorityResult.breakdown.hotel.details || 'Verified hotel accommodation'}</AppText>
              </View>
            </View>

            <View style={styles.allocCard}>
              <View style={[styles.allocDot, { backgroundColor: '#d97706' }]} />
              <View style={{ flex: 1 }}>
                <AppText style={styles.allocCardTitle}>Priority 3: Food & Meals</AppText>
                <AppText style={styles.allocCardValue}>PKR {priorityResult.breakdown.food.allocatedCost.toLocaleString()}</AppText>
                <AppText style={styles.allocCardNote}>{priorityResult.breakdown.food.details || 'Breakfast, lunch and dinner'}</AppText>
              </View>
            </View>

            <View style={styles.allocCard}>
              <View style={[styles.allocDot, { backgroundColor: '#7c3aed' }]} />
              <View style={{ flex: 1 }}>
                <AppText style={styles.allocCardTitle}>Priority 4: Sights & Activities</AppText>
                <AppText style={styles.allocCardValue}>PKR {priorityResult.breakdown.activities.allocatedCost.toLocaleString()}</AppText>
                <AppText style={styles.allocCardNote}>{priorityResult.breakdown.activities.details || 'Standard sights coordination'}</AppText>
              </View>
            </View>

            {isCompany && companyProfit > 0 ? (
              <View style={[styles.allocCard, { width: '100%', borderColor: '#0d9488', borderWidth: 1.5 }]}>
                <View style={[styles.allocDot, { backgroundColor: '#0d9488' }]} />
                <View style={{ flex: 1 }}>
                  <AppText style={styles.allocCardTitle}>Company Management Fee (10%)</AppText>
                  <AppText style={styles.allocCardValue}>PKR {companyProfit.toLocaleString()}</AppText>
                  <AppText style={styles.allocCardNote}>10% commercial package management fee</AppText>
                </View>
              </View>
            ) : null}

            <View style={[styles.allocCard, { width: '100%' }]}>
              <View style={[styles.allocDot, { backgroundColor: '#0284c7' }]} />
              <View style={{ flex: 1 }}>
                <AppText style={styles.allocCardTitle}>Remaining Savings Balance</AppText>
                <AppText style={styles.allocCardValue}>PKR {remainingBudget.toLocaleString()}</AppText>
                <AppText style={styles.allocCardNote}>Guaranteed non-negative unallocated budget balance</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <View style={styles.submitSection}>
          {validationMessage ? (
            <View style={styles.errorNoticeCard}>
              <AppIcon name="alert-circle" size={20} color="#b91c1c" />
              <AppText style={styles.errorNoticeText}>{validationMessage}</AppText>
            </View>
          ) : null}

          <PrimaryButton
            title={generating ? 'SYNTHESIZING ITINERARY...' : 'GENERATE COMPLETE ITINERARY'}
            onPress={handleGenerateItinerary}
            loading={generating}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>

      {/* FLOATING CHATBOT BUTTON ON SIDE OF SCREEN */}
      <FloatingChatButton navigation={navigation} />

      {/* INTERACTIVE CALENDAR MODAL */}
      <CalendarPickerModal
        visible={calendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
        onSelectDate={handleCalendarSelect}
        selectedDate={calendarPickerMode === 'start' ? startDate : endDate}
        minDate={calendarPickerMode === 'start' ? getTodayStr() : (startDate || getTodayStr())}
        startDate={startDate}
        mode={calendarPickerMode}
        title={calendarPickerMode === 'start' ? 'Select Journey Start Date' : 'Select Journey End Date'}
      />

      {/* INTERACTIVE BUDGET SHORTFALL PROPOSAL MODAL */}
      <Modal
        visible={shortfallModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setShortfallModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <AppIcon name="alert-circle" size={24} color="#d97706" />
              </View>
              <AppText style={styles.modalTitle}>Budget Adjustment Proposal</AppText>
            </View>

            <AppText style={styles.modalMessage}>
              {activeShortfallProposal?.message}
            </AppText>

            <View style={styles.modalOptionsList}>
              {activeShortfallProposal?.options?.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.modalOptionBtn}
                  onPress={() => handleApplyShortfallOption(opt)}
                >
                  <AppIcon name="checkmark-circle-outline" size={18} color={colors.white} />
                  <AppText style={styles.modalOptionBtnText}>{opt.label}</AppText>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShortfallModalVisible(false)}
              >
                <AppText style={styles.modalCancelBtnText}>Review & Adjust My Inputs Myself</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream, position: 'relative' },
  content: { padding: spacing.md, gap: 14, paddingBottom: 85 },
  errorNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#f87171',
    borderRadius: radius.md,
    padding: 12,
    gap: 10,
    marginBottom: 8,
  },
  errorNoticeText: {
    flex: 1,
    color: '#991b1b',
    fontSize: 13,
    fontFamily: fonts.semiBold,
    lineHeight: 18,
  },
  gpsLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.mint,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.green,
  },
  gpsLocationBtnText: {
    color: colors.forest,
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
  driverToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  driverToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  driverToggleBtnActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  driverToggleText: {
    fontSize: 12.5,
    fontFamily: fonts.medium,
    color: colors.ink,
  },
  driverToggleTextActive: {
    color: colors.white,
    fontFamily: fonts.bold,
  },
  foodPolicyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deductionDetailText: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    maxWidth: 520,
    width: '100%',
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  modalOptionsList: {
    gap: 10,
    marginTop: 6,
  },
  modalOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.forest,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  modalOptionBtnText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  card: {
    ...shadowSoft,
    backgroundColor: colors.paper,
    borderRadius: radius.xl,
    padding: 16,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.displayBold,
    color: colors.ink,
  },
  sublabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.muted,
    marginBottom: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: '#edf6f1',
    borderWidth: 1,
    borderColor: '#c6e8d5',
  },
  catChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  catChipText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  catChipTextActive: {
    color: colors.white,
  },
  categoryInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#edf6f1',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#c6e8d5',
  },
  categoryInfoText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.ink,
  },
  cityPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cityChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cityChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  cityChipText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.ink,
  },
  cityChipTextActive: {
    color: colors.white,
    fontFamily: fonts.bold,
  },
  strengthRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  strengthCol: {
    flex: 1,
  },
  dropdownLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  withinBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  withinBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#15803d',
  },
  vehicleDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: colors.forest,
    borderRadius: radius.md,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  vehicleDropdownHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: '#e2ece6',
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownVehicleName: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  dropdownVehicleMeta: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.muted,
    marginTop: 2,
  },
  dropdownArrowWrap: {
    padding: 4,
  },
  vehicleDropdownList: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: colors.forest,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f3',
  },
  dropdownItemSelected: {
    backgroundColor: '#eef8f2',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  dropdownItemTitleSelected: {
    color: colors.forest,
  },
  dropdownItemSubtitle: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.muted,
    marginTop: 2,
  },
  selectPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: '#f1f5f3',
  },
  selectPillText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  selectedVehicleSummaryCard: {
    backgroundColor: '#f8faf9',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#d2e3d9',
    padding: 12,
    marginTop: 10,
    gap: 4,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  summaryDetails: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.ink,
  },
  summaryPricing: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  summaryTripCost: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.ink,
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e2ece6',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: '#f1f7f4',
    borderWidth: 1.2,
    borderColor: '#cce5d7',
  },
  genderChipSelected: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  genderChipText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  genderChipTextSelected: {
    color: '#ffffff',
  },
  genderSplitBox: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    backgroundColor: '#f8faf9',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#e2ede7',
  },
  genderSplitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  genderSplitLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.forest,
    lineHeight: 18,
  },
  counterValue: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.ink,
    minWidth: 16,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  inputWrapError: {
    borderColor: '#b43b36',
    borderWidth: 1.5,
    backgroundColor: '#fff5f5',
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  openCalendarLink: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.green,
    textDecorationLine: 'underline',
  },
  calendarTriggerBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eaf4ee',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#cde4d6',
  },
  calendarBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  quickDateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#edf6f1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#c6e8d5',
  },
  quickDateText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  dateErrorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 10,
  },
  dateErrorTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: '#b43b36',
  },
  dateErrorText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: '#b43b36',
    marginTop: 2,
    lineHeight: 16,
  },
  schedulePreviewBoxError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  routeRoutePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  routeRoutePreviewText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.ink,
  },
  datePresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  datePresetChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  datePresetText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  datePresetTextActive: {
    color: colors.white,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stepperLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cream,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowSoft,
  },
  stepperValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dayChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  dayChipText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  dayChipTextActive: {
    color: colors.white,
  },
  schedulePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ecfdf5',
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  schedulePreviewTitle: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.forest,
    textTransform: 'uppercase',
  },
  schedulePreviewDates: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
    marginTop: 2,
  },
  hotelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: colors.cream,
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.line,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  toggleBtnActive: {
    backgroundColor: colors.forest,
  },
  toggleText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.muted,
  },
  toggleTextActive: {
    color: colors.white,
  },
  hotelScroll: {
    marginHorizontal: -4,
  },
  hotelCard: {
    width: 200,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.line,
    ...shadowSoft,
  },
  hotelCardSelected: {
    borderColor: colors.forest,
    backgroundColor: '#f3fbf6',
  },
  hotelImage: {
    width: '100%',
    height: 100,
  },
  hotelDetails: {
    padding: 10,
    gap: 3,
  },
  hotelTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelName: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.ink,
    flex: 1,
    marginRight: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingNum: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: '#b45309',
  },
  hotelCity: {
    fontSize: 11,
    color: colors.muted,
  },
  hotelPrice: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.forest,
    marginTop: 2,
  },
  nightText: {
    fontSize: 10,
    color: colors.muted,
    fontFamily: fonts.regular,
  },
  selectedHotelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.forest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  selectedHotelText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.white,
  },
  roomSelectContainer: {
    marginTop: 6,
    gap: 6,
  },
  roomsRow: {
    gap: 6,
  },
  roomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cream,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  roomChipSelected: {
    backgroundColor: '#edf6f1',
    borderColor: colors.forest,
  },
  roomChipDisabled: {
    opacity: 0.5,
  },
  roomName: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  roomNameSelected: {
    color: colors.forest,
  },
  roomPrice: {
    fontSize: 11,
    color: colors.muted,
  },
  availBadge: {
    backgroundColor: colors.mint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  availBadgeRed: {
    backgroundColor: '#fee2e2',
  },
  availText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  budgetCalcBox: {
    backgroundColor: '#edf6f1',
    borderRadius: radius.lg,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#c6e8d5',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.ink,
  },
  calcValue: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  noHotelNotice: {
    padding: 10,
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    marginTop: 6,
  },
  noHotelNoticeText: {
    fontSize: 12,
    color: colors.muted,
    fontFamily: fonts.medium,
  },
  alertBoxWarning: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderRadius: radius.lg,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  alertTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: '#b45309',
  },
  alertMessage: {
    fontSize: 11,
    color: colors.ink,
    marginTop: 2,
  },
  alertSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
    fontFamily: fonts.medium,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  loadingText: {
    fontSize: 12,
    color: colors.muted,
  },
  noHotelsBox: {
    padding: 12,
    backgroundColor: colors.cream,
    borderRadius: radius.md,
  },
  noHotelsText: {
    fontSize: 12,
    color: colors.muted,
  },
  travelTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeCard: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  typeCardActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  typeTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
    textAlign: 'center',
  },
  typeTitleActive: {
    color: colors.white,
  },
  typeDesc: {
    fontSize: 9,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 12,
  },
  typeDescActive: {
    color: colors.mint,
  },
  transportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  transportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  transportChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  transportText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  transportTextActive: {
    color: colors.white,
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  interestChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  interestText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  interestTextActive: {
    color: colors.white,
  },
  budgetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  budgetChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  budgetChipText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  budgetChipTextActive: {
    color: colors.white,
  },
  pkrPrefix: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  perPersonSuffix: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  totalTourBudgetBanner: {
    backgroundColor: '#ecfdf5',
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    marginTop: 8,
    gap: 3,
  },
  totalTourBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalTourBannerTitle: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.forest,
    textTransform: 'uppercase',
  },
  totalTourFormula: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.muted,
    marginTop: 2,
  },
  totalTourPrice: {
    fontSize: 18,
    fontFamily: fonts.displayBold,
    color: colors.forest,
  },
  allocationBarContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.cream,
    marginTop: 4,
  },
  allocationSegment: {
    height: '100%',
  },
  allocationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  allocCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    padding: 9,
    borderWidth: 1,
    borderColor: colors.line,
  },
  allocDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  allocCardTitle: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  allocCardValue: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.forest,
    marginTop: 1,
  },
  allocCardNote: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 1,
  },
  vehCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  vehCardSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: colors.forest,
  },
  vehIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowSoft,
  },
  vehHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  vehName: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.ink,
    flex: 1,
  },
  vehNameSelected: {
    color: colors.forest,
  },
  vehCapacityBadge: {
    backgroundColor: colors.paper,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  vehCapacityBadgeSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  vehCapacityText: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  vehCapacityTextSelected: {
    color: colors.forest,
    fontFamily: fonts.bold,
  },
  vehPricing: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  budgetStatusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  budgetStatusFit: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  budgetStatusExceed: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  budgetStatusText: {
    fontSize: 9,
    fontFamily: fonts.semiBold,
  },
  budgetStatusFitText: {
    color: '#15803d',
  },
  budgetStatusExceedText: {
    color: '#b45309',
  },
  driverToggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 4,
    gap: 8,
  },
  driverToggleTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  driverToggleDesc: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 1,
  },
  transportFormulaBox: {
    backgroundColor: '#edf6f1',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#c6e8d5',
    gap: 3,
  },
  transportFormulaLabel: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.forest,
    textTransform: 'uppercase',
  },
  transportFormulaText: {
    fontSize: 11,
    color: colors.ink,
    lineHeight: 16,
  },
  foodPolicyGrid: {
    gap: 8,
  },
  foodPolicyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  foodPolicyIcon: {
    fontSize: 20,
  },
  foodPolicyTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  foodPolicyDesc: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 1,
  },
  foodTagGreen: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  foodTagGreenText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#15803d',
  },
  foodTagYellow: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  foodTagYellowText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#b45309',
  },
  smartExpenseBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1.5,
  },
  smartExpenseBudget: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  smartExpenseLuxury: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
  },
  smartExpenseStandard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  smartExpenseTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  smartExpenseNote: {
    fontSize: 11,
    color: colors.ink,
    marginTop: 2,
    lineHeight: 15,
  },
  comfortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  comfortCard: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  comfortCardActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  comfortBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.paper,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  comfortBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  comfortBadgeText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  comfortBadgeTextActive: {
    color: colors.white,
  },
  comfortTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  comfortTitleActive: {
    color: colors.white,
  },
  comfortDesc: {
    fontSize: 9,
    color: colors.muted,
    lineHeight: 12,
  },
  comfortDescActive: {
    color: colors.mint,
  },
  submitSection: {
    marginTop: 8,
  },
  submitBtn: {
    paddingVertical: 14,
  },

  // Mode selection
  modeToggleRow: {
    gap: 10,
    marginTop: 4,
  },
  modeCard: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: 14,
    gap: 8,
  },
  modeCardActive: {
    borderColor: colors.forest,
    backgroundColor: '#f0fdf4',
  },
  modeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  modeTitleActive: {
    color: colors.forest,
  },
  modeDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
    lineHeight: 18,
  },
  modeDescActive: {
    color: '#334155',
  },
  modeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: '#f1f5f9',
  },
  modeBadgeActive: {
    backgroundColor: colors.forest,
  },
  modeBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.muted,
  },
  modeBadgeTextActive: {
    color: '#ffffff',
  },

  // Transport toggle
  transportToggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  transportToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: '#f1f5f9',
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  transportToggleBtnActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  transportToggleBtnText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.ink,
  },
  transportToggleBtnTextActive: {
    color: '#ffffff',
  },
  companyServiceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: radius.md,
    padding: 10,
    gap: 8,
    marginTop: 4,
  },
  companyServiceBannerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#0369a1',
    lineHeight: 16,
  },
  ownCarInfoBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: radius.lg,
    padding: 14,
    gap: 10,
  },
  ownCarBadgeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  ownCarTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#15803d',
  },
  ownCarDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#166534',
    marginTop: 2,
    lineHeight: 18,
  },

  // Low Budget Policy Banners
  lowBudgetInfoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    borderWidth: 1.5,
    borderColor: '#bae6fd',
    borderRadius: radius.md,
    padding: 12,
    gap: 10,
    marginBottom: 8,
  },
  lowBudgetInfoTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#0369a1',
  },
  lowBudgetInfoText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#0c4a6e',
    marginTop: 2,
    lineHeight: 17,
  },
  lowBudgetFoodBanner: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1.5,
    borderColor: '#bae6fd',
    borderRadius: radius.md,
    padding: 12,
    marginTop: 4,
  },
  lowBudgetFoodTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#0369a1',
  },
  lowBudgetFoodDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#0c4a6e',
    lineHeight: 17,
  },

  // Routes
  routeChoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: radius.md,
    padding: 12,
    gap: 10,
  },
  routeChoiceCardSelected: {
    borderColor: colors.forest,
    backgroundColor: '#f0fdf4',
  },
  routeChoiceTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.ink,
  },
  routeChoiceTitleSelected: {
    color: colors.forest,
    fontFamily: fonts.bold,
  },
  routePreviewBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: radius.md,
    padding: 10,
    gap: 4,
    marginTop: 6,
  },
  routePreviewLabel: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.muted,
  },
  routePreviewText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.ink,
  },

  // Food policy
  foodToggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  foodToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    backgroundColor: '#f1f5f9',
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  foodToggleBtnActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  foodToggleBtnText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.ink,
  },
  foodToggleBtnTextActive: {
    color: '#ffffff',
  },
  selfFoodInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: radius.md,
    padding: 12,
    gap: 10,
    marginTop: 8,
  },
  selfFoodTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: '#15803d',
  },
  selfFoodDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#166534',
    marginTop: 2,
    lineHeight: 18,
  },

  // Activities checkboxes
  activityCheckItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: radius.md,
    padding: 12,
    gap: 10,
  },
  activityCheckItemActive: {
    borderColor: colors.forest,
    backgroundColor: '#f0fdf4',
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxSquareChecked: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  activityCheckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  activityCheckTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.ink,
    flex: 1,
  },
  activityCheckTitleActive: {
    color: colors.forest,
    fontFamily: fonts.bold,
  },
  activityPriceBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  activityPriceBadgeActive: {
    backgroundColor: '#dcfce7',
  },
  activityPriceBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.muted,
  },
  activityPriceBadgeTextActive: {
    color: '#15803d',
  },
  activityCheckDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  activityTotalText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.forest,
    marginTop: 4,
  },
  activityPolicyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: radius.md,
    padding: 10,
    gap: 8,
    marginTop: 4,
  },
  activityPolicyNoticeText: {
    flex: 1,
    fontSize: 11,
    fontFamily: fonts.medium,
    color: '#166534',
    lineHeight: 16,
  },

  // Deduction Summary Card
  deductionAuditCard: {
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 8,
  },
  deductionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deductionLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  deductionVal: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.ink,
  },
  deductionDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  deductionTotalLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  deductionTotalVal: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  deductionRemainLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  deductionRemainVal: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },

  /* SERVICE CUSTOM CHECKLIST */
  serviceCustomBox: {
    backgroundColor: '#f8fafc',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    padding: 12,
    marginTop: 10,
    gap: 8,
  },
  serviceCustomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceCustomTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  serviceCustomDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
    lineHeight: 15,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  serviceCheckChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  serviceCheckChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  serviceCheckText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.ink,
  },
  serviceCheckTextActive: {
    color: '#ffffff',
  },
  companyInclusionsBox: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    borderRadius: radius.lg,
    padding: 12,
    marginTop: 10,
    gap: 6,
  },
  companyInclusionsTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#065f46',
  },
  companyInclusionsText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#047857',
    lineHeight: 16,
  },

  /* ROOMS QUANTITY STEPPER */
  roomsQuantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 4,
  },
  roomsQuantityTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  roomsQuantityDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 2,
  },
  roomsStepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roomsStepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  roomsStepperBtnText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.forest,
    lineHeight: 18,
  },
  roomsStepperValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.ink,
    minWidth: 18,
    textAlign: 'center',
  },

  /* FOOD MEALS SELECT CARDS */
  mealSelectCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: radius.md,
    padding: 12,
    gap: 6,
  },
  mealSelectCardActive: {
    borderColor: colors.forest,
    backgroundColor: '#f0fdf4',
  },
  mealCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  mealName: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  mealPriceBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  mealPriceBadgeActive: {
    backgroundColor: '#dcfce7',
  },
  mealPriceBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.muted,
  },
  mealPriceBadgeTextActive: {
    color: colors.forest,
  },
  mealMenuText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#64748b',
    lineHeight: 15,
    paddingLeft: 28,
  },
  cardHeaderRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  yesNoToggle: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: radius.pill,
    padding: 2,
    alignItems: 'center',
  },
  yesNoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  yesNoBtnActive: {
    backgroundColor: colors.forest,
  },
  yesNoBtnInactive: {
    backgroundColor: '#dc2626',
  },
  yesNoBtnText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: '#64748b',
  },
  yesNoBtnTextActive: {
    color: '#ffffff',
  },
  yesNoBtnTextInactive: {
    color: '#ffffff',
  },
  foodSelfNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 8,
  },
  foodSelfNoticeText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#166534',
    flex: 1,
  },
  mealCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealCardTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.ink,
    flex: 1,
  },
  mealCardRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 28,
    marginTop: 2,
  },
  mealRateText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  mealTotalTextActive: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.forest,
  },
  mealTotalTextMuted: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: '#94a3b8',
  },
  foodTotalFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 6,
  },
  foodTotalFooterText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  foodTotalFooterBold: {
    fontFamily: fonts.bold,
    color: colors.forest,
  },

  /* BUDGET EXCEEDED & OPTIMIZATION */
  autoFitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea580c',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    ...shadowSoft,
  },
  autoFitBtnText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#ffffff',
  },
  optimizationCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    borderRadius: radius.lg,
    padding: 14,
    gap: 8,
  },
  optimizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optimizationTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#92400e',
  },
  optimizationDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#78350f',
    lineHeight: 16,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fef08a',
    borderRadius: radius.md,
    padding: 10,
    gap: 10,
  },
  sugTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  sugDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 2,
  },
  sugSavings: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: '#15803d',
    marginTop: 3,
  },
  applyBtn: {
    backgroundColor: colors.forest,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  applyBtnText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: '#ffffff',
  },
});
