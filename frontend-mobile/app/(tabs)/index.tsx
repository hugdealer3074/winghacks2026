import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import ProfileMenu from '@/components/ProfileMenu';

// ---------------- Constants ----------------
const BACKEND_URL = "http://10.136.142.2:8000"; // Replace with your IP
const BRAND_COLOR = "#8B5CF6";
const LIGHT_PURPLE = "#F3E5F5";

// ---------------- Types ----------------
interface Clinic {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'medical' | 'community' | 'amenity' | 'shop';
  medicaid: boolean;
  family_restroom: boolean;
  description: string;
}

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
  const [userCoords, setUserCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const mapRef = useRef<MapView>(null);

  const mapFilters = [
    { id: 'Medical', icon: 'medical', label: 'Health Clinics' },
    { id: 'Restroom', icon: 'woman', label: 'Family Restrooms' },
    { id: 'Shop', icon: 'cart', label: 'Care & Supply Shops' },
    { id: 'Medicaid', icon: 'shield-checkmark', label: 'Medicaid' }
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const current = await Location.getCurrentPositionAsync({});
        setUserCoords(current.coords);
      }
      try {
        const res = await axios.get(`${BACKEND_URL}/clinics`);
        setClinics(res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displayedClinics = clinics.filter(c => {
    if (filter === 'All') return true;
    switch (filter) {
      case 'Medical':
        return c.type === 'medical';
      case 'Restroom':
        return c.family_restroom === true;
      case 'Shop':
        return c.type === 'shop' || (c.type === 'community' && c.description?.toLowerCase().includes('supply'));
      case 'Medicaid':
        return c.medicaid === true;
      default:
        return true;
    }
  });

  if (loading) return <EmptyState message="Locating resources..." />;

  return (
    <View style={styles.container}>
      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>

      {/* Filter Pills */}
      <View style={styles.pillContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15, paddingLeft: 70 }}
        >
          {mapFilters.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterPill, filter === f.id && styles.activePill]}
              onPress={() => setFilter(prev => prev === f.id ? 'All' : f.id)}
            >
              <Ionicons
                name={f.icon as any}
                size={14}
                color={filter === f.id ? 'white' : BRAND_COLOR}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.pillText, filter === f.id && styles.activePillText]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: userCoords?.latitude ?? 29.6516,
          longitude: userCoords?.longitude ?? -82.3248,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsUserLocation={true}
      >
        {displayedClinics.map((c, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: Number(c.lat), longitude: Number(c.lng) }}
            identifier={c.name}
          >
            <View style={[
              styles.customMarker,
              filter === 'Medicaid' && c.medicaid && { backgroundColor: '#2ecc71' }
            ]}>
              <Ionicons
                name={c.type === 'medical' ? "medical" : c.type === 'shop' ? "cart" : "heart"}
                size={16}
                color="white"
              />
            </View>
            <Callout>
              <View style={styles.calloutBox}>
                <Text style={styles.calloutTitle}>{c.name}</Text>
                <Text style={styles.calloutDesc}>{c.description}</Text>
                <View style={styles.amenityRow}>
                  {c.type === 'medical' && c.medicaid && (
                    <Text style={[styles.tag, styles.medicaidTag]}>🛡️ Medicaid</Text>
                  )}
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
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: 'gray',
    textAlign: 'center'
  },
  menuButton: {
    position: 'absolute',
    top: 70,
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
  pillContainer: {
    position: 'absolute',
    top: 70,
    left: 65,
    right: 0,
    zIndex: 10,
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
  customMarker: {
    backgroundColor: BRAND_COLOR,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 5
  },
  calloutBox: {
    width: 180,
    padding: 5
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14
  },
  calloutDesc: {
    fontSize: 11,
    color: 'gray',
    marginVertical: 4
  },
  amenityRow: {
    flexDirection: 'row',
    marginTop: 5
  },
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
});