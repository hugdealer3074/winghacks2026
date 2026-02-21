import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import ProfileMenu from '@/components/ProfileMenu';

// ---------------- Constants & Theming ----------------
const BACKEND_URL = "http://10.136.142.2:8000";
const BRAND_COLOR = "#8B5CF6";
const LIGHT_PURPLE = "#F3E5F5";

// ---------------- Types ----------------
interface Clinic {
  _id: string;   
  name: string;
  lat: number;
  lng: number;
  type: 'medical' | 'community' | 'amenity';
  medicaid: boolean;
  sliding_scale: boolean;
  family_restroom: boolean;
  changing_table: boolean;
  description: string;
}

// 🎨 Component: Branded Loading State
function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={BRAND_COLOR} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ---------------- Map Screen ----------------
export default function MapScreen() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); 
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUserLocation(loc.coords);
      }

      try {
        const res = await axios.get(`${BACKEND_URL}/clinics`);
        setClinics(res.data);
      } catch (err) {
        console.error("Error fetching clinics:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displayedClinics = clinics.filter(c => {
    if (filter === 'All') return true;
    if (filter === 'Medicaid') return c.medicaid === true;
    return c.type.toLowerCase() === filter.toLowerCase();
  });

  if (loading) return <EmptyState message="Finding the best care in Gainesville..." />;

  return (
    <View style={styles.container}>
      {/* Menu Button */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>

      {/* 🚀 Floating Pill Container */}
      <View style={styles.pillContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 15, paddingLeft: 70 }}
        >
          {['Medical', 'Community', 'Medicaid'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterPill, filter === cat && styles.activePill]}
              onPress={() => setFilter(prev => prev === cat ? 'All' : cat)}
            >
              <Ionicons 
                name={cat === 'Medicaid' ? 'shield-checkmark' : 'options-outline'} 
                size={14} 
                color={filter === cat ? 'white' : BRAND_COLOR} 
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.pillText, filter === cat && styles.activePillText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 29.6516,
          longitude: -82.3248,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {displayedClinics.map((c, index) => (
          <Marker
            key={`marker-${c._id || index}`} 
            coordinate={{ latitude: Number(c.lat), longitude: Number(c.lng) }}
          >
             <View style={[styles.customMarker, c.medicaid && { borderColor: '#2ecc71', borderWidth: 3 }]}>
               <Ionicons 
                 name={c.type === 'medical' ? "medical" : c.type === 'amenity' ? "woman" : "heart"} 
                 size={16} 
                 color="white" 
               />
             </View>
             <Callout>
                <View style={styles.calloutBox}>
                  <Text style={styles.calloutTitle}>{c.name}</Text>
                  <Text style={styles.calloutDesc}>{c.description}</Text>
                  <View style={styles.amenityRow}>
                    {c.medicaid && <Text style={[styles.tag, styles.medicaidTag]}>🛡️ Medicaid</Text>}
                    {c.family_restroom && <Text style={styles.tag}>🚻 Restroom</Text>}
                  </View>
                </View>
             </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Profile Menu */}
      <ProfileMenu 
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { marginTop: 15, fontSize: 16, color: 'gray', textAlign: 'center' },
  
  // Floating Pill Styles
  pillContainer: {
    position: 'absolute',
    top: 55, 
    zIndex: 10,
    width: '100%',
  },
  filterPill: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  activePill: { 
    backgroundColor: BRAND_COLOR, 
    elevation: 2,
  },
  pillText: { 
    fontWeight: '700', 
    fontSize: 13, 
    color: '#555' 
  },
  activePillText: { 
    color: 'white' 
  },

  // Map Component Styling
  customMarker: { 
    backgroundColor: BRAND_COLOR, 
    padding: 6, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: 'white', 
    elevation: 5 
  },
  calloutBox: { width: 180, padding: 5 },
  calloutTitle: { fontWeight: 'bold', fontSize: 14 },
  calloutDesc: { fontSize: 11, color: 'gray', marginVertical: 4 },
  amenityRow: { flexDirection: 'row', marginTop: 5 },
  tag: { 
    fontSize: 10, 
    backgroundColor: '#f0f0f0', 
    padding: 3, 
    borderRadius: 5, 
    marginRight: 5 
  },
  medicaidTag: { 
    backgroundColor: LIGHT_PURPLE, 
    color: BRAND_COLOR 
  },
  menuButton: {
    position: 'absolute',
    top: 50,        // ← CHANGE THIS
    left: 15,
    backgroundColor: '#8B5CF6',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});