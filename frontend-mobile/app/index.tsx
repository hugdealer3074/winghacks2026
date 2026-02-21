import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { registerRootComponent } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';

// 1. Types for high-quality data handling
interface Clinic {
  id: number;
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
  id: number;
  name: string;
  price: number;
  store: string;
  brand: string;
}

const Tab = createBottomTabNavigator();
const BACKEND_URL = "http://10.136.205.166:8000"; 
const BRAND_COLOR = "hotpink";

// 🎨 Component: Branded Loading State for UI/UX Track
function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={BRAND_COLOR} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ---------------- Map Screen (Medicaid Filter & Custom Markers) ----------------
function MapScreen() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filterMedicaid, setFilterMedicaid] = useState(false);
  const [loading, setLoading] = useState(true);
  // Add state to store user coordinates
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

  useEffect(() => {
    (async () => {
      // 1. Request foreground permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      // 2. Get initial high-accuracy position
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation(loc.coords);

      // 3. Fetch clinic data from your backend
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

  const displayedClinics = filterMedicaid ? clinics.filter(c => c.medicaid) : clinics;

  if (loading) return <EmptyState message="Finding the best care in Gainesville..." />;

  return (
    <View style={styles.container}>
      {/* Medicaid Toggle Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity 
          onPress={() => setFilterMedicaid(!filterMedicaid)}
          style={[styles.filterBtn, filterMedicaid && styles.filterBtnActive]}
        >
          <Ionicons name={filterMedicaid ? "shield-checkmark" : "shield-outline"} size={18} color={filterMedicaid ? "green" : "#555"} />
          <Text style={styles.filterText}>{filterMedicaid ? " Medicaid Verified" : " All Resources"}</Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 29.6516,
          longitude: -82.3248,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        // 🔵 Shows the user's "Blue Dot"
        showsUserLocation={true} 
        // 🎯 Focuses the map on the user (iOS/Apple Maps only)
        followsUserLocation={true} 
        // 🔘 Adds the native button to snap back to your position
        showsMyLocationButton={true} 
        // 🧭 Displays the orientation compass
        showsCompass={true} 
        // ⏳ Displays a loading spinner while map tiles download
        loadingEnabled={true} 
      >
        {displayedClinics.map((c, index) => (
        <Marker
          key={`clinic-${c.id || index}`} // 👈 Use the MongoDB _id or the loop index
          coordinate={{ latitude: Number(c.lat), longitude: Number(c.lng) }}
        >
            <View style={[styles.customMarker, c.medicaid && { borderColor: 'green' }]}>
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
                   {c.family_restroom && <Text style={styles.tag}>🚻 Restroom</Text>}
                   {c.changing_table && <Text style={styles.tag}>🤱 Changing</Text>}
                 </View>
               </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

// ---------------- Products Screen (Price Slider Filter) ----------------
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
      {filtered.map((p) => (
        <View key={p.id} style={styles.item}>
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

// ---------------- Chat Screen (Gemini Placeholder) ----------------
function ChatScreen() {
  return (
    <View style={styles.center}>
      <Ionicons name="chatbubbles-outline" size={80} color={BRAND_COLOR} />
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333' }}>GatorFamily AI</Text>
      <Text style={styles.chatSub}>Powered by Gemini. Ask about clinic eligibility or local baby supplies.</Text>
    </View>
  );
}

// ---------------- Navigation Entry ----------------
export default function Index() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarActiveTintColor: BRAND_COLOR,
      tabBarInactiveTintColor: 'gray',
      headerStyle: { backgroundColor: BRAND_COLOR },
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
  filterBar: { position: 'absolute', top: 20, left: 20, right: 20, zIndex: 10, alignItems: 'center' },
  filterBtn: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 30, elevation: 10, shadowOpacity: 0.3, alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#e8f5e9', borderColor: 'green', borderWidth: 1 },
  filterText: { fontWeight: '700', fontSize: 14, color: '#444' },
  customMarker: { backgroundColor: BRAND_COLOR, padding: 6, borderRadius: 20, borderWidth: 2, borderColor: 'white', elevation: 5 },
  calloutBox: { width: 180, padding: 5 },
  calloutTitle: { fontWeight: 'bold', fontSize: 14 },
  calloutDesc: { fontSize: 11, color: 'gray', marginVertical: 4 },
  amenityRow: { flexDirection: 'row', marginTop: 5 },
  tag: { fontSize: 10, backgroundColor: '#f0f0f0', padding: 3, borderRadius: 5, marginRight: 5 },
  chatSub: { color: 'gray', textAlign: 'center', marginTop: 10, lineHeight: 20 }
});

registerRootComponent(Index);