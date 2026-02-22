

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import ProfileMenu from '@/components/ProfileMenu';
import { useNavigation, useLocalSearchParams } from 'expo-router'; 

import EssentialsScreen from './essentials'; 

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const BRAND_COLOR = "#8B5CF6"; 
const LIGHT_PURPLE = "#F3E5F5";

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

const Tab = createBottomTabNavigator();

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={BRAND_COLOR} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function MapScreen() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [userCoords, setUserCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<{[key: string]: any}>({});
  const navigation = useNavigation();

  const params = useLocalSearchParams();
  const scrollToStore = params.scrollToStore as string;

  // 🚀 FIXED: mapFilters is now defined inside the component
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

  const performScroll = (storeName: string) => {
    if (clinics.length === 0) return;

    const target = clinics.find(c => 
      c.name.toLowerCase().trim() === storeName.toLowerCase().trim() || 
      c.name.toLowerCase().includes(storeName.toLowerCase())
    );
    
    if (target && mapRef.current) {
      setFilter('All'); 
      mapRef.current.animateToRegion({
        latitude: Number(target.lat),
        longitude: Number(target.lng),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);

      setTimeout(() => {
        if (markerRefs.current[target.name]) {
          markerRefs.current[target.name].showCallout();
        }
      }, 1000);
    }
  };

  useEffect(() => {
    if (scrollToStore) performScroll(scrollToStore);
  }, [scrollToStore, clinics]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (scrollToStore) performScroll(scrollToStore);
    });
    return unsubscribe;
  }, [navigation, scrollToStore, clinics]);

  const displayedClinics = clinics.filter(c => {
    if (filter === 'All') return true;
    switch (filter) {
      case 'Medical': return c.type === 'medical';
      case 'Restroom': return c.family_restroom === true;
      case 'Shop': return c.type === 'shop' || (c.type === 'community' && c.description?.toLowerCase().includes('supply'));
      case 'Medicaid': return c.type === 'medical' && c.medicaid === true;
      default: return true;
    }
  });

  if (loading) return <EmptyState message="Locating resources..." />;

  return (
    <View style={styles.container}>
      <View style={styles.pillContainer}>
        <TouchableOpacity style={styles.menuButtonInner} onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={26} color="white" />
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          {mapFilters.map((f) => (
            <TouchableOpacity 
              key={f.id} 
              style={[styles.filterPill, filter === f.id && styles.activePill]}
              onPress={() => setFilter(prev => prev === f.id ? 'All' : f.id)}
            >
              <Ionicons name={f.icon as any} size={14} color={filter === f.id ? 'white' : BRAND_COLOR} style={{ marginRight: 5 }} />
              <Text style={[styles.pillText, filter === f.id && styles.activePillText]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
            key={`${filter}-${c._id || index}`} 
            coordinate={{ latitude: Number(c.lat), longitude: Number(c.lng) }}
            ref={(el) => { if(el) markerRefs.current[c.name] = el; }} 
            identifier={c.name}
          >
            <View style={[
              styles.customMarker, 
              filter === 'Restroom' && { backgroundColor: '#3498db' },
              filter === 'Medicaid' && c.type === 'medical' && { backgroundColor: '#2ecc71' },
              filter === 'Shop' && { backgroundColor: '#e67e22' }
            ]}>
              <Ionicons 
                name={filter === 'Restroom' ? "woman" : filter === 'Shop' ? "cart" : c.type === 'medical' ? "medical" : "heart"} 
                size={16} 
                color="white" 
              />
            </View>
            <Callout tooltip={false}>
              <View style={styles.calloutBox}>
                <Text style={styles.calloutTitle}>{c.name}</Text>
                <Text style={styles.calloutDesc}>{c.description || "Gainesville Community Resource"}</Text>
                <View style={styles.amenityRow}>
                  {c.type === 'medical' && c.medicaid && <Text style={[styles.tag, styles.medicaidTag]}>🛡️ Medicaid</Text>}
                  {c.family_restroom && <Text style={styles.tag}>🚻 Restroom</Text>}
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <ProfileMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

// 🚀 FIXED: App Component structure
export default function App() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarActiveTintColor: BRAND_COLOR,
      headerStyle: { backgroundColor: BRAND_COLOR },
      headerTintColor: '#fff',
      tabBarIcon: ({ color, size }) => {
        let icon: any = route.name === 'Map' ? 'map' : 'cart';
        return <Ionicons name={icon} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Products" component={EssentialsScreen} options={{ title: 'Essentials' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  menuButtonInner: {
    backgroundColor: BRAND_COLOR, width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
    marginRight: 10,
  },
  pillContainer: { position: 'absolute', top: 15, left: 15, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center' },
  filterPill: {
    flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, marginRight: 8, alignItems: 'center', elevation: 5,
  },
  activePill: { backgroundColor: BRAND_COLOR },
  pillText: { fontWeight: '700', fontSize: 13, color: '#555' },
  activePillText: { color: 'white' },
  customMarker: { backgroundColor: BRAND_COLOR, padding: 6, borderRadius: 20, borderWidth: 2, borderColor: 'white', elevation: 5 },
  calloutBox: { width: 180, padding: 5 },
  calloutTitle: { fontWeight: 'bold', fontSize: 14 },
  calloutDesc: { fontSize: 11, color: 'gray', marginVertical: 4 },
  amenityRow: { flexDirection: 'row', marginTop: 5, flexWrap: 'wrap' },
  tag: { fontSize: 10, backgroundColor: '#f0f0f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, marginRight: 5, marginTop: 2, color: '#444' },
  medicaidTag: { backgroundColor: LIGHT_PURPLE, color: BRAND_COLOR, fontWeight: 'bold' },
  emptyText: { marginTop: 15, fontSize: 16, color: 'gray', textAlign: 'center' },
});