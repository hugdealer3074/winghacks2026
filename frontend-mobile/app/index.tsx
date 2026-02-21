import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { registerRootComponent } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';

// ---------------- Constants ----------------
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const BRAND_COLOR = "#7B1FA2"; 
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

interface Product {
  _id: string; 
  name: string;
  price: number;
  store: string;
  brand: string;
  category: string; 
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

// ---------------- Map Screen ----------------
function MapScreen({ route }: any) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); 
  const [userCoords, setUserCoords] = useState<Location.LocationObjectCoords | null>(null);
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

  useEffect(() => {
    if (route.params?.scrollToStore && clinics.length > 0) {
      const target = clinics.find(c => 
        c.name.toLowerCase().includes(route.params.scrollToStore.toLowerCase())
      );
      
      if (target && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: Number(target.lat),
          longitude: Number(target.lng),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);

        // 🚀 FIX: Use target.name because that is our 'identifier'
        setTimeout(() => {
          // The (mapRef.current as any) bypasses the TS property error
          (mapRef.current as any)?.showCallout(target.name);
        }, 1100);
      }
    }
  }, [route.params?.scrollToStore, clinics]);

  const displayedClinics = clinics.filter(c => {
    if (filter === 'All') return true;
    switch(filter) {
      case 'Medical': return c.type === 'medical';
      case 'Restroom': return c.family_restroom === true;
      case 'Shop': return c.type === 'shop' || (c.type === 'community' && c.description?.toLowerCase().includes('supply'));
      case 'Medicaid': return c.medicaid === true;
      default: return true;
    }
  });


  if (loading) return <EmptyState message="Locating resources..." />;

  return (
    <View style={styles.container}>
      <View style={styles.pillContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
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
    key={index} 
    coordinate={{ latitude: Number(c.lat), longitude: Number(c.lng) }}
    // 🚀 Add this: It allows the marker to be opened programmatically
    identifier={c.name} 
  >            <View style={[styles.customMarker, filter === 'Medicaid' && c.medicaid && { backgroundColor: '#2ecc71' }]}>
               <Ionicons name={c.type === 'medical' ? "medical" : c.type === 'shop' ? "cart" : "heart"} size={16} color="white" />
            </View>
            <Callout>
              <View style={styles.calloutBox}>
                <Text style={styles.calloutTitle}>{c.name}</Text>
                <Text style={styles.calloutDesc}>{c.description}</Text>
                <View style={styles.amenityRow}>
                  {c.type === 'medical' && c.medicaid && <Text style={[styles.tag, styles.medicaidTag]}>🛡️ Medicaid</Text>}
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
function ProductsScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [maxPrice, setMaxPrice] = useState(40); 
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Health', 'Feeding', 'Diapering', 'Clothing', 'Gear'];

  useEffect(() => {
    axios.get(`${BACKEND_URL}/products`)
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredAndSorted = products
    .filter(p => (activeTab === 'All' || p.category === activeTab))
    .filter(p => p.price <= maxPrice)
    .sort((a, b) => a.price - b.price);

  if (loading) return <EmptyState message="Searching essentials..." />;

  return (
    <View style={styles.container}>
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
          {categories.map(cat => (
            <TouchableOpacity key={cat} onPress={() => setActiveTab(cat)} style={[styles.catTab, activeTab === cat && styles.activeCatTab]}>
              <Text style={[styles.catTabText, activeTab === cat && styles.activeCatTabText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.priceFilterContainer}>
        <View style={styles.priceHeaderRow}>
           <Text style={styles.priceHeaderText}>Budget</Text>
           <Text style={styles.priceValueText}>Under ${maxPrice}</Text>
        </View>
        <Slider style={{ width: '100%', height: 40 }} minimumValue={0} maximumValue={40} step={5} value={maxPrice} onValueChange={setMaxPrice} minimumTrackTintColor={BRAND_COLOR} thumbTintColor={BRAND_COLOR} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {filteredAndSorted.map((p, index) => (
          <View key={index} style={styles.productCard}>
            <View style={styles.cardLeft}>
              <View style={styles.iconCircle}><Ionicons name={p.category === 'Health' ? "medkit" : "nutrition"} size={20} color={BRAND_COLOR} /></View>
              <View>
                <Text style={styles.productTitle}>{p.name}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Map', { scrollToStore: p.store })} style={styles.storeBadge}>
                  <Ionicons name="location" size={12} color={BRAND_COLOR} />
                  <Text style={{ color: BRAND_COLOR, fontWeight: 'bold' }}> {p.store} →</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={[styles.productPrice, p.price === 0 && styles.freeText]}>{p.price === 0 ? "FREE" : `$${p.price.toFixed(2)}`}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ---------------- Chat Screen ----------------
function ChatScreen() {
  return (
    <View style={styles.center}>
      <Ionicons name="chatbubbles-outline" size={80} color={BRAND_COLOR} />
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>GatorFamily AI</Text>
      <Text style={styles.chatSub}>Ask about eligibility or supply locations.</Text>
    </View>
  );
}

// ---------------- Main App Component ----------------
export default function App() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarActiveTintColor: BRAND_COLOR,
      headerStyle: { backgroundColor: BRAND_COLOR },
      headerTintColor: '#fff',
      tabBarIcon: ({ color, size }) => {
        let icon: any = route.name === 'Map' ? 'map' : route.name === 'Products' ? 'cart' : 'chatbubbles';
        return <Ionicons name={icon} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  pillContainer: { position: 'absolute', top: 15, zIndex: 10, width: '100%' },
  filterPill: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, marginRight: 10, elevation: 8 },
  activePill: { backgroundColor: BRAND_COLOR },
  pillText: { fontWeight: '700', fontSize: 13, color: '#555' },
  activePillText: { color: 'white' },
  customMarker: { backgroundColor: BRAND_COLOR, padding: 6, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
  calloutBox: { width: 180, padding: 5 },
  calloutTitle: { fontWeight: 'bold' },
  calloutDesc: { fontSize: 11, color: 'gray' },
  amenityRow: { flexDirection: 'row', marginTop: 5 },
  tag: { fontSize: 10, backgroundColor: '#f0f0f0', padding: 3, borderRadius: 5, marginRight: 5 },
  medicaidTag: { backgroundColor: LIGHT_PURPLE, color: BRAND_COLOR },
  productCard: { backgroundColor: 'white', borderRadius: 15, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', elevation: 3 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: LIGHT_PURPLE, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  productTitle: { fontSize: 16, fontWeight: '700' },
  storeBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  productPrice: { fontSize: 18, fontWeight: 'bold' },
  freeText: { color: '#2ecc71' },
  categoryBar: { backgroundColor: '#fff', paddingVertical: 10 },
  catTab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#eee' },
  activeCatTab: { backgroundColor: BRAND_COLOR },
  catTabText: { color: '#666', fontWeight: '600' },
  activeCatTabText: { color: 'white' },
  priceFilterContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  priceHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceValueText: { color: BRAND_COLOR, fontWeight: 'bold' },
  scrollPadding: { padding: 15 },
  emptyText: { marginTop: 15, fontSize: 16, color: 'gray' },
  chatSub: { color: 'gray', marginTop: 10, textAlign: 'center' } // 🚀 FIXED chatSub exists now!
  ,// Add these inside the StyleSheet object:
  priceHeaderText: { 
    fontSize: 14, 
    color: '#666', 
    fontWeight: '600' 
  },
  cardRight: { 
    alignItems: 'flex-end', 
    justifyContent: 'center' 
  }
});

registerRootComponent(App);