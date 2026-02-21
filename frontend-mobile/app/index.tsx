import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { registerRootComponent } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';

// ---------------- Constants & Theming ----------------
// ---------------- Constants & Theming ----------------
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL;

const BRAND_COLOR = "#7B1FA2"; // Deep, trustworthy purple
const LIGHT_PURPLE = "#F3E5F5"; // Soft lavender background

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

interface Product {
  _id: string; 
  name: string;
  price: number;
  store: string;
  brand: string;
}

const Tab = createBottomTabNavigator();

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
function MapScreen() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); 
  const [userCoords, setUserCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setLocationDenied(true);
      return;
    }

    const current = await Location.getCurrentPositionAsync({});
    setUserCoords(current.coords);
  })();
}, []);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/clinics`)
      .then(res => {
        console.log("CLINICS RECEIVED:", res.data);
        setClinics(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("CLINICS ERROR:", error);
        setLoading(false);
      });
  }, []);

  const displayedClinics = clinics.filter(c => {
    if (filter === 'All') return true;
    if (filter === 'Medicaid') return c.medicaid === true;
    return c.type.toLowerCase() === filter.toLowerCase();
  });

  if (loading) return <EmptyState message="Finding the best care in Gainesville..." />;

  if (locationDenied) {
    return <EmptyState message="Location permission is off. Turn it on to see resources near you." />;
  }

  return (
    <View style={styles.container}>
      {/* 🚀 Floating Pill Container */}
      <View style={styles.pillContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 15 }}
        >
          {['Medical', 'Community', 'Medicaid'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterPill, filter === cat && styles.activePill]}
              // Toggle logic: click again to deselect
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
          latitude: userCoords?.latitude ?? 29.6516,
          longitude: userCoords?.longitude ?? -82.3248,
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
    </View>
  );
}

// ---------------- Products Screen ----------------
function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [maxPrice, setMaxPrice] = useState(25);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/products`)
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => p.price <= maxPrice);

  if (loading) return <EmptyState message="Looking for the best deals in GNV..." />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.priceFilterContainer}>
        <Text style={styles.header}>Necessities Under ${maxPrice}</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={40}
          step={5}
          value={maxPrice}
          onValueChange={setMaxPrice}
          minimumTrackTintColor={BRAND_COLOR}
          thumbTintColor={BRAND_COLOR}
        />
      </View>
      {filtered.map((p, index) => (
        <View key={`product-${p._id || index}`} style={styles.item}>
          <View style={styles.productHeader}>
            <Text style={styles.title}>{p.name}</Text>
            <Text style={styles.price}>{p.price === 0 ? "FREE" : `$${p.price.toFixed(2)}`}</Text>
          </View>
          <Text style={styles.storeSubtext}>🛒 {p.store} ({p.brand})</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ---------------- Chat Screen ----------------
function ChatScreen() {
  return (
    <View style={styles.center}>
      <Ionicons name="chatbubbles-outline" size={80} color={BRAND_COLOR} />
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333' }}>GatorFamily AI</Text>
      <Text style={styles.chatSub}>Powered by Gemini. Ask about clinic eligibility or local baby supplies.</Text>
    </View>
  );
}

// ---------------- Main Entry ----------------
export default function Index() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarActiveTintColor: BRAND_COLOR,
      tabBarInactiveTintColor: 'gray',
      headerStyle: { 
        backgroundColor: BRAND_COLOR, 
        height: 80, 
      },
      headerTitleStyle: {
        fontSize: 16, 
      },
      headerTintColor: '#fff',
      tabBarIcon: ({ color, size }) => {
        let icon: any = route.name === 'Map' ? 'map' : route.name === 'Products' ? 'cart' : 'chatbubbles';
        return <Ionicons name={icon} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'GNV Resource Map' }} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{ title: 'Essentials' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: 'AI Support' }} />
    </Tab.Navigator>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { marginTop: 15, fontSize: 16, color: 'gray', textAlign: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  priceFilterContainer: { padding: 20, backgroundColor: '#fdfdfd', borderBottomWidth: 1, borderBottomColor: '#eee' },
  item: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#f9f9f9" },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: "600" },
  price: { fontSize: 17, color: BRAND_COLOR, fontWeight: 'bold' },
  storeSubtext: { fontSize: 13, color: 'gray', marginTop: 4 },
  
  // Floating Pill Styles
  pillContainer: {
    position: 'absolute',
    top: 15, 
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
    elevation: 8, // High elevation for a floating look
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
  chatSub: { 
    color: 'gray', 
    textAlign: 'center', 
    marginTop: 10, 
    lineHeight: 20 
  }
});

registerRootComponent(Index);